# Imported Modules
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, CheckConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

# Initial Variables
Base = declarative_base()

# ----------------------------
# CLASS: USERS
# ----------------------------
# This class represents the "users" table in the SQLite database.
# Each user has:
#   - id: unique primary key (auto-incremented)
#   - first_name: The user's first name
#   - last_name: The user's last name
#   - username: Unique login username
#   - password: Plaintext password (for simplicity; not secure)
# Each user can have multiple HABITS entries linked through the "habits" table.
class USERS(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)  # Primary key
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

    # Relationship to HABITS table (1 user -> many habit entries)
    habits = relationship("HABITS", back_populates="user", cascade="all, delete-orphan")


# ----------------------------
# CLASS: HABITS
# ----------------------------
# This class represents the "habits" table in the SQLite database.
# Each habit row is tied to a user (via foreign key id) and a day_of_week.
# It stores the numeric values of different habits for that user on that day:
#   - sleep: hours slept
#   - study: hours spent studying
#   - hobby: hours spent on hobbies
class HABITS(Base):
    __tablename__ = "habits"

    id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)  # Links to USERS table
    day_of_week = Column(String, primary_key=True)  # e.g., "Monday", "Tuesday"

    sleep = Column(Integer, CheckConstraint("sleep >= 0"))
    study = Column(Integer, CheckConstraint("study >= 0"))
    hobby = Column(Integer, CheckConstraint("hobby >= 0"))

    # Relationship back to USERS table
    user = relationship("USERS", back_populates="habits")


# ----------------------------
# CLASS: DATABASE
# ----------------------------
# This class wraps the SQLAlchemy ORM session and provides functions
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
        self.engine = create_engine(f"sqlite:///{dbpath}", echo=False)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()

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
        u = self.session.query(USERS).filter_by(username=username, password=password).first()
        return u is not None

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
        h = self.session.query(HABITS).filter_by(id=uid, day_of_week=day_of_week).first()
        if h and hasattr(h, habit):
            return getattr(h, habit)
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
        h = self.session.query(HABITS).filter_by(id=uid, day_of_week=day_of_week).first()
        if h and hasattr(h, habit):
            setattr(h, habit, val)
            self.session.commit()
            return True
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
        h = HABITS(id=uid, day_of_week=day_of_week, sleep=sleep, study=study, hobby=hobby)
        self.session.add(h)
        self.session.commit()
        return True

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
    #   Integer ID of the newly created user
    def addUser(self, first_name, last_name, username, password):
        u = USERS(first_name=first_name, last_name=last_name, username=username, password=password)
        self.session.add(u)
        self.session.commit()
        return u.id
