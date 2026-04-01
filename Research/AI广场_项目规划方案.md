# AI广场 项目规划方案

## 项目背景

ERP行业面临AI产业转型，目前国产ERP市场占有率达68%，AI在ERP领域应用率突破38%。然而：
- **市场空白**：没有专门面向ERP行业的AI学习/交流平台
- **人才缺口**：既懂ERP又懂AI的复合型人才稀缺
- **知识分散**：ERP行业AI知识散落各平台，缺乏系统性整合
- **落地困难**：68%的AI项目因技术适配问题延期
- **岗位差异**：研发、产品运营、测试三大岗位的AI应用场景和技能需求差异显著，缺乏针对性指导

AI广场旨在打造一个ERP行业专属的AI知识分享社区，按**研发岗位、产品和运营岗位、测试岗位**三大方向分类，通过问答、讨论、积分激励等机制，营造全员学习AI的氛围，加速企业人员AI转型。

---

## 一、技术架构

### 1.1 整体架构

```
┌──────────────────────────────────────────────────┐
│                  前端 (React + KDesign)            │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐ │
│  │ 广场  │ │问题详情│ │用户中心│ │排行榜│ │岗位专区│ │
│  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └───┬────┘ │
└─────┼────────┼────────┼────────┼──────────┼──────┘
      │        │        │        │          │
      ▼        ▼        ▼        ▼          ▼
┌──────────────────────────────────────────────────┐
│               API Gateway (Nginx)                 │
└────────────────────────┬─────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────┐
│           后端服务 (Spring Boot / Go)              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌───────┐ │
│  │用户服务│ │问题服务│ │积分服务│ │排行服务│ │岗位服务│ │
│  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬────┘ │
└─────┼────────┼────────┼────────┼──────────┼──────┘
      │        │        │        │          │
      ▼        ▼        ▼        ▼          ▼
┌─────────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ MySQL   │ │Redis │ │Elastic│ │MinIO │
│ 主数据库 │ │缓存/排行│ │搜索   │ │文件存储│
└─────────┘ └──────┘ └──────┘ └──────┘
```

### 1.2 技术选型

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | React 18 + TypeScript | 企业级前端方案 |
| UI组件库 | **KDesign (金蝶)** | 企业级B2B组件，符合项目要求 |
| 状态管理 | Zustand | 轻量级状态管理 |
| 路由 | React Router v6 | SPA路由 |
| 构建工具 | Vite | 快速开发构建 |
| 后端框架 | Spring Boot 3 (Java 17) / Go | 待确认 |
| 数据库 | MySQL 9.3.0 | 核心业务数据 |
| 缓存 | Redis 7 | 排行榜、会话、热点数据 |
| 搜索引擎 | Elasticsearch 8 | 全文搜索 |
| 文件存储 | MinIO | 附件、文件存储 |
| API规范 | RESTful API | 前后端通信 |

---

## 二、岗位体系设计

### 2.1 三大岗位分类

| 岗位方向 | 英文标识 | 适用人群 | AI学习侧重点 |
|---------|---------|---------|-------------|
| **研发岗位** | `rd` | 后端开发、前端开发、架构师、DBA等 | AI编程辅助、模型集成、RAG/Agent开发、代码生成与审查 |
| **产品和运营岗位** | `pm_ops` | 产品经理、运营、项目管理、业务顾问等 | AI产品思维、需求分析、数据分析、AIGC内容生成 |
| **测试岗位** | `qa` | 测试工程师、自动化测试、质量保障等 | AI辅助测试、自动化用例生成、智能回归测试 |

### 2.2 各岗位问题分类体系

#### 研发岗位（RD）

| 分类维度 | 标签示例 |
|---------|---------|
| **AI开发** | 提示工程、RAG、AI Agent、工作流编排、模型微调、API集成 |
| **开发工具** | Copilot、Cursor、ChatGPT API、Claude Code、Dify、FastGPT |
| **应用场景** | 代码生成与审查、智能调试、自动化部署、技术架构设计、性能优化 |
| **ERP集成** | ERP-AI接口开发、数据管道、智能报表开发、插件开发 |

#### 产品和运营岗位（PM & OPS）

| 分类维度 | 标签示例 |
|---------|---------|
| **AI产品** | AI产品思维、AI需求分析、AI交互设计、用户研究、竞品分析 |
| **内容运营** | AIGC文案、AI辅助设计、营销自动化、智能客服、社群运营 |
| **数据分析** | AI数据分析、智能报表、数据可视化、趋势预测、用户画像 |
| **项目管理** | AI项目管理、敏捷+AI、需求文档生成、流程自动化 |

#### 测试岗位（QA）

| 分类维度 | 标签示例 |
|---------|---------|
| **AI测试技术** | AI辅助测试用例设计、智能回归测试、AI Bug预测、测试数据生成 |
| **自动化工具** | AI自动化脚本、智能断言、UI自动化AI、接口测试AI |
| **质量保障** | AI质量评估、性能测试AI、安全测试AI、代码覆盖率优化 |
| **测试管理** | 测试计划AI生成、缺陷分析AI、测试报告自动生成 |

### 2.3 岗位等级体系

每个岗位方向有独立的等级称谓，增强岗位归属感：

| 等级 | 研发岗位 | 产品运营岗位 | 测试岗位 | 积分要求 |
|-----|---------|------------|---------|---------|
| Lv1 | AI开发新手 | AI产品新人 | AI测试入门 | 0-99 |
| Lv2 | AI代码学徒 | AI运营学徒 | AI质检学徒 | 100-499 |
| Lv3 | AI开发达人 | AI产品达人 | AI测试达人 | 500-999 |
| Lv4 | AI架构师 | AI运营专家 | AI质量专家 | 1000-2499 |
| Lv5 | AI技术专家 | AI产品专家 | AI测试架构师 | 2500-4999 |
| Lv6 | AI技术领袖 | AI业务领袖 | AI质量领袖 | 5000-9999 |
| Lv7 | AI首席架构 | AI产品总监 | AI质量总监 | 10000-19999 |
| Lv8 | AI技术传奇 | AI产品传奇 | AI质量传奇 | 20000+ |

---

## 三、功能模块设计

### 3.1 用户管理模块

**核心功能：**
- 注册/登录（企业账号集成）
- 个人信息管理（头像、简介、部门、岗位方向）
- **岗位方向选择**：注册时必选三大岗位之一（研发/产品运营/测试），可多选
- 角色：普通用户、专家用户、管理员
- AI技能标签（根据岗位方向推荐不同标签集）

**关键页面：**
- 登录/注册页（含岗位方向选择）
- 个人中心页（个人信息、我的问题、我的回答、积分记录、岗位等级）
- 用户名片（公开展示，突出岗位方向和等级）

**数据模型：**
```
User: id, username, avatar, email, phone, department,
      job_role (rd/pm_ops/qa), role, level, points,
      skill_tags[], created_at, updated_at
```

### 3.2 问题广场模块

**核心功能：**
- 问题发布（富文本编辑、**岗位方向选择**、标签、等级选择、悬赏积分）
- 问题浏览（按岗位方向筛选、列表、排序、分页）
- 问题搜索（全文检索、岗位筛选、标签筛选）
- 标签系统（按岗位方向分组管理）
- 问题状态流转（待回答→已回答→已解决→已关闭）

**岗位专区入口：**
- `/rd` — 研发专区首页
- `/pm-ops` — 产品运营专区首页
- `/qa` — 测试专区首页
- `/` — 全部岗位混合广场

**关键页面：**
- 广场首页（岗位Tab切换、问题流、热门标签、推荐问题）
- 岗位专区页（专属标签、岗位相关推荐）
- 问题发布页（岗位方向联动标签）
- 问题详情页（问题描述、回答列表、评论区、岗位标识）
- 标签页（按岗位分组展示标签云）

**数据模型：**
```
Question: id, user_id, title, content, job_role (rd/pm_ops/qa),
          tags[], level, status, bounty_points,
          view_count, answer_count, vote_count,
          created_at, updated_at, solved_at
Tag: id, name, description, question_count, category, job_role
```

### 3.3 讨论与解决方案模块

**核心功能：**
- 回答问题（富文本、代码块、附件上传）
- 评论（对问题或回答进行评论）
- 投票（赞/踩）
- 采纳最佳答案
- 解决方案类型标记（Skill方案/项目文件/可行性方案/经验分享）

**关键页面：**
- 回答编辑器（支持Markdown、代码高亮、附件拖拽）
- 解决方案展示区
- 评论列表

**数据模型：**
```
Answer: id, question_id, user_id, content, solution_type,
        vote_count, is_accepted, attachments[], created_at
Comment: id, target_id, target_type, user_id, content, created_at
Vote: id, user_id, target_id, target_type, vote_type, created_at
```

### 3.4 积分系统模块

**积分获取规则：**

| 行为 | 积分 | 说明 |
|------|------|------|
| 发布问题 | +2 | 鼓励提问 |
| 问题被点赞 | +10 | 高质量问题 |
| 回答问题 | +5 | 积极参与 |
| 回答被点赞 | +10 | 高质量回答 |
| 回答被采纳 | +15 | 最佳答案奖励 |
| 采纳他人回答 | +2 | 问题闭环 |
| 跨岗位回答 | +8（额外+3） | 鼓励跨岗位交流 |
| 连续签到 | +1~5 | 递增激励 |
| 邀请同事 | +20 | 社区扩展 |

**积分消耗规则：**

| 行为 | 积分 | 说明 |
|------|------|------|
| 悬赏提问 | -50~500 | 吸引高质量回答 |
| 内容被踩 | -2 | 质量控制 |

**问题等级与积分：**

| 等级 | 额外积分 | 推荐悬赏 |
|------|---------|---------|
| 简单 | +5 | 0-20 |
| 中等 | +10 | 20-50 |
| 困难 | +20 | 50-100 |
| 专家级 | +50 | 100-500 |

### 3.5 排行榜模块

**排行榜维度：**

| 类型 | 统计方式 | 更新频率 |
|------|---------|---------|
| 积分总榜 | 累计积分 | 实时 |
| **研发岗位榜** | 研发人员积分排行 | 每日 |
| **产品运营岗位榜** | 产品运营人员积分排行 | 每日 |
| **测试岗位榜** | 测试人员积分排行 | 每日 |
| 问题发布榜 | 问题数×质量分 | 每日 |
| 问题解决榜 | 采纳回答数 | 每日 |
| 活跃度榜 | 综合活跃行为 | 每日 |
| **跨岗位贡献榜** | 跨岗位回答采纳数 | 每周 |

**时间维度：** 周榜 / 月榜 / 总榜

**实现方案：** Redis Sorted Set（按岗位分组维护独立排行榜）

### 3.6 管理后台模块

**核心功能：**
- 用户管理（列表、角色分配、岗位方向调整、禁用）
- 问题审核（违规内容处理）
- 标签管理（按岗位分组管理）
- 岗位管理（岗位方向配置、岗位标签维护）
- 积分规则配置
- 数据统计看板（用户增长、问题趋势、活跃度、**岗位维度统计**）

---

## 四、数据库表设计

### 核心表

| 表名 | 说明 | 主要字段 |
|------|------|---------|
| `user` | 用户表 | id, username, password_hash, avatar, email, phone, department, **job_role**(rd/pm_ops/qa), role, level, points, status |
| `question` | 问题表 | id, user_id, title, content, **job_role**, level, status, bounty_points, view_count, answer_count, vote_count, solved_answer_id |
| `answer` | 回答表 | id, question_id, user_id, content, solution_type, vote_count, is_accepted |
| `comment` | 评论表 | id, target_id, target_type(question/answer), user_id, content |
| `tag` | 标签表 | id, name, description, category, **job_role**, question_count |
| `question_tag` | 问题标签关联 | question_id, tag_id |
| `vote` | 投票表 | id, user_id, target_id, target_type, vote_type(up/down) |
| `point_record` | 积分记录 | id, user_id, action_type, points, balance, target_id, target_type, **is_cross_role**(是否跨岗位) |
| `badge` | 徽章表 | id, name, icon, description, condition, **job_role** |
| `user_badge` | 用户徽章 | user_id, badge_id, earned_at |
| `attachment` | 附件表 | id, target_id, target_type, file_name, file_path, file_size, file_type |
| `notification` | 通知表 | id, user_id, type, title, content, is_read |
| `sign_in` | 签到表 | id, user_id, sign_date, continuous_days |
| `job_role_config` | 岗位配置表 | id, role_key, role_name, description, tags[], level_names[] |

---

## 五、前端页面清单

| 路由 | 页面名称 | 说明 |
|------|---------|------|
| `/` | 广场首页 | 全部岗位问题流、岗位Tab切换、热门标签 |
| `/rd` | 研发专区 | 研发岗位问题、标签、推荐 |
| `/pm-ops` | 产品运营专区 | 产品运营岗位问题、标签、推荐 |
| `/qa` | 测试专区 | 测试岗位问题、标签、推荐 |
| `/login` | 登录页 | 用户登录 |
| `/register` | 注册页 | 用户注册（含岗位方向选择） |
| `/question/create` | 发布问题 | 富文本编辑器、岗位方向联动标签 |
| `/question/:id` | 问题详情 | 问题内容、回答、评论、岗位标识 |
| `/tags` | 标签页 | 按岗位分组标签云 |
| `/tag/:name` | 标签详情 | 标签下的问题列表 |
| `/user/:id` | 用户主页 | 个人信息、岗位方向、问题、回答 |
| `/user/profile` | 个人中心 | 编辑个人信息、岗位方向 |
| `/user/points` | 积分明细 | 积分获取/消耗记录 |
| `/ranking` | 排行榜 | 总排行 + 岗位排行 + 跨岗位贡献榜 |
| `/search` | 搜索结果 | 全文搜索、岗位筛选 |
| `/admin` | 管理后台首页 | 数据看板、岗位维度统计 |
| `/admin/users` | 用户管理 | 用户列表、岗位方向、角色管理 |
| `/admin/questions` | 问题管理 | 问题审核 |
| `/admin/tags` | 标签管理 | 按岗位分组管理标签 |
| `/admin/roles` | 岗位管理 | 岗位方向配置 |
| `/admin/points` | 积分配置 | 积分规则设置 |

---

## 六、核心API接口

### 用户模块
- `POST /api/auth/register` - 注册（含岗位方向）
- `POST /api/auth/login` - 登录
- `GET /api/users/:id` - 获取用户信息
- `PUT /api/users/:id` - 更新用户信息
- `PUT /api/users/:id/job-role` - 变更岗位方向
- `POST /api/users/sign-in` - 签到

### 问题模块
- `GET /api/questions` - 问题列表（分页、筛选、排序、**岗位筛选**）
- `POST /api/questions` - 发布问题（含岗位方向）
- `GET /api/questions/:id` - 问题详情
- `PUT /api/questions/:id` - 编辑问题
- `DELETE /api/questions/:id` - 删除问题

### 回答模块
- `GET /api/questions/:id/answers` - 回答列表
- `POST /api/questions/:id/answers` - 发布回答
- `PUT /api/answers/:id/accept` - 采纳回答

### 评论模块
- `GET /api/comments?target_id=&target_type=` - 评论列表
- `POST /api/comments` - 发表评论

### 投票模块
- `POST /api/votes` - 投票（赞/踩）

### 标签模块
- `GET /api/tags` - 标签列表（支持按岗位筛选）
- `GET /api/tags/:name/questions` - 标签下的问题

### 岗位模块
- `GET /api/job-roles` - 岗位方向列表
- `GET /api/job-roles/:key/tags` - 岗位下标签
- `GET /api/job-roles/:key/stats` - 岗位统计

### 积分模块
- `GET /api/points/records` - 积分明细
- `GET /api/points/rules` - 积分规则

### 排行模块
- `GET /api/rankings/points` - 积分排行
- `GET /api/rankings/points/:job_role` - 岗位积分排行
- `GET /api/rankings/questions` - 问题发布排行
- `GET /api/rankings/answers` - 解决问题排行
- `GET /api/rankings/cross-role` - 跨岗位贡献排行

### 搜索模块
- `GET /api/search?q=&tag=&level=&job_role=` - 全文搜索（含岗位筛选）

### 后台管理
- `GET /api/admin/users` - 用户列表
- `PUT /api/admin/users/:id/role` - 角色分配
- `PUT /api/admin/users/:id/job-role` - 岗位调整
- `GET /api/admin/stats` - 数据统计（含岗位维度）
- `GET /api/admin/stats/:job_role` - 岗位数据统计

---

## 七、项目目录结构

```
AI_Space/
├── Research/                    # 调研文档
│   ├── 01_知识问答社区平台调研.md
│   ├── 02_积分系统与游戏化设计调研.md
│   └── 03_ERP行业AI转型趋势调研.md
├── docs/                        # 项目文档
│   ├── PRD_产品需求文档.md
│   ├── API_接口文档.md
│   └── DB_数据库设计文档.md
├── frontend/                    # 前端项目
│   ├── src/
│   │   ├── components/          # 公共组件
│   │   │   ├── Layout/          # 布局组件
│   │   │   ├── QuestionCard/    # 问题卡片
│   │   │   ├── AnswerItem/      # 回答项
│   │   │   ├── TagList/         # 标签列表
│   │   │   ├── VoteButton/      # 投票按钮
│   │   │   ├── RichEditor/      # 富文本编辑器
│   │   │   ├── UserCard/        # 用户卡片
│   │   │   └── JobRoleTab/      # 岗位Tab切换组件
│   │   ├── pages/               # 页面
│   │   │   ├── Home/            # 广场首页（全部岗位）
│   │   │   ├── JobZone/         # 岗位专区（研发/产品运营/测试）
│   │   │   ├── Login/           # 登录注册
│   │   │   ├── Question/        # 问题相关
│   │   │   ├── User/            # 用户中心
│   │   │   ├── Ranking/         # 排行榜（含岗位排行）
│   │   │   ├── Search/          # 搜索
│   │   │   ├── Tags/            # 标签（按岗位分组）
│   │   │   └── Admin/           # 管理后台
│   │   ├── stores/              # 状态管理
│   │   ├── services/            # API服务
│   │   ├── hooks/               # 自定义Hooks
│   │   ├── utils/               # 工具函数
│   │   ├── constants/           # 常量（岗位配置、等级配置等）
│   │   ├── types/               # TypeScript类型
│   │   └── styles/              # 全局样式
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
└── backend/                     # 后端项目（待确认技术栈）
```

---

## 八、分期规划

### 第一期 MVP（核心功能）
- [ ] 用户注册/登录（含岗位方向选择）
- [ ] 问题发布/浏览/详情（按岗位分类）
- [ ] 岗位专区页面（研发/产品运营/测试三大专区）
- [ ] 回答与评论
- [ ] 按岗位分组的标签系统
- [ ] 简单积分规则
- [ ] 基础排行榜（含岗位排行）
- [ ] 个人中心

### 第二期（完善功能）
- [ ] 悬赏提问机制
- [ ] 岗位专属等级体系与徽章
- [ ] 跨岗位回答积分加成
- [ ] 签到系统
- [ ] 全文搜索（Elasticsearch，支持岗位筛选）
- [ ] 文件附件上传
- [ ] 通知系统
- [ ] 管理后台（岗位维度管理）

### 第三期（高级功能）
- [ ] AI智能推荐（按岗位偏好推荐问题）
- [ ] AI辅助回答生成
- [ ] 岗位学习路径推荐
- [ ] 团队/部门PK（可按岗位维度对比）
- [ ] 跨岗位协作专区（鼓励跨岗位交流）
- [ ] 数据分析与报表（岗位维度分析）
- [ ] 移动端适配
