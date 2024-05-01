// Function to fetch user ID based on username from the URL
async function getUserIdByUsername() {

    let username = window.location.pathname.split('/')[1]; // Extract username from URL

    // If the username is 'feed', fetch session data to get the username and user_id
    if (username === 'feed') {
        const sessionData = await getSessionData();
        console.log(sessionData)
        username = sessionData.username;
        if (!username) {
            throw new Error('Invalid or missing username in session data');
        }
    }

    if (!username || username === 'feed') {
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
        return sessionData;
    } catch (error) {
        console.error(error);
        throw new Error('Error fetching session data');
    }
}