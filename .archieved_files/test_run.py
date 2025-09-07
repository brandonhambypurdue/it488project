# This is just a test file to see if my Flask scaffolding is working with Griffin's database.
# Imports the database session class and the ORM models for users and habits.
from database import DATABASE, USERS, HABITS

# Instantiate the DATABASE class to initialize the SQLite connection and session.
db = DATABASE()

# Queries all user records from the 'users' table.
users = db.session.query(USERS).all()

# Prints a header to organize the output.
print(" Users and Their Habits ")

# Loops through each user object retrieved from the database.
for user in users:
    # Prints the user's ID, full name, and username.
    print(f"\nUser ID {user.id}: {user.first_name} {user.last_name} ({user.username})")

    # Queries the 'habits' table for entries where the habit's ID matches the user's ID
    habits = db.session.query(HABITS).filter_by(id=user.id).all()

    # Prints user habits.
    if habits:
        for h in habits:
    # Prints the day and the numeric values for sleep, study, and hobby
            print(f"  {h.day_of_week}: Sleep={h.sleep}, Study={h.study}, Hobby={h.hobby}")
    else:
     
        print("  No habits found.")


