-- SQLite


CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    profile_picture BLOB,
    banner_image BLOB,
    bio TEXT,
    join_date DATE DEFAULT CURRENT_DATE
);


CREATE TABLE IF NOT EXISTS posts (
    title TEXT,
    post_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    post_image BLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    likes_count INTEGER DEFAULT 0,
    username TEXT,
    tags TEXT,

    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (username) REFERENCES users(username)
);


CREATE TABLE IF NOT EXISTS likes (
    like_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    comment_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (post_id) REFERENCES posts(post_id),
    FOREIGN KEY (comment_id) REFERENCES comments(comment_id)
);

CREATE TABLE IF NOT EXISTS follows (
    follow_id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES users(user_id),
    FOREIGN KEY (following_id) REFERENCES users(user_id)
);





-- Create a trigger to update the follow_count column when a new follow is inserted
CREATE TRIGGER IF NOT EXISTS update_follow_count_after_insert
AFTER INSERT ON follows
FOR EACH ROW
BEGIN
    UPDATE users
    SET follow_count = (
        SELECT COUNT(*)
        FROM follows
        WHERE follows.follower_id = NEW.follower_id
    )
    WHERE user_id = NEW.follower_id;
END;


-- Create a trigger to update the post_count column when a new post is inserted
CREATE TRIGGER IF NOT EXISTS update_post_count_after_insert
AFTER INSERT ON posts
FOR EACH ROW
BEGIN
    UPDATE users
    SET post_count = post_count + 1
    WHERE user_id = NEW.user_id;
END;

-- Create a trigger to update the post_count column when a post is deleted
CREATE TRIGGER IF NOT EXISTS update_post_count_after_delete
AFTER DELETE ON posts
FOR EACH ROW
BEGIN
    UPDATE users
    SET post_count = post_count - 1
    WHERE user_id = OLD.user_id;
END;



-- Create a trigger to update the comment_count column when a new comment is inserted
CREATE TRIGGER IF NOT EXISTS update_comment_count_after_insert
AFTER INSERT ON comments
FOR EACH ROW
BEGIN
    UPDATE users
    SET comment_count = (
        SELECT COUNT(*)
        FROM comments
        WHERE comments.user_id = NEW.user_id
    )
    WHERE user_id = NEW.user_id;
END;



CREATE TRIGGER IF NOT EXISTS update_likes_count_after_insert
AFTER INSERT ON likes
FOR EACH ROW
BEGIN
    UPDATE posts
    SET likes_count = likes_count + 1
    WHERE post_id = NEW.post_id;
END;


CREATE TRIGGER IF NOT EXISTS update_likes_count_after_delete
AFTER DELETE ON likes
FOR EACH ROW
BEGIN
    UPDATE posts
    SET likes_count = likes_count - 1
    WHERE post_id = OLD.post_id;
END;
