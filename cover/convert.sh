#remove translated heading.
sed -i '/^\s*<div class="gemini-trans" style="color:darkblue"><h[1-3] id=".*$/d' *.html

for filename in *.html; do
	#create cover
	title=${filename%.*}
	convert "cover/cover.webp" \
	  -gravity North -pointsize 40 -fill white -annotate +0+150 "$title" \
	  -gravity South -pointsize 20 -fill lightblue -annotate +0+50 "Buddhaghosācariya" \
	  "cover_${title}.jpg"

	#convert to epub
	style="<style>\n.gemini-trans {\ndisplay: block;\ncolor: darkblue;\nmargin-top: 5px;\n}\n.pali {\ncolor: maroon;\nfont-weight: 500;\n}\n</style>"
	echo -e "$style" | cat - "$filename" > temp_file.html
	ebook-convert "temp_file.html" "epub/$title.epub" --cover cover_${title}.jpg --level1-toc //h:h3 --level2-toc //h:h4 --title $title --authors "Buddhaghosācariya"

	#clean up
	rm cover_${title}.jpg
	rm temp_file.html

done
