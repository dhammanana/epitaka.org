#!/usr/bin/env python3
"""Per-language SEO keyword & question research for E-Piṭaka.

Source: live Google autocomplete via KeywordTool.io guest MCP
(`https://mcp.keywordtool.io/guest`), 2026-10-07 — 3 calls per language
(head-term suggestions, dhammapada-term suggestions, head-term questions)
with country+language targeting. Raw responses: /tmp/lang_<code>_*.json.

Every row below is a verbatim live suggestion except rows marked
"(derived)" (rephrased from suggestion fragments where the questions-type
call returned only generic question words — si/my) and languages where the
questions call returned nothing usable (my/zh/km/lo: questions.csv ships
with header only; see notes).

Regenerate:
    cd epitaka.org/seo && python3 build_lang_docs.py

Writes seo/languages/<code>/{keywords.csv,questions.csv,notes.md}.
"""
import csv
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "languages")

KW_HEADER = ["keyword", "intent", "difficulty", "kd_estimate",
             "priority", "target_page", "notes"]
Q_HEADER = ["question", "intent", "difficulty", "kd_estimate",
            "priority", "answer_angle"]

# code -> (English name, country param, language param, site path,
#          seeds, raw totals head/dhp/questions)
LANGS = {
    "vi": ("Vietnamese", "Vietnam", "Vietnamese", "/vi/",
           ["tam tạng pali", "kinh pháp cú"], [71, 454, 42]),
    "th": ("Thai", "Thailand", "Thai", "/th/",
           ["พระไตรปิฎก", "ธรรมบท"], [511, 430, 66]),
    "si": ("Sinhala", "Sri Lanka", "Sinhala", "/si/",
           ["ත්‍රිපිටකය", "ධම්මපදය"], [98, 116, 24]),
    "my": ("Burmese", "Myanmar", "Burmese", "/my/",
           ["ပိဋကတ်တော်", "ဓမ္မပဒ"], [95, 78, 4]),
    "zh": ("Chinese", "Taiwan", "Chinese", "/cn/",
           ["巴利三藏", "法句经"], [37, 111, 0]),
    "ta": ("Tamil", "India", "Tamil", "/ta/",
           ["திரிபிடகம்", "தம்மபதம்"], [203, 301, 28]),
    "lo": ("Lao", "Laos", "Lao", "/lo/",
           ["ພະໄຕຣປິດົກ", "ທັມມະບົດ"], [13, 5, 0]),
    "km": ("Khmer", "Cambodia", "Khmer", "/km/",
           ["ព្រះត្រៃបិដក", "ធម្មបទ"], [17, 18, 0]),
    "id": ("Indonesian", "Indonesia", "Indonesian", "/id/",
           ["tipitaka", "dhammapada"], [501, 590, 54]),
}

# (lang, keyword, intent, kd, priority, target_page, notes)
KEYWORDS = [
    # ── Vietnamese ──
    ("vi", "tam tạng pali", "informational", 15, "P1", "/vi/", "Head term (live)"),
    ("vi", "kinh tam tạng pali", "informational", 12, "P1", "/vi/", "Live"),
    ("vi", "chú giải tam tạng pali", "informational", 10, "P1", "/vi/", "Commentary differentiator (live)"),
    ("vi", "tam tạng song ngữ pali việt", "informational", 10, "P1", "/vi/", "Bilingual intent (live)"),
    ("vi", "tam tạng kinh điển pali pdf", "transactional", 14, "P2", "/vi/", "PDF intent (live)"),
    ("vi", "tam tạng pali là gì", "informational", 10, "P1", "/vi/", "Definition (live)"),
    ("vi", "luận tạng pali", "informational", 12, "P2", "/vi/", "Abhidhamma basket (live)"),
    ("vi", "tạng pali", "informational", 12, "P2", "/vi/", "Short form (live)"),
    ("vi", "kinh pháp cú", "informational", 15, "P1", "/vi/book/Dhp", "Head term (live, 454 suggestions)"),
    ("vi", "423 câu kinh pháp cú", "informational", 10, "P1", "/vi/book/Dhp", "Verse-count query (live)"),
    ("vi", "nghe kinh pháp cú", "informational", 12, "P1", "/vi/book/Dhp", "Audio intent (live)"),
    ("vi", "tụng kinh pháp cú", "informational", 14, "P2", "/vi/book/Dhp", "Chant intent (live)"),
    ("vi", "kinh pháp cú thích minh châu", "informational", 14, "P2", "/vi/book/Dhp", "Translator name (live)"),
    ("vi", "chú giải kinh pháp cú", "informational", 12, "P1", "/vi/book/Dhp", "Commentary (live)"),
    ("vi", "kinh pháp cú song ngữ anh việt", "informational", 12, "P2", "/vi/book/Dhp", "Bilingual (live)"),
    ("vi", "đọc kinh pháp cú", "transactional", 12, "P2", "/vi/book/Dhp", "Read intent (live)"),
    ("vi", "app kinh pháp cú", "transactional", 12, "P2", "/app/", "App intent (live)"),
    # ── Thai ──
    ("th", "พระไตรปิฎก", "informational", 18, "P1", "/th/", "Head term (live, 511 suggestions)"),
    ("th", "พระไตรปิฎก pdf", "transactional", 20, "P2", "/th/", "PDF (live)"),
    ("th", "พระไตรปิฎก 45 เล่ม pdf", "transactional", 14, "P2", "/th/", "45-volume set (live)"),
    ("th", "พระไตรปิฎกฉบับประชาชน", "informational", 14, "P2", "/th/", "People's edition (live)"),
    ("th", "พระไตรปิฎกออนไลน์", "navigational", 12, "P1", "/th/", "Online (live)"),
    ("th", "พระไตรปิฎกมีกี่เล่ม", "informational", 12, "P2", "/th/", "How many volumes (live)"),
    ("th", "พระไตรปิฎกภาษาอังกฤษ", "informational", 16, "P2", "/th/", "English version (live)"),
    ("th", "พระไตรปิฎก แบ่งออกเป็น 3 หมวด", "informational", 14, "P2", "/th/", "3-basket phrasing (live)"),
    ("th", "ธรรมบท", "informational", 15, "P1", "/th/book/Dhp", "Head term (live, 430 suggestions)"),
    ("th", "นิทานธรรมบท", "informational", 12, "P1", "/th/book/Dhp", "Stories (live)"),
    ("th", "แปลธรรมบท", "informational", 14, "P2", "/th/book/Dhp", "Translation (live)"),
    ("th", "คาถาธรรมบท", "informational", 12, "P2", "/th/book/Dhp", "Verses (live)"),
    ("th", "ธรรมบทมีกี่วรรค", "informational", 12, "P2", "/th/book/Dhp", "How many chapters (live)"),
    # ── Sinhala ──
    ("si", "ත්‍රිපිටකය", "informational", 12, "P1", "/si/", "Head term (live)"),
    ("si", "ත්‍රිපිටකය pdf", "transactional", 16, "P2", "/si/", "PDF (live)"),
    ("si", "ත්‍රිපිටකය සිංහලෙන්", "informational", 10, "P1", "/si/", "In Sinhala (live)"),
    ("si", "ත්‍රිපිටකය කොටස්", "informational", 12, "P2", "/si/", "Parts (live)"),
    ("si", "ත්‍රිපිටකය ලෝක උරුම", "informational", 14, "P2", "/si/", "World-heritage angle (live)"),
    ("si", "ධම්මපදය", "informational", 12, "P1", "/si/book/Dhp", "Head term (live)"),
    ("si", "ධම්මපදය pdf", "transactional", 16, "P2", "/si/book/Dhp", "PDF (live)"),
    ("si", "ධම්මපදය නිධාන කතා", "informational", 10, "P1", "/si/book/Dhp", "Background stories (live)"),
    ("si", "ධම්මපදට්ඨකථාව", "informational", 10, "P1", "/si/book/Dhp", "Commentary (live)"),
    ("si", "සිංහල ධම්මපදය", "informational", 12, "P2", "/si/book/Dhp", "Sinhala Dhammapada (live)"),
    ("si", "ධම්මපදය ගාථා හා තේරුම්", "informational", 12, "P2", "/si/book/Dhp", "Verses with meaning (live)"),
    # ── Burmese ──
    ("my", "ပိဋကတ်တော်", "informational", 12, "P1", "/my/", "Head term (live)"),
    ("my", "ပိဋကတ်တော် သမိုင်း", "informational", 12, "P2", "/my/", "History (live)"),
    ("my", "ပိဋကတ်တော် သမိုင်း pdf", "transactional", 14, "P2", "/my/", "History PDF (live)"),
    ("my", "ပိဋကတ်တော် မြန်မာပြန်", "informational", 10, "P1", "/my/", "Myanmar translation (live)"),
    ("my", "ဓမ္မပဒ", "informational", 12, "P1", "/my/book/Dhp", "Head term (live)"),
    ("my", "ဓမ္မပဒ ပါဠိတော် မြန်မာပြန်", "informational", 10, "P1", "/my/book/Dhp", "Pali+Myanmar (live)"),
    ("my", "ဓမ္မပဒ အဋ္ဌကထာ မြန်မာပြန် pdf", "transactional", 12, "P1", "/my/book/Dhp", "Commentary PDF (live)"),
    ("my", "ဓမ္မပဒ ဝတ္ထုတော်ကြီး", "informational", 12, "P2", "/my/book/Dhp", "Great stories (live)"),
    ("my", "ဓမ္မပဒ အနှစ်ချုပ်", "informational", 12, "P2", "/my/book/Dhp", "Summary (live)"),
    ("my", "ဓမ္မပဒ နိဿယ", "informational", 14, "P2", "/my/book/Dhp", "Nissaya (live)"),
    ("my", "ဓမ္မပဒ apk", "transactional", 12, "P2", "/app/", "App/APK intent (live)"),
    # ── Chinese (site path /cn/ = zh) ──
    ("zh", "巴利三藏", "informational", 15, "P1", "/cn/", "Head term (live)"),
    ("zh", "巴利三藏中文", "informational", 12, "P1", "/cn/", "Chinese version (live)"),
    ("zh", "巴利三藏pdf", "transactional", 18, "P2", "/cn/", "PDF (live)"),
    ("zh", "巴利三藏長部", "informational", 12, "P2", "/cn/book/D", "Digha (live)"),
    ("zh", "巴利三藏中部", "informational", 12, "P2", "/cn/book/M", "Majjhima (live)"),
    ("zh", "巴利三藏相應部", "informational", 12, "P2", "/cn/book/S", "Samyutta (live)"),
    ("zh", "巴利三藏律藏", "informational", 14, "P2", "/cn/", "Vinaya (live)"),
    ("zh", "巴利三藏翻譯", "informational", 14, "P2", "/cn/", "Translation (live)"),
    ("zh", "巴利三藏電子辭典", "informational", 14, "P2", "/cn/", "E-dictionary (live)"),
    ("zh", "吉祥经", "informational", 12, "P2", "/cn/book/Khp", "Mangala Sutta (live)"),
    ("zh", "法句经", "informational", 15, "P1", "/cn/book/Dhp", "Head term (live)"),
    ("zh", "法句经全文", "informational", 12, "P1", "/cn/book/Dhp", "Full text (live)"),
    ("zh", "法句经白话", "informational", 12, "P2", "/cn/book/Dhp", "Vernacular (live)"),
    ("zh", "法句经故事", "informational", 12, "P2", "/cn/book/Dhp", "Stories (live)"),
    ("zh", "南传法句经", "informational", 14, "P2", "/cn/book/Dhp", "Theravada edition (live)"),
    ("zh", "法句经cbeta", "navigational", 16, "P2", "/cn/book/Dhp", "CBETA (live)"),
    # ── Tamil ──
    ("ta", "திரிபிடகம்", "informational", 12, "P1", "/ta/", "Head term (live)"),
    ("ta", "திரிபிடகம் pdf", "transactional", 16, "P2", "/ta/", "PDF (live)"),
    ("ta", "திரிபிடகம் நூல்", "informational", 12, "P2", "/ta/", "Book (live)"),
    ("ta", "திரிபிடகம் என்றால் என்ன", "informational", 10, "P1", "/ta/", "What is (live)"),
    ("ta", "திரிபிடகம் பொருள்", "informational", 12, "P2", "/ta/", "Meaning (live)"),
    ("ta", "தம்மபதம்", "informational", 12, "P1", "/ta/book/Dhp", "Head term (live)"),
    ("ta", "தம்மபதம் pdf", "transactional", 14, "P2", "/ta/book/Dhp", "PDF (live)"),
    ("ta", "தம்மபதம் என்றால் என்ன", "informational", 10, "P1", "/ta/book/Dhp", "What is (live)"),
    ("ta", "புத்தரின் தம்மபதம்", "informational", 14, "P2", "/ta/book/Dhp", "Buddha's Dhammapada (live)"),
    # ── Lao (thin locale — Thai spillover covers most demand) ──
    ("lo", "ພະໄຕຣປິດົກ", "informational", 8, "P1", "/lo/", "Head term (live; only solid hit)"),
    # ── Khmer ──
    ("km", "ព្រះត្រៃបិដក", "informational", 10, "P1", "/km/", "Head term (live)"),
    ("km", "ព្រះត្រៃបិដក pdf", "transactional", 14, "P2", "/km/", "PDF (live)"),
    ("km", "ព្រះត្រៃបិដក free download", "transactional", 14, "P2", "/km/", "Free download (live)"),
    ("km", "គម្ពីរ ព្រះ ត្រៃ បិដក គឺ ជា អ្វី", "informational", 10, "P1", "/km/", "What is (live)"),
    ("km", "ព្រះត្រៃបិដក ភាគ ១ pdf", "transactional", 12, "P2", "/km/", "Volume 1 (live)"),
    ("km", "ធម្មបទ", "informational", 10, "P1", "/km/book/Dhp", "Head term (live)"),
    ("km", "គាថា ធម្មបទ pdf", "transactional", 12, "P2", "/km/book/Dhp", "Verses PDF (live)"),
    ("km", "ធម្មបទ ដ្ឋកថា pdf", "transactional", 10, "P1", "/km/book/Dhp", "Commentary PDF (live)"),
    # ── Indonesian ──
    ("id", "tipitaka", "informational", 15, "P1", "/id/", "Head term (live, 501 suggestions)"),
    ("id", "kitab suci tipitaka", "informational", 12, "P1", "/id/", "Holy-book phrasing (live)"),
    ("id", "apa itu tipitaka", "informational", 10, "P1", "/id/", "What is (live)"),
    ("id", "tipitaka chanting", "informational", 12, "P1", "/id/", "Chanting +2026 event (live)"),
    ("id", "tipitaka pali", "informational", 14, "P2", "/id/", "Pali (live)"),
    ("id", "tipitaka online", "navigational", 12, "P1", "/id/", "Online (live)"),
    ("id", "tipitaka atthakatha", "informational", 10, "P1", "/id/", "Commentary (live)"),
    ("id", "tipitaka app", "transactional", 12, "P2", "/app/", "App (live)"),
    ("id", "tipitaka apk", "transactional", 12, "P2", "/app/", "APK (live)"),
    ("id", "dhammapada", "informational", 15, "P1", "/id/book/Dhp", "Head term (live, 590 suggestions)"),
    ("id", "syair dhammapada", "informational", 12, "P1", "/id/book/Dhp", "Verses (live)"),
    ("id", "dhammapada ayat 183", "informational", 12, "P2", "/id/book/Dhp", "Verse-number pattern (live)"),
    ("id", "ayat dhammapada tentang kehidupan", "informational", 12, "P2", "/id/book/Dhp", "Life topic (live)"),
    ("id", "ayat dhammapada tentang cinta", "informational", 14, "P2", "/id/book/Dhp", "Love topic (live)"),
    ("id", "apa itu dhammapada", "informational", 10, "P1", "/id/book/Dhp", "What is (live)"),
    ("id", "dhammapada atthakatha", "informational", 10, "P1", "/id/book/Dhp", "Commentary (live)"),
]

# (lang, question, intent, kd, priority, answer_angle)
QUESTIONS = [
    ("vi", "Đọc kinh Pháp Cú ở đâu?", "informational", 8, "P1", "Vietnamese: where to read (live)."),
    ("vi", "kinh pháp cú là kinh gì", "informational", 12, "P2", "What sutra is it (live pattern)."),
    ("vi", "có bao nhiêu vị tam tạng", "informational", 12, "P2", "How many Tipitaka holders (live)."),
    ("vi", "có thể tự quy y tam bảo không", "informational", 14, "P2", "Self refuge (live)."),
    ("th", "พระไตรปิฎกคืออะไร", "informational", 12, "P1", "What is (live)."),
    ("th", "พระไตรปิฎกอ่านที่ไหน", "informational", 8, "P1", "Where to read (live)."),
    ("th", "พระไตรปิฎกเริ่มอ่านยังไง", "informational", 10, "P1", "How to start (live)."),
    ("th", "พระไตรปิฎกมาจากไหน", "informational", 12, "P2", "Origin (live)."),
    ("th", "พระไตรปิฎกซื้อที่ไหน", "transactional", 14, "P2", "Where to buy (live)."),
    ("si", "ත්‍රිපිටකය යනු කුමක්ද", "informational", 10, "P1", "What is (derived — questions call returned generic words)."),
    ("si", "ධම්මපදය යනු කුමක්ද", "informational", 10, "P1", "What is (derived)."),
    ("si", "ධම්මපදය ගාථා කීයද", "informational", 12, "P2", "How many verses (derived)."),
    ("ta", "திரிபிடகம் என்றால் என்ன", "informational", 10, "P1", "What is (live)."),
    ("id", "apa itu tripitaka dalam agama buddha", "informational", 10, "P1", "What is in Buddhism (live)."),
    ("id", "apa saja isi tripitaka", "informational", 12, "P1", "Contents (live)."),
    ("id", "mengapa tripitaka penting", "informational", 14, "P2", "Why important (live)."),
    ("id", "apa bedanya tripitaka dan paritta", "informational", 14, "P2", "Vs Paritta (live)."),
    ("id", "tripitaka ada berapa buku", "informational", 12, "P2", "How many books (live)."),
]

NOTES = {
    "vi": ("Strongest file: 454 Dhammapada suggestions. Audio (`nghe`), chant (`tụng`), "
           "translator (`Thích Minh Châu`), bilingual and app intents all live. "
           "Questions call was noisy (bath/weather words) — only 4 kept."),
    "th": ("Largest raw haul (511 head + 430 Dhammapada + 66 questions). Edition queries "
           "(`ฉบับประชาชน`, `45 เล่ม`), story (`นิทาน`) and translation-section (`แปล…ภาค`) "
           "patterns are unique to Thai. Where-to-read/buy/how-to-start questions map "
           "directly to landing-page CTAs."),
    "si": ("Commentary jackpot: `ධම්මපදට්ඨකථාව` + `නිධාන කතා` (background stories) + "
           "world-heritage angle. Questions call returned only generic question words — "
           "3 questions derived from suggestion fragments, marked (derived)."),
    "my": ("History (`သမိုင်း`), Myanmar-translation and APK intents live; Dhammapada "
           "commentary + great-stories (`ဝတ္ထုတော်ကြီး`) PDFs confirm the commentary "
           "differentiator. Questions call unusable (4 generic rows) — no questions.csv rows."),
    "zh": ("Nikaya-book breakdown (長部/中部/相應部), 律藏, e-dictionary and Mangala "
           "(`吉祥经`) queries live; CBETA is the competitor to position against. "
           "Country param used Taiwan (Google data for mainland is thin); questions call "
           "returned 0 rows — no questions.csv rows."),
    "ta": ("PDF + definition intents dominate (203 head / 301 Dhammapada). Osho-related "
           "suggestion noted but skipped. Questions call mostly generic — 1 kept."),
    "lo": ("Sparse locale (13 head / 5 Dhammapada / 0 questions). Keep the head term, "
           "serve Lao users via Thai spillover (`/th/`) until demand is proven."),
    "km": ("Small but clean: PDF, free-download, volume numbers, in-English, and "
           "commentary (`ដ្ឋកថា`) + 84000-dhamma patterns. Questions call returned 0 rows."),
    "id": ("Second-largest haul (501 + 590 + 54). `tipitaka chanting` (+2026 event spike), "
           "`kitab suci` phrasing, verse-number (`ayat 183`) and verse-topic "
           "(`tentang kehidupan/cinta`) patterns are the content plan. "
           "`tripitaka vs paritta` is a ready-made FAQ."),
}


def band(kd):
    if kd <= 19:
        return "Easy"
    if kd <= 44:
        return "Medium"
    if kd <= 69:
        return "Hard"
    return "Very Hard"


def build():
    os.makedirs(OUT, exist_ok=True)
    total_kw, total_q = 0, 0
    index = []
    for code, (name, country, lang, path, seeds, totals) in LANGS.items():
        d = os.path.join(OUT, code)
        os.makedirs(d, exist_ok=True)
        kw = [r for r in KEYWORDS if r[0] == code]
        qs = [r for r in QUESTIONS if r[0] == code]
        total_kw += len(kw)
        total_q += len(qs)
        with open(os.path.join(d, "keywords.csv"), "w", newline="", encoding="utf-8") as fh:
            w = csv.writer(fh)
            w.writerow(KW_HEADER)
            w.writerows([[k, i, band(kd), kd, p, t, n] for (_, k, i, kd, p, t, n) in kw])
        with open(os.path.join(d, "questions.csv"), "w", newline="", encoding="utf-8") as fh:
            w = csv.writer(fh)
            w.writerow(Q_HEADER)
            w.writerows([[q, i, band(kd), kd, p, a] for (_, q, i, kd, p, a) in qs])
        p1 = sum(1 for r in kw if r[4] == "P1")
        with open(os.path.join(d, "notes.md"), "w", encoding="utf-8") as fh:
            fh.write(f"# {name} ({code}) — keyword research\n\n")
            fh.write(f"> Live Google autocomplete via KeywordTool.io guest MCP, 2026-10-07.\n")
            fh.write(f"> Locale: country=`{country}`, language=`{lang}`. "
                     f"Seeds: {', '.join(f'`{s}`' for s in seeds)}. "
                     f"Raw suggestion totals (head/dhammapada/questions): "
                     f"{totals[0]}/{totals[1]}/{totals[2]}.\n\n")
            fh.write(f"**{len(kw)} keywords** ({p1} P1) · **{len(qs)} questions**. "
                     f"Difficulty is an editorial estimate — validate P1 with a "
                     f"keyword tool before investing.\n\n")
            fh.write(f"## Highlights\n\n{NOTES[code]}\n")
        index.append((code, name, path, len(kw), p1, len(qs)))
    print(f"Wrote {total_kw} keywords + {total_q} questions across {len(LANGS)} languages to {OUT}")
    for code, name, path, nkw, p1, nq in index:
        print(f"  {code} {name}: {nkw} kw ({p1} P1), {nq} q -> {path}")


if __name__ == "__main__":
    build()
