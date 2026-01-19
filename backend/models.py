from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.sql import func
from database import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String, unique=True, index=True) # ID do Pedido no ML/Shopee
    source = Column(String) # Ex: "Mercado Livre", "Magalu"
    customer_name = Column(String)
    description = Column(Text)
    status = Column(String, default="new") # new, open, pending, solved
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())