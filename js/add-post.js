// Event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Selecting all elements with the class 'filter-btn'
    const tagButtons = document.querySelectorAll('.filter-btn');
    const tagInput = document.getElementById('tagInput');

    // Adding click event listeners to each tag button
    tagButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const tag = button.dataset.tag;
            const isSelected = button.classList.toggle('bg-gray-800'); // Toggle selected background color
            const isActive = button.classList.toggle('active');
            button.classList.toggle('bg-gray-600', !isSelected); // Toggle background color based on isSelected
            button.classList.toggle('inactive', !isActive); // Toggle background color based on isSelected

            // Update the selected tags in the input field
            updateSelectedTags(tag, isSelected);
        });
    });

    // Function to update the selected tags input field
    function updateSelectedTags(tag, isSelected) {
        const currentTags = tagInput.value.split(',').map(t => t.trim());
        const tagIndex = currentTags.indexOf(tag);
        if (isSelected && tagIndex === -1) {
            currentTags.push(tag);
        } else if (!isSelected && tagIndex !== -1) {
            currentTags.splice(tagIndex, 1);
        }
        tagInput.value = currentTags.join(', ');
    }

    // Selecting the post form element
    const postForm = document.getElementById('postForm');
    const Msg = new MessageComponent();

    // Adding submit event listener to the post form
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the form from submitting normally

        const data = await getSessionData();
        const user_id = data.user_id;

        // Get the form data
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const image = document.getElementById('dropzone-file').files[0];
        const tags = Array.from(document.querySelectorAll('.filter-btn.active')).map(btn => btn.dataset.tag);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('tags', JSON.stringify(tags)); // Convert tags array to JSON string

            // Append image file to form data if it's not empty
            if (image) {
                formData.append('image', image);
            }

            // Send POST request to the server with the form data
            const response = await fetch(`/api/add-post/${user_id}`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            console.log(data);

            // Show success message and redirect to the feed page
            Msg.showMessage('success! Redirecting to the feed ✅', 'success');
            setTimeout(() => {
                window.location.href = '/feed';
            }, 2000);

        } catch (error) {
            // Handle any errors that occur during the request
            Msg.showMessage('Error! Try again later ❌', 'error');
            console.error(error);
        }
    });
});

// Event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const contentTextarea = document.getElementById('content');
    const charCount = document.getElementById('charCount');

    // Update character count on textarea input
    contentTextarea.addEventListener('input', () => {
        const content = contentTextarea.value;
        const remainingChars = 1000 - content.length;
        charCount.textContent = `${content.length}/1000 characters`;
    });
});

// Automatically adjust textarea height based on content
const tx = document.getElementsByTagName("textarea");
for (let i = 0; i < tx.length; i++) {
    tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
    tx[i].addEventListener("input", OnInput, false);
}

function OnInput() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + "px";
}

// Event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const dropzoneFileInput = document.getElementById('dropzone-file');
    const dropzoneContent = document.getElementById('dropzone-content');
    const removeImageBtn = document.getElementById('removeImageBtn');

    // Handle file input change event
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

    // Handle drag and drop functionality
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

    // Handle remove image button click event
    removeImageBtn.addEventListener('click', () => {
        dropzoneContent.innerHTML = `
            <svg class="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p class="text-xs text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">(SVG, PNG, JPG, GIF)</p>
        `;
        dropzoneContent.classList.add('border', 'border-dashed', 'bg-gray-800', 'hover:bg-gray-700', 'dark:hover:bg-gray-600');
        dropzoneFileInput.value = ''; // Clear the file input value
        removeImageBtn.classList.add('hidden');
    });

    // Show remove button on hover if an image exists
    dropzoneContent.addEventListener('mouseenter', () => {
        if (dropzoneContent.querySelector('img')) {
            removeImageBtn.classList.remove('hidden');
        }
    });

    dropzoneContent.addEventListener('mouseleave', () => {
        removeImageBtn.classList.add('hidden');
    });
});
