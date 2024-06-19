document.addEventListener('DOMContentLoaded', async () => {

    // Update the profile picture source with the fetched blob URL
    const profilePicture = document.getElementById('profilePicture');

    try {
        const userId = await getUserIdByUsername();
        // Fetch the profile picture blob URL from the server
        const profilePictureRes = await fetch(`/api/user/pfp/${userId}`);
        if (profilePictureRes.status == 404) {
            profilePicture.src = 'https://static.vecteezy.com/system/resources/thumbnails/002/534/006/small/social-media-chatting-online-blank-profile-picture-head-and-body-icon-people-standing-icon-grey-background-free-vector.jpg';
        }

        if (!profilePictureRes.ok) {
            console.error('Error fetching profile picture');
            return;
        }

        const profileBlobUrl = await profilePictureRes.blob();
        console.log('Profile Blob URL:', profileBlobUrl); // Log the fetched blob URL

        profilePicture.src = URL.createObjectURL(profileBlobUrl);

        // Fetch the banner image blob URL from the server
        const bannerImageRes = await fetch(`/api/user/banner/${userId}`);
        if (!bannerImageRes.ok) {
            console.error('Error fetching banner image');
            return;
        }

        const bannerBlobUrl = await bannerImageRes.blob();
        console.log('Banner Blob URL:', bannerBlobUrl); // Log the fetched blob URL

        // Update the banner image source with the fetched blob URL
        const bannerImage = document.getElementById('bannerImage');
        bannerImage.src = URL.createObjectURL(bannerBlobUrl);

        // Handle success response as needed
    } catch (error) {
        console.error('Error:', error); // Log any errors that occur
    }
});

const recentPostsContainer = document.getElementById('recentPostsContainer');
const recentCommentsContainer = document.getElementById('recentCommentsContainer');

let pageCount = 1; // Initial page number
let offsetTimes = 0; // Initial offset value
let loadComplete = false; // Flag to track initial load

// Function to handle post data
function handlePostData(data) {
    if (data.length === 0 && !loadComplete) {
        window.removeEventListener('scroll', handleScroll);
        loadComplete = true;
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
        recentPostsContainer.appendChild(card);
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
            <span class="likes-count" data-post-id="${post.post_id}">${post.likes_count || 0} </span>
            <button class="like-button ${isUserLiked(post.post_id) ? 'liked' : ''}" data-post-id="${post.post_id}">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    `;

    // Style the likes-container to position it at the bottom right
    const likesContainer = card.querySelector('.likes-container');
    likesContainer.style.position = 'absolute';
    likesContainer.style.bottom = '0';
    likesContainer.style.right = '0';
    likesContainer.style.margin = '0 8px 5px 0'; // Margin from the corner
    likesContainer.style.display = 'flex'; // Flex display for positioning

    // Add event listener for like button click
    const likeButton = card.querySelector('.like-button');
    likeButton.addEventListener('click', () => handleLikeClick(post.post_id));

    return card;
}


// Function to format time ago (you can replace this with your implementation)
function formatTimeAgo(createdAt) {
    return createdAt; // Sample format
}

// Function to show no content message
function showNoContentMessage() {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-message text-gray-500 text-center text-lg font-medium mt-5';
    emptyMessage.innerText = `Well, there's nothing more here. Try next time!`;
    recentPostsContainer.appendChild(emptyMessage);


    const noContentImage = document.createElement('img');
    noContentImage.width = 250;
    noContentImage.height = 200;
    noContentImage.className = 'no-content-image mx-auto';
    noContentImage.src = '/no-data.svg'; // Provide the path to your no data image
    recentPostsContainer.appendChild(noContentImage);
}

// Function to handle scrolling and load more activity
function handleScroll() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
        loadActivity(); // Load more activity when reaching the bottom with a slight offset
    }
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

async function isUserLiked(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}/like-count`);
        const data = await response.json();
        return data.like_count > 0; // Check if like_count is greater than 0 to determine if user has liked the post
    } catch (error) {
        console.error('Error checking if user liked post:', error);
        return false; // Default to false if there's an error
    }
}

async function handleLikeClick(postId) {
    const likeButton = document.querySelector(`.like-button[data-post-id="${postId}"]`);

    // Disable the like button to prevent multiple clicks
    likeButton.disabled = true;

    const isLiked = await isUserLiked(postId);

    try {
        const session = await getSessionData();
        const sessionId = session.user_id;

        if (isLiked) {
            // User has already liked the post, send unlike request
            await fetch(`/api/posts/${postId}/unlike`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: sessionId }),
            });
        } else {
            // User has not liked the post, send like request
            await fetch(`/api/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: sessionId }),
            });
        }

        // Update UI after like/unlike action
        const likesCountElement = document.querySelector(`.likes-count[data-post-id="${postId}"]`);

        const newLikesCount = parseInt(likesCountElement.innerText) + (isLiked ? -1 : 1);
        likesCountElement.innerText = newLikesCount;
        likeButton.classList.toggle('liked');
    } catch (error) {
        console.error('Error liking/unliking post:', error);
        // Handle any errors that occur during the API call
    } finally {
        // Re-enable the like button after the API request completes
        likeButton.disabled = false;
    }
}



async function loadActivity(username) {
    try {
        const spinnerPosts = recentPostsContainer.querySelector('.spinner');
        spinnerPosts.style.display = 'block'; // Show spinner while loading posts


        // Fetch posts
        const postsResponse = await fetch(`/api/posts/${username}?page=${pageCount}&offset=${offsetTimes}`);
        if (!postsResponse.ok) {
            throw new Error('Failed to fetch posts');
        }
        const postData = await postsResponse.json();
        console.log('Posts:', postData);

        // Fetch comments
        // const commentsResponse = await fetch(`/api/comments?page=${pageCount}&offset=${offsetTimes}`);
        // if (!commentsResponse.ok) {
        //     throw new Error('Failed to fetch comments');
        // }
        // const commentsData = await commentsResponse.json();
        // console.log('Comments:', commentsData);

        // Handle post and comment data
        handlePostData(postData);
        // handleCommentData(commentsData);
    } catch (error) {
        console.error('Error loading activity:', error);
    } finally {
        const spinnerPosts = recentPostsContainer.querySelector('.spinner');
        spinnerPosts.style.display = 'none'; // Hide spinner after loading posts
    }
}


// Example usage of loadActivity function
document.addEventListener('DOMContentLoaded', async () => {

    // get the username from the URL for the template localhost:3000/username. window.location.pathname
    const username = window.location.pathname.split('/')[1];
    console.log('Username:', username);

    // Load initial activity
    await loadActivity(username);

    // Add scroll event listener to load more activity
    window.addEventListener('scroll', handleScroll);
});

// Function to truncate text to a specified maximum length
function truncateText(text, maxLength = 150) {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}


// Function to get Font Awesome icon classes for different tags
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
        default:
            return 'fa-question-circle'; // Default icon if tag is not recognized
    }
}
