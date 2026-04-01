# AI广场 项目开发日志

> 项目启动时间：2026年3月28日

---

## 日志索引

| 日期 | 模块 | 状态 |
|------|------|------|
| 2026-03-28 | 项目初始化 + 用户模块 + 问题模块 | 进行中 |
| 2026-03-30 | 前端重构（去侧边栏 + Header Tabs 布局） | 已完成 |
| 2026-03-31 | 个人主页功能完善 + API 补全 | 已完成 |

---

## [2026-03-28] Day 1 上午 + 下午：项目初始化 + 用户模块 + 问题模块

### 完成内容

#### 1.1 项目初始化
- **前端脚手架**：React 19 + Vite 8 + TypeScript 5.9 + KDesign (@kdcloudjs/kdesign)
- **前端依赖**：react-router-dom, zustand, axios, @kdcloudjs/kdesign
- **后端脚手架**：Spring Boot 3.2.5 + Java 17 + Maven
- **后端依赖**：Spring Web, Spring Data JPA, Spring Security, MySQL Connector, Redis, JWT (jjwt 0.12.5), Lombok
- **前端项目结构**：components/, pages/, stores/, services/, types/, constants/, utils/
- **后端项目结构**：entity/, repository/, service/, controller/, dto/, security/, common/

#### 1.2 数据库设计
- **MySQL 9.3.0**，14张表：user, question, answer, comment, tag, question_tag, vote, point_record, badge, user_badge, attachment, notification, sign_in, job_role_config
- **初始数据**：3个岗位配置、58个预置标签（研发20个、产品运营20个、测试15个）、12个徽章、1个管理员账号
- SQL文件：`backend/sql/schema.sql` + `backend/sql/data.sql`

#### 1.3 用户模块
- **后端**：
  - AuthService：注册（含岗位方向选择）、登录（JWT生成）
  - UserService：获取/更新用户信息、岗位方向变更、等级计算、等级称谓获取
  - UserController：/api/auth/register, /api/auth/login, /api/users/me, /api/users/{id}
  - JobRoleController：/api/job-roles, /api/job-roles/{key}/tags, /api/job-roles/{key}/stats
  - SecurityConfig：JWT认证过滤器、CORS配置、公开/认证接口配置
  - JwtTokenProvider：JWT令牌生成和验证
- **前端**：
  - Layout布局（Header + Sidebar + Content）
  - Header组件（Logo、搜索框、通知铃铛、用户菜单）
  - Sidebar组件（岗位专区导航、标签页、排行榜入口）
  - JobRoleTab组件（全部/研发/产品运营/测试切换）
  - QuestionCard组件（问题卡片，含岗位标识、标签、状态）
  - UserCard组件（用户信息卡片）
  - 登录页 / 注册页（含岗位方向选择）
  - 个人中心页（信息编辑、岗位切换、等级进度条）
  - 用户主页
  - Zustand状态管理：userStore, appStore
  - API服务：authService, userService, jobRoleService
  - Axios封装（JWT拦截器、错误处理）

#### 1.4 问题模块
- **后端**：
  - QuestionService：问题CRUD、标签关联、积分发放（发布+2+等级加成）
  - AnswerService：回答创建、采纳（含悬赏积分发放）、跨岗位积分加成（+8+3）
  - VoteService：投票/取消投票、投票计数更新、被赞积分（+10）
  - CommentService：评论创建、评论列表
  - QuestionController：问题CRUD接口
  - AnswerController：回答、采纳接口
  - VoteController：投票接口
  - CommentController：评论接口
- **前端**：
  - 问题发布页（富文本、岗位选择联动标签、等级选择、悬赏积分）
  - 问题详情页（问题描述、回答列表、投票、采纳、评论）
  - 首页集成（问题列表、分页、热门标签）

### 遇到的报错
- **报错信息**：`npm E404 Not Found - @kingdee-design/kdesign`
- **原因分析**：KDesign的npm包名不是 `@kingdee-design/kdesign`
- **解决方案**：正确包名为 `@kdcloudjs/kdesign`，安装成功

- **报错信息**：winget安装JDK失败 `InternetReadFile() failed. 0x80072ee2`
- **原因分析**：网络连接问题导致下载中断
- **解决方案**：提供直接下载链接，由用户手动安装

- **报错信息**：shell环境下 `ls`、`npm` 命令执行失败 (exit code 127)
- **原因分析**：Windows环境下bash工具链不完整，`npm`内部依赖bash
- **解决方案**：使用 `cmd //c` 前缀运行Windows命令

### 代码修改记录
- **修改文件**：frontend/package.json
- **修改原因**：添加核心依赖
- **修改内容**：安装 react-router-dom, zustand, axios, @kdcloudjs/kdesign

- **修改文件**：frontend/vite.config.ts
- **修改原因**：添加开发服务器代理配置
- **修改内容**：配置 `/api` 代理到 `http://localhost:8080`

- **修改文件**：frontend/src/main.tsx
- **修改原因**：引入KDesign样式
- **修改内容**：添加 `import '@kdcloudjs/kdesign/dist/kdesign.css'`

- **修改文件**：frontend/src/App.css
- **修改原因**：替换Vite默认样式为项目全局样式
- **修改内容**：全局reset样式

### 待办事项
- [ ] JDK安装后验证后端编译
- [ ] MySQL数据库创建和初始化
- [ ] 前后端联调测试
- [ ] Day 2：积分引擎 + 排行榜 + 搜索 + 通知 + 管理后台 + AI功能

---

## [2026-03-30] Day 3：前端布局重构（匹配设计稿）

### 完成内容

#### 3.1 布局重构
- **移除 Sidebar**，改为 Header 下方 Nav Tabs（广场首页/研发/产品运营/测试）
- **Layout 组件**：全宽主内容区 + `<Outlet />`
- **Header 组件**：
  - Logo + 搜索框 + 排行榜/标签按钮 + 头像下拉菜单
  - 头像点击弹出下拉菜单：每日签到、个人主页、个人资料、积分明细、退出登录
  - 登录/注册页不显示 Header

#### 3.2 首页重构
- 双栏布局：左侧问题列表 + 右侧边栏（欢迎卡片、热门标签、数据统计）
- 排序按钮：最新/最热/待解决
- 移除 JobRoleTab 组件，改为顶部 Nav Tabs 切换

#### 3.3 新增页面
- **JobZone 页面** (`/rd`, `/pm-ops`, `/qa`)：岗位专区问题列表 + 侧边栏
- **Ranking 页面**：Top 3 领奖台 + 卡片式排行榜

#### 3.4 个人中心重构
- **UserHome 页面**：头像 + 用户名 + 徽章 + 等级进度 + 4个统计卡片
  - 3 个 Tab：发布的问题、回答的问题、积分记录
- **Profile 页面**：邮箱/手机/部门/简介表单，PUT 保存
- **路由调整**：默认个人主页，点击进入个人资料编辑

### 代码修改记录
- **Layout/index.tsx**：移除 Sidebar，添加 Footer，全宽内容区
- **Header.tsx**：重写，Nav Tabs + 头像下拉菜单
- **Home/index.tsx**：双栏布局 + 排序按钮
- **App.tsx**：新增 JobZone、Ranking 路由

---

## [2026-03-31] Day 4：个人主页功能完善 + API 补全

### 完成内容

#### 4.1 后端 API 新增
- **UserController** 新增 3 个端点：
  - `GET /api/users/{id}/answers` — 获取用户回答列表
  - `GET /api/users/{id}/point-records` — 获取用户积分记录
  - `PUT /api/users/me` — 更新当前用户信息（从 token 获取 userId）
- **AnswerService** — `toDTO()` 从 private 改为 public，新增 `getAnswersByUserId(Long userId)` 方法
- **SecurityConfig** — 新增 permitAll 规则：
  - `GET /api/users/{id}/answers`
  - `GET /api/users/{id}/point-records`

#### 4.2 前端修复
- **Header.tsx** — "个人主页"导航增加 fallback：user.id 为 undefined 时先调 `/users/me` 获取
- **UserHome.tsx** —
  - 接入回答列表 API，"回答的问题" Tab 展示真实数据（回答预览、采纳标记、投票数）
  - 积分明细 Tab 对接 `/users/{id}/point-records`
  - 增加错误日志输出 + id !== 'undefined' 防护

### 遇到的问题
- **问题**：个人资料页保存 404
  - **原因**：前端 PUT `/users/me`，后端只有 `PUT /{id}`
  - **解决**：后端新增 `PUT /me` 端点

- **问题**：积分明细不显示
  - **原因**：后端 PointController 路径为 `/users/me/points`（需认证），前端请求 `/users/{id}/point-records`（路径不匹配）
  - **解决**：在 UserController 新增 `GET /{id}/point-records`

- **问题**：回答列表不显示
  - **原因**：后端没有 `/users/{id}/answers` 端点
  - **解决**：在 UserController 新增，复用 AnswerService

### 待办事项
- [ ] 排行榜 API 完善
- [ ] 搜索功能
- [ ] 签到功能完善
- [ ] 通知功能
- [ ] Markdown 编辑器替换
