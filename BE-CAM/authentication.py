from robyn.robyn import Request
from robyn.authentication import AuthenticationHandler, Identity

from database.database import session
from services.user import decodeAccessToken, userGetUserById
from database.enums import UserLevel


# 接口权限映射，value为访问该接口最低的用户等级
API_PERMISSION_MAP = {
    "/v1/user/getUserById": UserLevel.L1,
}


class AuthHandler(AuthenticationHandler):
    def authenticate(self, request: Request):
        token = self.token_getter.get_token(request)
        try:
            payload = decodeAccessToken(token)
            id = payload["id"]
        except Exception:
            return None
        with session() as db:
            user = userGetUserById(db, id)
            # 检查接口权限
            api_path = request.url.path
            user_level = user["level"]
            if api_path not in API_PERMISSION_MAP:
                return None
            if user_level.value > API_PERMISSION_MAP[api_path].value:  # .value为数值
                return None
        return Identity(claims={"user": f"{ user }"})
