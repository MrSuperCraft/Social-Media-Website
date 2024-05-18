document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Toggle selected class
            button.classList.toggle('selected');
            // Toggle background color class
            button.classList.toggle('bg-gray-800');
            button.classList.toggle('bg-green-500');
        });
    });

    document.getElementById('searchInput').addEventListener('input', function () {
        const searchText = this.value;
        if (searchText.length > 2) {
            fetchAutocompleteSuggestions(searchText);
        } else {
            clearAutocompleteSuggestions();
        }
    });

    document.getElementById('searchInput').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const searchText = this.value;
            const tags = Array.from(document.querySelectorAll('.filter-btn.selected')).map(btn => btn.getAttribute('data-filter'));
            window.location.href = `/search/results?query=${encodeURIComponent(searchText)}&tags=${encodeURIComponent(tags.join(','))}`;
        }
    });

    function fetchAutocompleteSuggestions(searchText) {
        fetch(`/search/autocomplete?query=${encodeURIComponent(searchText)}`)
            .then(response => response.json())
            .then(data => {
                displayAutocompleteSuggestions(data);
            });
    }

    function displayAutocompleteSuggestions(suggestions) {
        const container = document.getElementById('autocompleteContainer');
        container.innerHTML = '';
        suggestions.forEach(suggestion => {
            const suggestionElement = document.createElement('div');
            suggestionElement.classList.add('p-2', 'hover:bg-gray-700', 'cursor-pointer');
            suggestionElement.textContent = suggestion.title;
            suggestionElement.addEventListener('click', () => {
                document.getElementById('searchInput').value = suggestion.title;
                clearAutocompleteSuggestions();
            });
            container.appendChild(suggestionElement);
        });
    }

    function clearAutocompleteSuggestions() {
        const container = document.getElementById('autocompleteContainer');
        container.innerHTML = '';
    }


});

