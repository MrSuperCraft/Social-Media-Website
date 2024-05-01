document.addEventListener('DOMContentLoaded', function () {
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

    overlay.addEventListener('click', openModal);

    // Prevent closing the modal when clicking inside it
    modalContent.addEventListener('click', (e) => {
        e.stopPropagation(); // Stop the click event from reaching the modal's parent
    });

    modal.addEventListener('click', (e) => {
        if (e.target != modalContent) {
            closeModal(); // Close modal only if click is outside modal content
        }
    });


    const bannerModal = document.getElementById('bannerModal');
    const bannerModalContent = bannerModal.querySelector('.modal-content');
    const bannerOverlay = document.querySelector('.banner-overlay');

    // Function to open the banner modal
    function openBannerModal() {
        bannerModal.style.display = 'block';
    }

    function closeBannerModal() {
        bannerModal.style.display = 'none';
    }

    bannerOverlay.addEventListener('click', openBannerModal);

    // Prevent closing the banner modal when clicking inside it
    bannerModalContent.addEventListener('click', (e) => {
        e.stopPropagation(); // Stop the click event from reaching the banner modal's parent
    });

    bannerModal.addEventListener('click', (e) => {
        if (e.target != bannerModalContent) {
            closeBannerModal(); // Close banner modal only if click is outside modal content
        }
    });

});