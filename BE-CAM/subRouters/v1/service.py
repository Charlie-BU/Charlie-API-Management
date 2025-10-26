from robyn import SubRouter
from robyn.robyn import Request, Response
from robyn.authentication import BearerGetter

from authentication import AuthHandler
from database.database import session
from services.user import userGetUserIdByAccessToken
from services.service import (
    serviceCreateNewService,
    serviceDeleteServiceById,
    serviceGetServiceById,
)


serviceRouterV1 = SubRouter(__file__, prefix="/v1/service")


# 全局异常处理
@serviceRouterV1.exception
def handle_exception(error):
    return Response(status_code=500, description=f"error msg: {error}", headers={})


# 鉴权中间件
serviceRouterV1.configure_authentication(AuthHandler(token_getter=BearerGetter()))


@serviceRouterV1.get("/getServiceById", auth_required=True)
def getServiceById(request: Request):
    id = int(request.query_params.get("id", None))
    user_id = userGetUserIdByAccessToken(request=request)
    with session() as db:
        res = serviceGetServiceById(db=db, id=id, user_id=user_id)
    return res


@serviceRouterV1.post("/createNewService", auth_required=True)
def createNewService(request: Request):
    data = request.json()
    service_uuid = data["service_uuid"]
    description = data["description"]
    owner_id = userGetUserIdByAccessToken(request=request)
    with session() as db:
        res = serviceCreateNewService(
            db=db,
            service_uuid=service_uuid,
            owner_id=owner_id,
            description=description,
        )
    return res


@serviceRouterV1.post("/deleteServiceById", auth_required=True)
def deleteServiceById(request: Request):
    data = request.json()
    id = data["id"]
    user_id = userGetUserIdByAccessToken(request=request)
    with session() as db:
        res = serviceDeleteServiceById(db=db, id=id, user_id=user_id)
    return res
