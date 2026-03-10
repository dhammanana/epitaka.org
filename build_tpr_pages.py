import sqlite3
from itertools import groupby
from collections import defaultdict

DB_PATH = "test_translations.db"
DB_DEST_PATH = "/Users/totden/Library/Containers/org.americanmonk.tpp/Data/Documents/tipitaka_pali.db"
LANGUAGE = "vietnamese"
book_id_mapping = {

    # ═══════════════════════════════════════════════════════════════════════
    # MŪLA — canonical texts
    # ═══════════════════════════════════════════════════════════════════════

    # ── Vinaya Piṭaka ────────────────────────────────────────────────────
    "mula_vi_01":    ("vin01m.mul",   1),   # Pārājikapāḷi
    "mula_vi_02":    ("vin02m1.mul",  1),   # Pācittiyapāḷi
    "mula_vi_03":    ("vin02m2.mul",  1),   # Mahāvaggapāḷi
    "mula_vi_04":    ("vin02m3.mul",  1),   # Cūḷavaggapāḷi
    "mula_vi_05":    ("vin02m4.mul",  1),   # Parivārapāḷi

    # ── Dīgha Nikāya ────────────────────────────────────────────────────
    "mula_di_01":    ("s0101m.mul",   1),   # Sīlakkhandhavaggapāḷi
    "mula_di_02":    ("s0102m.mul",   1),   # Mahāvaggapāḷi
    "mula_di_03":    ("s0103m.mul",   1),   # Pāthikavaggapāḷi

    # ── Majjhima Nikāya ─────────────────────────────────────────────────
    "mula_ma_01":    ("s0201m.mul",   1),   # Mūlapaṇṇāsapāḷi
    "mula_ma_02":    ("s0202m.mul",   1),   # Majjhimapaṇṇāsapāḷi
    "mula_ma_03":    ("s0203m.mul",   1),   # Uparipaṇṇāsapāḷi

    # ── Saṃyutta Nikāya ─────────────────────────────────────────────────
    "mula_sa_01":    ("s0301m.mul",   1),   # Sagāthāvaggapāḷi
    "mula_sa_02":    ("s0302m.mul", 243),   # Nidānavaggapāḷi       (pp 243–472)
    "mula_sa_03":    ("s0303m.mul",   1),   # Khandhavaggapāḷi
    "mula_sa_04":    ("s0304m.mul", 236),   # Saḷāyatanavaggapāḷi   (pp 236–567)
    "mula_sa_05":    ("s0305m.mul",   1),   # Mahāvaggapāḷi

    # ── Aṅguttara Nikāya ────────────────────────────────────────────────
    "mula_an_01":    ("s0401m.mul",   1),   # Ekakanipātapāḷi        (pp   1– 48)
    "mula_an_02":    ("s0402m1.mul",  49),  # Dukanipātapāḷi         (pp  49– 98)
    "mula_an_03":    ("s0402m2.mul",  99),  # Tikanipātapāḷi         (pp  99–305)
    "mula_an_04":    ("s0402m3.mul", 307),  # Catukkanipātapāḷi      (pp 307–580)
    "mula_an_05":    ("s0403m1.mul",  1),   # Pañcakanipātapāḷi      (pp   1–246)
    "mula_an_06":    ("s0403m2.mul", 247),  # Chakkanipātapāḷi       (pp 247–393)
    "mula_an_07":    ("s0403m3.mul", 395),  # Sattakanipātapāḷi      (pp 395–513)
    "mula_an_08":    ("s0404m1.mul",  1),   # Aṭṭhakanipātapāḷi      (pp   1–162)
    "mula_an_09":    ("s0404m2.mul", 163),  # Navakanipātapāḷi       (pp 163–256)
    "mula_an_10":    ("s0404m3.mul", 257),  # Dasakanipātapāḷi       (pp 257–513)
    "mula_an_11":    ("s0404m4.mul", 515),  # Ekādasakanipātapāḷi    (pp 515–558)

    # ── Khuddaka Nikāya ─────────────────────────────────────────────────
    "mula_ku_01":    ("s0501m.mul",   1),   # Khuddakapāṭhapāḷi      (pp   1– 11)
    "mula_ku_02":    ("s0502m.mul",  13),   # Dhammapadapāḷi         (pp  13– 76)
    "mula_ku_03":    ("s0503m.mul",  77),   # Udānapāḷi              (pp  77–193)
    "mula_ku_04":    ("s0504m.mul", 195),   # Itivuttakapāḷi         (pp 195–277)
    "mula_ku_05":    ("s0505m.mul", 279),   # Suttanipātapāḷi        (pp 279–455)
    "mula_ku_06":    ("s0506m.mul",   1),   # Vimānavatthupāḷi       (pp   1–125)
    "mula_ku_07":    ("s0507m.mul", 127),   # Petavatthupāḷi         (pp 127–218)
    "mula_ku_08":    ("s0508m.mul", 219),   # Theragāthāpāḷi         (pp 219–375)
    "mula_ku_09":    ("s0509m.mul", 377),   # Therīgāthāpāḷi         (pp 377–435)
    "mula_ku_10":    ("s0510m1.mul",  1),   # Apadānapāḷi-1
    "mula_ku_11":    ("s0510m2.mul",  1),   # Apadānapāḷi-2
    "mula_ku_12":    ("s0511m.mul",  299),  # Buddhavaṃsapāḷi        (pp 299–384)
    "mula_ku_13":    ("s0512m.mul",  385),  # Cariyāpiṭakapāḷi       (pp 385–420)
    "mula_ku_14":    ("s0513m.mul",   1),   # Jātakapāḷi-1
    "mula_ku_15":    ("s0514m.mul",   1),   # Jātakapāḷi-2
    "mula_ku_16":    ("s0515m.mul",   1),   # Mahāniddesapāḷi
    "mula_ku_17":    ("s0516m.mul",   1),   # Cūḷaniddesapāḷi
    "mula_ku_18":    ("s0517m.mul",   1),   # Paṭisambhidāmaggapāḷi
    "mula_ku_19":    ("s0518m.nrf",   1),   # Milindapañhapāḷi
    "mula_ku_20":    ("s0519m.mul",   1),   # Nettippakaraṇapāḷi     (pp   1–166)
    "mula_ku_21":    ("s0520m.nrf",  167),  # Peṭakopadesapāḷi       (pp 167–341)

    # ── Abhidhamma Piṭaka ───────────────────────────────────────────────
    "mula_bi_01":    ("abh01m.mul",   1),   # Dhammasaṅgaṇīpāḷi
    "mula_bi_02":    ("abh02m.mul",   1),   # Vibhaṅgapāḷi
    "mula_bi_03":    ("abh03m1.mul",  1),   # Dhātukathāpāḷi         (pp   1–100)
    "mula_bi_04":    ("abh03m2.mul", 101),  # Puggalapaññattipāḷi    (pp 101–185)
    "mula_bi_05":    ("abh03m3.mul",  1),   # Kathāvatthupāḷi
    "mula_bi_06_01": ("abh03m4.mul",  1),   # Yamakapāḷi-1
    "mula_bi_06_02": ("abh03m5.mul",  1),   # Yamakapāḷi-2
    "mula_bi_06_03": ("abh03m6.mul",  1),   # Yamakapāḷi-3
    "mula_bi_07_01": ("abh03m7.mul",  1),   # Paṭṭhānapāḷi-1
    "mula_bi_07_02": ("abh03m8.mul",  1),   # Paṭṭhānapāḷi-2
    "mula_bi_07_03": ("abh03m9.mul",  1),   # Paṭṭhānapāḷi-3
    "mula_bi_07_04": ("abh03m10.mul", 1),   # Paṭṭhānapāḷi-4
    "mula_bi_07_05": ("abh03m11.mul", 1),   # Paṭṭhānapāḷi-5

    # ═══════════════════════════════════════════════════════════════════════
    # AṬṬHAKATHĀ — commentaries
    # ═══════════════════════════════════════════════════════════════════════

    # ── Vinaya Aṭṭhakathā ───────────────────────────────────────────────
    "attha_vi_01_01": ("vin01a.att",   1),  # Pārājikakaṇḍa-aṭṭhakathā (pa)
    "attha_vi_01_02": ("vin01a.att",   1),  # Pārājikakaṇḍa-aṭṭhakathā (du)
    "attha_vi_02":    ("vin02a1.att",  1),  # Pācittiya-aṭṭhakathā
    "attha_vi_03":    ("vin02a2.att", 233), # Mahāvagga-aṭṭhakathā      (pp 233–437)
    "attha_vi_04":    ("vin02a3.att",  1),  # Cūḷavagga-aṭṭhakathā      (pp   1–136)
    "attha_vi_05":    ("vin02a4.att", 137), # Parivāra-aṭṭhakathā       (pp 137–265)

    # ── Dīgha Aṭṭhakathā ────────────────────────────────────────────────
    "attha_di_01":    ("s0101a.att",   1),  # Sīlakkhandhavagga-aṭṭhakathā
    "attha_di_02":    ("s0102a.att",   1),  # Mahāvagga-aṭṭhakathā
    "attha_di_03":    ("s0103a.att",   1),  # Pāthikavagga-aṭṭhakathā

    # ── Majjhima Aṭṭhakathā ─────────────────────────────────────────────
    "attha_ma_01_01": ("s0201a.att",   1),  # Mūlapaṇṇāsa-aṭṭhakathā (pa)
    "attha_ma_01_02": ("s0201a.att",   1),  # Mūlapaṇṇāsa-aṭṭhakathā (du)
    "attha_ma_02":    ("s0202a.att",   1),  # Majjhimapaṇṇāsa-aṭṭhakathā
    "attha_ma_03":    ("s0203a.att",   1),  # Uparipaṇṇāsa-aṭṭhakathā

    # ── Saṃyutta Aṭṭhakathā ─────────────────────────────────────────────
    "attha_sa_01":    ("s0301a.att",   1),  # Sagāthāvagga-aṭṭhakathā
    "attha_sa_02":    ("s0302a.att",   1),  # Nidānavagga-aṭṭhakathā
    "attha_sa_03":    ("s0303a.att", 229),  # Khandhavagga-aṭṭhakathā   (pp 229–324)
    "attha_sa_04":    ("s0304a.att",   1),  # Saḷāyatanavagga-aṭṭhakathā (pp  1–152)
    "attha_sa_05":    ("s0305a.att", 153),  # Mahāvagga-aṭṭhakathā      (pp 153–341)

    # ── Aṅguttara Aṭṭhakathā ────────────────────────────────────────────
    "attha_an_01":    ("s0401a.att",   1),  # Ekakanipāta-aṭṭhakathā
    "attha_an_02":    ("s0402a.att",   1),  # Duka-tika-catukka-aṭṭhakathā
    "attha_an_03":    ("s0403a.att",   1),  # Pañcaka-chakka-sattaka-aṭṭhakathā (pp 1–191)
    "attha_an_04":    ("s0404a.att", 193),  # Aṭṭhakādi-aṭṭhakathā      (pp 193–357)

    # ── Khuddaka Aṭṭhakathā ─────────────────────────────────────────────
    "attha_ku_01":    ("s0501a.att",   1),  # Khuddakapāṭha-aṭṭhakathā
    "attha_ku_02_01": ("s0502a.att",   1),  # Dhammapada-aṭṭhakathā (pa)
    "attha_ku_02_02": ("s0502a.att",   1),  # Dhammapada-aṭṭhakathā (du)
    "attha_ku_03":    ("s0503a.att",   1),  # Udāna-aṭṭhakathā
    "attha_ku_04":    ("s0504a.att",   1),  # Itivuttaka-aṭṭhakathā
    "attha_ku_05_01": ("s0505a.att",   1),  # Suttanipāta-aṭṭhakathā (pa)
    "attha_ku_05_02": ("s0505a.att",   1),  # Suttanipāta-aṭṭhakathā (du)
    "attha_ku_06":    ("s0506a.att",   1),  # Vimānavatthu-aṭṭhakathā
    "attha_ku_07":    ("s0507a.att",   1),  # Petavatthu-aṭṭhakathā
    "attha_ku_08_01": ("s0508a1.att",  1),  # Theragāthā-aṭṭhakathā (pa)
    "attha_ku_08_02": ("s0508a2.att",  1),  # Theragāthā-aṭṭhakathā (du)
    "attha_ku_09":    ("s0509a.att",   1),  # Therīgāthā-aṭṭhakathā
    "attha_ku_10":    ("s0510a.att",   1),  # Apadāna-aṭṭhakathā (pa)
    "attha_ku_11":    ("s0510a.att",   1),  # Apadāna-aṭṭhakathā (du)
    "attha_ku_12":    ("s0511a.att",   1),  # Buddhavaṃsa-aṭṭhakathā
    "attha_ku_13":    ("s0512a.att",   1),  # Cariyāpiṭaka-aṭṭhakathā
    "attha_ku_16":    ("s0515a.att",   1),  # Mahāniddesa-aṭṭhakathā
    "attha_ku_17":    ("s0516a.att",   1),  # Cūḷaniddesa-aṭṭhakathā
    "attha_ku_18_01": ("s0517a.att",   1),  # Paṭisambhidāmagga-aṭṭhakathā (pa)
    "attha_ku_18_02": ("s0517a.att",   1),  # Paṭisambhidāmagga-aṭṭhakathā (du)
    "attha_ku_20":    ("s0519a.att",   1),  # Nettippakaraṇa-aṭṭhakathā
    # Jātaka aṭṭhakathā – 7 physical volumes (4 under s0513a*, 3 under s0514a*)
    "attha_ku_zat_01": ("s0513a1.att", 1),  # Jātaka-aṭṭhakathā vol 1
    "attha_ku_zat_02": ("s0513a2.att", 1),  # Jātaka-aṭṭhakathā vol 2
    "attha_ku_zat_03": ("s0513a3.att", 1),  # Jātaka-aṭṭhakathā vol 3
    "attha_ku_zat_04": ("s0513a4.att", 1),  # Jātaka-aṭṭhakathā vol 4
    "attha_ku_zat_05": ("s0514a1.att", 1),  # Jātaka-aṭṭhakathā vol 5
    "attha_ku_zat_06": ("s0514a2.att", 1),  # Jātaka-aṭṭhakathā vol 6
    "attha_ku_zat_07": ("s0514a3.att", 1),  # Jātaka-aṭṭhakathā vol 7

    # ── Abhidhamma Aṭṭhakathā ───────────────────────────────────────────
    "attha_bi_01":    ("abh01a.att",   1),  # Dhammasaṅgaṇi-aṭṭhakathā
    "attha_bi_02":    ("abh02a.att",   1),  # Sammohavinodanī (Vibhaṅga-aṭṭhakathā)
    "attha_bi_03":    ("abh03a.att",   1),  # Pañcapakaraṇa-aṭṭhakathā

    # ═══════════════════════════════════════════════════════════════════════
    # ṬĪKĀ — sub-commentaries
    # ═══════════════════════════════════════════════════════════════════════

    # ── Vinaya Ṭīkā ─────────────────────────────────────────────────────
    "tika_vi_01":    ("vin01t1.tik",  1),   # Sāratthadīpanī-ṭīkā-1
    "tika_vi_02":    ("vin01t2.tik",  1),   # Sāratthadīpanī-ṭīkā-2
    "tika_vi_03":    ("vin02t.tik",   1),   # Sāratthadīpanī-ṭīkā-3
    "tika_vi_04":    ("vin06t.nrf",   1),   # Vajirabuddhi-ṭīkā
    "tika_vi_05":    ("vin07t.nrf",   1),   # Vimativinodanī-ṭīkā (pa)
    "tika_vi_06":    ("vin07t.nrf",   1),   # Vimativinodanī-ṭīkā (du)

    # ── Dīgha Ṭīkā ──────────────────────────────────────────────────────
    "tika_di_01_01": ("s0101t.tik",   1),   # Sīlakkhandhavagga-ṭīkā
    "tika_di_01_02": ("s0104t.nrf",   1),   # Sīlakkhandhavagga-abhinavaṭīkā (pa)
    "tika_di_01_03": ("s0105t.nrf",   1),   # Sīlakkhandhavagga-abhinavaṭīkā (du)
    "tika_di_02":    ("s0102t.tik",   1),   # Mahāvagga-ṭīkā
    "tika_di_03":    ("s0103t.tik",   1),   # Pāthikavagga-ṭīkā

    # ── Majjhima Ṭīkā ───────────────────────────────────────────────────
    "tika_ma_01":    ("s0201t.tik",   1),   # Mūlapaṇṇāsa-ṭīkā (pa)
    "tika_ma_02":    ("s0201t.tik",   1),   # Mūlapaṇṇāsa-ṭīkā (du)
    "tika_ma_03":    ("s0202t.tik",   1),   # Majjhimapaṇṇāsa-ṭīkā      (pp   1–209)
    "tika_ma_04":    ("s0203t.tik", 211),   # Uparipaṇṇāsa-ṭīkā         (pp 211–442)

    # ── Saṃyutta Ṭīkā ───────────────────────────────────────────────────
    "tika_sa_01":    ("s0301t.tik",   1),   # Sagāthāvagga-ṭīkā
    "tika_sa_02":    ("s0302t.tik",   1),   # Nidānavagga-ṭīkā           (pp   1–200)
    "tika_sa_03":    ("s0303t.tik", 201),   # Khandhavagga-ṭīkā          (pp 201–279)
    "tika_sa_04":    ("s0304t.tik", 281),   # Saḷāyatanavagga-ṭīkā       (pp 281–391)
    "tika_sa_05":    ("s0305t.tik", 393),   # Mahāvagga-ṭīkā             (pp 393–551)

    # ── Aṅguttara Ṭīkā ──────────────────────────────────────────────────
    "tika_an_01":    ("s0401t.tik",   1),   # Ekakanipāta-ṭīkā
    "tika_an_02":    ("s0402t.tik",   1),   # Dukādi-ṭīkā
    "tika_an_03":    ("s0403t.tik",   1),   # Pañcakādi-ṭīkā             (pp   1–202)
    "tika_an_04":    ("s0404t.tik", 203),   # Aṭṭhakādi-ṭīkā             (pp 203–371)

    # ── Khuddaka Ṭīkā ───────────────────────────────────────────────────
    "tika_ku_20_01": ("s0519t.tik",   1),   # Nettippakaraṇa-ṭīkā
    "tika_ku_20_02": ("s0501t.nrf",   1),   # Nettivibhāvinī

    # ── Abhidhamma Ṭīkā ─────────────────────────────────────────────────
    "tika_bi_01":    ("abh01t.tik",   1),   # Dhammasaṅgaṇī-mūlaṭīkā
    "tika_bi_02_01": ("abh02t.tik",   1),   # Vibhaṅga-mūlaṭīkā (pa)
    "tika_bi_02_02": ("abh02t.tik",   1),   # Vibhaṅga-anuṭīkā (du)
    "tika_bi_03":    ("abh03t.tik",   1),   # Pañcapakaraṇa-mūlaṭīkā
    "tika_bi_04":    ("abh04t.nrf",   1),   # Dhammasaṅgaṇī-anuṭīkā
    "tika_bi_05":    ("abh05t.nrf",   1),   # Pañcapakaraṇa-anuṭīkā

    # ═══════════════════════════════════════════════════════════════════════
    # AÑÑA — other works
    # ═══════════════════════════════════════════════════════════════════════

    # ── Vinaya-related Añña ─────────────────────────────────────────────
    "annya_vi_01":   ("vin04t.nrf",  1),    # Dvemātikā / Kaṅkhāvitaraṇī
    "annya_vi_02":   ("vin05t.nrf",  1),    # Vinayasaṅgaha-aṭṭhakathā
    "annya_vi_03":   ("vin10t.nrf",  1),    # Vinayavinicchayo / Uttaravinicchayo
    "annya_vi_04":   ("vin13t.nrf",  1),    # Khuddasikkhā / Mūlasikkhā
    "annya_vi_07":   ("vin08t.nrf",  1),    # Vinayālaṅkāra-ṭīkā (pa)
    "annya_vi_08":   ("vin08t.nrf",  1),    # Vinayālaṅkāra-ṭīkā (du)
    "annya_vi_09":   ("vin09t.nrf",  1),    # Kaṅkhāvitaraṇī purāṇa/abhinava ṭīkā
    "annya_vi_10":   ("vin11t.nrf",  1),    # Vinayavinicchaya-ṭīkā (pa)
    "annya_vi_11":   ("vin11t.nrf",  1),    # Vinayavinicchaya-ṭīkā (du)
    "annya_vi_12":   ("vin12t.nrf",  1),    # Pācityādiyojanā

    # ── Visuddhimagga & Abhidhamma companions ───────────────────────────
    "annya_bi_01":   ("e0101n.mul",  1),    # Visuddhimagga (pa)
    "annya_bi_02":   ("e0102n.mul",  1),    # Visuddhimagga (du)
    "annya_bi_03":   ("e0103n.att",  1),    # Visuddhimagga-mahāṭīkā (pa)
    "annya_bi_04":   ("e0104n.att",  1),    # Visuddhimagga-mahāṭīkā (du)
    "annya_bi_05":   ("abh07t.nrf",  1),    # Abhidhammatthasaṅgaho     (pp  1– 68)
    "annya_bi_06":   ("abh07t.nrf", 69),    # Abhidhammatthavibhāvinī   (pp 69–279)
    "annya_bi_07":   ("e0301n.nrf",  1),    # Paramatthadīpanī

    # ── Grammar / Byākaraṇa ─────────────────────────────────────────────
    "annya_sadda_01": ("e0802n.nrf",   1),  # Kaccāyanabyākaraṇaṃ
    "annya_sadda_02": ("e0805n.nrf",   1),  # Padarūpasiddhi
    "annya_sadda_03": ("e0801n.nrf",   1),  # Moggallāna-suttapāṭho
    "annya_sadda_05": ("e0806n.nrf",   1),  # Moggallānapañcikā-ṭīkā
    "annya_sadda_06": ("e0807n.nrf",   1),  # Payogasiddhi
    "annya_sadda_07": ("e0803n.nrf",   1),  # Saddanīti (padamālā)
    "annya_sadda_08": ("e0804n.nrf",   1),  # Saddanīti (dhātumālā)
    "annya_sadda_09": ("e0804n.nrf",   1),  # Saddanīti (suttamālā)  [3rd part same work]
    "annya_sadda_10": ("e0201n.nrf",   1),  # Niruttidīpanī
    "annya_sadda_11": ("e0809n.nrf",   1),  # Abhidhānappadīpikā        (pp   1– 99)
    "annya_sadda_12": ("e0810n.nrf",   1),  # Abhidhānappadīpikā-ṭīkā
    "annya_sadda_13": ("e0808n.nrf", 192),  # Vuttodaya                 (pp 192–201)
    "annya_sadda_14": ("e0811n.nrf", 156),  # Subodhālaṅkāra            (pp 156–189)
    "annya_sadda_15": ("e0812n.nrf",   1),  # Subodhālaṅkāra-ṭīkā
    "annya_sadda_16": ("e0802n.nrf",   1),  # Kaccāyanasāra
    "annya_sadda_17": ("e0802n.nrf",   1),  # Saddatthabhedacintā
}

def convert_bookid(db_file: str) -> None:
    """
    Much faster version: uses range-based UPDATE statements instead of row-by-row.
    """
    conn = None
    try:
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()

        # 1. Build reverse map: original_book → sorted list of (start_page, new_bookid)
        reverse_map: dict[str, list[tuple[int, str]]] = defaultdict(list)
        for new_id, (orig_book, start_page) in book_id_mapping.items():
            reverse_map[orig_book].append((start_page, new_id))

        # Sort each group by start_page
        for orig_book in reverse_map:
            reverse_map[orig_book].sort(key=lambda x: x[0])

        total_updated = 0

        # 2. Process each original book separately
        for orig_book, segments in reverse_map.items():
            if not segments:
                continue

            print(f"Processing original book: {orig_book}  ({len(segments)} segments)")

            # We'll build range conditions like:
            #   page >= 1 AND page < 49   → new_id_X
            #   page >= 49 AND page < 99  → new_id_Y
            #   ...

            # Add a fake "infinity" at the end so last segment is open-ended
            ranges = []
            prev_start = None
            prev_new_id = None

            for i, (start, new_id) in enumerate(segments):
                if i > 0:
                    # close previous range
                    ranges.append((prev_start, start, prev_new_id))
                prev_start = start
                prev_new_id = new_id

            # last segment → open end
            if prev_start is not None:
                ranges.append((prev_start, 999999999, prev_new_id))  # large number = infinity

            # 3. Execute range UPDATEs
            for start_page, end_page, new_bookid in ranges:
                # Skip invalid ranges
                if start_page >= end_page:
                    continue

                sql = """
                    UPDATE pages
                    SET bookid = ?
                    WHERE bookid = ?
                      AND page >= ?
                      AND page < ?
                """
                cursor.execute(sql, (new_bookid, orig_book, start_page, end_page))
                updated = cursor.rowcount
                if updated > 0:
                    total_updated += updated
                    print(f"  → {updated:6d} rows  |  p.{start_page:4d} – p.{end_page-1:4d}  →  {new_bookid}")

        conn.commit()
        print(f"\nFinished. Total rows updated: {total_updated:,}")

    except sqlite3.Error as e:
        print(f"Database error: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()


def render_inline(text: str) -> str:
    """
    Convert inline markdown within a line into HTML spans.
    Handles (in scanning order):
      `num`       -> <span class="paranum">num</span>
      **text**    -> <span class="bld">text</span>
      \\[...\\]   -> <span class="note">[...]</span>   (escaped brackets)
      [...]       -> <span class="note">[...]</span>   (plain brackets)
    Plain text between markers is left as-is.
    """
    result = []
    i = 0
    while i < len(text):
        # Paranum: `...`
        if text[i] == '`':
            end = text.find('`', i + 1)
            if end != -1:
                inner = text[i+1:end]
                result.append(f'<span class="paranum">{inner}</span>')
                i = end + 1
                continue

        # Bold: **...**
        if text[i:i+2] == '**':
            end = text.find('**', i + 2)
            if end != -1:
                inner = text[i+2:end]
                result.append(f'<span class="bld">{inner}</span>')
                i = end + 2
                continue

        # Note: \[...\]  (escaped brackets from markdown)
        if text[i:i+2] == r'\[':
            end = text.find(r'\]', i + 2)
            if end != -1:
                inner = text[i+2:end]
                result.append(f'<span class="note">[{inner}]</span>')
                i = end + 2
                continue

        # Note: [...] (plain brackets)
        if text[i] == '[':
            end = text.find(']', i + 1)
            if end != -1:
                inner = text[i+1:end]
                result.append(f'<span class="note">[{inner}]</span>')
                i = end + 1
                continue

        result.append(text[i])
        i += 1

    return "".join(result)


def parse_line(line: str) -> tuple[str, str]:
    """
    Parse a markdown line, returning (css_class, html_content).

    Block-level lines (headings, centre) return their class with inline content rendered.
    Bodytext lines have inline markers rendered via render_inline().
    """
    s = line.strip()
    if not s:
        return ("", "")

    # Headings (most-hashes first)
    for hashes, cls in [
        ("######", "subsubhead"),
        ("#####",  "subhead"),
        ("####",   "title"),
        ("###",    "chapter"),
        ("##",     "book"),
        ("#",      "nikaya"),
    ]:
        if s.startswith(hashes + " "):
            return (cls, render_inline(s[len(hashes) + 1:].strip()))

    # Centre: whole line wrapped in single asterisks (not double)
    if s.startswith("*") and s.endswith("*") and not s.startswith("**") and len(s) > 2:
        return ("centre", render_inline(s[1:-1].strip()))

    # Bodytext with possible inline bold/paranum/note markers
    return ("bodytext", render_inline(s))


def parse_translation_line(line: str) -> tuple[str, str]:
    """
    Parse an english_translation markdown line.
    Only two output classes:
      - "centre"   for *text* or any heading variant
      - "bodytext" for everything else (paranum, bld, plain)
    """
    if not line or not line.strip():
        return ("", "")

    cls, text = parse_line(line)
    if not cls:
        return ("", "")

    # All headings and centre collapse to centre
    if cls in {"nikaya", "book", "chapter", "title", "subhead", "subsubhead", "centre"}:
        return ("centre", text)

    return ("bodytext", text)


# Classes that become their own <p> tag
BLOCK_CLASSES = {"nikaya", "book", "chapter", "title", "subhead", "subsubhead", "centre"}


def format_page_content(paragraphs: dict[int, list[tuple[str, str]]]) -> str:
    """
    Convert a page's paragraphs into HTML.

    paragraphs: dict mapping para_id -> list of (pali_sentence, english_translation) tuples

    Each line produces:
      <span class="palitext">{pali}</span><span class="translation">{eng}</span>

    Block-level lines (headings, centre) get their own <p class="{cls}">.
    All other lines are grouped into <p class="bodytext">.
    Translation spans use class "translation" for bodytext, "translation centre" for headings.
    """
    html_parts = []

    for para_id in sorted(paragraphs.keys()):
        lines = paragraphs[para_id]
        bodytext_buffer = []
        
        def flush_bodytext():
            if bodytext_buffer:
                inner = "\n\n<br/>\n\n".join(bodytext_buffer)
                html_parts.append(f'<p class="bodytext">\n{inner}\n</p>')
                bodytext_buffer.clear()
        
        for pali_line, eng_line in lines:
            if not pali_line or not pali_line.strip():
                continue
                
            cls, pali_text = parse_line(pali_line)
            if not cls:
                continue
            
            # Build translation part
            trans_inner = ""
            if eng_line:
                eng_cls, eng_text = parse_translation_line(eng_line)
                if eng_text:
                    if eng_cls == "centre":
                        trans_inner = f'<span class="centre">{eng_text}</span>'
                    else:
                        trans_inner = eng_text
                    #should add translation class in the flutter app css.
                    trans_span = f'<span class="pageheader">{trans_inner}</span>'
                else:
                    trans_span = ""
            else:
                trans_span = ""
            
            if cls in BLOCK_CLASSES:
                flush_bodytext()
                pali_span = f'<span class="palitext">{pali_text}</span>'
                html_parts.append(f'<p class="{cls}">{pali_span}\n\t<br/>\n\t{trans_span}</p>')
                
            else:  # bodytext — inline paranum/bld/note already rendered by render_inline
                pali_span = f'<span class="palitext">{pali_text}</span>'
                bodytext_buffer.append(f'{pali_span}\n\t<br/>\n\t{trans_span}')
        
        flush_bodytext()

    return "\n\n".join(html_parts)


def build_paranum(vripara_values: list[str]) -> str:
    """
    Build paranum string from all non-null vripara values on this page.
    Format: -val1-val2-etc-
    """
    seen = []
    for v in vripara_values:
        if v and v not in seen:
            seen.append(v)
    if not seen:
        return ""
    return "-" + "-".join(seen) + "-"


def rebuild_pages(db_path: str, db_dest_path: str):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    conn_out = sqlite3.connect(db_dest_path)
    conn_out.row_factory = sqlite3.Row
    cur_out = conn_out.cursor()

    # Drop and recreate pages table
    cur_out.execute("DROP TABLE IF EXISTS pages")
    cur_out.execute("""
        CREATE TABLE "pages" (
            "id"      INTEGER NOT NULL,
            "bookid"  TEXT,
            "page"    INTEGER,
            "content" TEXT,
            "paranum" TEXT,
            PRIMARY KEY("id" AUTOINCREMENT)
        )
    """)
    conn_out.commit()

    # Fetch all rows ordered correctly
    cur.execute(f"""
        SELECT book_id, para_id, line_id, vripara, mypage, pali_sentence, {LANGUAGE}_translation
        FROM sentences
        ORDER BY book_id, para_id, line_id
    """)
    rows = cur.fetchall()

    pages_to_insert = []

    for book_id, book_rows in groupby(rows, key=lambda r: r["book_id"]):
        book_rows = list(book_rows)

        # Split book rows into pages based on mypage changes
        # A new page starts when mypage is not null
        current_page_num = 1
        current_page_rows = []
        pages_in_book = []  # list of (page_num, rows)

        for row in book_rows:
            if row["mypage"] is not None:
                if current_page_rows:
                    pages_in_book.append((current_page_num, current_page_rows))
                current_page_num = row["mypage"]
                if '.' in current_page_num:
                    current_page_num = current_page_num.split('.')[-1]
                current_page_rows = [row]
            else:
                if not current_page_rows:
                    current_page_num = 1
                current_page_rows.append(row)

        if current_page_rows:
            pages_in_book.append((current_page_num, current_page_rows))

        # Build page records
        for page_num, page_rows in pages_in_book:
            # paragraphs: para_id -> list of (pali_sentence, english_translation)
            
            paragraphs = {}
            vripara_values = []

            for row in page_rows:
                pid = row["para_id"]
                if pid not in paragraphs:
                    paragraphs[pid] = []
                if row["pali_sentence"]:
                    paragraphs[pid].append((row["pali_sentence"], row[f"{LANGUAGE}_translation"]))
                if row["vripara"]:
                    vripara_values.append(row["vripara"])

            content = format_page_content(paragraphs)
            paranum = build_paranum(vripara_values)

            pages_to_insert.append((book_id, page_num, content, paranum))

    cur_out.executemany(
        "INSERT INTO pages (bookid, page, content, paranum) VALUES (?, ?, ?, ?)",
        pages_to_insert
    )
    conn_out.commit()
    print(f"Inserted {len(pages_to_insert)} page records.")

    # Preview
    cur_out.execute("SELECT * FROM pages LIMIT 5")
    for row in cur_out.fetchall():
        print(dict(row))

    conn.close()
    conn_out.close()


######################################################
########## export sql files ##########################
######################################################

def export_books_to_sql(
    db_path: str,
    book_ids: list[str] | None = None,
    output_file: str | None = None
) -> str:
    """
    Generate SQL script to export (delete + re-insert) selected books with their TOC, pages, category.
    
    :param db_path: Path to your SQLite database file
    :param book_ids: Optional list of book_ids to export (if None → export all)
    :param output_file: If provided, write to this .sql file; otherwise return string
    :return: The generated SQL as string (if no output_file)
    """
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # Allows dict-like access
    cur = conn.cursor()

    sql_parts = ["BEGIN TRANSACTION;"]

    # If no book_ids given → get all
    if book_ids is None:
        cur.execute("SELECT id FROM books ORDER BY id")
        book_ids = [row['id'] for row in cur.fetchall()]

    for book_id in book_ids:
        # Get book row (for category & other info)
        cur.execute("""
            SELECT id, basket, category, name, firstpage, lastpage, pagecount
            FROM books
            WHERE id = ?
        """, (book_id,))
        book = cur.fetchone()
        if not book:
            continue  # skip if book not found

        category_id = book['category']

        # DELETE statements (order matters to avoid FK issues)
        sql_parts.extend([
            f"DELETE FROM tocs WHERE book_id = '{book_id}';",
            f"DELETE FROM books WHERE id = '{book_id}';",
            f"DELETE FROM pages WHERE bookid = '{book_id}';",
            f"DELETE FROM fts_pages WHERE bookid = '{book_id}';",
            f"DELETE FROM category WHERE id = '{category_id}';",
        ])

        # Category INSERT (idempotent)
        cur.execute("""
            SELECT name, basket FROM category WHERE id = ?
        """, (category_id,))
        cat_row = cur.fetchone()
        if cat_row:
            cat_name = cat_row['name'].replace("'", "''")  # escape '
            cat_basket = cat_row['basket'].replace("'", "''")
            sql_parts.append(
                f"INSERT INTO category (id, name, basket) "
                f"SELECT '{category_id}', '{cat_name}', '{cat_basket}' "
                f"WHERE NOT EXISTS(SELECT 1 FROM category WHERE id = '{category_id}');"
            )

        # Book INSERT
        book_name = book['name'].replace("'", "''")
        sql_parts.append(
            f"INSERT INTO books (id, basket, category, name, firstpage, lastpage, pagecount) "
            f"VALUES ('{book_id}', '{book['basket']}', '{category_id}', "
            f"'{book_name}', {book['firstpage']}, {book['lastpage']}, {book['pagecount']});"
        )

        # TOC entries (ordered by page_number or id if needed)
        cur.execute("""
            SELECT name, type, page_number
            FROM tocs
            WHERE book_id = ?
            ORDER BY page_number, rowid
        """, (book_id,))
        for toc in cur.fetchall():
            toc_name = toc['name'].replace("'", "''")
            sql_parts.append(
                f"INSERT INTO tocs (book_id, name, type, page_number) "
                f"VALUES ('{book_id}', '{toc_name}', '{toc['type']}', {toc['page_number']});"
            )

        # Pages (ordered by page)
        cur.execute("""
            SELECT page, content, paranum
            FROM pages
            WHERE bookid = ?
            ORDER BY page
        """, (book_id,))
        for page in cur.fetchall():
            # Critical: double single quotes in content (HTML + text)
            content_escaped = page['content'].replace("'", "''")
            content_escaped = content_escaped.replace("\n", " ").replace("\r", " ")

            paranum_escaped = page['paranum'].replace("'", "''") if page['paranum'] else ""
            paranum_escaped = paranum_escaped.replace("\n", " ").replace("\r", " ")

            sql_parts.append(
                f"INSERT INTO pages (bookid, page, content, paranum) "
                f"VALUES ('{book_id}', {page['page']}, '{content_escaped}', '{paranum_escaped}');"
            )

    sql_parts.append("COMMIT;")

    full_sql = "\n".join(sql_parts)

    if output_file:
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(full_sql)
        print(f"SQL export written to: {output_file}")
        return ""

    conn.close()
    return full_sql


if __name__ == "__main__":
    rebuild_pages(DB_PATH, DB_DEST_PATH)
    convert_bookid(DB_DEST_PATH)
    export_books_to_sql(DB_DEST_PATH, book_ids=None, output_file=f"full_{LANGUAGE}.sql")
