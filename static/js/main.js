function toggleSection(id) {
    const section = document.getElementById(id);
    section.classList.toggle('hidden');
}

document.addEventListener('keydown', function (e) {
    if (e.altKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        const searchInput = document.querySelector('input#search');
        if (searchInput) {
            searchInput.focus();
        }
    }
    if (e.altKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        const input = document.querySelector('#autocomplete-heading .aa-Input');
        if (input) {
            input.focus();
        }
    }

    if (e.ctrlKey && (e.key === 'Enter' || e.key === 'NumpadEnter')) {
        e.preventDefault();
        const items = document.querySelectorAll('#autocomplete-heading .aa-Item');
        if (items.length > 0) {
            window.location.href = 'search?q=' + encodeURIComponent(items[0].dataset.value);
        }
    }

});


/* ====== FOR SUGGESSION =========== */
const elmHeadings = document.querySelector('#autocomplete-heading')
if (elmHeadings){
    const { autocomplete } = window['@algolia/autocomplete-js'];
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('q') || '';
    autocomplete({
        container: '#autocomplete-heading',
        placeholder: 'Type Alt+H to search for title or word...',
        initialState: { query: searchTerm },

        getSources({ query }) {
            if (query.length < 2) return [];
            const lastWord = query.trim().split(' ').pop();
            return [
                {
                    sourceId: 'headings',
                    getItems() {
                        return fetch(`search_headings_suggest?q=${encodeURIComponent(query)}`)
                            .then(response => response.json())
                            .then(data => data.map(item => ({
                                label: `${item.book_title.split(' > ').at(-1)}: ${item.title}`,
                                value: `${item.book_id}#para-${item.para_id}`
                            })));
                    },
                    templates: {
                        item({ item }) {
                            return `🔎 ${item.label}`;
                        }
                    },
                    onSelect({ item }) {
                        window.location.href = `book/${item.value}`;
                    }
                },
                {
                    sourceId: 'words',
                    getItems() {
                        return fetch(`suggest_word?q=${encodeURIComponent(lastWord)}`)
                            .then(response => response.json())
                            .then(data => data.map(item => ({
                                label: `${item.word} (${item.frequency})`,
                                value: item.word
                            })));
                    },
                    templates: {
                        item({ item }) {
                            return item.label;
                        }
                    },
                    onSelect({ item, setQuery }) {
                        const words = query.split(' ');
                        words[words.length - 1] = item.value;
                        setQuery(words.join(' ') + ' ');
                    }
                }
            ];
        },
        onSubmit({ state }) {
            // if (!state.collections.some(collection => collection.items.length > 0)) {
            window.location.href = `search?q=${encodeURIComponent(state.query)}`;
            // }
        }
    });
}

/* handle dictionary. */
/* ====== FOR DICTIONARY DIALOG =========== */




function showDictionary(e) {
    e.preventDefault(); // Prevent default behavior
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
        const dialog = document.querySelector('dialog') || document.createElement('dialog');
        dialog.style.padding = '20px';
        dialog.style.borderRadius = '8px';
        dialog.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        dialog.innerHTML = `
            <h2 style="margin-top: 0;">${selectedText}</h2>
            <p>Dictionary meaning will be integrated here.</p>
            <button onclick="this.closest('dialog').close()">Close</button>
        `;
        if (!dialog.isConnected) document.body.appendChild(dialog);
        dialog.showModal();
    }
}

// document.addEventListener('DOMContentLoaded', () => {
//     const paliText = document.querySelectorAll('.pali-text');
//     paliText.forEach(item => {
//         item.style.userSelect = 'text'; // Ensure text selection
//         item.style.webkitUserSelect = 'text'; // For Safari
//         item.addEventListener('click', showDictionary, { passive: false });
//         item.addEventListener('touchend', showDictionary, { passive: false }); // Add touch support
//     });
// });
