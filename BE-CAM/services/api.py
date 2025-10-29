from sqlalchemy.orm import Session
from robyn.robyn import Response
from datetime import datetime

from database.models import Service, Api, ApiCategory, User, ApiDraft
from database.enums import ApiLevel, HttpMethod


# 通过service_id获取全部categories
def apiGetAllCategoriesByServiceId(db: Session, service_id: str, user_id: int) -> dict:
    service = db.get(Service, service_id)
    if not service:
        return Response(status_code=404, headers={}, description="Service not found")
    # 非L0用户只能查看自己的服务
    user = db.get(User, user_id)
    if service.owner_id != user_id and user.level.value != 0:
        return Response(
            status_code=403,
            headers={},
            description="You are not the owner of this service",
        )
    categories = (
        db.query(ApiCategory)
        .filter(ApiCategory.service_id == service_id)
        .order_by(ApiCategory.id)
        .all()
    )
    return {"categories": [category.toJson() for category in categories]}


# service最新版（Service---Api---Param）
# ‼️ 这个方法和service/serviceGetServiceByUuidAndVersion()类似。区别在于这个方法返回的只有apis，不包含service的其他信息；另外这个方法支持通过category_id筛选。
# 通过service_id获取全部api（可带category_id，不包括api内包含的params）
def apiGetAllApisByServiceId(
    db: Session, service_id: str, user_id: int, category_id: int = None
) -> dict:
    service = db.get(Service, service_id)
    if not service:
        return Response(status_code=404, headers={}, description="Service not found")
    # 非L0用户只能查看自己的服务
    user = db.get(User, user_id)
    if service.owner_id != user_id and user.level.value != 0:
        return Response(
            status_code=403,
            headers={},
            description="You are not the owner of this service",
        )
    query = db.query(Api).filter(Api.service_id == service_id, ~Api.is_deleted)
    if category_id is not None:
        query = query.filter(Api.category_id == category_id)
    apis = query.order_by(Api.id.desc()).all()
    return {"apis": [api.toJson() for api in apis]}


# 通过api_id获取api详情（包括api内包含的params）
# 若传入is_latest为False，则api_id为api_draft_id，对应的是历史版本的api，相应params也来自param_draft
def apiGetApiById(
    db: Session, api_id: str, user_id: int, is_latest: bool = True
) -> dict:
    api = db.get(Api, api_id) if is_latest else db.get(ApiDraft, api_id)
    if not api:
        return Response(status_code=404, headers={}, description="Api not found")
    # 非L0用户只能查看自己的服务
    user = db.get(User, user_id)
    if user.level.value != 0:
        if is_latest and api.service.owner_id != user_id:
            return Response(
                status_code=403,
                headers={},
                description="You are not the owner of this service",
            )
        elif (
            not is_latest
            and api.service_iteration.creator_id != user_id
            and api.service_iteration.service.owner_id != user_id
        ):
            return Response(
                status_code=403,
                headers={},
                description="You are neither the owner of this service draft, nor the creator of this service iteration",
            )
    return {"api": api.toJson(include_relations=True)}


# 通过service_id新增category
def apiAddCategoryByServiceId(
    db: Session,
    service_id: str,
    user_id: int,
    category_name: str,
    description: str = None,
) -> dict:
    service = db.get(Service, service_id)
    if not service:
        return Response(status_code=404, headers={}, description="Service not found")
    # 非L0用户只能操作自己的服务
    user = db.get(User, user_id)
    if service.owner_id != user_id and user.level.value != 0:
        return Response(
            status_code=403,
            headers={},
            description="You are not the owner of this service",
        )
    # 检查category_name是否已存在
    existing_category = (
        db.query(ApiCategory)
        .filter(ApiCategory.service_id == service_id, ApiCategory.name == category_name)
        .first()
    )
    if existing_category:
        return Response(
            status_code=400,
            headers={},
            description="Category name already exists",
        )
    category = ApiCategory(
        service_id=service_id, name=category_name, description=description
    )
    db.add(category)
    db.commit()
    return {
        "message": "Add category success",
        "category": category.toJson(),
    }


# 通过category_id删除category
def apiDeleteCategoryById(db: Session, category_id: str, user_id: int) -> dict:
    category = db.get(ApiCategory, category_id)
    if not category:
        return Response(status_code=404, headers={}, description="Category not found")
    # 非L0用户只能操作自己的服务
    user = db.get(User, user_id)
    if category.service.owner_id != user_id and user.level.value != 0:
        return Response(
            status_code=403,
            headers={},
            description="You are not the owner of this service",
        )
    db.delete(category)
    db.commit()
    return {"message": "Delete category success"}


# 通过category_id修改category
def apiUpdateCategoryById(
    db: Session,
    category_id: str,
    user_id: int,
    category_name: str = None,
    description: str = None,
) -> dict:
    category = db.get(ApiCategory, category_id)
    if not category:
        return Response(status_code=404, headers={}, description="Category not found")
    # 非L0用户只能操作自己的服务
    user = db.get(User, user_id)
    if category.service.owner_id != user_id and user.level.value != 0:
        return Response(
            status_code=403,
            headers={},
            description="You are not the owner of this service",
        )
    if category_name is None and description is None:
        return Response(
            status_code=400,
            headers={},
            description="Category name or description is required",
        )
    if category_name == category.name and description == category.description:
        return Response(
            status_code=400,
            headers={},
            description="Category name or description not changed",
        )
    # 检查category_name是否已存在
    existing_category = (
        db.query(ApiCategory)
        .filter(
            ApiCategory.service_id == category.service_id,
            ApiCategory.name == category_name,
        )
        .first()
    )
    if existing_category:
        return Response(
            status_code=400,
            headers={},
            description="Category name already exists",
        )
    category.name = category_name
    category.description = description
    db.commit()
    return {
        "message": "Update category success",
        "category": category.toJson(),
    }


# ⚠️ 注意：以下方法会触发service迭代流程

# 通过service_id新增api（可指定category_id）
# def apiAddApiByServiceId(
#     db: Session,
#     service_id: str,
#     user_id: int,
#     name: str,
#     method: str,
#     path: str,
#     description: str,
#     level: str,
#     category_id: int = None,
# ) -> dict:
#     service = db.get(Service, service_id)
#     if not service:
#         return Response(status_code=404, headers={}, description="Service not found")
#     # 非L0用户只能操作自己的服务
#     user = db.get(User, user_id)
#     if service.owner_id != user_id and user.level.value != 0:
#         return Response(
#             status_code=403,
#             headers={},
#             description="You are not the owner of this service",
#         )
#     # 检查api_name是否已存在
#     existing_api = (
#         db.query(Api)
#         .filter(Api.service_id == service_id, Api.method == method, Api.path == path)
#         .first()
#     )
#     if existing_api:
#         return Response(
#             status_code=400,
#             headers={},
#             description="Api method and path already exists in this service",
#         )
#     try:
#         api_method = HttpMethod(method)
#     except ValueError:
#         api_method = HttpMethod.GET
#     try:
#         api_level = ApiLevel(level)
#     except ValueError:
#         api_level = ApiLevel.GUEST
#     # 检查category_id是否属于该服务
#     if category_id is not None:
#         category = db.get(ApiCategory, category_id)
#         if not category:
#             return Response(
#                 status_code=404, headers={}, description="Category not found"
#             )
#         if category.service_id != service_id:
#             return Response(
#                 status_code=400,
#                 headers={},
#                 description="Category not belongs to this service",
#             )

#     service.is_staged = True
#     api = Api(
#         service_id=service_id,
#         owner_id=user_id,
#         name=name,
#         method=api_method,
#         path=path,
#         description=description,
#         level=api_level,
#         category_id=category_id,
#     )
#     db.add(api)
#     db.commit()
#     return {
#         "message": "Add api success",
#         "api": api.toJson(),
#     }


# 通过service_id获取全部已删除api
def apiGetDeletedApisByServiceId(db: Session, service_id: str, user_id: int) -> dict:
    service = db.get(Service, service_id)
    if not service:
        return Response(status_code=404, headers={}, description="Service not found")
    # 非L0用户只能查看自己的服务
    user = db.get(User, user_id)
    if service.owner_id != user_id and user.level.value != 0:
        return Response(
            status_code=403,
            headers={},
            description="You are not the owner of this service",
        )
    apis = (
        db.query(Api)
        .filter(Api.service_id == service_id, Api.is_deleted)
        .order_by(Api.deleted_at.desc())
        .all()
    )
    return {"apis": [api.toJson() for api in apis]}


# 通过api_id删除api
def apiDeleteApiById(db: Session, api_id: str, user_id: int) -> dict:
    api = db.get(Api, api_id)
    if not api:
        return Response(status_code=404, headers={}, description="Api not found")
    # 非L0用户只能操作自己的api
    user = db.get(User, user_id)
    if api.owner_id != user_id and user.level.value != 0:
        return Response(
            status_code=403,
            headers={},
            description="You are not the owner of this api",
        )
    api.is_deleted = True
    api.deleted_at = datetime.utcnow()
    db.commit()
    return {"message": "Delete api success"}


# 通过api_id还原api
def apiRestoreApiById(db: Session, api_id: str, user_id: int) -> dict:
    api = db.get(Api, api_id)
    if not api:
        return Response(status_code=404, headers={}, description="Api not found")
    # 非L0用户只能操作自己的api
    user = db.get(User, user_id)
    if api.owner_id != user_id and user.level.value != 0:
        return Response(
            status_code=403,
            headers={},
            description="You are not the owner of this api",
        )
    # 检查api是否已被删除
    if not api.is_deleted:
        return Response(
            status_code=400,
            headers={},
            description="Api is not deleted",
        )
    api.is_deleted = False
    api.deleted_at = None
    db.commit()
    return {"message": "Restore api success"}
