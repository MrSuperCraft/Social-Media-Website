document.addEventListener('DOMContentLoaded', async () => {
    try {
        const userId = await getUserIdByUsername();
        console.log('User ID:', userId); // Log the fetched user ID

        // Fetch the profile picture blob URL from the server
        const profilePictureRes = await fetch(`/api/user/pfp/${userId}`);
        if (!profilePictureRes.ok) {
            console.error('Error fetching profile picture');
            return;
        }

        const profileBlobUrl = await profilePictureRes.blob();
        console.log('Profile Blob URL:', profileBlobUrl); // Log the fetched blob URL

        // Update the profile picture source with the fetched blob URL
        const profilePicture = document.getElementById('profilePicture');
        profilePicture.src = URL.createObjectURL(profileBlobUrl);

        // Fetch the banner image blob URL from the server
        const bannerImageRes = await fetch(`/api/user/banner/${userId}`);
        if (!bannerImageRes.ok) {
            console.error('Error fetching banner image');
            return;
        }

        const bannerBlobUrl = await bannerImageRes.blob();
        console.log('Banner Blob URL:', bannerBlobUrl); // Log the fetched blob URL

        // Update the banner image source with the fetched blob URL
        const bannerImage = document.getElementById('bannerImage');
        bannerImage.src = URL.createObjectURL(bannerBlobUrl);

        // Handle success response as needed
    } catch (error) {
        console.error('Error:', error); // Log any errors that occur
    }
});
