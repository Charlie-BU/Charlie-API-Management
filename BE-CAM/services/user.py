from robyn.robyn import Request
from sqlalchemy.orm import Session
from jose import jwt
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

from database.models import User
from database.enums import UserRole

# 加载 .env 文件
load_dotenv()
ALGORITHM = os.getenv("ALGORITHM")
SECRET_KEY = os.getenv("LOGIN_SECRET")


# 生成access token
def createAccessToken(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=3))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# 解析access token
def decodeAccessToken(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


# 通过access token获取user id
def userGetUserIdByAccessToken(request: Request = None, token: str = None) -> int:
    if request is not None and token is not None:
        raise Exception("Request and token should not be provided at the same time")
    if request is not None:
        authorization = request.headers.get("Authorization")
        token = authorization.split("Bearer ")[1]
    elif token is None:
        raise Exception("Either request or token is required")
    payload = decodeAccessToken(token)
    return payload["id"]


# 通过user id获取user信息
def userGetUserById(db: Session, id: int) -> dict:
    user = db.get(User, id)
    return user.toJson()


# 用户登录
def userLogin(db: Session, username: str, password: str) -> dict:
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        return {
            "message": "User not found",
            "access_token": "",
        }
    if not user.checkPassword(password):
        return {
            "message": "Wrong password",
            "access_token": "",
        }
    access_token = createAccessToken(data={"id": user.id, "username": user.username})
    return {
        "message": "Login success",
        "access_token": access_token,
    }


# 用户注册
def userRegister(
    db: Session, username: str, password: str, nickname: str, email: str, role: str
) -> dict:
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        return {"message": "Username already registered"}
    try:
        user_role = UserRole(role)
    except ValueError:
        user_role = UserRole.GUEST
    user = User(
        username=username,
        password=User.hashPassword(password),
        nickname=nickname,
        email=email,
        role=user_role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "message": "Register success",
        "user": user.toJson(),
    }
