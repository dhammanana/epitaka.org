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
    'Thī': 'Therīgāthā',
    'Ap': 'Apadāna',
    'Bv': 'Buddhavaṃsa',
    'Cp': 'Cariyāpiṭaka',
    'Ja': 'Jātaka',
    'Ja-i': 'Jātaka', 'Ja-ii': 'Jātaka', 'Ja-iii': 'Jātaka', 'Ja-iv': 'Jātaka',
    'Ja-v': 'Jātaka', 'Ja-vi': 'Jātaka', 'Ja-vii': 'Jātaka',
    'Netti': 'Nettippakaraṇa',
    'Nett': 'Nettippakaraṇa',
    'Pe': 'Peṭakopadesa',
    'Pet': 'Peṭakopadesa',
    'Paṭis': 'Paṭisambhidāmagga',
    'Ps': 'Paṭisambhidāmagga',
    'Mil': 'Milindapañha',
    # ── Abhidhamma Piṭaka ─────────────────────────────────────────────
    'Dhs': 'Dhammasaṅgaṇī',
    'Vibh': 'Vibhaṅga',
    'Dhatuk': 'Dhātukathā',
    'Pug': 'Puggalapaññatti',
    'Pp': 'Puggalapaññatti',
    'Kv': 'Kathāvatthu',
    'Yam': 'Yamaka',
    'Patth': 'Paṭṭhāna',
    'Paṭṭh': 'Paṭṭhāna',
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
                   section_path_titles: list[str] | None = None,
                   display_name: str | None = None) -> str:
    """SEO <title> for a book page — or a deep-section page.

    Section pages lead with the section's translation (Pāli in parentheses),
    then the breadcrumb path (book › sutta), so every section in a book gets
    a unique title instead of sharing the book's. English book pages keep the
    English name first with the Pāli in parentheses (the ranking-sensitive
    case); other languages lead with the localized book name.
    """
    en = english_book_name(book_id)
    if section_title:
        lead = f'{section_translation} ({section_title})' if section_translation else section_title
        context = ' · '.join([t for t in (section_path_titles or []) if t])
        if not context:
            context = en if en and en.lower() != pali_name.lower() else pali_name
        return f'{lead} — {context} | E-Piṭaka'[:90]

    if lang_code != 'en' and display_name:
        return f'{display_name} — {lang_native} | E-Piṭaka'[:90]

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
                         section_excerpt: str | None = None,
                         display_name: str | None = None) -> str:
    """Meta description for a book / deep-section page.

    Section pages get a unique description built from the section's own
    translation, its breadcrumb path, and a short excerpt of its translated
    text — no two sections in a book share a meta description. Kept under
    ~160 chars (Google's snippet length).
    """
    en = english_book_name(book_id)
    if lang_code != 'en' and display_name:
        label = display_name
    else:
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
# dict of the strings that section renders; `intro` and `description`
# support a {count} placeholder (number of available translation
# languages) substituted at render time.
#
# Coverage follows the deployed translation DBs (see app/languages.py,
# which follows the translator's LANG_NAMES). Missing languages fall
# back to English automatically via home_l10n() — adding a translation
# DB never requires a code change here, only an optional HOME_L10N /
# HOME_NAV_L10N / BOOK_NAMES_LOCALIZED entry for fully localized SEO copy.

HOME_L10N = {
    'en': {
        'title': 'Tipitaka in English — Read the Pāli Canon Online, Free | E-Piṭaka',
        'description': ('Read the Pāli Canon (Tipitaka) online, free. Chaṭṭha '
                        'Saṅgāyana edition with line-by-line translations in {count} '
                        'languages including English, Sinhala, Burmese, Thai and '
                        'Vietnamese. Searchable.'),
        'h1': 'Tipitaka in English — Read the Pāli Canon, Chaṭṭha Saṅgāyana Edition',
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
    'bn': {
        'title': 'E-Piṭaka — ত্রিপিটক (বাংলা)',
        'description': ('পালি ত্রিপিটক (ছট্ঠ সঙ্গায়ন সংস্করণ) বাংলা, ইংরেজি, '
                        'সিংহল, থাই, তামিল, লাও, মায়ানমার ও ভিয়েতনামি অনুবাদসহ '
                        'পড়ুন। বিনামূল্যে, সার্চযোগ্য, মোবাইল-বান্ধব।'),
        'h1': 'পালি ত্রিপিটক পড়ুন — ছট্ঠ সঙ্গায়ন সংস্করণ',
        'intro': ('E-Piṭaka হলো ছট্ঠ সঙ্গায়ন ত্রিপিটকের (ষষ্ঠ বৌদ্ধ সঙ্গায়ন '
                  'সংস্করণ) বিনামূল্যের ডিজিটাল সংস্করণ, {count}টি ভাষায় '
                  'লাইন-বাই-লাইন অনুবাদসহ — বাংলা, ইংরেজি, সিংহল, থাই, '
                  'তামিল, লাও, মায়ানমার ও ভিয়েতনামি। সুত্ত, বিনয় ও অভিধম্ম '
                  'পিটক পড়ুন, সম্পূর্ণ পাঠ খুঁজুন এবং বিনামূল্যের মোবাইল '
                  'অ্যাপে অধ্যয়ন করুন।'),
        'popular': 'জনপ্রিয় বই',
        'translations': 'অনুবাদ:',
        'about': 'অনুবাদ প্রকল্প সম্পর্কে',
        'privacy': 'গোপনীয়তা নীতি',
        'browse': 'ত্রিপিটক ব্রাউজ করুন',
    },
    'hi': {
        'title': 'E-Piṭaka — त्रिपिटक (हिन्दी)',
        'description': ('पालि त्रिपिटक (छट्ठ सङ्गायन संस्करण) हिन्दी, अंग्रेजी, '
                        'सिंहली, थाई, तमिल, लाओ, म्यांमार और वियतनामी अनुवाद '
                        'सहित पढ़ें। निःशुल्क, खोज योग्य, मोबाइल-अनुकूल।'),
        'h1': 'पालि त्रिपिटक पढ़ें — छट्ठ सङ्गायन संस्करण',
        'intro': ('E-Piṭaka छट्ठ सङ्गायन त्रिपिटक (छठी बौद्ध संगीति का संस्करण) '
                  'का निःशुल्क डिजिटल संस्करण है, {count} भाषाओं में '
                  'पंक्ति-दर-पंक्ति अनुवाद सहित — हिन्दी, अंग्रेजी, सिंहली, '
                  'थाई, तमिल, लाओ, म्यांमार और वियतनामी। सुत्त, विनय और '
                  'अभिधम्म पिटक पढ़ें, पूरा पाठ खोजें और निःशुल्क मोबाइल ऐप '
                  'से अध्ययन करें।'),
        'popular': 'लोकप्रिय पुस्तकें',
        'translations': 'अनुवाद:',
        'about': 'अनुवाद परियोजना के बारे में',
        'privacy': 'गोपनीयता नीति',
        'browse': 'त्रिपिटक देखें',
    },
    'es': {
        'title': 'E-Piṭaka — Tipiṭaka (Español)',
        'description': ('Lea el Tipiṭaka Pāli (edición Chaṭṭha Saṅgāyana) con traducciones '
                        'línea a línea en español, inglés, cingalés, tailandés, tamil, '
                        'laosiano, birmano y vietnamita. Gratis, con búsqueda, compatible '
                        'con móvil.'),
        'h1': 'Lea el Tipiṭaka Pāli — Edición Chaṭṭha Saṅgāyana',
        'intro': ('E-Piṭaka es una edición digital gratuita del Tipiṭaka Chaṭṭha '
                  'Saṅgāyana (el canon pali del Sexto Concilio Budista), con traducciones '
                  'línea a línea en {count} idiomas — español, inglés, cingalés, '
                  'tailandés, tamil, laosiano, birmano y vietnamita. Lea los Nikāyas, '
                  'el Vinaya y el Abhidhamma, busque en el texto completo y estudie con '
                  'la aplicación móvil gratuita.'),
        'popular': 'Libros populares',
        'translations': 'Traducciones:',
        'about': 'Sobre el proyecto de traducción',
        'privacy': 'Política de privacidad',
        'browse': 'Explorar el Tipiṭaka',
    },
    'id': {
        'title': 'E-Piṭaka — Tipiṭaka (Bahasa Indonesia)',
        'description': ('Baca Tipiṭaka Pāli (edisi Chaṭṭha Saṅgāyana) dengan terjemahan '
                        'baris demi baris dalam bahasa Indonesia, Inggris, Sinhala, Thai, '
                        'Tamil, Lao, Myanmar, dan Vietnam. Gratis, dapat dicari, ramah seluler.'),
        'h1': 'Baca Tipiṭaka Pāli — Edisi Chaṭṭha Saṅgāyana',
        'intro': ('E-Piṭaka adalah edisi digital gratis dari Tipiṭaka Chaṭṭha Saṅgāyana '
                  '(kanon Pāli Konsili Buddhis Keenam), dengan terjemahan baris demi '
                  'baris dalam {count} bahasa — Indonesia, Inggris, Sinhala, Thai, '
                  'Tamil, Lao, Myanmar, dan Vietnam. Baca Sutta, Vinaya, dan Abhidhamma '
                  'Piṭaka, cari seluruh teks, dan belajar dengan aplikasi seluler gratis.'),
        'popular': 'Kitab populer',
        'translations': 'Terjemahan:',
        'about': 'Tentang proyek penerjemahan',
        'privacy': 'Kebijakan privasi',
        'browse': 'Jelajahi Tipiṭaka',
    },
    'ja': {
        'title': 'E-Piṭaka — パーリ三蔵 (日本語)',
        'description': ('パーリ三蔵（第六結集版）を日本語、英語、シンハラ語、タイ語、'
                        'タミル語、ラオス語、ミャンマー語、ベトナム語の逐句対訳で読む。'
                        '無料、検索可能、モバイル対応。'),
        'h1': 'パーリ三蔵を読む — 第六結集版',
        'intro': ('E-Piṭaka は第六結集版パーリ三蔵の無料デジタル版で、{count} 言語の'
                  '逐句対訳付き — 日本語、英語、シンハラ語、タイ語、タミル語、'
                  'ラオス語、ミャンマー語、ベトナム語。経蔵・律蔵・論蔵を読み、'
                  '全文検索し、無料モバイルアプリで学べます。'),
        'popular': '人気の経典',
        'translations': '翻訳：',
        'about': '翻訳プロジェクトについて',
        'privacy': 'プライバシーポリシー',
        'browse': '三蔵を閲覧する',
    },
    'km': {
        'title': 'E-Piṭaka — ត្រៃបិដក (ខ្មែរ)',
        'description': ('អានព្រះត្រៃបិដកបាលី (ឆដ្ឋសង្គាយនា) ជាមួយការបកប្រែជាភាសាខ្មែរ '
                        'អង់គ្លេស សីហឡ ថៃ តាមិល ឡាវ ភូមា និងវៀតណាម។ ឥតគិតថ្លៃ '
                        'ស្វែងរកបាន ប្រើលើទូរស័ព្ទបាន។'),
        'h1': 'អានព្រះត្រៃបិដកបាលី — ឆដ្ឋសង្គាយនា',
        'intro': ('E-Piṭaka ជាការបោះពុម្ពឌីជីថលឥតគិតថ្លៃនៃព្រះត្រៃបិដកបាលី '
                  '(ឆដ្ឋសង្គាយនា) ជាមួយការបកប្រែជាភាសា {count} — ខ្មែរ អង់គ្លេស '
                  'សីហឡ ថៃ តាមិល ឡាវ ភូមា និងវៀតណាម។ អានសុត្តន្ត វិន័យ និង '
                  'អភិធម្មបិដក ស្វែងរកអត្ថបទពេញ និងរៀនជាមួយកម្មវិធីទូរស័ព្ទឥតគិតថ្លៃ។'),
        'popular': 'គម្ពីរពេញនិយម',
        'translations': 'ការបកប្រែ៖',
        'about': 'អំពីគម្រោងបកប្រែ',
        'privacy': 'គោលការណ៍ឯកជនភាព',
        'browse': 'មើលព្រះត្រៃបិដក',
    },
    'ko': {
        'title': 'E-Piṭaka — 빨리어 삼장 (한국어)',
        'description': ('빨리어 삼장(제6차 결집본)을 한국어, 영어, 싱할라어, 태국어, '
                        '타밀어, 라오어, 미얀마어, 베트남어 문장별 번역으로 읽기. 무료, '
                        '검색 가능, 모바일 지원.'),
        'h1': '빨리어 삼장 읽기 — 제6차 결집본',
        'intro': ('E-Piṭaka는 제6차 결집본 빨리어 삼장의 무료 디지털판으로, {count}개 '
                  '언어의 문장별 번역을 제공합니다 — 한국어, 영어, 싱할라어, 태국어, '
                  '타밀어, 라오어, 미얀마어, 베트남어. 경·율·론 삼장을 읽고, 전문을 '
                  '검색하며, 무료 모바일 앱으로 공부하세요.'),
        'popular': '인기 경전',
        'translations': '번역:',
        'about': '번역 프로젝트 소개',
        'privacy': '개인정보처리방침',
        'browse': '삼장 둘러보기',
    },
    'ne': {
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
    'ru': {
        'title': 'E-Piṭaka — Типитака (Русский)',
        'description': ('Читайте палийскую Типитаку (издание Chaṭṭha Saṅgāyana) с '
                        'пословными переводами на русский, английский, сингальский, '
                        'тайский, тамильский, лаосский, бирманский и вьетнамский языки. '
                        'Бесплатно, с поиском, удобно на телефоне.'),
        'h1': 'Читайте палийскую Типитаку — издание Chaṭṭha Saṅgāyana',
        'intro': ('E-Piṭaka — бесплатное цифровое издание Типитаки Chaṭṭha '
                  'Saṅgāyana (палийский канон Шестого буддийского собора) с '
                  'пословными переводами на {count} языков — русский, английский, '
                  'сингальский, тайский, тамильский, лаосский, бирманский и '
                  'вьетнамский. Читайте Сутту, Винаю и Абхидхамма-питаку, ищите по '
                  'полному тексту и занимайтесь с бесплатным мобильным приложением.'),
        'popular': 'Популярные книги',
        'translations': 'Переводы:',
        'about': 'О проекте перевода',
        'privacy': 'Политика конфиденциальности',
        'browse': 'Обзор Типитаки',
    },
}


# Home-page navigation labels for the canon index and the download page.
# Kept separate from HOME_L10N so the (large) landing copy above stays
# untouched; merged in by home_l10n().
HOME_NAV_L10N = {
    'en': {'canon': 'Browse the full canon', 'download': 'Download ebooks (PDF, EPUB)'},
    'vi': {'canon': 'Duyệt toàn bộ Tam Tạng', 'download': 'Tải sách điện tử (PDF, EPUB)'},
    'th': {'canon': 'เปิดดูพระไตรปิฎกทั้งหมด', 'download': 'ดาวน์โหลดอีบุ๊ก (PDF, EPUB)'},
    'si': {'canon': 'සම්පූර්ණ ත්‍රිපිටකය බලන්න', 'download': 'ඊ-පොත් බාගන්න (PDF, EPUB)'},
    'ta': {'canon': 'முழு திரிபிடகத்தையும் உலாவு', 'download': 'மின்னூல்களைப் பதிவிறக்கு (PDF, EPUB)'},
    'lo': {'canon': 'ເບິ່ງພະໄຕຣປິດົກທັງໝົດ', 'download': 'ດາວໂຫລດປຶ້ມເອເລັກໂທຣນິກ (PDF, EPUB)'},
    'my': {'canon': 'ပိဋကတ်တော် အပြည့်အစုံ ကြည့်ရှုရန်', 'download': 'အီးဘွတ်ခ်များ ဒေါင်းလုဒ်လုပ်ရန် (PDF, EPUB)'},
    'pt': {'canon': 'Explorar o cânon completo', 'download': 'Baixar ebooks (PDF, EPUB)'},
    'de': {'canon': 'Den vollständigen Kanon durchsuchen', 'download': 'E-Books herunterladen (PDF, EPUB)'},
    'nl': {'canon': 'De volledige canon verkennen', 'download': 'E-books downloaden (PDF, EPUB)'},
    'np': {'canon': 'पूरा त्रिपिटक हेर्नुहोस्', 'download': 'ईबुक डाउनलोड गर्नुहोस् (PDF, EPUB)'},
    'ne': {'canon': 'पूरा त्रिपिटक हेर्नुहोस्', 'download': 'ईबुक डाउनलोड गर्नुहोस् (PDF, EPUB)'},
    'cn': {'canon': '浏览全部三藏', 'download': '下载电子书（PDF、EPUB）'},
    'zh': {'canon': '浏览全部三藏', 'download': '下载电子书（PDF、EPUB）'},
    'bn': {'canon': 'সম্পূর্ণ ত্রিপিটক দেখুন', 'download': 'ইবুক ডাউনলোড করুন (PDF, EPUB)'},
    'hi': {'canon': 'पूरा त्रिपिटक देखें', 'download': 'ईबुक डाउनलोड करें (PDF, EPUB)'},
    'es': {'canon': 'Explorar el canon completo', 'download': 'Descargar ebooks (PDF, EPUB)'},
    'id': {'canon': 'Jelajahi seluruh kanon', 'download': 'Unduh ebook (PDF, EPUB)'},
    'ja': {'canon': '三蔵全体を閲覧する', 'download': '電子書籍をダウンロード (PDF, EPUB)'},
    'km': {'canon': 'មើលព្រះត្រៃបិដកទាំងមូល', 'download': 'ទាញយកសៀវភៅអេឡិចត្រូនិក (PDF, EPUB)'},
    'ko': {'canon': '전체 삼장 둘러보기', 'download': '전자책 다운로드 (PDF, EPUB)'},
    'ru': {'canon': 'Обзор всей Типитаки', 'download': 'Скачать электронные книги (PDF, EPUB)'},
}

# Legacy code aliases: old DB filenames / UI links may use these codes.
# home_l10n() and popular_books() resolve through this map so e.g. 'np'
# and 'ne' share one entry instead of duplicating copy.
_LANG_ALIASES = {
    'np': 'ne', 'ne': 'ne',
    'cn': 'zh', 'zh': 'zh',
    'fil': 'tl', 'tl': 'tl',
}


def _canonical_lang(lang_code: str) -> str:
    key = (lang_code or '').strip().lower()
    return _LANG_ALIASES.get(key, key)


def home_l10n(lang_code: str, count: int) -> dict:
    """Localized home-page strings (H1, intro, labels, title, description).

    Falls back to English for languages without an entry; `intro` and
    `description` get the {count} placeholder filled with the number of
    available languages. Any language with a translation DB works out of
    the box (English fallback) — adding a HOME_L10N entry only upgrades
    its SEO copy to the native language.
    """
    key = _canonical_lang(lang_code)
    entry = HOME_L10N.get(key) or HOME_L10N.get(lang_code) or HOME_L10N['en']
    nav = HOME_NAV_L10N.get(key) or HOME_NAV_L10N.get(lang_code) or HOME_NAV_L10N['en']
    return {
        **entry,
        **nav,
        'intro': entry['intro'].format(count=count),
        'description': entry['description'].format(count=count)
        if '{count}' in entry['description'] else entry['description'],
    }


# Most-searched books, linked from the home page (server-rendered, so
# crawlers can reach them). Every id here MUST exist in the books table —
# the old list used aggregate ids (D, M, S, A, Ja, Vin) that 404'd because
# the canon stores the split volumes (D-i, M-i, …). Includes the Abhidhamma
# Piṭaka so Google can reach it from the home page.
POPULAR_BOOK_IDS = [
    'Dhp', 'Sn', 'Ud', 'It', 'Th', 'Thi', 'Ja-i', 'Khp',
    'D-i', 'M-i', 'S-i', 'A-i', 'Vin-i', 'Mil',
    'Dhs', 'Vibh', 'Pp', 'Paṭṭh-i',
]


def popular_books(lang: str = 'en', names: dict | None = None) -> list:
    """A short curated list of the most-searched books, for home-page links.

    Names are localized when a translation for [lang] exists (so /vi/ shows
    "Kinh Pháp Cú" for Dhp), falling back to the English name. `names` is an
    optional pre-resolved {book_id: name} map (services.book_names), which
    covers every book in the language rather than the curated subset.
    Legacy aliases (np/ne, cn/zh, fil/tl) resolve to the same entry.
    """
    key = _canonical_lang(lang)
    localized = dict(BOOK_NAMES_LOCALIZED.get(key) or BOOK_NAMES_LOCALIZED.get(lang, {}))
    if names:
        localized.update(names)
    return [
        {'id': bid, 'name': localized.get(bid) or english_book_name(bid) or bid}
        for bid in POPULAR_BOOK_IDS
    ]


# ── Localized book names for the popular-books list ───────────────────────
# book_id → name in [lang]. The same books that appear on the home page; the
# English BOOK_NAMES above stay the fallback. Languages with a deployed
# translation DB are listed (missing entries fall back to English, and the
# reader's translation-DB headings take precedence via services.book_names
# anyway — this table only seeds the home-page SEO links).
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
    'ne': {
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
    'zh': {
        'Dhp': '法句经', 'Sn': '经集', 'Ud': '自说经',
        'It': '如是语经', 'Th': '长老偈', 'Thi': '长老尼偈',
        'Ja': '本生经', 'Khp': '小诵', 'D': '长部',
        'M': '中部', 'S': '相应部', 'A': '增支部',
        'Mil': '弥兰王问经', 'Vin': '律藏',
    },
    'bn': {
        'Dhp': 'ধম্মপদ', 'Sn': 'সুত্তনিপাত', 'Ud': 'উদান',
        'It': 'ইতিবুত্তক', 'Th': 'থেরগাথা', 'Thi': 'থেরীগাথা',
        'Ja': 'জাতক', 'Khp': 'খুদ্দকপাঠ', 'D': 'দীঘনিকায়',
        'M': 'মজ্ঝিমনিকায়', 'S': 'সংযুত্তনিকায়', 'A': 'অঙ্গুত্তরনিকায়',
        'Mil': 'মিলিন্দপঞ্হ', 'Vin': 'বিনয়পিটক',
    },
    'hi': {
        'Dhp': 'धम्मपद', 'Sn': 'सुत्तनिपात', 'Ud': 'उदान',
        'It': 'इतिवुत्तक', 'Th': 'थेरगाथा', 'Thi': 'थेरीगाथा',
        'Ja': 'जातक', 'Khp': 'खुद्दकपाठ', 'D': 'दीघनिकाय',
        'M': 'मज्झिमनिकाय', 'S': 'संयुत्तनिकाय', 'A': 'अंगुत्तरनिकाय',
        'Mil': 'मिलिन्दपञ्ह', 'Vin': 'विनयपिटक',
    },
    'es': {
        'Dhp': 'Dhammapada', 'Sn': 'Sutta Nipāta', 'Ud': 'Udāna',
        'It': 'Itivuttaka', 'Th': 'Theragāthā', 'Thi': 'Therīgāthā',
        'Ja': 'Jātaka', 'Khp': 'Khuddakapāṭha', 'D': 'Dīgha Nikāya',
        'M': 'Majjhima Nikāya', 'S': 'Saṃyutta Nikāya', 'A': 'Aṅguttara Nikāya',
        'Mil': 'Milindapañha', 'Vin': 'Vinaya Piṭaka',
    },
    'id': {
        'Dhp': 'Dhammapada', 'Sn': 'Sutta Nipāta', 'Ud': 'Udāna',
        'It': 'Itivuttaka', 'Th': 'Theragāthā', 'Thi': 'Therīgāthā',
        'Ja': 'Jātaka', 'Khp': 'Khuddakapāṭha', 'D': 'Dīgha Nikāya',
        'M': 'Majjhima Nikāya', 'S': 'Saṃyutta Nikāya', 'A': 'Aṅguttara Nikāya',
        'Mil': 'Milindapañha', 'Vin': 'Vinaya Piṭaka',
    },
    'ja': {
        'Dhp': '法句経', 'Sn': 'スッタ・ニパータ', 'Ud': 'ウダーナ',
        'It': 'イティヴッタカ', 'Th': 'テーラガーター', 'Thi': 'テーリーガーター',
        'Ja': 'ジャータカ', 'Khp': 'クッダカ・パータ', 'D': '長部',
        'M': '中部', 'S': '相応部', 'A': '増支部',
        'Mil': 'ミリンダ王問経', 'Vin': '律蔵',
    },
    'km': {
        'Dhp': 'ធម្មបទ', 'Sn': 'សុត្តនិបាត', 'Ud': 'ឧទាន',
        'It': 'ឥតិវុត្តក', 'Th': 'ថេរគាថា', 'Thi': 'ថេរីគាថា',
        'Ja': 'ជាតក', 'Khp': 'ខុទ្ទកបាឋ', 'D': 'ទីឃនិកាយ',
        'M': 'មជ្ឈិមនិកាយ', 'S': 'សំយុត្តនិកាយ', 'A': 'អង្គុត្តរនិកាយ',
        'Mil': 'មិលិន្ទបញ្ហា', 'Vin': 'វិន័យបិដក',
    },
    'ko': {
        'Dhp': '법구경', 'Sn': '숫타니파타', 'Ud': '우다나',
        'It': '이티붓타카', 'Th': '테라가타', 'Thi': '테리가타',
        'Ja': '자타카', 'Khp': '쿳다카파타', 'D': '장부',
        'M': '중부', 'S': '상응부', 'A': '앙굿타라',
        'Mil': '밀린다왕문경', 'Vin': '율장',
    },
    'ru': {
        'Dhp': 'Дхаммапада', 'Sn': 'Сутта Нипата', 'Ud': 'Удана',
        'It': 'Итивуттака', 'Th': 'Тхерагатха', 'Thi': 'Тхеригатха',
        'Ja': 'Джатака', 'Khp': 'Кхуддакапатха', 'D': 'Дигха Никая',
        'M': 'Мадджхима Никая', 'S': 'Самъютта Никая', 'A': 'Ангуттара Никая',
        'Mil': 'Милиндапаньха', 'Vin': 'Виная Питака',
    },
}


# ── Authorship (E-E-A-T) ──────────────────────────────────────────────────
# Reference material is trusted more when a *named* person is accountable for
# it. Set EDITOR_NAME (optionally EDITOR_URL / EDITOR_CREDENTIALS /
# EDITOR_SAME_AS) in the server .env to credit a real editor; the Person entity
# then flows into the Book/Article JSON-LD and the /about page. While it is
# unset we claim only what is true — the project publishes the texts itself —
# and emit no editor at all rather than credit a review that never happened.

def editor_person() -> dict | None:
    """Person schema for the named editor, or None when unconfigured."""
    name = (os.environ.get('EDITOR_NAME') or '').strip()
    if not name:
        return None
    person = {
        '@type': 'Person',
        'name': name,
        'url': (os.environ.get('EDITOR_URL') or '').strip() or absolute('/about'),
    }
    credentials = (os.environ.get('EDITOR_CREDENTIALS') or '').strip()
    if credentials:
        person['description'] = credentials
    same_as = [u.strip() for u in (os.environ.get('EDITOR_SAME_AS') or '').split(',')
               if u.strip()]
    if same_as:
        person['sameAs'] = same_as
    return person


def editor_fields() -> dict:
    """`{'editor': Person}` when configured, else nothing to merge in."""
    person = editor_person()
    return {'editor': person} if person else {}


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
                # Deliberately no potentialAction/SearchAction: there is no
                # crawlable search URL. Search is a client-side dialog over
                # /api/fts_search, which robots.txt keeps out of the index, and
                # the declared /search?q=… was a 404. Reinstate it only
                # alongside a real, server-rendered results page.
            },
            {
                '@type': 'Organization',
                '@id': absolute('/') + '#organization',
                'name': 'E-Piṭaka',
                'alternateName': 'Epitaka',
                'url': absolute('/'),
                'logo': {'@type': 'ImageObject', 'url': absolute('/static/icon.png')},
                'description': ('Free, open reader of the Pāli Tipiṭaka (Chaṭṭha '
                                'Saṅgāyana edition) with line-by-line translations '
                                'and AI study guides.'),
                # Entity grounding: profiles that unambiguously identify this
                # project. Add a Wikidata/Wikipedia URL here once one exists so
                # AI assistants resolve "E-Piṭaka" to the same real-world entity.
                'sameAs': [
                    'https://github.com/dhammanana/epitaka.org',
                    'https://github.com/dhammanana/epitaka_translator',
                ],
            },
        ],
    }


# ── /llms.txt ─────────────────────────────────────────────────────────────
# Curated, LLM-friendly map of the site (see llmstxt.org, v2 format): an H1,
# a blockquote summary, then H2 "file list" sections of `- [name](url): note`
# entries. Deliberately short and curated — it is a navigation aid, not a
# second sitemap. robots.txt governs access; this file governs navigation.

def llms_txt() -> str:
    """Return the /llms.txt body (plain Markdown, served as text/plain)."""
    base = site_base()
    try:
        codes = sorted(Config.detect_translations().keys())
    except Exception:
        codes = ['en']
    other = ', '.join(c for c in codes if c != 'en')

    lines = [
        '# E-Piṭaka',
        '',
        '> Free, open reader of the Pāli Tipiṭaka (Chaṭṭha Saṅgāyana edition — the '
        'Sixth Buddhist Council recension) with line-by-line translations in '
        'English, Sinhala, Thai, Lao, Myanmar, Vietnamese, Tamil and more, plus '
        'AI-written study guides for every section.',
        '',
        'Every text, section and study guide is server-rendered HTML: no paywall, '
        'no login, and no JavaScript required to read. The Pāli is shown with a '
        'translation lined up sentence by sentence. Edition details and the '
        'translation methodology are at ' + absolute('/about') + '.',
        '',
        '## Read the canon',
        f'- [Reader home (English)]({base}/en/): full-text reader with translations',
        f'- [Full canon index]({base}/en/canon): every book grouped by Piṭaka — '
        'Vinaya, Sutta, Abhidhamma, plus commentaries and sub-commentaries',
        f'- [Downloads]({base}/en/download): free PDF, EPUB, DOCX and Markdown packs',
    ]
    if other:
        lines.append(
            f'- [Other languages]({base}/): each language has its own home, canon '
            f'index and reader at /<lang>/ (available: {other})'
        )
    lines += [
        '',
        '## Reference',
        f'- [Study guides]({base}/en/): section-by-section summaries with sutta '
        'citations; a book\'s outline is at /en/book/<book>/outline and each guide '
        'at /en/study/<book>/<slug>',
        '',
        '## Optional',
        f'- [About the translation]({absolute("/about")}): how the AI-assisted '
        'translations are produced',
        f'- [Privacy]({absolute("/privacy")})',
        '',
    ]
    return '\n'.join(lines)


# ── Canon index and ebook download pages ─────────────────────────────────

def canon_seo_title(lang_native: str, lang_code: str) -> str:
    """SEO <title> for the full-canon index page."""
    if lang_code == 'en':
        return 'Full Pāli Canon (Tipitaka) — All Books by Piṭaka | E-Piṭaka'
    return f'Tipiṭaka ({lang_native}) — All Books by Piṭaka | E-Piṭaka'


def canon_seo_description(lang_code: str) -> str:
    """Meta description for the full-canon index page."""
    return ('Browse every book of the Chaṭṭha Saṅgāyana Tipiṭaka by Piṭaka — '
            'Vinaya, Sutta and Abhidhamma — plus commentaries and '
            'sub-commentaries, each with line-by-line translation. Free online.')


# Ebook packs published on GitHub Releases (tag: ebook-latest).
# Each entry: (script, lang, English label). Only packs that actually exist
# should be listed here.
EBOOK_RELEASE_BASE = 'https://github.com/dhammanana/epitaka.org/releases/download/ebook-latest'
EBOOK_RELEASE_PAGE = 'https://github.com/dhammanana/epitaka.org/releases/tag/ebook-latest'
EBOOK_FORMATS = ('pdf', 'epub', 'docx', 'md')
EBOOK_PACKS = [
    ('ro', 'en', 'English'),
    ('ro', 'vi', 'Vietnamese'),
    ('ro', 'ta', 'Tamil'),
    ('ro', 'hi', 'Hindi'),
    ('si', 'si', 'Sinhala'),
    ('hi', 'hi', 'Hindi (Devanāgarī script)'),
    ('th', 'th', 'Thai'),
]


def ebook_download_url(script: str, lang: str, fmt: str) -> str:
    """Direct download URL for one ebook pack."""
    return f'{EBOOK_RELEASE_BASE}/{script}_{lang}-{fmt}.zip'


def download_seo_title() -> str:
    return ('Tipitaka PDF & eBook Downloads — Free Pāli Canon (EPUB, PDF, DOCX) '
            '| E-Piṭaka')


def download_seo_description() -> str:
    return ('Download the Chaṭṭha Saṅgāyana Tipitaka as free PDF, EPUB, DOCX or '
            'Markdown ebooks, with translations in English, Sinhala, Thai, Hindi, '
            'Tamil and Vietnamese. Fully offline.')


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
                 section_url: str | None = None,
                 date_modified: str | None = None) -> dict:
    """Article + BreadcrumbList schema for a study-guide page."""
    en = english_book_name(book_id)
    name = f'{en} ({pali_name})' if en and en.lower() != pali_name.lower() else pali_name
    breadcrumb = [
        {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': home_url},
        {'@type': 'ListItem', 'position': 2, 'name': name, 'item': book_url},
    ]
    if sutta_title:
        crumb = {'@type': 'ListItem', 'position': 3, 'name': sutta_title}
        crumb['item'] = section_url or book_url
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
                # The guide text is generated by the project, so the author
                # stays the Organization; a human editor is credited when
                # EDITOR_NAME is configured (they own the editorial process).
                'author': {'@type': 'Organization', 'name': 'E-Piṭaka', 'url': absolute('/')},
                'mainEntityOfPage': page_url,
                **editor_fields(),
                **({'dateModified': date_modified[:10]} if date_modified else {}),
            },
            {'@type': 'BreadcrumbList', 'itemListElement': breadcrumb},
        ],
    }


def canon_dataset_jsonld(page_url: str, site_url: str) -> dict:
    """Dataset schema describing the served Tipiṭaka corpus.

    Research- and citation-oriented answers ("Pāli Canon full text", "Tipiṭaka
    dataset") respond to Dataset markup. Only verifiable facts are asserted —
    edition, language of the source text, free access, and the downloadable
    packs; no license is claimed.
    """
    return {
        '@type': 'Dataset',
        '@id': page_url + '#dataset',
        'name': ('Chaṭṭha Saṅgāyana Tipiṭaka — Pāli Canon full text with '
                 'translations'),
        'alternateName': 'Pali Canon dataset',
        'description': ('The complete Pāli Tipiṭaka of the Sixth Buddhist Council '
                        '(Chaṭṭha Saṅgāyana) edition — Vinaya, Sutta and '
                        'Abhidhamma piṭakas with their commentaries — as '
                        'structured text with line-by-line translations in '
                        'multiple languages.'),
        'url': page_url,
        'inLanguage': 'pi',
        'isAccessibleForFree': True,
        'publisher': {'@type': 'Organization', 'name': 'E-Piṭaka', 'url': site_url},
        'distribution': {
            '@type': 'DataDownload',
            'encodingFormat': 'application/zip',
            'contentUrl': EBOOK_RELEASE_PAGE,
        },
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
            # Every itemListElement must have an `item` URL for Google.
            # Headings without their own page link back to the current page.
            crumb['item'] = item.get('url') or page_url
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
            **editor_fields(),
        },
        {
            '@type': 'BreadcrumbList',
            'itemListElement': breadcrumb,
        },
    ]
    return {'@context': 'https://schema.org', '@graph': graph}
