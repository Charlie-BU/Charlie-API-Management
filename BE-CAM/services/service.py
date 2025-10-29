from datetime import datetime
from robyn.robyn import Response
from sqlalchemy.orm import Session

from database.models import Service, ServiceIteration, User


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
def serviceDeleteIterationById(db: Session, id: str, user_id: int) -> dict:
    service_iteration = (
        db.query(ServiceIteration).filter(ServiceIteration.id == id).first()
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
