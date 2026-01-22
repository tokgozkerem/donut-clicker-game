from fastapi import FastAPI, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine, UserSave, get_db
import httpx

# Tabloları oluştur
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Donut Clicker Analytics API", version="1.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SaveDataSchema(BaseModel):
    user_id: str
    save_data: Dict[str, Any]

async def get_country_from_ip(ip: str):
    """
    IP adresinden ülke bilgisini çeker.
    Ücretsiz ip-api.com servisini kullanır.
    """
    if ip == "127.0.0.1" or ip == "localhost":
        return "Localhost"
        
    try:
        async with httpx.AsyncClient() as client:
        
            response = await client.get(f"http://ip-api.com/json/{ip}", timeout=3.0)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success":
                    return data.get("country", "Unknown")
    except:
        pass # API hatası olursa sessizce Unknown dön
    return "Unknown"

@app.get("/")
def read_root():
    return {"status": "active", "service": "Donut Clicker Analytics Backend"}

@app.post("/sync")
async def sync_save(data: SaveDataSchema, request: Request, db: Session = Depends(get_db)):
    # 1. IP Adresini al
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0]
    else:
        client_ip = request.client.host
    
    # 2. User Agent al
    user_agent = request.headers.get("user-agent", "Unknown")
    
    # 3. Oyun versiyonu
    game_version = data.save_data.get("gameVersion", "0.0.0")

    db_user = db.query(UserSave).filter(UserSave.user_id == data.user_id).first()
    
    if db_user:
        # Mevcut kullanıcı
        db_user.save_data = data.save_data
        db_user.ip_address = client_ip
        db_user.user_agent = user_agent
        db_user.game_version = game_version
        
       
        if not db_user.country or db_user.country == "Unknown":
             db_user.country = await get_country_from_ip(client_ip)
             
    else:
        # Yeni kullanıcı
        country = await get_country_from_ip(client_ip)
        new_user = UserSave(
            user_id=data.user_id,
            save_data=data.save_data,
            ip_address=client_ip,
            user_agent=user_agent,
            game_version=game_version,
            country=country
        )
        db.add(new_user)
    
    db.commit()
    return {"status": "synced"}

@app.get("/load/{user_id}")
def load_save(user_id: str, db: Session = Depends(get_db)):
    db_user = db.query(UserSave).filter(UserSave.user_id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user.save_data

@app.get("/dashboard/analytics")
def get_analytics(db: Session = Depends(get_db)):
    users = db.query(UserSave).all()
    total_users = len(users)
    
    mobile_users = 0
    desktop_users = 0
    version_distribution = {}
    country_distribution = {}
    
    for user in users:
        # Platform
        ua = (user.user_agent or "").lower()
        if "mobile" in ua or "android" in ua or "iphone" in ua:
            mobile_users += 1
        else:
            desktop_users += 1
            
        # Version
        v = user.game_version or "unknown"
        version_distribution[v] = version_distribution.get(v, 0) + 1
        
        # Country
        c = user.country or "Unknown"
        country_distribution[c] = country_distribution.get(c, 0) + 1

    return {
        "total_players": total_users,
        "platform_distribution": {
            "mobile": mobile_users,
            "desktop": desktop_users
        },
        "country_distribution": country_distribution,
        "version_distribution": version_distribution,
        "latest_active_users": [
            {
                "user_id": u.user_id, 
                "country": u.country,
                "bakery": u.save_data.get("currentBakeryName"),
                "last_seen": u.last_updated,
                "donuts": u.save_data.get("donutCount", 0)
            } for u in users[-5:]
        ]
    }
