from robyn import SubRouter
from robyn.robyn import Request, Response
from robyn.authentication import BearerGetter

from authentication import AuthHandler
from database.database import session
from services.user import userLogin, userRegister, userGetUserById

userRouterV1 = SubRouter(__file__, prefix="/v1/user")


# 全局异常处理
@userRouterV1.exception
def handle_exception(error):
    return Response(status_code=500, description=f"error msg: {error}", headers={})


# 鉴权中间件
userRouterV1.configure_authentication(AuthHandler(token_getter=BearerGetter()))


# 通过用户id获取用户详情
@userRouterV1.get("/getUserById", auth_required=True)
async def getUserById(request: Request):
    id = request.query_params.get("id", None)
    if not id:
        return Response(
            status_code=400,
            description="id is required",
            headers={},
        )
    with session() as db:
        res = userGetUserById(db=db, id=int(id))
    return res


# 用户登录
@userRouterV1.post("/login")
async def login(request: Request):
    data = request.json()
    username = data["username"]
    password = data["password"]
    with session() as db:
        res = userLogin(db=db, username=username, password=password)
    return res


# 用户注册
@userRouterV1.post("/register")
async def register(request: Request):
    data = request.json()
    username = data["username"]
    password = data["password"]
    nickname = data["nickname"]
    email = data["email"]
    role = data["role"]
    with session() as db:
        res = userRegister(
            db=db,
            username=username,
            password=password,
            nickname=nickname,
            email=email,
            role=role,
        )
    return res
