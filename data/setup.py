import sqlite3
import os
from random import randint

DB_FILE = "database.db"

# Remove the old database if it exists
if os.path.exists(DB_FILE):
    os.remove(DB_FILE)

# Connect to the database
conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

# Enable foreign keys
cursor.execute("PRAGMA foreign_keys = ON;")

# Create users table
cursor.execute("""
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);
""")

# Insert test users
users = [
    ('Test', 'User1', 'TestUser1', 'Password1234!'),
    ('Test', 'User2', 'TestUser2', 'Password1234!'),
    ('Test', 'User3', 'TestUser3', 'Password1234!'),
    ('Test', 'User4', 'TestUser4', 'Password1234!'),
    ('Test', 'User5', 'TestUser5', 'Password1234!')
]
cursor.executemany(
    "INSERT INTO users (first_name, last_name, username, password) VALUES (?, ?, ?, ?);",
    users
)

# ----------------------------
# FUNCTION: generateHabits
# ----------------------------
def generateHabits():
    habitData = []
    # Days in each month (non-leap year)
    monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    dayId = 1
    for monthIndex, daysInMonth in enumerate(monthDays, start=1):
        for day in range(1, daysInMonth + 1):
            # Required habits (always filled)
            sleep = randint(5, 10)
            study = randint(1, 8)
            hobby = randint(1, 10)

            # Optional habits (NULL by default)
            meditation = None
            journaling = None
            selfReflection = None
            stretching = None
            hydration = None
            letsBreakAHabit = None

            habitData.append((
                dayId, f"{monthIndex:02d}", day, sleep, study, hobby,
                meditation, journaling, selfReflection,
                stretching, hydration, letsBreakAHabit
            ))

            dayId += 1

    return habitData

# Create tables for each user and insert 365 days of data
for i in range(1, 6):
    tableName = f"user_{i}"
    cursor.execute(f"""
    CREATE TABLE {tableName} (
        day_id INTEGER PRIMARY KEY,
        month TEXT NOT NULL,
        day INTEGER NOT NULL,
        sleep INTEGER CHECK(sleep >= 0),
        study INTEGER CHECK(study >= 0),
        hobby INTEGER CHECK(hobby >= 0),
        meditation INTEGER,
        journaling INTEGER,
        self_reflection INTEGER,
        stretching INTEGER,
        hydration INTEGER,
        lets_break_a_habit INTEGER
    );
    """)

    habits = generateHabits()
    cursor.executemany(f"""
    INSERT INTO {tableName} (
        day_id, month, day, sleep, study, hobby,
        meditation, journaling, self_reflection,
        stretching, hydration, lets_break_a_habit
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, habits)

# Commit changes and close connection
conn.commit()
conn.close()

print(f"Database '{DB_FILE}' created successfully with 5 user tables and 365 days of habits each (optional habits set to NULL).")
