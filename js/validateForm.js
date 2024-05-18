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
