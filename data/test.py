# TEST SCRIPT
# ----------------------------------------------------------
# This script demonstrates how to interact with the SQLite database directly.
# It allows a user to:
#   - Login with username and password
#   - View habit data for specific day IDs
#   - Get the numeric value of a specific habit
#   - Modify a habit value
#   - Add a new habit entry
#   - Add a new user (with their own table)
# ----------------------------------------------------------

import sqlite3

DB_PATH = "database.db"

# ----------------------------
# FUNCTION: connectDb
# ----------------------------
def connectDb(db_path=DB_PATH):
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON;")
    cursor = conn.cursor()
    return conn, cursor

# ----------------------------
# FUNCTION: login
# ----------------------------
def login(username, password, cursor):
    cursor.execute("SELECT id FROM users WHERE username=? AND password=?", (username, password))
    result = cursor.fetchone()
    return result[0] if result else None

# ----------------------------
# FUNCTION: getHabitTable
# ----------------------------
def getHabitTable(userId):
    return f"user_{userId}"

# ----------------------------
# FUNCTION: displayHabit
# ----------------------------
def displayHabit(conn, cursor, userId, dayId):
    table = getHabitTable(userId)
    cursor.execute(f"SELECT * FROM {table} WHERE day_id=?", (dayId,))
    row = cursor.fetchone()
    if row:
        columns = [desc[0] for desc in cursor.description]
        habitData = dict(zip(columns, row))
        print(f"Day ID {habitData['day_id']} ({habitData['month']}/{habitData['day']}):")
        for col, val in habitData.items():
            if col not in ("day_id", "month", "day"):
                print(f"  {col} = {val}")
    else:
        print(f"No data for Day ID {dayId}")

# ----------------------------
# FUNCTION: modifyHabit
# ----------------------------
def modifyHabit(conn, cursor, userId, dayId, habit, value):
    table = getHabitTable(userId)
    try:
        cursor.execute(f"UPDATE {table} SET {habit}=? WHERE day_id=?", (value, dayId))
        if cursor.rowcount == 0:
            print(f"No entry found for Day ID {dayId}. Cannot modify.")
            return False
        conn.commit()
        print(f"Updated {habit} for Day ID {dayId} → {value}")
        return True
    except Exception as e:
        print(f"Error updating habit: {e}")
        conn.rollback()
        return False

# ----------------------------
# FUNCTION: addHabit
# ----------------------------
def addHabit(conn, cursor, userId, dayId, month, day,
             sleep=0, study=0, hobby=0,
             eating=None, relaxing=None, playing=None):
    table = getHabitTable(userId)
    cursor.execute(f"SELECT day_id FROM {table} WHERE day_id=?", (dayId,))
    if cursor.fetchone():
        print(f"Day ID {dayId} already exists. Use modifyHabit instead.")
        return False
    try:
        cursor.execute(f"""
            INSERT INTO {table} 
            (day_id, month, day, sleep, study, hobby, eating, relaxing, playing)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (dayId, month, day, sleep, study, hobby, eating, relaxing, playing))
        conn.commit()
        print(f"Added new habit entry for Day ID {dayId}")
        return True
    except Exception as e:
        print(f"Error adding habit: {e}")
        conn.rollback()
        return False

# ----------------------------
# FUNCTION: addUser
# ----------------------------
def addUser(conn, cursor, firstName, lastName, username, password):
    try:
        cursor.execute("""
            INSERT INTO users (first_name, last_name, username, password)
            VALUES (?, ?, ?, ?)
        """, (firstName, lastName, username, password))
        userId = cursor.lastrowid
        tableName = getHabitTable(userId)

        cursor.execute(f"""
            CREATE TABLE {tableName} (
                day_id INTEGER PRIMARY KEY,
                month TEXT NOT NULL,
                day INTEGER NOT NULL,
                sleep INTEGER CHECK(sleep >= 0),
                study INTEGER CHECK(study >= 0),
                hobby INTEGER CHECK(hobby >= 0),
                eating INTEGER,
                relaxing INTEGER,
                playing INTEGER
            )
        """)

        conn.commit()
        print(f"Added new user {username} (ID {userId}) with habit table {tableName}")
        return userId
    except Exception as e:
        print(f"Error adding user: {e}")
        conn.rollback()
        return None

# ----------------------------
# MAIN TEST FUNCTION
# ----------------------------
def testUser():
    conn, cursor = connectDb()

    username = input("Enter username for login: ")
    password = input("Enter password: ")

    uid = login(username, password, cursor)
    if not uid:
        print("Login failed.")
        return
    print(f"Login successful for {username} (User ID {uid})")

    while True:
        print("\nOptions:")
        print("1 - Display habit for a specific day ID")
        print("2 - Modify habit for a day ID")
        print("3 - Add habit for a new day ID")
        print("4 - Add a new user")
        print("0 - Exit")

        choice = input("Pick an option: ")
        if choice == "1":
            dayId = int(input("Enter Day ID: "))
            displayHabit(conn, cursor, uid, dayId)
        elif choice == "2":
            dayId = int(input("Enter Day ID to modify: "))
            habit = input("Enter habit to modify (sleep, study, hobby, eating, relaxing, playing): ")
            value = int(input(f"Enter new value for {habit}: "))
            modifyHabit(conn, cursor, uid, dayId, habit, value)
        elif choice == "3":
            dayId = int(input("Enter new Day ID: "))
            month = input("Enter month (MM): ")
            day = int(input("Enter day of month (DD): "))
            sleep = int(input("Enter sleep hours: "))
            study = int(input("Enter study hours: "))
            hobby = int(input("Enter hobby hours: "))
            eating = input("Enter eating hours (optional, leave blank for NULL)") or None
            relaxing = input("Enter relaxing hours (optional, leave blank for NULL)") or None
            playing = input("Enter playing hours (optional, leave blank for NULL)") or None
            addHabit(conn, cursor, uid, dayId, month, day, sleep, study, hobby, eating, relaxing, playing)
        elif choice == "4":
            firstName = input("First name: ")
            lastName = input("Last name: ")
            usernameNew = input("Username: ")
            passwordNew = input("Password: ")
            addUser(conn, cursor, firstName, lastName, usernameNew, passwordNew)
        elif choice == "0":
            print("Exiting...")
            break
        else:
            print("Invalid option.")

    conn.close()

if __name__ == "__main__":
    testUser()
