from sqlalchemy.orm import Session
from database.models import Service


def getServiceById(db: Session, id: int):
    service = db.get(Service, id)
    return service.toJson(include_relations=True)
