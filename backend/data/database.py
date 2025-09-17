# data/database.py

# Imported Modules
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, CheckConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from log.log import logger

# Initial Variables
Base = declarative_base()

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
# Relationship:
#   - habits: One-to-many relationship with HABITS table
class USERS(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

    habits = relationship("HABITS", back_populates="user", cascade="all, delete-orphan")


# ----------------------------
# CLASS: HABITS
# ----------------------------
# Represents the "habits" table in the SQLite database.
# Each row:
#   - Links to a user via foreign key
#   - Stores numeric values for sleep, study, hobby for a given day
class HABITS(Base):
    __tablename__ = "habits"

    id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    day_of_week = Column(String, primary_key=True)
    sleep = Column(Integer, CheckConstraint("sleep >= 0"))
    study = Column(Integer, CheckConstraint("study >= 0"))
    hobby = Column(Integer, CheckConstraint("hobby >= 0"))

    user = relationship("USERS", back_populates="habits")


# ----------------------------
# CLASS: DATABASE
# ----------------------------
# Wraps the SQLAlchemy ORM session and provides functions
# to interact with the database (login, get habits, modify habits, add habits, add users).
class DATABASE:
    # ----------------------------
    # FUNCTION: __init__
    # ----------------------------
    # Initializes the DATABASE object.
    # Connects to the local SQLite database file and sets up a session.
    # Arguments:
    #   dbpath: path to the .db file (default "database.db")
    def __init__(self, dbpath="database.db"):
        try:
            self.engine = create_engine(f"sqlite:///{dbpath}", echo=False)
            Session = sessionmaker(bind=self.engine)
            self.session = Session()
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
    #   True if login successful, False otherwise
    def loginFunction(self, username, password):
        try:
            u = self.session.query(USERS).filter_by(username=username, password=password).first()
            if u:
                logger.logDatabaseChange(f"Successful login for user '{username}' (id={u.id})")
                return True
            else:
                logger.logDatabaseError(f"Failed login attempt for username '{username}'")
                return False
        except Exception as e:
            logger.logDatabaseError(f"Exception during login for username '{username}': {str(e)}")
            return False

    # ----------------------------
    # FUNCTION: getHabitValue
    # ----------------------------
    # Returns the numeric value of a specific habit for a user on a given day.
    # Arguments:
    #   uid: integer, user ID
    #   day_of_week: string, day of the week (e.g., "Monday")
    #   habit: string, habit name ("sleep", "study", or "hobby")
    # Returns:
    #   Integer value of the habit, or None if no entry exists
    def getHabitValue(self, uid, day_of_week, habit):
        try:
            h = self.session.query(HABITS).filter_by(id=uid, day_of_week=day_of_week).first()
            if h and hasattr(h, habit):
                return getattr(h, habit)
            return None
        except Exception as e:
            logger.logDatabaseError(f"getHabitValue failed for user {uid}, day {day_of_week}, habit {habit}: {str(e)}")
            return None

    # ----------------------------
    # FUNCTION: modifyHabit
    # ----------------------------
    # Modifies the numeric value of a habit for a user on a specific day.
    # Arguments:
    #   uid: integer, user ID
    #   day_of_week: string, day of the week
    #   habit: string, habit name ("sleep", "study", or "hobby")
    #   val: integer, new numeric value
    # Returns:
    #   True if update successful, False if no habit entry exists
    def modifyHabit(self, uid, day_of_week, habit, val):
        try:
            h = self.session.query(HABITS).filter_by(id=uid, day_of_week=day_of_week).first()
            if h and hasattr(h, habit):
                setattr(h, habit, val)
                self.session.commit()
                logger.logDatabaseChange(f"User {uid}: modified {habit} on {day_of_week} → {val}")
                return True
            else:
                logger.logDatabaseError(f"modifyHabit failed: no entry for user {uid} on {day_of_week}")
                return False
        except Exception as e:
            self.session.rollback()
            logger.logDatabaseError(f"Exception in modifyHabit for user {uid} on {day_of_week}: {str(e)}")
            return False

    # ----------------------------
    # FUNCTION: addHabit
    # ----------------------------
    # Adds a new habit entry for a user on a specific day.
    # Arguments:
    #   uid: integer, user ID
    #   day_of_week: string, day of the week
    #   sleep: integer, hours slept (default 0)
    #   study: integer, hours studied (default 0)
    #   hobby: integer, hours on hobbies (default 0)
    # Returns:
    #   True if addition successful
    def addHabit(self, uid, day_of_week, sleep=0, study=0, hobby=0):
        try:
            h = HABITS(id=uid, day_of_week=day_of_week, sleep=sleep, study=study, hobby=hobby)
            self.session.add(h)
            self.session.commit()
            logger.logDatabaseChange(f"User {uid}: added habits for {day_of_week} (sleep={sleep}, study={study}, hobby={hobby})")
            return True
        except Exception as e:
            self.session.rollback()
            logger.logDatabaseError(f"Failed to add habits for user {uid} on {day_of_week}: {str(e)}")
            return False

    # ----------------------------
    # FUNCTION: addUser
    # ----------------------------
    # Adds a new user to the database.
    # Arguments:
    #   first_name: string
    #   last_name: string
    #   username: string (must be unique)
    #   password: string (plaintext)
    # Returns:
    #   Integer ID of the newly created user, or None if failed
    def addUser(self, first_name, last_name, username, password):
        try:
            u = USERS(first_name=first_name, last_name=last_name, username=username, password=password)
            self.session.add(u)
            self.session.commit()
            logger.logDatabaseChange(f"Added new user: {username} (id={u.id})")
            return u.id
        except Exception as e:
            self.session.rollback()
            logger.logDatabaseError(f"Failed to add user {username}: {str(e)}")
            return None
