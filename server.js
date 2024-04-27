const express = require('express');
const session = require('express-session');
const app = express();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

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



// Static routes

app.get('/', (req, res) => {
    // Pass the req object as a local variable
    res.render('index', { req });
});

app.get('/login', (req, res) => {
    // Check if the user is already authenticated
    if (req.session.username) {
        // If authenticated, redirect to the page

    } else {
        // If not authenticated, render the login page
        res.render("login");
    }
});

app.get('/feed', (req, res) => {
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
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }

        // Insert the new user into the database
        db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }

            // Set the session user
            req.session.user = { username: username };


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

    // Check if the user exists in the database
    const user = await getUserByEmailOrUsername(email_username);
    if (!user) {
        return res.status(401).send('User not found'); // Send a response and stop further execution
    }

    // Check if the password matches
    bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }

        if (result) {
            // Passwords match, set the session user
            req.session.user = { username: user.username };
            req.session.user_id = { user_id: user.id };

            // Send a success response
            res.redirect('/feed');
        } else {
            // Passwords don't match, send an unauthorized response
            res.status(401).send('Invalid password');
        }
    });
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
                id: row.id,
                username: row.username,
                email: row.email,
                password: row.password // Make sure not to send the password to the client in a real application
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

























app.listen(3000, () => {
    console.log('Server is running on port 3000');
    console.log('http://localhost:3000');
});


