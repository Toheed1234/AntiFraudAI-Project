import asyncio
from datetime import date, datetime
import os
from pathlib import Path
import statistics
from typing import List
from dotenv import load_dotenv
from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from ..authentication import get_current_user
import csv
from .schemas import Status, TransactionGet, TransactionPost, BuyerGet, BuyerPost, ItemPost, UserLogIn, UserRegister
import requests
from io import StringIO
from . import models
import smtplib
from email.message import EmailMessage
import ssl


THRESHOLD = 0.1


def get_user(db: Session, user: UserLogIn, username=None):
    if username:
        db_user = db.query(models.User).filter(
            models.User.username == username).first()
    else:
        db_user = db.query(models.User).filter(
            models.User.username == user.username).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


def register_user(db: Session, user: UserRegister):
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    else:
        db_user = models.User(**user.model_dump())
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user


def get_all_transactions(db: Session, skip: int = 0, limit: int = 5):
    transactions = db.query(models.Transaction).offset(skip).limit(limit).all()
    return transactions


def get_pending_transactions(db: Session, skip: int = 0, limit: int = 5):
    transactions = db.query(models.Transaction).filter(
        models.Transaction.status == Status.IN_PROCESS.value).offset(skip).limit(limit).all()
    return transactions


def get_approved_transactions(db: Session, skip: int = 0, limit: int = 5):
    transactions = db.query(models.Transaction).filter(
        models.Transaction.status == Status.ACCEPTED.value).offset(skip).limit(limit).all()
    return transactions


def get_rejected_transactions(db: Session, skip: int = 0, limit: int = 5):
    transactions = db.query(models.Transaction).filter(
        models.Transaction.status == Status.REJECTED.value).offset(skip).limit(limit).all()
    return transactions


def get_transaction(db: Session, id: int) -> models.Transaction:
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


def all_buyers(db: Session, skip: int = 0, limit: int = 5) -> List[BuyerGet]:
    buyers = db.query(models.Buyer).offset(skip).limit(limit).all()
    return buyers


def get_buyer(db: Session, id: int) -> BuyerGet:
    buyer = db.query(models.Buyer).filter(models.Buyer.id == id).first()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")
    return buyer


def get_buyer_transactions(db: Session, id: int) -> List[TransactionGet]:
    transactions = get_buyer(db, id).transactions
    return transactions


def add_buyer(db: Session, buyer: BuyerPost):
    if not db.query(models.Buyer).filter(models.Buyer.email == buyer.email).first():
        db_item = models.Buyer(**buyer.model_dump())
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item
    else:
        raise HTTPException(status_code=400, detail="Buyer already exists")


def toggle_blacklist_buyer(db: Session, buyer_id: int) -> bool:
    if not get_buyer(db, buyer_id):
        raise HTTPException(status_code=404, detail="Buyer not found")
    if not buyer_is_blacklisted(db, buyer_id):
        if buyer_is_whitelisted(db, buyer_id):
            toggle_whitelist_buyer(db, buyer_id)
        blacklist = models.Blacklist(buyer_id=buyer_id)
        db.add(blacklist)
        db.commit()
        return True
    else:
        db.delete(db.query(models.Blacklist).filter(
            models.Blacklist.buyer_id == buyer_id).first())
        db.commit()
        return False


def buyer_is_blacklisted(db: Session, buyer_id: int) -> bool:
    return bool(db.query(models.Blacklist).filter(models.Blacklist.buyer_id == buyer_id).first())


def toggle_whitelist_buyer(db: Session, buyer_id: int) -> bool:
    if not get_buyer(db, buyer_id):
        raise HTTPException(status_code=404, detail="Buyer not found")
    if not buyer_is_whitelisted(db, buyer_id):
        if buyer_is_blacklisted(db, buyer_id):
            toggle_blacklist_buyer(db, buyer_id)
        whitelist = models.Whitelist(buyer_id=buyer_id)
        db.add(whitelist)
        db.commit()
        return True
    else:
        db.delete(db.query(models.Whitelist).filter(
            models.Whitelist.buyer_id == buyer_id).first())
        db.commit()
        return False


def buyer_is_whitelisted(db: Session, buyer_id: int) -> bool:
    return bool(db.query(models.Whitelist).filter(models.Whitelist.buyer_id == buyer_id).first())


def get_buyer_pending_transactions(db: Session, id: int) -> List[TransactionGet]:
    transactions = db.query(models.Transaction).filter(
        models.Transaction.buyer_id == id, models.Transaction.status == Status.IN_PROCESS.value).all()
    return transactions


def add_item(db: Session, item: ItemPost):
    db_item = models.Item(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def all_items(db: Session, skip: int = 0, limit: int = 5):
    return db.query(models.Item).offset(skip).limit(limit).all()


def get_item(db: Session, id: int):
    item = db.query(models.Item).filter(models.Item.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


def get_item_by_transaction(db: Session, transaction_id: int) -> List[models.Item]:
    # transaction =

    # if not transaction:
    #     raise HTTPException(status_code=404, detail="Transaction not found")
    return get_transaction(db, transaction_id).items


def accept_transaction(db: Session, transaction_id: int):
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id).first()
    if transaction is None:
        raise HTTPException(
            status_code=404, detail="Transaction not found")
    if transaction.status == Status.IN_PROCESS.value:
        transaction.status = Status.ACCEPTED.value
        transaction.approval_date = date.today()
    else:
        raise HTTPException(
            status_code=400, detail="Transaction already approved or rejected")

    db.commit()
    return transaction


def reject_transaction(db: Session, transaction_id: int):
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id).first()
    if transaction is None:
        raise HTTPException(
            status_code=404, detail="Transaction not found")
    if transaction.status == Status.IN_PROCESS.value:
        transaction.status = Status.REJECTED.value
    else:
        raise HTTPException(
            status_code=400, detail="Transaction already approved or rejected")

    db.commit()
    return transaction


def generate_report(db: Session, start_date: datetime, end_date: datetime, user: UserLogIn):
    if user is None:
        raise ValueError("User is not provided")

    transactions = db.query(models.Transaction).filter(
        models.Transaction.creation_date >= start_date, models.Transaction.creation_date <= end_date).all()
    text = StringIO()
    csv_writer = csv.writer(text)
    csv_writer.writerow(["Transaction ID", "Creation Date",
                        "Approval Date", "Amount", "Status", "Buyer ID"])
    for transaction in transactions:
        csv_writer.writerow([transaction.id, transaction.creation_date, transaction.approval_date,
                            transaction.amount, transaction.status, transaction.buyer_id])

    send_email(text.getvalue(), user.email)


def send_email(text: str, email: str):
    msg = EmailMessage()
    msg.set_content(text)
    reports_email = 'antifraudaireports@gmail.com'
    load_dotenv(Path(__file__).parent.parent / ".env")
    password = os.getenv("MAIL_PASSWORD")

    msg['Subject'] = 'Report'
    msg['From'] = reports_email
    msg['To'] = email

    port = 587
    # context = ssl.create_default_context()

    with smtplib.SMTP("smtp.gmail.com", port) as server:
        server.ehlo()
        server.starttls()
        server.login(reports_email, password)
        server.send_message(msg)
        server.quit()


async def add_transaction(token: str, db: Session, transaction: TransactionPost):
    status = None
    shop = await get_current_user(token, db)
    max_id = db.query(func.max(models.Transaction.id)).scalar()
    curr_id = (max_id or 0) + 1
    model_input = [{
        "type": "CASH-IN",
        "id": (max_id or 0) + 1,
        "amount": transaction.amount,
        "oldbalanceOrg": shop.balance,
        "newbalanceOrig": shop.balance + transaction.amount,
        "oldbalanceDest": transaction.amount,
        "newbalanceDest": 0,
        "step": 1,
        "nameOrig": f"C{transaction.buyer_id}",
        "nameDest": "MSHOP",
        "isFlaggedFraud": 0
    }]

    output = requests.post("http://model:5000/predict", json=model_input)

    if buyer_is_blacklisted(db, transaction.buyer_id):
        status = Status.REJECTED.value
    elif buyer_is_whitelisted(db, transaction.buyer_id):
        status = Status.ACCEPTED.value
    else:
        if output.status_code == 200:
            if float(output.json()[0]["probability"]) < 0.5 - THRESHOLD:
                status = Status.REJECTED.value
            elif float(output.json()[0]["probability"]) > 0.5 + THRESHOLD:
                status = Status.ACCEPTED.value
            else:
                status = Status.IN_PROCESS.value
        else:
            raise HTTPException(
                status_code=500, detail=f"Model prediction failed with status code {output.status_code}")

    assert status != None
    transaction_dict: dict = transaction.model_dump()
    transaction_dict.update(
        {  # "id": curr_id,
            "status": status,
            "creation_date": date.today(),
            "approval_date": date.today() if status == Status.ACCEPTED.value else None,
        })

    transaction_dict["buyer"] = get_buyer(db, transaction_dict["buyer_id"])

    items = [models.Item(**item) for item in transaction_dict["items"]]
    if not any(items):
        raise HTTPException(
            status_code=404, detail="One of the items provided is not found.")
    transaction_dict["items"] = []
    db_transaction = models.Transaction(**transaction_dict)
    for item in items:
        db_transaction.items.append(item)
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction
