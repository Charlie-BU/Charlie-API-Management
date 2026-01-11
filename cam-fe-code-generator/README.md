## 用户通过命令行操作 cam 是怎么实现的？

用户通过命令行操作 `cam` 的实现机制主要依赖于 `package.json` 中的 `bin` 字段配置以及 `src/cli.ts` 中的逻辑实现。

以下是详细的实现原理解析：

**1. 命令行入口配置 (`package.json`)**

在 [package.json](file:///Users/bytedance/Desktop/work/CAM/fe-code-generator-CAM/package.json#L6-L8) 中，我们配置了 `bin` 字段：

```json
  "bin": {
    "cam": "dist/cli.js"
  },
```

-   **作用**：这告诉 npm（或 yarn/pnpm），当用户安装这个包时，需要将 `cam` 这个命令注册到系统的 PATH 中。
-   **映射**：当用户在终端输入 `cam` 时，实际执行的是 `dist/cli.js` 这个文件。

**2. 可执行脚本声明 (`src/cli.ts`)**

在 [src/cli.ts](file:///Users/bytedance/Desktop/work/CAM/fe-code-generator-CAM/src/cli.ts#L1) 的第一行，我们添加了 Shebang：

```typescript
#!/usr/bin/env node
```

-   **作用**：这行代码告诉操作系统，这个文件不是一个普通的文本文件，而是一个脚本，并且应该使用 `node` 环境来解释执行它。

**3. 命令解析与处理 (`src/cli.ts`)**

我们使用了 `commander` 库来处理命令行参数和子命令。具体流程如下：

-   **初始化程序**：

    ```typescript
    const program = new Command();
    program.name("cam").description("...").version("0.0.1");
    ```

    这定义了主命令 `cam` 的基本信息。

-   **注册 `init` 子命令**：
    在 [src/cli.ts](file:///Users/bytedance/Desktop/work/CAM/fe-code-generator-CAM/src/cli.ts#L14-L45) 中，我们定义了 `init` 命令：

    ```typescript
    program
        .command("init")
        .description("Initialize a new configuration file")
        .action(() => {
            // ... 生成 cam.config.json 的逻辑
        });
    ```

    -   `.command('init')`：监听 `cam init` 命令。
    -   `.action(...)`：定义了当用户执行该命令时要运行的具体函数。在这里，我们编写了创建 `cam.config.json` 文件的逻辑。

-   **解析参数**：
    ```typescript
    program.parse(process.argv);
    ```
    这一行是程序的入口点，它会解析用户传入的命令行参数（`process.argv`），并根据匹配到的命令（如 `init`）去调用相应的 `action` 回调函数。

**总结**

当用户执行 `cam init` 时，系统发生了以下交互：

1.  操作系统查找 PATH 中的 `cam` 命令。
2.  找到 `cam` 指向的 `dist/cli.js` 文件。
3.  通过 `node` 执行该文件。
4.  `commander` 解析参数，发现用户输入了 `init`。
5.  触发 `init` 命令对应的 `action` 函数，在当前工作目录生成配置文件。

## 写好代码到发布 npm publish 的流程是什么？

从代码开发到发布 `npm publish` 的标准流程如下：

### 1. 完善代码与测试

确保您的功能开发完成，并且在本地测试通过（比如您刚才做的 `cam init` 测试）。

### 2. 自动化构建配置 (已帮您优化)

为了防止“忘记编译就发布”的情况，我已经帮您修改了 [package.json](file:///Users/bytedance/Desktop/work/CAM/fe-code-generator-CAM/package.json) 增加了两个关键配置：

-   **`"prepublishOnly": "npm run build"`**: 这是一个 npm 生命周期钩子。当您运行 `npm publish` 时，它会**自动先执行** `npm run build`。如果构建失败，发布过程会立刻终止。这保证了您发布的一定是最新编译的代码。
-   **`"files": ["dist"]`**: 告诉 npm 只上传 `dist` 目录下的文件（以及默认的 package.json, README 等）。这样可以避免将 `src` 源码或其他杂文件上传到 npm，减小包体积。

### 3. 更新版本号

每次发布都需要一个新的版本号。您可以使用 `npm version` 命令来自动管理：

```bash
npm version patch  # 补丁更新 (0.0.1 -> 0.0.2) - 用于 bug 修复
npm version minor  # 次版本更新 (0.0.1 -> 0.1.0) - 用于新功能
npm version major  # 主版本更新 (0.0.1 -> 1.0.0) - 用于破坏性变更
```

_这个命令会自动修改 package.json 中的 version 字段，并创建一个 git commit 和 tag（如果是一个 git 仓库）。_

### 4. 登录 NPM

如果您还没有登录过 npm，需要执行一次：

```bash
npm login
```

按提示输入用户名、密码和邮箱。

### 5. 发布

最后，在项目根目录下执行：

```bash
npm publish
```

由于您的 `package.json` 中已经配置了 `"publishConfig": { "access": "public" }`，包将会被公开推送到 npm 仓库。

---

### 总结流程图

1.  **开发** (`Coding`)
2.  **提交代码** (`git commit`)
3.  **升级版本** (`npm version patch`)
4.  **发布** (`npm publish`)
    -   -> 自动触发 `prepublishOnly` (`npm run build`)
    -   -> 编译 TS 到 `dist/`
    -   -> 上传包到 npm

## 开发过程如何调试？

在本地开发 CLI 工具时，有三种常用的测试方法。推荐使用 **方案二 (`npm link`)**，因为它最能模拟真实用户的使用场景。

### 方案一：直接执行（最简单，适合快速调试）

不需要任何配置，直接编译后用 node 运行生成的文件。

1.  **编译代码**：
    ```bash
    npm run build
    ```
2.  **执行命令**：

    ```bash
    # 在项目根目录下测试
    node dist/cli.js init

    # 或者去其他目录测试
    cd ../some-test-dir
    node /path/to/your/project/dist/cli.js init
    ```

---

### 方案二：npm link（推荐，模拟真实安装）

`npm link` 会把您的本地包“软链接”到全局 npm 目录中。这样您就可以像已经安装了该包一样，在终端的任何位置直接使用 `cam` 命令。

1.  **构建项目**：
    ```bash
    npm run build
    ```
2.  **创建链接**（在项目根目录 `fe-code-generator-CAM` 下执行）：

    ```bash
    npm link
    ```

    _这会读取 `package.json` 中的 `bin` 配置，把 `cam` 命令注册到系统全局。_

3.  **验证使用**（在任意目录）：

    ```bash
    mkdir ~/Desktop/test-cam
    cd ~/Desktop/test-cam
    cam init  # 直接使用 cam 命令！
    ```

4.  **取消链接**（测试完后）：
    ```bash
    # 在项目根目录下执行
    npm unlink
    ```

---

### 方案三：使用 ts-node（开发效率最高）

如果您不想每次修改代码都运行 `npm run build`，可以安装 `ts-node` 直接运行 TS 代码。

1.  **安装依赖**：
    ```bash
    npm install -D ts-node
    ```
2.  **直接运行源码**：
    ```bash
    # 直接运行 ts 文件，省去编译步骤
    npx ts-node src/cli.ts init
    ```
    _注意：这种方式适合开发逻辑调试，但发布前务必还是用方案二验证一下编译后的产物是否正常。_

### 总结

-   **开发逻辑时**：用 **方案三** 或 **方案一**。
-   **发布前验证**：务必用 **方案二**，确保 `package.json` 的 `bin` 配置和 `dist` 产物都没有问题。

## cam 登录过程：在 cli 中输入用户名和密码，发请求返回一个 token。token 保存在哪里？每次进行 cli 操作时怎么鉴权？

在 CLI 工具中，由于没有浏览器的自动 Cookie 管理，我们通常使用**本地配置文件**来持久化 Token。

以下是为您实现的完整方案：

### 1. 存储位置：`~/.camrc`

Token 会保存在用户主目录下的 `.camrc` 文件中。这是一个隐藏文件，类似于 `.npmrc` 或 `.gitconfig`。

### 2. 核心组件实现

-   **[TokenManager](file:///Users/bytedance/Desktop/work/CAM/fe-code-generator-CAM/src/utils/token-manager.ts)**：专门负责读写 Token。
    -   使用 `os.homedir()` 获取用户主目录。
    -   写入时设置权限为 `0o600`（仅当前用户可读写），提高安全性。
-   **[cam login 命令](file:///Users/bytedance/Desktop/work/CAM/fe-code-generator-CAM/src/cli/login.ts)**：
    -   使用 `inquirer` 提供交互式输入界面（输入密码时会显示 `*`）。
    -   登录成功后，通过 `TokenManager` 将 Token 写入本地。

### 3. 如何在后续操作中鉴权？

当您需要发送需要授权的请求时，只需调用 `TokenManager.getToken()` 即可。

**示例逻辑：**

```typescript
import { TokenManager } from "../utils/token-manager";
import axios from "axios";

async function fetchData() {
    const tokenManager = new TokenManager();
    const token = tokenManager.getToken();

    if (!token) {
        console.error("请先运行 cam login 进行登录");
        return;
    }

    const response = await axios.get("https://your-api.com/data", {
        headers: {
            Authorization: `Bearer ${token}`, // 在请求头中携带 Token
        },
    });
}
```

### 4. 本地测试

我已经完成了代码编写和编译，您可以直接在终端尝试：

1.  运行登录命令：
    ```bash
    cam login
    ```
2.  按照提示输入用户名和密码。
3.  验证文件是否生成：
    ```bash
    cat ~/.camrc
    ```

这样，您的 CLI 工具就拥有了持久化的身份认证能力！如果您后续需要对接真实的 API，只需在 [login.ts](file:///Users/bytedance/Desktop/work/CAM/fe-code-generator-CAM/src/cli/login.ts) 中将 mock 逻辑替换为真实的 `axios.post` 请求即可。

## 潜在风险

1. Request 参数扁平化冲突 :
   目前的逻辑将 Body、Query、Header、Path 等所有参数合并到一个 req 对象中。如果不同位置有重名参数（例如 Query 和 Body 都有 type 字段），调用者只能传入一个值，且该值会被同时用于两个位置。这限制了 API 的灵活性，但在大多数规范的 API 设计中是可以接受的。
