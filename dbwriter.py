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
                for (para_id, line_id, pali_sentence), translation_sentence in translations:
                    f.write(f"{book_id}\t{para_id}\t{line_id}\t{pali_sentence}\t{translation_sentence}\n")
                f.write("-------------------------------------------------------\n")
            
            # Update database in a transaction
            cursor.execute("BEGIN TRANSACTION")
            for (para_id, line_id, _), translation_sentence in translations:
                cursor.execute(
                    "UPDATE sentences SET translation_sentence = ? WHERE book_id = ? AND para_id = ? AND line_id = ?",
                    (translation_sentence, book_id, para_id, line_id)
                )
            cursor.execute("COMMIT")
            
            # Log successful update
            thread_id = threading.current_thread().ident
            print(f"DEBUG: Database writer updated {len(translations)} sentences for book {book_id}")
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
            return True
            
        result_queue = queue.Queue()
        task = (book_id, translations, result_queue)
        
        try:
            self.queue.put(task, timeout=5.0)  # 5 second timeout to queue
            return result_queue.get(timeout=timeout)  # Wait for result
        except queue.Full:
            print("Database queue is full, skipping update")
            return False
        except queue.Empty:
            print(f"Database update timed out after {timeout} seconds")
            return False
    
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

# Add this to your main() function at the start:
def main():
    db_path = 'translations.db'
    if not os.path.exists(db_path):
        print(f"Error: '{db_path}' does not exist")
        sys.exit(1)

    # Initialize database writer BEFORE starting threads
    init_database_writer(db_path)
    print("Database writer initialized")

    # ... rest of your existing main() code ...
    
    # At the end of main(), stop the database writer
    global db_writer
    if db_writer:
        print("Stopping database writer...")
        db_writer.stop()
        print("Database writer stopped")