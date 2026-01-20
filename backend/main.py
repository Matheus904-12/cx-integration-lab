from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware # <--- OBRIGATÓRIO

from sqlalchemy.orm import Session
from database import get_db, get_mongo, engine
import models
import schemas
from datetime import datetime

# Garante a criação das tabelas
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="BCR CX Integration Lab")

# --- BLOCO DE SEGURANÇA (CORS) ---
# Isso libera o Frontend (React) para falar com o Backend
origins = [
    "http://localhost:5173",
    "https://cx-integration-lab.vercel.app", # URL principal (se tiver)
    "https://cx-integration-8akrwxxin-matheus-lucindos-projects.vercel.app", # URL do erro
    "*" # Manter o asterisco por segurança
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ---------------------------------

# --- ROTAS ---

@app.post("/tickets/", response_model=schemas.TicketResponse, tags=["Integração"])
def create_ticket(
    ticket: schemas.TicketCreate, 
    db: Session = Depends(get_db),
    mongo_db = Depends(get_mongo)
):
    # 1. Auditoria no Mongo
    if mongo_db is not None:
        log_entry = ticket.model_dump()
        log_entry["received_at"] = datetime.utcnow()
        try:
            mongo_db["integration_logs"].insert_one(log_entry)
            print("✅ Log salvo no Mongo")
        except Exception as e:
            print(f"⚠️ Erro Mongo: {e}")

    # 2. Persistência no Postgres
    db_ticket = models.Ticket(
        external_id=ticket.external_id,
        source=ticket.source,
        customer_name=ticket.customer_name,
        description=ticket.description,
        status="new"
    )
    
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

@app.get("/tickets/", response_model=list[schemas.TicketResponse], tags=["Atendimento"])
def list_tickets(db: Session = Depends(get_db)):
    return db.query(models.Ticket).all()