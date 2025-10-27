from robyn import SubRouter
from robyn.robyn import Request, Response
from robyn.authentication import BearerGetter

from authentication import AuthHandler
from database.database import session
from services.user import userGetUserIdByAccessToken
from services.api import *


apiRouterV1 = SubRouter(__file__, prefix="/v1/api")


# 全局异常处理
@apiRouterV1.exception
def handle_exception(error):
    return Response(status_code=500, description=f"error msg: {error}", headers={})


# 鉴权中间件
apiRouterV1.configure_authentication(AuthHandler(token_getter=BearerGetter()))


# 通过service_id获取全部api
@apiRouterV1.get("/getAllApisByServiceId", auth_required=True)
def getAllApisByServiceId(request: Request):
    service_id = request.query_params.get("service_id", None)
