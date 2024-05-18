class MessageComponent {
    constructor() {
        // Create the container element for messages
        this.container = document.createElement('div');
        this.container.className = 'message-container fixed bottom-0 right-0 p-4 z-50 bg-transparent text-white';
        this.container.classList.add('rounded-lg', 'shadow-md');
        this.container.style.maxWidth = '400px'; // Set maximum width for the container
        document.body.appendChild(this.container); // Append the container to the body
    }

    /**
     * Displays a message in the message container.
     * @param {string} message - The message to display.
     * @param {string} [type='info'] - The type of message (info, success, error).
     */
    showMessage(message, type = 'info') {
        // Create a new message element
        const messageElement = document.createElement('div');
        messageElement.className = `message bg-gray-700 text-white px-3 py-2 mb-2 rounded-md`;

        // Add specific class based on message type
        if (type === 'success') {
            messageElement.classList.add('bg-green-500');
        } else if (type === 'error') {
            messageElement.classList.add('bg-red-500');
        }

        // Set the text content of the message
        messageElement.textContent = message;
        this.container.appendChild(messageElement); // Append the message to the container

        // Automatically remove the message after 5 seconds
        setTimeout(() => {
            this.container.removeChild(messageElement);
        }, 5000);
    }
}
