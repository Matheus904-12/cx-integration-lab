from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Schema para RECEBER dados (Input)
# Simula o payload que vem do Mercado Livre/Shopee
class TicketCreate(BaseModel):
    external_id: str
    source: str  # Ex: "Mercado Livre"
    customer_name: str
    description: str

# Schema para DEVOLVER dados (Output)
# O que nossa API responde para o Frontend
class TicketResponse(TicketCreate):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True