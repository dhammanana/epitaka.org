#!/usr/bin/env python3
"""Generate the E-Piṭaka SEO keyword & question research files.

The dataset below is the single source of truth. Running this script writes:

    keywords.csv / keywords.md    - target search terms
    questions.csv / questions.md  - question-style queries (People-Also-Ask)

Difficulty is a heuristic band derived from a 0-100 keyword-difficulty (KD)
estimate. The estimates are editorial judgement for prioritisation, NOT live
Ahrefs/Semrush data — validate with a tool before committing budget (see
README.md for the tool/MCP shortlist).
"""
import csv
import os
from collections import Counter, OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__))

KEYWORD_HEADER = [
    "keyword", "cluster", "search_intent", "difficulty", "kd_estimate",
    "priority", "target_page", "notes",
]
QUESTION_HEADER = [
    "question", "cluster", "search_intent", "difficulty", "kd_estimate",
    "priority", "answer_angle",
]

# ── Keyword dataset ───────────────────────────────────────────────────────
# (keyword, cluster, intent, kd 0-100, priority, target_page, notes)
KEYWORDS = [
    # ── Core Canon Access ────────────────────────────────────────────
    ("tipitaka online", "Core Canon Access", "informational", 38, "P1", "/en/", "Head term; compete with tipitaka.org, suttacentral.net"),
    ("read tipitaka online free", "Core Canon Access", "transactional", 30, "P1", "/en/", "High intent; matches free-reader positioning"),
    ("pali canon online", "Core Canon Access", "informational", 35, "P1", "/en/", "Synonym for tipitaka; SuttaCentral owns #1"),
    ("pali canon english translation", "Core Canon Access", "informational", 40, "P1", "/en/", "Core fit: line-by-line English translation"),
    ("tipitaka english translation", "Core Canon Access", "informational", 40, "P1", "/en/", "Variant of above"),
    ("tipitaka in english", "Core Canon Access", "informational", 36, "P2", "/en/", "Variant"),
    ("complete pali canon in english", "Core Canon Access", "informational", 42, "P2", "/en/", "Long-tail variant"),
    ("chatta sangayana tipitaka", "Core Canon Access", "navigational", 18, "P1", "/en/", "Exact edition we serve"),
    ("chattha sangayana tipitaka", "Core Canon Access", "navigational", 15, "P1", "/en/", "Common misspelling of chaṭṭha"),
    ("sixth buddhist council tipitaka", "Core Canon Access", "informational", 14, "P2", "/en/", "Edition explainer content"),
    ("vri tipitaka", "Core Canon Access", "navigational", 20, "P2", "/en/", "Vipassana Research Institute edition"),
    ("tipitaka pdf download", "Core Canon Access", "transactional", 42, "P3", "/en/", "PDF intent; export feature could target"),
    ("free pali canon pdf", "Core Canon Access", "transactional", 40, "P3", "/en/", "PDF intent"),
    ("tipitaka app", "Core Canon Access", "transactional", 30, "P1", "/app/", "Mobile app landing"),
    ("tipitaka reader app", "Core Canon Access", "transactional", 16, "P1", "/app/", "App intent, low competition"),
    ("offline tipitaka reader", "Core Canon Access", "transactional", 10, "P2", "/app/", "Feature-led long tail"),
    ("pali canon reader", "Core Canon Access", "navigational", 15, "P1", "/en/", "Brand-adjacent"),
    ("tipitaka search", "Core Canon Access", "navigational", 15, "P1", "/search?q=", "Site search"),
    ("pali canon full text", "Core Canon Access", "informational", 34, "P2", "/en/", "Full-text search feature"),
    ("where to read the pali canon", "Core Canon Access", "informational", 20, "P1", "/en/", "Beginner PAA-style query"),
    ("tripitaka english", "Core Canon Access", "informational", 42, "P2", "/en/", "Sanskrit-spelling variant"),
    # ── Canon Structure & Pitakas ────────────────────────────────────
    ("what is the tipitaka", "Canon Structure & Pitakas", "informational", 38, "P1", "/en/", "Definition; needs explainer page"),
    ("three baskets of buddhism", "Canon Structure & Pitakas", "informational", 22, "P1", "/en/", "Beginner phrasing"),
    ("tipitaka meaning", "Canon Structure & Pitakas", "informational", 25, "P2", "/en/", "Definition"),
    ("vinaya pitaka", "Canon Structure & Pitakas", "informational", 33, "P1", "/en/book/Vin", "Book page"),
    ("sutta pitaka", "Canon Structure & Pitakas", "informational", 30, "P1", "/en/", "Hub page"),
    ("abhidhamma pitaka", "Canon Structure & Pitakas", "informational", 28, "P1", "/en/", "Hub page"),
    ("difference between sutta and abhidhamma", "Canon Structure & Pitakas", "informational", 15, "P2", "/en/", "Comparison FAQ"),
    ("how many suttas in the pali canon", "Canon Structure & Pitakas", "informational", 15, "P2", "/en/", "PAA"),
    ("how long is the pali canon", "Canon Structure & Pitakas", "informational", 18, "P2", "/en/", "PAA"),
    ("how many books in the pali canon", "Canon Structure & Pitakas", "informational", 15, "P2", "/en/", "PAA"),
    # ── Nikāyas ──────────────────────────────────────────────────────
    ("five nikayas", "Nikāyas", "informational", 20, "P1", "/en/", "Explainer target"),
    ("what are the five nikayas", "Nikāyas", "informational", 18, "P1", "/en/", "PAA"),
    ("digha nikaya", "Nikāyas", "informational", 30, "P1", "/en/book/D", "Book page"),
    ("majjhima nikaya", "Nikāyas", "informational", 28, "P1", "/en/book/M", "Book page"),
    ("samyutta nikaya", "Nikāyas", "informational", 28, "P1", "/en/book/S", "Book page"),
    ("anguttara nikaya", "Nikāyas", "informational", 30, "P1", "/en/book/A", "Book page"),
    ("khuddaka nikaya", "Nikāyas", "informational", 22, "P1", "/en/book/KN", "Book page"),
    ("digha nikaya english translation", "Nikāyas", "informational", 18, "P1", "/en/book/D", "Translation intent"),
    ("majjhima nikaya english translation", "Nikāyas", "informational", 18, "P1", "/en/book/M", "Translation intent"),
    ("samyutta nikaya english translation", "Nikāyas", "informational", 16, "P1", "/en/book/S", "Translation intent"),
    ("anguttara nikaya english translation", "Nikāyas", "informational", 16, "P1", "/en/book/A", "Translation intent"),
    ("khuddaka nikaya books list", "Nikāyas", "informational", 15, "P2", "/en/book/KN", "List intent"),
    ("difference between digha and majjhima nikaya", "Nikāyas", "informational", 10, "P3", "/en/", "Long-tail comparison"),
    ("which nikaya should i read first", "Nikāyas", "informational", 12, "P2", "/en/", "Beginner FAQ"),
    # ── Khuddaka Nikāya Texts ────────────────────────────────────────
    ("dhammapada", "Khuddaka Nikāya Texts", "informational", 62, "P1", "/en/book/Dhp", "High volume, high competition"),
    ("dhammapada english translation", "Khuddaka Nikāya Texts", "informational", 34, "P1", "/en/book/Dhp", "Translation intent"),
    ("dhammapada with commentary", "Khuddaka Nikāya Texts", "informational", 24, "P1", "/en/book/Dhp-a", "Unique: inline commentary"),
    ("dhammapada verses", "Khuddaka Nikāya Texts", "informational", 34, "P2", "/en/book/Dhp", "Reader intent"),
    ("dhammapada chapter list", "Khuddaka Nikāya Texts", "informational", 15, "P2", "/en/book/Dhp/outline", "Outline page"),
    ("best dhammapada translation", "Khuddaka Nikāya Texts", "commercial", 22, "P2", "/en/book/Dhp", "Comparison query"),
    ("sutta nipata", "Khuddaka Nikāya Texts", "informational", 20, "P1", "/en/book/Sn", "Book page"),
    ("sutta nipata english", "Khuddaka Nikāya Texts", "informational", 14, "P1", "/en/book/Sn", "Translation"),
    ("udana pali", "Khuddaka Nikāya Texts", "informational", 12, "P2", "/en/book/Ud", "Book page"),
    ("itivuttaka", "Khuddaka Nikāya Texts", "informational", 12, "P2", "/en/book/It", "Book page"),
    ("theragatha", "Khuddaka Nikāya Texts", "informational", 15, "P1", "/en/book/Th", "Book page"),
    ("therigatha", "Khuddaka Nikāya Texts", "informational", 15, "P1", "/en/book/Thi", "Book page"),
    ("jataka tales", "Khuddaka Nikāya Texts", "informational", 52, "P2", "/en/book/Ja", "Broad; Jataka book"),
    ("jataka stories english", "Khuddaka Nikāya Texts", "informational", 34, "P2", "/en/book/Ja", "Translation"),
    ("khuddakapatha", "Khuddaka Nikāya Texts", "informational", 8, "P2", "/en/book/Khp", "Book page"),
    ("milindapanha", "Khuddaka Nikāya Texts", "informational", 18, "P1", "/en/book/Mil", "Book page"),
    ("milinda's questions english", "Khuddaka Nikāya Texts", "informational", 12, "P2", "/en/book/Mil", "Translation"),
    ("patisambhidamagga", "Khuddaka Nikāya Texts", "informational", 10, "P3", "/en/book/Ps", "Book page"),
    ("nettippakarana", "Khuddaka Nikāya Texts", "informational", 8, "P3", "/en/book/Netti", "Book page"),
    ("buddhavamsa", "Khuddaka Nikāya Texts", "informational", 10, "P3", "/en/book/Bv", "Book page"),
    ("cariyapitaka", "Khuddaka Nikāya Texts", "informational", 8, "P3", "/en/book/Cp", "Book page"),
    ("petavatthu", "Khuddaka Nikāya Texts", "informational", 10, "P3", "/en/book/Pv", "Book page"),
    ("vimanavatthu", "Khuddaka Nikāya Texts", "informational", 8, "P3", "/en/book/Vv", "Book page"),
    # ── Abhidhamma & Buddhist Psychology ─────────────────────────────
    ("abhidhamma", "Abhidhamma & Buddhist Psychology", "informational", 40, "P1", "/en/book/Dhs", "Broad but reachable"),
    ("what is abhidhamma", "Abhidhamma & Buddhist Psychology", "informational", 28, "P1", "/en/", "Definition"),
    ("abhidhamma in simple terms", "Abhidhamma & Buddhist Psychology", "informational", 18, "P1", "/en/", "Beginner phrasing"),
    ("abhidhamma study guide", "Abhidhamma & Buddhist Psychology", "informational", 20, "P1", "/en/study/", "Strong fit for study guides"),
    ("abhidhammattha sangaha", "Abhidhamma & Buddhist Psychology", "informational", 18, "P1", "/en/", "Classic manual"),
    ("abhidhamma in daily life", "Abhidhamma & Buddhist Psychology", "informational", 20, "P2", "/en/", "Known book title"),
    ("52 mental factors", "Abhidhamma & Buddhist Psychology", "informational", 14, "P1", "/en/book/Dhs", "PAA / glossary target"),
    ("89 types of consciousness", "Abhidhamma & Buddhist Psychology", "informational", 10, "P1", "/en/book/Dhs", "PAA / glossary target"),
    ("cetasika", "Abhidhamma & Buddhist Psychology", "informational", 14, "P1", "/en/book/Dhs", "Term"),
    ("citta cetasika", "Abhidhamma & Buddhist Psychology", "informational", 12, "P2", "/en/book/Dhs", "Term"),
    ("24 paccaya", "Abhidhamma & Buddhist Psychology", "informational", 8, "P2", "/en/book/Patth", "Term"),
    ("patthana abhidhamma", "Abhidhamma & Buddhist Psychology", "informational", 10, "P2", "/en/book/Patth", "Book"),
    ("dhammasangani", "Abhidhamma & Buddhist Psychology", "informational", 10, "P2", "/en/book/Dhs", "Book"),
    ("vibhanga", "Abhidhamma & Buddhist Psychology", "informational", 10, "P3", "/en/book/Vibh", "Book"),
    ("kathavatthu", "Abhidhamma & Buddhist Psychology", "informational", 8, "P3", "/en/book/Kv", "Book"),
    ("puggalapannatti", "Abhidhamma & Buddhist Psychology", "informational", 8, "P3", "/en/book/Pug", "Book"),
    ("buddhist psychology", "Abhidhamma & Buddhist Psychology", "informational", 44, "P2", "/en/", "Broader, mixed intent"),
    ("four ultimate realities buddhism", "Abhidhamma & Buddhist Psychology", "informational", 12, "P2", "/en/", "PAA"),
    ("difference citta and cetasika", "Abhidhamma & Buddhist Psychology", "informational", 10, "P2", "/en/book/Dhs", "PAA"),
    ("is abhidhamma necessary for enlightenment", "Abhidhamma & Buddhist Psychology", "informational", 12, "P2", "/en/", "Discussion FAQ"),
    # ── Pāli Language & Dictionary ───────────────────────────────────
    ("pali dictionary", "Pāli Language & Dictionary", "informational", 40, "P1", "/search?q=", "Dictionary feature"),
    ("pali english dictionary", "Pāli Language & Dictionary", "informational", 34, "P1", "/search?q=", "Dictionary"),
    ("digital pali dictionary", "Pāli Language & Dictionary", "navigational", 15, "P2", "/search?q=", "DPD is brand-adjacent"),
    ("learn pali", "Pāli Language & Dictionary", "informational", 42, "P2", "/en/", "High competition"),
    ("pali language", "Pāli Language & Dictionary", "informational", 45, "P2", "/en/", "Broad"),
    ("pali alphabet", "Pāli Language & Dictionary", "informational", 20, "P2", "/en/", "Beginner"),
    ("pali script converter", "Pāli Language & Dictionary", "transactional", 12, "P1", "/en/book/Dhp", "Unique feature: script toggle"),
    ("roman to sinhala pali converter", "Pāli Language & Dictionary", "transactional", 8, "P2", "/en/book/Dhp", "Long-tail feature"),
    ("pali transliteration", "Pāli Language & Dictionary", "informational", 12, "P2", "/en/", "Feature"),
    ("pali pronunciation", "Pāli Language & Dictionary", "informational", 20, "P2", "/en/", "Beginner"),
    ("pali grammar", "Pāli Language & Dictionary", "informational", 34, "P3", "/en/", "Harder content gap"),
    ("english to pali translation", "Pāli Language & Dictionary", "transactional", 40, "P3", "/search?q=", "Tool intent"),
    ("pali dictionary pdf", "Pāli Language & Dictionary", "transactional", 22, "P3", "/search?q=", "PDF intent"),
    ("pali word of the day", "Pāli Language & Dictionary", "informational", 10, "P3", "/en/", "Content idea"),
    # ── Commentaries & Sub-commentaries ──────────────────────────────
    ("atthakatha", "Commentaries & Sub-commentaries", "informational", 14, "P1", "/en/book/Dhp-a", "Our inline commentary layer"),
    ("pali commentary english translation", "Commentaries & Sub-commentaries", "informational", 18, "P1", "/en/book/Dhp-a", "Strong differentiator"),
    ("dhammapada commentary", "Commentaries & Sub-commentaries", "informational", 20, "P1", "/en/book/Dhp-a", "Book"),
    ("visuddhimagga", "Commentaries & Sub-commentaries", "informational", 32, "P1", "/en/", "Famous post-canonical text"),
    ("who wrote the visuddhimagga", "Commentaries & Sub-commentaries", "informational", 12, "P2", "/en/", "PAA"),
    ("buddhaghosa", "Commentaries & Sub-commentaries", "informational", 25, "P2", "/en/", "Commentator"),
    ("tika subcommentary", "Commentaries & Sub-commentaries", "informational", 8, "P2", "/en/", "Term"),
    ("theravada commentaries", "Commentaries & Sub-commentaries", "informational", 15, "P2", "/en/", "Hub"),
    ("commentary on the pali canon", "Commentaries & Sub-commentaries", "informational", 12, "P2", "/en/", "Hub"),
    # ── Theravāda Doctrine ───────────────────────────────────────────
    ("theravada buddhism", "Theravāda Doctrine", "informational", 55, "P1", "/en/", "Broad; brand building"),
    ("theravada buddhism beliefs", "Theravāda Doctrine", "informational", 45, "P2", "/en/", "Explainer"),
    ("four noble truths", "Theravāda Doctrine", "informational", 60, "P1", "/en/", "Very broad; needs pillar content"),
    ("noble eightfold path", "Theravāda Doctrine", "informational", 58, "P1", "/en/", "Very broad; needs pillar content"),
    ("dependent origination", "Theravāda Doctrine", "informational", 42, "P1", "/en/", "Doctrine"),
    ("paticca samuppada", "Theravāda Doctrine", "informational", 20, "P2", "/en/", "Pali term"),
    ("anatta", "Theravāda Doctrine", "informational", 40, "P1", "/en/", "Doctrine"),
    ("anicca dukkha anatta", "Theravāda Doctrine", "informational", 34, "P1", "/en/", "Three marks"),
    ("five aggregates", "Theravāda Doctrine", "informational", 42, "P1", "/en/", "Doctrine"),
    ("khandha five aggregates", "Theravāda Doctrine", "informational", 18, "P2", "/en/", "Pali term"),
    ("what is nibbana", "Theravāda Doctrine", "informational", 48, "P2", "/en/", "Doctrine"),
    ("noble eightfold path explained", "Theravāda Doctrine", "informational", 35, "P2", "/en/", "Long-tail"),
    ("difference theravada and mahayana", "Theravāda Doctrine", "informational", 50, "P2", "/en/", "Comparison"),
    ("what does theravada buddhism believe", "Theravāda Doctrine", "informational", 40, "P2", "/en/", "PAA"),
    ("vipassana", "Theravāda Doctrine", "informational", 55, "P3", "/en/", "Broad meditation"),
    ("samatha and vipassana", "Theravāda Doctrine", "informational", 28, "P2", "/en/", "Practice"),
    ("jhana", "Theravāda Doctrine", "informational", 34, "P2", "/en/", "Practice"),
    ("eight jhanas", "Theravāda Doctrine", "informational", 14, "P2", "/en/", "List"),
    ("four foundations of mindfulness", "Theravāda Doctrine", "informational", 24, "P2", "/en/", "Practice"),
    ("metta", "Theravāda Doctrine", "informational", 30, "P2", "/en/", "Practice"),
    # Head terms kept for tracking only — do NOT target head-on (Very Hard).
    ("buddhism", "Theravāda Doctrine", "informational", 80, "P3", "/en/", "Head term; track only, do not target"),
    ("meditation", "Theravāda Doctrine", "informational", 85, "P3", "/en/", "Head term; off-topic for us"),
    ("mindfulness", "Theravāda Doctrine", "informational", 78, "P3", "/en/", "Head term; commercialised"),
    ("buddhist meditation", "Theravāda Doctrine", "informational", 75, "P3", "/en/", "Broad; deprioritise"),
    # ── Key Suttas ───────────────────────────────────────────────────
    ("satipatthana sutta", "Key Suttas", "informational", 38, "P1", "/en/book/M", "Key sutta"),
    ("maha satipatthana sutta", "Key Suttas", "informational", 20, "P1", "/en/book/D", "Key sutta"),
    ("anapanasati sutta", "Key Suttas", "informational", 34, "P1", "/en/book/M", "Key sutta"),
    ("dhammacakkappavattana sutta", "Key Suttas", "informational", 20, "P1", "/en/book/S", "First sermon"),
    ("kalama sutta", "Key Suttas", "informational", 22, "P1", "/en/book/A", "Popular sutta"),
    ("mangala sutta", "Key Suttas", "informational", 18, "P1", "/en/book/Khp", "Chant"),
    ("ratana sutta", "Key Suttas", "informational", 18, "P2", "/en/book/Khp", "Chant"),
    ("karaniya metta sutta", "Key Suttas", "informational", 20, "P1", "/en/book/Khp", "Chant"),
    ("metta sutta", "Key Suttas", "informational", 20, "P1", "/en/book/Khp", "Chant"),
    ("sigalovada sutta", "Key Suttas", "informational", 12, "P2", "/en/book/D", "Lay ethics"),
    ("maha parinibbana sutta", "Key Suttas", "informational", 22, "P2", "/en/book/D", "Key sutta"),
    ("brahmajala sutta", "Key Suttas", "informational", 14, "P2", "/en/book/D", "Key sutta"),
    ("sabbasava sutta", "Key Suttas", "informational", 10, "P3", "/en/book/M", "Key sutta"),
    ("14 unanswered questions buddhism", "Key Suttas", "informational", 20, "P2", "/en/", "FAQ"),
    ("which sutta did the buddha teach first", "Key Suttas", "informational", 12, "P2", "/en/", "PAA"),
    ("what is the satipatthana sutta about", "Key Suttas", "informational", 15, "P2", "/en/book/M", "PAA"),
    # ── Editions, Councils & Scripts ─────────────────────────────────
    ("sinhala tipitaka", "Editions, Councils & Scripts", "informational", 18, "P1", "/si/", "Localized landing"),
    ("thai tipitaka", "Editions, Councils & Scripts", "informational", 20, "P1", "/th/", "Localized landing"),
    ("burmese tipitaka", "Editions, Councils & Scripts", "informational", 15, "P2", "/my/", "Localized landing"),
    ("devanagari tipitaka", "Editions, Councils & Scripts", "informational", 8, "P3", "/np/", "Script"),
    ("pali text roman transliteration", "Editions, Councils & Scripts", "informational", 10, "P2", "/en/", "Script converter"),
    ("tipitaka sinhala script", "Editions, Councils & Scripts", "informational", 8, "P3", "/si/", "Script"),
    ("buddha jayanti tipitaka", "Editions, Councils & Scripts", "informational", 10, "P3", "/en/", "Edition"),
    ("sixth buddhist council", "Editions, Councils & Scripts", "informational", 18, "P2", "/en/", "History"),
    ("chatta sangayana", "Editions, Councils & Scripts", "informational", 14, "P2", "/en/", "Edition"),
    # ── Multilingual ─────────────────────────────────────────────────
    ("tam tạng pali", "Multilingual", "informational", 25, "P1", "/vi/", "Vietnamese head term"),
    ("đọc tam tạng pali", "Multilingual", "transactional", 10, "P1", "/vi/", "Vietnamese read intent"),
    ("kinh pháp cú", "Multilingual", "informational", 40, "P1", "/vi/book/Dhp", "Vietnamese Dhammapada"),
    ("trường bộ kinh", "Multilingual", "informational", 25, "P2", "/vi/book/D", "Vietnamese Digha"),
    ("trung bộ kinh", "Multilingual", "informational", 25, "P2", "/vi/book/M", "Vietnamese Majjhima"),
    ("tương ưng bộ kinh", "Multilingual", "informational", 20, "P2", "/vi/book/S", "Vietnamese Samyutta"),
    ("tăng chi bộ kinh", "Multilingual", "informational", 20, "P2", "/vi/book/A", "Vietnamese Anguttara"),
    ("พระไตรปิฎก", "Multilingual", "informational", 30, "P1", "/th/", "Thai head term"),
    ("พระไตรปิฎกบาลี", "Multilingual", "informational", 20, "P1", "/th/", "Thai variant"),
    ("ธรรมบท", "Multilingual", "informational", 15, "P1", "/th/book/Dhp", "Thai Dhammapada"),
    ("ทีฆนิกาย", "Multilingual", "informational", 12, "P2", "/th/book/D", "Thai Digha"),
    ("ත්‍රිපිටකය", "Multilingual", "informational", 15, "P1", "/si/", "Sinhala head term"),
    ("ධම්මපදය", "Multilingual", "informational", 10, "P2", "/si/book/Dhp", "Sinhala Dhammapada"),
    ("ပိဋကတ်တော်", "Multilingual", "informational", 10, "P2", "/my/", "Burmese head term"),
    ("திரிபிடகம்", "Multilingual", "informational", 8, "P3", "/ta/", "Tamil head term"),
    ("ພະໄຕຣປິດົກ", "Multilingual", "informational", 8, "P3", "/lo/", "Lao head term"),
    ("巴利三藏", "Multilingual", "informational", 15, "P2", "/cn/", "Chinese head term"),
    ("法句经", "Multilingual", "informational", 30, "P2", "/cn/", "Chinese Dhammapada"),
    ("tipitaka deutsch", "Multilingual", "informational", 12, "P3", "/de/", "German"),
    ("tipitaka portugues", "Multilingual", "informational", 10, "P3", "/pt/", "Portuguese"),
    # ── Study, Learning & App ────────────────────────────────────────
    ("how to read the pali canon", "Study, Learning & App", "informational", 20, "P1", "/en/", "Beginner guide"),
    ("sutta study guide", "Study, Learning & App", "informational", 15, "P1", "/en/study/", "Study guides"),
    ("tipitaka study guide", "Study, Learning & App", "informational", 8, "P2", "/en/study/", "Study guides"),
    ("buddhism for beginners", "Study, Learning & App", "informational", 60, "P3", "/en/", "Very broad"),
    ("buddha teachings summary", "Study, Learning & App", "informational", 40, "P3", "/en/", "Broad"),
    ("pali canon reading order", "Study, Learning & App", "informational", 10, "P2", "/en/", "Beginner"),
    ("best suttas to read first", "Study, Learning & App", "informational", 12, "P2", "/en/", "Beginner"),
    ("tipitaka download offline", "Study, Learning & App", "transactional", 10, "P2", "/app/", "App"),
    ("pali reader app android", "Study, Learning & App", "transactional", 12, "P2", "/app/", "App"),
    ("pali reader app ios", "Study, Learning & App", "transactional", 12, "P2", "/app/", "App"),
    ("free buddhist texts online", "Study, Learning & App", "informational", 25, "P2", "/en/", "Broad"),
    ("buddha quotes", "Study, Learning & App", "informational", 72, "P3", "/en/book/Dhp", "Head term; enter via Dhammapada verses only"),
]

# ── Question dataset ──────────────────────────────────────────────────────
# (question, cluster, intent, kd 0-100, priority, answer_angle)
QUESTIONS = [
    # Access / reading
    ("Where can I read the Tipitaka online for free?", "Core Canon Access", "informational", 10, "P1", "Point to the free E-Piṭaka reader (/en/) and app."),
    ("Is there a free PDF of the Pali Canon in English?", "Core Canon Access", "informational", 25, "P2", "Explain translation coverage + PDF/EPUB export if offered."),
    ("Is the complete Pali Canon available in English?", "Core Canon Access", "informational", 20, "P2", "State coverage per book and link to the collection."),
    ("What is the best English translation of the Pali Canon?", "Core Canon Access", "informational", 28, "P2", "Compare Bhikkhu Bodhi, Thanissaro, Anandajoti; we aggregate sources."),
    ("How many suttas are in the Tipitaka?", "Core Canon Access", "informational", 15, "P2", "Give counts per nikāya with links."),
    ("How many books are in the Pali Canon?", "Core Canon Access", "informational", 15, "P2", "Explain three piṭakas + Khuddaka book count."),
    ("Do Buddhists read the entire Pali Canon?", "Core Canon Access", "informational", 12, "P3", "Honest answer + where to start."),
    ("Where can I read the suttas with English on the same page?", "Core Canon Access", "informational", 10, "P1", "Show the line-by-line reader."),
    ("Is there a Tipitaka app for offline reading?", "Study, Learning & App", "transactional", 8, "P1", "App download page + offline feature."),
    ("Can I read the Tipitaka in Sinhala script?", "Editions, Councils & Scripts", "informational", 8, "P2", "Script converter feature."),
    ("Can I read the Pali Canon in Sinhala, Thai or Burmese?", "Multilingual", "informational", 8, "P1", "List available languages and link each landing."),
    ("How do I search the Pali Canon for a word?", "Core Canon Access", "informational", 8, "P1", "Full-text search + dictionary."),
    ("Where can I find Atthakatha (commentary) in English?", "Commentaries & Sub-commentaries", "informational", 12, "P1", "Inline commentary / sub-commentary feature."),
    ("What is the Tipitaka?", "Core Canon Access", "informational", 25, "P1", "Definition + three baskets."),
    ("How long would it take to read the whole Pali Canon?", "Core Canon Access", "informational", 12, "P3", "Estimate in pages/hours."),
    ("What is the Pali Canon in Buddhism?", "Core Canon Access", "informational", 30, "P1", "Definition and scope."),
    ("Is the Tipitaka the same as the Tripitaka?", "Core Canon Access", "informational", 12, "P2", "Pali vs Sanskrit spelling of the same canon."),
    ("What is the oldest Buddhist text?", "Core Canon Access", "informational", 20, "P2", "Early Pali texts + date debate."),
    ("Where can I download the Pali Canon in Pali?", "Core Canon Access", "transactional", 15, "P2", "Raw Pāli text access."),
    ("What is the Tipitaka in English?", "Core Canon Access", "informational", 25, "P2", "Definition + reading options."),
    ("Can I get the Tipitaka as EPUB?", "Study, Learning & App", "transactional", 8, "P2", "EPUB export if available."),
    ("Is E-Piṭaka free?", "Core Canon Access", "navigational", 5, "P1", "Yes — free online reader + app."),
    # Structure
    ("What are the three baskets of the Tipitaka?", "Canon Structure & Pitakas", "informational", 18, "P1", "Vinaya, Sutta, Abhidhamma with links."),
    ("What is the difference between Tripitaka and Pali Canon?", "Canon Structure & Pitakas", "informational", 15, "P1", "Same collection, different language."),
    ("What is the difference between a pitaka and a nikaya?", "Canon Structure & Pitakas", "informational", 8, "P2", "Basket vs collection within Sutta Piṭaka."),
    ("What are the five Nikayas?", "Nikāyas", "informational", 18, "P1", "List the five with links."),
    ("Which Nikaya should I read first?", "Nikāyas", "informational", 15, "P1", "Recommend Majjhima/Dīgha entry points."),
    ("What is the Vinaya Pitaka about?", "Canon Structure & Pitakas", "informational", 20, "P1", "Monastic discipline."),
    ("What is the Sutta Pitaka?", "Canon Structure & Pitakas", "informational", 20, "P1", "Discourses of the Buddha."),
    ("What is the Abhidhamma Pitaka?", "Abhidhamma & Buddhist Psychology", "informational", 22, "P1", "Systematic psychology."),
    ("How is the Pali Canon organized?", "Canon Structure & Pitakas", "informational", 15, "P2", "Piṭakas → nikāyas → books."),
    ("Which pitaka does the Dhammapada belong to?", "Khuddaka Nikāya Texts", "informational", 10, "P2", "Khuddaka Nikāya (Sutta Piṭaka)."),
    ("What are the 15 books of the Khuddaka Nikaya?", "Khuddaka Nikāya Texts", "informational", 12, "P2", "List with links."),
    ("What is the difference between a sutta and a jataka?", "Khuddaka Nikāya Texts", "informational", 10, "P3", "Discourse vs birth story."),
    # Abhidhamma
    ("What is Abhidhamma in simple terms?", "Abhidhamma & Buddhist Psychology", "informational", 18, "P1", "Plain-language intro."),
    ("What are the 52 mental factors?", "Abhidhamma & Buddhist Psychology", "informational", 12, "P1", "Cetasika list + glossary."),
    ("What are the 89 types of consciousness?", "Abhidhamma & Buddhist Psychology", "informational", 10, "P1", "Citta classification."),
    ("What is the difference between citta and cetasika?", "Abhidhamma & Buddhist Psychology", "informational", 12, "P1", "Mind vs mental factors."),
    ("What are the 24 paccaya in the Patthana?", "Abhidhamma & Buddhist Psychology", "informational", 8, "P2", "List of conditional relations."),
    ("Do I need to study Abhidhamma to attain nibbana?", "Abhidhamma & Buddhist Psychology", "informational", 12, "P2", "Balanced traditional view."),
    ("How do I start studying Abhidhamma?", "Abhidhamma & Buddhist Psychology", "informational", 10, "P1", "Link study guides + Sangaha."),
    ("What is the Abhidhammattha Sangaha?", "Abhidhamma & Buddhist Psychology", "informational", 10, "P1", "Classic compendium."),
    ("What are the four ultimate realities in Buddhism?", "Abhidhamma & Buddhist Psychology", "informational", 12, "P2", "Citta, cetasika, rupa, nibbana."),
    ("What is the difference between Sutta and Abhidhamma teaching?", "Abhidhamma & Buddhist Psychology", "informational", 10, "P2", "Conventional vs ultimate reality."),
    ("What is the Patthana?", "Abhidhamma & Buddhist Psychology", "informational", 10, "P3", "Book of conditional relations."),
    ("What is the Dhammasangani?", "Abhidhamma & Buddhist Psychology", "informational", 10, "P3", "First Abhidhamma book."),
    ("What is the difference between rupa and nama?", "Abhidhamma & Buddhist Psychology", "informational", 10, "P2", "Matter vs mind."),
    ("What is bhavanga citta?", "Abhidhamma & Buddhist Psychology", "informational", 8, "P3", "Life-continuum consciousness."),
    ("What are the 7 books of the Abhidhamma?", "Abhidhamma & Buddhist Psychology", "informational", 10, "P2", "List the seven."),
    ("What is the Abhidhammattha Sangaha used for?", "Abhidhamma & Buddhist Psychology", "informational", 10, "P2", "Purpose of the manual."),
    # Pali
    ("Can you learn Pali on your own?", "Pāli Language & Dictionary", "informational", 20, "P2", "Resources + reader practice."),
    ("How long does it take to learn Pali?", "Pāli Language & Dictionary", "informational", 15, "P3", "Realistic estimate + path."),
    ("Is there a free online Pali dictionary?", "Pāli Language & Dictionary", "informational", 12, "P1", "Link dictionary feature + DPD."),
    ("What is the best Pali dictionary?", "Pāli Language & Dictionary", "commercial", 15, "P2", "PTS, DPD, CPD comparison."),
    ("Is Pali a dead language?", "Pāli Language & Dictionary", "informational", 20, "P2", "Liturgical/learned language answer."),
    ("What is the difference between Pali and Sanskrit?", "Pāli Language & Dictionary", "informational", 30, "P2", "Language comparison."),
    ("What is the Pali alphabet?", "Pāli Language & Dictionary", "informational", 15, "P3", "Letter set + script conversion."),
    ("How do I convert Pali to Sinhala script?", "Pāli Language & Dictionary", "transactional", 8, "P1", "Script converter feature."),
    ("How do you say hello in Pali?", "Pāli Language & Dictionary", "informational", 15, "P3", "Phrase + greeting."),
    ("What does 'dukkha' mean in Pali?", "Pāli Language & Dictionary", "informational", 20, "P2", "Dictionary definition."),
    ("Do I need to know Pali to read the suttas?", "Pāli Language & Dictionary", "informational", 12, "P2", "No + translation support."),
    ("What language are Theravada texts in?", "Pāli Language & Dictionary", "informational", 15, "P3", "Pali."),
    ("Why is the Pali Canon in Pali?", "Pāli Language & Dictionary", "informational", 15, "P2", "Language of the early texts."),
    # Doctrine
    ("What are the Four Noble Truths?", "Theravāda Doctrine", "informational", 55, "P1", "Deep pillar answer + sutta link."),
    ("What is the Noble Eightfold Path?", "Theravāda Doctrine", "informational", 55, "P1", "Deep pillar answer + sutta link."),
    ("What is dependent origination?", "Theravāda Doctrine", "informational", 40, "P1", "Paticca-samuppada."),
    ("What is anatta (non-self)?", "Theravāda Doctrine", "informational", 35, "P1", "Doctrine + sutta references."),
    ("What are the five aggregates?", "Theravāda Doctrine", "informational", 40, "P1", "Khandha explanation."),
    ("What is the difference between Theravada and Mahayana?", "Theravāda Doctrine", "informational", 55, "P2", "Comparison."),
    ("What is nibbana?", "Theravāda Doctrine", "informational", 48, "P1", "Doctrine."),
    ("What is the difference between nirvana and nibbana?", "Theravāda Doctrine", "informational", 20, "P2", "Same concept, different language."),
    ("What is anicca?", "Theravāda Doctrine", "informational", 20, "P2", "Impermanence."),
    ("What is dukkha?", "Theravāda Doctrine", "informational", 35, "P1", "Suffering/unsatisfactoriness."),
    ("What are the four foundations of mindfulness?", "Theravāda Doctrine", "informational", 24, "P2", "Satipatthana."),
    ("What is the difference between samatha and vipassana?", "Theravāda Doctrine", "informational", 20, "P2", "Calm vs insight."),
    ("What are the jhanas?", "Theravāda Doctrine", "informational", 34, "P2", "Absorption states."),
    ("What is metta meditation?", "Theravāda Doctrine", "informational", 30, "P2", "Loving-kindness."),
    ("What are the 14 unanswered questions in Buddhism?", "Key Suttas", "informational", 18, "P2", "Avyakata."),
    ("What is the goal of Theravada Buddhism?", "Theravāda Doctrine", "informational", 22, "P2", "Nibbana."),
    ("What are the 5 precepts?", "Theravāda Doctrine", "informational", 40, "P2", "Ethics."),
    ("What is sila samadhi panna?", "Theravāda Doctrine", "informational", 12, "P2", "Three trainings."),
    ("What are the three marks of existence?", "Theravāda Doctrine", "informational", 28, "P2", "Anicca, dukkha, anatta."),
    ("What is the difference between Theravada and Vajrayana?", "Theravāda Doctrine", "informational", 30, "P3", "Comparison."),
    ("Which countries practice Theravada Buddhism?", "Theravāda Doctrine", "informational", 20, "P3", "Geography."),
    ("What is a Theravada monk called?", "Theravāda Doctrine", "informational", 12, "P3", "Bhikkhu."),
    # Key suttas
    ("What is the Dhammacakkappavattana Sutta about?", "Key Suttas", "informational", 15, "P1", "First sermon; Four Noble Truths."),
    ("What is the Satipatthana Sutta?", "Key Suttas", "informational", 20, "P1", "Mindfulness discourse."),
    ("What does the Kalama Sutta say?", "Key Suttas", "informational", 15, "P1", "Free inquiry."),
    ("What is the Metta Sutta?", "Key Suttas", "informational", 15, "P1", "Loving-kindness."),
    ("What is the Mangala Sutta?", "Key Suttas", "informational", 12, "P2", "Blessings."),
    ("What is the Maha Parinibbana Sutta?", "Key Suttas", "informational", 15, "P2", "Last days of the Buddha."),
    ("What is the Anapanasati Sutta?", "Key Suttas", "informational", 15, "P2", "Mindfulness of breathing."),
    ("What is the Sigalovada Sutta?", "Key Suttas", "informational", 10, "P3", "Lay ethics."),
    ("What is the Brahmajala Sutta?", "Key Suttas", "informational", 10, "P3", "Views and their refutation."),
    ("Which sutta did the Buddha teach first?", "Key Suttas", "informational", 12, "P2", "Dhammacakkappavattana."),
    ("What is the Dhammapada?", "Khuddaka Nikāya Texts", "informational", 35, "P1", "Intro to the verses."),
    ("What is the Dhammapada about?", "Khuddaka Nikāya Texts", "informational", 30, "P1", "Ethics and mind."),
    ("How many verses are in the Dhammapada?", "Khuddaka Nikāya Texts", "informational", 15, "P2", "423 verses, 26 chapters."),
    ("What is the Sutta Nipata?", "Khuddaka Nikāya Texts", "informational", 15, "P2", "Early poetry."),
    ("What is the Udana?", "Khuddaka Nikāya Texts", "informational", 12, "P3", "Inspired utterances."),
    ("What is the Itivuttaka?", "Khuddaka Nikāya Texts", "informational", 10, "P3", "As-it-was-said."),
    ("What is the Theragatha?", "Khuddaka Nikāya Texts", "informational", 12, "P3", "Verses of elder monks."),
    ("What is the Milindapanha?", "Khuddaka Nikāya Texts", "informational", 15, "P2", "King Milinda's questions."),
    ("What are the Jataka tales?", "Khuddaka Nikāya Texts", "informational", 30, "P2", "Birth stories."),
    # Commentary
    ("What is Atthakatha?", "Commentaries & Sub-commentaries", "informational", 12, "P1", "Commentary literature."),
    ("What is the difference between Atthakatha and Tika?", "Commentaries & Sub-commentaries", "informational", 8, "P1", "Commentary vs sub-commentary."),
    ("Who wrote the Visuddhimagga?", "Commentaries & Sub-commentaries", "informational", 12, "P2", "Buddhaghosa."),
    ("What is the Visuddhimagga about?", "Commentaries & Sub-commentaries", "informational", 15, "P2", "Path of purification."),
    ("Did the Buddha write the commentaries?", "Commentaries & Sub-commentaries", "informational", 12, "P3", "Traditional attribution."),
    ("Do I need the commentary to understand the suttas?", "Commentaries & Sub-commentaries", "informational", 10, "P2", "Balanced answer."),
    # Editions / councils
    ("What is the Chattha Sangayana Tipitaka?", "Editions, Councils & Scripts", "informational", 12, "P1", "Sixth Council edition — the text we serve."),
    ("What is the Sixth Buddhist Council?", "Editions, Councils & Scripts", "informational", 15, "P2", "1954-1956 Yangon."),
    ("What is the VRI edition of the Tipitaka?", "Editions, Councils & Scripts", "informational", 10, "P2", "Vipassana Research Institute."),
    ("What is the difference between the Pali Canon and the Chinese Canon?", "Editions, Councils & Scripts", "informational", 30, "P3", "Traditions comparison."),
    # Multilingual
    ("Tam tạng Pali là gì?", "Multilingual", "informational", 10, "P1", "Vietnamese definition."),
    ("Đọc kinh Pháp Cú ở đâu?", "Multilingual", "informational", 8, "P1", "Vietnamese: where to read."),
    ("พระไตรปิฎกอ่านที่ไหน?", "Multilingual", "informational", 8, "P1", "Thai: where to read."),
    ("ත්‍රිපිටකය කියවන්නේ කොහොමද?", "Multilingual", "informational", 8, "P2", "Sinhala: how to read."),
]


def band(kd: int) -> str:
    """Map a 0-100 keyword-difficulty estimate to a human band."""
    if kd <= 19:
        return "Easy"
    if kd <= 44:
        return "Medium"
    if kd <= 69:
        return "Hard"
    return "Very Hard"


def _write_csv(path, header, rows):
    with open(path, "w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        writer.writerow(header)
        writer.writerows(rows)


def _summary(items, kd_idx):
    total = len(items)
    counts = Counter(band(r[kd_idx]) for r in items)
    cluster_counts = Counter(r[1] for r in items)
    out = [f"**{total} entries.** "
           f"Difficulty mix: {counts.get('Easy',0)} Easy · {counts.get('Medium',0)} Medium · "
           f"{counts.get('Hard',0)} Hard · {counts.get('Very Hard',0)} Very Hard.\n"]
    out.append("| Cluster | Entries |")
    out.append("|---|---|")
    for c, n in cluster_counts.items():
        out.append(f"| {c} | {n} |")
    out.append("")
    return "\n".join(out)


def build_keywords():
    csv_rows = [
        [k, c, i, band(kd), kd, p, t, n]
        for (k, c, i, kd, p, t, n) in KEYWORDS
    ]
    _write_csv(os.path.join(HERE, "keywords.csv"), KEYWORD_HEADER, csv_rows)

    md = ["# E-Piṭaka — SEO Keyword Targets\n",
          "> Difficulty is an editorial estimate (0-100 KD → band). "
          "Validate with a keyword tool before investing.\n",
          _summary(KEYWORDS, 3),
          "## Keywords by cluster\n"]
    clusters = OrderedDict()
    for r in KEYWORDS:
        clusters.setdefault(r[1], []).append(r)
    for cluster, rows in clusters.items():
        md.append(f"### {cluster}\n")
        md.append("| Keyword | Intent | Difficulty | KD | Priority | Target page | Notes |")
        md.append("|---|---|---|---|---|---|---|")
        for r in sorted(rows, key=lambda x: x[3]):
            md.append(f"| {r[0]} | {r[2]} | {band(r[3])} | {r[3]} | {r[4]} | `{r[5]}` | {r[6]} |")
        md.append("")
    with open(os.path.join(HERE, "keywords.md"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(md))


def build_questions():
    csv_rows = [
        [q, c, i, band(kd), kd, p, a]
        for (q, c, i, kd, p, a) in QUESTIONS
    ]
    _write_csv(os.path.join(HERE, "questions.csv"), QUESTION_HEADER, csv_rows)

    md = ["# E-Piṭaka — SEO Question Queries (People-Also-Ask style)\n",
          "> Difficulty is an editorial estimate (0-100 KD → band). "
          "Validate with a keyword tool before investing.\n",
          _summary(QUESTIONS, 3),
          "## Questions by cluster\n"]
    clusters = OrderedDict()
    for r in QUESTIONS:
        clusters.setdefault(r[1], []).append(r)
    for cluster, rows in clusters.items():
        md.append(f"### {cluster}\n")
        md.append("| Question | Intent | Difficulty | KD | Priority | Answer angle |")
        md.append("|---|---|---|---|---|---|")
        for r in sorted(rows, key=lambda x: x[3]):
            md.append(f"| {r[0]} | {r[2]} | {band(r[3])} | {r[3]} | {r[4]} | {r[5]} |")
        md.append("")
    with open(os.path.join(HERE, "questions.md"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(md))


if __name__ == "__main__":
    build_keywords()
    build_questions()
    print(f"Wrote keywords.csv/.md ({len(KEYWORDS)} rows) "
          f"and questions.csv/.md ({len(QUESTIONS)} rows) to {HERE}")
