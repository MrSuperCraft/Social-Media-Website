document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Extract search parameters from the URL
        const searchParams = new URLSearchParams(window.location.search);
        const query = searchParams.get('query'); // Get the 'query' parameter from the URL
        const tags = searchParams.get('tags'); // Get the 'tags' parameter from the URL

        // Fetch search results from the API
        const response = await fetch(`/api/search/results?query=${query}&tags=${tags}`); // Send a GET request to the API with query and tags parameters
        if (!response.ok) {
            throw new Error('Failed to fetch search results'); // Throw an error if the response status is not OK (not in the range 200-299)
        }

        const posts = await response.json(); // Parse the response body as JSON

        if (posts.length === 0) {
            showNoContentMessage(); // Show a message if no posts are returned
        }

        handlePostData(posts); // Handle the post data by rendering it

    } catch (error) {
        console.error('Error fetching search results:', error); // Log any errors that occur
    }
});
