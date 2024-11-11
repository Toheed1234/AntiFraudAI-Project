from typing import List
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime

from .database import crud, models, schemas
from .authentication import get_db, engine, oauth2_scheme, get_current_user, router as auth_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)


@app.get("/transactions")
async def all_transactions(token: str = Depends(oauth2_scheme), skip: int = 0, limit: int = 5, db: Session = Depends(get_db)) -> List[schemas.TransactionGet]:
    transactions = crud.get_all_transactions(db, skip, limit)
    return transactions


@app.get("/transactions/pending")
async def pending_transactions(token: str = Depends(oauth2_scheme), skip: int = 0, limit: int = 5, db: Session = Depends(get_db)) -> List[schemas.TransactionGet]:
    pending_transactions = crud.get_pending_transactions(db, skip, limit)
    return pending_transactions


@app.get("/transactions/approved")
async def approved_transactions(token: str = Depends(oauth2_scheme), skip: int = 0, limit: int = 5, db: Session = Depends(get_db)) -> List[schemas.TransactionGet]:
    approved_transactions = crud.get_approved_transactions(db, skip, limit)
    return approved_transactions


@app.get("/transactions/rejected")
async def rejected_transactions(token: str = Depends(oauth2_scheme), skip: int = 0, limit: int = 5, db: Session = Depends(get_db)) -> List[schemas.TransactionGet]:
    rejected_transactions = crud.get_rejected_transactions(db, skip, limit)
    return rejected_transactions


@app.get("/transactions/{id}")
async def get_transaction(id: int, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    transaction = crud.get_transaction(db, id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction.as_dict()


@app.post("/transactions")
async def add_transaction(transaction: schemas.TransactionPost, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    transaction = await crud.add_transaction(token, db, transaction)
    return transaction


@app.get("/transactions/{transaction_id}/items")
async def get_items_by_transaction(transaction_id: int, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> List[schemas.ItemGet]:
    items = crud.get_item_by_transaction(db, transaction_id)
    return items


@app.post("/transactions/{transaction_id}/accept")
async def accept_transaction(transaction_id: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    crud.accept_transaction(db, transaction_id)


@app.post("/transactions/{transaction_id}/reject")
async def reject_transaction(transaction_id: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    crud.reject_transaction(db, transaction_id)


@app.get("/buyers")
async def all_buyers(skip: int = 0, token: str = Depends(oauth2_scheme), limit: int = 5, db: Session = Depends(get_db)) -> List[schemas.BuyerGet]:
    buyers = crud.all_buyers(db, skip, limit)
    return buyers


@app.post("/buyers")
async def add_buyer(buyer: schemas.BuyerPost, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    crud.add_buyer(db, buyer)


@app.get("/buyers/{id}")
async def get_buyer(id: int, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> schemas.BuyerGet:
    buyer = crud.get_buyer(db, id)
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")
    return buyer


@app.post("/buyers/{id}/blacklist")
async def blacklist_buyer(id: int, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    """Toggle buyer blacklist status"""
    blacklisted = crud.toggle_blacklist_buyer(db, id)
    return {"message": "Buyer blacklisted" if blacklisted else "Buyer unblacklisted"}


@app.post("/buyers/{id}/whitelist")
async def whitelist_buyer(id: int, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    """Toggle buyer blacklist status"""
    whitelisted = crud.toggle_whitelist_buyer(db, id)
    return {"message": "Buyer whitelisted" if whitelisted else "Buyer unwhitelisted"}


@app.get("/buyers/{id}/transactions")
async def get_buyer_transactions(id: int, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> List[schemas.TransactionGet]:
    transactions = crud.get_buyer_transactions(db, id)
    return transactions


@app.get("/buyers/{id}/transactions/pending")
async def get_buyer_pending_transactions(id: int, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> List[schemas.TransactionGet]:
    transactions = crud.get_buyer_pending_transactions(db, id)
    return transactions


@app.get("/items")
async def all_items(page: int = 1, limit: int = 5, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> List[schemas.ItemGet]:
    items = crud.all_items(db, page, limit)
    return items


@app.get("/items/{id}")
async def get_item(id: int, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> schemas.ItemGet:
    item = crud.get_item(db, id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@app.get("/generate-report")
async def generate_report(start_date: datetime, end_date: datetime, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    crud.generate_report(db, start_date, end_date, await get_current_user(token, db))
