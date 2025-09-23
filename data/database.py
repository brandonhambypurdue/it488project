# data/database.py

# Imported Modules
from sqlalchemy import create_engine, Column, Integer, String, CheckConstraint, Table, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from log.log import logger

# Initial Variables
Base = declarative_base()
metadata = MetaData()

# ----------------------------
# CLASS: USERS
# ----------------------------
# Represents the "users" table in the SQLite database.
class USERS(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)


# ----------------------------
# CLASS: DATABASE
# ----------------------------
class DATABASE:
    def __init__(self, dbpath="database.db"):
        try:
            self.engine = create_engine(f"sqlite:///{dbpath}", echo=False)
            Session = sessionmaker(bind=self.engine)
            self.session = Session()
            self.metadata = MetaData(bind=self.engine)
            logger.logDatabaseChange(f"Connected to database at {dbpath}")
        except Exception as e:
            logger.logDatabaseError(f"Failed to connect to database {dbpath}: {str(e)}")
            raise e

    # ----------------------------
    # FUNCTION: loginFunction
    # ----------------------------
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
    # HELPER: get_user_table
    # ----------------------------
    def get_user_table(self, uid):
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
                autoload_with=self.engine
            )
            return table
        except Exception as e:
            logger.logDatabaseError(f"Could not access table '{table_name}': {str(e)}")
            return None

    # ----------------------------
    # FUNCTION: getHabitValue
    # ----------------------------
    def getHabitValue(self, uid, day_id, habit):
        table = self.get_user_table(uid)
        if not table:
            return None
        try:
            query = table.select().where(table.c.day_id == day_id)
            result = self.engine.execute(query).first()
            if result and habit in result.keys():
                return result[habit]
            return None
        except Exception as e:
            logger.logDatabaseError(f"getHabitValue failed for user {uid}, day {day_id}, habit {habit}: {str(e)}")
            return None

    # ----------------------------
    # FUNCTION: modifyHabit
    # ----------------------------
    def modifyHabit(self, uid, day_id, habit, val):
        table = self.get_user_table(uid)
        if not table:
            return False
        try:
            query = table.update().where(table.c.day_id == day_id).values({habit: val})
            result = self.engine.execute(query)
            if result.rowcount > 0:
                logger.logDatabaseChange(f"User {uid}: modified {habit} on day {day_id} → {val}")
                return True
            else:
                logger.logDatabaseError(f"No entry to modify for user {uid} on day {day_id}")
                return False
        except Exception as e:
            logger.logDatabaseError(f"Exception in modifyHabit for user {uid} on day {day_id}: {str(e)}")
            return False

    # ----------------------------
    # FUNCTION: addHabit
    # ----------------------------
    def addHabit(self, uid, day_id, month, day,
                 sleep=0, study=0, hobby=0,
                 meditation=None, journaling=None, self_reflection=None,
                 stretching=None, hydration=None, lets_break_a_habit=None):
        table = self.get_user_table(uid)
        if not table:
            return False
        try:
            ins = table.insert().values(
                day_id=day_id, month=month, day=day,
                sleep=sleep, study=study, hobby=hobby,
                meditation=meditation, journaling=journaling,
                self_reflection=self_reflection, stretching=stretching,
                hydration=hydration, lets_break_a_habit=lets_break_a_habit
            )
            self.engine.execute(ins)
            logger.logDatabaseChange(f"User {uid}: added habits for day {day_id}")
            return True
        except Exception as e:
            logger.logDatabaseError(f"Failed to add habits for user {uid} day {day_id}: {str(e)}")
            return False

    # ----------------------------
    # FUNCTION: addUser
    # ----------------------------
    def addUser(self, first_name, last_name, username, password):
        try:
            # Add to USERS table
            u = USERS(first_name=first_name, last_name=last_name, username=username, password=password)
            self.session.add(u)
            self.session.commit()
            uid = u.id

            # Create habit table for this user
            table_name = f"user_{uid}"
            habit_table = Table(
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
                Column('lets_break_a_habit', Integer)
            )
            habit_table.create(self.engine)
            logger.logDatabaseChange(f"Added new user: {username} (id={uid}) with table {table_name}")

            return uid
        except Exception as e:
            self.session.rollback()
            logger.logDatabaseError(f"Failed to add user {username}: {str(e)}")
            return None
