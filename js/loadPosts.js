const postsContainer = document.getElementById('postsContainer');
const spinner = document.getElementById('spinner');
let page = 1; // Initial page number
let offset = 0; // Initial offset value
let initialLoadComplete = false; // Flag to track initial load

// Function to fetch and load posts
async function loadPosts() {
    try {
        spinner.style.display = 'block'; // Show spinner while loading
        const response = await fetch(`/api/posts?page=${page}&offset=${offset}`);
        const data = await response.json();

        handlePostData(data);
    } catch (error) {
        console.error('Error loading posts:', error);
    } finally {
        spinner.style.display = 'none'; // Hide spinner after loading
    }
}

// Function to handle post data
function handlePostData(data) {
    if (data.length === 0 && !initialLoadComplete) {
        showNoContentMessage();
        window.removeEventListener('scroll', handleScroll);
        initialLoadComplete = true;
    } else {
        renderPosts(data);
        page++;
        offset += data.length;
    }
}

// Function to render posts in the UI
function renderPosts(posts) {
    posts.forEach(post => {
        const card = createPostCard(post);
        postsContainer.appendChild(card);
    });
}

// Function to create a card element for a post
function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.position = 'relative'; // Ensure relative positioning for absolute elements inside

    // Construct card content based on post data
    // Customize this part based on your post structure
    card.innerHTML = `
        <a href="/posts/${post.post_id}" class="card-link">
            <h3 class="card-title">${post.title}</h3>
            <p class="card-content">${truncateText(post.content)}</p>
            ${renderTags(post.tags)} <!-- Render tags -->
            <div class="meta mt-2">
                <span>Posted by ${post.username}</span>
                <span>at ${formatTimeAgo(post.created_at)}</span>
            </div>
        </a>
        <div class="likes-container">
            <span class="likes-count">${post.likes || 0} </span>
            <button class="like-button ${isUserLiked(post.post_id) ? 'liked' : ''}">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    `;

    // Style the likes-container to position it at the bottom right
    const likesContainer = card.querySelector('.likes-container');
    likesContainer.style.position = 'absolute';
    likesContainer.style.bottom = '0';
    likesContainer.style.right = '0';
    // set the margin from the corner to be 5 px from the corner
    likesContainer.style.margin = '5px 5px 0 0';
    likesContainer.style.display = 'flex'; // Ensure flex display for positioning

    // Add event listener for like button click
    const likeButton = card.querySelector('.like-button');
    likeButton.addEventListener('click', () => handleLikeClick(post.post_id));

    return card;
}

// Function to check if the user has already liked the post
function isUserLiked(postId) {
    // Implement your logic to check if the user has liked the post
    // You can store liked post IDs in local storage or a database
    // Return true if the user has liked the post, otherwise false
    return false; // Placeholder, replace with your implementation
}

// Function to handle like button click
function handleLikeClick(postId) {
    if (isUserLiked(postId)) {
        // User has already liked the post, do nothing
        return;
    }

    // User has not liked the post, update the like count and mark as liked
    // You can make an API call to update the like count in the database
    // Update the UI to reflect the new like count and change the button style
    const likesCountElement = document.querySelector(`.likes-count[data-post-id="${postId}"]`);
    const likeButton = document.querySelector(`.like-button[data-post-id="${postId}"]`);

    const newLikesCount = parseInt(likesCountElement.innerText) + 1;
    likesCountElement.innerText = newLikesCount;
    likeButton.classList.add('liked');

    // Make API call to update the like count in the database
    // You can use fetch API or any other HTTP library to make the request
    // Replace the following code with your implementation
    fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
    })
        .then(response => response.json())
        .then(data => {
            // Handle the response from the server
            // You can update the UI or perform any other actions based on the response
        })
        .catch(error => {
            // Handle any errors that occur during the API call
            console.error('Error liking post:', error);
        });
}

// Function to render tags
function renderTags(tags) {
    if (!tags || tags.trim() === '') return ''; // No tags to render

    const cleanedTags = tags.replace(/[\[\]\"']/g, '').split(',');
    const validTags = cleanedTags.filter(tag => tag.trim() !== ''); // Filter out empty tags

    if (validTags.length === 0) return ''; // No valid tags to render

    const tagsHtml = validTags.map(tag => `
        <span class="tag inline-flex items-center justify-center px-2 py-1 mr-1 bg-gray-800 text-gray-200 rounded-full">
            <i class="fas ${getIconForTag(tag.trim())} mr-1"></i>${tag.trim()}
        </span>
    `).join('');

    return `<div class="tags mt-2">${tagsHtml}</div>`;
}

// Function to format time ago (you can replace this with your implementation)
function formatTimeAgo(createdAt) {
    return createdAt; // Sample format
}

// Function to truncate text
function truncateText(text, maxLength = 150) {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

// Function to show no content message
function showNoContentMessage() {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-message text-gray-500 text-center text-lg font-medium mt-5';
    emptyMessage.innerText = `Well, there's nothing more here. Try next time!`;
    postsContainer.appendChild(emptyMessage);

    const noContentImage = document.createElement('img');
    noContentImage.width = 250;
    noContentImage.height = 200;
    noContentImage.className = 'no-content-image mx-auto';
    noContentImage.src = '/no-data.svg'; // Provide the path to your no data image
    postsContainer.appendChild(noContentImage);
}

// Event listener for scrolling
window.addEventListener('scroll', handleScroll);

// Function to handle scrolling and load more posts
function handleScroll() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
        loadPosts(); // Load more posts when reaching the bottom with a slight offset
    }
}

// Initial load of posts
loadPosts();


function getIconForTag(tag) {
    switch (tag.toLowerCase()) {
        case 'technology':
            return 'fa-laptop-code';
        case 'art & design':
            return 'fa-paint-brush';
        case 'music':
            return 'fa-music';
        case 'science':
            return 'fa-flask';
        case 'sports':
            return 'fa-football-ball';
        case 'fashion':
            return 'fa-tshirt';
        case 'travel':
            return 'fa-plane-departure';
        case 'food & cooking':
            return 'fa-utensils';
        case 'books & literature':
            return 'fa-book-open';
        case 'movies & tv':
            return 'fa-tv';
    }
}

