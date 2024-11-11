from fastapi import APIRouter
from pathlib import Path
from typing import Annotated
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from .database import crud, schemas
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
# from fastapi import FastAPI
from .database.database import SessionLocal, engine
from datetime import datetime, timedelta, timezone
import jwt


from dotenv import load_dotenv
import os


load_dotenv(Path(__file__).parent / ".env")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = 9000


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# subapi = FastAPI()


router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)


def get_password_hash(password):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    # load_dotenv(Path(__file__).parent / ".env")

    # SECRET_KEY = os.getenv("SECRET_KEY")
    # ALGORITHM = os.getenv("ALGORITHM")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except jwt.InvalidTokenError:
        raise credentials_exception
    user = crud.get_user(db, None, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: Annotated[schemas.UserLogIn, Depends(get_current_user)],
):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


@router.post("/login")
async def authenticate_user(credentials: schemas.UserLogIn, db: Session = Depends(get_db)):
    user = crud.get_user(db, credentials)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_password(credentials.password, user.password):
        raise HTTPException(status_code=404, detail="Incorrect password")
#    token = await login_for_access_token(credentials, db)
    return user


@router.post("/reset_password")
async def reset_password(credentials: schemas.UserLogIn, db: Session = Depends(get_db)):
    user = crud.get_user(db, credentials)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.password = get_password_hash(user.password)
    db.commit()
    return user


@router.post("/register")
async def register(credentials: schemas.UserRegister, db: Session = Depends(get_db)):
    credentials.password = get_password_hash(credentials.password)
    user = crud.register_user(db, credentials)
    return user


@router.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
) -> schemas.Token:
    user = await authenticate_user(schemas.UserLogIn(username=form_data.username, password=form_data.password), db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return schemas.Token(access_token=access_token, token_type="bearer")
