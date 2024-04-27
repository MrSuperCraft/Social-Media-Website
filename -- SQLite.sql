-- SQLite



CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    profile_picture BLOB, -- New column for profile picture (pfp) as BLOB
    banner_image BLOB,    -- New column for banner image as BLOB
    bio TEXT              -- Column for bio remains as TEXT
);


SELECT * FROM users;