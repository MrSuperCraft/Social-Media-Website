document.addEventListener('DOMContentLoaded', () => {
    // Select all elements with class 'filter-btn'
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Add click event listener to each filter button
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Toggle 'selected' class
            button.classList.toggle('selected');
            // Toggle background color classes
            button.classList.toggle('bg-gray-800');
            button.classList.toggle('bg-green-500');
        });
    });

    // Add input event listener to the search input element
    document.getElementById('searchInput').addEventListener('input', function () {
        const searchText = this.value;
        // Fetch autocomplete suggestions if input length is greater than 2
        if (searchText.length > 2) {
            fetchAutocompleteSuggestions(searchText);
        } else {
            // Clear suggestions if input length is 2 or less
            clearAutocompleteSuggestions();
        }
    });

    // Add keypress event listener to the search input element
    document.getElementById('searchInput').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission on Enter key
            const searchText = this.value;
            // Collect selected tags
            const tags = Array.from(document.querySelectorAll('.filter-btn.selected')).map(btn => btn.getAttribute('data-filter'));
            // Redirect to search results page with query and tags as parameters
            window.location.href = `/search/results?query=${encodeURIComponent(searchText)}&tags=${encodeURIComponent(tags.join(','))}`;
        }
    });

    /**
     * Fetches autocomplete suggestions based on the search text.
     * @param {string} searchText - The text to search for suggestions.
     */
    function fetchAutocompleteSuggestions(searchText) {
        fetch(`/search/autocomplete?query=${encodeURIComponent(searchText)}`)
            .then(response => response.json())
            .then(data => {
                displayAutocompleteSuggestions(data);
            });
    }

    /**
     * Displays autocomplete suggestions in the UI.
     * @param {Array} suggestions - The list of suggestions to display.
     */
    function displayAutocompleteSuggestions(suggestions) {
        const container = document.getElementById('autocompleteContainer');
        container.innerHTML = ''; // Clear previous suggestions
        suggestions.forEach(suggestion => {
            const suggestionElement = document.createElement('div');
            suggestionElement.classList.add('p-2', 'hover:bg-gray-700', 'cursor-pointer');
            suggestionElement.textContent = suggestion.title;
            // Add click event to set suggestion as input value and clear suggestions
            suggestionElement.addEventListener('click', () => {
                document.getElementById('searchInput').value = suggestion.title;
                clearAutocompleteSuggestions();
            });
            container.appendChild(suggestionElement);
        });
    }

    /*
     * Clears the autocomplete suggestions from the UI.
     */
    function clearAutocompleteSuggestions() {
        const container = document.getElementById('autocompleteContainer');
        container.innerHTML = ''; // Clear the suggestions
    }
});
