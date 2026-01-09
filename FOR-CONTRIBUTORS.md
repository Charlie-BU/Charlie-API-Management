# CAM API 管理平台

CAM 是一套 API 定义与版本管理系统：后端把 Service、API、参数、迭代过程都当作数据进行管理；前端提供可视化的编辑与查看；同时提供一个 npm 包，用于把 CAM 中的定义拉取下来，生成 TypeScript 调用代码。

## 仓库结构

| 目录 | 说明 |
| --- | --- |
| `BE-CAM/` | 后端服务（Python + Robyn + SQLAlchemy + Alembic） |
| `FE-CAM/` | 前端 Web（React + TypeScript + Vite） |
| `fe-code-generator-CAM/` | TS 代码生成器 npm 包（`cam-fe-code-generator`，提供 `cam` CLI） |

## 核心概念

- Service：以 `service_uuid` 标识一个逻辑服务，格式为 `a/b/c`，并维护语义化版本号 `x.y.z`
- ServiceIteration：一次迭代周期，所有改动先落在草稿，提交后写入正式表并更新版本
- API / ApiDraft：正式 API 与迭代期草稿 API
- Request/Response Params：请求参数与响应参数，支持嵌套结构（object / array）

## 已实现能力（以当前代码为准）

- 用户
  - 注册、登录、JWT 鉴权
  - 获取个人信息、修改密码
- 服务
  - 创建、查询、软删除与恢复
  - 按 `service_uuid + version` 拉取服务定义（支持 `latest`）
  - 查看服务版本与迭代记录
- 迭代（ServiceIteration）
  - 发起迭代、提交迭代（提交时更新服务版本）
  - 查看/删除迭代记录
- API 与参数
  - API 分类管理
  - 迭代期间的 API 草稿增删改查
  - 请求/响应参数草稿管理（含嵌套参数），提交迭代后同步到正式表
- 前端
  - 基于后端接口实现完整的服务与 API 管理 UI
  - 登录态管理：token 写入 `localStorage`，并在请求中自动附加 `Authorization: Bearer <token>`
- TS 代码生成（npm 包）
  - `cam` CLI 登录后拉取指定 Service 的 API 定义
  - 生成可复用的 Service Class 与类型定义（namespaces），便于在业务项目中接入 axios/fetch

## 本地开发

### 1. 启动后端（BE-CAM）

要求：Python 3.13、uv、PostgreSQL

1) 安装依赖

```bash
cd BE-CAM
uv sync
```

2) 配置环境变量

在 `BE-CAM/.env` 中至少配置下面这些字段（示例值请按你的环境替换）：

```ini
PORT=1024
DATABASE_URI=postgresql+psycopg2://USER:PASSWORD@HOST:5432/DB_NAME
ALGORITHM=HS256
LOGIN_SECRET=your-secret
```

3) 初始化/升级数据库

Alembic 默认读取 [alembic.ini](file:///Users/bytedance/Desktop/work/CAM/BE-CAM/alembic.ini) 的 `sqlalchemy.url`，你需要把它改成和 `DATABASE_URI` 一致后再执行：

```bash
uv run alembic upgrade head
```

4) 启动服务（开发模式）

```bash
uv run ./run-dev.sh
```

服务默认监听 `1024` 端口（可通过 `PORT` 修改），访问 `http://localhost:1024/` 应返回 `OK`。

后端路由统一以 `/v1` 为前缀（见 [app.py](file:///Users/bytedance/Desktop/work/CAM/BE-CAM/app.py) 与 [subRouters/v1](file:///Users/bytedance/Desktop/work/CAM/BE-CAM/subRouters/v1)）。

### 2. 启动前端（FE-CAM）

要求：Node.js、pnpm

1) 安装依赖

```bash
cd FE-CAM
pnpm install
```

2) 配置前端环境变量

前端通过 `VITE_API_BASE_URL` 指向后端地址，开发端口默认 `9000`（后端 CORS 默认放行 `http://localhost:9000`，见 [BE-CAM/app.py](file:///Users/bytedance/Desktop/work/CAM/BE-CAM/app.py)）。

`FE-CAM/.env.development` 参考：

```ini
VITE_API_BASE_URL=http://localhost:1024
VITE_FE_PORT=9000
```

3) 启动

```bash
pnpm dev
```

浏览器打开 `http://localhost:9000/`。

### 3. 生成 TypeScript 调用代码（cam-fe-code-generator）

这个 npm 包提供 `cam` 命令，用于拉取 CAM 中的 Service/API 定义并生成代码。

要求：Node.js、npm 或 pnpm

1) 安装

```bash
npm i -g cam-fe-code-generator
```

2) 登录（token 存在本机 `~/.camrc`）

```bash
cam login
```

3) 初始化当前目录的配置文件（生成 `cam.config.json`）

```bash
cam init
```

4) 添加需要生成的服务并更新代码

```bash
cam add <service_name>:<service_uuid>@<version|latest>
cam update
```

默认输出目录是 `cam-auto-generate/`，每次 `cam update` 会先清空该目录再重新生成（见 [templates/init.ts](file:///Users/bytedance/Desktop/work/CAM/fe-code-generator-CAM/src/templates/init.ts) 与 [services/code-generate](file:///Users/bytedance/Desktop/work/CAM/fe-code-generator-CAM/src/services/code-generate/index.ts)）。

5) 在项目中使用生成产物

生成后的每个 Service 目录下会有：

- `namespaces.ts`：请求/响应参数类型
- `index.ts`：默认导出一个 `XxxService` class，可注入 `baseURL` 和 `request` 实现

示例（axios）：

```ts
import axios, { type AxiosRequestConfig } from "axios";
import UserService from "./cam-auto-generate/user/index";

const userService = new UserService<AxiosRequestConfig>({
  baseURL: "http://localhost:1024",
  request: (config) => axios.request({ ...config }).then((res) => res.data),
});

// 调用方式由生成结果决定，例如：userService.GetMyInfoGET()
```

说明：

- `cam` CLI 内部请求后端的地址目前是固定值（见 [fe-code-generator-CAM/src/request/index.ts](file:///Users/bytedance/Desktop/work/CAM/fe-code-generator-CAM/src/request/index.ts)），如果你需要对接本地后端，请在该包源码中修改并重新构建/发布。

## 常用脚本

- 后端（BE-CAM）
  - `uv run ./run-dev.sh`：开发模式启动
  - `uv run ./run-prod.sh`：多进程启动
  - `uv run alembic upgrade head`：应用迁移
  - `uv run database/db-migrate.sh`：生成迁移并升级（会生成新 revision，适合你在本项目内开发表结构时使用）
- 前端（FE-CAM）
  - `pnpm dev`：启动开发环境
  - `pnpm lint`：eslint
  - `pnpm build`：类型检查并构建
- 代码生成器（fe-code-generator-CAM）
  - `npm run build`：编译到 `dist/`（发布前会自动执行）

## 鉴权与权限

- 鉴权方式：JWT Bearer Token，前端会在请求拦截器中自动附加（见 [FE-CAM/src/request/index.ts](file:///Users/bytedance/Desktop/work/CAM/FE-CAM/src/request/index.ts)）
- 接口权限：后端可通过 `API_PERMISSION_MAP` 为路由设置最低访问等级（见 [authentication.py](file:///Users/bytedance/Desktop/work/CAM/BE-CAM/authentication.py)）
