from sqlalchemy.orm import Session
from typing import List, Dict

from database.models import (
    ServiceIteration,
    User,
    RequestParam,
    RequestParamDraft,
    ResponseParam,
    ResponseParamDraft,
)
from database.enums import ParamLocation


# service 版本迭代行为权限校验（校验service_iteration是否存在，是否已提交，是否为当前user有权限操作）
def checkServiceIterationPermission(
    db: Session,
    service_iteration_id: int,
    user_id: int,
) -> dict:
    service_iteration = db.get(ServiceIteration, service_iteration_id)
    if not service_iteration or service_iteration.is_committed:  # type: ignore
        return {
            "is_ok": False,
            "error": {
                "status": -10,
                "message": "Service iteration not found or committed",
            },
        }
    # 已提交的迭代，不可进行迭代操作
    if service_iteration.is_committed:  # type: ignore
        return {
            "is_ok": False,
            "error": {
                "status": -20,
                "message": "Service iteration has been committed",
            },
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
            "error": {
                "status": -30,
                "message": "You are neither the owner of this service, nor the creator of this service iteration",
            },
        }
    return {
        "is_ok": True,
        "service_iteration": service_iteration,
        "user": user,
    }


# 组织请求参数，根据location分类
def organizeReqParams(
    request_params: List[RequestParam | RequestParamDraft],
) -> Dict[str, List[Dict]]:
    request_params_raw = [rp.toJson() for rp in request_params]
    request_params_by_location = {
        ParamLocation.QUERY.value: [],
        ParamLocation.PATH.value: [],
        ParamLocation.HEADER.value: [],
        ParamLocation.COOKIE.value: [],
        ParamLocation.BODY.value: [],
    }
    # 构建id到param的索引表，用于处理子参数
    req_index = {p["id"]: p for p in request_params_raw}
    # 处理location、type、array_child_type等枚举值，将其转换为对应的value
    for p in request_params_raw:
        loc = p.get("location")
        p["location"] = getattr(loc, "value", loc)
        t = p.get("type")
        p["type"] = getattr(t, "value", t)
        act = p.get("array_child_type")
        p["array_child_type"] = getattr(act, "value", act)
    for p in request_params_raw:
        parent_id = p.get("parent_param_id")
        # 存在parent_param_id的参数为子参数，将其添加到父参数的children_params中
        if parent_id:
            parent = req_index.get(parent_id)
            if parent is not None:
                parent.setdefault("children_params", []).append(p)
        # 不存在parent_param_id的参数为根参数，根据location添加到对应的列表中
        else:
            request_params_by_location[p["location"]].append(p)

    return request_params_by_location


def organizeRespParams(
    response_params: List[ResponseParam | ResponseParamDraft],
) -> Dict[str, List[Dict]]:
    response_params_raw = [rp.toJson() for rp in response_params]
    # 构建id到param的索引表，用于处理子参数
    resp_index = {p["id"]: p for p in response_params_raw}
    # 处理type、array_child_type等枚举值，将其转换为对应的value
    for p in response_params_raw:
        t = p.get("type")
        p["type"] = getattr(t, "value", t)
        act = p.get("array_child_type")
        p["array_child_type"] = getattr(act, "value", act)
    response_params_by_status_code = {}
    for p in response_params_raw:
        parent_id = p.get("parent_param_id")
        # 存在parent_param_id的参数为子参数，将其添加到父参数的children_params中
        if parent_id:
            parent = resp_index.get(parent_id)
            if parent is not None:
                parent.setdefault("children_params", []).append(p)
        # 不存在parent_param_id的参数为根参数，根据status_code添加到对应的列表中
        else:
            key = str(p["status_code"])  # Python中dict的key必须是str
            response_params_by_status_code.setdefault(key, []).append(p)

    return response_params_by_status_code
