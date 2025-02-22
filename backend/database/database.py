from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os


load_dotenv(Path(__file__).parent.parent / ".env")
if os.getenv("DB_LOCATION"):
    SQLALCHEMY_DATABASE_URL = "sqlite:///" + os.getenv("DB_LOCATION")
else:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./localantifraud.db"
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@postgresserver/db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
