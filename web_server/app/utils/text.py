import re
import unicodedata
from ..config import Config

# ─────────────────────────────────────────────
# Text Processing Helpers
# ─────────────────────────────────────────────

def remove_stars_inside_brackets(text):
    PATTERN = re.compile(r'\[(.*?)\]')
    def repl(match):
        return '[' + match.group(1).replace('*', '') + ']'
    return PATTERN.sub(repl, text)


def markdown_to_html(text):
    """Convert lightweight markdown to HTML."""
    if not text:
        return ''
    if isinstance(text, int):
        return str(text)
    text = remove_stars_inside_brackets(text)
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
    text = text.replace('\\ வர', '[').replace('\\ ]', ']')
    text = text.replace('<strong>', ' <strong>')
    for i in range(6, 0, -1):
        pattern = r'^' + r'\#' * i + r' (.*)$'
        repl = r'<h{0}>\1</h{0}>'.format(i)
        text = re.sub(pattern, repl, text, flags=re.MULTILINE)
    text = re.sub(r'`(.*?)`', r'<code>\1</code>', text)
    text = re.sub(r' *\\\[(.*?)\\\]', r'<sup title="\1">*</sup>', text)
    text = re.sub(r' *\[(.*?)\]', r'<sup title="\1">*</sup>', text)
    return text


def highlight_text(text, query_words):
    pali_map = {
        'a': '[aā]', 'i': '[iī]', 'u': '[uū]',
        'n': '[nṅñṇ]', 't': '[tṭ]', 'd': '[dḍ]',
        'l': '[lḷ]', 'm': '[mṃ]'
    }
    for word in query_words:
        pattern = ''.join(pali_map.get(c, re.escape(c)) for c in word)
        text = re.sub(f'({pattern})', r'<mark>\1</mark>', text, flags=re.IGNORECASE)
    return text


def trim_text(text, query_words):
    query_pos = min(
        [text.lower().find(word.lower()) for word in query_words if text.lower().find(word.lower()) != -1] or [0]
    )
    start = max(0, query_pos - config.MAX_SEARCH_RESULTS_LENGTH // 2)
    end = min(len(text), query_pos + config.MAX_SEARCH_RESULTS_LENGTH // 2)
    temp_text = text[end - 10:end + 10]
    if re.match(r'<\w', temp_text, re.I):
        end = end - 10 + temp_text.find('<')
    ret = ('...' if start > 0 else '') + text[start:end] + ('...' if end < len(text) else '')
    pos = ret.rfind('strong>')
    if pos > 0 and ret[pos - 1] == '<':
        ret = ret + '</strong>'
    pos = ret.rfind('code>')
    if pos > 0 and ret[pos - 1] == '<':
        ret = ret + '</code>'
    return highlight_text(ret, query_words)


def normalize_pali(text):
    nfkd_form = unicodedata.normalize('NFKD', text)
    return ''.join(c for c in nfkd_form if not unicodedata.combining(c))

