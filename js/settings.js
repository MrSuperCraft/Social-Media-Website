
document.addEventListener('DOMContentLoad', () => {
    const bioInput = document.getElementById('bio');
    const charCount = document.getElementById('charCount');
    const bioStatus = document.getElementById('bioStatus');

    bioInput.addEventListener('input', function () {
        const remainingChars = 30 - this.value.length;
        charCount.textContent = remainingChars;

        if (remainingChars === 0) {
            bioStatus.textContent = 'Your bio is full';
        } else {
            bioStatus.textContent = 'Your bio is empty';
        }
    });


});





document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/user/settings');
        if (!res.ok) {
            throw new Error('Failed to fetch user data');
        }

        const responseData = await res.json();
        const userData = responseData.data; // Extract userData from responseData
        console.log('User data:', userData);
        populateForm(userData);
    } catch (error) {
        console.error('Error:', error);
    }
});

function populateForm(data) {
    const form = document.getElementById('settingsForm');
    if (!form) return;

    // Debugging: Log data values to check if they are accessible
    console.log('Username:', data.username);
    console.log('Email:', data.email);

    // Populate form fields
    form.querySelector('#username').value = data.username;
    form.querySelector('#email').value = data.email;
    form.querySelector('#password').value = '';

    // Add other fields as needed
}
