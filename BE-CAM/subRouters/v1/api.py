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


# 通过service_id获取全部categories
@apiRouterV1.get("/getAllCategoriesByServiceId", auth_required=True)
def getAllCategoriesByServiceId(request: Request):
    service_id = request.query_params.get("service_id", None)
    user_id = userGetUserIdByAccessToken(request)
    with session() as db:
        res = apiGetAllCategoriesByServiceId(
            db=db, service_id=service_id, user_id=user_id
        )
    return res


# 通过service_id获取全部api（可带category_id）
@apiRouterV1.get("/getAllApisByServiceId", auth_required=True)
def getAllApisByServiceId(request: Request):
    service_id = request.query_params.get("service_id", None)
    category_id = request.query_params.get("category_id", None)
    user_id = userGetUserIdByAccessToken(request)
    with session() as db:
        res = apiGetAllApisByServiceId(
            db=db, service_id=service_id, category_id=category_id, user_id=user_id
        )
    return res


# 通过api_id获取api详情
@apiRouterV1.get("/getApiById", auth_required=True)
def getApiById(request: Request):
    api_id = request.query_params.get("api_id", None)
    user_id = userGetUserIdByAccessToken(request)
    with session() as db:
        res = apiGetApiById(db=db, api_id=api_id, user_id=user_id)
    return res


# 通过service_id新增category
@apiRouterV1.post("/addCategoryByServiceId", auth_required=True)
def addCategoryByServiceId(request: Request):
    data = request.json()
    service_id = data["service_id"]
    category_name = data["category_name"]
    description = data["description"]
    user_id = userGetUserIdByAccessToken(request)
    with session() as db:
        res = apiAddCategoryByServiceId(
            db=db,
            service_id=service_id,
            user_id=user_id,
            category_name=category_name,
            description=description,
        )
    return res


# 通过service_id获取全部已删除api
@apiRouterV1.get("/getDeletedApisByServiceId", auth_required=True)
def getDeletedApisByServiceId(request: Request):
    service_id = request.query_params.get("service_id", None)
    user_id = userGetUserIdByAccessToken(request)
    with session() as db:
        res = apiGetDeletedApisByServiceId(
            db=db, service_id=service_id, user_id=user_id
        )
    return res


# 通过category_id删除category
@apiRouterV1.post("/deleteCategoryById", auth_required=True)
def deleteCategoryById(request: Request):
    data = request.json()
    category_id = data["category_id"]
    user_id = userGetUserIdByAccessToken(request)
    with session() as db:
        res = apiDeleteCategoryById(db=db, category_id=category_id, user_id=user_id)
    return res


# 通过category_id修改category
@apiRouterV1.post("/updateCategoryById", auth_required=True)
def updateCategoryById(request: Request):
    data = request.json()
    category_id = data["category_id"]
    category_name = data["category_name"]
    description = data["description"]
    user_id = userGetUserIdByAccessToken(request)
    with session() as db:
        res = apiUpdateCategoryById(
            db=db,
            category_id=category_id,
            user_id=user_id,
            category_name=category_name,
            description=description,
        )
    return res


# 通过service_id新增api（可指定category_id）
@apiRouterV1.post("/addApiByServiceId", auth_required=True)
def addApiByServiceId(request: Request):
    data = request.json()
    service_id = data["service_id"]
    name = data["name"]
    method = data["method"]
    path = data["path"]
    description = data["description"]
    level = data["level"]
    category_id = data.get("category_id", None)
    user_id = userGetUserIdByAccessToken(request)
    with session() as db:
        res = apiAddApiByServiceId(
            db=db,
            service_id=service_id,
            user_id=user_id,
            name=name,
            method=method,
            path=path,
            description=description,
            level=level,
            category_id=category_id,
        )
    return res


# 通过api_id删除api
@apiRouterV1.post("/deleteApiById", auth_required=True)
def deleteApiById(request: Request):
    data = request.json()
    api_id = data["api_id"]
    user_id = userGetUserIdByAccessToken(request)
    with session() as db:
        res = apiDeleteApiById(db=db, api_id=api_id, user_id=user_id)
    return res


# 通过api_id还原api
@apiRouterV1.post("/restoreApiById", auth_required=True)
def restoreApiById(request: Request):
    data = request.json()
    api_id = data["api_id"]
    user_id = userGetUserIdByAccessToken(request)
    with session() as db:
        res = apiRestoreApiById(db=db, api_id=api_id, user_id=user_id)
    return res
