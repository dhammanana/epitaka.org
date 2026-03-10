"""
Pali Buddhist Texts — Production-Grade RAG Indexer  (v4)
=========================================================

NEW IN v4
---------
  • Multi-key Gemini rotation with automatic quota detection
    - Add all your free-tier keys to GEMINI_API_KEYS list
    - Detects 429 / quota errors, marks key exhausted, rotates to next key
    - Tracks per-key usage; resets daily quota counters automatically
    - If ALL keys exhausted, waits with countdown until next reset window
  • Full progress persistence (crash-safe resuming)
    - Chunking progress saved to progress/chunks_cache.jsonl
    - Enrichment progress saved per chunk_id to progress/enrichment.jsonl
    - Embedding progress tracked via ChromaDB existing IDs
    - Re-running the script always resumes from exactly where it stopped
  • Rich live progress bar (no more silent 6-hour runs)
    - Shows: phase name, done/total, %, ETA, current key, rate (chunks/s)
    - Flushes immediately; visible even over SSH / tmux

PIPELINE
--------
INDEX TIME:
  1. Load sentences from SQLite
  2. Semantic chunking  (embedding similarity boundary detection)
     → saved to progress/chunks_cache.jsonl; resumable
  3. Enrichment agents  (Gemini, multi-key rotating)
     → semantic_role / key_concepts / chunk_summary per chunk
     → saved to progress/enrichment.jsonl; resumable
  4. BGE-M3 embeddings  (dense + sparse) → ChromaDB upsert; resumable

QUERY TIME:
  5. Query decomposition + expansion (3 sub-queries) + HyDE
  6. Hybrid dense+sparse search per language collection
  7. RRF fusion
  8. Cross-encoder reranking (top-20 → top-8)
  9. Exact Pali from SQLite
 10. Gemini answer with exact citations

INSTALL
-------
    pip install chromadb google-generativeai sentence-transformers \
                FlagEmbedding rank-bm25 tiktoken

SET KEYS
--------
    Edit GEMINI_API_KEYS below, or set env vars:
      export GEMINI_KEY_1="AIza..."
      export GEMINI_KEY_2="AIza..."
      ...

USAGE
-----
    python pali_rag_indexer.py build [--reset] [--no-enrich]
    python pali_rag_indexer.py query  "three marks of existence"
    python pali_rag_indexer.py answer "What did the Buddha teach about impermanence?"
    python pali_rag_indexer.py answer "Eightfold Path" --role "Doctrinal Explanation"
    python pali_rag_indexer.py keys   # show key status
"""

import sqlite3
import argparse
import os
import sys
import time
import json
import math
import datetime
import traceback
from pathlib import Path
from typing import Optional
from itertools import groupby

# =============================================================================
#  CONFIGURATION  ← edit these freely
# =============================================================================

# Path to your SQLite database
DB_PATH = "translations.db"

# ChromaDB persistence root
CHROMA_PERSIST_DIR = "./chroma_pali_db"

# Progress / cache directory — all resumable state saved here
PROGRESS_DIR = "./progress"

# One collection per language
COLLECTION_PALI       = "pali_texts_pali"
COLLECTION_ENGLISH    = "pali_texts_english"
COLLECTION_VIETNAMESE = "pali_texts_vietnamese"

# -----------------------------------------------------------------------------
# Gemini API keys  ← ADD ALL YOUR FREE-TIER KEYS HERE
# Also reads from env vars GEMINI_KEY_1 … GEMINI_KEY_N automatically
# -----------------------------------------------------------------------------
GEMINI_API_KEYS = [
 ### keys
]

GEMINI_MODEL      = "gemini-2.0-flash"
GEMINI_MAX_TOKENS = 2048

# Free-tier limits (gemini-2.0-flash as of 2025)
# Adjust if Google changes the limits
GEMINI_FREE_RPM   = 15    # requests per minute per key
GEMINI_FREE_RPD   = 1500  # requests per day per key

# How long to wait (seconds) when all keys are exhausted before retrying
QUOTA_EXHAUSTED_WAIT = 60   # check again every 60 s

# How many chunks to send per Gemini enrichment call
ENRICH_BATCH_SIZE = 10   # smaller = safer for free tier (shorter prompts)

# -----------------------------------------------------------------------------
# Chunking
# -----------------------------------------------------------------------------
MAX_TOKENS_PER_CHUNK    = 350
SENTENCES_PER_CHUNK_MAX = 8
SENTENCES_PER_CHUNK_MIN = 2
CHUNK_OVERLAP_SENTENCES = 1
SEMANTIC_SPLIT_THRESHOLD = 0.45
USE_SEMANTIC_CHUNKING   = True

# -----------------------------------------------------------------------------
# Embedding  —  BGE-M3 preferred; falls back to MiniLM
# -----------------------------------------------------------------------------
USE_BGE_M3               = False
BGE_M3_MODEL             = "BAAI/bge-m3"
FALLBACK_EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_BATCH_SIZE     = 32

# -----------------------------------------------------------------------------
# Retrieval
# -----------------------------------------------------------------------------
RETRIEVAL_CANDIDATES  = 20
CONTEXT_TOP_K         = 8
DENSE_WEIGHT          = 0.50
SPARSE_WEIGHT         = 0.35
BM25_WEIGHT           = 0.35
RRF_K                 = 60
LANG_WEIGHT_PALI      = 0.55
LANG_WEIGHT_ENGLISH   = 0.35
LANG_WEIGHT_VIETNAMESE = 0.10
QUERY_EXPANSION_COUNT = 3
USE_HYDE              = True
USE_CROSS_ENCODER     = True
CROSS_ENCODER_MODEL   = "cross-encoder/ms-marco-MiniLM-L-6-v2"

SEMANTIC_ROLES = [
    "Vinaya Rule",
    "Sutta Narrative",
    "Doctrinal Explanation",
    "Abhidhamma Analysis",
    "Commentary",
    "Jataka Story",
    "Other",
]

# =============================================================================
#  END OF CONFIGURATION
# =============================================================================


# =============================================================================
#  PROGRESS DISPLAY  — live, flush-safe, works over SSH/tmux
# =============================================================================

class Progress:
    """
    Single-line updating progress display.
    Shows: phase | done/total (%) | rate | ETA | extra info
    """
    def __init__(self, phase: str, total: int, extra: str = ""):
        self.phase   = phase
        self.total   = total
        self.done    = 0
        self.start   = time.time()
        self.extra   = extra
        self._last   = 0.0
        self._print()

    def update(self, done: int, extra: str = ""):
        self.done  = done
        if extra:
            self.extra = extra
        now = time.time()
        if now - self._last >= 0.5 or done >= self.total:   # throttle to 2 fps
            self._print()
            self._last = now

    def _print(self):
        elapsed  = max(time.time() - self.start, 0.001)
        rate     = self.done / elapsed
        pct      = self.done / max(self.total, 1) * 100
        bar_len  = 25
        filled   = int(bar_len * pct / 100)
        bar      = "█" * filled + "░" * (bar_len - filled)

        if rate > 0 and self.done < self.total:
            eta_s = (self.total - self.done) / rate
            eta   = str(datetime.timedelta(seconds=int(eta_s)))
        else:
            eta = "done" if self.done >= self.total else "…"

        rate_str = (f"{rate:.1f}/s" if rate >= 1 else f"{rate*60:.1f}/min")

        line = (
            f"\r[{self.phase}] |{bar}| "
            f"{self.done:>7,}/{self.total:,} ({pct:5.1f}%) "
            f"{rate_str}  ETA {eta}"
        )
        if self.extra:
            line += f"  {self.extra}"

        # Pad to clear previous longer line
        line = line.ljust(120)
        sys.stdout.write(line)
        sys.stdout.flush()

    def finish(self, msg: str = ""):
        self.update(self.total)
        elapsed = time.time() - self.start
        print(f"\n  ✓ {self.phase} complete in {elapsed:.1f}s"
              + (f" — {msg}" if msg else ""))


def _log(msg: str):
    """Timestamped log line on its own line (won't smear progress bar)."""
    ts = datetime.datetime.now().strftime("%H:%M:%S")
    print(f"\n[{ts}] {msg}", flush=True)


# =============================================================================
#  UTILITIES
# =============================================================================

def _token_count(text: str) -> int:
    try:
        import tiktoken
        enc = tiktoken.get_encoding("cl100k_base")
        return len(enc.encode(text))
    except ImportError:
        return len(text) // 4


def _cosine(a, b) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    na  = math.sqrt(sum(x * x for x in a))
    nb  = math.sqrt(sum(y * y for y in b))
    return dot / (na * nb) if na and nb else 0.0


def _require(package: str, hint: str):
    try:
        return __import__(package)
    except ImportError:
        print(f"\n[ERROR] Missing '{package}'. Install: {hint}")
        sys.exit(1)


def _ensure_dir(path: str):
    Path(path).mkdir(parents=True, exist_ok=True)


# =============================================================================
#  GEMINI KEY MANAGER  — rotation + quota tracking
# =============================================================================

class KeyManager:
    """
    Manages a pool of Gemini API keys with:
      - Round-robin rotation after each successful request
      - Per-key RPM (rate per minute) throttling
      - Per-key RPD (rate per day) quota tracking
      - Automatic wait when a key is rate-limited (429)
      - Rotate to next key on quota exhaustion
      - If ALL keys exhausted: wait with countdown, then retry
      - State persisted to PROGRESS_DIR/key_state.json so daily counts
        survive restarts within the same calendar day

    Usage:
        km = KeyManager()
        client = km.get_client()   # returns a configured genai module
        try:
            result = client.generate(...)
            km.record_success()
        except Exception as e:
            km.record_error(e)     # handles rotation / waiting internally
    """

    STATE_FILE = f"{PROGRESS_DIR}/key_state.json"

    def __init__(self):
        _require("google.generativeai", "pip install google-generativeai")
        import google.generativeai as genai
        self.genai = genai

        # Collect keys: from config list + env vars GEMINI_KEY_1 … GEMINI_KEY_20
        keys = list(GEMINI_API_KEYS)
        for i in range(1, 21):
            k = os.environ.get(f"GEMINI_KEY_{i}", "").strip()
            if k and k not in keys:
                keys.append(k)
        # Also try plain GEMINI_API_KEY
        k = os.environ.get("GEMINI_API_KEY", "").strip()
        if k and k not in keys:
            keys.append(k)

        if not keys:
            raise ValueError(
                "No Gemini API keys found.\n"
                "Add keys to GEMINI_API_KEYS list in the script, or set env vars:\n"
                "  export GEMINI_KEY_1='AIza...'\n"
                "  export GEMINI_KEY_2='AIza...'"
            )

        self.keys    = keys
        self.n       = len(keys)
        self._idx    = 0          # current key index
        self._state  = self._load_state()
        self._models = {}         # cache: key → GenerativeModel

        today = datetime.date.today().isoformat()
        for key in self.keys:
            if key not in self._state or self._state[key].get("date") != today:
                self._state[key] = {
                    "date"         : today,
                    "requests_day" : 0,
                    "exhausted"    : False,
                    "last_request" : 0.0,
                }
        self._save_state()
        _log(f"[KEYS] {self.n} Gemini key(s) loaded. Daily quota: {GEMINI_FREE_RPD} req/key.")

    # -------------------------------------------------------------------------

    def _load_state(self) -> dict:
        try:
            with open(self.STATE_FILE) as f:
                return json.load(f)
        except Exception:
            return {}

    def _save_state(self):
        _ensure_dir(PROGRESS_DIR)
        with open(self.STATE_FILE, "w") as f:
            json.dump(self._state, f, indent=2)

    def _key_state(self, key: str) -> dict:
        return self._state[key]

    def _is_available(self, key: str) -> bool:
        s    = self._key_state(key)
        today = datetime.date.today().isoformat()
        if s.get("date") != today:
            # New day — reset counters
            s["date"]          = today
            s["requests_day"]  = 0
            s["exhausted"]     = False
        return not s["exhausted"] and s["requests_day"] < GEMINI_FREE_RPD

    def _next_available_key(self) -> Optional[str]:
        """Rotate through keys, return first available one."""
        for _ in range(self.n):
            key = self.keys[self._idx]
            self._idx = (self._idx + 1) % self.n
            if self._is_available(key):
                return key
        return None   # all exhausted

    def _get_model(self, key: str):
        if key not in self._models:
            self.genai.configure(api_key=key)
            self._models[key] = self.genai.GenerativeModel(GEMINI_MODEL)
        return self._models[key]

    def _throttle(self, key: str):
        """Enforce RPM limit: ensure at least 60/RPM seconds between calls."""
        min_gap = 60.0 / GEMINI_FREE_RPM
        s       = self._key_state(key)
        elapsed = time.time() - s.get("last_request", 0)
        if elapsed < min_gap:
            wait = min_gap - elapsed
            time.sleep(wait)

    # -------------------------------------------------------------------------

    def generate(self, prompt: str, max_tokens: int = GEMINI_MAX_TOKENS) -> str:
        """
        Generate with automatic key rotation and quota handling.
        Blocks until a key is available (possibly waiting for daily reset).
        """
        attempts = 0
        while True:
            key = self._next_available_key()

            if key is None:
                # All keys exhausted — compute earliest reset time and wait
                reset_msg = self._wait_for_reset()
                continue

            self._throttle(key)

            try:
                model = self._get_model(key)
                s     = self._key_state(key)

                resp = model.generate_content(
                    prompt,
                    generation_config=self.genai.types.GenerationConfig(
                        max_output_tokens=max_tokens
                    ),
                )
                # Success
                s["requests_day"] += 1
                s["last_request"]  = time.time()
                self._save_state()
                return resp.text.strip()

            except Exception as e:
                err_str = str(e).lower()
                s       = self._key_state(key)

                if any(x in err_str for x in ["429", "quota", "resource_exhausted",
                                               "rate limit", "too many requests"]):
                    s["exhausted"] = True
                    self._save_state()
                    used = s["requests_day"]
                    _log(f"[KEYS] Key …{key[-6:]} quota exhausted "
                         f"({used} req today). Rotating.")
                    attempts += 1
                    continue

                elif any(x in err_str for x in ["500", "503", "unavailable", "internal"]):
                    # Transient server error — back off and retry same key
                    wait = min(30 * (attempts + 1), 120)
                    _log(f"[KEYS] Gemini server error ({e}). Retrying in {wait}s …")
                    time.sleep(wait)
                    attempts += 1
                    continue

                else:
                    # Non-quota error — propagate
                    raise

    def _wait_for_reset(self) -> str:
        """All keys exhausted. Wait with countdown until next minute boundary."""
        _log("[KEYS] ALL keys exhausted. Waiting for quota reset window …")
        waited = 0
        while True:
            # Re-check: a new calendar day might have started
            if self._next_available_key() is not None:
                return "reset"
            sys.stdout.write(
                f"\r  ⏳ All keys exhausted. Rechecking in "
                f"{QUOTA_EXHAUSTED_WAIT - (waited % QUOTA_EXHAUSTED_WAIT)}s …"
                "          "
            )
            sys.stdout.flush()
            time.sleep(1)
            waited += 1
            if waited % QUOTA_EXHAUSTED_WAIT == 0:
                # Reset exhausted flags in case it's a new minute
                today = datetime.date.today().isoformat()
                for key in self.keys:
                    s = self._key_state(key)
                    if s.get("date") != today:
                        s["date"]         = today
                        s["requests_day"] = 0
                        s["exhausted"]    = False
                self._save_state()

    def status(self) -> list[dict]:
        """Return current status of all keys."""
        today  = datetime.date.today().isoformat()
        result = []
        for key in self.keys:
            s = self._key_state(key)
            result.append({
                "key_suffix"   : f"…{key[-8:]}",
                "date"         : s.get("date", "?"),
                "requests_today": s.get("requests_day", 0),
                "exhausted"    : s.get("exhausted", False),
                "remaining"    : max(0, GEMINI_FREE_RPD - s.get("requests_day", 0))
                                  if s.get("date") == today else GEMINI_FREE_RPD,
            })
        return result


# =============================================================================
#  PROGRESS PERSISTENCE
# =============================================================================

class ChunkCache:
    """
    Saves chunks to a JSONL file line-by-line so chunking can be resumed.
    Each line is one chunk serialised as JSON (without embeddings).
    """
    PATH = f"{PROGRESS_DIR}/chunks_cache.jsonl"

    @classmethod
    def exists(cls) -> bool:
        return Path(cls.PATH).exists() and Path(cls.PATH).stat().st_size > 0

    @classmethod
    def save(cls, chunks: list[dict]):
        _ensure_dir(PROGRESS_DIR)
        _log(f"[CACHE] Saving {len(chunks):,} chunks to {cls.PATH} …")
        prog = Progress("SaveChunks", len(chunks))
        with open(cls.PATH, "w", encoding="utf-8") as f:
            for i, c in enumerate(chunks):
                # Store everything except large embedding vectors
                f.write(json.dumps(c, ensure_ascii=False) + "\n")
                if i % 5000 == 0:
                    prog.update(i)
        prog.finish()

    @classmethod
    def load(cls) -> list[dict]:
        chunks = []
        _log(f"[CACHE] Loading chunks from {cls.PATH} …")
        with open(cls.PATH, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    chunks.append(json.loads(line))
        _log(f"[CACHE] Loaded {len(chunks):,} chunks.")
        return chunks


class EnrichmentCache:
    """
    Saves enrichment results (semantic_role, key_concepts, chunk_summary)
    keyed by chunk_id to a JSONL file. Allows enrichment to resume exactly.
    """
    PATH = f"{PROGRESS_DIR}/enrichment.jsonl"

    @classmethod
    def load(cls) -> dict[str, dict]:
        """Returns {chunk_id: {semantic_role, key_concepts, chunk_summary}}"""
        result = {}
        if not Path(cls.PATH).exists():
            return result
        with open(cls.PATH, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    rec = json.loads(line)
                    result[rec["chunk_id"]] = rec
        return result

    @classmethod
    def append(cls, records: list[dict]):
        """Append a list of enrichment records. Safe for concurrent writes."""
        _ensure_dir(PROGRESS_DIR)
        with open(cls.PATH, "a", encoding="utf-8") as f:
            for rec in records:
                f.write(json.dumps(rec, ensure_ascii=False) + "\n")


# =============================================================================
#  DATABASE LOADING
# =============================================================================

def load_sentences(db_path: str) -> list[dict]:
    con = sqlite3.connect(db_path)
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    cur.execute("""
        SELECT
            s.book_id, s.para_id, s.line_id,
            s.thaipage, s.vripage, s.ptspage, s.mypage, s.vripara,
            s.pali_sentence, s.english_translation, s.vietnamese_translation,
            b.book_name, b.category, b.nikaya, b.sub_nikaya,
            b.mula_ref, b.attha_ref, b.tika_ref,
            (
                SELECT h.title FROM headings h
                WHERE  h.book_id = s.book_id AND h.para_id <= s.para_id
                ORDER  BY h.para_id DESC LIMIT 1
            ) AS heading_title
        FROM  sentences s
        JOIN  books     b ON b.book_id = s.book_id
        ORDER BY s.book_id, s.para_id, s.line_id
    """)
    rows = [dict(r) for r in cur.fetchall()]
    con.close()
    _log(f"[DB] Loaded {len(rows):,} sentences.")
    return rows


# =============================================================================
#  EMBEDDER
# =============================================================================

class BGEEmbedder:
    def __init__(self):
        try:
            from FlagEmbedding import BGEM3FlagModel
        except ImportError:
            _log("[ERROR] FlagEmbedding not installed. Run: pip install FlagEmbedding")
            _log("        Or set USE_BGE_M3 = False.")
            sys.exit(1)
        _log(f"[EMBED] Loading BGE-M3: {BGE_M3_MODEL}  (dense + sparse)")
        self.model       = BGEM3FlagModel(BGE_M3_MODEL, use_fp16=True)
        self.sparse_mode = True

    def encode(self, texts: list[str]) -> dict:
        out = self.model.encode(
            texts,
            batch_size=EMBEDDING_BATCH_SIZE,
            max_length=512,
            return_dense=True,
            return_sparse=True,
            return_colbert_vecs=False,
        )
        return {"dense": out["dense_vecs"].tolist(), "sparse": out["lexical_weights"]}

    def encode_one(self, text: str) -> dict:
        return self.encode([text])

    @staticmethod
    def sparse_score(q: dict, d: dict) -> float:
        return sum(float(q[t]) * float(d[t]) for t in q if t in d)


class FallbackEmbedder:
    def __init__(self):
        _require("sentence_transformers", "pip install sentence-transformers")
        from sentence_transformers import SentenceTransformer
        _log(f"[EMBED] Loading fallback: {FALLBACK_EMBEDDING_MODEL}")
        self.model       = SentenceTransformer(FALLBACK_EMBEDDING_MODEL)
        self.sparse_mode = False

    def encode(self, texts: list[str]) -> dict:
        vecs = self.model.encode(texts, show_progress_bar=False).tolist()
        return {"dense": vecs, "sparse": [{}] * len(texts)}

    def encode_one(self, text: str) -> dict:
        return self.encode([text])


def get_embedder():
    if USE_BGE_M3:
        try:
            return BGEEmbedder()
        except Exception as e:
            _log(f"[WARN] BGE-M3 failed ({e}), falling back to MiniLM.")
    return FallbackEmbedder()


# =============================================================================
#  SEMANTIC CHUNKING
# =============================================================================

def _split_boundaries(sentences: list[dict], embedder) -> list[int]:
    if len(sentences) <= SENTENCES_PER_CHUNK_MIN:
        return []
    texts = [(s.get("pali_sentence") or s.get("english_translation") or "").strip()
             for s in sentences]
    try:
        vecs = embedder.encode(texts)["dense"]
    except Exception:
        return []

    boundaries   = []
    window_start = 0
    for i in range(1, len(sentences)):
        sim          = _cosine(vecs[i - 1], vecs[i])
        window_size  = i - window_start
        force_split  = window_size >= SENTENCES_PER_CHUNK_MAX
        topic_shift  = sim < SEMANTIC_SPLIT_THRESHOLD and window_size >= SENTENCES_PER_CHUNK_MIN
        if force_split or topic_shift:
            boundaries.append(i)
            window_start = i
    return boundaries


def chunk_sentences(sentences: list[dict], embedder=None) -> list[dict]:
    """
    Paragraph-aware chunking with optional semantic boundary detection.
    Saves result to ChunkCache so it can be skipped on re-run.
    """
    if ChunkCache.exists():
        _log("[CHUNK] Found existing chunk cache — loading instead of re-chunking.")
        return ChunkCache.load()

    _log(f"[CHUNK] Building chunks (semantic={USE_SEMANTIC_CHUNKING}) …")
    total_sents = len(sentences)
    chunks      : list[dict] = []

    # Group by paragraph
    paragraphs = []
    for key, group in groupby(sentences, key=lambda s: (s["book_id"], s["para_id"])):
        paragraphs.append((key, list(group)))

    prog = Progress("Chunking", len(paragraphs), "para 0")

    for p_idx, ((book_id, para_id), para) in enumerate(paragraphs):
        if USE_SEMANTIC_CHUNKING and embedder and len(para) > 1:
            boundaries = set(_split_boundaries(para, embedder))
        else:
            boundaries = set(range(SENTENCES_PER_CHUNK_MAX, len(para),
                                   SENTENCES_PER_CHUNK_MAX))

        split_points = sorted(boundaries)
        starts = [0] + split_points
        ends   = split_points + [len(para)]

        for chunk_idx, (start, end) in enumerate(zip(starts, ends)):
            overlap_start = max(0, start - CHUNK_OVERLAP_SENTENCES)
            window        = para[overlap_start:end]
            if not window:
                continue

            pali_text = " ".join((s.get("pali_sentence") or "").strip() for s in window)
            eng_text  = " ".join((s.get("english_translation") or "").strip() for s in window)
            vie_text  = " ".join((s.get("vietnamese_translation") or "").strip() for s in window)

            if not (pali_text.strip() or eng_text.strip()):
                continue

            tokens = _token_count(pali_text)
            f      = window[0]
            meta   = {
                "book_id"      : f["book_id"],
                "book_name"    : f.get("book_name") or "",
                "category"     : f.get("category") or "",
                "nikaya"       : f.get("nikaya") or "",
                "sub_nikaya"   : f.get("sub_nikaya") or "",
                "para_id"      : int(para_id),
                "line_start"   : int(window[0]["line_id"] or 0),
                "line_end"     : int(window[-1]["line_id"] or 0),
                "heading_title": f.get("heading_title") or "",
                "thaipage"     : f.get("thaipage") or "",
                "vripage"      : f.get("vripage") or "",
                "ptspage"      : f.get("ptspage") or "",
                "mula_ref"     : f.get("mula_ref") or "",
                "attha_ref"    : f.get("attha_ref") or "",
                "tika_ref"     : f.get("tika_ref") or "",
                "chunk_index"  : chunk_idx,
                "token_count"  : tokens,
                "semantic_role": "",
                "key_concepts" : "",
                "chunk_summary": "",
            }
            prefix = (f"[{meta['nikaya']} | {meta['book_name']} | "
                      f"{meta['heading_title']} | para {para_id}]\n")

            chunks.append({
                "chunk_id"       : f"{book_id}_p{para_id}_c{chunk_idx}",
                "pali_text"      : prefix + pali_text,
                "english_text"   : prefix + eng_text,
                "vietnamese_text": prefix + vie_text,
                "raw_pali"       : pali_text,
                "raw_english"    : eng_text,
                "raw_vietnamese" : vie_text,
                "metadata"       : meta,
            })

        prog.update(p_idx + 1, f"book {book_id} | {len(chunks):,} chunks so far")

    avg = sum(c["metadata"]["token_count"] for c in chunks) // max(1, len(chunks))
    prog.finish(f"{len(chunks):,} chunks, avg {avg} tokens")

    ChunkCache.save(chunks)
    return chunks


# =============================================================================
#  ENRICHMENT AGENT  (multi-key, resumable)
# =============================================================================

ENRICH_PROMPT = """You are a Pali Canon scholar. Analyze these text chunks and return a JSON array.
For each chunk return an object with exactly these keys:
  "chunk_id"      : (copy from input)
  "semantic_role" : one of {roles}
  "key_concepts"  : comma-separated up to 5 Pali concept terms (e.g. "dukkha, anicca, anatta")
  "chunk_summary" : one-sentence English summary of the chunk content

Return ONLY a valid JSON array. No markdown, no explanation, no code fences.

CHUNKS:
{chunks_json}
"""


def enrich_chunks(chunks: list[dict], key_manager: KeyManager) -> list[dict]:
    """
    Enrich all chunks with semantic_role / key_concepts / chunk_summary.
    Resumes from EnrichmentCache — safe to interrupt and restart.
    """
    # Load what's already done
    cache = EnrichmentCache.load()
    _log(f"[ENRICH] {len(cache):,} chunks already enriched, "
         f"{len(chunks) - len(cache):,} remaining.")

    todo = [c for c in chunks if c["chunk_id"] not in cache]
    if not todo:
        _log("[ENRICH] All chunks already enriched — applying cache to metadata.")
        for c in chunks:
            rec = cache.get(c["chunk_id"], {})
            c["metadata"]["semantic_role"] = rec.get("semantic_role", "Other")
            c["metadata"]["key_concepts"]  = rec.get("key_concepts", "")
            c["metadata"]["chunk_summary"] = rec.get("chunk_summary", "")
        return chunks

    roles_json = json.dumps(SEMANTIC_ROLES)
    prog       = Progress("Enriching", len(todo),
                          f"key ?  {len(cache):,} cached")
    done       = 0
    errors     = 0

    for batch_start in range(0, len(todo), ENRICH_BATCH_SIZE):
        batch = todo[batch_start : batch_start + ENRICH_BATCH_SIZE]

        chunks_input = [
            {
                "chunk_id": c["chunk_id"],
                "nikaya"  : c["metadata"]["nikaya"],
                "book"    : c["metadata"]["book_name"],
                "heading" : c["metadata"]["heading_title"],
                "pali"    : c["raw_pali"][:350],
                "english" : c["raw_english"][:350],
            }
            for c in batch
        ]

        prompt = ENRICH_PROMPT.format(
            roles       = roles_json,
            chunks_json = json.dumps(chunks_input, ensure_ascii=False),
        )

        try:
            raw = key_manager.generate(prompt, max_tokens=1200)
            raw = (raw.strip()
                      .lstrip("```json").lstrip("```")
                      .rstrip("```").strip())
            results = json.loads(raw)

            if isinstance(results, list):
                # Match by chunk_id (robust against ordering issues)
                by_id = {r.get("chunk_id", ""): r for r in results}
                saved = []
                for c in batch:
                    r = by_id.get(c["chunk_id"]) or (results[batch.index(c)]
                        if batch.index(c) < len(results) else {})
                    rec = {
                        "chunk_id"     : c["chunk_id"],
                        "semantic_role": r.get("semantic_role", "Other"),
                        "key_concepts" : r.get("key_concepts", ""),
                        "chunk_summary": r.get("chunk_summary", ""),
                    }
                    c["metadata"]["semantic_role"] = rec["semantic_role"]
                    c["metadata"]["key_concepts"]  = rec["key_concepts"]
                    c["metadata"]["chunk_summary"] = rec["chunk_summary"]
                    saved.append(rec)
                EnrichmentCache.append(saved)
                cache.update({r["chunk_id"]: r for r in saved})
            else:
                errors += 1

        except json.JSONDecodeError as e:
            errors += 1
            _log(f"[ENRICH] JSON parse error on batch {batch_start}: {e}")
        except Exception as e:
            errors += 1
            _log(f"[ENRICH] Unexpected error on batch {batch_start}: {e}")

        done += len(batch)
        # Show active key suffix in progress
        key_status = key_manager.status()
        available  = sum(1 for k in key_status if not k["exhausted"])
        prog.update(done,
                    f"keys {available}/{len(key_status)} avail  "
                    f"errors {errors}  "
                    f"saved {len(cache):,}")

    prog.finish(f"{len(cache):,} enriched, {errors} errors")

    # Apply any remaining cached data to chunks not in todo
    for c in chunks:
        if not c["metadata"].get("semantic_role"):
            rec = cache.get(c["chunk_id"], {})
            c["metadata"]["semantic_role"] = rec.get("semantic_role", "Other")
            c["metadata"]["key_concepts"]  = rec.get("key_concepts", "")
            c["metadata"]["chunk_summary"] = rec.get("chunk_summary", "")

    return chunks


# =============================================================================
#  CHROMA COLLECTIONS
# =============================================================================

def get_collections(reset: bool = False) -> dict:
    _require("chromadb", "pip install chromadb")
    import chromadb

    client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
    names  = {
        "pali"      : COLLECTION_PALI,
        "english"   : COLLECTION_ENGLISH,
        "vietnamese": COLLECTION_VIETNAMESE,
    }
    if reset:
        for name in names.values():
            try:
                client.delete_collection(name)
                _log(f"[CHROMA] Deleted '{name}'")
            except Exception:
                pass
    return {
        lang: client.get_or_create_collection(
            name=name, metadata={"hnsw:space": "cosine"})
        for lang, name in names.items()
    }


def index_all_languages(chunks: list[dict], embedder, cols: dict, resume: bool = True):
    for lang, col in cols.items():
        text_key = f"{lang}_text"

        existing: set[str] = set()
        if resume:
            try:
                existing = set(col.get(include=[])["ids"])
                if existing:
                    _log(f"[{lang.upper()}] {len(existing):,} already indexed — skipping those.")
            except Exception:
                pass

        todo = [c for c in chunks
                if c["chunk_id"] not in existing and c.get(text_key, "").strip()]
        if not todo:
            _log(f"[{lang.upper()}] Nothing new to index.")
            continue

        _log(f"[{lang.upper()}] Embedding + indexing {len(todo):,} chunks …")
        prog  = Progress(f"Embed-{lang.upper()}", len(todo))
        start = time.time()

        for b in range(0, len(todo), EMBEDDING_BATCH_SIZE):
            batch  = todo[b : b + EMBEDDING_BATCH_SIZE]
            enc    = embedder.encode([c[text_key] for c in batch])
            embeds = enc["dense"]

            col.upsert(
                ids        = [c["chunk_id"]    for c in batch],
                embeddings = embeds,
                documents  = [c[f"raw_{lang}"] for c in batch],
                metadatas  = [c["metadata"]    for c in batch],
            )
            prog.update(b + len(batch),
                        f"book {batch[0]['metadata'].get('book_id','?')}")

        prog.finish(f"in {time.time()-start:.0f}s")


# =============================================================================
#  SPARSE INDEX  (BGE-M3 sparse or BM25 fallback)
# =============================================================================

class SparseIndex:
    def __init__(self, col_pali, col_english, embedder):
        self._use_bge_sparse = getattr(embedder, "sparse_mode", False)
        self.embedder        = embedder

        if self._use_bge_sparse:
            _log("[SPARSE] Building BGE-M3 sparse index …")
            res_p = col_pali.get(include=["documents", "metadatas"])
            res_e = col_english.get(include=["documents", "metadatas"])
            merged = {}
            for i, cid in enumerate(res_p["ids"]):
                merged[cid] = {"text": res_p["documents"][i] or "",
                               "metadata": res_p["metadatas"][i]}
            for i, cid in enumerate(res_e["ids"]):
                if cid in merged:
                    merged[cid]["text"] += " " + (res_e["documents"][i] or "")

            self.ids   = list(merged.keys())
            self.metas = [merged[k]["metadata"] for k in self.ids]
            texts      = [merged[k]["text"]     for k in self.ids]

            self.sparse_vecs: list[dict] = []
            prog = Progress("SparseIdx", len(texts))
            for b in range(0, len(texts), EMBEDDING_BATCH_SIZE):
                batch = texts[b : b + EMBEDDING_BATCH_SIZE]
                enc   = embedder.encode(batch)
                self.sparse_vecs.extend(enc["sparse"])
                prog.update(b + len(batch))
            prog.finish()

        else:
            _require("rank_bm25", "pip install rank-bm25")
            from rank_bm25 import BM25Okapi
            _log("[SPARSE] Building BM25 fallback index …")
            res_p = col_pali.get(include=["documents", "metadatas"])
            res_e = col_english.get(include=["documents", "metadatas"])
            merged = {}
            for i, cid in enumerate(res_p["ids"]):
                merged[cid] = {"text": res_p["documents"][i] or "",
                               "metadata": res_p["metadatas"][i]}
            for i, cid in enumerate(res_e["ids"]):
                if cid in merged:
                    merged[cid]["text"] += " " + (res_e["documents"][i] or "")
            self.ids   = list(merged.keys())
            self.metas = [merged[k]["metadata"] for k in self.ids]
            docs       = [merged[k]["text"].lower() for k in self.ids]
            self.bm25  = BM25Okapi([d.split() for d in docs])
            _log(f"[SPARSE] BM25 ready — {len(self.ids):,} docs.")

    def search(self, query_text: str, query_sparse: Optional[dict], top_k: int) -> list[dict]:
        if self._use_bge_sparse and query_sparse:
            scores = [BGEEmbedder.sparse_score(query_sparse, dv)
                      for dv in self.sparse_vecs]
        else:
            scores = self.bm25.get_scores(query_text.lower().split()).tolist()
        top_n = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:top_k]
        return [{"chunk_id": self.ids[i], "metadata": self.metas[i],
                 "sparse_score": scores[i]} for i in top_n]


# =============================================================================
#  CROSS-ENCODER RERANKER
# =============================================================================

class CrossEncoderReranker:
    def __init__(self):
        _require("sentence_transformers", "pip install sentence-transformers")
        from sentence_transformers.cross_encoder import CrossEncoder
        _log(f"[RERANK] Loading cross-encoder: {CROSS_ENCODER_MODEL}")
        self.model = CrossEncoder(CROSS_ENCODER_MODEL)

    def rerank(self, query: str, chunks: list[dict]) -> list[dict]:
        if not chunks:
            return chunks
        pairs = []
        for c in chunks:
            passage = (c.get("raw_english") or c.get("raw_pali") or "").strip()
            m       = c.get("metadata", {})
            ctx     = f"{m.get('nikaya','')} {m.get('book_name','')} {m.get('heading_title','')}"
            pairs.append((query, f"{ctx} {passage}"))
        scores = self.model.predict(pairs).tolist()
        for chunk, score in zip(chunks, scores):
            chunk["rerank_score"] = float(score)
        return sorted(chunks, key=lambda c: c["rerank_score"], reverse=True)


# =============================================================================
#  QUERY DECOMPOSITION + EXPANSION + HYDE
# =============================================================================

def decompose_and_expand_query(query: str,
                               key_manager: KeyManager) -> tuple[str, list[str]]:
    queries = [query]
    decomp  = ""

    try:
        decomp = key_manager.generate(
            f"""You are a Pali Canon scholar. A user asks: "{query}"
Reason briefly (2-3 sentences):
1. What Pali concept / teaching is this about?
2. What related Pali terms are relevant?
3. What text type likely contains the answer? (Vinaya/Sutta/Doctrinal/Abhidhamma/Commentary)""",
            max_tokens=150,
        )
    except Exception as e:
        _log(f"[DECOMP] Failed: {e}")

    try:
        raw = key_manager.generate(
            f"""You are a Pali Canon scholar.
Generate {QUERY_EXPANSION_COUNT} alternative search phrasings for: "{query}"
Requirements: include Pali technical terms, vary the phrasing style.
Return ONLY a JSON array of strings.""",
            max_tokens=200,
        )
        raw  = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        subs = json.loads(raw)
        if isinstance(subs, list):
            queries.extend(str(q) for q in subs[:QUERY_EXPANSION_COUNT])
    except Exception as e:
        _log(f"[EXPAND] Failed: {e}")

    if USE_HYDE:
        try:
            hyp = key_manager.generate(
                f"""You are a Pali Canon scholar.
Write a short passage (3-5 sentences) as if from a Pali sutta answering:
"{query}"
Use authentic Buddhist terminology. Include Pali terms. Write AS the canonical text.
Context: {decomp}""",
                max_tokens=200,
            )
            queries.append(hyp)
        except Exception as e:
            _log(f"[HYDE] Failed: {e}")

    return decomp, queries


# =============================================================================
#  RRF
# =============================================================================

def rrf_fuse(ranked_lists: list[list[str]],
             weights: list[float]) -> list[tuple[str, float]]:
    scores: dict[str, float] = {}
    for ranked, w in zip(ranked_lists, weights):
        for rank, cid in enumerate(ranked):
            scores[cid] = scores.get(cid, 0.0) + w / (rank + RRF_K)
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)


# =============================================================================
#  PRODUCTION RAG CLASS
# =============================================================================

class PaliRAG:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path     = db_path
        self.embedder    = get_embedder()
        self.cols        = get_collections(reset=False)
        self.sparse      = SparseIndex(self.cols["pali"], self.cols["english"],
                                       self.embedder)
        self.reranker    : Optional[CrossEncoderReranker] = None
        self.key_manager : Optional[KeyManager]           = None

        if USE_CROSS_ENCODER:
            try:
                self.reranker = CrossEncoderReranker()
            except Exception as e:
                _log(f"[WARN] Cross-encoder unavailable: {e}")

        try:
            self.key_manager = KeyManager()
        except Exception as e:
            _log(f"[WARN] Gemini unavailable: {e}")

        self._meta_cache: dict[str, dict] = {}

    # -------------------------------------------------------------------------

    def _dense_search(self, query_text: str, lang: str, top_k: int,
                      where: Optional[dict] = None) -> list[str]:
        col   = self.cols[lang]
        q_emb = self.embedder.encode_one(query_text)["dense"][0]
        kwargs = dict(
            query_embeddings=[q_emb],
            n_results=min(top_k, col.count() or 1),
            include=["metadatas", "distances"],
        )
        if where:
            kwargs["where"] = where
        res = col.query(**kwargs)
        for cid, meta in zip(res["ids"][0], res["metadatas"][0]):
            self._meta_cache[cid] = meta
        return res["ids"][0]

    def _fetch_pali_sentences(self, book_id: str, para_id: int,
                              line_start: int, line_end: int) -> list[dict]:
        if line_end < line_start:
            return []
        line_ids     = list(range(line_start, line_end + 1))
        placeholders = ",".join("?" for _ in line_ids)
        con = sqlite3.connect(self.db_path)
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        cur.execute(f"""
            SELECT line_id, pali_sentence, english_translation,
                   vietnamese_translation, thaipage, vripage, ptspage
            FROM   sentences
            WHERE  book_id = ? AND para_id = ? AND line_id IN ({placeholders})
            ORDER  BY line_id
        """, [book_id, para_id] + line_ids)
        rows = [dict(r) for r in cur.fetchall()]
        con.close()
        return rows

    def _build_result(self, chunk_id: str, rrf_score: float,
                      rerank_score: Optional[float] = None) -> Optional[dict]:
        meta = self._meta_cache.get(chunk_id)
        if meta is None:
            return None
        pali_sents = self._fetch_pali_sentences(
            meta["book_id"], int(meta["para_id"]),
            int(meta.get("line_start", 0)), int(meta.get("line_end", 0)),
        )
        return {
            "chunk_id"      : chunk_id,
            "rrf_score"     : round(rrf_score, 6),
            "rerank_score"  : rerank_score,
            "metadata"      : meta,
            "pali_sentences": pali_sents,
            "raw_pali"      : " ".join(
                (s.get("pali_sentence") or "").strip() for s in pali_sents),
            "raw_english"   : " ".join(
                (s.get("english_translation") or "").strip() for s in pali_sents),
        }

    # -------------------------------------------------------------------------

    def search(
        self,
        query         : str,
        top_k         : int            = CONTEXT_TOP_K,
        use_expansion : bool           = True,
        where         : Optional[dict] = None,
        role_filter   : Optional[str]  = None,
    ) -> list[dict]:
        effective_where = dict(where or {})
        if role_filter:
            effective_where["semantic_role"] = role_filter
        effective_where = effective_where or None

        decomp = ""
        if use_expansion and self.key_manager:
            decomp, queries = decompose_and_expand_query(query, self.key_manager)
            _log(f"[SEARCH] {len(queries)} queries after expansion.")
        else:
            queries = [query]

        all_ranked : list[list[str]] = []
        all_weights: list[float]     = []
        lang_w = {"pali": LANG_WEIGHT_PALI, "english": LANG_WEIGHT_ENGLISH,
                  "vietnamese": LANG_WEIGHT_VIETNAMESE}

        for q in queries:
            for lang, lw in lang_w.items():
                ids = self._dense_search(q, lang, RETRIEVAL_CANDIDATES,
                                         where=effective_where)
                if ids:
                    all_ranked.append(ids)
                    all_weights.append(DENSE_WEIGHT * lw / len(queries))

        q_enc          = self.embedder.encode_one(query)
        q_sparse       = (q_enc.get("sparse") or [{}])[0]
        sparse_results = self.sparse.search(query, q_sparse, RETRIEVAL_CANDIDATES * 2)
        for r in sparse_results:
            self._meta_cache[r["chunk_id"]] = r["metadata"]
        if sparse_results:
            all_ranked.append([r["chunk_id"] for r in sparse_results])
            sw = SPARSE_WEIGHT if getattr(self.embedder, "sparse_mode", False) else BM25_WEIGHT
            all_weights.append(sw)

        fused = rrf_fuse(all_ranked, all_weights)

        candidates = []
        for chunk_id, score in fused[:RETRIEVAL_CANDIDATES]:
            r = self._build_result(chunk_id, score)
            if r:
                candidates.append(r)

        if self.reranker and candidates:
            candidates = self.reranker.rerank(query, candidates)

        return candidates[:top_k]

    # -------------------------------------------------------------------------

    def answer(
        self,
        question    : str,
        top_k       : int            = CONTEXT_TOP_K,
        where       : Optional[dict] = None,
        role_filter : Optional[str]  = None,
    ) -> dict:
        chunks = self.search(question, top_k=top_k, where=where,
                             role_filter=role_filter)
        if not chunks:
            return {"answer": "No relevant passages found.", "sources": [],
                    "context": "", "chunks": []}

        context_parts: list[str] = []
        sources      : list[dict] = []

        for idx, c in enumerate(chunks, 1):
            m   = c["metadata"]
            loc = (
                f"Book: {m.get('book_name','')} ({m.get('book_id','')})\n"
                f"Nikaya: {m.get('nikaya','')} | Section: {m.get('heading_title','')}\n"
                f"para_id={m.get('para_id','')} | "
                f"line_start={m.get('line_start','')} | line_end={m.get('line_end','')}\n"
                f"Pages: Thai={m.get('thaipage','')} VRI={m.get('vripage','')} "
                f"PTS={m.get('ptspage','')}\n"
                f"Role: {m.get('semantic_role','')} | Concepts: {m.get('key_concepts','')}"
            )
            sents_block = ""
            for s in c.get("pali_sentences", []):
                pali = (s.get("pali_sentence") or "").strip()
                eng  = (s.get("english_translation") or "").strip()
                lid  = s.get("line_id", "")
                if pali:
                    sents_block += f"  [line {lid}] Pali:    {pali}\n"
                if eng:
                    sents_block += f"  [line {lid}] English: {eng}\n"
            context_parts.append(
                f"[Source {idx}]\n{loc}\n\nText:\n{sents_block or '  [no text]'}"
            )
            sources.append({
                "source_num"   : idx,
                "book_id"      : m.get("book_id", ""),
                "book_name"    : m.get("book_name", ""),
                "nikaya"       : m.get("nikaya", ""),
                "para_id"      : m.get("para_id"),
                "line_start"   : m.get("line_start"),
                "line_end"     : m.get("line_end"),
                "heading"      : m.get("heading_title", ""),
                "semantic_role": m.get("semantic_role", ""),
                "key_concepts" : m.get("key_concepts", ""),
                "thaipage"     : m.get("thaipage", ""),
                "vripage"      : m.get("vripage", ""),
                "ptspage"      : m.get("ptspage", ""),
                "mula_ref"     : m.get("mula_ref", ""),
                "attha_ref"    : m.get("attha_ref", ""),
                "tika_ref"     : m.get("tika_ref", ""),
                "rrf_score"    : c["rrf_score"],
                "rerank_score" : c.get("rerank_score"),
            })

        sep     = "\n" + "─" * 60 + "\n\n"
        context = "\n\n" + sep.join(context_parts)

        system_prompt = """You are a knowledgeable scholar of the Pali Canon and Theravada Buddhism.
Answer questions using ONLY the provided source passages.

STRICT RULES:
1. Cite every claim with [Source N].
2. When quoting Pali text, reproduce it EXACTLY — never paraphrase Pali words.
3. After each Pali quote provide the English meaning.
4. Always include the reference: (book_id=XX, para_id=YY, line_start=AA, line_end=BB)
5. If passages are insufficient, say so honestly.
6. Explain Pali technical terms briefly when first introduced.
7. Structure: (a) direct answer, (b) supporting Pali passages, (c) explanation.

CITATION FORMAT:
  [Source N] (book_id=XX, para_id=YY, line_start=AA, line_end=BB)
  Pali: "exact pali text here"
  English: "English meaning here"
"""
        user_prompt = (
            f"CONTEXT PASSAGES FROM THE PALI CANON:\n{context}\n\n"
            f"QUESTION: {question}\n\n"
            "Answer based strictly on the passages above. Include exact Pali with "
            "book_id, para_id, line_start, and line_end for every citation."
        )

        answer_text = "[Gemini not configured — set GEMINI_KEY_1 env var]\n\nSee sources below."
        if self.key_manager:
            try:
                answer_text = self.key_manager.generate(
                    system_prompt + "\n\n" + user_prompt,
                    max_tokens=GEMINI_MAX_TOKENS,
                )
            except Exception as e:
                answer_text = f"[Gemini error: {e}]\n\nContext retrieved — see sources."

        return {"answer": answer_text, "sources": sources,
                "context": context, "chunks": chunks}

    # -------------------------------------------------------------------------

    def search_by_nikaya(self, query: str, nikaya: str, **kw) -> list[dict]:
        return self.search(query, where={"nikaya": nikaya}, **kw)

    def search_by_book(self, query: str, book_id: str, **kw) -> list[dict]:
        return self.search(query, where={"book_id": book_id}, **kw)

    def search_doctrinal(self, query: str, **kw) -> list[dict]:
        return self.search(query, role_filter="Doctrinal Explanation", **kw)

    def search_vinaya(self, query: str, **kw) -> list[dict]:
        return self.search(query, role_filter="Vinaya Rule", **kw)


# =============================================================================
#  INDEX BUILD PIPELINE
# =============================================================================

def build_index(reset: bool = False, skip_enrich: bool = False):
    if not Path(DB_PATH).exists():
        _log(f"[ERROR] Database not found: {DB_PATH}")
        sys.exit(1)

    _ensure_dir(PROGRESS_DIR)

    if reset:
        # Clear all cached progress
        for f in ["chunks_cache.jsonl", "enrichment.jsonl", "key_state.json"]:
            p = Path(PROGRESS_DIR) / f
            if p.exists():
                p.unlink()
                _log(f"[RESET] Deleted {p}")

    # Step 1: Sentences
    sentences = load_sentences(DB_PATH)

    # Step 2: Embedder (needed for semantic chunking)
    embedder = get_embedder()

    # Step 3: Chunking (resumable via ChunkCache)
    _log(f"[BUILD] Semantic chunking: {USE_SEMANTIC_CHUNKING}")
    chunks = chunk_sentences(
        sentences,
        embedder=embedder if USE_SEMANTIC_CHUNKING else None,
    )
    _log(f"[BUILD] Total chunks: {len(chunks):,}")

    # Step 4: Enrichment (resumable via EnrichmentCache)
    if not skip_enrich:
        try:
            km     = KeyManager()
            chunks = enrich_chunks(chunks, km)
        except Exception as e:
            _log(f"[WARN] Enrichment skipped: {e}")
            _log("       Add keys to GEMINI_API_KEYS or set GEMINI_KEY_1 env var.")
    else:
        _log("[BUILD] Skipping enrichment (--no-enrich).")

    # Step 5: Embedding + ChromaDB (resumable via existing IDs check)
    cols = get_collections(reset=reset)
    index_all_languages(chunks, embedder, cols, resume=not reset)

    _log(f"\n✓ Index ready at: {CHROMA_PERSIST_DIR}")
    _log(f"  Pali    : {cols['pali'].count():,} chunks")
    _log(f"  English : {cols['english'].count():,} chunks")
    _log(f"  Viet    : {cols['vietnamese'].count():,} chunks")
    _log(f"  Progress files: {PROGRESS_DIR}/")


# =============================================================================
#  CLI OUTPUT HELPERS
# =============================================================================

def _print_results(results: list[dict]):
    for i, r in enumerate(results, 1):
        m     = r["metadata"]
        rrf_s = r.get("rrf_score", 0)
        re_s  = r.get("rerank_score")
        score = f"RRF={rrf_s:.5f}" + (f"  rerank={re_s:.3f}" if re_s else "")
        print(f"\n{'─'*65}")
        print(f"[{i}] {score}")
        print(f"    Role: {m.get('semantic_role','?')}  | "
              f"Concepts: {m.get('key_concepts','')}")
        print(f"    {m.get('nikaya','')} > {m.get('book_name','')} > "
              f"{m.get('heading_title','')}")
        print(f"    book_id={m.get('book_id','')}  para_id={m.get('para_id','')}  "
              f"lines={m.get('line_start','')}–{m.get('line_end','')}")
        print(f"    Pages: Thai={m.get('thaipage','')} "
              f"VRI={m.get('vripage','')} PTS={m.get('ptspage','')}")
        if m.get("chunk_summary"):
            print(f"    Summary: {m['chunk_summary']}")
        for s in r.get("pali_sentences", [])[:3]:
            pali = (s.get("pali_sentence") or "").strip()
            eng  = (s.get("english_translation") or "").strip()
            lid  = s.get("line_id", "")
            if pali:
                print(f"    [L{lid}] Pali: {pali[:110]}{'…' if len(pali)>110 else ''}")
            if eng:
                print(f"    [L{lid}] Eng : {eng[:110]}{'…' if len(eng)>110 else ''}")


def _print_answer(result: dict):
    print("\n" + "=" * 70)
    print("ANSWER")
    print("=" * 70)
    print(result["answer"])
    print("\n" + "─" * 70)
    print("SOURCES  (book_id + para_id + line_start/end → exact Pali text)")
    print("─" * 70)
    for s in result["sources"]:
        re_s = f"  rerank={s['rerank_score']:.3f}" if s.get("rerank_score") else ""
        print(
            f"  [{s['source_num']}] {s['nikaya']} > {s['book_name']}\n"
            f"       book_id={s['book_id']}  para_id={s['para_id']}  "
            f"lines={s['line_start']}–{s['line_end']}{re_s}\n"
            f"       Role: {s['semantic_role']}  | Concepts: {s['key_concepts']}\n"
            f"       Pages: Thai={s['thaipage']} VRI={s['vripage']} PTS={s['ptspage']}"
        )


def _print_key_status(km: KeyManager):
    print("\n── Gemini Key Status ──────────────────────────────")
    for k in km.status():
        status = "❌ exhausted" if k["exhausted"] else "✅ available"
        print(f"  key {k['key_suffix']}  "
              f"used {k['requests_today']:>5}/{GEMINI_FREE_RPD}  "
              f"remaining {k['remaining']:>5}  {status}")
    print()


# =============================================================================
#  MAIN
# =============================================================================

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pali Canon Production RAG  v4")
    sub    = parser.add_subparsers(dest="cmd")

    p_build = sub.add_parser("build", help="Build / update the vector index")
    p_build.add_argument("--reset",     action="store_true",
                         help="Wipe all cached progress and rebuild from scratch")
    p_build.add_argument("--no-enrich", action="store_true",
                         help="Skip Gemini enrichment (faster; no semantic roles)")

    p_query = sub.add_parser("query", help="Hybrid search with reranking")
    p_query.add_argument("text",        nargs="+")
    p_query.add_argument("--no-expand", action="store_true")
    p_query.add_argument("--top-k",     type=int, default=CONTEXT_TOP_K)
    p_query.add_argument("--role",      type=str, default=None,
                         help=f"Filter by semantic role: {SEMANTIC_ROLES}")

    p_ans = sub.add_parser("answer", help="RAG: retrieve + Gemini answer")
    p_ans.add_argument("text",     nargs="+")
    p_ans.add_argument("--top-k",  type=int, default=CONTEXT_TOP_K)
    p_ans.add_argument("--role",   type=str, default=None)

    p_keys = sub.add_parser("keys", help="Show API key status and quota usage")

    args = parser.parse_args()

    if args.cmd == "build":
        build_index(reset=args.reset, skip_enrich=args.no_enrich)

    elif args.cmd == "query":
        rag     = PaliRAG()
        results = rag.search(
            " ".join(args.text),
            top_k         = args.top_k,
            use_expansion = not args.no_expand,
            role_filter   = args.role,
        )
        _print_results(results)

    elif args.cmd == "answer":
        rag    = PaliRAG()
        result = rag.answer(
            " ".join(args.text),
            top_k       = args.top_k,
            role_filter = args.role,
        )
        _print_answer(result)

    elif args.cmd == "keys":
        km = KeyManager()
        _print_key_status(km)

    else:
        build_index()