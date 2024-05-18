// Document ready function
document.addEventListener('DOMContentLoaded', () => {
    // Character count for bio input
    const bioInput = document.getElementById('bio');
    const charCount = document.getElementById('charCount');
    const bioStatus = document.getElementById('bioStatus');

    // Event listener for bio input changes
    bioInput.addEventListener('input', function () {
        const remainingChars = 30 - this.value.length;
        charCount.textContent = remainingChars;

        if (remainingChars === 0) {
            bioStatus.textContent = 'Your bio is full';
        } else {
            bioStatus.textContent = '';
        }
    });
});

// Fetch and populate user settings
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

// Populate form with user data
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

// Form validation and submission
document.addEventListener('DOMContentLoaded', async () => {
    const settingsForm = document.getElementById('settingsForm');
    const pfpInput = document.getElementById('profile-picture');
    const bannerInput = document.getElementById('banner-image');
    const msg = new MessageComponent();

    // Event listener for form submission
    settingsForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const bioInput = document.getElementById('bio');

        if (!validateForm(usernameInput.value, emailInput.value, passwordInput.value, bioInput.value)) {
            return;
        }

        const formData = new FormData();
        formData.append('username', usernameInput.value);
        formData.append('email', emailInput.value);
        formData.append('password', passwordInput.value);
        formData.append('bio', bioInput.value);

        if (pfpInput.files.length > 0) {
            formData.append('profilePicture', pfpInput.files[0]);
        }

        if (bannerInput.files.length > 0) {
            formData.append('bannerImage', bannerInput.files[0]);
        }

        try {
            const session = await getSessionData();
            const sessionId = session.user_id;
            console.log(sessionId);

            formData.append('user_id', sessionId);
            console.log(session.username);

            if (usernameInput.value.trim() === session.username) {
                // Usernames match, allow form submission
                msg.showMessage('Usernames match, allowing form submission... ✅', 'info');
            } else {
                // Usernames don't match, check for name availability
                const isValidUsername = await validateUsername(usernameInput.value);
                if (!isValidUsername) {
                    msg.showMessage('Username already in use. Try again.', 'error');
                    return;
                }
                // Username is available, allow form submission
            }

            if (emailInput.value.trim() === session.email) {
                // Emails match, allow form submission
                msg.showMessage('Emails match, allowing form submission... ✅', 'info');
            } else {
                const isValidEmail = await validateEmail(emailInput.value);
                if (!isValidEmail) {
                    msg.showMessage('Email already in use. Try again.', 'error');
                    return;
                }
            }

            const updateResponse = await fetch('/api/update-user', {
                method: 'POST',
                body: formData
            });

            if (updateResponse.ok) {
                msg.showMessage('User settings updated successfully! ✅', 'success');
                window.location.href = `/${usernameInput.value}`;
            } else {
                msg.showMessage('Failed to update user settings.', 'error');
            }
        } catch (error) {
            msg.showMessage('Error updating user settings.', 'error');
            console.error('Error updating user settings:', error);
        }
    });
});

// Function to validate form input
function validateForm(username, email, password, bio) {
    let isValid = true;

    if (username.trim() === '') {
        msg.showMessage('Please enter a username.', 'error');
        isValid = false;
    }

    if (email.trim() === '') {
        msg.showMessage('Please enter an email.', 'error');
        isValid = false;
    }

    if (password.trim() === '') {
        msg.showMessage('Please enter a password.', 'error');
        isValid = false;
    }

    if (bio.trim().length > 30) {
        msg.showMessage('Bio should be less than or equal to 30 characters.', 'error');
        isValid = false;
    }

    return isValid;
}

// Profile picture dropzone functionality
document.addEventListener('DOMContentLoaded', () => {
    const dropzoneFileInput = document.getElementById('profile-picture');
    const dropzoneContent = document.getElementById('profile-picture-content');
    const removeImageBtn = document.getElementById('removeImageBtn');

    // Event listener for clicking the dropzone
    dropzoneContent.addEventListener('click', () => {
        document.getElementById('profile-picture').click(); // Trigger file input click
    });

    // Event listener for file input change
    dropzoneFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const img = document.createElement('img');
                img.src = reader.result;
                img.classList.add('w-full', 'h-full', 'object-cover', 'rounded-lg');
                dropzoneContent.innerHTML = '';
                dropzoneContent.appendChild(img);
                dropzoneContent.classList.remove('border', 'border-dashed', 'bg-gray-800', 'hover:bg-gray-700', 'dark:hover:bg-gray-600');
                removeImageBtn.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    // Drag and drop functionality
    dropzoneContent.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzoneContent.classList.add('bg-gray-700', 'dark:bg-gray-600');
    });

    dropzoneContent.addEventListener('dragleave', () => {
        dropzoneContent.classList.remove('bg-gray-700', 'dark:bg-gray-600');
    });

    dropzoneContent.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzoneContent.classList.remove('bg-gray-700', 'dark:bg-gray-600');

        const file = e.dataTransfer.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const img = document.createElement('img');
                img.src = reader.result;
                img.classList.add('w-full', 'h-full', 'object-cover', 'rounded-lg');
                dropzoneContent.innerHTML = '';
                dropzoneContent.appendChild(img);
                dropzoneContent.classList.remove('border', 'border-dashed', 'bg-gray-800', 'hover:bg-gray-700', 'dark:hover:bg-gray-600');
                removeImageBtn.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    // Button to remove the image
    removeImageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        dropzoneContent.innerHTML = `
        <svg class="w-8 h-8 mb-2 text-gray-400  dark:text-gray-400" aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
            stroke-width="2"
            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
        </svg>
        <p class="text-xs text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to
            upload</span> or drag and drop</p>`;
        dropzoneContent.classList.add('border', 'border-dashed', 'bg-gray-800', 'hover:bg-gray-700', 'dark:hover:bg-gray-600');
        dropzoneFileInput.value = '';
        removeImageBtn.classList.add('hidden');
    });
});
