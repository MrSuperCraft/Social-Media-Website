document.addEventListener('DOMContentLoaded', function () {
    const dropzone = new Dropzone('#dropzone', {
        // Dropzone configuration here
        url: '/file-upload', // Set the initial upload URL
        paramName: 'file',
        maxFiles: 1,
        acceptedFiles: 'image/*',
        autoProcessQueue: false,
        method: 'POST', // Set the initial request method to POST
        init: function () {
            // Dropzone event handlers here
            this.on('success', function (file, response) {
                // Handle the successful upload
                console.log('File uploaded:', response);
                // Add logic to display the uploaded image or handle as needed
            });

            // Other Dropzone event handlers
        }
    });


});
