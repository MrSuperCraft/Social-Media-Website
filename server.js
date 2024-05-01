const express = require('express');
const session = require('express-session');
const app = express();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const multer = require('multer'); // Import Multer


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
// Middleware to fetch user data based on session ID or username
/* Middlewares */
// Middleware to fetch user data based on session ID or username
const fetchUserData = (req, res, next) => {
    const username = req.session.username;
    const user_id = req.session.user_id;

    let query;
    let params;
    if (user_id) {
        query = "SELECT * FROM users WHERE user_id = ?";
        params = [user_id];
    } else if (username) {
        query = "SELECT * FROM users WHERE username = ?";
        params = [username];
    } else {
        console.error('User ID and username not found in session');
        return res.status(400).json({ error: 'User data retrieval failed' });
    }

    db.get(query, params, (err, row) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Server error" });
        }
        if (!row) {
            console.error('User data not found for user ID:', user_id, 'or username:', username);
            return res.status(404).json({ error: 'User data not found' });
        }

        // Attach user data to the request object for further use
        req.userData = row;
        next(); // Move to the next middleware or route handler
    });
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


app.get('/settings', (req, res) => {
    const { username, user_id } = req.session;

    // Render the settings page with user data
    res.render('settings', { username, user_id });

    console.log(req.session);
});

app.get('/feed', (req, res) => {
    // Check if the user is logged in
    if (!req.session || !req.session.user) {
        return res.redirect('/login'); // Redirect to login if user is not logged in
    }

    console.log(req.session)
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
            req.session.user = { username: user.username };
            req.session.user_id = { user_id: user.user_id };
            req.session.profilePicture = user.profile_picture;

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
            req.session.user_id = { user_id: user.user_id };
            req.session.profilePicture = user.profile_picture;

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


app.get('/:username', (req, res) => {
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



app.get('/api/user/settings', fetchUserData, (req, res) => {
    const user_id = req.userData.user_id; // Access user ID from req object

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























app.listen(3000, () => {
    console.log('Server is running on port 3000');
    console.log('http://localhost:3000');
});


