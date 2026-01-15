from sqlalchemy import create_engine, Column, String, Text, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Render'a attığımızda burası gerçek Postgres adresi olacak.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

# Postgres düzeltmesi
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class UserSave(Base):
    __tablename__ = "user_saves"

    user_id = Column(String, primary_key=True, index=True)
    save_data = Column(JSON)
    
    # --- YENİ ANALİTİK ALANLARI ---
    ip_address = Column(String, nullable=True)     # Hangi IP?
    user_agent = Column(String, nullable=True)     # Hangi Cihaz? (Mobile/Desktop)
    game_version = Column(String, nullable=True)   # Hangi Sürüm?
    country = Column(String, nullable=True)        # (İleride eklenebilir)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()