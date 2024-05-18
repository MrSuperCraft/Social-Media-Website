document.addEventListener('DOMContentLoaded', async () => {
    try {
        const searchParams = new URLSearchParams(window.location.search);
        const query = searchParams.get('query');
        const tags = searchParams.get('tags');

        const response = await fetch(`/api/search/results?query=${query}&tags=${tags}`);
        if (!response.ok) {
            throw new Error('Failed to fetch search results');
        }

        const posts = await response.json();

        if (posts.length === 0) {
            showNoContentMessage();
        }
        handlePostData(posts);

    } catch (error) {
        console.error('Error fetching search results:', error);
    }
});
