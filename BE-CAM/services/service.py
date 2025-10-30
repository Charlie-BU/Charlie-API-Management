from datetime import datetime
from robyn.robyn import Response
from sqlalchemy.orm import Session

from database.models import (
    User,
    Service,
    ServiceIteration,
    Api,
    RequestParam,
    ResponseParam,
    ApiDraft,
    RequestParamDraft,
    ResponseParamDraft,
)
from services.utils import checkServiceIterationPermission


# 通过id获取服务详情
def serviceGetServiceById(db: Session, id: int, user_id: int) -> dict:
    service = db.get(Service, id)
    if not service:
        return Response(status_code=404, headers={}, description="Service not found")
    user = db.get(User, user_id)
    # 非L0用户只能查看自己的服务
    if service.owner_id != user_id and user.level.value != 0:
        return Response(
            status_code=403,
            headers={},
            description="You are not the owner of this service",
        )
    return service.toJson(include_relations=True)


# 通过用户id获取用户的所有最新版本服务（Service表中）的列表
def serviceGetHisNewestServicesByOwnerId(db: Session, owner_id: int) -> dict:
    services = (
        db.query(Service)
        .filter(~Service.is_deleted, Service.owner_id == owner_id)
        .order_by(Service.id)
        .all()
    )
    return {
        "services": [
            service.toJson(include=["id", "service_uuid", "version", "description"])
            for service in services
        ]
    }


# 通过service_uuid和version获取服务详情（根据version判断是否为最新版本）
def serviceGetServiceByUuidAndVersion(
    db: Session, service_uuid: str, version: str, user_id: int
) -> dict:
    curr_service = (
        db.query(Service)
        .filter(
            Service.service_uuid == service_uuid,
            ~Service.is_deleted,
        )
        .first()
    )
    if not curr_service:
        return Response(status_code=404, headers={}, description="Service not found")
    # 判断是否最新版本（当前version是否与curr_service版本一致）
    if curr_service.version == version:
        is_latest = True
        service = curr_service
    else:
        is_latest = False
        service = (
            db.query(ServiceIteration)
            .filter(
                ServiceIteration.service_id == curr_service.id,
                ServiceIteration.version == version,
            )
            .first()
        )
        if not service:
            return Response(
                status_code=404,
                headers={},
                description="Service version not found",
            )

    user = db.get(User, user_id)
    # 非L0用户，为当前service owner或当前迭代creator，才有权限查看
    if curr_service.owner_id != user_id and user.level.value != 0:
        if not service.creator_id:  # 最新版
            return Response(
                status_code=403,
                headers={},
                description="You are not the owner of this service",
            )
        elif service.creator_id != user_id:  # 历史版本，需判断是否为当前迭代creator
            return Response(
                status_code=403,
                headers={},
                description="You are not the creator of this service iteration",
            )
    return {
        "service": service.toJson(
            include_relations=True
        ),  # 需要包含service下全部API，但不包含API下的params
        "is_latest": is_latest,
    }


# 通过service_uuid获取全部版本号
def serviceGetAllVersionsByUuid(db: Session, service_uuid: str, user_id: int) -> dict:
    curr_service = (
        db.query(Service)
        .filter(
            Service.service_uuid == service_uuid,
            ~Service.is_deleted,
        )
        .first()
    )
    if not curr_service:
        return Response(status_code=404, headers={}, description="Service not found")
    # 查询所有迭代版本（包括最新版本）
    service_iterations = (
        db.query(ServiceIteration)
        .filter(ServiceIteration.service_id == curr_service.id)
        .order_by(ServiceIteration.id.desc())
        .all()
    )

    user = db.get(User, user_id)
    # 非L0用户只能查看自己的服务
    if curr_service.owner_id != user_id and user.level.value != 0:
        return Response(
            status_code=403,
            headers={},
            description="You are not the owner of this service",
        )
    return {"versions": [service.version for service in service_iterations]}


# 创建新服务
def serviceCreateNewService(
    db: Session, service_uuid: str, owner_id: int, description: str
):
    # 检查service_uuid是否已存在
    existing_service = (
        db.query(Service).filter(Service.service_uuid == service_uuid).first()
    )
    if existing_service:
        return Response(
            status_code=400, headers={}, description="Service UUID already exists"
        )

    service = Service(
        service_uuid=service_uuid,
        owner_id=owner_id,
        version="1.0.0",
        description=description,
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    return {
        "message": "Create service success",
        "service": service.toJson(include_relations=True),
    }


# 通过user_id获取全部删除的服务
def serviceGetAllDeletedServicesByUserId(db: Session, user_id: int) -> dict:
    services = (
        db.query(Service)
        .filter(Service.is_deleted, Service.owner_id == user_id)
        .order_by(Service.deleted_at.desc())
        .all()
    )
    if not services:
        return Response(
            status_code=404, headers={}, description="No deleted services found"
        )
    return {
        "deleted_services": [
            service.toJson(include=["id", "service_uuid", "description"])
            for service in services
        ]
    }


# 通过服务id删除服务（最新版本），历史版本不动
def serviceDeleteServiceById(db: Session, id: int, user_id: int) -> dict:
    service = db.get(Service, id)
    if not service:
        return Response(status_code=404, headers={}, description="Service not found")
    user = db.get(User, user_id)
    # 非L0用户只能删除自己的服务
    if service.owner_id != user_id and user.level.value != 0:
        return Response(
            status_code=403,
            headers={},
            description="You are not the owner of this service",
        )
    service.is_deleted = True
    service.deleted_at = datetime.utcnow()
    db.commit()
    return {"message": "Delete service success"}


# 通过服务id还原服务（还原最新版本），历史版本不动
def serviceRestoreServiceById(db: Session, id: int, user_id: int) -> dict:
    service = db.get(Service, id)
    if not service:
        return Response(status_code=404, headers={}, description="Service not found")
    user = db.get(User, user_id)
    # 非L0用户只能还原自己的服务
    if service.owner_id != user_id and user.level.value != 0:
        return Response(
            status_code=403,
            headers={},
            description="You are not the owner of this service",
        )
    if not service.is_deleted:
        return Response(
            status_code=400, headers={}, description="Service is not deleted"
        )
    service.is_deleted = False
    service.deleted_at = None
    db.commit()
    return {"message": "Restore service success"}


# 通过service_iteration_id删除服务历史版本
def serviceDeleteIterationById(
    db: Session, service_iteration_id: int, user_id: int
) -> dict:
    service_iteration = (
        db.query(ServiceIteration)
        .filter(ServiceIteration.id == service_iteration_id)
        .first()
    )
    if not service_iteration:
        return Response(
            status_code=404, headers={}, description="No service iteration found"
        )
    user = db.get(User, user_id)
    # 非L0用户，为当前service owner或当前迭代creator，才有权限删除
    if (
        service_iteration.service.owner_id != user_id
        and service_iteration.creator_id != user_id
        and user.level.value != 0
    ):
        return Response(
            status_code=403,
            headers={},
            description="You are neither the owner of this service, nor the creator of this service iteration",
        )
    db.delete(service_iteration)
    db.commit()
    return {"message": "Delete service iteration success"}


# ---- ⚠️ 以下为service迭代流程相关方法 ----
# 发起service迭代流程
def serviceStartIteration(db: Session, service_id: int, user_id: int) -> dict:
    # 检查服务是否存在
    curr_service = db.get(Service, service_id)
    if not curr_service:
        return Response(status_code=404, headers={}, description="Service not found")
    # 非L0用户，为当前service owner或当前迭代creator，才有权限发起迭代
    user = db.get(User, user_id)
    if curr_service.owner_id != user_id and user.level.value != 0:
        return Response(
            status_code=403,
            headers={},
            description="You are not the owner of this service",
        )
    # 检查当前用户是否已存在未提交的迭代周期
    existing_new_iteration = (
        db.query(ServiceIteration)
        .filter(
            ServiceIteration.service_id == service_id,
            ~ServiceIteration.is_committed,
            ServiceIteration.creator_id
            == user_id,  # 同个迭代周期通过service_id和creator_id标识
        )
        .first()
    )
    if existing_new_iteration:
        return Response(
            status_code=400,
            headers={},
            description="You have an uncommitted service iteration in progress",
        )
    # 符合发起迭代条件
    new_iteration = ServiceIteration(
        service_id=service_id,
        creator_id=user_id,
        version=None,
        description=None,
        is_committed=False,
    )
    db.add(new_iteration)
    db.flush()  # 获取 new_iteration.id
    # 将当前服务最新版本全部信息备份到新迭代周期
    for api in curr_service.apis:
        api_draft = ApiDraft(
            service_iteration_id=new_iteration.id,
            owner_id=api.owner_id,
            category_id=api.category_id,
            name=api.name,
            method=api.method,
            path=api.path,
            description=api.description,
            level=api.level,
            is_enabled=api.is_enabled,
        )
        db.add(api_draft)
        db.flush()

        # 建立请求参数的ID映射关系
        req_param_id_mapping = {}
        for req in api.request_params:
            request_param_draft = RequestParamDraft(
                api_draft_id=api_draft.id,
                name=req.name,
                location=req.location,
                type=req.type,
                required=req.required,
                default_value=req.default_value,
                description=req.description,
                example=req.example,
                array_child_type=req.array_child_type,
                parent_param_id=None,  # 先设为None，后续更新
            )
            db.add(request_param_draft)
            db.flush()
            req_param_id_mapping[req.id] = request_param_draft.id

        # 更新请求参数的parent_param_id
        for req in api.request_params:
            if req.parent_param_id is not None:
                draft_param = (
                    db.query(RequestParamDraft)
                    .filter(RequestParamDraft.id == req_param_id_mapping[req.id])
                    .first()
                )
                draft_param.parent_param_id = req_param_id_mapping[req.parent_param_id]

        # 建立响应参数的ID映射关系
        resp_param_id_mapping = {}
        for resp in api.response_params:
            response_param_draft = ResponseParamDraft(
                api_draft_id=api_draft.id,
                status_code=resp.status_code,
                name=resp.name,
                type=resp.type,
                description=resp.description,
                example=resp.example,
                array_child_type=resp.array_child_type,
                parent_param_id=None,  # 先设为None，后续更新
            )
            db.add(response_param_draft)
            db.flush()
            resp_param_id_mapping[resp.id] = response_param_draft.id

        # 更新响应参数的parent_param_id
        for resp in api.response_params:
            if resp.parent_param_id is not None:
                draft_param = (
                    db.query(ResponseParamDraft)
                    .filter(ResponseParamDraft.id == resp_param_id_mapping[resp.id])
                    .first()
                )
                draft_param.parent_param_id = resp_param_id_mapping[
                    resp.parent_param_id
                ]
    db.commit()
    return {
        "message": "Start service iteration success",
        "service_iteration_id": new_iteration.id,  # 存在前端，在一个service迭代周期内作为唯一标识
    }


# 完成service迭代流程，service版本更新
def serviceCommitIteration(
    db: Session, service_iteration_id: int, new_version: str, user_id: int
) -> dict:
    service_iteration = db.get(ServiceIteration, service_iteration_id)
    if not service_iteration:
        return Response(
            status_code=404, headers={}, description="No service iteration found"
        )
    service = service_iteration.service
    user = db.get(User, user_id)
    # 非L0用户，为当前service owner或当前迭代creator，才有权限提交
    if (
        service.owner_id != user_id
        and service_iteration.creator_id != user_id
        and user.level.value != 0
    ):
        return Response(
            status_code=403,
            headers={},
            description="You are neither the owner of this service, nor the creator of this service iteration",
        )
    if service_iteration.is_committed:
        return Response(
            status_code=400,
            headers={},
            description="Service iteration has been committed",
        )
    if new_version == service.version:
        return Response(
            status_code=400,
            headers={},
            description="New version is the same as current version",
        )
    # 符合提交迭代条件
    # 将service_iteration全部信息更新到service
    service.description = service_iteration.description
    service.version = new_version
    # 递归删除service下所有api，并通过CASCADE删除api下所有相关的request_params和response_params
    db.query(Api).filter(Api.service_id == service.id).delete(synchronize_session=False)

    for api_draft in service_iteration.api_drafts:
        new_api = Api(
            service_id=service.id,
            owner_id=api_draft.owner_id,
            category_id=api_draft.category_id,
            name=api_draft.name,
            method=api_draft.method,
            path=api_draft.path,
            description=api_draft.description,
            level=api_draft.level,
            is_enabled=api_draft.is_enabled,
        )
        db.add(new_api)
        db.flush()

        # 建立请求参数的ID映射关系
        req_param_id_mapping = {}
        for req in api_draft.request_params:
            request_param = RequestParam(
                api_id=new_api.id,
                name=req.name,
                location=req.location,
                type=req.type,
                required=req.required,
                default_value=req.default_value,
                description=req.description,
                example=req.example,
                array_child_type=req.array_child_type,
                parent_param_id=None,  # 先设为None，后续更新
            )
            db.add(request_param)
            db.flush()
            req_param_id_mapping[req.id] = request_param.id

        # 更新请求参数的parent_param_id
        for req in api_draft.request_params:
            if req.parent_param_id is not None:
                param = (
                    db.query(RequestParam)
                    .filter(RequestParam.id == req_param_id_mapping[req.id])
                    .first()
                )
                param.parent_param_id = req_param_id_mapping[req.parent_param_id]

        # 建立响应参数的ID映射关系
        resp_param_id_mapping = {}
        for resp in api_draft.response_params:
            response_param = ResponseParam(
                api_id=new_api.id,
                status_code=resp.status_code,
                name=resp.name,
                type=resp.type,
                description=resp.description,
                example=resp.example,
                array_child_type=resp.array_child_type,
                parent_param_id=None,  # 先设为None，后续更新
            )
            db.add(response_param)
            db.flush()
            resp_param_id_mapping[resp.id] = response_param.id

        # 更新响应参数的parent_param_id
        for resp in api_draft.response_params:
            if resp.parent_param_id is not None:
                param = (
                    db.query(ResponseParam)
                    .filter(ResponseParam.id == resp_param_id_mapping[resp.id])
                    .first()
                )
                param.parent_param_id = resp_param_id_mapping[resp.parent_param_id]

    service_iteration.version = new_version
    service_iteration.is_committed = True
    db.commit()
    return {
        "message": "Commit service iteration success",
        "service_id": service.id,
        "service_iteration_id": service_iteration.id,
        "version": new_version,
    }


# 通过 service_iteration_id 修改 service description
def serviceUpdateDescription(
    db: Session, service_iteration_id: int, description: str, user_id: int
) -> dict:
    # 版本迭代行为权限校验
    check_res = checkServiceIterationPermission(
        db=db, service_iteration_id=service_iteration_id, user_id=user_id
    )
    if not check_res["is_ok"]:
        return check_res["error"]
    service_iteration = check_res["service_iteration"]
    # 符合修改条件
    service_iteration.description = description
    db.commit()
    return {"message": "Update service description success"}
