# Database se connection. Local mein SQLite (ek file), Railway par PostgreSQL.

import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./raahix.db")

# Railway kabhi "postgres://" deta hai, SQLAlchemy ko "postgresql://" chahiye
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite ko FastAPI ke saath chalane ke liye yeh option chahiye
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    """Har request ko ek database session deta hai, aur kaam ke baad band kar deta hai."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()