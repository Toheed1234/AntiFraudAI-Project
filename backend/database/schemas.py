from datetime import date
from enum import StrEnum
from enum import Enum
from typing import Any, List
from pydantic import BaseModel

# Status = StrEnum('Status', ['IN_PROCESS', 'APPROVED', 'REJECTED'])


class Status(Enum):
    ACCEPTED = "ACCEPTED"
    IN_PROCESS = "IN_PROCESS"
    REJECTED = "REJECTED"


class UserLogIn(BaseModel):
    username: str
    password: str


class UserRegister(UserLogIn):
    email: str
    name: str
    balance: float


class TransactionItemPost(BaseModel):
    name: str
    value: float


class TransactionItemGet(TransactionItemPost):
    id: int


class TransactionPost(BaseModel):
    amount: float
    buyer_id: int
    items: List[TransactionItemPost]


class TransactionGet(TransactionPost):
    class Config:
        from_attributes = True
    items: List[TransactionItemGet]
    creation_date: date
    approval_date: date | None
    # buyer_id: int
    # buyer: None
    id: int
    status: Status


class BuyerTransactionGet(BaseModel):
    items: List[TransactionItemGet]
    amount: float
    creation_date: date
    approval_date: date | None
    status: Status
    id: int


class BuyerPost(BaseModel):
    name: str
    email: str
    address: str
    # transactions: List[BuyerTransactionGet]


class BuyerGet(BuyerPost):
    class Config:
        from_attributes = True
    id: int


class ItemTransactionGet(BaseModel):
    amount: float
    buyer: BuyerGet
    creation_date: date
    approval_date: date | None
    status: Status
    id: int


class ItemPost(BaseModel):
    name: str
    value: float
    transaction_id: int
    # transaction: TransactionGet


class ItemGet(ItemPost):
    class Config:
        from_attributes = True
    id: int


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None
