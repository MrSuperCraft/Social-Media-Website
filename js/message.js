class MessageComponent {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'message-container fixed bottom-0 right-0 p-4 z-50 bg-transparent text-white';
        this.container.classList.add('rounded-lg', 'shadow-md');
        this.container.style.maxWidth = '400px'; // Set maximum width for the container
        document.body.appendChild(this.container);
    }

    showMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `message bg-gray-700 text-white px-3 py-2 mb-2 rounded-md`;
        if (type === 'success') {
            messageElement.classList.add('bg-green-500');
        } else if (type === 'error') {
            messageElement.classList.add('bg-red-500');
        }
        messageElement.textContent = message;
        this.container.appendChild(messageElement);

        // Automatically remove the message after a certain time (e.g., 5 seconds)
        setTimeout(() => {
            this.container.removeChild(messageElement);
        }, 5000);
    }
}
