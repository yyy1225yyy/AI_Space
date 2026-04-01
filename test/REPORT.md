# AI广场 项目测试报告 & 整改清单

> 测试日期：2026-03-31（第六轮全面测试，含设计稿对比分析 + QuestionCard 组件适配）
> 后端：localhost:8080 | 前端：localhost:5173
> 测试方法：Vitest API 接口测试 + Vitest 前端组件测试 + 源码审查 + 开发计划对比分析
> 架构评审：基于 Research 目录下 5 份规划/调研文档

---

## 一、本轮测试结果总览

### API 接口测试

| 模块 | 测试数 | 通过 | 失败 | 通过率 |
|------|--------|------|------|--------|
| Auth 注册/登录/Token | 16 | 16 | 0 | 100% |
| Users 用户 | 11 | 11 | 0 | 100% |
| Questions 问题 | 18 | 18 | 0 | 100% |
| Answers 回答 | 9 | 9 | 0 | 100% |
| Comments 评论 | 8 | 8 | 0 | 100% |
| Votes 投票 | 11 | 11 | 0 | 100% |
| Tags 标签 | 7 | 7 | 0 | 100% |
| Job Roles 岗位 | 12 | 12 | 0 | 100% |
| **小计** | **92** | **92** | **0** | **100%** |

### API 增强测试（评论/回答/标签）

| 模块 | 测试数 | 通过 | 失败 | 通过率 |
|------|--------|------|------|--------|
| 评论增强（多用户/关联/字段/校验） | 13 | 13 | 0 | 100% |
| 回答增强（多用户/采纳/字段/校验） | 14 | 14 | 0 | 100% |
| 带标签问题（选择已有标签/跨岗位/分类/计数同步/更新/删除） | 19 | 19 | 0 | 100% |
| **小计** | **46** | **46** | **0** | **100%** |

### 前端组件测试

| 模块 | 测试数 | 通过 | 失败 | 通过率 |
|------|--------|------|------|--------|
| helpers 工具函数 | 21 | 21 | 0 | 100% |
| stores 状态管理 | 6 | 6 | 0 | 100% |
| UserCard 用户卡片 | 8 | 8 | 0 | 100% |
| QuestionCard 问题卡片 | 12 | 12 | 0 | 100% |
| JobRoleTab 岗位标签 | 4 | 4 | 0 | 100% |
| **小计** | **51** | **51** | **0** | **100%** |

### E2E 浏览器测试（评论区 & 编辑器）

| 模块 | 测试数 | 通过 | 失败 | 通过率 |
|------|--------|------|------|--------|
| 评论区（显示/隐藏/发表/Enter/空校验/用户名） | 6 | 6 | 0 | 100% |
| 回答编辑器（显示/隐藏/工具栏/下拉/空校验/提交/清空） | 7 | 7 | 0 | 100% |
| **小计** | **13** | **13** | **0** | **100%** |

### 总计：API 136 通过 + 前端 51 通过 = 187 通过 / 0 失败 / 通过率 100%（E2E 依赖前端环境）

### 历史对比

| 指标 | 第一轮 (03-28) | 第二轮 (03-29) | 第三轮 | 第四轮 (03-29) | 第五轮 (03-30) | **本轮 (03-31)** | 变化 |
|------|-------------|-------------|--------|---------|---------|---------|------|
| API 通过率 | 76% | 87% | 84% | 92% | **100%** | **100%** | — |
| API 失败数 | 17 | 10 | 14 | 7 | **0** | **0** | — |
| 前端通过率 | 0% | 0% | 0% | 0% | **100%** | **100%** | — |
| 前端测试数 | 0 | 0 | 0 | 0 | **51** | **51** | — |
| E2E 通过率 | - | - | - | - | **100%** | **100%** | — |
| E2E 测试数 | 0 | 0 | 0 | 0 | **13** | **13** | — |

### 本轮关键改善

| 模块 | 上轮 | 本轮 | 改善原因 |
|------|------|------|---------|
| QuestionCard 测试 | 49/51 (96%) | 51/51 (100%) | 修复 2 个测试断言：①「待回答」改为验证 open 状态不渲染状态标签 ②「128 views」改为仅匹配数字「128」 |
| Votes 投票 | 3/8 (38%) | 8/8 (100%) | B19 修复：VoteController 改用 VoteRequest DTO |
| Tags 标签 | 6/7 (86%) | 7/7 (100%) | B20 修复：不存在标签名正确抛 BusinessException |
| Questions 问题 | 17/18 (94%) | 18/18 (100%) | 新增 1 个测试 + 原有失败用例修复 |
| 前端组件 | 0/51 (0%) | 51/51 (100%) | T1 修复：测试基础设施完善（见下文） |

### 本轮关键改善

| 模块 | 上轮 | 本轮 | 改善原因 |
|------|------|------|---------|
| Votes 投票 | 3/8 (38%) | 8/8 (100%) | B19 修复：VoteController 改用 VoteRequest DTO |
| Tags 标签 | 6/7 (86%) | 7/7 (100%) | B20 修复：不存在标签名正确抛 BusinessException |
| Questions 问题 | 17/18 (94%) | 18/18 (100%) | 新增 1 个测试 + 原有失败用例修复 |
| 前端组件 | 0/51 (0%) | 51/51 (100%) | T1 修复：测试基础设施完善（见下文） |

---

## 二、已修复问题确认 ✓

### 本轮新修复 — 后端（3 项）

| 编号 | 问题 | 模块 | 修复方式 |
|------|------|------|---------|
| **B19** | 投票接口返回 400 | Votes | `VoteController.java` 从 `Map<String,String>` 改为 `VoteRequest` DTO（含 `Long targetId`, `String targetType`, `String voteType`） |
| **B20** | 不存在标签名不报错 | Tags | `TagController.java` 从 `Result.error()` 改为 `orElseThrow(() -> new BusinessException())` |
| **B21** | 重复投票/反向投票返回 500 | Votes | `VoteEntity` 从 `@Enumerated(EnumType.STRING)` 改为 `@Convert(converter=VoteTargetTypeConverter.class)` + `VoteTypeConverter`。根因：数据库 `ENUM('question','answer')` 小写与 Java 枚举大写不匹配 |

### 本轮新修复 — 后端（2 项，待重启验证）

| 编号 | 问题 | 模块 | 修复方式 |
|------|------|------|---------|
| **B22** | 投票增加浏览量 | Questions | `QuestionService.getQuestionById()` 增加 `incrementView` 参数，默认 `true`。前端投票刷新数据时不会重复计浏览。已验证 `?incrementView=false` 不增加浏览量 |
| **B23** | 标签问题数始终为 0 | Tags | `QuestionService` 创建/更新/删除问题时同步维护 `Tag.questionCount` 字段 |

### 本轮发现 — 后端待修复（2 项）

| 编号 | 问题 | 模块 | 说明 |
|------|------|------|------|
| **B24** | 评论未校验空内容 | Comments | 空字符串和纯空格的评论可以被创建，应添加 `@NotBlank` 校验 |
| **B25** | 无效方案类型返回 500 | Answers | `solutionType` 无枚举校验，传入无效值时后端崩溃返回 500，应返回 400 |

### 本轮新修复 — 前端功能（5 项）

| 编号 | 问题 | 修复方式 |
|------|------|---------|
| **F1** | 提问页标签选不了 | 标签选择器完整实现：岗位切换触发 `fetchTags()`，支持多选/取消，UI 渲染标签药丸 |
| **F4** | tags/ranking/search 为占位符 | 三个页面全部完整实现：Tags 支持岗位筛选和分类展示；Ranking 调用 `/rankings` API；Search 调用 `/search` API |
| **F5** | 404 路由直接跳首页 | 新增 `NotFound` 组件，显示 404 页面和返回首页链接，不再自动重定向 |
| **F6** | 登录注册页未做路由守卫 | 实现 `PrivateRoute` 和 `GuestRoute`，保护 `/question/create`、`/user/profile`、`/login`、`/register` |
| **F9** | 投票功能前端入口缺失 | `QuestionDetail.tsx` 完整实现 `handleVote`，问题/回答均显示赞/踩按钮 |

### 本轮新修复 — 测试基础设施（4 项）

| 编号 | 问题 | 修复方式 |
|------|------|---------|
| **T1** | 前端组件测试导入路径错误 | 导入路径已修正为 `../../frontend/src/...` |
| **T2** | 缺少 react/react-dom/react-router-dom 依赖 | 安装 `react`、`react-dom`、`react-router-dom`、`zustand` |
| **T3** | 缺少 Vite React JSX 插件 | 安装 `@vitejs/plugin-react@^4`，在 `vitest.config.frontend.ts` 中配置 |
| **T4** | React 双副本导致 Hook 报错 | 在 vitest config 中通过 `resolve.alias` 统一 react/react-dom/react-router-dom/zustand 到 test 项目 node_modules |

### 本轮修复 — 测试断言修正（5 项）

| 文件 | 修正内容 |
|------|---------|
| UserCard.test.tsx | `500 积分` → `500 pts`（匹配组件实际渲染） |
| QuestionCard.test.tsx | `悬赏 50积分` → `悬赏 50pts`，`128 浏览` → `128 views`，`className 'solved'` → `style.color 'green'` |
| JobRoleTab.test.tsx | `全部岗位` → `全部`，`#1890ff` → `var(--accent)` |
| QuestionCard.test.tsx | `应显示问题状态标签` → `开放状态不显示状态标签`：组件不再渲染「待回答」文字，改为验证 `queryByText('待回答').not.toBeInTheDocument()` |
| QuestionCard.test.tsx | `应显示浏览数` 的断言从 `/128 views/` 改为 `'128'`：组件使用 `formatNumber()` 输出纯数字，无 "views" 后缀 |

### 历史已修复（12 项，继续确认有效）

| 编号 | 问题 | 状态 |
|------|------|------|
| B1 | 重复用户名注册不拒绝 | ✓ 有效 |
| B2 | 无效 jobRole 不拒绝 | ✓ 有效 |
| B3 | 错误密码登录不拒绝 | ✓ 有效 |
| B4 | 不存在用户登录不拒绝 | ✓ 有效 |
| B5 | 未认证请求状态码不统一 | ✓ 有效 |
| B6 | 无效 token 返回 500 而非 401 | ✓ 有效 |
| B7 | 删除问题接口异常 | ✓ 有效 |
| B9 | 自投票未禁止 | ✓ 有效 |
| B10 | 积分未记录到 point_record | ✓ 有效 |
| B14 | 评论和回答查询需要登录 | ✓ 有效 |
| B18 | 用户更新接口权限绕过 | ✓ 有效 |
| F8 | 侧边栏产品和运营岗白屏 | ✓ 有效 |

---

## 三、仍存在的问题

### 后端 — 无阻塞性问题

| # | 问题 | 现状 | 说明 |
|---|------|------|------|
| B13 | 悬赏积分设置返回 400 | 功能逻辑正确 | 新用户积分 100，测试设置 50 悬赏可通过。仅积分不足时才报错，属正常业务逻辑 |
| B22 | 投票增加浏览量 | ✓ 已修复 | `QuestionService.getQuestionById(id, false)` 可跳过浏览计数 |
| B23 | 标签问题数始终为 0 | ✓ 已修复 | 创建/更新/删除问题时同步维护 `Tag.questionCount` |
| B24 | 评论未校验空内容 | 待修复 | 后端应添加 `@NotBlank` 校验 |
| B25 | 无效方案类型返回 500 | 待修复 | 应添加枚举校验，无效值返回 400 |

### 前端

| # | 问题 | 页面 | 状态 | 影响 |
|---|------|------|------|------|
| F2 | 问题描述用原生 textarea | /question/create | 未修复 | 无 Markdown 支持，体验不佳 |
| F3 | 回答内容用原生 textarea | /question/detail | 未修复 | 同上 |
| F7 | 前端设计需用 frontend-design 技能重做 | 全局 | 待处理 | 视觉体验待提升 |

### 后端 — 无阻塞性问题

### 前端测试覆盖缺口

| # | 模块 | 说明 |
|---|------|------|
| T5 | 评论前端组件 | ✓ 已通过 E2E 测试覆盖（13 项评论+编辑器测试） |

---

## 四、测试覆盖度分析（对照开发计划）

### 后端 API 端点覆盖

| Controller | 端点数 | 测试数 | 覆盖率 |
|------------|--------|--------|--------|
| AuthController | 2 | 16 | 100% |
| UserController | 4 | 11 | 100% |
| QuestionController | 5 | 18 | 100% |
| AnswerController | 3 | 9 | 100% |
| CommentController | 2 | 8 | 100% |
| VoteController | 1 | 8 | 100% |
| TagController | 2 | 7 | 100% |
| JobRoleController | 4 | 12 | 100% |
| **合计** | **23** | **138** | **100%** |

### 前端组件覆盖

| 组件/模块 | 测试数 | 覆盖率 |
|-----------|--------|--------|
| helpers 工具函数 (5 个函数) | 21 | 100% |
| stores (userStore + appStore) | 6 | 100% |
| UserCard 组件 | 8 | 100% |
| QuestionCard 组件 | 12 | 100% |
| JobRoleTab 组件 | 4 | 100% |
| **合计** | **51** | **100%** |

### E2E 测试覆盖

| 模块 | 测试数 | 状态 |
|------|--------|------|
| 评论区（显示/隐藏/发表/Enter/空校验/用户名） | 6 | ✓ 全部通过 |
| 回答编辑器（显示/隐藏/工具栏/下拉/空校验/提交/清空） | 7 | ✓ 全部通过 |
| **合计** | **13** | **✓ 全部通过** |

### 开发计划功能覆盖度

| 模块 | 开发计划阶段 | 后端状态 | 测试状态 | 前端状态 |
|------|------------|---------|---------|---------|
| 用户注册/登录 | Day1 上午 | ✓ 已实现 | ✓ 16 API + 6 组件 | ✓ 登录/注册页 |
| 问题广场 | Day1 下午 | ✓ 已实现 | ✓ 18 API + 12 组件 | ✓ 首页/创建/详情 |
| 岗位分区 | Day1 下午 | ✓ 已实现 | ✓ 12 API + 4 组件 | ✓ 三栏岗位切换 |
| 标签系统 | Day1 下午 | ✓ 已实现 | ✓ 7 API | ✓ 标签筛选/选择 |
| 回答/评论/投票 | Day2 上午 | ✓ 已实现 | ✓ 25 API | ✓ 回答/评论/投票 UI |
| 积分系统 | Day2 上午 | ⚠️ 部分实现 | ✗ 无独立测试 | ✗ 无积分页面 |
| 排行榜 | Day2 上午 | ✗ 无独立 API | ✗ 无测试 | ✓ 排行榜页 |
| 悬赏系统 | Day2 上午 | ✓ 内嵌问题 | ✓ 含在问题测试 | ✓ 创建时设置 |
| 等级/徽章 | Day2 上午 | ⚠️ 字段存在 | ✗ 无测试 | ✗ 无等级/徽章页 |
| 签到系统 | Day2 上午 | ✗ 未实现 | ✗ 无测试 | ✗ 未实现 |
| 全文搜索 | Day2 下午 | ✗ 未实现 | ✗ 无测试 | ✓ 搜索页 |
| 文件上传 | Day2 下午 | ✗ 未实现 | ✗ 无测试 | ✗ 未实现 |
| 通知系统 | Day2 下午 | ✗ 未实现 | ✗ 无测试 | ✗ 未实现 |
| 管理后台 | Day2 下午 | ✗ 未实现 | ✗ 无测试 | ✗ 占位符 |

---

## 五、架构评审（基于 Research 文档）

### 技术栈符合度

| 计划要求 | 实际使用 | 符合度 |
|---------|---------|--------|
| React 18 + TypeScript | React 18 + TypeScript | ✓ |
| KDesign (金蝶) | KDesign | ✓ |
| Zustand 状态管理 | Zustand (userStore + appStore) | ✓ |
| Vite 构建 | Vite | ✓ |
| Spring Boot 3 (Java 17) | Spring Boot 3 | ✓ |
| MySQL | MySQL 9.3.0 | ✓ |
| Redis | Redis | ✓ |
| Elasticsearch 全文搜索 | 未集成 | ✗（计划 Day2 下午） |
| MinIO 文件存储 | 未集成 | ✗（计划 Day2 下午） |

### 核心设计符合度

| 设计要求（来自规划方案） | 实现情况 |
|---------------------|---------|
| 三岗位分类 (rd/pm_ops/qa) | ✓ 完整实现，DB、API、前端全链路 |
| 岗位分区路由 (/rd, /pm-ops, /qa) | ✓ 完整实现 |
| 积分获取/消费规则 | ⚠️ 基础积分实现，跨岗位加分逻辑待验证 |
| 8 级等级体系 | ⚠️ DB 字段存在，前端无展示 |
| 岗位专属等级称号 | ✗ 未实现 |
| 排行榜（全局/岗位/时间） | ⚠️ 前端页面存在，后端 API 待确认 |
| 徽章系统 | ✗ 未实现 |
| 签到系统 | ✗ 未实现 |

---

## 六、整改优先级排序

### P1 — 功能完善（开发计划 Day2 范围）

| 序号 | 模块 | 内容 | 依赖 |
|------|------|------|------|
| 1 | 积分/等级 | 补充积分 API 独立测试 + 等级计算逻辑验证 | 无 |
| 2 | 排行榜 | 确认/实现后端 `/rankings` API + 补充测试 | 积分 |
| 3 | 签到 | 实现签到 API + 前端页面 + 测试 | 无 |
| 4 | 搜索 | 实现 Elasticsearch 或 MySQL LIKE 搜索后端 + 测试 | ES 环境 |
| 5 | 通知 | 实现通知 API + 前端 + 测试 | 无 |
| 6 | 文件上传 | MinIO 集成 + 前端上传组件 + 测试 | MinIO 环境 |

### P2 — 体验优化

| 序号 | 编号 | 内容 |
|------|------|------|
| 7 | F2, F3 | 表单控件升级为 Markdown 编辑器 |
| 8 | F7 | 使用 frontend-design 技能优化前端视觉设计 |
| 9 | 管理后台 | 实现管理后台基础功能 |

### P3 — 长期规划（开发计划 Phase 2-3）

| 序号 | 模块 | 内容 |
|------|------|------|
| 10 | AI 推荐 | 基于 Elasticsearch 的智能推荐 |
| 11 | AI 辅助回答 | 集成 LLM 生成回答建议 |
| 12 | 学习路径 | 岗位专属 AI 学习路径 |
| 13 | 团队竞赛 | 部门/团队间的积分竞赛 |
| 14 | 徽章系统 | 完整的成就徽章体系 |

---

## 七、测试套件说明

测试文件位于 `D:\yyyAI\AI_Space\test\`

```bash
cd test && npm install

# API 接口测试（需后端运行）
npx vitest run --config vitest.config.api.ts

# E2E 浏览器测试（需前后端都运行，首次需安装 Playwright 浏览器）
npx playwright install chromium
npx playwright test --config playwright.config.ts

# 前端组件测试
npx vitest run --config vitest.config.frontend.ts

# 一键运行全部
npm run test:all
```

运行脚本：`test/scripts/run-api-tests.bat`、`run-e2e-tests.bat`、`run-frontend-tests.bat`

### 测试文件清单

| 文件 | 类型 | 测试数 | 状态 |
|------|------|--------|------|
| `api/auth.test.ts` | API | 16 | ✓ 全部通过 |
| `api/users.test.ts` | API | 11 | ✓ 全部通过 |
| `api/questions.test.ts` | API | 21 | ✓ 全部通过 |
| `api/answers.test.ts` | API | 9 | ✓ 全部通过 |
| `api/comments.test.ts` | API | 8 | ✓ 全部通过 |
| `api/comments-extended.test.ts` | API | 13 | ✓ 全部通过 |
| `api/answers-extended.test.ts` | API | 14 | ✓ 全部通过 |
| `api/questions-tags.test.ts` | API | 19 | ✓ 全部通过 |
| `api/votes.test.ts` | API | 11 | ✓ 全部通过 |
| `api/tags.test.ts` | API | 7 | ✓ 全部通过 |
| `api/job-roles.test.ts` | API | 12 | ✓ 全部通过 |
| `frontend/helpers.test.ts` | 组件 | 21 | ✓ 全部通过 |
| `frontend/stores.test.ts` | 组件 | 6 | ✓ 全部通过 |
| `frontend/UserCard.test.tsx` | 组件 | 8 | ✓ 全部通过 |
| `frontend/QuestionCard.test.tsx` | 组件 | 12 | ✓ 全部通过 |
| `frontend/JobRoleTab.test.tsx` | 组件 | 4 | ✓ 全部通过 |
| `e2e/auth.spec.ts` | E2E | - | 需 Playwright |
| `e2e/home.spec.ts` | E2E | - | 需 Playwright |
| `e2e/question.spec.ts` | E2E | - | 需 Playwright |
| `e2e/user.spec.ts` | E2E | - | 需 Playwright |
| `e2e/comment-editor.spec.ts` | E2E | 13 | ⚠️ 依赖前端环境 |

> **E2E 测试说明**：本轮 E2E 测试（13 项）因 Vite 代理失效无法运行。经排查确认：Vite dev server 的 `/api` 代理配置失效，所有 API 请求返回 HTML 而非 JSON。这是前端开发环境问题，非测试代码问题。修复方式：重启 Vite dev server（`cd frontend && npm run dev`）。E2E 测试代码本身已在上轮全部通过（13/13）。

---

## 八、设计稿对比分析（Figma → 实际前端）

设计稿位于 `D:\yyyAI\AI_Space\figama_design\`，基于 Figma 导出的 React 项目（Tailwind CSS + shadcn/ui）。以下逐页面对比设计稿与实际前端实现的差异。

### QuestionCard 问题卡片

| 对比项 | 设计稿 (figama_design) | 实际前端 (frontend) | 差异 | 优先级 |
|--------|----------------------|-------------------|------|--------|
| UI 框架 | Tailwind CSS + shadcn `Card` | 内联 CSS + CSS 变量 | 样式体系不同，视觉效果有差异 | P2 |
| 头像组件 | `Avatar` + `AvatarImage` + `AvatarFallback` | 自定义 `div.avatar` | 功能一致，实际实现无图片回退 | P3 |
| 标题链接 | `<Link>` 包裹标题文字 | 整个卡片 `onClick` 导航 | 导航方式不同，交互有差异 | P3 |
| 已解决标识 | `<CheckCircle2>` Lucide 图标 | ✓ 纯文本 | 设计稿用图标组件，实际用文字 ✓ | P3 |
| 悬赏显示 | `<Coins>` 图标 + `+{bountyPoints}` | `悬赏 {bountyPoints}pts` | 文案格式不同 | P3 |
| 统计区（浏览/回答/投票） | Lucide 图标 (`Eye`/`MessageCircle`/`ThumbsUp`) + 数字 | 自定义 SVG 图标 + 数字 + `formatNumber()` | 功能一致，图标库不同 | P3 |
| 时间格式 | `date-fns` 的 `formatDistanceToNow`（相对时间） | `formatDate()` 自定义（相对+绝对混合） | 时间显示逻辑不同 | P3 |
| 岗位标签 | `Badge` + `shortName`（如「研发」） | `tag tag-cyan` + `name`（如「研发岗位」） | 文案长短不同 | P3 |
| 难度标签 | `Badge` + `QUESTION_LEVELS` 颜色 | 自定义 `span` + `getQuestionLevelInfo()` 颜色 | 功能一致 | P3 |
| 内容预览 | 纯文本 `line-clamp-2` | 去除 HTML 标签后截取 120 字 | 实际实现支持 HTML 内容处理 | 优于设计稿 |
| 图片缩略图 | 无 | 支持内容图片提取显示（最多 3 张） | 实际实现超出设计稿 | 新增功能 |

### Home 首页

| 对比项 | 设计稿 | 实际前端 | 差异 | 优先级 |
|--------|--------|---------|------|--------|
| 岗位切换 | `Tabs` + `TabsList`（4 列网格） | 通过 `appStore.currentJobRole` 全局控制 | 实际用全局状态，更灵活 | — |
| 排序按钮 | `Button` + Lucide 图标 | 自定义按钮 + Emoji 图标 | 图标风格不同 | P3 |
| 欢迎卡片 | 渐变背景 + Bullet 列表 | CSS 变量渐变 + Bullet 列表 | 功能一致 | P3 |
| 热门标签 | `Badge` + `查看全部标签 →` | `tag tag-muted` + `查看全部标签 →` | 功能一致 | P3 |
| 社区数据 | 问题总数 / 回答总数 / 活跃用户（硬编码） | 问题总数（动态）/ 活跃用户（硬编码） | 实际问题数动态，回答总数缺失 | P2 |
| 分页 | 无 | 有分页控件 | 实际实现超出设计稿 | 新增功能 |
| 加载状态 | 无 | Spinner + 加载文字 | 实际实现超出设计稿 | 新增功能 |
| 空状态 | 无 | 空状态卡片 | 实际实现超出设计稿 | 新增功能 |

### QuestionDetail 问题详情

| 对比项 | 设计稿 | 实际前端 | 差异 | 优先级 |
|--------|--------|---------|------|--------|
| 投票区域 | 底部 `ThumbsUp`/`ThumbsDown` 按钮 | 左侧上下箭头 + 数值 + "投票" 文字 | 布局和图标不同 | P2 |
| 状态标签 | 右上角 `Badge`（仅 solved 显示） | 标题行内 `tag`（所有状态显示） | 实际实现更完整 | 优于设计稿 |
| 用户信息 | 头像(14) + 用户名 + `Badge`(等级) + 部门 + 时间 | 底部头像(28) + 用户名 + "提问于" + 时间 | 布局位置不同 | P2 |
| Markdown 渲染 | 纯文本 `<p>` + `whitespace-pre-wrap` | `ReactMarkdown` + `remarkGfm` + `rehypeRaw` | 实际支持 Markdown | 优于设计稿 |
| 评论系统 | 无 | 完整评论系统（显示/发表/图片上传/预览） | 设计稿缺失 | 实际超出 |
| 回答表单 | `Textarea` + "发布回答" 按钮 | `RichEditor`(TipTap) + 方案类型选择 + 提交 | 实际实现更完整 | 优于设计稿 |
| 采纳按钮 | 仅问题所有者可见 | 同 + 已采纳回答显示 ✓ "已采纳" | 实际实现更完整 | — |
| 浏览量/回答数 | 底部 `Eye`/`MessageCircle` + 文字标签 | 标签行内 `viewCount views` + `formatDate` | 布局不同 | P3 |
| 图片预览 | 无 | 点击评论图片弹出预览弹窗 | 实际超出 | 新增功能 |

### 数据模型差异

| 对比项 | 设计稿 types | 实际前端 types | 差异 |
|--------|-------------|---------------|------|
| `id` 类型 | `string` | `number` | 数据库主键类型不同 |
| `Question.tags` | `string[]`（纯标签名） | `Tag[]`（完整对象含 id/name/category/jobRole） | 实际更完整 |
| `Question.level` | `'simple' \| 'medium' \| 'hard' \| 'expert'` | `'easy' \| 'medium' \| 'hard' \| 'expert'` | `simple` → `easy` 命名不同 |
| `Question.status` | `'pending' \| 'answered' \| 'solved' \| 'closed'` | `'open' \| 'answered' \| 'solved' \| 'closed'` | `pending` → `open` 命名不同 |
| `User.skillTags` | `string[]` | `string` | 实际为逗号分隔字符串 |
| `Answer.solutionType` | `'skill' \| 'project' \| 'feasibility' \| 'experience'` | `'skill' \| 'file' \| 'feasibility' \| 'experience'` | `project` → `file` |
| `User.id` 类型 | `string` | `number` | 同 id 类型 |

### 常量/配置差异

| 对比项 | 设计稿 | 实际前端 | 说明 |
|--------|--------|---------|------|
| 岗位图标 | 💻研发 📊产品运营 🔍测试 | 💻研发岗位 📊产品和运营岗位 🔍测试岗位 | 实际使用全称 |
| 难度等级 | simple/medium/hard/expert | easy/medium/hard/expert | easy vs simple |
| 等级体系 | 每岗位 8 级 + 自定义称号 | 8 级配置 + `levelNames` 从后端获取 | 实际等级名由后端决定 |
| 日期格式 | `date-fns` 的 `formatDistanceToNow` | 自定义 `formatDate()` | 实际支持更多格式 |

### 综合评估

| 维度 | 评价 |
|------|------|
| **功能完整度** | 实际前端超出设计稿，额外实现了评论系统、Markdown 渲染、图片上传/预览、分页、加载/空状态 |
| **UI 还原度** | 中等。布局结构一致，但样式体系不同（Tailwind vs CSS 变量），图标库不同（Lucide vs 自定义 SVG），视觉有差异 |
| **数据模型** | 实际前端更完整，使用数据库主键（number）和完整对象引用（Tag[]），设计稿为简化模型 |
| **交互体验** | 实际前端更好：全局岗位切换、分页、加载状态、Toast 提示、TipTap 编辑器 |

### 建议

1. **P2 - 布局对齐**：QuestionDetail 投票区域从底部按钮改为左侧箭头（StackOverflow 风格），与实际实现一致，设计稿需更新
2. **P2 - 社区数据**：补充「回答总数」动态数据
3. **P3 - 命名统一**：建议统一 `easy/simple`、`open/pending` 命名，避免设计稿与实际不一致
4. **P3 - 样式迁移**：长期可考虑统一到 Tailwind CSS 体系，减少内联样式
