# app/utils/seo.py
"""SEO helpers: absolute URLs, English book names, titles, descriptions.

The site is multi-language and serves the Pāli Canon (Chaṭṭha Saṅgāyana
edition). Search traffic comes overwhelmingly from *English* book names
("Dhammapada", "Sutta Nipata", "Digha Nikaya") and from language-specific
names ("Kinh Pháp Cú", "ธรรมบท", "தம்மபதம்"), while the database stores
Pāli titles ("Dhammapadapāḷi"). These helpers give every page a proper
English-language title, meta description, canonical URL, and structured
data regardless of the display language.
"""
import html
import os
import re

from flask import current_app, has_request_context, request

from ..config import Config


def _dev_mode() -> bool:
    """True when running the local development server (no BASE_URL)."""
    try:
        if has_request_context():
            return bool(current_app.debug)
    except Exception:
        pass
    env = (os.environ.get('ENV') or os.environ.get('FLASK_ENV') or '').lower()
    return env in ('', 'development', 'dev')


# Canonical site origin. Config.BASE_URL wins (set it in the server .env).
# During local development (no BASE_URL) derive it from the current request so
# every rendered link — outline, study guides, canonical URLs — stays on the
# local server instead of pointing at the production domain. In production,
# fall back to the well-known domain and never trust the request Host, because
# Cloudflare/nginx can present http or a bare IP.
def site_base() -> str:
    base = (Config.BASE_URL or '').strip().rstrip('/')
    if base:
        return base
    if _dev_mode():
        try:
            if has_request_context():
                return f'{request.scheme}://{request.host}'.rstrip('/')
        except Exception:
            pass
    return 'https://epitaka.org'


def absolute(path: str) -> str:
    """Absolute URL for a site path ('' or '/' → origin)."""
    base = site_base()
    if not path or path == '/':
        return base + '/'
    if path.startswith('http://') or path.startswith('https://'):
        return path
    return base + ('/' + path.lstrip('/'))


# ── English display names for the main books ─────────────────────────────
# book_id → common English name. Used for titles, H1s, meta, and schema.
# Commentaries/ṭīkās inherit the base name via suffix stripping below.
BOOK_NAMES = {
    # ── Piṭakas / Nikāyas ─────────────────────────────────────────────
    'Vin': 'Vinaya Piṭaka',
    'D': 'Dīgha Nikāya', 'D-i': 'Dīgha Nikāya', 'D-ii': 'Dīgha Nikāya', 'D-iii': 'Dīgha Nikāya',
    'M': 'Majjhima Nikāya', 'M-i': 'Majjhima Nikāya', 'M-ii': 'Majjhima Nikāya', 'M-iii': 'Majjhima Nikāya',
    'S': 'Saṃyutta Nikāya', 'S-i': 'Saṃyutta Nikāya', 'S-ii': 'Saṃyutta Nikāya',
    'S-iii': 'Saṃyutta Nikāya', 'S-iv': 'Saṃyutta Nikāya', 'S-v': 'Saṃyutta Nikāya',
    'A': 'Aṅguttara Nikāya', 'A-i': 'Aṅguttara Nikāya', 'A-ii': 'Aṅguttara Nikāya',
    'A-iii': 'Aṅguttara Nikāya', 'A-iv': 'Aṅguttara Nikāya', 'A-v': 'Aṅguttara Nikāya',
    'KN': 'Khuddaka Nikāya',
    # ── Khuddaka Nikāya ───────────────────────────────────────────────
    'Khp': 'Khuddakapāṭha',
    'Dhp': 'Dhammapada',
    'Ud': 'Udāna',
    'It': 'Itivuttaka',
    'Sn': 'Sutta Nipāta',
    'Vv': 'Vimānavatthu',
    'Pv': 'Petavatthu',
    'Th': 'Theragāthā',
    'Thi': 'Therīgāthā',
    'Ap': 'Apadāna',
    'Bv': 'Buddhavaṃsa',
    'Cp': 'Cariyāpiṭaka',
    'Ja': 'Jātaka',
    'Ja-i': 'Jātaka', 'Ja-ii': 'Jātaka', 'Ja-iii': 'Jātaka', 'Ja-iv': 'Jātaka',
    'Ja-v': 'Jātaka', 'Ja-vi': 'Jātaka', 'Ja-vii': 'Jātaka',
    'Netti': 'Nettippakaraṇa',
    'Pe': 'Peṭakopadesa',
    'Mil': 'Milindapañha',
    # ── Abhidhamma Piṭaka ─────────────────────────────────────────────
    'Dhs': 'Dhammasaṅgaṇī',
    'Vibh': 'Vibhaṅga',
    'Dhatuk': 'Dhātukathā',
    'Pug': 'Puggalapaññatti',
    'Kv': 'Kathāvatthu',
    'Yam': 'Yamaka',
    'Patth': 'Paṭṭhāna',
    # ── Other well-known texts ────────────────────────────────────────
    'Moh': 'Mohavicchedanī',
    'Lokan': 'Lokanīti',
    'Spk': 'Sāratthappakāsinī',
    'Ps': 'Paṭisambhidāmagga',
    'Kacc': 'Kaccāyanabyākaraṇa',
}

# Suffixes that mark a derived text; when book_id isn't in BOOK_NAMES
# directly, strip the last dash-segment and retry (Dhp-a → Dhp, etc.).
_DERIVED_SUFFIXES = {'a', 't', 'mt', 'anuṭ', 'nt', 'pv', 'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi'}


def english_book_name(book_id: str) -> str | None:
    """English display name for a book_id, or None if unknown.

    Exact match first; then tries stripping a split suffix (e.g. 'Dhp-a'
    → 'Dhp' → 'Dhammapada'); finally tries a case-insensitive match.
    """
    if not book_id:
        return None
    if book_id in BOOK_NAMES:
        return BOOK_NAMES[book_id]
    parts = book_id.split('-')
    if len(parts) > 1 and parts[-1] in _DERIVED_SUFFIXES:
        base = '-'.join(parts[:-1])
        if base in BOOK_NAMES:
            return BOOK_NAMES[base]
    for key, name in BOOK_NAMES.items():
        if key.lower() == book_id.lower():
            return name
    return None


def strip_html(text: str) -> str:
    """Strip HTML tags and decode entities → plain text (for titles/descriptions)."""
    if not text:
        return ''
    return html.unescape(re.sub(r'<[^>]+>', '', text)).strip()


def clean_translation(text: str) -> str:
    """Plain-text translation for titles: strip HTML and trailing punctuation."""
    text = strip_html(text)
    return text.rstrip('.').strip()


def _truncate(text: str, limit: int) -> str:
    """Truncate to `limit` chars, appending an ellipsis when cut."""
    text = text.strip()
    if len(text) <= limit:
        return text
    return text[:limit - 1].rstrip() + '…'


def book_seo_title(book_id: str, pali_name: str, lang_code: str, lang_native: str,
                   section_title: str | None = None,
                   section_translation: str | None = None,
                   section_path_titles: list[str] | None = None) -> str:
    """SEO <title> for a book page — or a deep-section page.

    Section pages lead with the section's translation (Pāli in parentheses),
    then the breadcrumb path (book › sutta), so every section in a book gets
    a unique title instead of sharing the book's. Book pages keep the
    English name first with the Pāli in parentheses.
    """
    en = english_book_name(book_id)
    if section_title:
        lead = f'{section_translation} ({section_title})' if section_translation else section_title
        context = ' · '.join([t for t in (section_path_titles or []) if t])
        if not context:
            context = en if en and en.lower() != pali_name.lower() else pali_name
        return f'{lead} — {context} | E-Piṭaka'[:90]

    if en and en.lower() != pali_name.lower():
        title = f'{en} ({pali_name})'
    else:
        title = pali_name
    lang_label = 'English Translation' if lang_code == 'en' else lang_native
    full = f'{title} — {lang_label} | E-Piṭaka'
    return full[:90]


def book_seo_description(book_id: str, pali_name: str, lang_code: str, lang_name: str,
                         section_title: str | None = None,
                         section_translation: str | None = None,
                         section_path: str | None = None,
                         section_excerpt: str | None = None) -> str:
    """Meta description for a book / deep-section page.

    Section pages get a unique description built from the section's own
    translation, its breadcrumb path, and a short excerpt of its translated
    text — no two sections in a book share a meta description. Kept under
    ~160 chars (Google's snippet length).
    """
    en = english_book_name(book_id)
    label = en if en and en.lower() != pali_name.lower() else pali_name
    if not section_title:
        return (f'Read {label} from the Chaṭṭha Saṅgāyana Tipiṭaka with '
                f'line-by-line {lang_name} translation. Free, searchable, mobile-friendly.')

    prefix = f'Read {section_title}'
    if section_translation:
        prefix += f' ({section_translation})'
    if section_path:
        prefix += f' — {section_path}'
    if section_excerpt:
        # Lead with a quote from the section's own translation — this is what
        # makes each section's description unique — budgeting the excerpt so
        # the whole description stays under ~160 chars.
        tail = '. Read free online.'
        excerpt_budget = 150 - len(prefix) - len(tail) - 4  # room for `: “…”`
        if excerpt_budget > 24:
            excerpt = _truncate(section_excerpt, excerpt_budget)
            excerpt = excerpt.strip('“”\"\'’‘').strip()
            return prefix + f': “{excerpt}”' + tail
    tail = (f', from the Chaṭṭha Saṅgāyana Tipiṭaka with line-by-line '
            f'{lang_name} translation. Free to read online.')
    return _truncate(prefix + tail, 150)


# ── Localized home-page content ─────────────────────────────────────────
# The landing page carries a server-rendered SEO section (H1, intro,
# popular-books links). English-only text there meant Google of e.g. /vi/
# saw English for Vietnamese queries — weak targeting. Each entry is a
# dict of the strings that section renders; `intro` supports a {count}
# placeholder (number of available translation languages) substituted at
# render time. Missing languages fall back to English.

HOME_L10N = {
    'en': {
        'title': 'E-Piṭaka — Chaṭṭha Saṅgāyana Tipiṭaka (English)',
        'description': ('Read the Pāli Tipiṭaka (Chaṭṭha Saṅgāyana edition) with '
                        'line-by-line translations in English, Sinhala, Thai, Tamil, '
                        'Lao, Myanmar and Vietnamese. Free, searchable, mobile-friendly.'),
        'h1': 'Read the Pāli Tipiṭaka — Chaṭṭha Saṅgāyana Edition',
        'intro': ('E-Piṭaka is a free digital edition of the Chaṭṭha Saṅgāyana Tipiṭaka '
                  '(the Sixth Buddhist Council edition of the Pāli Canon), with line-by-line '
                  'translations in {count} languages — English, Sinhala, Thai, Tamil, Lao, '
                  'Myanmar and Vietnamese. Read the Sutta, Vinaya and Abhidhamma Piṭakas, '
                  'search the full text, and study with the free mobile app.'),
        'popular': 'Popular books',
        'translations': 'Translations:',
        'about': 'About the translation project',
        'privacy': 'Privacy policy',
        'browse': 'Browse the Canon',
    },
    'vi': {
        'title': 'E-Piṭaka — Tam Tạng Pāḷi (Tiếng Việt)',
        'description': ('Đọc Tam Tạng Pāḷi (bản Kết tập lần thứ sáu) với bản dịch từng câu '
                        'sang tiếng Việt, Sinhala, Thái, Tamil, Lào, Myanmar và Anh. '
                        'Miễn phí, tra cứu được, tương thích di động.'),
        'h1': 'Đọc Tam Tạng Pāḷi — Bản Kết Tập Lần Thứ Sáu',
        'intro': ('E-Piṭaka là ấn bản kỹ thuật số miễn phí của Tam Tạng Pāḷi (bản Kết tập '
                  'lần thứ sáu của Đại hội Phật giáo), với bản dịch từng câu sang {count} '
                  'ngôn ngữ — tiếng Việt, Sinhala, Thái, Tamil, Lào, Myanmar và Anh. Đọc '
                  'Kinh, Luật và Luận tạng, tra cứu toàn văn và học tập với ứng dụng di '
                  'động miễn phí.'),
        'popular': 'Sách phổ biến',
        'translations': 'Bản dịch:',
        'about': 'Về dự án dịch thuật',
        'privacy': 'Chính sách quyền riêng tư',
        'browse': 'Duyệt Tam Tạng',
    },
    'th': {
        'title': 'E-Piṭaka — พระไตรปิฎก (ไทย)',
        'description': ('อ่านพระไตรปิฎกบาลี (ฉบับสังคายนาครั้งที่หก) พร้อมคำแปลบรรทัดต่อบรรทัด '
                        'เป็นภาษาไทย อังกฤษ สิงหล ทมิฬ ลาว พม่า และเวียดนาม ฟรี ค้นหาได้ '
                        'ใช้งานบนมือถือได้'),
        'h1': 'อ่านพระไตรปิฎกบาลี — ฉบับสังคายนาครั้งที่หก',
        'intro': ('E-Piṭaka เป็นฉบับดิจิทัลฟรีของพระไตรปิฎกบาลี (ฉบับสังคายนาครั้งที่หก) '
                  'พร้อมคำแปลบรรทัดต่อบรรทัดใน {count} ภาษา — ไทย อังกฤษ สิงหล ทมิฬ ลาว '
                  'พม่า และเวียดนาม อ่านพระสุตตันตปิฎก พระวินัยปิฎก และพระอภิธรรมปิฎก '
                  'ค้นหาข้อความเต็ม และศึกษาด้วยแอปมือถือฟรี'),
        'popular': 'หนังสือยอดนิยม',
        'translations': 'คำแปล:',
        'about': 'เกี่ยวกับโครงการแปล',
        'privacy': 'นโยบายความเป็นส่วนตัว',
        'browse': 'เปิดดูพระไตรปิฎก',
    },
    'si': {
        'title': 'E-Piṭaka — ත්‍රිපිටකය (සිංහල)',
        'description': ('පාලි ත්‍රිපිටකය (ඡට්ඨ සංගායනා සංස්කරණය) සිංහල, ඉංග්‍රීසි, '
                        'තායි, දෙමළ, ලාඕ, බුරුම සහ වියට්නාම පරිවර්තන සමඟ කියවන්න. '
                        'නොමිලේ, සෙවිය හැකි, ජංගම-හිතකාමී.'),
        'h1': 'පාලි ත්‍රිපිටකය කියවන්න — ඡට්ඨ සංගායනා සංස්කරණය',
        'intro': ('E-Piṭaka යනු ඡට්ඨ සංගායනා ත්‍රිපිටකයේ (හයවන බෞද්ධ සංගායනා '
                  'සංස්කරණය) නොමිලේ ඩිජිටල් සංස්කරණයකි. {count} ක භාෂාවලින් '
                  'පේළියෙන් පේළිය පරිවර්තන සහිතයි — සිංහල, ඉංග්‍රීසි, තායි, දෙමළ, '
                  'ලාඕ, බුරුම සහ වියට්නාම. සූත්‍ර පිටකය, විනය පිටකය සහ අභිධර්ම '
                  'පිටකය කියවන්න, සම්පූර්ණ පාඨය සොයන්න, නොමිලේ ජංගම යෙදුමෙන් '
                  'අධ්‍යයනය කරන්න.'),
        'popular': 'ජනප්‍රිය පොත්',
        'translations': 'පරිවර්තන:',
        'about': 'පරිවර්තන ව්‍යාපෘතිය ගැන',
        'privacy': 'රහස්‍යතා ප්‍රතිපත්තිය',
        'browse': 'ත්‍රිපිටකය බලන්න',
    },
    'ta': {
        'title': 'E-Piṭaka — திரிபிடகம் (தமிழ்)',
        'description': ('பாலி திரிபிடகத்தை (சட்டா சங்காயன பதிப்பு) தமிழ், ஆங்கிலம், '
                        'சிங்களம், தாய், லாவோ, பர்மியம் மற்றும் வியட்நாம் '
                        'மொழிபெயர்ப்புகளுடன் படியுங்கள். இலவசம், தேடக்கூடியது, '
                        'மொபைல் நட்பு.'),
        'h1': 'பாலி திரிபிடகத்தைப் படியுங்கள் — சட்டா சங்காயன பதிப்பு',
        'intro': ('E-Piṭaka என்பது சட்டா சங்காயன திரிபிடகத்தின் (ஆறாவது பௌத்த '
                  'சங்கீதியின் பதிப்பு) இலவச டிஜிட்டல் பதிப்பாகும். {count} மொழிகளில் '
                  'வரிக்கு வரி மொழிபெயர்ப்புகள் — தமிழ், ஆங்கிலம், சிங்களம், தாய், '
                  'லாவோ, பர்மியம் மற்றும் வியட்நாம். சுத்த பிடகம், விநய பிடகம், '
                  'அபிதம்ம பிடகம் ஆகியவற்றைப் படியுங்கள், முழு உரையையும் தேடுங்கள், '
                  'இலவச மொபைல் பயன்பாட்டில் கற்றுக்கொள்ளுங்கள்.'),
        'popular': 'பிரபலமான நூல்கள்',
        'translations': 'மொழிபெயர்ப்புகள்:',
        'about': 'மொழிபெயர்ப்புத் திட்டம் பற்றி',
        'privacy': 'தனியுரிமைக் கொள்கை',
        'browse': 'திரிபிடகத்தை உலாவு',
    },
    'lo': {
        'title': 'E-Piṭaka — ພະໄຕຣປິດົກ (ລາວ)',
        'description': ('ອ່ານພະໄຕຣປິດົກບາລີ (ສະບັບສັງຄາຍນາຄັ້ງທີ 6) ພ້ອມຄຳແປ '
                        'ແບບບັນທັດຕໍ່ບັນທັດເປັນພາສາລາວ, ອັງກິດ, ສີງຫານ, '
                        'ໄທ, ທະມິນ, ພະມ້າ ແລະ ຫວຽດນາມ. ຟຣີ, ຊອກຫາໄດ້, '
                        'ເໝາະສຳລັບມືຖື.'),
        'h1': 'ອ່ານພະໄຕຣປິດົກບາລີ — ສະບັບສັງຄາຍນາຄັ້ງທີ 6',
        'intro': ('E-Piṭaka ເປັນສະບັບດິຈິຕອນຟຣີຂອງພະໄຕຣປິດົກບາລີ '
                  '(ສັງຄາຍນາຄັ້ງທີ 6), ພ້ອມຄຳແປແບບບັນທັດຕໍ່ບັນທັດໃນ '
                  '{count} ພາສາ — ລາວ, ອັງກິດ, ສີງຫານ, ໄທ, ທະມິນ, ພະມ້າ ແລະ '
                  'ຫວຽດນາມ. ອ່ານພະສຸດຕັນຕະປິດົກ, ພະວິນັຍປິດົກ ແລະ '
                  'ພະອະພິທຳມະປິດົກ, ຄົ້ນຫາຂໍ້ຄວາມເຕັມ ແລະ ຮຽນຮູ້ດ້ວຍ '
                  'ແອັບມືຖືຟຣີ.'),
        'popular': 'ປຶ້ມຍອດນິຍົມ',
        'translations': 'ຄຳແປ:',
        'about': 'ກ່ຽວກັບໂຄງການແປ',
        'privacy': 'ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ',
        'browse': 'ເປີດເບິ່ງພະໄຕຣປິດົກ',
    },
    'my': {
        'title': 'E-Piṭaka — ပိဋကတ်တော် (မြန်မာ)',
        'description': ('ပါဠိပိဋကတ်တော် (ဆဋ္ဌသင်္ဂါယနာတင် ထုတ်ဝေမှု) ကို မြန်မာ၊ '
                        'အင်္ဂလိပ်၊ သီဟိုဠ်၊ ထိုင်း၊ တမီးလ်၊ လာအို နှင့် ဗီယက်နမ် '
                        'ဘာသာပြန်များဖြင့် ဖတ်ရှုပါ။ အခမဲ့၊ ရှာဖွေနိုင်သော၊ '
                        'မိုဘိုင်းလ် အဆင်ပြေသည်။'),
        'h1': 'ပါဠိပိဋကတ်တော်ကို ဖတ်ရှုပါ — ဆဋ္ဌသင်္ဂါယနာတင် ထုတ်ဝေမှု',
        'intro': ('E-Piṭaka သည် ဆဋ္ဌသင်္ဂါယနာတင် ပိဋကတ်တော်၏ အခမဲ့ ဒစ်ဂျစ်တယ် '
                  'ထုတ်ဝေမှုဖြစ်ပြီး {count} ဘာသာဖြင့် စာကြောင်းအလိုက် '
                  'ဘာသာပြန်ဆိုထားသည် — မြန်မာ၊ အင်္ဂလိပ်၊ သီဟိုဠ်၊ ထိုင်း၊ '
                  'တမီးလ်၊ လာအို နှင့် ဗီယက်နမ်။ သုတ္တန်၊ ဝိနည်းနှင့် အဘိဓမ္မာ '
                  'ပိဋကတ်များကို ဖတ်ရှုပါ၊ စာသားအပြည့်အစုံ ရှာဖွေပါ၊ အခမဲ့ '
                  'မိုဘိုင်းအက်ပ်ဖြင့် လေ့လာပါ။'),
        'popular': 'လူကြိုက်များသော ကျမ်းများ',
        'translations': 'ဘာသာပြန်များ:',
        'about': 'ဘာသာပြန်စီမံကိန်း အကြောင်း',
        'privacy': 'ကိုယ်ရေးအချက်အလက် မူဝါဒ',
        'browse': 'ပိဋကတ်တော်ကို ကြည့်ရှုရန်',
    },
    'pt': {
        'title': 'E-Piṭaka — Tipiṭaka (Português)',
        'description': ('Leia o Tipiṭaka Pāli (edição Chaṭṭha Saṅgāyana) com traduções '
                        'linha a linha em português, inglês, cingalês, tailandês, tâmil, '
                        'laosiano, birmanês e vietnamita. Grátis, pesquisável, compatível '
                        'com celular.'),
        'h1': 'Leia o Tipiṭaka Pāli — Edição Chaṭṭha Saṅgāyana',
        'intro': ('O E-Piṭaka é uma edição digital gratuita do Tipiṭaka Chaṭṭha '
                  'Saṅgāyana (o cânon páli do Sexto Concílio Budista), com traduções '
                  'linha a linha em {count} idiomas — português, inglês, cingalês, '
                  'tailandês, tâmil, laosiano, birmanês e vietnamita. Leia os Nikāyas, '
                  'o Vinaya e o Abhidhamma, pesquise o texto completo e estude com o '
                  'aplicativo móvel gratuito.'),
        'popular': 'Livros populares',
        'translations': 'Traduções:',
        'about': 'Sobre o projeto de tradução',
        'privacy': 'Política de privacidade',
        'browse': 'Explorar o Tipiṭaka',
    },
    'de': {
        'title': 'E-Piṭaka — Tipiṭaka (Deutsch)',
        'description': ('Lies den Pāli-Tipiṭaka (Chaṭṭha-Saṅgāyana-Ausgabe) mit '
                        'Zeile-für-Zeile-Übersetzungen in Deutsch, Englisch, '
                        'Singhalesisch, Thailändisch, Tamil, Laotisch, Birmanisch und '
                        'Vietnamesisch. Kostenlos, durchsuchbar, mobilfreundlich.'),
        'h1': 'Lies den Pāli-Tipiṭaka — Chaṭṭha-Saṅgāyana-Ausgabe',
        'intro': ('E-Piṭaka ist eine kostenlose digitale Ausgabe des '
                  'Chaṭṭha-Saṅgāyana-Tipiṭaka (der Pali-Kanon des Sechsten '
                  'Buddhistischen Konzils) mit Zeile-für-Zeile-Übersetzungen in '
                  '{count} Sprachen — Deutsch, Englisch, Singhalesisch, Thailändisch, '
                  'Tamil, Laotisch, Birmanisch und Vietnamesisch. Lies Sutta-, Vinaya- '
                  'und Abhidhamma-Piṭaka, durchsuche den vollständigen Text und lerne '
                  'mit der kostenlosen Mobile-App.'),
        'popular': 'Beliebte Bücher',
        'translations': 'Übersetzungen:',
        'about': 'Über das Übersetzungsprojekt',
        'privacy': 'Datenschutzrichtlinie',
        'browse': 'Tipiṭaka durchstöbern',
    },
    'nl': {
        'title': 'E-Piṭaka — Tipiṭaka (Nederlands)',
        'description': ('Lees de Pāli-Tipiṭaka (Chaṭṭha-Saṅgāyana-editie) met '
                        'regel-voor-regel vertalingen in het Nederlands, Engels, '
                        'Singalees, Thais, Tamil, Laotiaans, Birmees en Vietnamees. '
                        'Gratis, doorzoekbaar, mobielvriendelijk.'),
        'h1': 'Lees de Pāli-Tipiṭaka — Chaṭṭha-Saṅgāyana-editie',
        'intro': ('E-Piṭaka is een gratis digitale editie van de '
                  'Chaṭṭha-Saṅgāyana-Tipiṭaka (de Pali-canon van het Zesde '
                  'Boeddhistische Concilie) met regel-voor-regel vertalingen in '
                  '{count} talen — Nederlands, Engels, Singalees, Thais, Tamil, '
                  'Laotiaans, Birmees en Vietnamees. Lees de Sutta-, Vinaya- en '
                  'Abhidhamma-Piṭaka, doorzoek de volledige tekst en studeer met de '
                  'gratis mobiele app.'),
        'popular': 'Populaire boeken',
        'translations': 'Vertalingen:',
        'about': 'Over het vertaalproject',
        'privacy': 'Privacybeleid',
        'browse': 'Tipiṭaka verkennen',
    },
    'np': {
        'title': 'E-Piṭaka — त्रिपिटक (नेपाली)',
        'description': ('पालि त्रिपिटक (छट्ठ सङ्गायन संस्करण) नेपाली, अङ्ग्रेजी, '
                        'सिंहली, थाई, तमिल, लाओ, म्यान्मार र भियतनामी अनुवादसहित '
                        'पढ्नुहोस्। निःशुल्क, खोज्न मिल्ने, मोबाइल-मैत्री।'),
        'h1': 'पालि त्रिपिटक पढ्नुहोस् — छट्ठ सङ्गायन संस्करण',
        'intro': ('E-Piṭaka छट्ठ सङ्गायन त्रिपिटक (छैठौं बौद्ध सङ्गायनको संस्करण) को '
                  'निःशुल्क डिजिटल संस्करण हो, जसमा {count} भाषाहरूमा '
                  'पङ्क्ति-दर-पङ्क्ति अनुवाद छ — नेपाली, अङ्ग्रेजी, सिंहली, थाई, '
                  'तमिल, लाओ, म्यान्मार र भियतनामी। सुत्त, विनय र अभिधम्म पिटक '
                  'पढ्नुहोस्, पूरा पाठ खोज्नुहोस् र निःशुल्क मोबाइल एपमा अध्ययन '
                  'गर्नुहोस्।'),
        'popular': 'लोकप्रिय पुस्तकहरू',
        'translations': 'अनुवादहरू:',
        'about': 'अनुवाद परियोजनाको बारेमा',
        'privacy': 'गोपनीयता नीति',
        'browse': 'त्रिपिटक ब्राउज गर्नुहोस्',
    },
    'cn': {
        'title': 'E-Piṭaka — 巴利三藏 (中文)',
        'description': ('在线阅读巴利三藏（第六次结集版），提供中文、英语、僧伽罗语、泰语、'
                        '泰米尔语、老挝语、缅甸语和越南语逐句对照翻译。免费、可搜索、'
                        '移动端友好。'),
        'h1': '阅读巴利三藏 — 第六次结集版',
        'intro': ('E-Piṭaka 是巴利三藏（第六次结集版）的免费数字版本，提供 {count} 种语言'
                  '的逐句对照翻译 — 中文、英语、僧伽罗语、泰语、泰米尔语、老挝语、'
                  '缅甸语和越南语。阅读经藏、律藏和论藏，搜索全文，并通过免费移动应用学习。'),
        'popular': '热门经典',
        'translations': '翻译版本：',
        'about': '关于翻译项目',
        'privacy': '隐私政策',
        'browse': '浏览三藏',
    },
}


def home_l10n(lang_code: str, count: int) -> dict:
    """Localized home-page strings (H1, intro, labels, title, description).

    Falls back to English for languages without an entry; `intro` gets the
    {count} placeholder filled with the number of available languages.
    """
    entry = HOME_L10N.get(lang_code) or HOME_L10N['en']
    return {**entry, 'intro': entry['intro'].format(count=count)}


def popular_books(lang: str = 'en') -> list:
    """A short curated list of the most-searched books, for home-page links.

    Names are localized when a translation for [lang] exists (so /vi/ shows
    "Kinh Pháp Cú" for Dhp), falling back to the English name.
    """
    localized = BOOK_NAMES_LOCALIZED.get(lang, {})
    ids = ['Dhp', 'Sn', 'Ud', 'It', 'Th', 'Thi', 'Ja', 'Khp', 'D', 'M', 'S', 'A', 'Mil', 'Vin']
    return [{'id': bid, 'name': localized.get(bid) or english_book_name(bid) or bid} for bid in ids]


# ── Localized book names for the popular-books list ───────────────────────
# book_id → name in [lang]. The same books that appear on the home page; the
# English BOOK_NAMES above stay the fallback. Only languages with a deployed
# translation DB are listed (missing entries fall back to English).
BOOK_NAMES_LOCALIZED = {
    'vi': {
        'Dhp': 'Kinh Pháp Cú', 'Sn': 'Kinh Tập', 'Ud': 'Phật Tự Thuyết',
        'It': 'Phật Thuyết Như Vậy', 'Th': 'Trưởng Lão Tăng Kệ', 'Thi': 'Trưởng Lão Ni Kệ',
        'Ja': 'Kinh Bổn Sanh', 'Khp': 'Tiểu Tụng', 'D': 'Trường Bộ Kinh',
        'M': 'Trung Bộ Kinh', 'S': 'Tương Ưng Bộ Kinh', 'A': 'Tăng Chi Bộ Kinh',
        'Mil': 'Milinda Vấn Đạo', 'Vin': 'Luật Tạng',
    },
    'th': {
        'Dhp': 'พระธรรมบท', 'Sn': 'สุตตนิบาต', 'Ud': 'อุทาน',
        'It': 'อิติวุตตกะ', 'Th': 'เถรคาถา', 'Thi': 'เถรีคาถา',
        'Ja': 'ชาดก', 'Khp': 'ขุททกปาฐะ', 'D': 'ทีฆนิกาย',
        'M': 'มัชฌิมนิกาย', 'S': 'สังยุตตนิกาย', 'A': 'อังคุตตรนิกาย',
        'Mil': 'มิลินทปัญหา', 'Vin': 'พระวินัยปิฎก',
    },
    'si': {
        'Dhp': 'ධම්මපදය', 'Sn': 'සුත්ත නිපාතය', 'Ud': 'උදානය',
        'It': 'ඉතිවුත්තකය', 'Th': 'ථෙරගාථා', 'Thi': 'ථෙරීගාථා',
        'Ja': 'ජාතක කතා', 'Khp': 'ඛුද්දක පාඨය', 'D': 'දීඝ නිකාය',
        'M': 'මජ්ඣිම නිකාය', 'S': 'සංයුත්ත නිකාය', 'A': 'අංගුත්තර නිකාය',
        'Mil': 'මිලින්ද ප්‍රශ්නය', 'Vin': 'විනය පිටකය',
    },
    'ta': {
        'Dhp': 'தம்மபதம்', 'Sn': 'சுத்த நிபாதம்', 'Ud': 'உதானம்',
        'It': 'இதிவுத்தகம்', 'Th': 'தேரகாதா', 'Thi': 'தேரிகாதா',
        'Ja': 'ஜாதகக் கதைகள்', 'Khp': 'குத்தக பாடம்', 'D': 'தீக நிகாயம்',
        'M': 'மஜ்ஜிம நிகாயம்', 'S': 'ஸம்யுத்த நிகாயம்', 'A': 'அங்குத்தர நிகாயம்',
        'Mil': 'மிலிந்த பஞ்ஹை', 'Vin': 'விநய பிடகம்',
    },
    'lo': {
        'Dhp': 'ພະທຳມະບົດ', 'Sn': 'ສຸດຕະນິປາດ', 'Ud': 'ອຸທານ',
        'It': 'ອິຕິວຸດຕະກະ', 'Th': 'ເຖລະຄາຖາ', 'Thi': 'ເຖລີຄາຖາ',
        'Ja': 'ຊາດົກ', 'Khp': 'ຂຸດທະກະປາຖະ', 'D': 'ທີຆະນິກາຍ',
        'M': 'ມັຊຌິມະນິກາຍ', 'S': 'ສັງຍຸດຕະນິກາຍ', 'A': 'ອັງຄຸດຕະຣະນິກາຍ',
        'Mil': 'ມິລິນທະປັນຫາ', 'Vin': 'ວິນັຍປິດົກ',
    },
    'my': {
        'Dhp': 'ဓမ္မပဒ', 'Sn': 'သုတ္တနိပါတ်', 'Ud': 'ဥဒါန်း',
        'It': 'ဣတိဝုတ်', 'Th': 'ထေရဂါထာ', 'Thi': 'ထေရီဂါထာ',
        'Ja': 'ဇာတက', 'Khp': 'ခုဒ္ဒကပါဌ', 'D': 'ဒီဃနိကာယ',
        'M': 'မဇ္ဈိမနိကာယ', 'S': 'သံယုတ္တနိကာယ', 'A': 'အင်္ဂုတ္တရနိကာယ',
        'Mil': 'မိလိန္ဒပဉှာ', 'Vin': 'ဝိနည်းပိဋက',
    },
    'pt': {
        'Dhp': 'Dhammapada', 'Sn': 'Sutta Nipāta', 'Ud': 'Udāna',
        'It': 'Itivuttaka', 'Th': 'Theragāthā', 'Thi': 'Therīgāthā',
        'Ja': 'Jātaka', 'Khp': 'Khuddakapāṭha', 'D': 'Dīgha Nikāya',
        'M': 'Majjhima Nikāya', 'S': 'Saṃyutta Nikāya', 'A': 'Aṅguttara Nikāya',
        'Mil': 'Milindapañha', 'Vin': 'Vinaya Piṭaka',
    },
    'de': {
        'Dhp': 'Dhammapada', 'Sn': 'Sutta Nipāta', 'Ud': 'Udāna',
        'It': 'Itivuttaka', 'Th': 'Theragāthā', 'Thi': 'Therīgāthā',
        'Ja': 'Jātaka', 'Khp': 'Khuddakapāṭha', 'D': 'Dīgha Nikāya',
        'M': 'Majjhima Nikāya', 'S': 'Saṃyutta Nikāya', 'A': 'Aṅguttara Nikāya',
        'Mil': 'Milindapañha', 'Vin': 'Vinaya Piṭaka',
    },
    'nl': {
        'Dhp': 'Dhammapada', 'Sn': 'Sutta Nipāta', 'Ud': 'Udāna',
        'It': 'Itivuttaka', 'Th': 'Theragāthā', 'Thi': 'Therīgāthā',
        'Ja': 'Jātaka', 'Khp': 'Khuddakapāṭha', 'D': 'Dīgha Nikāya',
        'M': 'Majjhima Nikāya', 'S': 'Saṃyutta Nikāya', 'A': 'Aṅguttara Nikāya',
        'Mil': 'Milindapañha', 'Vin': 'Vinaya Piṭaka',
    },
    'np': {
        'Dhp': 'धम्मपद', 'Sn': 'सुत्तनिपात', 'Ud': 'उदान',
        'It': 'इतिवुत्तक', 'Th': 'थेरगाथा', 'Thi': 'थेरीगाथा',
        'Ja': 'जातक', 'Khp': 'खुद्दकपाठ', 'D': 'दीघनिकाय',
        'M': 'मज्झिमनिकाय', 'S': 'संयुत्तनिकाय', 'A': 'अंगुत्तरनिकाय',
        'Mil': 'मिलिन्दपञ्ह', 'Vin': 'विनयपिटक',
    },
    'cn': {
        'Dhp': '法句经', 'Sn': '经集', 'Ud': '自说经',
        'It': '如是语经', 'Th': '长老偈', 'Thi': '长老尼偈',
        'Ja': '本生经', 'Khp': '小诵', 'D': '长部',
        'M': '中部', 'S': '相应部', 'A': '增支部',
        'Mil': '弥兰王问经', 'Vin': '律藏',
    },
}


# ── JSON-LD builders ─────────────────────────────────────────────────────

def website_jsonld(lang_code: str, available_langs: list | None = None) -> dict:
    """WebSite + Organization JSON-LD for the homepage.

    When *available_langs* is provided (list of lang dicts from
    Config.detect_translations), the schema includes ``inLanguage`` as
    an array so Google understands the site offers multiple language
    versions — this helps trigger language sitelinks in search results.
    """
    # Build the inLanguage value: always a list for multi-language sites.
    langs = [lang_code]
    if available_langs:
        langs = [l['code'] for l in available_langs]

    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                '@id': absolute('/') + '#website',
                'url': absolute('/'),
                'name': 'E-Piṭaka',
                'alternateName': 'E-Pitaka — Chaṭṭha Saṅgāyana Tipiṭaka',
                'description': ('Read the Pāli Tipiṭaka of the Chaṭṭha Saṅgāyana '
                                'edition with line-by-line translations in English, '
                                'Sinhala, Thai, Lao, Myanmar, Vietnamese, Tamil and more.'),
                'inLanguage': langs,
                'publisher': {'@type': 'Organization', 'name': 'E-Piṭaka', 'url': absolute('/')},
                'potentialAction': {
                    '@type': 'SearchAction',
                    'target': {
                        '@type': 'EntryPoint',
                        'urlTemplate': absolute('/search?q={search_term_string}'),
                    },
                    'query-input': 'required name=search_term_string',
                },
            },
            {
                '@type': 'Organization',
                '@id': absolute('/') + '#organization',
                'name': 'E-Piṭaka',
                'url': absolute('/'),
                'logo': {'@type': 'ImageObject', 'url': absolute('/static/icon.png')},
            },
        ],
    }


# ── Study-guide / outline pages ───────────────────────────────────────────
# AI-generated study guides are English-only content, so these pages live at
# /en/study/... and /en/book/.../outline and get their own unique titles,
# descriptions, canonical URLs and Article schema.

def study_seo_title(book_id: str, summary_title: str, pali_name: str) -> str:
    """SEO <title> for one study-guide page."""
    en = english_book_name(book_id)
    context = en if en and en.lower() != pali_name.lower() else pali_name
    title = summary_title.strip() or 'Study Guide'
    return f'{title} — {context} | E-Piṭaka'[:90]


def study_seo_description(summary_title: str, pali_name: str,
                          plain_text: str) -> str:
    """Meta description for a study-guide page — unique per section."""
    lead = summary_title.strip() or 'Study guide'
    if plain_text:
        budget = 150 - len(lead) - 30
        if budget > 24:
            excerpt = _truncate(plain_text, budget)
            return _truncate(f'{lead}: {excerpt}. Read free online.', 155)
    return _truncate(f'{lead} — from the {pali_name} with commentary and '
                     f'sub-commentary. Read free online.', 155)


def study_jsonld(book_id: str, summary_title: str, pali_name: str,
                 page_url: str, home_url: str, book_url: str,
                 sutta_title: str | None = None,
                 section_url: str | None = None) -> dict:
    """Article + BreadcrumbList schema for a study-guide page."""
    en = english_book_name(book_id)
    name = f'{en} ({pali_name})' if en and en.lower() != pali_name.lower() else pali_name
    breadcrumb = [
        {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': home_url},
        {'@type': 'ListItem', 'position': 2, 'name': name, 'item': book_url},
    ]
    if sutta_title:
        crumb = {'@type': 'ListItem', 'position': 3, 'name': sutta_title}
        if section_url:
            crumb['item'] = section_url
        breadcrumb.append(crumb)
    breadcrumb.append({
        '@type': 'ListItem', 'position': len(breadcrumb) + 1,
        'name': summary_title.strip() or 'Study Guide', 'item': page_url,
    })
    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Article',
                '@id': page_url + '#article',
                'headline': summary_title.strip() or 'Study Guide',
                'inLanguage': 'en',
                'url': page_url,
                'image': absolute('/static/og-image.png'),
                'isPartOf': {
                    '@type': 'Book',
                    'name': name,
                    'alternateName': pali_name,
                    'url': book_url,
                },
                'about': name,
                'publisher': {'@type': 'Organization', 'name': 'E-Piṭaka', 'url': absolute('/')},
                'author': {'@type': 'Organization', 'name': 'E-Piṭaka', 'url': absolute('/')},
                'mainEntityOfPage': page_url,
            },
            {'@type': 'BreadcrumbList', 'itemListElement': breadcrumb},
        ],
    }


def outline_seo_title(book_id: str, pali_name: str) -> str:
    """SEO <title> for a book's outline page."""
    en = english_book_name(book_id)
    context = en if en and en.lower() != pali_name.lower() else pali_name
    return f'Outline of {context} ({pali_name}) — all sections | E-Piṭaka'[:90]


def outline_seo_description(book_id: str, pali_name: str) -> str:
    """Meta description for a book's outline page."""
    en = english_book_name(book_id)
    label = en if en and en.lower() != pali_name.lower() else pali_name
    return (f'Complete outline of {label}: every section of the {pali_name} '
            f'with links to its study guide and the original Pāli text. '
            'Free to read online.')


def book_jsonld(book_id: str, pali_name: str, lang_code: str, page_url: str,
                home_url: str, book_url: str | None = None,
                section_path: list[dict] | None = None) -> dict:
    """Book + BreadcrumbList schema for book and deep-section pages.

    `section_path` is a list of {'title', 'url'} from the book down to the
    active section; each becomes a BreadcrumbList item so crawlers see the
    full navigation path to the passage.
    """
    en = english_book_name(book_id)
    name = f'{en} ({pali_name})' if en and en.lower() != pali_name.lower() else pali_name
    book_url = book_url or page_url
    breadcrumb = [
        {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': home_url},
        {'@type': 'ListItem', 'position': 2, 'name': name, 'item': book_url},
    ]
    if section_path:
        for i, item in enumerate(section_path, start=3):
            crumb = {'@type': 'ListItem', 'position': i, 'name': item['title']}
            # Headings without a page of their own (e.g. a sutta that only
            # contains sub-headings) stay text-only crumbs — no `item`.
            if item.get('url'):
                crumb['item'] = item['url']
            breadcrumb.append(crumb)
    graph = [
        {
            '@type': 'Book',
            '@id': page_url + '#book',
            'name': name,
            'alternateName': pali_name,
            'inLanguage': lang_code,
            'url': book_url,
            'image': absolute('/static/og-image.png'),
            'isPartOf': {
                '@type': 'CreativeWork',
                'name': 'Chaṭṭha Saṅgāyana Tipiṭaka',
                'url': absolute('/'),
            },
            'publisher': {'@type': 'Organization', 'name': 'E-Piṭaka', 'url': absolute('/')},
            'bookFormat': 'https://schema.org/EBook',
            'accessMode': 'textual',
        },
        {
            '@type': 'BreadcrumbList',
            'itemListElement': breadcrumb,
        },
    ]
    return {'@context': 'https://schema.org', '@graph': graph}
