# AI广场 开发计划

> 创建时间：2026年3月28日 | 模式：AI辅助开发

---

## 开发规则

1. **写项目日志**：每完成一个模块/功能，在 `docs/dev-log.md` 中记录开发日志
2. **记录报错**：开发过程中遇到的所有报错（编译错误、运行时异常、联调失败等）必须记录到日志
3. **记录修改**：每次对代码的修改（含原因、修改内容、修改前后对比）必须记录到日志
4. **日志格式**：
   ```markdown
   ## [时间] 模块名称

   ### 完成内容
   - xxx

   ### 遇到的报错
   - **报错信息**：xxx
   - **原因分析**：xxx
   - **解决方案**：xxx

   ### 代码修改记录
   - **修改文件**：xxx
   - **修改原因**：xxx
   - **修改内容**：xxx
   ```

---

## 总览

| 阶段 | 名称 | 核心目标 | 工期 |
|------|------|---------|------|
| **Day 1 上午** | 基础设施 + 用户模块 | 项目骨架、数据库、注册登录、岗位方向 | 3h |
| **Day 1 下午** | 问题广场 + 岗位专区 | 问题CRUD、三大岗位专区、标签系统 | 4h |
| **Day 2 上午** | 互动 + 积分 + 排行 | 回答评论、积分引擎、排行榜、悬赏、等级徽章 | 4h |
| **Day 2 下午** | 搜索 + 通知 + 管理后台 + 高级功能 | 搜索、附件、通知、管理后台、AI推荐、学习路径 | 4h |

---

## Day 1 上午（3h）：基础设施 + 用户模块

### 1.1 项目初始化（30min）

| 任务 | 说明 |
|------|------|
| 前端脚手架 | React 18 + Vite + TS + KDesign + React Router + Zustand |
| 后端脚手架 | Spring Boot 3 / Go，分层架构初始化 |
| 目录结构 | 按规划方案创建完整目录 |
| 接口规范 | RESTful、统一响应格式、错误码 |

### 1.2 数据库设计（30min）

| 任务 | 说明 |
|------|------|
| MySQL建表 | MySQL 9.3.0，user（含job_role）、question、answer、comment、tag、question_tag、vote、point_record、badge、user_badge、attachment、notification、sign_in、job_role_config |
| 初始数据 | 三大岗位配置、岗位专属标签、等级称谓、初始徽章 |
| Redis | 排行榜Sorted Set结构、Session存储 |

### 1.3 用户模块（2h）

**前端：**
- Layout全局布局（Header + Sidebar + Content）
- JobRoleTab岗位切换组件
- /register 注册页（含岗位方向选择）
- /login 登录页
- /user/profile 个人中心

**后端：**
- POST /api/auth/register（含岗位方向）
- POST /api/auth/login（JWT）
- GET/PUT /api/users/:id
- PUT /api/users/:id/job-role
- GET /api/job-roles
- GET /api/job-roles/:key/tags

**交付物：**
- [x] 前后端项目可运行
- [x] 数据库全部表+初始数据
- [x] 用户注册登录（含岗位方向选择）联调通过

---

## Day 1 下午（4h）：问题广场 + 岗位专区

### 1.4 问题模块（2h）

**前端：**
- QuestionCard问题卡片组件（含岗位标识、标签、状态）
- /question/create 问题发布页（富文本编辑器 + 岗位选择联动标签）
- /question/:id 问题详情页
- /（广场首页：岗位Tab + 问题列表 + 分页）

**后端：**
- POST /api/questions（含job_role）
- GET /api/questions（分页 + 岗位筛选 + 排序）
- GET /api/questions/:id
- PUT/DELETE /api/questions/:id
- GET /api/tags?job_role=（按岗位筛选标签）
- GET /api/tags/:name/questions

### 1.5 岗位专区 + 标签页（2h）

**前端：**
- /rd 研发专区（研发岗位问题流 + 专属标签）
- /pm-ops 产品运营专区
- /qa 测试专区
- /tags 标签页（按岗位分组标签云）
- /tag/:name 标签详情页

**后端：**
- GET /api/job-roles/:key/stats（岗位统计）
- 预置各岗位标签数据（研发/AI开发/代码生成...，产品运营/AIGC/数据分析...，测试/智能测试/自动化...）

**交付物：**
- [x] 问题发布/浏览/详情（按岗位分类）
- [x] 三大岗位专区页面
- [x] 岗位分组标签系统
- [x] 广场首页 + 岗位筛选联调通过

---

## Day 2 上午（4h）：互动 + 积分 + 排行 + 游戏化

### 2.1 回答评论投票（1.5h）

**前端：**
- AnswerItem回答组件（Markdown + 代码高亮）
- VoteButton投票组件
- 评论区（Comment列表 + 发表）
- 采纳最佳答案操作
- 回答编辑器（Markdown + 附件拖拽）

**后端：**
- POST /api/questions/:id/answers
- PUT /api/answers/:id/accept
- GET/POST /api/comments
- POST /api/votes

### 2.2 积分引擎（1h）

**后端核心逻辑：**
- 积分规则引擎（发布+2、回答+5、采纳+15、被赞+10...）
- 跨岗位检测 + 额外积分（+3）
- 积分记录 point_record
- GET /api/points/records（积分明细）
- GET /api/points/rules（积分规则查询）

### 2.3 排行榜（0.5h）

**后端：**
- Redis Sorted Set 维护：积分总榜、岗位积分榜（rd/pm_ops/qa各一份）
- GET /api/rankings/points（总榜）
- GET /api/rankings/points/:job_role（岗位榜）
- GET /api/rankings/questions（问题发布榜）
- GET /api/rankings/answers（解决问题榜）
- GET /api/rankings/cross-role（跨岗位贡献榜）

**前端：**
- /ranking 排行榜页（总榜 + 岗位榜Tab切换 + 周/月/总时间维度）
- /user/:id 用户主页（岗位方向、等级、问题/回答列表）
- /user/points 积分明细页

### 2.4 悬赏 + 等级徽章 + 签到（1h）

**前端：**
- 问题发布页增加悬赏积分设置
- 用户等级展示（岗位专属称谓 + 等级图标）
- 徽章展示（用户名片）
- 签到弹窗 + 连续天数

**后端：**
- 悬赏逻辑（积分扣除 + 悬赏发放）
- 等级计算引擎（积分→等级 + 岗位称谓映射）
- 徽章条件判断 + 自动颁发
- POST /api/users/sign-in（签到）
- 连续签到天数计算

**交付物：**
- [x] 回答、评论、投票、采纳
- [x] 积分引擎（含跨岗位加成）
- [x] 排行榜（总榜 + 岗位榜）
- [x] 悬赏提问机制
- [x] 岗位专属等级体系与徽章
- [x] 签到系统

---

## Day 2 下午（4h）：搜索 + 通知 + 管理后台 + 高级功能

### 2.5 搜索 + 附件（1h）

**前端：**
- /search 搜索页（全文搜索 + 岗位筛选 + 标签筛选）
- 附件上传组件（拖拽上传）

**后端：**
- Elasticsearch集成（问题/回答索引 + 全文搜索）
- GET /api/search?q=&tag=&level=&job_role=
- MinIO文件上传/下载接口

### 2.6 通知系统（0.5h）

**前端：**
- 顶部通知铃铛 + 通知列表

**后端：**
- 事件触发通知（被回答、被采纳、被点赞等）
- GET /api/notifications（通知列表）
- PUT /api/notifications/:id/read（标记已读）

### 2.7 管理后台（1h）

**前端：**
- /admin 数据看板（用户增长 + 问题趋势 + 岗位维度统计图表）
- /admin/users 用户管理（岗位方向、角色、禁用）
- /admin/questions 问题管理（审核、状态）
- /admin/tags 标签管理（按岗位分组CRUD）
- /admin/roles 岗位管理（岗位配置、等级称谓）
- /admin/points 积分配置（规则可视化配置）

**后端：**
- 管理员鉴权中间件
- GET /api/admin/stats（含岗位维度）
- GET /api/admin/stats/:job_role
- 用户管理、问题审核、标签管理、岗位管理、积分配置全套CRUD

### 2.8 高级功能（1.5h）

| 任务 | 说明 |
|------|------|
| AI智能推荐 | 基于岗位方向 + 标签偏好推荐相关问题 |
| AI辅助回答 | 接入LLM提供回答建议 |
| 智能标签推荐 | 发布问题时AI推荐标签 |
| 岗位学习路径 | 按研发/产品运营/测试展示学习路线 |
| 跨岗位协作专区 | 跨岗位问题展示与协作 |
| 团队/部门PK | 部门积分PK（可按岗位维度） |
| 数据分析报表 | 用户增长、问题趋势、岗位活跃度图表 |

**交付物：**
- [x] 全文搜索（Elasticsearch，支持岗位筛选）
- [x] 文件附件上传
- [x] 通知系统
- [x] 管理后台（岗位维度管理）
- [x] AI智能推荐
- [x] AI辅助回答
- [x] 岗位学习路径
- [x] 跨岗位协作专区
- [x] 团队/部门PK
- [x] 数据分析与报表

---

## 关键里程碑

| 里程碑 | 时间节点 | 交付内容 |
|--------|---------|---------|
| **M1 基础+用户** | Day 1 中午 | 项目骨架 + 数据库 + 注册登录（含岗位方向） |
| **M2 核心可用** | Day 1 下班 | 问题广场 + 三大岗位专区 + 标签系统 |
| **M3 游戏化完善** | Day 2 中午 | 积分 + 排行 + 悬赏 + 等级徽章 + 签到 |
| **M4 全功能上线** | Day 2 下班 | 搜索 + 通知 + 管理后台 + AI功能 + 全部功能就绪 |

---

## 风险项与应对

| 风险 | 影响 | 应对方案 |
|------|------|---------|
| 后端技术栈未确定 | 影响开发启动 | 开发前确认，建议Spring Boot（企业级成熟） |
| Elasticsearch环境 | 搜索功能依赖 | 准备Docker快速部署，备选MySQL LIKE方案 |
| MinIO环境 | 附件功能依赖 | Docker一键部署 |
| AI接口依赖 | 高级功能受限 | 先用Mock实现，后续对接实际LLM |
| 前后端联调 | 进度卡点 | 接口先行定义，前端Mock数据并行开发 |
