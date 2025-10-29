# scripts:
### compare_tmp.py
Read from markdown folder, split into lines. Then compare with database. If any lines in db is different, remove the translation and update the pali line.

### convert2db.py
Read from xml_chunks and translation folder. Create database based on the data translated.

### translate.py
Use gemini api to translate un-translated sentences from db. Based on books.



# Notes
### coppy frequency table from tpr.
sqlite3 ~/.var/app/org.americanmonk.TipitakaPaliReader/data/tipitaka_pali_reader/tipitaka_pali.db ".dump words" | sqlite3 translations.db

### backup db
sqlite3 translations.db "SELECT * FROM sentences;" > sentences_data.sql && \
sqlite3 translations.db "SELECT * FROM headings;" > headings_data.sql && \
tar -czf backup/backup_$(date +%Y%m%d_%H%M%S).tar.gz sentences_data.sql headings_data.sql && \
rm sentences_data.sql headings_data.sql