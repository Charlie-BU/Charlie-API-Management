from sqlalchemy import (
    inspect,
    Table,
    Column,
    String,
    Integer,
    Boolean,
    ForeignKey,
    Enum,
    Text,
    DateTime,
    func,
    UniqueConstraint,
)
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

from .enums import (
    HttpMethod,
    ApiLevel,
    ParamLocation,
    ParamType,
    UserRole,
    UserLevel,
)
from bcrypt import hashpw, gensalt, checkpw

Base = declarative_base()
# 数据库表名和列名的命名规范
naming_convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(column_0_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}
Base.metadata.naming_convention = naming_convention


# 可序列化Mixin基类，提供toJson方法将模型实例转换为JSON
class SerializableMixin:
    def toJson(self, include=None, exclude=["password"], include_relations=False):
        include = set(include) if include else None
        exclude = set(exclude) if exclude else set()
        mapper = inspect(self.__class__)

        data = {}
        for column in mapper.columns:
            name = column.key
            if include and name not in include:
                continue
            if name in exclude:
                continue
            value = getattr(self, name)
            if isinstance(value, datetime):
                value = value.isoformat()
            data[name] = value

        if include_relations:
            for rel in mapper.relationships:
                if rel.key in exclude:
                    continue
                value = getattr(self, rel.key)
                if value is None:
                    data[rel.key] = None
                elif isinstance(value, list):
                    data[rel.key] = [v.toJson() for v in value]
                else:
                    data[rel.key] = value.toJson()
        return data


# ---- 用户-服务关联表 ----
user_service_link = Table(
    "user_service_link",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("user.id"), primary_key=True),
    Column("service_id", Integer, ForeignKey("service.id"), primary_key=True),
)


# ---- 用户表 ----
class User(Base, SerializableMixin):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, autoincrement=True)
    services = relationship(
        "Service", secondary=user_service_link, back_populates="maintainers"
    )

    username = Column(String(64), unique=True, nullable=False, index=True)
    password = Column(String(128), nullable=False)
    nickname = Column(String(64), nullable=True, index=True)
    email = Column(String(128), nullable=True, unique=True)
    role = Column(Enum(UserRole), default=UserRole.GUEST)
    level = Column(Enum(UserLevel), default=UserLevel.L4)
    created_at = Column(DateTime, server_default=func.now())

    @staticmethod
    def hashPassword(password):
        hashed = hashpw(password.encode("utf-8"), gensalt())
        return hashed.decode("utf-8")

    def checkPassword(self, password):
        return checkpw(password.encode("utf-8"), self.password.encode("utf-8"))

    def __repr__(self):
        return f"<User {self.username}>"


# ---- 服务表 ----
class Service(Base, SerializableMixin):
    __tablename__ = "service"

    id = Column(Integer, primary_key=True, autoincrement=True)
    owner_id = Column(Integer, ForeignKey("user.id"), nullable=False, index=True)
    owner = relationship("User", backref="owned_services")
    maintainers = relationship(
        "User", secondary=user_service_link, back_populates="services"
    )

    service_uuid = Column(
        String(64), unique=True, nullable=False, index=True
    )  # 只存放一个服务的最新版本，历史版本存在ServiceIteration表中
    version = Column(String(32), nullable=False, index=True)
    description = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    # 软删除
    is_deleted = Column(Boolean, default=False, index=True)
    deleted_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<Service {self.service_uuid}:{self.version}>"


# ---- 服务迭代表（存储每个服务的每个历史版本和最新版本，最新版本和Service保持一致） ----
class ServiceIteration(Base, SerializableMixin):
    __tablename__ = "service_iteration"
    id = Column(Integer, primary_key=True, autoincrement=True)
    # 每个 iteration 对应 service 的一次完整快照
    service_id = Column(Integer, ForeignKey("service.id"), nullable=False)
    service = relationship("Service", backref="iterations")
    # 迭代创建人
    creator_id = Column(Integer, ForeignKey("user.id"))
    creator = relationship("User", backref="created_iterations")

    version = Column(String(32), nullable=False)  # 最新迭代与 service.version 对齐
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    # 是否已发布
    is_committed = Column(Boolean, default=False)

    def __repr__(self):
        return f"<ServiceIteration {self.service_id}:{self.version}>"


class ApiCategory(Base, SerializableMixin):
    __tablename__ = "api_category"
    # API路径和方法组合唯一约束
    __table_args__ = (
        UniqueConstraint("service_id", "name", name="uq_service_category_name"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    service_id = Column(Integer, ForeignKey("service.id"), nullable=False, index=True)
    service = relationship("Service", backref="api_categories")

    name = Column(String(64), nullable=False, index=True)
    description = Column(Text)

    def __repr__(self):
        return f"<ApiCategory {self.name}>"


# ---- 接口表 ----
class Api(Base, SerializableMixin):
    __tablename__ = "api"
    # API路径和方法组合唯一约束
    __table_args__ = (
        UniqueConstraint("service_id", "method", "path", name="uq_api_method_path"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    service_id = Column(Integer, ForeignKey("service.id"), nullable=False, index=True)
    service = relationship("Service", backref="apis")
    owner_id = Column(Integer, ForeignKey("user.id"), nullable=False, index=True)
    owner = relationship("User", backref="apis")
    category_id = Column(
        Integer, ForeignKey("api_category.id"), nullable=True, index=True
    )
    category = relationship("ApiCategory", backref="apis")

    name = Column(String(128), nullable=False)
    method = Column(Enum(HttpMethod), nullable=False, index=True)
    path = Column(String(256), nullable=False, index=True)
    description = Column(Text)
    level = Column(Enum(ApiLevel), default=ApiLevel.P4)  # P0/P1/P2/P3/P4
    is_enabled = Column(Boolean, default=True)  # 是否启用
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # 软删除
    is_deleted = Column(Boolean, default=False, index=True)
    deleted_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<Api {self.name} [{self.method.value}] {self.path}>"


# ---- 请求参数 ----
class RequestParam(Base, SerializableMixin):
    __tablename__ = "request_param"

    id = Column(Integer, primary_key=True, autoincrement=True)
    api_id = Column(Integer, ForeignKey("api.id"), nullable=False, index=True)
    api = relationship("Api", backref="request_params")

    name = Column(String(64), nullable=False, index=True)
    location = Column(Enum(ParamLocation), nullable=False)  # query/path/header/cookie
    type = Column(
        Enum(ParamType), nullable=False
    )  # string/int/double/boolean/array/object/binary
    required = Column(Boolean, default=False)
    default_value = Column(String(256), nullable=True)
    description = Column(Text)
    example = Column(String(256))

    # 如果是array类型，需要规定元素类型
    array_child_type = Column(Enum(ParamType), nullable=True)
    # 如果存在是object类型，需要有子参数（这里以子参数视角）
    parent_param_id = Column(Integer, ForeignKey("request_param.id"), nullable=True)
    parent_param = relationship(
        "RequestParam", backref="child_params", remote_side=[id]
    )
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<RequestParam {self.name} ({self.location.value})>"


# ---- 响应参数 ----
class ResponseParam(Base, SerializableMixin):
    __tablename__ = "response_param"

    id = Column(Integer, primary_key=True, autoincrement=True)
    api_id = Column(Integer, ForeignKey("api.id"), nullable=False, index=True)
    api = relationship("Api", backref="response_params")

    status_code = Column(Integer, nullable=False)
    name = Column(String(64), nullable=False, index=True)
    type = Column(Enum(ParamType), nullable=False)
    description = Column(Text)
    example = Column(String(256))

    # 如果是array类型，需要规定元素类型
    array_child_type = Column(Enum(ParamType), nullable=True)
    # 如果存在是object类型，需要有子参数（这里以子参数视角）
    parent_param_id = Column(Integer, ForeignKey("response_param.id"), nullable=True)
    parent_param = relationship(
        "ResponseParam", backref="child_params", remote_side=[id]
    )
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<ResponseParam {self.name} ({self.status_code})>"


# ---- 接口草稿表 ----
class ApiDraft(Base, SerializableMixin):
    __tablename__ = "api_draft"
    # API路径和方法组合唯一约束
    __table_args__ = (
        UniqueConstraint(
            "service_iteration_id", "method", "path", name="uq_api_method_path_draft"
        ),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    service_iteration_id = Column(
        Integer, ForeignKey("service_iteration.id"), nullable=False, index=True
    )
    service_iteration = relationship("ServiceIteration", backref="api_drafts")
    owner_id = Column(Integer, ForeignKey("user.id"), nullable=False, index=True)
    owner = relationship("User", backref="api_drafts")
    category_id = Column(
        Integer, ForeignKey("api_category.id"), nullable=True, index=True
    )
    category = relationship("ApiCategory", backref="api_drafts")

    name = Column(String(128), nullable=False)
    method = Column(Enum(HttpMethod), nullable=False, index=True)
    path = Column(String(256), nullable=False, index=True)
    description = Column(Text)
    level = Column(Enum(ApiLevel), default=ApiLevel.P4)  # P0/P1/P2/P3/P4
    is_enabled = Column(Boolean, default=True)  # 是否启用
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<ApiDraft {self.name} [{self.method.value}] {self.path}>"


# ---- 请求参数草稿 ----
class RequestParamDraft(Base, SerializableMixin):
    __tablename__ = "request_param_draft"

    id = Column(Integer, primary_key=True, autoincrement=True)
    api_draft_id = Column(
        Integer, ForeignKey("api_draft.id"), nullable=False, index=True
    )
    api_draft = relationship("ApiDraft", backref="request_params")

    name = Column(String(64), nullable=False, index=True)
    location = Column(Enum(ParamLocation), nullable=False)  # query/path/header/cookie
    type = Column(
        Enum(ParamType), nullable=False
    )  # string/int/double/boolean/array/object/binary
    required = Column(Boolean, default=False)
    default_value = Column(String(256), nullable=True)
    description = Column(Text)
    example = Column(String(256))

    # 如果是array类型，需要规定元素类型
    array_child_type = Column(Enum(ParamType), nullable=True)
    # 如果存在是object类型，需要有子参数（这里以子参数视角）
    parent_param_id = Column(
        Integer, ForeignKey("request_param_draft.id"), nullable=True
    )
    parent_param = relationship(
        "RequestParamDraft", backref="child_params", remote_side=[id]
    )
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<RequestParamDraft {self.name} ({self.location.value})>"


# ---- 响应参数草稿 ----
class ResponseParamDraft(Base, SerializableMixin):
    __tablename__ = "response_param_draft"

    id = Column(Integer, primary_key=True, autoincrement=True)
    api_draft_id = Column(
        Integer, ForeignKey("api_draft.id"), nullable=False, index=True
    )
    api_draft = relationship("ApiDraft", backref="response_params")

    status_code = Column(Integer, nullable=False)
    name = Column(String(64), nullable=False, index=True)
    type = Column(Enum(ParamType), nullable=False)
    description = Column(Text)
    example = Column(String(256))

    # 如果是array类型，需要规定元素类型
    array_child_type = Column(Enum(ParamType), nullable=True)
    # 如果存在是object类型，需要有子参数（这里以子参数视角）
    parent_param_id = Column(
        Integer, ForeignKey("response_param_draft.id"), nullable=True
    )
    parent_param = relationship(
        "ResponseParamDraft", backref="child_params", remote_side=[id]
    )
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<ResponseParamDraft {self.name} ({self.status_code})>"


# 创建所有表（被alembic替代）
if __name__ == "__main__":
    try:
        from database.database import engine
    except ImportError:
        from database import engine

    Base.metadata.create_all(bind=engine)
