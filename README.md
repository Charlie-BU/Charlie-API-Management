# CAM (Charlie API Management) — PRD

## 一、产品概述

**产品名称**：CAM（Charlie API Management）

**产品类型**：API 管理与代码生成平台

**目标用户**：前后端开发团队、微服务架构团队、API 设计者

**主要目标**：通过统一的 API 定义与管理方式，实现：

-   前后端高效联调；
-   接口版本可追溯；
-   接口文档与代码同步更新；
-   支持自动生成多语言 SDK 与前端调用代码。

---

## 二、产品愿景

> **让 API 定义成为连接前后端的唯一真实来源（Single Source of Truth）。**

在当前分布式与多语言开发体系中，API 是协作的关键纽带。
CAM 旨在成为统一的 API 中心，帮助团队：

-   聚合、规范与可视化管理各类接口；
-   自动生成接口文档与调用代码；
-   让接口迭代透明、版本可控、联调高效。

---

## 三、核心功能概述

| 功能模块                  | 说明                                                                          | 实现状态  |
| ------------------------- | ----------------------------------------------------------------------------- | --------- |
| **1. 用户管理与权限控制** | 用户注册、登录、基于 JWT 的鉴权机制，支持多级用户权限（L0-L4）。              | ✅ 已实现 |
| **2. 服务管理与版本控制** | 以「服务（Service）」为单位进行接口分组，支持复杂的版本迭代机制。             | ✅ 已实现 |
| **3. API 迭代与草稿管理** | 支持 Service 迭代周期内的 API 增删改，通过 ApiDraft 表管理草稿状态。          | ✅ 已实现 |
| **4. API 分类管理**       | 支持为每个 Service 创建 API 分类，便于接口组织和管理。                        | ✅ 已实现 |
| **5. 参数管理**           | 完整的请求参数和响应参数管理，支持复杂嵌套结构和多种数据类型。                | ✅ 已实现 |
| **6. API 上传导入**       | 支持三种接口导入方式：OpenAPI（JSON/YAML）、Thrift IDL 文件、页面内手动创建。 | 🔄 规划中 |
| **7. OpenAPI 自动生成**   | 每个接口均可自动生成标准化的 OpenAPI JSON 文件，便于联调与外部导出。          | 🔄 规划中 |
| **8. 前端代码自动生成**   | 根据接口定义生成 TypeScript 请求代码（axios/fetch 模板可选）。                | 🔄 规划中 |

---

## 四、功能详情设计

### 1. 用户管理与权限控制

#### 1.1 用户注册与登录

-   **用户注册**：支持用户名密码注册，密码使用 bcrypt 加密存储
-   **用户登录**：验证用户名密码，成功后返回 JWT 访问令牌
-   **令牌管理**：基于 JWT 的无状态鉴权，支持 Bearer Token 格式

#### 1.2 用户权限等级

CAM 实现了五级用户权限体系（UserLevel）：

| 权限等级 | 说明       | 权限范围                            |
| -------- | ---------- | ----------------------------------- |
| **L0**   | 超级管理员 | 访问所有 API 和资源，系统级管理权限 |
| **L1**   | 高级管理员 | 访问大部分 API，跨服务管理权限      |
| **L2**   | 中级管理员 | 访问部分 API，有限的跨服务权限      |
| **L3**   | 初级管理员 | 基础 API 访问权限                   |
| **L4**   | 普通用户   | 只能访问自己创建的服务和 API        |

#### 1.3 API 权限控制

-   每个 API 端点都有最低权限等级要求
-   通过 `API_PERMISSION_MAP` 配置 API 访问权限
-   未配置的 API 默认允许所有登录用户访问
-   支持基于资源所有权的细粒度权限控制

#### 1.4 服务权限管理

-   **服务所有者（Owner）**：服务创建者，拥有完全控制权
-   **服务维护者（Maintainer）**：可参与服务开发和维护（规划中）
-   **权限继承**：API 权限继承自所属服务的权限设置

---

### 2. API 上传与导入（规划中）

#### 2.1 支持的导入方式

| 方式                 | 格式/文件类型     | 说明                                                                       |
| -------------------- | ----------------- | -------------------------------------------------------------------------- |
| **OpenAPI 文件导入** | `.json` / `.yaml` | 解析 OpenAPI 2.0/3.0 规范，自动生成接口定义。                              |
| **Thrift IDL 导入**  | `.thrift`         | 解析 service、struct、注解信息，映射为 RESTful API（Hertz 风格扩展支持）。 |
| **手动创建**         | 页面内操作        | 手动填写 URL、Method、参数、响应字段。                                     |

#### 2.2 导入行为

-   自动识别并归类服务（Service）；
-   支持批量上传；
-   提示解析错误或格式校验失败；
-   支持导入后在线编辑。

---

### 3. 服务与版本管理

#### 3.1 服务层级结构

-   每个「服务（Service）」代表一个逻辑系统（如：用户服务、订单服务）。
-   每个服务具有唯一的 `service_uuid`（格式：`a/b/c`）和版本号（格式：`X.Y.Z`）。
-   每个服务下包含多个「接口（API Endpoint）」和「API 分类（ApiCategory）」。
-   服务支持所有者（owner）和维护者（maintainer）的权限管理。

#### 3.2 版本控制机制

CAM 采用基于 **ServiceIteration（服务迭代）** 的版本控制机制：

-   **Service 表**：存储每个服务的最新版本信息
-   **ServiceIteration 表**：存储服务迭代周期内的所有变更和历史版本
-   **ApiDraft 表**：在迭代周期内管理 API 的草稿状态

#### 3.3 服务迭代流程

1. **开始迭代**：用户调用 `/startIteration` 创建新的迭代周期

    - 创建 `ServiceIteration` 记录，标记 `is_committed=False`
    - 备份当前服务的所有信息到迭代记录中
    - 返回 `service_iteration_id` 作为迭代周期标识

2. **迭代期间操作**：

    - 修改服务描述
    - 新增 API（创建 ApiDraft 记录）
    - 删除 API（删除 ApiDraft 及关联参数）
    - 编辑 API（更新 ApiDraft 及其请求/响应参数）

3. **提交迭代**：用户调用 `/commitIteration` 完成迭代
    - 将 ApiDraft 中的所有变更同步到正式的 Api 表
    - 更新服务版本号
    - 标记 `ServiceIteration` 为 `is_committed=True`

#### 3.4 版本号命名规则

-   语义化版本：`X.Y.Z`（主版本.次版本.修订版本）
-   所有服务初始版本为 `1.0.0`
-   支持版本历史查询和版本间差异对比

---

### 4. API 管理与参数设计

#### 4.1 API 分类管理

-   **ApiCategory 表**：支持对 API 进行分类管理
-   每个分类具有唯一名称和描述
-   支持分类的创建、编辑、删除操作
-   API 可以归属到特定分类下，便于组织和查找

#### 4.2 API 参数类型系统

CAM 支持完整的参数类型定义，基于 `ParamLocation` 枚举：

| 参数位置   | 说明         | 示例                          |
| ---------- | ------------ | ----------------------------- |
| **QUERY**  | URL 查询参数 | `?page=1&size=10`             |
| **PATH**   | URL 路径参数 | `/users/{id}`                 |
| **HEADER** | HTTP 请求头  | `Authorization: Bearer token` |
| **COOKIE** | Cookie 参数  | `session_id=abc123`           |
| **BODY**   | 请求体参数   | JSON/Form 数据                |

#### 4.3 参数定义结构

-   **RequestParam 表**：定义 API 请求参数
-   **ResponseParam 表**：定义 API 响应参数
-   支持参数嵌套（通过 `parent_id` 字段）
-   支持复杂数据类型（对象、数组等）
-   参数属性包括：名称、类型、是否必需、默认值、描述等

#### 4.4 草稿管理机制

在服务迭代期间，所有 API 变更都通过草稿机制管理：

-   **ApiDraft 表**：存储迭代期间的 API 草稿
-   **RequestParamDraft 表**：存储请求参数草稿
-   **ResponseParamDraft 表**：存储响应参数草稿
-   草稿支持完整的 CRUD 操作，不影响正式版本
-   迭代提交时，草稿内容同步到正式表

---

### 5. API 文档展示与编辑（规划中）

#### 5.1 文档视图

-   列表：展示服务下所有接口（Method + URL + 描述）；
-   详情：展示请求头、路径参数、Body 参数、响应字段；
-   JSON 视图：查看原始 OpenAPI 定义。

#### 5.2 编辑能力

-   支持在线编辑接口定义；
-   自动校验字段类型；
-   保存后触发版本更新；
-   可视化参数输入（支持复杂对象嵌套编辑）。

---

### 6. OpenAPI 自动生成（规划中）

#### 6.1 生成规则

-   无论接口来源（OpenAPI / Thrift / 手动），都可导出标准化 OpenAPI JSON；
-   统一字段映射规则：

    -   `path`, `method`, `parameters`, `requestBody`, `responses`；
    -   自动生成 `components.schemas`。

#### 6.2 导出方式

-   单接口导出；
-   整个服务导出；
-   全局导出（所有服务合并为一个 OpenAPI 文件）。

#### 6.3 应用场景

-   导入到 Postman / Swagger UI；
-   接口 Mock / 自动化测试；
-   外部系统文档集成。

---

### 7. 前端代码自动生成（规划中）

#### 7.1 生成目标

-   为前端（TypeScript）自动生成请求代码；
-   支持常见请求库模板（axios、fetch、umi-request）。

#### 7.2 核心特性

| 功能       | 说明                                          |
| ---------- | --------------------------------------------- |
| 类型安全   | 根据 OpenAPI 定义生成类型定义（`interface`）  |
| 一键生成   | 用户可选「目标服务」后自动生成代码文件        |
| 支持导出   | 可导出 `.ts` 文件或 npm 包形式                |
| 自定义模板 | 用户可自定义请求封装模板（如 axios 实例配置） |

#### 5.3 示例输出

```ts
// 自动生成的 TypeScript 请求代码
export interface GetUserResponse {
    id: number;
    name: string;
}

export const getUser = (id: number) =>
    request<GetUserResponse>(`/api/users/${id}`, { method: "GET" });
```

---

## 五、系统架构设计

### 5.1 整体架构

```plaintext
+----------------------+
|      Web 前端       |
|  React + TS + Arco  |
|----------------------|
| - 用户管理界面       |
| - 服务管理界面       |
| - API编辑器          |
| - 版本控制界面       |
+----------------------+
            │ HTTP/JWT
            ▼
+----------------------+
|       后端服务       |
|  Python (Robyn)     |
|----------------------|
| - 用户鉴权模块       |
| - 服务管理模块       |
| - API迭代管理        |
| - 权限控制系统       |
+----------------------+
            │ SQLAlchemy
            ▼
+----------------------+
|      数据库层        |
|     PostgreSQL      |
|----------------------|
| - 用户与权限表       |
| - 服务与版本表       |
| - API与参数表        |
| - 草稿管理表         |
+----------------------+
```

### 5.2 数据库设计

#### 5.2.1 核心表结构

| 表名                     | 说明                 | 关键字段                                   |
| ------------------------ | -------------------- | ------------------------------------------ |
| **user**                 | 用户信息             | id, username, password_hash, level         |
| **service**              | 服务基本信息         | id, service_uuid, name, version, owner_id  |
| **service_iteration**    | 服务迭代管理         | id, service_id, version, is_committed      |
| **api**                  | 正式 API 定义        | id, service_id, method, path, name         |
| **api_draft**            | API 草稿（迭代期间） | id, service_iteration_id, method, path     |
| **api_category**         | API 分类             | id, service_id, name, description          |
| **request_param**        | 请求参数定义         | id, api_id, name, location, type, required |
| **response_param**       | 响应参数定义         | id, api_id, name, type, description        |
| **request_param_draft**  | 请求参数草稿         | id, api_draft_id, name, location, type     |
| **response_param_draft** | 响应参数草稿         | id, api_draft_id, name, type, description  |

#### 5.2.2 权限设计

-   **用户等级（UserLevel）**：L0-L4 五级权限体系
-   **API 权限映射**：通过 `API_PERMISSION_MAP` 配置端点访问权限
-   **资源所有权**：基于 `owner_id` 的资源访问控制
-   **服务权限**：支持所有者和维护者角色（维护者功能规划中）

### 5.3 服务迭代机制

```plaintext
服务迭代生命周期：

1. 开始迭代 (/startIteration)
   ├── 创建 ServiceIteration 记录
   ├── 设置 is_committed = False
   └── 返回 service_iteration_id

2. 迭代期间操作
   ├── 创建/编辑 ApiDraft
   ├── 管理 RequestParamDraft
   ├── 管理 ResponseParamDraft
   └── 修改服务描述

3. 提交迭代 (/commitIteration)
   ├── 同步草稿到正式表
   ├── 更新服务版本号
   ├── 设置 is_committed = True
   └── 清理草稿数据
```

---

## 六、技术选型（已实现）

| 模块         | 技术栈                                      | 说明                              |
| ------------ | ------------------------------------------- | --------------------------------- |
| 前端         | React + TypeScript + ArcoDesign             | 现代化前端框架，类型安全          |
| 后端框架     | Python + Robyn                              | 高性能异步 Web 框架               |
| 数据库       | PostgreSQL                                  | 关系型数据库，支持复杂查询        |
| ORM          | SQLAlchemy                                  | Python ORM，支持数据库迁移        |
| 数据库迁移   | Alembic                                     | 自动化数据库版本管理              |
| 依赖管理     | uv                                          | 快速 Python 包管理器              |
| 鉴权         | JWT + Bearer Token                          | 基于 Token 的无状态鉴权           |
| 密码加密     | bcrypt                                      | 安全的密码哈希算法                |
| 环境变量管理 | python-dotenv                               | 环境配置管理                      |
| 文件解析     | pyyaml / openapi-spec-validator / thriftpy2 | 多格式文件解析支持                |
| 代码生成     | openapi-typescript                          | TypeScript 类型和请求代码自动生成 |
| 部署         | Docker + Nginx                              | 容器化部署                        |

---

## 七、开发进度与未来规划

### 7.1 当前实现状态

| 功能模块           | 状态      | 说明                                  |
| ------------------ | --------- | ------------------------------------- |
| **用户管理与鉴权** | ✅ 已完成 | 用户注册/登录、JWT 鉴权、五级权限体系 |
| **服务管理**       | ✅ 已完成 | 服务创建、编辑、删除、所有权管理      |
| **版本控制机制**   | ✅ 已完成 | ServiceIteration 迭代机制、草稿管理   |
| **API 管理**       | ✅ 已完成 | API CRUD、参数管理、分类管理          |
| **权限控制系统**   | ✅ 已完成 | API 级权限控制、资源所有权验证        |
| **数据库设计**     | ✅ 已完成 | 完整的表结构设计、Alembic 迁移管理    |

### 7.2 规划中功能

| 功能模块         | 优先级 | 说明                                |
| ---------------- | ------ | ----------------------------------- |
| **API 文档展示** | 🔥 高  | 可视化 API 文档界面、在线编辑器     |
| **文件导入功能** | 🔥 高  | OpenAPI/Swagger/Thrift 文件解析导入 |
| **OpenAPI 导出** | 🔥 高  | 标准 OpenAPI JSON 格式导出          |
| **前端代码生成** | 🔶 中  | TypeScript 请求代码自动生成         |
| **协作功能增强** | 🔶 中  | 服务维护者角色、团队协作            |
| **API 测试功能** | 🔶 中  | 在线 API 测试、Mock 数据生成        |
| **智能化扩展**   | 🔵 低  | AI 文档生成、测试用例生成           |

### 7.3 开发路线图

| 阶段        | 时间规划 | 关键目标                                |
| ----------- | -------- | --------------------------------------- |
| **Phase 1** | 当前阶段 | ✅ 完成后端核心功能、用户权限、版本控制 |
| **Phase 2** | 下一阶段 | 🚧 前端界面开发、文件导入、OpenAPI 导出 |
| **Phase 3** | 未来规划 | 📋 协作功能、API 测试、代码生成         |
| **Phase 4** | 长期规划 | 🤖 智能化功能、AI 辅助、高级分析        |

---

## 八、价值与竞争力

| 对比项                    | CAM 优势                                               |
| ------------------------- | ------------------------------------------------------ |
| **相对 Postman / Apifox** | 支持 Thrift IDL 导入；更贴近后端体系；更强类型一致性。 |
| **相对 SwaggerHub**       | 提供前端 TypeScript 自动生成能力；支持多来源接口定义。 |
| **相对 YApi / RAP2**      | 架构更现代化，支持版本控制、标准化 OpenAPI 生成。      |

---

## 九、命名由来

**CAM (Charlie API Management)**
寓意为：

> —— Clean, Accurate, Maintainable.

---

## 八、示例工作流

### 8.1 用户注册与服务创建流程

```plaintext
[用户注册] → [登录获取JWT] → [创建服务] → [设置服务基本信息]
    ↓
[获得服务所有权] → [开始API开发]
```

### 8.2 服务迭代开发流程

```plaintext
1. 开始迭代
[调用 /startIteration] → [创建ServiceIteration记录] → [获得service_iteration_id]
                                    ↓
2. 迭代期间开发
[创建API草稿] → [定义请求参数] → [定义响应参数] → [设置API分类]
       ↓              ↓              ↓              ↓
[ApiDraft表] → [RequestParamDraft] → [ResponseParamDraft] → [ApiCategory表]
                                    ↓
3. 提交迭代
[调用 /commitIteration] → [草稿同步到正式表] → [版本号更新] → [迭代完成]
```

### 8.3 权限控制示例

```plaintext
用户权限等级验证（暂定）：
L4用户 → [只能访问自己创建的服务] → [API操作受限]
L0用户 → [访问所有服务和API] → [系统管理权限]

API权限验证：
请求API → [检查JWT令牌] → [验证用户等级] → [检查资源所有权] → [允许/拒绝访问]
```

### 8.4 完整开发场景示例

```plaintext
场景：开发团队创建用户服务API

1. 团队负责人注册并创建服务
   POST /register → POST /login → POST /service/create

2. 开始用户服务v1.0.0开发
   POST /service/{service_id}/startIteration

3. 创建用户相关API
   - POST /api/draft/create (创建用户注册API)
   - POST /api/draft/create (创建用户登录API)
   - POST /api/draft/create (创建用户信息查询API)

4. 为每个API定义参数
   - POST /param/draft/request (定义请求参数)
   - POST /param/draft/response (定义响应参数)

5. 完成开发并提交
   POST /service/{service_id}/commitIteration

6. 服务版本更新为v1.0.0，API正式生效
```

---
