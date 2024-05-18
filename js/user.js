/**
 * This file contains functions related to user data retrieval and session management.
 * Each function performs a specific task such as fetching user ID based on username,
 * retrieving session data, and getting a username from a user ID.
 */

// Function to fetch user ID based on username from the URL
async function getUserIdByUsername() {
    let username = window.location.pathname.split('/')[1]; // Extract username from URL

    // If the username is 'feed' or 'add-post', fetch session data to get the username and user_id
    if (username === 'feed' || username === 'add-post') {
        const sessionData = await getSessionData();
        username = sessionData.username;
        if (!username) {
            throw new Error('Invalid or missing username in session data');
        }
    }

    // Check if the username is valid
    if (!username || username === 'feed' || username === 'add-post') {
        throw new Error('Invalid or missing username');
    }

    // Fetch the user ID from the API endpoint
    try {
        const response = await fetch(`/api/users/${username}`);
        if (!response.ok) {
            throw new Error('User not found');
        }
        const data = await response.json();
        return data.userId;
    } catch (error) {
        throw new Error('Error fetching user ID');
    }
}

// Function to fetch session data from the server
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

// Function to retrieve username from user ID
async function getUsernameFromId(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch username');
        }
        const userData = await response.json();
        return userData.username;
    } catch (error) {
        console.error('Error fetching username:', error);
        return null; // Return null or handle the error in your UI
    }
}
