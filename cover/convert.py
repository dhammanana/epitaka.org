import re
from bs4 import BeautifulSoup

# Define transliteration rules
vowel_map = {
	'a': 'á', 'i': 'í', 'u': 'ú',  # Short vowels to sắc
	'ā': 'à', 'ī': 'ì', 'ū': 'ù', 'e': 'ê', 'o': 'ô'   # Long vowels to huyền
}
consonant_map = {
	'c': 'ch', 'j': 'gi', 'd': 'đ',
	'ṭ': 't', 'ḍ': 'd', 'ṇ': 'n',
	'v': 'w', 'ñ': 'nh', 'ṅ': 'ng',
	'ḷ': 'l', 'ṃ': 'ng',
}

consonants = ['k','g', 'ṅ', 'c','j', 'ñ', 't','d', 'n', 'ṭ', 'ḍ', 'ṇ', 'p', 'b', 'm',
			  'y', 'r', 'l', 'v', 's', 'ḷ', 'ṃ']


def transliterate_pali_word(word):
	
	# Replace consonants
	for pali_char, viet_char in consonant_map.items():
		word = word.replace(pali_char, viet_char)
	
	# Replace final 'd' with 't'
	word = word.replace('đ-', 't-')

	# Replace vowels
	result = []
	i = 0
	while i < len(word):
		if i + 1 < len(word) and word[i:i+2] in vowel_map:  # Check for long vowels
			result.append(vowel_map[word[i:i+2]])
			i += 2
		elif word[i] in vowel_map:  # Check for short vowels
			result.append(vowel_map[word[i]])
			i += 1
		else:
			result.append(word[i])
			i += 1

	
	
	return ''.join(result)

def process_html_file(input_file, output_file):
	# Read HTML file
	with open(input_file, 'r', encoding='utf-8') as f:
		soup = BeautifulSoup(f, 'html.parser')
	
	# Pattern to identify Pali words: vowel + consonant(s) + vowel
	pali_pattern = r'.*[aāiīuūeo][kgṅcjñtdnṭḍṇpbmyrlvsḷṃh]+[aāiīuūeo].*'
	
	for element in soup.find_all(string=True):
		# Skip script/style tags and empty text
		if element.parent.name in ['script', 'style'] or not element.strip():
			continue
		
		def replace_pali(match):
			word = match.group(0)
			
			if re.match(pali_pattern, word, re.I):
				print(word)
				# Split double consonants
				word = split_pali_syllables(word)
				# Transliterate the word
				return transliterate_pali_word(word)
			return word
		
		# Apply transliteration to words
		new_text = re.sub(r'\b\w+\b', replace_pali, element, flags=re.UNICODE)
		
		# Replace the text in the soup
		element.replace_with(new_text)
	
	# Write modified HTML to output file
	with open(output_file, 'w', encoding='utf-8') as f:
		f.write(str(soup))

def split_pali_syllables(word):
	"""
	Split a Pali word into syllables according to Pali phonological rules.
	
	Rules implemented:
	1. A syllable consists of a vowel, with optional consonants before/after
	2. Double consonants are split between syllables
	3. Consonant clusters are generally split with the first consonant ending the previous syllable
	4. Special case for aspirated consonants (kh, gh, ch, etc.)
	
	Args:
		word (str): A Pali word
		
	Returns:
		str: The word with syllables separated by hyphens
	"""
	if not word:
		return ""
	
	# Define vowels in Pali (including long vowels and special characters)
	vowels = "aāiīuūeo"
	
	# Define aspirated consonants (treated as single units)
	aspirated = ["kh", "gh", "ch", "jh", "ṭh", "ḍh", "th", "dh", "ph", "bh"]
	
	result = []
	i = 0
	
	while i < len(word):
		# Find the next vowel
		vowel_pos = i
		while vowel_pos < len(word) and word[vowel_pos].lower() not in vowels:
			vowel_pos += 1
		
		# If no vowel is found, add the remaining consonants to the last syllable
		if vowel_pos >= len(word):
			if result:
				result[-1] += word[i:]
			else:
				result.append(word[i:])
			break
		
		# Find the end of the current syllable
		end = vowel_pos + 1
		if end < len(word) and word[end].lower() not in vowels:
			# Handle consonant after vowel
			if end + 1 < len(word):
				# Check for double consonants
				if word[end].lower() == word[end + 1].lower():
					# Split double consonants between syllables
					result.append(word[i:end+1])
					i = end + 1
					continue
				
				# Check for aspirated consonants
				if end + 1 < len(word) and word[end:end+2].lower() in aspirated:
					# Keep aspirated consonants together in the next syllable
					result.append(word[i:end])
					i = end
					continue
				
				# Check for consonant clusters
				if end + 1 < len(word) and word[end+1].lower() not in vowels:
					# Split between consonants in a cluster
					result.append(word[i:end+1])
					i = end + 1
					continue
		
		# No special case, add vowel as a syllable
		result.append(word[i:end])
		i = end
	
	return "-".join(result)


# Example usage
if __name__ == "__main__":
	input_file = "../Apadāna-aṭṭhakathā.html"
	output_file = "output.html"
	process_html_file(input_file, output_file)
	print(f"Transliterated HTML saved to {output_file}")

