from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

from pathlib import Path

import structlog

logger = structlog.get_logger()

# Base directory is the root of the project (one level up from backend)
BASE_DIR = Path(__file__).parent.parent.parent
DATABASE_PATH = BASE_DIR / "nyaya_engine.db"
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"
logger.info("database_url_init", url=DATABASE_URL)

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from .models import Base
    Base.metadata.create_all(bind=engine)
    print("Nyaya Data Engine: Database Initialized.")
