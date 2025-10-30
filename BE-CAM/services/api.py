from sqlalchemy.orm import Session
from robyn.robyn import Response
from datetime import datetime

from database.models import Service, Api, ApiCategory, ServiceIteration, User, ApiDraft
from database.enums import ApiLevel, HttpMethod
from services.utils import checkServiceIterationPermission


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


# 通过service_id获取全部api（最新版本，可带category_id，不包括api内包含的params）
# ⚠️ 注意：这个方法和service/serviceGetServiceByUuidAndVersion()类似。区别在于这个方法返回的只有apis，不包含service的其他信息；另外这个方法支持通过category_id筛选。
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
    db: Session, api_id: int, user_id: int, is_latest: bool = True
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
def apiDeleteCategoryById(db: Session, category_id: int, user_id: int) -> dict:
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
    category_id: int,
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


# 通过api_id、category_id修改api所属分类（仅支持修改正式表Api，不支持草稿表ApiDraft）
def apiUpdateApiCategory(db: Session, api_id: int, category_id: int, user_id: int):
    api = db.get(Api, api_id)
    if not api:
        return Response(status_code=404, headers={}, description="Api not found")
    # 非L0用户只能操作自己的服务
    user = db.get(User, user_id)
    if api.service.owner_id != user_id and user.level.value != 0:
        return Response(
            status_code=403,
            headers={},
            description="You are not the owner of this service",
        )
    if api.category_id == category_id:
        return Response(
            status_code=400,
            headers={},
            description="Api category not changed",
        )
    category = db.get(ApiCategory, category_id)
    if not category:
        return Response(status_code=404, headers={}, description="Category not found")
    if category.service_id != api.service_id:
        return Response(
            status_code=400,
            headers={},
            description="Category not belongs to this service",
        )
    api.category_id = category_id
    db.commit()
    return {"message": "Update api category success"}


# ---- ⚠️ 以下为service迭代流程相关方法 ----
# 通过service_iteration_id新增api（存ApiDraft表，可指定category_id）
def apiAddApi(
    db: Session,
    service_iteration_id: int,
    user_id: int,
    name: str,
    method: str,
    path: str,
    description: str,
    level: str,
    category_id: int = None,
) -> dict:
    # 版本迭代行为权限校验
    check_res = checkServiceIterationPermission(
        db=db, service_iteration_id=service_iteration_id, user_id=user_id
    )
    if not check_res["is_ok"]:
        return check_res["error"]
    service_iteration = check_res["service_iteration"]
    # 检查当前服务中是否已存在同名同路径的api
    # 当前服务最新版本的api
    existing_api = (
        db.query(Api)
        .filter(
            Api.service_id == service_iteration.service_id,
            Api.method == method,
            Api.path == path,
        )
        .first()
    )
    # 当前迭代周期的api草稿
    existing_api_draft = (
        db.query(ApiDraft)
        .filter(
            ApiDraft.service_iteration_id == service_iteration_id,
            ApiDraft.method == method,
            ApiDraft.path == path,
        )
        .first()
    )
    if existing_api or existing_api_draft:
        return Response(
            status_code=400,
            headers={},
            description="Api method and path already exists in this service",
        )
    # 符合新增条件
    try:
        api_method = HttpMethod(method)
    except ValueError:
        api_method = HttpMethod.GET
    try:
        api_level = ApiLevel(level)
    except ValueError:
        api_level = ApiLevel.GUEST
    # 若有category_id，检查category_id是否属于该服务
    if category_id is not None:
        category = db.get(ApiCategory, category_id)
        if not category:
            return Response(
                status_code=404, headers={}, description="Category not found"
            )
        if category.service_id != service_iteration.service_id:
            return Response(
                status_code=400,
                headers={},
                description="Category not belongs to this service",
            )

    api_draft = ApiDraft(
        service_iteration_id=service_iteration_id,
        owner_id=user_id,
        name=name,
        method=api_method,
        path=path,
        description=description,
        level=api_level,
        category_id=category_id,
    )
    db.add(api_draft)
    db.commit()
    return {
        "message": "Add api success",
        "api": api_draft.toJson(),
    }


# 通过service_iteration_id，api_draft_id删除api
def apiDeleteApiByApiDraftId(
    db: Session, service_iteration_id: int, api_draft_id: int, user_id: int
) -> dict:
    # 版本迭代行为权限校验
    check_res = checkServiceIterationPermission(
        db=db, service_iteration_id=service_iteration_id, user_id=user_id
    )
    if not check_res["is_ok"]:
        return check_res["error"]
    # 符合删除条件
    api_draft = db.get(ApiDraft, api_draft_id)
    if not api_draft:
        return Response(status_code=404, headers={}, description="Api draft not found")
    if api_draft.service_iteration_id != service_iteration_id:
        return Response(
            status_code=400,
            headers={},
            description="Api draft not belongs to this service iteration",
        )
    db.delete(api_draft)
    db.commit()
    return {"message": "Delete api success"}


# api的修改同params修改一并处理
