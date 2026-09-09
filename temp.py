import sqlite3
from pprint import pprint

# Generated from tipitaka_pali.db — do not edit manually
book_id_mapping = {
    "mula_vi_01": ("vin01m.mul", 1, 381), # pārājikapāḷi
    "mula_vi_02": ("vin02m1.mul", 1, 470), # pācittiyapāḷi
    "mula_vi_03": ("vin02m2.mul", 1, 511), # mahāvaggapāḷi
    "mula_vi_04": ("vin02m3.mul", 1, 508), # cūḷavaggapāḷi
    "mula_vi_05": ("vin02m4.mul", 1, 390), # parivārapāḷi
    "mula_di_01": ("s0101m.mul", 1, 236), # sīlakkhandhavaggapāḷi
    "mula_di_02": ("s0102m.mul", 1, 283), # mahāvaggapāḷi
    "mula_di_03": ("s0103m.mul", 1, 260), # pāthikavaggapāḷi
    "mula_ma_01": ("s0201m.mul", 1, 415), # mūlapaṇṇāsapāḷi
    "mula_ma_02": ("s0202m.mul", 1, 439), # majjhimapaṇṇāsapāḷi
    "mula_ma_03": ("s0203m.mul", 1, 352), # uparipaṇṇāsapāḷi
    "mula_sa_01": ("s0301m.mul", 1, 242), # sagāthāvaggasaṃyuttapāḷi
    "mula_sa_02": ("s0302m.mul", 243, 472), # nidānavaggasaṃyuttapāḷi
    "mula_sa_03": ("s0303m.mul", 1, 235), # khandhavaggasaṃyuttapāḷi
    "mula_sa_04": ("s0304m.mul", 236, 567), # saḷāyatanavaggasaṃyuttapāḷi
    "mula_sa_05": ("s0305m.mul", 1, 415), # mahāvaggasaṃyuttapāḷi
    "mula_an_01": ("s0401m.mul", 1, 48), # ekakanipātapāḷi
    "mula_an_02": ("s0402m1.mul", 49, 98), # dukanipātapāḷi
    "mula_an_03": ("s0402m2.mul", 99, 305), # tikanipātapāḷi
    "mula_an_04": ("s0402m3.mul", 307, 580), # catukkanipātapāḷi
    "mula_an_05": ("s0403m1.mul", 1, 246), # pañcakanipātapāḷi
    "mula_an_06": ("s0403m2.mul", 247, 393), # chakkanipātapāḷi
    "mula_an_07": ("s0403m3.mul", 395, 513), # sattakanipātapāḷi
    "mula_an_08": ("s0404m1.mul", 1, 162), # aṭṭhakanipātapāḷi
    "mula_an_09": ("s0404m2.mul", 163, 256), # navakanipātapāḷi
    "mula_an_10": ("s0404m3.mul", 257, 513), # dasakanipātapāḷi
    "mula_an_11": ("s0404m4.mul", 515, 558), # ekādasakanipātapāḷi
    "mula_ku_01": ("s0501m.mul", 1, 11), # khuddakapāṭhapāḷi
    "mula_ku_02": ("s0502m.mul", 13, 76), # dhammapadapāḷi
    "mula_ku_03": ("s0503m.mul", 77, 193), # udānapāḷi
    "mula_ku_04": ("s0504m.mul", 195, 277), # itivuttakapāḷi
    "mula_ku_05": ("s0505m.mul", 279, 455), # suttanipātapāḷi
    "mula_ku_06": ("s0506m.mul", 1, 125), # vimānavatthupāḷi
    "mula_ku_07": ("s0507m.mul", 127, 218), # petavatthupāḷi
    "mula_ku_08": ("s0508m.mul", 219, 375), # theragāthāpāḷi
    "mula_ku_09": ("s0509m.mul", 377, 435), # therīgāthāpāḷi
    "mula_ku_10": ("s0510m1.mul", 1, 445), # apadānapāḷi (pa)
    "mula_ku_11": ("s0510m2.mul", 1, 298), # apadānapāḷi (du)
    "mula_ku_12": ("s0511m.mul", 299, 384), # buddhavaṃsapāḷi
    "mula_ku_13": ("s0512m.mul", 385, 420), # cariyāpiṭakapāḷi
    "mula_ku_14": ("s0513m.mul", 1, 400), # jātakapāḷi (pa)
    "mula_ku_15": ("s0514m.mul", 1, 378), # jātakapāḷi (du)
    "mula_ku_16": ("s0515m.mul", 1, 410), # mahāniddesapāḷi
    "mula_ku_17": ("s0516m.mul", 1, 307), # cūḷaniddesapāḷi
    "mula_ku_18": ("s0517m.mul", 1, 419), # paṭisambhidāmaggapāḷi
    "mula_ku_19": ("s0518m.nrf", 1, 408), # milindapañhapāḷi
    "mula_ku_20": ("s0519m.mul", 1, 166), # nettippakaraṇapāḷi
    "mula_ku_21": ("s0520m.nrf", 167, 341), # peṭakopadesapāḷi
    "mula_bi_01": ("abh01m.mul", 1, 298), # dhammasaṅgaṇīpāḷi
    "mula_bi_02": ("abh02m.mul", 1, 453), # vibhaṅgapāḷi
    "mula_bi_03": ("abh03m1.mul", 1, 100), # dhātukathāpāḷi
    "mula_bi_04": ("abh03m2.mul", 101, 185), # puggalapaññattipāḷi
    "mula_bi_05": ("abh03m3.mul", 1, 454), # kathāvatthupāḷi
    "mula_bi_06_01": ("abh03m4.mul", 1, 265), # yamakapāḷi (pa)
    "mula_bi_06_02": ("abh03m5.mul", 1, 316), # yamakapāḷi (du)
    "mula_bi_06_03": ("abh03m6.mul", 1, 330), # yamakapāḷi (ta)
    "mula_bi_07_01": ("abh03m7.mul", 1, 464), # paṭṭhānapāḷi (pa)
    "mula_bi_07_02": ("abh03m8.mul", 1, 493), # paṭṭhānapāḷi (du)
    "mula_bi_07_03": ("abh03m9.mul", 1, 605), # paṭṭhānapāḷi (ta)
    "mula_bi_07_04": ("abh03m10.mul", 1, 636), # paṭṭhānapāḷi (ca)
    "mula_bi_07_05": ("abh03m11.mul", 1, 442), # paṭṭhānapāḷi (pañca)
    "attha_vi_01_01": ("vin01a.att", 1, 345), # pārājikakaṇḍaaṭṭhakathā (pa)
    "attha_vi_01_02": ("vin01a.att", 1, 312), # pārājikakaṇḍaaṭṭhakathā (du)
    "attha_vi_02": ("vin02a1.att", 1, 231), # pācittiyaaṭṭhakathā
    "attha_vi_03": ("vin02a2.att", 233, 437), # mahāvaggaaṭṭhakathā
    "attha_vi_04": ("vin02a3.att", 1, 136), # cūḷavaggaaṭṭhakathā
    "attha_vi_05": ("vin02a4.att", 137, 265), # parivāraaṭṭhakathā
    "attha_di_01": ("s0101a.att", 1, 338), # sīlakkhandhavaggaṭṭhakathā
    "attha_di_02": ("s0102a.att", 1, 403), # mahāvaggaṭṭhakathā
    "attha_di_03": ("s0103a.att", 1, 251), # pāthikavaggaṭṭhakathā
    "attha_ma_01_01": ("s0201a.att", 1, 398), # mūlapaṇṇāsaaṭṭhakathā (pa)
    "attha_ma_01_02": ("s0201a.att", 1, 320), # mūlapaṇṇāsaaṭṭhakathā (du)
    "attha_ma_02": ("s0202a.att", 1, 309), # majjhimapaṇṇāsaaṭṭhakathā
    "attha_ma_03": ("s0203a.att", 1, 254), # uparipaṇṇāsaaṭṭhakathā
    "attha_sa_01": ("s0301a.att", 1, 325), # sagāthāvaggaaṭṭhakathā
    "attha_sa_02": ("s0302a.att", 1, 227), # nidānavaggaaṭṭhakathā
    "attha_sa_03": ("s0303a.att", 229, 324), # khandhavaggaaṭṭhakathā
    "attha_sa_04": ("s0304a.att", 1, 152), # saḷāyatanavaggaaṭṭhakathā
    "attha_sa_05": ("s0305a.att", 153, 341), # mahāvaggaaṭṭhakathā
    "attha_an_01": ("s0401a.att", 1, 416), # ekakanipātaaṭṭhakathā
    "attha_an_02": ("s0402a.att", 1, 397), # dukādinipātaaṭṭhakathā
    "attha_an_03": ("s0403a.att", 1, 191), # pañcakādinipātaaṭṭhakathā
    "attha_an_04": ("s0404a.att", 193, 357), # aṭṭhakādinipātaaṭṭhakathā
    "attha_ku_01": ("s0501a.att", 1, 216), # khuddakapāṭhaaṭṭhakathā
    "attha_ku_02_01": ("s0502a.att", 1, 447), # dhammapadaaṭṭhakathā (pa)
    "attha_ku_02_02": ("s0502a.att", 1, 456), # dhammapadaaṭṭhakathā (du)
    "attha_ku_03": ("s0503a.att", 1, 393), # udānaaṭṭhakathā
    "attha_ku_04": ("s0504a.att", 1, 355), # itivuttakaaṭṭhakathā
    "attha_ku_05_01": ("s0505a.att", 1, 314), # suttanipātaaṭṭhakathā (pa)
    "attha_ku_05_02": ("s0505a.att", 1, 324), # suttanipātaaṭṭhakathā (du)
    "attha_ku_06": ("s0506a.att", 1, 335), # vimānavatthuaṭṭhakathā
    "attha_ku_07": ("s0507a.att", 1, 270), # petavatthuaṭṭhakathā
    "attha_ku_08_01": ("s0508a1.att", 1, 485), # theragāthāaṭṭhakathā (pa)
    "attha_ku_08_02": ("s0508a2.att", 1, 546), # theragāthāaṭṭhakathā (du)
    "attha_ku_09": ("s0509a.att", 1, 305), # therīgāthāaṭṭhakathā
    "attha_ku_10": ("s0510a.att", 1, 352), # apadānaaṭṭhakathā (pa)
    "attha_ku_11": ("s0510a.att", 1, 303), # apadānaaṭṭhakathā (du)
    "attha_ku_12": ("s0511a.att", 1, 354), # buddhavaṃsaaṭṭhakathā
    "attha_ku_13": ("s0512a.att", 1, 328), # cariyāpiṭakaaṭṭhakathā
    "attha_ku_16": ("s0515a.att", 1, 419), # mahāniddesaaṭṭhakathā
    "attha_ku_17": ("s0516a.att", 1, 140), # cūḷaniddesaaṭṭhakathā
    "attha_ku_18_01": ("s0517a.att", 1, 345), # paṭisambhidāmaggaaṭṭhakathā (pa)
    "attha_ku_18_02": ("s0517a.att", 1, 323), # paṭisambhidāmaggaaṭṭhakathā (du)
    "attha_ku_20": ("s0519a.att", 1, 276), # nettippakaraṇaaṭṭhakathā
    "attha_ku_zat_01": ("s0513a1.att", 1, 538), # jātakaaṭṭhakathā (pa)
    "attha_ku_zat_02": ("s0513a2.att", 1, 408), # jātakaaṭṭhakathā (du)
    "attha_ku_zat_03": ("s0513a3.att", 1, 517), # jātakaaṭṭhakathā (ta)
    "attha_ku_zat_04": ("s0513a4.att", 1, 504), # jātakaaṭṭhakathā (ca)
    "attha_ku_zat_05": ("s0514a1.att", 1, 553), # jātakaaṭṭhakathā (pañca)
    "attha_ku_zat_06": ("s0514a2.att", 1, 332), # jātakaaṭṭhakathā (cha)
    "attha_ku_zat_07": ("s0514a3.att", 1, 387), # jātakaaṭṭhakathā (satta)
    "attha_bi_01": ("abh01a.att", 1, 454), # dhammasaṅgaṇīaṭṭhakathā
    "attha_bi_02": ("abh02a.att", 1, 508), # vibhaṅgaaṭṭhakathā
    "attha_bi_03": ("abh03a.att", 1, 499), # pañcapakaraṇaaṭṭhakathā
    "tika_vi_01": ("vin01t1.tik", 1, 460), # sāratthadīpanīṭīkā (pa)
    "tika_vi_02": ("vin01t2.tik", 1, 448), # sāratthadīpanīṭīkā (du)
    "tika_vi_03": ("vin02t.tik", 1, 496), # sāratthadīpanīṭīkā (ta)
    "tika_vi_04": ("vin06t.nrf", 1, 585), # vajirabuddhiṭīkā
    "tika_vi_05": ("vin07t.nrf", 1, 362), # vimativinodanīṭīkā (pa)
    "tika_vi_06": ("vin07t.nrf", 1, 322), # vimativinodanīṭīkā (du)
    "tika_di_01_01": ("s0101t.tik", 1, 405), # sīlakkhandhavaggaṭīkā
    "tika_di_01_02": ("s0104t.nrf", 1, 500), # sīlakkhandhavaggaabhinavaṭīkā (pa)
    "tika_di_01_03": ("s0105t.nrf", 1, 437), # sīlakkhandhavaggaabhinavaṭīkā (du)
    "tika_di_02": ("s0102t.tik", 1, 358), # mahāvaggaṭīkā
    "tika_di_03": ("s0103t.tik", 1, 292), # pāthikavaggaṭīkā
    "tika_ma_01": ("s0201t.tik", 1, 394), # mūlapaṇṇāsaṭīkā (pa)
    "tika_ma_02": ("s0201t.tik", 1, 324), # mūlapaṇṇāsaṭīkā (du)
    "tika_ma_03": ("s0202t.tik", 1, 209), # majjhimapaṇṇāsaṭīkā
    "tika_ma_04": ("s0203t.tik", 211, 442), # uparipaṇṇāsaṭīkā
    "tika_sa_01": ("s0301t.tik", 1, 345), # sagāthāvaggaṭīkā
    "tika_sa_02": ("s0302t.tik", 1, 200), # nidānavaggaṭīkā
    "tika_sa_03": ("s0303t.tik", 201, 279), # khandhavaggaṭīkā
    "tika_sa_04": ("s0304t.tik", 281, 391), # saḷāyatanavaggaṭīkā
    "tika_sa_05": ("s0305t.tik", 393, 551), # mahāvaggaṭīkā
    "tika_an_01": ("s0401t.tik", 1, 288), # ekakanipātaṭīkā
    "tika_an_02": ("s0402t.tik", 1, 396), # dukādinipātaṭīkā
    "tika_an_03": ("s0403t.tik", 1, 202), # pañcakādinipātaṭīkā
    "tika_an_04": ("s0404t.tik", 203, 371), # aṭṭhakādinipātaṭīkā
    "tika_ku_20_01": ("s0519t.tik", 1, 151), # nettippakaraṇaṭīkā
    "tika_ku_20_02": ("s0501t.nrf", 1, 356), # nettivibhāvinī
    "tika_bi_01": ("abh01t.tik", 1, 203), # dhammasaṅgaṇīmūlaṭīkā
    "tika_bi_02_01": ("abh02t.tik", 1, 235), # vibhaṅgamūlaṭīkā (pa)
    "tika_bi_02_02": ("abh02t.tik", 1, 229), # vibhaṅgaanuṭīkā (du)
    "tika_bi_03": ("abh03t.tik", 1, 248), # pañcapakaraṇamūlaṭīkā
    "tika_bi_04": ("abh04t.nrf", 1, 220), # dhammasaṅgaṇīanuṭīkā
    "tika_bi_05": ("abh05t.nrf", 1, 323), # pañcapakaraṇaanuṭīkā
    "annya_vi_01": ("vin04t.nrf", 1, 357), # dvemātikā kaṅkhāvitaraṇī
    "annya_vi_02": ("vin05t.nrf", 1, 468), # vinayasaṅgahaaṭṭhakathā
    "annya_vi_03": ("vin10t.nrf", 1, 395), # vinayavinicchayo uttaravinicchayo
    "annya_vi_04": ("vin13t.nrf", 1, 498), # khuddasikkhā mūlasikkhā
    "annya_vi_07": ("vin08t.nrf", 1, 424), # vinayālaṅkāraṭīkā (pa)
    "annya_vi_08": ("vin08t.nrf", 1, 434), # vinayālaṅkāraṭīkā (du)
    "annya_vi_09": ("vin09t.nrf", 1, 489), # kaṅkhā purāṇa abhinava ṭīkā
    "annya_vi_10": ("vin11t.nrf", 1, 571), # vinayavinicchayaṭīkā (pa)
    "annya_vi_11": ("vin11t.nrf", 1, 530), # vinayavinicchayaṭīkā (du)
    "annya_vi_12": ("vin12t.nrf", 1, 655), # pācityādiyojanā
    "annya_bi_01": ("e0101n.mul", 1, 370), # visuddhimaggo (pa)
    "annya_bi_02": ("e0102n.mul", 1, 356), # visuddhimaggo (du)
    "annya_bi_03": ("e0103n.att", 1, 461), # visuddhimaggamahāṭīkā (pa)
    "annya_bi_04": ("e0104n.att", 1, 535), # visuddhimaggamahāṭīkā (du)
    "annya_bi_05": ("abh07t.nrf", 1, 68), # abhidhammatthasaṅgaho
    "annya_bi_06": ("abh07t.nrf", 69, 279), # abhidhammatthavibhāvinīṭīkā
    "annya_bi_07": ("e0301n.nrf", 1, 456), # paramatthadīpanī
    "annya_sadda_01": ("e0802n.nrf", 1, 315), # kaccāyanabyākaraṇaṃ
    "annya_sadda_02": ("e0805n.nrf", 1, 421), # padarūpasiddhi
    "annya_sadda_03": ("e0801n.nrf", 1, 292), # moggallānasuttapāṭho
    "annya_sadda_05": ("e0806n.nrf", 1, 286), # moggallānapañcikāṭīkā
    "annya_sadda_06": ("e0807n.nrf", 1, 304), # payogasiddhipāḷi
    "annya_sadda_07": ("e0803n.nrf", 1, 418), # saddanītippakaraṇaṃ (padamālā)
    "annya_sadda_08": ("e0804n.nrf", 1, 391), # saddanītippakaraṇaṃ (dhātumālā)
    "annya_sadda_09": ("e0804n.nrf", 1, 489), # saddanītippakaraṇaṃ (suttamālā)
    "annya_sadda_10": ("e0201n.nrf", 1, 563), # niruttidīpanīpāṭha
    "annya_sadda_11": ("e0809n.nrf", 1, 99), # abhidhānappadīpikā
    "annya_sadda_12": ("e0810n.nrf", 1, 621), # abhidhānappadīpikāṭīkā
    "annya_sadda_13": ("e0808n.nrf", 192, 201), # vuttodayaṃ
    "annya_sadda_14": ("e0811n.nrf", 156, 189), # subodhālaṅkāro
    "annya_sadda_15": ("e0812n.nrf", 1, 362), # subodhālaṅkāraṭīkā
    "annya_sadda_16": ("e0802n.nrf", 1, 16), # kaccāyanasāra
    "annya_sadda_17": ("e0802n.nrf", 1, 82), # saddatthabhedacintā
}

# Path to your database
DB_PATH = "/Users/totden/Library/Containers/org.americanmonk.tpp/Data/Documents/tipitaka_pali.db"

def generate_updated_mapping():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    updated_mapping = {}

    for book_id, (filename, old_first) in book_id_mapping.items():
        try:
            cursor.execute("""
                SELECT firstpage, lastpage, name
                FROM books
                WHERE id = ?
            """, (book_id,))
            
            row = cursor.fetchone()
            if row:
                firstpage, lastpage, name = row
                # Use the name from database if available, otherwise keep the comment
                comment_name = name if name else "unknown"
                updated_mapping[book_id] = (filename, firstpage, lastpage)
                print(f'    "{book_id}": ("{filename}", {firstpage}, {lastpage}), # {comment_name}')
            else:
                print(f'    "{book_id}": ("{filename}", ???, ???), # NOT FOUND IN DB')
                
        except Exception as e:
            print(f"Error for {book_id}: {e}")

    conn.close()
    return updated_mapping

# Run the generation
if __name__ == "__main__":
    print("# Generated from tipitaka_pali.db — do not edit manually")
    print("book_id_mapping = {")
    generate_updated_mapping()
    print("}")


exit()


import sqlite3
from pathlib import Path

# copy translation from previous version to new version of db.
def copy_translations(src_db: str, dst_db: str, batch_size: int = 10_000):
    print("Connecting to databases...", flush=True)
    src = sqlite3.connect(src_db)
    dst = sqlite3.connect(dst_db)

    dst.execute("PRAGMA journal_mode = WAL")
    dst.execute("PRAGMA synchronous = NORMAL")

    src.row_factory = sqlite3.Row
    src_cursor = src.cursor()
    dst_cursor = dst.cursor()

    print("Counting source rows...", flush=True)
    src_cursor.execute('''
        SELECT COUNT(*) FROM sentences
        WHERE english_translation IS NOT NULL OR vietnamese_translation IS NOT NULL
    ''')
    total_rows = src_cursor.fetchone()[0]
    print(f"Found {total_rows:,} rows to copy. Starting...", flush=True)

    src_cursor.execute('''
        SELECT english_translation, vietnamese_translation, book_id, para_id, line_id
        FROM sentences
        WHERE english_translation IS NOT NULL OR vietnamese_translation IS NOT NULL
    ''')

    print("Fetching first batch...", flush=True)
    total_updated = 0
    batch_num = 0

    while True:
        rows = src_cursor.fetchmany(batch_size)
        if not rows:
            break

        dst_cursor.executemany('''
            UPDATE sentences
            SET english_translation = ?, vietnamese_translation = ?
            WHERE book_id = ? AND para_id = ? AND line_id = ?
        ''', [
            (r['english_translation'], r['vietnamese_translation'],
             r['book_id'], r['para_id'], r['line_id'])
            for r in rows
        ])

        dst.commit()
        total_updated += dst_cursor.rowcount
        batch_num += 1
        pct = (total_updated / total_rows * 100) if total_rows else 0
        print(f"Batch {batch_num}: {total_updated:,} / {total_rows:,} rows ({pct:.1f}%)", flush=True)

    print(f"\nDone. Updated {total_updated:,} rows in destination DB.")
    src.close()
    dst.close()
# if __name__ == '__main__':
#     current_dir = Path(__file__).parent
#     copy_translations(
#         src_db=str(current_dir / 'translations.db'),
#         dst_db=str(current_dir / 'test_translations.db'),
#     )


DB_PATH = "test_translations.db"  # <-- change this to your actual DB path

PAGE_COLS = ["thaipage", "vripage", "ptspage", "mypage"]


def is_heading(pali_sentence: str) -> bool:
    """Check if a line is a markdown heading."""
    return pali_sentence is not None and pali_sentence.strip().startswith("#")


def is_namo(pali_sentence: str) -> bool:
    """Check if a line is a *Namo...* style line."""
    s = pali_sentence.strip() if pali_sentence else ""
    return 'tassa bhagavato arahato sammāsambuddhassa' in s

def is_paranum(pali_sentence: str) -> bool:
    "check if it is only a paragraph number"
    return pali_sentence[0] == '`' and pali_sentence[-1] == '`'


def find_target_row(rows, current_idx):
    """
    Given the list of all rows (ordered by rowid) and the index of the row
    with page numbers, walk backwards to find the target row that should
    receive the page numbers.

    Returns the rowid of the target row, or None if no relocation needed.
    """
    # Walk backwards from the row just before current_idx
    headings_seen = []  # list of (rowid, pali_sentence) for heading rows passed

    for i in range(current_idx - 1, -1, -1):
        row = rows[i]
        rowid, book_id, para_id, line_id, pali = (
            row["rowid"], row["book_id"], row["para_id"], row["line_id"], row["pali_sentence"] or ""
        )

        if is_heading(pali) or is_paranum(pali):
            headings_seen.append(row)
            continue
        else:
            # Non-heading row found
            if is_namo(pali):
                # Move page number to this *Namo...* line
                return row["rowid"]
            else:
                # Move to the first top-level '#' heading (single #) among seen headings
                # (the last one appended = the closest heading = lowest level;
                #  the first appended = the one farthest back = highest ancestor)
                # We want the single-# heading if present, else the closest heading
                for h in headings_seen:
                    h_pali = (h["pali_sentence"] or "").strip()
                    if h_pali.startswith("# ") or h_pali == "#":
                        return h["rowid"]
                # Fallback: return the farthest heading (first seen while walking back)
                if headings_seen:
                    return headings_seen[-1]["rowid"]  # closest heading
                return None  # nothing to move

    # Reached the beginning — if only headings were seen, pick the # heading
    for h in headings_seen:
        h_pali = (h["pali_sentence"] or "").strip()
        if h_pali.startswith("# ") or h_pali == "#":
            return h["rowid"]
    if headings_seen:
        return headings_seen[-1]["rowid"]
    return None


def preview_page_relocations(db_path: str):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Fetch all rows ordered by rowid
    cur.execute("""
        SELECT rowid, book_id, para_id, line_id, vripara,
               thaipage, vripage, ptspage, mypage,
               pali_sentence, english_translation
        FROM sentences
        ORDER BY book_id, para_id, line_id
    """)
    rows = cur.fetchall()

    # Build a rowid → index map
    rowid_to_idx = {row["rowid"]: i for i, row in enumerate(rows)}
    # Build a rowid → row map
    rowid_to_row = {row["rowid"]: row for row in rows}

    changes = []  # list of dicts describing proposed changes

    for idx, row in enumerate(rows):
        # Check if this row has any page numbers
        has_pages = any(row[col] for col in PAGE_COLS)
        if not has_pages:
            continue

        target_rowid = find_target_row(rows, idx)

        if target_rowid is None or target_rowid == row["rowid"]:
            # No relocation needed
            continue

        target = rowid_to_row[target_rowid]

        change = {
            "source_rowid": row["rowid"],
            "source_book_id": row["book_id"],
            "source_para_id": row["para_id"],
            "source_line_id": row["line_id"],
            "source_pali": (row["pali_sentence"] or "")[:80],
            "target_rowid": target_rowid,
            "target_book_id": target["book_id"],
            "target_para_id": target["para_id"],
            "target_line_id": target["line_id"],
            "target_pali": (target["pali_sentence"] or "")[:80],
        }
        for col in PAGE_COLS:
            change[col] = row[col]
        changes.append(change)

    conn.close()

    if not changes:
        print("No relocations found.")
        return changes

    print(f"{'='*100}")
    print(f"Found {len(changes)} page number(s) to relocate:\n")
    for c in changes:
        pages = {col: c[col] for col in PAGE_COLS if c[col]}
        print(f"  SOURCE  rowid={c['source_rowid']} ({c['source_book_id']} para={c['source_para_id']} line={c['source_line_id']})")
        print(f"          pali: {c['source_pali']}")
        print(f"          pages: {pages}")
        print(f"  TARGET  rowid={c['target_rowid']} ({c['target_book_id']} para={c['target_para_id']} line={c['target_line_id']})")
        print(f"          pali: {c['target_pali']}")
        print(f"  {'─'*96}")

    return changes


def apply_page_relocations(db_path: str, changes: list):
    """
    Call this ONLY after reviewing the preview output and confirming it looks correct.
    """
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    for c in changes:
        # Set page numbers on the target row
        for col in PAGE_COLS:
            if c[col]:
                cur.execute(
                    f"UPDATE sentences SET {col} = ? WHERE rowid = ?",
                    (c[col], c["target_rowid"])
                )
        # Clear page numbers from the source row
        set_nulls = ", ".join(f"{col} = NULL" for col in PAGE_COLS)
        cur.execute(
            f"UPDATE sentences SET {set_nulls} WHERE rowid = ?",
            (c["source_rowid"],)
        )
    conn.commit()
    conn.close()
    print(f"Applied {len(changes)} relocations.")


if __name__ == "__main__":
    # Step 1: Preview
    changes = preview_page_relocations(DB_PATH)

    # Step 2: Uncomment the line below ONLY after you've reviewed the output
    apply_page_relocations(DB_PATH, changes)
