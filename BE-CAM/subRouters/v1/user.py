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


@userRouterV1.post("/login")
async def login(request: Request):
    data = request.json()
    username = data["username"]
    password = data["password"]
    with session() as db:
        res = userLogin(db, username, password)
    return res


@userRouterV1.post("/register")
async def register(request: Request):
    data = request.json()
    username = data["username"]
    password = data["password"]
    nickname = data["nickname"]
    email = data["email"]
    role = data["role"]
    with session() as db:
        res = userRegister(db, username, password, nickname, email, role)
    return res


@userRouterV1.get("/getUserById", auth_required=True)
async def getUserById(request: Request):
    id = request.query_params.get("id", None)
    with session() as db:
        res = userGetUserById(db, int(id))
    return res
