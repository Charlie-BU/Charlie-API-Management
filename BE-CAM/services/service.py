from datetime import datetime

from sqlalchemy.orm import Session
from database.models import Service


def serviceGetServiceById(db: Session, id: int, user_id: int) -> dict:
    service = db.get(Service, id)
    if not service:
        return {"message": "Service not found"}
    if service.owner_id != user_id:
        return {"message": "You are not the owner of this service"}
    return service.toJson(include_relations=True)


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


def serviceDeleteServiceById(db: Session, id: int, user_id: int) -> dict:
    service = db.get(Service, id)
    if not service:
        return {"message": "Service not found"}
    if service.owner_id != user_id:
        return {"message": "You are not the owner of this service"}
    service.is_deleted = True
    service.deleted_at = datetime.now()
    db.commit()
    return {"message": "Delete service success"}


def serviceGetAllServicesByOwnerId(db: Session, owner_id: int) -> dict:
    services = (
        db.query(Service)
        .filter(Service.is_deleted == False, Service.owner_id == owner_id)
        .order_by(Service.id)
        .all()
    )
    return {"services": [service.toJson() for service in services]}
