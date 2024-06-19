const express = require('express');
const session = require('express-session');
const app = express();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const multer = require('multer'); // Import Multer
const moment = require('moment');



app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static('assets'))
app.use(express.static('css'))
app.use(express.static('js'))
app.use(express.static('views'))
app.use(express.static('node_modules'))


app.set('view engine', "ejs");



// SQLite database connection
const db = new sqlite3.Database('mydb.db');



app.use(session({
    secret: 'DQUTl2U6CMafs9CZgDB22XHTpObhYgLXk7AcwvQlV6yjd5DHZB7Izz93R4r9uRvIU1roVAOWicOw7Xslrk0fh6vKBiP9icLO40HR6W9QSWkGAmPOqMzq4Yj84eIpd40R7V', // Change this to a secure secret
    resave: false,
    saveUninitialized: true,
    cookie: {
        path: '/',
        maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
        secure: false, // Change to false if not using HTTPS
        httpOnly: true,
    }
}));


/* Middlewares */

//  check if a user exists in a session. If not, redirect to /login. This should apply to all routes that require a user to be logged in.

const isAuth = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/login');
    }
    next();
};






























// Static routes

app.get('/', (req, res) => {
    // Pass the req object as a local variable
    res.render('index', { req });
});

app.get('/login', (req, res) => {
    // Open the login page

    res.render('login');
})


app.get('/settings', isAuth, (req, res) => {
    const { user_id } = req.session;
    const { username } = req.session.user; // Extract username from session data


    // Render the settings page with user data
    res.render('settings', { username, user_id });

});

app.get('/feed', isAuth, (req, res) => {
    // Check if the user is logged in
    if (!req.session || !req.session.user) {
        return res.redirect('/login'); // Redirect to login if user is not logged in
    }

    const { username } = req.session.user; // Extract username from session data



    // Render the feed template with the username variable
    res.render('feed', { username });
});


app.post('/logout', (req, res) => {
    // Destroy the session to log the user out
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Internal Server Error');
        }

        // Redirect the user to the home page or any desired page after logout
        res.redirect('/');
    });
});

app.get('/signup', (req, res) => {
    res.render("signup");
});


app.get('/add-post', isAuth, (req, res) => {
    res.render("add-post");
});

app.post('/sign-user-up', async (req, res) => {
    const { username, email, password } = req.body;

    // Check if the user already exists in the database
    const existingUser = await checkIfUserExists(username);
    if (existingUser) {
        return res.status(400).send('Username already exists'); // Send a response and stop further execution
    }

    // Validate email format (you can add more checks here)
    if (!isValidEmail(email)) {
        return res.status(400).send('Invalid email format');
    }

    // Hash the password
    bcrypt.hash(password, 10, async (err, hashedPassword) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }

        // Insert the new user into the database
        db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], async function (err) {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }

            console.log(`A new user has been signed up with ID ${this.lastID}`);

            // Set the session user, user ID, and profile picture
            req.session.user = username;
            req.session.user_id = this.lastID;
            req.session.profilePicture = null;
            req.session.email = email;


            // Send a success response and redirect to /feed
            res.status(200).redirect('/feed');
        });
    });
});

// Function to check if a user exists in the database
const checkIfUserExists = (username) => {
    return new Promise((resolve, reject) => {
        // Prepare the SQL query to select the user with the given username
        const sql = `SELECT * FROM users WHERE username = ?`;

        // Execute the query with the provided username parameter
        db.get(sql, [username], (err, row) => {
            if (err) {
                reject(err); // Error occurred, reject the promise
            } else {
                resolve(row); // Resolve with the user row (if found) or null
            }
        });
    });
};

// Helper function to validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

app.post('/sign-user-in', async (req, res) => {
    const { email_username, password } = req.body;

    try {
        // Check if the user exists in the database
        const user = await getUserByEmailOrUsername(email_username);
        if (!user) {
            return res.status(401).send('User not found'); // Send a response and stop further execution
        }

        // Check if the password matches
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            // Passwords match, set the session user and profile picture
            req.session.user = { username: user.username };
            req.session.user_id = user.user_id;
            req.session.profilePicture = user.profile_picture;
            req.session.email = user.email;

            console.log(req.session);
            // Send a success response
            res.redirect('/feed');
        } else {
            // Passwords don't match, send an unauthorized response
            res.status(401).send('Invalid password');
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Assuming you have already set up your SQLite database connection

function getUserByEmailOrUsername(emailOrUsername) {
    return new Promise((resolve, reject) => {
        // Query the database to find the user by email or username
        db.get('SELECT * FROM users WHERE email = ? OR username = ?', [emailOrUsername, emailOrUsername], (err, row) => {
            if (err) {
                console.error(err);
                return reject('Database error');
            }

            if (!row) {
                return resolve(null); // User not found
            }

            // User found, return the user object
            resolve({
                user_id: row.user_id,
                username: row.username,
                email: row.email,
                password: row.password, // Make sure not to send the password to the client in a real application
                profile_picture: row.profile_picture,
                banner_picture: row.banner_picture
                // Add other user properties as needed
            });
        });
    });
}

// Route to check if a username is available
app.post('/check-username', (req, res) => {
    const { username } = req.body;

    if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'Invalid username provided.' });
    }

    // Check if username exists in the database
    db.get('SELECT username FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error.' });
        }

        if (row) {
            // Username is taken
            return res.json({ available: false });
        } else {
            // Username is available
            return res.json({ available: true });
        }
    });
});

// Route to check if an email is available

app.post('/check-email', (req, res) => {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Invalid email provided.' });
    }

    // Check if email exists in the database
    db.get('SELECT email FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error.' });
        }

        if (row) {
            // Email is taken
            return res.json({ available: false });
        } else {
            // Email is available
            return res.json({ available: true });
        }
    });
});


app.get('/:username', isAuth, (req, res) => {
    const username = req.params.username;

    // Query the database to fetch user data
    const query = `SELECT * FROM users WHERE username = ?`;
    db.get(query, [username], (err, row) => {
        if (err) {
            console.error('Error querying database:', err);
            // Render error page or redirect to homepage
            res.status(500).send('Internal Server Error');
        } else if (row) {
            const user = row;
            // Render the profile page template with user data
            res.render('profile', { user });

        } else {
            // User not found, render error page or redirect to homepage
            res.status(404).send('User Not Found');
        }
    });
});

app.get('/api/users/:username', (req, res) => {
    const { username } = req.params;
    const query = `SELECT user_id FROM users WHERE username = ?`;
    db.get(query, [username], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ userId: row.user_id }); // Use row.user_id instead of row.userId
    });
});

app.get('/api/users/:user_id', async (req, res) => {
    const { user_id } = req.params;
    const query = `SELECT username FROM users WHERE user_id = ?`;
    db.get(query, [user_id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(row.username); // Use row.user_id instead of row.userId
    });
});



// Multer storage setup
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

// Route to handle file upload and update profile_picture
app.post('/file-upload', upload.single('file'), async (req, res) => {
    const { user_id } = req.body;
    const profilePictureData = req.file.buffer;

    const query = `UPDATE users SET profile_picture = ? WHERE user_id = ?`;
    db.run(query, [profilePictureData, user_id], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({ message: 'Profile picture updated successfully' });
    });
});


app.get('/api/user/pfp/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        const query = 'SELECT profile_picture FROM users WHERE user_id = ?';
        db.get(query, [userId], (err, row) => {
            if (err) {
                console.error('Database error:', err); // Log any database errors
                return res.status(500).json({ error: 'Server error' });
            }

            if (!row || !row.profile_picture) {
                console.error('Profile picture not found for user ID:', userId); // Log profile picture not found
                return res.status(404).json({ error: 'Profile picture not found' });
            }

            const profilePictureBlob = row.profile_picture;

            // Return the profile picture blob as a response
            res.set('Content-Type', 'image/png'); // Set the appropriate content type (e.g., image/png)
            res.send(profilePictureBlob);
        });
    } catch (error) {
        console.error('Server error:', error); // Log any server-side errors
        res.status(500).json({ error: 'Server error' });
    }
});


app.get('/api/session-data', (req, res) => {
    const sessionData = {
        username: req.session.user.username,
        user_id: req.session.user_id,
        email: req.session.email,
        profilePicture: req.session.profilePicture, // Assuming profile picture is stored in the session
        // Add other session data you want to send to the frontend
    };

    res.json(sessionData);
});




// Route to handle banner image upload and update banner_picture
app.post('/banner-upload', upload.single('file'), async (req, res) => {
    const { user_id } = req.body;
    const bannerImageData = req.file.buffer;

    const query = `UPDATE users SET banner_image = ? WHERE user_id = ?`;
    db.run(query, [bannerImageData, user_id], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({ message: 'Banner image updated successfully' });
    });
});


app.get('/api/user/banner/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        const query = 'SELECT banner_image FROM users WHERE user_id = ?';
        db.get(query, [userId], (err, row) => {
            if (err) {
                console.error('Database error:', err); // Log any database errors
                return res.status(500).json({ error: 'Server error' });
            }

            if (!row || !row.banner_image) {
                console.error('Banner image not found for user ID:', userId); // Log banner image not found
                return res.status(404).json({ error: 'Banner image not found' });
            }

            const bannerBlob = row.banner_image;

            // Return the banner image blob as a response
            res.set('Content-Type', 'image/png'); // Set the appropriate content type (e.g., image/png)
            res.send(bannerBlob);
        });
    } catch (error) {
        console.error('Server error:', error); // Log any server-side errors
        res.status(500).json({ error: 'Server error' });
    }
});



app.get('/api/user/settings', (req, res) => {
    const user_id = req.session.user_id;

    const query = "SELECT * FROM users WHERE user_id = ?";
    db.get(query, [user_id], (err, row) => {
        if (err) {
            console.error("Database Error: ", err);
            return res.status(500).json({ error: "Server error" });
        }
        if (!row) {
            console.error('User data not found for user ID:', user_id);
            return res.status(404).json({ error: 'User data not found' });
        }

        res.json({ data: row });
    });
});

// API endpoint to update user bio
app.post('/api/user/bio/:user_id', (req, res) => {
    const { user_id, bio } = req.body;

    // Update the user's bio in the database (pseudo code)
    db.run('UPDATE users SET bio = ? WHERE user_id = ?', [bio, user_id], (err, result) => {
        if (err) {
            console.error('Error updating bio:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        // Send success response
        res.json({ success: true });
    });
});

// create a route for the post request to /api/user/bio/:user_id which will get the user's bio from the database

app.get('/api/user/bio/:user_id', (req, res) => {
    const { user_id } = req.session.user_id;

    const query = "SELECT bio FROM users WHERE user_id = ?";
    db.get(query, [user_id], (err, row) => {
        if (err) {
            console.error("Database Error: ", err);
            return res.status(500).json({ error: "Server error" });
        }
        if (!row) {
            console.error('User data not found for user ID:', user_id);
            return res.status(404).json({ error: 'User data not found' });
        }

        res.json({ bio: row.bio });
    });
});








// Create a route for the post request to /api/add-post/:user_id which will add a new post to the database.
// This should add the title, content, image, tags, user_id, generate a post id, get post_image  and insert it into the database.
// It should also generate the created_at value to appear as the time the post was created. 

app.post('/api/add-post/:user_id', upload.single('image'), (req, res) => {
    const { user_id } = req.params;
    const { title, content, tags } = req.body;
    let imageBlob; // Initialize imageBlob variable

    if (req.file) {
        // If file exists, assign the buffer to imageBlob
        imageBlob = req.file.buffer;
    }
    // Format date and time using moment.js
    const created_at = moment().format('MM.DD.YY HH:mm:ss');


    // Fetch the username of the original poster using user_id
    const getUsernameQuery = 'SELECT username FROM users WHERE user_id = ?';
    db.get(getUsernameQuery, [user_id], (err, row) => {
        if (err) {
            console.error('Error fetching username:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        if (!row) {
            console.error('User not found with user_id:', user_id);
            return res.status(404).json({ error: 'User not found' });
        }

        const username = row.username;

        const query = `INSERT INTO posts (title, content, post_image, tags, user_id, username, created_at) VALUES (?,?,?,?,?,?,?)`;
        db.run(query, [title, content, imageBlob, tags, user_id, username, created_at], (err, result) => {
            if (err) {
                console.error('Error adding post:', err);
                return res.status(500).json({ error: 'Server error' });
            }
            // Send success response
            res.json({ success: true });
        });
    });
});






app.get('/api/posts', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const postsPerPage = 10; // Number of posts to display per page
        const offset = (page - 1) * postsPerPage;

        // Fetch posts from database with offset and limit, excluding post_image column
        const query = 'SELECT title, post_id, username, content, created_at, tags, likes_count FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?';
        db.all(query, [postsPerPage, offset], (err, rows) => {
            if (err) {
                console.error('Error fetching posts:', err);
                return res.status(500).json({ error: 'Server error' });
            }
            return res.json(rows);
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Server error' });
    }
});




// Route to handle form submission of new settings.
app.post('/update-user', async (req, res) => {
    const { user_id, username, email, password, bio } = req.body;

    // Retrieve user data from database
    db.get('SELECT * FROM users WHERE user_id = ?', [user_id], async (err, row) => {
        if (err) {
            console.error('Error retrieving user data:', err);
            return res.status(500).json({ message: 'Error updating user data' });
        }

        if (!row) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare hashed password with user's stored password
        const passwordMatch = await bcrypt.compare(password, row.password);

        if (!passwordMatch) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Update user data in the database
        db.run('UPDATE users SET username = ?, email = ?, bio = ? WHERE user_id = ?', [username, email, bio, user_id], (err) => {
            if (err) {
                console.error('Error updating user data:', err);
                return res.status(500).json({ message: 'Error updating user data' });
            }
            res.status(200).json({ message: 'User data updated successfully' });
        });
    });
});





// Route to fetch posts for a user
app.get('/api/posts/:username', (req, res) => {
    const { username } = req.params;
    const page = req.query.page || 1;
    const offset = (page - 1) * 10; // Assuming 10 posts per page

    db.all(`SELECT * FROM posts WHERE username = ? LIMIT 10 OFFSET ?`, [username, offset], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching posts' });
        }

        res.json(rows);
    });
});


// Route to fetch comments for a user
app.get('/api/comments/:username', (req, res) => {
    const { username } = req.params;
    const page = req.query.page || 1;
    const offset = (page - 1) * 10; // Assuming 10 comments per page

    db.all(`SELECT * FROM comments WHERE username = ? LIMIT 10 OFFSET ?`, [username, offset], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching comments' });
        } else {
            res.json(rows);
        }
    });
});






// Search bar implementation


// Endpoint for autocomplete suggestions
app.get('/search/autocomplete', async (req, res) => {
    const query = req.query.query || '';

    let sql = "SELECT title FROM posts WHERE title LIKE ?";
    let params = [`${query}%`]; // Match titles starting with the input string

    try {
        const rows = await new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        // Send the autocomplete suggestions as JSON
        res.status(200).json(rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});



// Endpoint to render search results page
app.get('/search/results', isAuth, async (req, res) => {
    const query = req.query.query || '';
    const tags = req.query.tags ? req.query.tags.split(',') : [];

    let sql = "SELECT * FROM posts WHERE title LIKE ?";
    let params = [`%${query}%`];

    if (tags.length > 0) {
        // Build the tag conditions dynamically
        const tagConditions = tags.map(tag => "tags LIKE ?");
        sql += ` AND (post_id IN (SELECT post_id FROM posts WHERE ${tagConditions.join(' OR ')}))`;
        params = [...params, ...tags.map(tag => `%${tag}%`)];
    }

    try {
        const rows = await new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        // Render the HTML page with search results
        res.render('search', { posts: rows });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});



// Endpoint to get the search results from the API
app.get('/api/search/results', async (req, res) => {
    const query = req.query.query || '';
    const tags = req.query.tags ? req.query.tags.split(',') : [];

    let sql = "SELECT * FROM posts WHERE (title LIKE ? OR content LIKE ?)";
    let params = [`%${query}%`, `%${query}%`];

    if (tags.length > 0) {
        // Build the tag conditions dynamically
        const tagConditions = tags.map(tag => "tags LIKE ?");
        sql += ` AND (${tagConditions.join(' OR ')})`;
        params = [...params, ...tags.map(tag => `%${tag}%`)];
    }

    try {
        const rows = await new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        // Send the search results as JSON
        res.status(200).json(rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});




// Update user settings route
app.post('/api/update-user', upload.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'bannerImage', maxCount: 1 }]), async (req, res) => {
    const { user_id, username, bio, email, password } = req.body;


    // Check if username or email are already taken
    const userExistsQuery = 'SELECT * FROM users WHERE user_id = ?';
    db.get(userExistsQuery, [user_id], (err, row) => {


        if (err) {
            console.error('Error checking if user exists:', err);
            return res.status(500).json({ error: 'Error updating user settings.' });
        }
        if (!row) {
            // User with the given user_id doesn't exist
            return res.status(404).json({ error: 'User not found.' });
        }

        // Proceed with updating user settings for the user with the given user_id

        // Create user object with updated settings
        const updatedUser = {
            username,
            email,
            password, // Note: You should handle password hashing and encryption here
            bio
        };

        // Add profile picture if uploaded
        if (req.files['profilePicture']) {
            updatedUser.profile_picture = req.files['profilePicture'][0].buffer;
        }

        // Add banner image if uploaded
        if (req.files['bannerImage']) {
            updatedUser.banner_image = req.files['bannerImage'][0].buffer;
        }

        // Update user settings in the database
        const updateUserQuery = 'UPDATE users SET username = ?, email = ?, bio = ?, profile_picture = ?, banner_image = ? WHERE user_id = ?';
        const params = [updatedUser.username, updatedUser.email, updatedUser.bio, updatedUser.profile_picture, updatedUser.banner_image, user_id];
        db.run(updateUserQuery, params, function (err) {
            if (err) {
                console.error('Error updating user settings:', err);
                return res.status(500).json({ error: 'Error updating user settings.' });
            }
            // User settings updated successfully
            res.status(200).json();
        });
    });
});






// Route to like a post
app.post('/api/posts/:postId/like', (req, res) => {
    const { user_id } = req.body;
    const { postId } = req.params;

    const queryCheck = `SELECT * FROM likes WHERE user_id = ? AND post_id = ?`;
    const queryInsert = `INSERT INTO likes (user_id, post_id) VALUES (?, ?)`;

    db.get(queryCheck, [user_id, postId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            db.run(queryInsert, [user_id, postId], function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                return res.status(200).json({ message: 'Post liked successfully' });
            });
        } else {
            return res.status(400).json({ message: 'Already liked' });
        }
    });
});

// Route to unlike a post
app.post('/api/posts/:postId/unlike', (req, res) => {
    const { user_id } = req.body;
    const { postId } = req.params;

    const queryDelete = `DELETE FROM likes WHERE user_id = ? AND post_id = ?`;

    db.run(queryDelete, [user_id, postId], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(400).json({ message: 'No like found' });
        }
        return res.status(200).json({ message: 'Post unliked successfully' });
    });
});

// Route to get like count for a post
app.get('/api/posts/:postId/like-count', (req, res) => {
    const { postId } = req.params;

    const queryCount = `SELECT COUNT(*) AS like_count FROM likes WHERE post_id = ?`;

    db.get(queryCount, [postId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        return res.status(200).json({ like_count: row.like_count });
    });
});

















app.listen(3000, () => {
    console.log('Server is running on port 3000');
    console.log('http://localhost:3000');
});


