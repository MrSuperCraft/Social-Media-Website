// Function to fetch user ID based on username from the URL
async function getUserIdByUsername() {

    let username = window.location.pathname.split('/')[1]; // Extract username from URL

    // If the username is 'feed', fetch session data to get the username and user_id
    if (username === 'feed' || username === 'add-post') {
        const sessionData = await getSessionData();
        console.log(sessionData)
        username = sessionData.username;
        if (!username) {
            throw new Error('Invalid or missing username in session data');
        }
    }

    if (!username || username === 'feed' || username === 'add-post') {
        throw new Error('Invalid or missing username');
    }



    try {
        const response = await fetch(`/api/users/${username}`); // Assuming your API endpoint to fetch user ID is /api/users/:username
        if (!response.ok) {
            throw new Error('User not found');
        }
        const data = await response.json();
        return data.userId; // Assuming the response contains the user ID
    } catch (error) {
        throw new Error('Error fetching user ID');
    }
}


async function getSessionData() {
    try {
        const response = await fetch('/api/session-data');
        if (!response.ok) {
            throw new Error('Failed to fetch session data');
        }
        const sessionData = await response.json();
        console.log(sessionData);
        return sessionData;
    } catch (error) {
        console.error(error);
        throw new Error('Error fetching session data');
    }
}


async function getUsernameFromId(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`); // Assuming your endpoint is '/api/users/:userId'
        if (!response.ok) {
            throw new Error('Failed to fetch username');
        }
        const userData = await response.json();
        console.log(userData.username)
        return userData.username;
    } catch (error) {
        console.error('Error fetching username:', error);
        return null; // Return null or handle the error in your UI
    }
}
