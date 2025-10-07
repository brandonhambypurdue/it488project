-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Create Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

-- Create Habits table
CREATE TABLE habits (
    id INTEGER,
    day_of_week TEXT NOT NULL,
    sleep INTEGER CHECK(sleep >= 0),
    study INTEGER CHECK(study >= 0),
    hobby INTEGER CHECK(hobby >= 0),
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert Users
INSERT INTO users (first_name, last_name, username, password) VALUES
('Test', 'User1', 'TestUser1', 'Password1234!'),
('Test', 'User2', 'TestUser2', 'Password1234!'),
('Test', 'User3', 'TestUser3', 'Password1234!'),
('Test', 'User4', 'TestUser4', 'Password1234!'),
('Test', 'User5', 'TestUser5', 'Password1234!');

-- Insert Habits for User 1 (balanced schedule)
INSERT INTO habits (id, day_of_week, sleep, study, hobby) VALUES
(1, 'Sunday',    8, 5, 6),
(1, 'Monday',    6, 2, 4),
(1, 'Tuesday',   7, 3, 4),
(1, 'Wednesday', 6, 2, 4),
(1, 'Thursday',  5, 6, 7),
(1, 'Friday',    6, 4, 2),
(1, 'Saturday',  3, 3, 9);

-- Insert Habits for User 2 (studious, less hobby time)
INSERT INTO habits (id, day_of_week, sleep, study, hobby) VALUES
(2, 'Sunday',    7, 4, 2),
(2, 'Monday',    6, 6, 1),
(2, 'Tuesday',   6, 5, 2),
(2, 'Wednesday', 7, 7, 1),
(2, 'Thursday',  6, 6, 2),
(2, 'Friday',    8, 4, 3),
(2, 'Saturday',  9, 2, 4);

-- Insert Habits for User 3 (lots of hobbies, lighter study)
INSERT INTO habits (id, day_of_week, sleep, study, hobby) VALUES
(3, 'Sunday',    9, 2, 5),
(3, 'Monday',    7, 3, 6),
(3, 'Tuesday',   6, 2, 7),
(3, 'Wednesday', 7, 3, 6),
(3, 'Thursday',  6, 2, 8),
(3, 'Friday',    8, 1, 9),
(3, 'Saturday',  9, 1, 10);

-- Insert Habits for User 4 (short sleeper, studies hard)
INSERT INTO habits (id, day_of_week, sleep, study, hobby) VALUES
(4, 'Sunday',    5, 6, 2),
(4, 'Monday',    5, 8, 1),
(4, 'Tuesday',   4, 9, 1),
(4, 'Wednesday', 5, 7, 2),
(4, 'Thursday',  6, 8, 1),
(4, 'Friday',    5, 7, 3),
(4, 'Saturday',  6, 6, 4);

-- Insert Habits for User 5 (well-rested, balanced lifestyle)
INSERT INTO habits (id, day_of_week, sleep, study, hobby) VALUES
(5, 'Sunday',    9, 3, 5),
(5, 'Monday',    8, 4, 3),
(5, 'Tuesday',   8, 5, 2),
(5, 'Wednesday', 7, 4, 4),
(5, 'Thursday',  8, 3, 5),
(5, 'Friday',    9, 2, 6),
(5, 'Saturday',  10, 1, 8);