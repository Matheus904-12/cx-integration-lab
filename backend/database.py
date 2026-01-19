import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from pymongo import MongoClient
from dotenv import load_dotenv

# 1. Carrega as variáveis do arquivo .env
load_dotenv()

# --- Configuração SQL (Postgres/SQLAlchemy) ---
# Usado para dados estruturados: Tickets, Usuários, Status
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Cria o motor de conexão
# (check_same_thread é apenas para SQLite, removemos se for Postgres real)
connect_args = {"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)

# Cria a fábrica de sessões (cada requisição ganha uma sessão nova)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para criar os Models (Tabelas) depois
Base = declarative_base()

# Função para injetar o banco nas rotas (Dependency Injection)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Configuração NoSQL (MongoDB/Pymongo) ---
# Usado para logs brutos (Payloads de Webhooks, JSONs gigantes)
MONGO_URI = os.getenv("MONGO_URI")

# Cliente Mongo (só conecta se tiver uma URI definida)
mongo_client = MongoClient(MONGO_URI) if MONGO_URI else None
mongo_db = mongo_client["bcr_integration_lab"] if mongo_client else None

def get_mongo():
    """Retorna a coleção de logs do Mongo"""
    if mongo_db is not None:
        return mongo_db
    return None