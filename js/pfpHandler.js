
const modal = document.getElementById('modal');
const modalContent = modal.querySelector('.modal-content');
const overlay = document.querySelector('.overlay');

// Function to open the modal
function openModal() {
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
}

let myDropzone;


// Function to initialize Dropzone
function initializeDropzone() {
    if (myDropzone) {
        // If Dropzone instance exists, destroy it first
        myDropzone.destroy();
    }

    // Initialize Dropzone on the specified element
    myDropzone = new Dropzone('#dropzone', {
        // Dropzone configuration here
        url: '/file-upload', // Set the initial upload URL
        paramName: 'file',
        maxFiles: 1,
        acceptedFiles: 'image/*',
        autoProcessQueue: false, // Disable auto processing of the queue
        method: 'POST', // Set the initial request method to POST
        init: function () {
            const saveButton = document.getElementById('saveImageButton');

            // Handle the save button click event
            saveButton.addEventListener('click', async () => {
                try {
                    const userId = await getUserIdByUsername() || await getSessionData();

                    // Attach user ID to the form data before uploading
                    this.on('sending', function (file, xhr, formData) {
                        formData.append('user_id', userId);
                    });

                    // Process the queued files only if the user ID is available
                    if (userId) {
                        myDropzone.processQueue();
                    } else {
                        console.error('User ID not available');
                    }

                    closeModal();

                    window.location.reload();
                } catch (error) {
                    console.error(error);
                }
            });

            // Update the profile picture source after a successful upload
            this.on('success', async function (file, response) {
                console.log('File uploaded:', response);

                try {
                    const userId = await getUserIdByUsername();
                    console.log('User ID:', userId); // Log the fetched user ID

                    // Fetch the profile picture blob URL from the server
                    const res = await fetch(`/api/user/pfp/${userId}`);
                    if (!res.ok) {
                        console.error('Error fetching profile picture');
                        return;
                    }

                    const blobUrl = await res.blob();
                    console.log('Blob URL:', blobUrl); // Log the fetched blob URL

                    // Update the profile picture source with the fetched blob URL
                    const profilePicture = document.getElementById('profilePicture');
                    profilePicture.src = URL.createObjectURL(blobUrl);

                    // Handle success response as needed
                } catch (error) {
                    console.error('Error:', error); // Log any errors that occur
                }
            });


            // Add Dropzone styles
            document.querySelector('#dropzone').classList.add('dropzone', 'w-60', 'h-20', 'text-white', 'flex', 'items-center', 'justify-center');
            const iconElement = document.createElement('i');
            iconElement.classList.add('fas', 'fa-upload', 'text-white');
            document.querySelector('#dropzone').textContent = "Drop your files here or click to upload";
            document.querySelector('#dropzone').appendChild(iconElement);

        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const overlay = document.querySelector('.overlay');
    overlay.addEventListener('click', function () {
        initializeDropzone();
    });
});
// Function to initialize Dropzone for banner image upload
function initializeBannerDropzone() {
    // Initialize Dropzone on the specified element
    const bannerDropzone = new Dropzone('#bannerDropzone', {
        // Dropzone configuration here
        url: '/banner-upload', // Set the upload URL for banner images
        paramName: 'file',
        maxFiles: 1,
        acceptedFiles: 'image/*',
        autoProcessQueue: false, // Disable auto processing of the queue
        method: 'POST', // Set the request method to POST
        init: function () {
            const saveButton = document.getElementById('saveBannerButton');

            // Handle the save button click event for banner image upload
            saveButton.addEventListener('click', async () => {
                try {
                    const userId = await getUserIdByUsername() || await getSessionData();

                    // Attach user ID to the form data before uploading
                    this.on('sending', function (file, xhr, formData) {
                        formData.append('user_id', userId);
                    });

                    // Process the queued files only if the user ID is available
                    if (userId) {
                        bannerDropzone.processQueue();
                    } else {
                        console.error('User ID not available');
                    }

                    closeModal();

                    window.location.reload(); // Reload the page after successful upload
                } catch (error) {
                    console.error(error);
                }
            });

            // Handle success response after a successful upload
            this.on('success', async function (file, response) {
                console.log('File uploaded:', response);

                try {
                    const userId = await getUserIdByUsername();
                    console.log('User ID:', userId); // Log the fetched user ID

                    // Fetch the banner image blob URL from the server
                    const res = await fetch(`/api/user/banner/${userId}`);
                    if (!res.ok) {
                        console.error('Error fetching banner image');
                        return;
                    }

                    const blobUrl = await res.blob();
                    console.log('Blob URL:', blobUrl); // Log the fetched blob URL

                    // Update the banner image source with the fetched blob URL
                    const bannerImage = document.getElementById('bannerImage');
                    bannerImage.src = URL.createObjectURL(blobUrl);

                    // Handle success response as needed
                } catch (error) {
                    console.error('Error:', error); // Log any errors that occur
                }
            });

            // Add Dropzone styles
            document.querySelector('#bannerDropzone').classList.add('dropzone', 'w-60', 'h-20', 'text-white', 'flex', 'items-center', 'justify-center');
            const iconElement = document.createElement('i');
            iconElement.classList.add('fas', 'fa-upload', 'text-white');
            document.querySelector('#bannerDropzone').textContent = "Drop your files here or click to upload";
            document.querySelector('#bannerDropzone').appendChild(iconElement);
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const bannerOverlay = document.querySelector('.banner-overlay');
    bannerOverlay.addEventListener('click', function () {
        initializeBannerDropzone();
    });
});
