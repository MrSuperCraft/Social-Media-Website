document.addEventListener('DOMContentLoaded', () => {
    const bioForm = document.getElementById('bioForm');
    const bioTextarea = document.getElementById('bio');

    bioForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newBio = bioTextarea.value.trim();
        if (newBio) {
            try {
                const response = await fetch('/api/update-bio', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ bio: newBio }),
                });
                if (response.ok) {
                    alert('Bio updated successfully!');
                } else {
                    console.error('Failed to update bio');
                }
            } catch (error) {
                console.error('Error updating bio:', error);
            }
        }
    });
});
