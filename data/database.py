# data/database.py

# Imported Modules
import sqlite3
from log.log import logger

# ----------------------------
# CLASS: USERS
# ----------------------------
# Represents the "users" table in the SQLite database.
# Each user has:
#   - id: unique primary key (auto-incremented)
#   - first_name: The user's first name
#   - last_name: The user's last name
#   - username: Unique login username
#   - password: Plaintext password (for simplicity; not secure)
class USERS:
    def __init__(self, id, first_name, last_name, username, password):
        self.id = id
        self.first_name = first_name
        self.last_name = last_name
        self.username = username
        self.password = password


# ----------------------------
# CLASS: DATABASE
# ----------------------------
# Wraps the SQLite connection and provides functions
# to interact with the database (login, get habits, modify habits, add habits, add users).
class DATABASE:
    # ----------------------------
    # FUNCTION: __init__
    # ----------------------------
    # Initializes the DATABASE object.
    # Connects to the local SQLite database file.
    # Arguments:
    #   dbpath: path to the .db file (default "database.db")
    def __init__(self, dbpath="database.db"):
        try:
            self.conn = sqlite3.connect(dbpath)
            self.conn.execute("PRAGMA foreign_keys = ON;")  # enable foreign keys
            self.cursor = self.conn.cursor()
            logger.logDatabaseChange(f"Connected to database at {dbpath}")
        except Exception as e:
            logger.logDatabaseError(f"Failed to connect to database {dbpath}: {str(e)}")
            raise e

    # ----------------------------
    # FUNCTION: loginFunction
    # ----------------------------
    # Checks if a user exists with the given username and password.
    # Arguments:
    #   username: string, the username of the user
    #   password: string, the plaintext password
    # Returns:
    #   user ID if login successful, None otherwise
    def loginFunction(self, username, password):
        try:
            self.cursor.execute(
                "SELECT id FROM users WHERE username=? AND password=?",
                (username, password)
            )
            result = self.cursor.fetchone()
            if result:
                uid = result[0]
                logger.logDatabaseChange(f"Successful login for user '{username}' (id={uid})")
                return uid
            else:
                logger.logDatabaseError(f"Failed login attempt for username '{username}'")
                return None
        except Exception as e:
            logger.logDatabaseError(f"Exception during login for username '{username}': {str(e)}")
            return None

    # ----------------------------
    # HELPER: getUserTable
    # ----------------------------
    # Returns the table name for the user's habit table.
    # Arguments:
    #   uid: integer, user ID
    # Returns:
    #   string table name
    def getUserTable(self, uid):
        return f"user_{uid}"

    # ----------------------------
    # FUNCTION: getHabitValue
    # ----------------------------
    # Returns the numeric value of a specific habit for a user on a given day.
    # Arguments:
    #   uid: integer, user ID
    #   day_id: integer, the day ID (1-365)
    #   habit: string, habit name
    # Returns:
    #   Integer value of the habit, or None if no entry exists
    def getHabitValue(self, uid, day_id, habit):
        table = self.getUserTable(uid)
        try:
            self.cursor.execute(f"SELECT {habit} FROM {table} WHERE day_id=?", (day_id,))
            result = self.cursor.fetchone()
            return result[0] if result else None
        except Exception as e:
            logger.logDatabaseError(f"getHabitValue failed for user {uid}, day {day_id}, habit {habit}: {str(e)}")
            return None

    # ----------------------------
    # FUNCTION: modifyHabit
    # ----------------------------
    # Modifies the numeric value of a habit for a user on a specific day.
    # Arguments:
    #   uid: integer, user ID
    #   day_id: integer, day ID
    #   habit: string, habit name
    #   val: integer, new numeric value
    # Returns:
    #   True if update successful, False if no habit entry exists
    def modifyHabit(self, uid, day_id, habit, val):
        table = self.getUserTable(uid)
        try:
            self.cursor.execute(f"UPDATE {table} SET {habit}=? WHERE day_id=?", (val, day_id))
            if self.cursor.rowcount > 0:
                self.conn.commit()
                logger.logDatabaseChange(f"User {uid}: modified {habit} on day {day_id} → {val}")
                return True
            else:
                logger.logDatabaseError(f"No entry to modify for user {uid} on day {day_id}")
                return False
        except Exception as e:
            self.conn.rollback()
            logger.logDatabaseError(f"Exception in modifyHabit for user {uid} on day {day_id}: {str(e)}")
            return False

    # ----------------------------
    # FUNCTION: addHabit
    # ----------------------------
    # Adds a new habit entry for a user on a specific day.
    # Arguments:
    #   uid: integer, user ID
    #   day_id: integer, day ID
    #   month: string, month number ('01'-'12')
    #   day: integer, day of the month
    #   sleep, study, hobby: integers
    #   meditation, journaling, self_reflection, stretching, hydration, lets_break_a_habit: optional, default None
    # Returns:
    #   True if addition successful
    def addHabit(self, uid, day_id, month, day,
                 sleep=0, study=0, hobby=0,
                 meditation=None, journaling=None,
                 self_reflection=None, stretching=None,
                 hydration=None, lets_break_a_habit=None):
        table = self.getUserTable(uid)
        try:
            self.cursor.execute(f"SELECT day_id FROM {table} WHERE day_id=?", (day_id,))
            if self.cursor.fetchone():
                logger.logDatabaseError(f"Day ID {day_id} already exists for user {uid}. Use modifyHabit instead.")
                return False
            self.cursor.execute(
                f"""INSERT INTO {table} 
                (day_id, month, day, sleep, study, hobby, meditation, journaling, self_reflection,
                stretching, hydration, lets_break_a_habit)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (day_id, month, day, sleep, study, hobby,
                 meditation, journaling, self_reflection, stretching,
                 hydration, lets_break_a_habit)
            )
            self.conn.commit()
            logger.logDatabaseChange(f"User {uid}: added habits for day {day_id}")
            return True
        except Exception as e:
            self.conn.rollback()
            logger.logDatabaseError(f"Failed to add habits for user {uid} day {day_id}: {str(e)}")
            return False

    # ----------------------------
    # FUNCTION: addUser
    # ----------------------------
    # Adds a new user and creates their habit table.
    # Arguments:
    #   first_name: string
    #   last_name: string
    #   username: string (must be unique)
    #   password: string (plaintext)
    # Returns:
    #   Integer ID of the newly created user, or None if failed
    def addUser(self, first_name, last_name, username, password):
        try:
            self.cursor.execute(
                "INSERT INTO users (first_name, last_name, username, password) VALUES (?, ?, ?, ?)",
                (first_name, last_name, username, password)
            )
            uid = self.cursor.lastrowid

            table_name = self.getUserTable(uid)
            self.cursor.execute(
                f"""CREATE TABLE {table_name} (
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
                )"""
            )
            self.conn.commit()
            logger.logDatabaseChange(f"Added new user {username} (id={uid}) with habit table {table_name}")
            return uid
        except Exception as e:
            self.conn.rollback()
            logger.logDatabaseError(f"Failed to add user {username}: {str(e)}")
            return None
