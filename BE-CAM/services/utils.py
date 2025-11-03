from robyn.robyn import Response
from sqlalchemy.orm import Session

from database.models import ServiceIteration, User


# service 版本迭代行为权限校验（校验service_iteration是否存在，是否已提交，是否为当前user有权限操作）
def checkServiceIterationPermission(
    db: Session,
    service_iteration_id: int,
    user_id: int,
):
    service_iteration = db.get(ServiceIteration, service_iteration_id)
    if not service_iteration or service_iteration.is_committed:  # type: ignore
        return {
            "is_ok": False,
            "error": Response(
                status_code=404,
                headers={},
                description="Service iteration not found or committed",
            ),
        }
    # 已提交的迭代，不可进行迭代操作
    if service_iteration.is_committed:  # type: ignore
        return {
            "is_ok": False,
            "error": Response(
                status_code=400,
                headers={},
                description="Service iteration has been committed",
            ),
        }
    # 非L0用户，为当前service owner或当前迭代creator，才有权限进行迭代操作
    user = db.get(User, user_id)
    if (
        service_iteration.service.owner_id != user_id
        and service_iteration.creator_id != user_id
        and user.level.value != 0  # type: ignore
    ):
        return {
            "is_ok": False,
            "error": Response(
                status_code=403,
                headers={},
                description="You are neither the owner of this service, nor the creator of this service iteration",
            ),
        }
    return {
        "is_ok": True,
        "service_iteration": service_iteration,
        "user": user,
    }
