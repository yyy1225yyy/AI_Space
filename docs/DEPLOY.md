# AI广场 部署说明文档

> 本文档供部署智能体阅读，包含完整的环境要求、数据库初始化、后端/前端启动流程。
> 最后更新：2026-03-29

---

## 一、项目概述

AI广场是一个 ERP 行业 AI 知识分享社区，支持多岗位（研发/产品运营/测试）的问答、评论、投票、积分等功能。

**技术栈：**
- 后端：Spring Boot 3.2.5 + JPA/Hibernate + MySQL + JWT 认证
- 前端：React 18 + TypeScript + Vite + Zustand + Axios
- 构建工具：Maven 3.9.9（内嵌于项目中）、Node.js（需 >= 18）
- Java：JDK 17

**项目结构：**
```
AI_Space/
├── backend/                  # Spring Boot 后端
│   ├── src/main/java/       # Java 源码
│   ├── src/main/resources/  # 配置文件 (application.yml)
│   ├── sql/                 # 数据库建表和初始数据
│   │   ├── schema.sql       # 建表脚本
│   │   └── data.sql         # 初始数据（岗位配置、标签等）
│   ├── maven/               # 内嵌 Maven 3.9.9
│   ├── start.bat            # Windows 一键启动脚本（需修改路径）
│   └── pom.xml              # Maven 配置
├── frontend/                 # React 前端
│   ├── src/                 # TSX 源码
│   ├── package.json         # npm 依赖
│   └── vite.config.ts       # Vite 配置（含 API 代理）
├── test/                     # Vitest API + E2E 测试
│   ├── api/                 # API 接口测试
│   └── vitest.config.api.ts
├── Research/                 # 项目调研文档
└── docs/                     # 部署文档
```

---

## 二、环境要求

目标电脑需要安装以下软件：

| 依赖 | 版本要求 | 用途 | 验证命令 |
|------|---------|------|---------|
| JDK | **17**（必须，不能用其他版本） | 后端运行 | `java -version` |
| MySQL | >= 5.7（推荐 8.0+） | 数据库 | `mysql --version` |
| Node.js | >= 18 | 前端构建和运行 | `node -v` |

**注意：**
- Maven 已内嵌在 `backend/maven/` 目录，无需单独安装
- Node.js 安装时会自带 npm

---

## 三、部署步骤

### 步骤 1：修改 start.bat（Windows）

打开 `backend/start.bat`，将路径改为你电脑上的实际路径：

```bat
@echo off
set "JAVA_HOME=你的JDK安装路径"
cd /d 你的AI_Space\backend路径
call maven\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run
```

例如：
```bat
@echo off
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
cd /d D:\projects\AI_Space\backend
call maven\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run
```

### 步骤 2：修改数据库配置

打开 `backend/src/main/resources/application.yml`，修改数据库连接信息：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/ai_square?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&useSSL=false
    username: aisquare        # 改为你的 MySQL 用户名
    password: aisquare123     # 改为你的 MySQL 密码
```

如果是生产环境，还需更换 JWT 密钥：
```yaml
jwt:
  secret: <至少256位的长随机字符串>
  expiration: 86400000  # 24小时
```

### 步骤 3：初始化数据库

在 MySQL 中依次执行：

```bash
# 1. 建库建表
mysql -u root -p < backend/sql/schema.sql

# 2. 导入初始数据（岗位配置、标签等）
mysql -u root -p < backend/sql/data.sql
```

或者用 MySQL 客户端工具（Navicat、MySQL Workbench 等）手动执行这两个脚本。

初始数据包含：
- 3 个岗位配置（研发/产品运营/测试）
- 60+ 个预定义标签（按岗位分类）
- 4 个难度等级

### 步骤 4：修改前端代理配置（可选）

如果后端不在 localhost:8080，需修改 `frontend/vite.config.ts`：

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8080',  // 改为实际后端地址
    changeOrigin: true,
  },
}
```

### 步骤 5：启动后端

```bash
cd backend

# Windows（使用内嵌 Maven）:
maven\apache-maven-3.9.9\bin\mvn.cmd clean compile
maven\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run

# 或直接双击 start.bat（需先完成步骤1）
```

**首次启动会下载 Maven 依赖，耗时 1-3 分钟。** 已配置阿里云镜像加速。

启动成功标志：控制台显示 `Started AiSquareApplication in X.XXX seconds`

验证：
```bash
curl http://localhost:8080/api/job-roles
# 应返回岗位配置 JSON
```

### 步骤 6：启动前端

```bash
cd frontend
npm install    # 首次需安装依赖，约 1-2 分钟
npm run dev
```

访问 http://localhost:5173 即可使用。

---

## 四、测试验证

```bash
cd test
npm install

# API 接口测试（需后端运行中）
node ./node_modules/vitest/vitest.mjs run --config vitest.config.api.ts
```

**预期结果：89/89 通过，100% 通过率**

---

## 五、端口说明

| 服务 | 端口 | 说明 |
|------|------|------|
| MySQL | 3306 | 数据库 |
| 后端 API | 8080 | Spring Boot |
| 前端开发服务器 | 5173 | Vite dev server，代理 /api → 8080 |

前端通过 Vite 代理访问后端，浏览器只需访问 5173 端口。

---

## 六、常见问题

### Q: 后端启动报端口 8080 已占用
```bash
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Q: `mvn.cmd` 找不到或 JAVA_HOME 错误
确认 `start.bat` 中的 `JAVA_HOME` 指向正确的 JDK 17 安装目录。

### Q: 数据库连接失败
1. 检查 MySQL 服务是否启动
2. 检查 `application.yml` 中用户名密码是否正确
3. 确认数据库 `ai_square` 已创建

### Q: npm install 失败
尝试切换 npm 镜像：
```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### Q: JPA 枚举转换错误（如 `No enum constant ... question`）
项目中的枚举类已添加 `fromKey()` 方法支持大小写不敏感匹配。如新增枚举遇到此问题，参照 `CommentTargetTypeConverter` 模式添加 `AttributeConverter`。
