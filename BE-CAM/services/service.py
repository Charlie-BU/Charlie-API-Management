from datetime import datetime

from sqlalchemy.orm import Session
from database.models import Service, User
from utils import version2Number


# 通过id获取服务详情
def serviceGetServiceById(db: Session, id: int, user_id: int) -> dict:
    service = db.get(Service, id)
    if not service:
        return {"message": "Service not found"}
    user = db.get(User, user_id)
    # 非L0用户只能查看自己的服务
    if service.owner_id != user_id and user.level.value != 0:
        return {"message": "You are not the owner of this service"}
    return service.toJson(include_relations=True)


# 通过用户id获取用户的所有最新版本服务的列表
def serviceGetHisNewestServicesByOwnerId(db: Session, owner_id: int) -> dict:
    services = (
        db.query(Service)
        .filter(Service.is_deleted == False, Service.owner_id == owner_id)
        .order_by(Service.id)
        .all()
    )

    # 按service_uuid分组，找出每个service_uuid的最新版本
    service_groups = {}
    for service in services:
        service_uuid = service.service_uuid
        if service_uuid not in service_groups:
            service_groups[service_uuid] = []
        service_groups[service_uuid].append(service)

    # 为每个service_uuid找出最新版本
    newest_services = []
    for service_uuid, service_list in service_groups.items():
        # 按版本号排序，找出最新的版本
        newest_service = max(service_list, key=lambda s: version2Number(s.version))
        newest_services.append(newest_service)

    return {
        "services": [
            service.toJson(include=["id", "service_uuid", "version", "description"])
            for service in newest_services
        ]
    }


# 通过service_uuid和version获取服务详情
def serviceGetServiceByUuidAndVersion(
    db: Session, service_uuid: str, version: str, user_id: int
) -> dict:
    service = (
        db.query(Service)
        .filter(
            Service.service_uuid == service_uuid,
            Service.version == version,
            Service.is_deleted == False,
        )
        .first()
    )
    if not service:
        return {"message": "Service not found"}
    user = db.get(User, user_id)
    # 非L0用户只能查看自己的服务
    if service.owner_id != user_id and user.level.value != 0:
        return {"message": "You are not the owner of this service"}
    return service.toJson(include_relations=True)


# 通过service_uuid获取全部版本号
def serviceGetAllVersionsByUuid(db: Session, service_uuid: str, user_id: int) -> dict:
    services = (
        db.query(Service)
        .filter(
            Service.service_uuid == service_uuid,
            Service.is_deleted == False,
        )
        .order_by(Service.id.desc())
        .all()
    )
    if not services:
        return {"message": "Service not found"}
    user = db.get(User, user_id)
    # 非L0用户只能查看自己的服务
    if services[0].owner_id != user_id and user.level.value != 0:
        return {"message": "You are not the owner of this service"}
    return {"versions": [service.version for service in services]}


# 创建新服务
def serviceCreateNewService(
    db: Session, service_uuid: str, owner_id: int, description: str
):
    # 检查service_uuid是否已存在
    existing_service = (
        db.query(Service).filter(Service.service_uuid == service_uuid).first()
    )
    if existing_service:
        return {"message": "Service UUID already exists"}

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
        .filter(Service.is_deleted == True, Service.owner_id == user_id)
        .order_by(Service.deleted_at.desc())
        .all()
    )
    if not services:
        return {"message": "No deleted services found"}
    # 按service_uuid分组，每个service_uuid只保留最新删除的一个
    service_groups = {}
    for service in services:
        service_uuid = service.service_uuid
        if service_uuid not in service_groups:
            service_groups[service_uuid] = service
        # 由于已经按deleted_at降序排列，第一个就是最新删除的
    unique_services = list(service_groups.values())
    return {
        "deleted_services": [
            service.toJson(include=["id", "service_uuid", "description"])
            for service in unique_services
        ]
    }


# 通过服务id删除服务（删除一个版本）
def serviceDeleteServiceById(db: Session, id: int, user_id: int) -> dict:
    service = db.get(Service, id)
    if not service:
        return {"message": "Service not found"}
    user = db.get(User, user_id)
    # 非L0用户只能删除自己的服务
    if service.owner_id != user_id and user.level.value != 0:
        return {"message": "You are not the owner of this service"}
    service.is_deleted = True
    service.deleted_at = datetime.now()
    db.commit()
    return {"message": "Delete service success"}


# 通过服务id还原服务（还原一个版本）
def serviceRestoreServiceById(db: Session, id: int, user_id: int) -> dict:
    service = db.get(Service, id)
    if not service:
        return {"message": "Service not found"}
    user = db.get(User, user_id)
    # 非L0用户只能还原自己的服务
    if service.owner_id != user_id and user.level.value != 0:
        return {"message": "You are not the owner of this service"}
    if not service.is_deleted:
        return {"message": "Service is not deleted"}
    service.is_deleted = False
    service.deleted_at = None
    db.commit()
    return {"message": "Restore service success"}


# 通过service_uuid删除服务全部版本
def serviceDeleteAllVersionsByUuid(
    db: Session, service_uuid: str, user_id: int
) -> dict:
    services = (
        db.query(Service)
        .filter(Service.service_uuid == service_uuid, Service.is_deleted == False)
        .all()
    )
    if not services:
        return {"message": "No services found"}
    user = db.get(User, user_id)
    # 非L0用户只能删除自己的服务
    if services[0].owner_id != user_id and user.level.value != 0:
        return {"message": "You are not the owner of this service"}
    for service in services:
        service.is_deleted = True
        service.deleted_at = datetime.now()
    db.commit()
    return {"message": "Delete all versions success"}


# 通过service_uuid还原服务全部版本
def serviceRestoreAllVersionsByUuid(
    db: Session, service_uuid: str, user_id: int
) -> dict:
    services = (
        db.query(Service)
        .filter(Service.service_uuid == service_uuid, Service.is_deleted == True)
        .all()
    )
    if not services:
        return {"message": "No deleted services found"}
    user = db.get(User, user_id)
    # 非L0用户只能还原自己的服务
    if services[0].owner_id != user_id and user.level.value != 0:
        return {"message": "You are not the owner of this service"}
    for service in services:
        service.is_deleted = False
        service.deleted_at = None
    db.commit()
    return {"message": "Restore all versions success"}
