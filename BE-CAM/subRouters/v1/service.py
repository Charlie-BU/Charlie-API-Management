from robyn import SubRouter
from robyn.robyn import Request, Response
from robyn.authentication import BearerGetter

from authentication import AuthHandler
from database.database import session
from services.user import userGetUserIdByAccessToken
from services.service import *


serviceRouterV1 = SubRouter(__file__, prefix="/v1/service")


# 全局异常处理
@serviceRouterV1.exception
def handle_exception(error):
    return Response(status_code=500, description=f"error msg: {error}", headers={})


# 鉴权中间件
serviceRouterV1.configure_authentication(AuthHandler(token_getter=BearerGetter()))


# 通过服务id获取服务详情
@serviceRouterV1.get("/getServiceById", auth_required=True)
def getServiceById(request: Request):
    id = int(request.query_params.get("id", None))
    user_id = userGetUserIdByAccessToken(request=request)
    with session() as db:
        res = serviceGetServiceById(db=db, id=id, user_id=user_id)
    return res


# 通过用户id获取用户的所有最新版本服务（Service表中）的列表
@serviceRouterV1.get("/getHisNewestServicesByOwnerId", auth_required=True)
def getHisNewestServicesByOwnerId(request: Request):
    owner_id = userGetUserIdByAccessToken(request=request)
    with session() as db:
        res = serviceGetHisNewestServicesByOwnerId(db=db, owner_id=owner_id)
    return res


# 通过service_uuid和version获取服务详情（根据version判断是否为最新版本）
@serviceRouterV1.get("/getServiceByUuidAndVersion", auth_required=True)
def getServiceByUuidAndVersion(request: Request):
    service_uuid = request.query_params.get("service_uuid", None)
    version = request.query_params.get("version", None)
    user_id = userGetUserIdByAccessToken(request=request)
    with session() as db:
        res = serviceGetServiceByUuidAndVersion(
            db=db,
            service_uuid=service_uuid,
            version=version,
            user_id=user_id,
        )
    return res


# 通过service_uuid获取全部版本号
@serviceRouterV1.get("/getAllVersionsByUuid", auth_required=True)
def getAllVersionsByUuid(request: Request):
    service_uuid = request.query_params.get("service_uuid", None)
    user_id = userGetUserIdByAccessToken(request=request)
    with session() as db:
        res = serviceGetAllVersionsByUuid(
            db=db,
            service_uuid=service_uuid,
            user_id=user_id,
        )
    return res


# 创建新服务
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


# 通过user_id获取全部删除的服务
@serviceRouterV1.get("/getAllDeletedServicesByUserId", auth_required=True)
def getAllDeletedServicesByUserId(request: Request):
    user_id = userGetUserIdByAccessToken(request=request)
    with session() as db:
        res = serviceGetAllDeletedServicesByUserId(db=db, user_id=user_id)
    return res


# 通过服务id删除服务（最新版本），历史版本不动
@serviceRouterV1.post("/deleteServiceById", auth_required=True)
def deleteServiceById(request: Request):
    data = request.json()
    id = data["id"]
    user_id = userGetUserIdByAccessToken(request=request)
    with session() as db:
        res = serviceDeleteServiceById(db=db, id=id, user_id=user_id)
    return res


# 通过服务id还原服务（还原最新版本），历史版本不动
@serviceRouterV1.post("/restoreServiceById", auth_required=True)
def restoreServiceById(request: Request):
    data = request.json()
    id = data["id"]
    user_id = userGetUserIdByAccessToken(request=request)
    with session() as db:
        res = serviceRestoreServiceById(db=db, id=id, user_id=user_id)
    return res


# 通过service_iteration_id删除服务历史版本
@serviceRouterV1.post("/deleteIterationById", auth_required=True)
def deleteIterationById(request: Request):
    data = request.json()
    service_iteration_id = data["service_iteration_id"]
    user_id = userGetUserIdByAccessToken(request=request)
    with session() as db:
        res = serviceDeleteIterationById(
            db=db,
            service_iteration_id=service_iteration_id,
            user_id=user_id,
        )
    return res


# ---- ⚠️ 以下为service迭代流程相关路由 ----
# 发起service迭代流程
@serviceRouterV1.post("/startIteration", auth_required=True)
def startIteration(request: Request):
    data = request.json()
    service_id = data["service_id"]
    user_id = userGetUserIdByAccessToken(request=request)
    with session() as db:
        res = serviceStartIteration(db=db, service_id=service_id, user_id=user_id)
    return res


# 完成service迭代流程，service版本更新
@serviceRouterV1.post("/commitIteration", auth_required=True)
def commitIteration(request: Request):
    data = request.json()
    service_iteration_id = data["service_iteration_id"]
    new_version = data["new_version"]
    user_id = userGetUserIdByAccessToken(request=request)
    with session() as db:
        res = serviceCommitIteration(
            db=db,
            service_iteration_id=service_iteration_id,
            new_version=new_version,
            user_id=user_id,
        )
    return res


# 通过 service_iteration_id 修改 service description
@serviceRouterV1.post("/updateDescription", auth_required=True)
def updateDescription(request: Request):
    data = request.json()
    service_iteration_id = data["service_iteration_id"]
    description = data["description"]
    user_id = userGetUserIdByAccessToken(request=request)
    with session() as db:
        res = serviceUpdateDescription(
            db=db,
            service_iteration_id=service_iteration_id,
            description=description,
            user_id=user_id,
        )
    return res
