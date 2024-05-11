function validateForm() {
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();

    // Perform validation
    if (!validateUsername(username)) {
        alert('Username already in use.');
        return false; // Prevent form submission
    }

    if (!validateEmail(email)) {
        alert('Email already in use.');
        return false; // Prevent form submission
    }

    return true; // Allow form submission
}

async function validateUsername(username) {
    // Send AJAX request to check username availability
    return fetch('/check-username', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username })
    })
        .then(response => response.json())
        .then(data => {
            // Check if username is available
            return data.available;
        })
        .catch(error => {
            console.error('Error:', error);
            return false; // Assume username is not available on error
        });
}

async function validateEmail(email) {
    // Send AJAX request to check email availability
    return fetch('/check-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
    })
        .then(response => response.json())
        .then(data => {
            // Check if email is available
            return data.available;
        })
        .catch(error => {
            console.error('Error:', error);
            return false; // Assume email is not available on error
        });
}

async function validateForm() {
    const Msg = new MessageComponent();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const bio = document.getElementById('bio').value.trim();
    const user_id = await getSessionData().user_id;
    console.log(user_id);

    try {
        // Perform validation
        if (!validateUsername(username)) {
            Msg.showMessage('Username already in use.', 'error');
            throw new Error('Username already in use.');
        }

        if (!validateEmail(email)) {
            Msg.showMessage('Email already in use.', 'error');
            throw new Error('Email already in use.');
        }

        // Log form data before sending
        console.log('Form data:', { user_id, username, email, password, bio });

        // Send form data to server
        const response = await fetch('/update-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id, username, email, password, bio })
        });

        if (!response.ok) {
            Msg.showMessage('Failed to update user data', 'error');
            throw new Error('Failed to update user data');
        }

        const data = await response.json();
        Msg.showMessage(data.message);
        Msg.showMessage('Success! Redirecting to profile page');
        // Optionally, redirect to another page after successful update
        window.location.href = `/${username}`;
    } catch (error) {
        console.error('Error updating user data:', error);
        Msg.showMessage('Failed to update user data', 'error');
    }

    return false; // Prevent default form submission
}
