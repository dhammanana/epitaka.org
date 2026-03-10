import sqlite3
import random
import os
import psycopg2
from collections import defaultdict
from google import genai
from google.genai import types
import xml.etree.ElementTree as ET
import sys
import json
import base64
import re
from aksharamukha import transliterate
from dotenv import load_dotenv
import concurrent.futures
from datetime import datetime
from termcolor import colored
import threading
import time
import queue
import threading
import subprocess


NUM_THREADS = 6
prompt_file = '../prompts/prompt_vi_nissaya.md'
load_dotenv('../.env')

# RECOMMENDED SOLUTION: Single writer thread with queue
# This is the most reliable approach for high-concurrency SQLite access

import sqlite3
import queue
import threading
import time

class DatabaseWriter:
    def __init__(self, db_path):
        self.db_path = db_path
        self.queue = queue.Queue()
        self.stop_event = threading.Event()
        self.writer_thread = None
        self.start_writer()
    
    def start_writer(self):
        """Start the database writer thread"""
        self.writer_thread = threading.Thread(target=self._writer_loop, daemon=True)
        self.writer_thread.start()
        print("Database writer thread started")
    
    def _writer_loop(self):
        """Main loop for the database writer thread"""
        conn = None
        try:
            conn = sqlite3.connect(self.db_path, timeout=60.0)
            # Optimize SQLite for concurrent access
            conn.execute("PRAGMA journal_mode=WAL")  # Write-Ahead Logging
            conn.execute("PRAGMA synchronous=NORMAL")  # Balance safety and speed
            conn.execute("PRAGMA cache_size=10000")  # Larger cache
            conn.execute("PRAGMA temp_store=memory")  # Temp tables in memory
            conn.execute("PRAGMA busy_timeout=60000")  # 60 second busy timeout
            
            print("Database writer ready with optimized settings")
            
            while not self.stop_event.is_set():
                try:
                    # Get update task from queue with timeout
                    task = self.queue.get(timeout=1.0)
                    if task is None:  # Poison pill to stop
                        break
                    
                    book_id, translations, result_queue = task
                    success = self._do_database_update(conn, book_id, translations)
                    result_queue.put(success)
                    self.queue.task_done()
                    
                except queue.Empty:
                    continue
                except Exception as e:
                    print(f"Database writer error: {e}")
                    
        except Exception as e:
            print(f"Database writer thread error: {e}")
        finally:
            if conn:
                conn.close()
            print("Database writer thread stopped")
    
    def _do_database_update(self, conn, book_id, translations):
        """Perform the actual database update"""
        try:
            cursor = conn.cursor()
            
            # Log translations
            with open('log_translations.txt', 'a', encoding='utf-8') as f:
                for (para_id, line_id, pali_sentence), vietnamese_translation in translations:
                    f.write(f"{book_id}\t{para_id}\t{line_id}\t{pali_sentence}\t{vietnamese_translation}\n")
                f.write("-------------------------------------------------------\n")
            
            # Update database in a transaction
            cursor.execute("BEGIN TRANSACTION")
            for (para_id, line_id, _), vietnamese_translation in translations:
                cursor.execute(
                    "UPDATE sentences SET vietnamese_translation = ? WHERE book_id = ? AND para_id = ? AND line_id = ?",
                    (vietnamese_translation, book_id, para_id, line_id)
                )
            cursor.execute("COMMIT")
            
            # Log successful update
            thread_id = threading.current_thread().ident
            print(colored(f"  DEBUG: Database writer updated {len(translations)} sentences for book {book_id}", 'light_grey'))
            return True
            
        except Exception as e:
            print(f"Database update error: {e}")
            try:
                cursor.execute("ROLLBACK")
            except:
                pass
            return False
    
    def update_translations(self, book_id, translations, timeout=30.0):
        """Queue a database update and wait for result"""
        if not translations:
            print('There is no translations')
            return True
            
        result_queue = queue.Queue()
        task = (book_id, translations, result_queue)
        
        try:
            self.queue.put(task, timeout=15.0)  # 5 second timeout to queue
            return result_queue.get(timeout=timeout)  # Wait for result
        except queue.Full:
            print("Database queue is full, skipping update")
            return False
        except queue.Empty:
            # print(f"  DEBUG: Database update timed out after {timeout} seconds")
            return False
        except Exception as e:
            print(colored(f'Error in updating database: {str(e)}', 'red'))
    
    def stop(self):
        """Stop the database writer thread"""
        self.stop_event.set()
        self.queue.put(None)  # Poison pill
        if self.writer_thread:
            self.writer_thread.join(timeout=5.0)

# Global database writer instance
db_writer = None

def init_database_writer(db_path):
    """Initialize the global database writer"""
    global db_writer
    if db_writer is None:
        db_writer = DatabaseWriter(db_path)
    return db_writer

def update_translated_sentences_safe(db_path, book_id, translations):
    """Thread-safe database update using queued writer"""
    global db_writer
    if db_writer is None:
        db_writer = init_database_writer(db_path)
    
    return db_writer.update_translations(book_id, translations)


def decode_nissaya(content, script_lang = "IAST"):
    """Parse the nissaya content from the specified format"""
    if not content:
        return ""
        
    parsed_output = []
    output = []
    
    lines = content.split('\n') if content else []
    
    for line in lines:
        nissaya_tags = re.findall(r'\{\{nissaya\|(.*?)\}\}', line)
        
        for tag in nissaya_tags:
            try:
                decoded_bytes = base64.b64decode(tag)
                decoded_str = decoded_bytes.decode('utf-8')
                nissaya_data = json.loads(decoded_str)
                
                if 'pali' in nissaya_data and 'meaning' in nissaya_data:
                    if 'lang' in nissaya_data and nissaya_data['lang'] == 'my':
                        converted = transliterate.process("Burmese", "Sinhala", nissaya_data['pali'])
                    elif 'lang' in nissaya_data and (nissaya_data['lang'] == 'ro' or nissaya_data['lang'] == 'en' or nissaya_data['lang'] == 'vi'):
                        converted = transliterate.process('IAST', 'Sinhala', nissaya_data['pali'], post_options=['SinhalaPali'])
                        
                    if script_lang != "Sinhala":
                        converted = transliterate.process('Sinhala', script_lang,  converted, pre_options=['SinhalaPali'])
                    
                    parsed_output.append(f"{converted}={nissaya_data['meaning']}")
                    output.append([converted, nissaya_data['meaning']])
            
            except Exception as e:
                print(f"Error parsing nissaya tag: {tag} \n- {str(e)}")
    
    return output

def nissaya_to_text(content):
    words = decode_nissaya(content)

    output_str = ''
    for word in words:
        output_str += f'{word[0]}: {word[1]}\n'
    return output_str

def get_postgres_conn():
    return psycopg2.connect('postgresql://postgres:postgres@localhost:5432/wikipali')

def get_nissaya(book_id, para_id):
    try:
        conn = get_postgres_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT book, paragraph, word_start, word_end, content, channel."name" 
            FROM public.sentence_translation
            left join channel on channel.id = sentence_translation.channel_id
            where channel.type='nissaya' and channel."language"='my'
                and book=%s and paragraph=%s
            ORDER BY word_start
        """, (book_id, para_id))
        rows = cur.fetchall()
        contents = [row[4] for row in rows if row[4]]
        decoded_contents = [nissaya_to_text(c) for c in contents]
        decoded_para = '\n'.join(decoded_contents)
        conn.close()
        return decoded_para
    except Exception as e:
        print(f"Error getting nissaya for {book_id}:{para_id}: {e}")
        return ""


class TimeoutError(Exception):
    pass

def generate_timeout(question, timeout=60*3):
    """Generate with proper timeout handling using thread-based approach"""
    # print(colored(f"  DEBUG: Starting API call at {datetime.now().strftime('%H:%M:%S')}", 'light_grey'))

    api_keys = re.split("\n+", os.getenv("GEMINI_API_KEYS", '')) if os.getenv("GEMINI_API_KEYS") else []
    api_keys = [key.strip() for key in api_keys if key.strip()]
    api_keys = [key for key in api_keys if key[0] != '#']
    if not api_keys:
        print("Error: GOOGLE_API_KEY environment variable is not set.")
        
        try:
            # Execute the command, piping the password to sudo
            process = subprocess.run(
                'sudo -S pm-suspend',
                shell=True,
                input=f"totden\n",
                text=True,
                capture_output=True
            )
            print("Shutdown command executed successfully.")
        except subprocess.CalledProcessError as e:
            print(f"Error executing shutdown: {e.stderr}")

        os._exit(0)
    selected_key = random.choice(api_keys)
    client = genai.Client(api_key=selected_key)
    model = os.getenv('GEMINI_MODEL', '').strip() if os.getenv('GEMINI_MODEL') else 'gemini-2.5-flash'

    GEMINI_SAFE_SETTINGS = [
        types.SafetySetting(category=types.HarmCategory.HARM_CATEGORY_HARASSMENT, threshold=types.HarmBlockThreshold.BLOCK_NONE),
        types.SafetySetting(category=types.HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold=types.HarmBlockThreshold.BLOCK_NONE),
        types.SafetySetting(category=types.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold=types.HarmBlockThreshold.BLOCK_NONE),
        types.SafetySetting(category=types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold=types.HarmBlockThreshold.BLOCK_NONE),
        types.SafetySetting(category=types.HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY, threshold=types.HarmBlockThreshold.BLOCK_NONE),
    ]

    contents = [types.Content(role="user", parts=[types.Part.from_text(text=question)])]
    generate_content_config = types.GenerateContentConfig(
        response_mime_type="text/plain",
        safety_settings=GEMINI_SAFE_SETTINGS,
        system_instruction=[types.Part.from_text(text=open(prompt_file, encoding="utf-8").read())],
        thinking_config=genai.types.ThinkingConfig(thinking_budget=1024),
        temperature=0.5, top_p=0.95, top_k=30
    )

    def call_api():
        """Make API call and return result"""
        # print(colored(f"  DEBUG: Starting streaming at {datetime.now().strftime('%H:%M:%S')}", 'light_grey'))
        output = ""
        chunk_count = 0
        last_activity = time.time()
        
        try:
            for chunk in client.models.generate_content_stream(model=model, contents=contents, config=generate_content_config):
                chunk_count += 1
                last_activity = time.time()  # Update activity timestamp
                
                if chunk_count % 10 == 0:  # Log every 10 chunks
                    # print(colored(f"  DEBUG: Received {chunk_count} chunks", 'light_grey'))
                    pass
                output += chunk.text or ''
                
        except Exception as e:
            print(colored(f"Streaming error after {chunk_count} chunks: {str(e)}", 'magenta'))
            raise e
        
        # print(colored(f"  DEBUG: Streaming completed with {chunk_count} chunks, output length: {len(output)}", 'light_grey'))
        return output

    # Use a queue to get the result from the thread
    result_queue = queue.Queue()
    exception_queue = queue.Queue()
    
    def api_thread():
        try:
            result = call_api()
            result_queue.put(result)
        except Exception as e:
            exception_queue.put(e)
    
    # Start the API call in a separate thread
    # print(colored(f"  DEBUG: Starting API thread at {datetime.now().strftime('%H:%M:%S')}", 'light_grey'))
    thread = threading.Thread(target=api_thread)
    thread.daemon = True  # Dies when main thread dies
    thread.start()
    
    # Wait for result with timeout
    # print(colored(f"  DEBUG: Waiting for result with {timeout}s timeout at {datetime.now().strftime('%H:%M:%S')}", 'light_grey'))
    
    try:
        # Check for result every second to allow for early termination
        for i in range(timeout):
            if not result_queue.empty():
                result = result_queue.get_nowait()
                # print(colored(f"  DEBUG: API call completed at {datetime.now().strftime('%H:%M:%S')}", 'light_grey'))
                return result
            
            if not exception_queue.empty():
                exception = exception_queue.get_nowait()
                print(colored(f"API call failed at {datetime.now().strftime('%H:%M:%S')}", 'magenta'))
                if '429 RESOURCE_EXHAUSTED' in str(exception):
                    api_keys.remove(selected_key)
                    os.environ["GEMINI_API_KEYS"] = "\n".join(api_keys)
                    print(colored(f"Error 429: Quota exceeded for API key. Removing key: {selected_key}", 'red'))
                    if not api_keys:  # Try again with another key if available
                        print(colored("Error: No valid API keys remaining.", 'red'))
                        sys.exit(1)
                else:
                    raise exception
            
            time.sleep(1)
        
        # If we get here, we've timed out
        # print(colored(f"  DEBUG: API call timed out after {timeout} seconds at {datetime.now().strftime('%H:%M:%S')}", 'light_grey'))
        # Thread will continue running but we abandon it
        raise TimeoutError(f"API call timed out after {timeout} seconds")
        
    except Exception as e:
        print(colored(f"Exception in timeout handler: {str(e)}", 'magenta'))
        raise e

def get_untranslated_sentences(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT book_id, para_id, line_id, pali_sentence FROM sentences WHERE vietnamese_translation = '' OR vietnamese_translation IS NULL ORDER BY book_id, para_id, line_id")
    rows = cursor.fetchall()
    conn.close()
    return rows

def get_book_ref(db_path, book_id):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT ref_id FROM books WHERE book_id=?", (book_id,))
    book_ref = cursor.fetchone()[0]
    conn.close()
    return book_ref

def chunk_sentences(sentences, max_chunk_size=1500):  # Reduced chunk size
    chunks = []
    current_chunk = []
    current_size = 0
    current_book_id = None
    chunk_id = 1

    for book_id, para_id, line_id, pali_sentence in sentences:
        sentence_size = len(pali_sentence)
        if current_book_id != book_id or current_size + sentence_size > max_chunk_size:
            if current_chunk:
                chunks.append((chunk_id, current_book_id, current_chunk))
                chunk_id += 1
            current_chunk = []
            current_size = 0
            current_book_id = book_id
        current_chunk.append((para_id, line_id, pali_sentence))
        current_size += sentence_size

    if current_chunk:
        chunks.append((chunk_id, current_book_id, current_chunk))

    return chunks

def create_xml_chunk(chunk_id, sentences_chunk, book_id, book_ref):
    chunk = ET.Element("chunk", {"id": str(chunk_id), "book": book_id, "expected_para_count": str(len(sentences_chunk))})

    nissaya_content = ''
    for para_id, line_id, pali_sentence in sentences_chunk:
        nissaya = get_nissaya(book_ref, para_id)
        if len(nissaya) > 5:
            nissaya_content += f'\nNissaya content for paragraph {para_id}, line {line_id} is:\n'
            nissaya_content += nissaya

        para = ET.SubElement(chunk, "para", {"id": str(para_id), "line_id": str(line_id)})
        para.text = pali_sentence

    xml_content = ET.tostring(chunk, encoding='unicode')
    
    # Add explicit instruction about maintaining para count
    instruction = f"\n\nIMPORTANT: The input XML contains exactly {len(sentences_chunk)} <para> elements. Your output XML must contain exactly {len(sentences_chunk)} <para> elements with the same id and line_id attributes. Do not combine, skip, or add any paragraphs.\n\n"
    
    return xml_content + instruction + nissaya_content



def process_chunk_with_retry(chunk_tuple, book_id, book_ref, total_chunks, max_retries=0):  # Increased retries
    """Process a single chunk with retry logic"""
    chunk_id, _, sentences_chunk = chunk_tuple
    thread_id = threading.current_thread().ident
    
    for attempt in range(max_retries + 1):
        try:
            if attempt > 0:
                # print(colored(f"  DEBUG: Thread {thread_id} retry {attempt}/{max_retries} for chunk {chunk_id}", 'light_grey'))
                pass
            
            # print(colored(f"  DEBUG: Thread {thread_id} starting chunk {chunk_id}/{total_chunks} at {datetime.now().strftime('%H:%M:%S')}", 'light_grey'))
            print(colored(f"[{datetime.now().strftime('%H:%M:%S')}] Translating chunk {chunk_id}/{total_chunks} for book {book_id}...", 'cyan'))
            
            user_prompt = create_xml_chunk(chunk_id, sentences_chunk, book_id, book_ref)
            # print(colored(f"  DEBUG: Thread {thread_id} calling generate_timeout for chunk {chunk_id}", 'light_grey'))
            
            # Use shorter timeout for retries
            timeout = 180 if attempt == 0 else 120
            response = generate_timeout(user_prompt, timeout=timeout)
            
            # print(colored(f"  DEBUG: Thread {thread_id} got response for chunk {chunk_id}, length: {len(response) if response else 0}", 'light_grey'))
            
            # Check if response is None or empty
            if not response or not response.strip():
                if attempt < max_retries:
                    # print(colored(f"  DEBUG: Thread {thread_id} got empty response for chunk {chunk_id}, retrying...", 'light_grey'))
                    time.sleep(5)  # Wait before retry
                    continue
                else:
                    # print(colored(f"  DEBUG: Thread {thread_id} got empty response for chunk {chunk_id} after all retries", 'light_grey'))
                    return []
            
            # Log the raw response for debugging mismatches
            if attempt == 0:  # Only log on first attempt to avoid spam
                with open(f'debug_responses/{book_id}.log', 'a', encoding='utf-8') as f:
                    f.write(f"\n=== CHUNK {chunk_id} (Expected: {len(sentences_chunk)}) ===\n")
                    f.write(f"Raw response length: {len(response)}\n")
                    f.write(f"Response preview: {response[:500]}...\n")
            
            # print(colored(f"  DEBUG: Thread {thread_id} parsing XML for chunk {chunk_id}", 'light_grey'))
            
            try:
                translated_root = ET.fromstring(response)
            except ET.ParseError:
                # Try to extract XML from response if it's wrapped in other text
                xml_match = re.search(r'<chunk.*?</chunk>', response, re.DOTALL)
                if xml_match:
                    # print(colored(f"  DEBUG: Extracted XML from wrapped response for chunk {chunk_id}", 'light_grey'))
                    translated_root = ET.fromstring(xml_match.group(0))
                else:
                    raise
            
            translated_paras = translated_root.findall(".//para")
            
            # print(colored(f"  DEBUG: Thread {thread_id} found {len(translated_paras)} translated paras for chunk {chunk_id} (expected {len(sentences_chunk)})", 'light_grey'))
            
            # If counts don't match, retry
            if len(translated_paras) != len(sentences_chunk):
                if attempt < max_retries:
                    print(colored(f"Thread {thread_id} mismatch for chunk {chunk_id}: expected {len(sentences_chunk)}, got {len(translated_paras)}, retrying...", 'red'))
                    
                    # Log the mismatch for debugging
                    with open('mismatch_debug.log', 'a', encoding='utf-8') as f:
                        f.write(f"\n=== MISMATCH CHUNK {chunk_id} ATTEMPT {attempt+1} ===\n")
                        f.write(f"Expected: {len(sentences_chunk)}, Got: {len(translated_paras)}\n")
                        f.write(f"Book: {book_id}\n")
                        f.write(f"Response length: {len(response)}\n")
                        f.write(f"Response start: {response[:200]}...\n")
                        f.write(f"Response end: ...{response[-200:]}\n")
                        f.write("Original para IDs: " + str([f"{p}:{l}" for p, l, _ in sentences_chunk]) + "\n")
                        f.write("Translated para IDs: " + str([f"{p.get('id')}:{p.get('line_id')}" for p in translated_paras]) + "\n")
                    
                    time.sleep(5)  # Wait before retry
                    continue
                else:
                    print(colored(f"Thread {thread_id} mismatch for chunk {chunk_id}: expected {len(sentences_chunk)}, got {len(translated_paras)} after all retries", 'red'))
                    return []
            
            # Normal case - counts match
            # print(colored(f"  DEBUG: Thread {thread_id} creating translations list for chunk {chunk_id}", 'light_grey'))
            translations = []
            for (para_id, line_id, pali_sentence), trans_para in zip(sentences_chunk, translated_paras):
                translation_text = trans_para.text if trans_para.text is not None else ""
                translations.append(((para_id, line_id, pali_sentence), translation_text))
            
            # print(colored(f"  DEBUG: Thread {thread_id} updating database for chunk {chunk_id}", 'light_grey'))
            db_path = 'translations.db'
            if update_translated_sentences_safe(db_path, book_id, translations):
                print(colored(f"[{datetime.now().strftime('%H:%M:%S')}] Translated and saved chunk {chunk_id} with length: {len(response)} from para: {translations[0][0][0]}.", 'green'))
                # print(colored(f"  DEBUG: Thread {thread_id} successfully completed chunk {chunk_id}", 'light_grey'))
                return translations
            else:
                if attempt < max_retries:
                    # print(colored(f"  DEBUG: Thread {thread_id} failed to save chunk {chunk_id}, retrying...", 'light_grey'))
                    time.sleep(5)  # Wait before retry
                    continue
                else:
                    print(colored(f"Thread {thread_id} failed to save chunk {chunk_id} after all retries", 'light_grey'))
                    return []
        
        except (TimeoutError, concurrent.futures.TimeoutError) as e:
            if attempt < max_retries:
                # print(colored(f"  DEBUG: Thread {thread_id} timeout for chunk {chunk_id}, retrying... ({str(e)})", 'light_grey'))
                time.sleep(10)  # Wait longer before retry after timeout
                continue
            else:
                print(colored(f"  DEBUG: Thread {thread_id} timeout for chunk {chunk_id} after all retries ({str(e)})", 'light_grey'))
                with open('timeout_errors.log', 'a') as f:
                    f.write(f"Thread {thread_id} {book_id}: chunk {chunk_id} - TIMEOUT after {max_retries} retries\n")
                return []
                
        except ET.ParseError as e:
            if attempt < max_retries:
                # print(colored(f"  DEBUG: Thread {thread_id} XML parsing error for chunk {chunk_id}, retrying... ({str(e)})", 'light_grey'))
                time.sleep(5)  # Wait before retry
                continue
            else:
                # print(colored(f"  DEBUG: Thread {thread_id} XML parsing error for chunk {chunk_id} after all retries: {str(e)}", 'light_grey'))
                with open('xml_errors.log', 'a', encoding='utf-8') as f:
                    f.write(f"Thread {thread_id} Chunk {chunk_id}: {str(e)} (after {max_retries} retries)\n")
                    f.write(f"Response: {response[:500] if 'response' in locals() else 'No response'}\n")
                    f.write("="*50 + "\n")
                return []
                
        except Exception as e:
            if attempt < max_retries:
                print(f"Thread {thread_id} general error for chunk {chunk_id}, retrying... ({str(e)})")
                time.sleep(5)  # Wait before retry
                continue
            else:
                # print(colored(f"  DEBUG: Thread {thread_id} general error for chunk {chunk_id} after all retries: {str(e)}", 'light_grey'))
                with open('error_trans.log', 'a') as f:
                    f.write(f"Thread {thread_id} {book_id}: chunk {chunk_id} - {str(e)} (after {max_retries} retries)\n")
                return []
    
    # print(colored(f"  DEBUG: Thread {thread_id} exiting chunk {chunk_id} at {datetime.now().strftime('%H:%M:%S')}", 'light_grey'))
    return []


def main():

    db_path = 'translations.db'
    if not os.path.exists(db_path):
        print(f"Error: '{db_path}' does not exist")
        sys.exit(1)

    # Initialize database writer BEFORE starting threads
    init_database_writer(db_path)
    print("Database writer initialized")


    sentences = get_untranslated_sentences(db_path)
    if not sentences:
        print("No untranslated sentences found.")
        return
    else:
        print(f"There are", colored(str(len(sentences)), 'green'), "sentences that haven't been translated yet")

    books = defaultdict(list)
    for row in sentences:
        book_id = row[0]
        books[book_id].append(row)

    for book_id in sorted(books.keys()):
        # if book_id in ['e0301n.nrf', 'e0601n.nrf', ]:
        #     continue
        # if not re.match(r'vin.*', book_id, re.I):
        #     continue

        book_ref = get_book_ref(db_path, book_id)
        book_sentences = books[book_id]
        # if len(book_sentences) < 100:
        #     print(f'book {book_id} contains only {len(book_sentences)}. I will do it later...')
        #     continue
        print(f"Processing book", colored(book_id, 'green'), "with", colored(str(len(book_sentences)), 'green'), "sentences")
        chunks = chunk_sentences(book_sentences)
        
        # Parallel processing of chunks
        max_workers = min(len(chunks), NUM_THREADS)
        # print(colored(f"  DEBUG: Starting ThreadPoolExecutor with {max_workers} workers for {len(chunks)} chunks", 'light_grey'))
        
        
        # Parallel processing of chunks
        max_workers = min(len(chunks), NUM_THREADS)
        # print(colored(f"  DEBUG: Starting ThreadPoolExecutor with {max_workers} workers for {len(chunks)} chunks", 'light_grey'))

        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            # print(colored(f"  DEBUG: Submitting {len(chunks)} futures at {datetime.now().strftime('%H:%M:%S')}", 'light_grey'))
            
            # Submit all futures
            futures = []
            for chunk_tuple in chunks:
                future = executor.submit(process_chunk_with_retry, chunk_tuple, book_id, book_ref, len(chunks))
                futures.append(future)
            
            # print(colored(f"  DEBUG: All {len(futures)} futures submitted, waiting for completion...", 'light_grey'))
            
            # Track completed futures with a more aggressive timeout
            completed_count = 0
            start_time = time.time()
            max_wait_time = 1800  # 30 minutes total
            individual_timeout = 300  # 5 minutes per check
            
            try:
                while completed_count < len(futures):
                    # Wait for any future to complete
                    try:
                        done, not_done = concurrent.futures.wait(
                            futures, 
                            timeout=individual_timeout, 
                            return_when=concurrent.futures.FIRST_COMPLETED
                        )
                        
                        # Process completed futures
                        for future in done:
                            if future not in completed_futures if 'completed_futures' in locals() else set():
                                completed_count += 1
                                if 'completed_futures' not in locals():
                                    completed_futures = set()
                                completed_futures.add(future)
                                
                                elapsed = time.time() - start_time
                                # print(colored(f"  DEBUG: Completed future - {completed_count}/{len(futures)} (elapsed: {elapsed:.1f}s)", 'light_grey'))
                                
                                try:
                                    result = future.result(timeout=1)
                                except Exception as e:
                                    print(colored(f"Future had exception: {e}", 'magenta'))
                        
                        # Check if we should give up
                        elapsed = time.time() - start_time
                        if elapsed > max_wait_time:
                            # print(colored(f"  DEBUG: Giving up after {max_wait_time} seconds", 'light_grey'))
                            # Cancel remaining futures
                            for future in not_done:
                                cancelled = future.cancel()
                                # print(colored(f"  DEBUG: Cancelled future: {cancelled}", 'light_grey'))
                            break
                        
                        # If all are done, break
                        if not not_done:
                            break
                            
                    except concurrent.futures.TimeoutError:
                        elapsed = time.time() - start_time
                        remaining = len(futures) - completed_count
                        # print(colored(f"  DEBUG: Individual timeout after {individual_timeout}s. Remaining: {remaining}, Elapsed: {elapsed:.1f}s", 'light_grey'))
                        
                        if elapsed > max_wait_time:
                            # print(colored(f"  DEBUG: Total timeout reached, cancelling remaining futures", 'light_grey'))
                            for future in futures:
                                if future.done():
                                    continue
                                cancelled = future.cancel()
                                # print(colored(f"  DEBUG: Cancelled remaining future: {cancelled}", 'light_grey'))
                            break
                            
            except KeyboardInterrupt:
                # print("  DEBUG: KeyboardInterrupt received, cancelling futures...")
                for future in futures:
                    if not future.done():
                        cancelled = future.cancel()
                        # print(colored(f"  DEBUG: Cancelled future on interrupt: {cancelled}", 'light_grey'))
                raise
            
            # print(colored(f"  DEBUG: Completed {completed_count}/{len(futures)} futures", 'light_grey'))

        print(colored(f"Finished processing book {book_id}", 'green'))
    
    # At the end of main(), stop the database writer
    global db_writer
    if db_writer:
        print("Stopping database writer...")
        db_writer.stop()
        print("Database writer stopped")

    print("Translation process completed.")

if __name__ == '__main__':
    main()
