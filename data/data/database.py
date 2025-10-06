import os
from sqlalchemy import (
    create_engine, Column, Integer, String, CheckConstraint,
    Table, MetaData, text
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker
from log.log import logger

# ──────────────────────────────────────────────
# 📦 Database Setup
# ──────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'database.db')

engine = create_engine(f"sqlite:///{DB_PATH}", echo=False, future=True)
Session = scoped_session(sessionmaker(bind=engine))

Base = declarative_base()
metadata = MetaData()

# ──────────────────────────────────────────────
# 👤 User Model
# ──────────────────────────────────────────────

class USERS(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

# ──────────────────────────────────────────────
# 🧠 Database Wrapper
# ──────────────────────────────────────────────

class DATABASE:
    def __init__(self, dbpath="database.db"):
        try:
            self.engine = create_engine(f"sqlite:///{dbpath}", echo=False, future=True)
            self.session = Session()
            self.metadata = MetaData()
            logger.logDatabaseChange(f"Connected to database at {dbpath}")
        except Exception as e:
            logger.logDatabaseError(f"Failed to connect to database {dbpath}: {str(e)}")
            raise e

    def loginFunction(self, username, password):
        try:
            user = self.session.query(USERS).filter_by(username=username, password=password).first()
            return bool(user)
        except Exception as e:
            logger.logDatabaseError(f"Login error for '{username}': {str(e)}")
            return False

    def get_user_table(self, uid):
        """Reflect a dynamic user_<id> table."""
        table_name = f"user_{uid}"
        try:
            table = Table(
                table_name, self.metadata,
                Column('day_id', Integer, primary_key=True),
                Column('month', String, nullable=False),
                Column('day', Integer, nullable=False),
                Column('sleep', Integer, CheckConstraint("sleep >= 0")),
                Column('study', Integer, CheckConstraint("study >= 0")),
                Column('hobby', Integer, CheckConstraint("hobby >= 0")),
                Column('meditation', Integer),
                Column('journaling', Integer),
                Column('self_reflection', Integer),
                Column('stretching', Integer),
                Column('hydration', Integer),
                Column('lets_break_a_habit', Integer),
                autoload_with=self.engine,
                extend_existing=True
            )
            return table
        except Exception as e:
            logger.logDatabaseError(f"Could not access table '{table_name}': {str(e)}")
            return None

    # ──────────────────────────────────────────
    # ✅ Raw SQL Habit Retrieval
    # ──────────────────────────────────────────

    def getHabitValue(self, uid, day_id, column):
        """Fetch a single habit value via raw SQL."""
        try:
            table_name = f"user_{uid}"
            query = text(f"SELECT {column} FROM {table_name} WHERE day_id = :day_id")
            result = self.session.execute(query, {"day_id": day_id}).fetchone()
            logger.logDatabaseChange(f"Raw SQL result for {column}, day_id={day_id}: {result}")
            return result[0] if result else None
        except Exception as e:
            logger.logDatabaseError(f"Error retrieving '{column}' for user {uid}, day {day_id}: {str(e)}")
            return None

    def getDailyHabits(self, uid, day_id):
        """Fetch all core habits (sleep, study, hobby) in one query."""
        try:
            table_name = f"user_{uid}"
            query = text(f"""
                SELECT sleep, study, hobby
                FROM {table_name}
                WHERE day_id = :day_id
            """)
            result = self.session.execute(query, {"day_id": day_id}).fetchone()
            if result:
                habits = {
                    "sleep": result[0],
                    "study": result[1],
                    "hobby": result[2]
                }
                logger.logDatabaseChange(f"Daily habits for uid={uid}, day_id={day_id}: {habits}")
                return habits
            return None
        except Exception as e:
            logger.logDatabaseError(f"Error fetching daily habits for uid={uid}, day {day_id}: {str(e)}")
            return None

