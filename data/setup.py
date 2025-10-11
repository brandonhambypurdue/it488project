# Imported
import sqlite3, os
from random import randint
import hashing  # your internal password hashing module

# Variables
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE  = os.path.join(BASE_DIR, "database.db")

# Ensure directory exists
os.makedirs(BASE_DIR, exist_ok=True)

# Remove old database
if os.path.exists(DB_FILE):
    os.remove(DB_FILE)

# Connect and create schema
conn   = sqlite3.connect(DB_FILE)
cursor = conn.cursor()
cursor.execute("PRAGMA foreign_keys = ON;")

# Users table
cursor.execute("""
CREATE TABLE users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT    NOT NULL,
    last_name  TEXT    NOT NULL,
    username   TEXT    UNIQUE NOT NULL,
    password   TEXT    NOT NULL
);
""")

# Initialize the password hasher
hasher = hashing.HASH()

# Seed users (hash passwords before inserting)
plain_users = [
    ('Test', 'User1', 'TestUser1', 'Password1234!'),
    ('Test', 'User2', 'TestUser2', 'Password1234!'),
    ('Test', 'User3', 'TestUser3', 'Password1234!'),
    ('Test', 'User4', 'TestUser4', 'Password1234!'),
    ('Test', 'User5', 'TestUser5', 'Password1234!')
]

hashed_users = []
for first_name, last_name, username, password in plain_users:
    hashed_pw = hasher.createHash(password).decode('utf-8')
    hashed_users.append((first_name, last_name, username, hashed_pw))

# Insert users into database
cursor.executemany(
    "INSERT INTO users (first_name, last_name, username, password) VALUES (?, ?, ?, ?);",
    hashed_users
)

# Habit seeder
def generateHabits():
    data = []
    monthDays = [31,28,31,30,31,30,31,31,30,31,30,31]
    dayId = 1
    for m, days in enumerate(monthDays, start=1):
        for d in range(1, days+1):
            data.append((
                dayId, f"{m:02d}", d,
                randint(5,10), randint(1,8), randint(1,10),
                None, None, None, None, None, None
            ))
            dayId += 1
    return data

# Create per-user tables and seed habits
for i in range(1, 6):
    tbl = f"user_{i}"
    cursor.execute(f"""
    CREATE TABLE {tbl} (
        day_id INTEGER PRIMARY KEY,
        month TEXT    NOT NULL,
        day   INTEGER NOT NULL,
        sleep INTEGER CHECK(sleep >= 0),
        study INTEGER CHECK(study >= 0),
        hobby INTEGER CHECK(hobby >= 0),
        meditation    INTEGER,
        journaling    INTEGER,
        self_reflection INTEGER,
        stretching     INTEGER,
        hydration      INTEGER,
        lets_break_a_habit INTEGER
    );
    """)
    cursor.executemany(f"""
    INSERT INTO {tbl} (
        day_id, month, day, sleep, study, hobby,
        meditation, journaling, self_reflection,
        stretching, hydration, lets_break_a_habit
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, generateHabits())

conn.commit()
conn.close()

print(f"Seeded secure database at {DB_FILE}")
