from typing import List, Optional
from sqlalchemy import Column, ForeignKey, String, Table
from sqlalchemy.orm import relationship
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from enum import Enum
from datetime import date as Date
from sqlalchemy.orm import validates

from .schemas import BuyerGet, ItemGet
from .database import Base


class User(Base):
    __tablename__ = "users"
    name: Mapped[str] = mapped_column(String(30))
    username: Mapped[str] = mapped_column(String(20), primary_key=True)
    password: Mapped[str] = mapped_column(String(30))
    email: Mapped[str] = mapped_column(String(30))
    balance: Mapped[float]


class Transaction(Base):
    __tablename__ = "transactions"
    id: Mapped[int] = mapped_column(primary_key=True)
    creation_date: Mapped[Optional[Date]]
    approval_date: Mapped[Optional[Date]] = mapped_column(nullable=True)
    amount: Mapped[float]
    status: Mapped[str]
    buyer_id: Mapped[int] = mapped_column(ForeignKey("buyers.id"))
    buyer: Mapped["Buyer"] = relationship(back_populates="transactions")
    items: Mapped[List["Item"]] = relationship(back_populates="transaction")

    def as_dict(self):
        # return self.__dict__.pop("_sa_instance_state")
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class Buyer(Base):
    __tablename__ = "buyers"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    email: Mapped[str] = mapped_column(unique=True)
    address: Mapped[str]
    transactions: Mapped[List["Transaction"]
                         ] = relationship(back_populates="buyer")


class Blacklist(Base):
    __tablename__ = "blacklist"
    buyer_id: Mapped[int] = mapped_column(
        ForeignKey("buyers.id"), primary_key=True)


class Whitelist(Base):
    __tablename__ = "whitelist"
    buyer_id: Mapped[int] = mapped_column(
        ForeignKey("buyers.id"), primary_key=True)


class Item(Base):
    __tablename__ = "items"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    value: Mapped[float]
    transaction: Mapped[Transaction] = relationship(back_populates="items")
    transaction_id: Mapped[int] = mapped_column(ForeignKey("transactions.id"))
    # transactions: Mapped[List["Transaction"]] = relationship(secondary=association_table, back_populates="items")
