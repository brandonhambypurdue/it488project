# ----------------------------------------------------------
# TEST SCRIPT
# ----------------------------------------------------------
# This script demonstrates how to interact with the DATABASE class.
# It allows a user to:
#   - Login with username and password
#   - View all weekly habit data
#   - Get the numeric value of a specific habit
#   - Modify a habit value
#   - Add a new habit entry
#   - Add a new user
# ----------------------------------------------------------

from database import DATABASE, USERS

def testUserWeeklyHabits(username, password):
    """
    Main test function demonstrating usage of DATABASE functions.

    Arguments:
    - username: string, username to login
    - password: string, plaintext password

    How to use:
    1. Instantiate DATABASE object (connect to your .db file)
    2. Login with loginFunction(username, password)
    3. Retrieve user ID from USERS table
    4. View or manipulate habit data interactively
    """
    
    # Step 0: Connect to the local database
    db = DATABASE("data/database.db")  # Path to your SQLite database file

    # Step 1: Login
    if not db.loginFunction(username, password):
        print(f"Login failed for user: {username}")
        return
    print(f"Login successful for {username}")

    # Step 2: Get user ID (needed for all habit operations)
    u = db.session.query(USERS).filter_by(username=username).first()
    if not u:
        print(f"User {username} not found in database.")
        return
    uid = u.id

    # Step 3: Show weekly habits for the user
    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    print(f"\nWeekly habits for {username} (User ID {uid}):")
    for day in days:
        # Use getHabitValue(uid, day_of_week, habit) to retrieve habit values
        sleep = db.getHabitValue(uid, day, "sleep")
        study = db.getHabitValue(uid, day, "study")
        hobby = db.getHabitValue(uid, day, "hobby")

        # IMPORTANT:
        # If sleep is None, that means no data exists for this user/day.
        # -> In that case, you CANNOT use modifyHabit, you must use addHabit.
        if sleep is None:
            print(f"{day}: No data")
        else:
            print(f"{day}: Sleep={sleep}, Study={study}, Hobby={hobby}")

    # -----------------------------
    # Interactive options for testing
    # -----------------------------
    # Menu allows developer to test the following functions:
    # 1. getHabitValue(uid, day, habit)
    # 2. modifyHabit(uid, day, habit, val)
    # 3. addHabit(uid, day, sleep, study, hobby)
    # 4. addUser(first_name, last_name, username, password)
    while True:
        print("\nOptions:")
        print("1 - Get numeric value of a habit")
        print("2 - Modify a habit value")
        print("3 - Add a new habit entry")
        print("4 - Add a new user")
        print("0 - Exit")

        choice = input("Pick an option: ")

        # Option 1: Retrieve a specific habit value
        if choice == "1":
            day = input("Enter day of the week: ")  # e.g., "Monday"
            habit = input("Enter habit (sleep, study, hobby): ")
            val = db.getHabitValue(uid, day, habit)
            if val is not None:
                print(f"{habit.capitalize()} on {day}: {val}")
            else:
                print("No data for that day or habit.")

        # Option 2: Modify a habit value
        elif choice == "2":
            day = input("Enter day of the week to modify: ")
            habit = input("Enter habit to modify (sleep, study, hobby): ")
            val = input("Enter new numeric value: ")
            try:
                val = int(val)  # Ensure numeric input
            except ValueError:
                print("Please enter a valid number.")
                continue
            success = db.modifyHabit(uid, day, habit, val)
            if success:
                print(f"{habit.capitalize()} on {day} updated to {val}.")
            else:
                print("Failed to update habit. Make sure the day and habit exist. Use option 3 if no data exists yet.")

        # Option 3: Add a new habit entry
        elif choice == "3":
            day = input("Enter day of the week for new habit: ")
            sleep = int(input("Enter sleep hours: "))
            study = int(input("Enter study hours: "))
            hobby = int(input("Enter hobby hours: "))
            # Calls addHabit(uid, day, sleep, study, hobby)
            db.addHabit(uid, day, sleep, study, hobby)
            print(f"New habit added for {day}.")

        # Option 4: Add a new user (no login required)
        elif choice == "4":
            first_name = input("Enter first name: ")
            last_name = input("Enter last name: ")
            username_new = input("Enter username: ")
            password_new = input("Enter password: ")
            # Calls addUser(first_name, last_name, username, password)
            new_uid = db.addUser(first_name, last_name, username_new, password_new)
            print(f"New user added with ID {new_uid}.")

        # Option 0: Exit the interactive menu
        elif choice == "0":
            print("Exiting...")
            break

        else:
            print("Invalid option. Please try again.")

# ----------------------------------------------------------
# How to run this test script:
# 1. Run the script directly:
#       python unitTest.py
# 2. Enter username and password for login.
# 3. Follow interactive menu to view or modify habit data, or add users.
# ----------------------------------------------------------
if __name__ == "__main__":
    username = input("Enter username for login: ")
    password = input("Enter password: ")
    testUserWeeklyHabits(username, password)
