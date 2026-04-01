import type { JobRole, JobRoleConfig } from '../types';

// 岗位配置
export const JOB_ROLES: Record<JobRole, { key: JobRole; name: string; icon: string; color: string }> = {
  rd: { key: 'rd', name: '研发岗位', icon: '💻', color: '#1890ff' },
  pm_ops: { key: 'pm_ops', name: '产品和运营岗位', icon: '📊', color: '#52c41a' },
  qa: { key: 'qa', name: '测试岗位', icon: '🔍', color: '#faad14' },
};

// 岗位标签
export const JOB_ROLE_LABELS: Record<JobRole, string> = {
  rd: '研发',
  pm_ops: '产品运营',
  qa: '测试',
};

// 等级配置
export const LEVEL_CONFIG = [
  { level: 1, minPoints: 0, maxPoints: 99 },
  { level: 2, minPoints: 100, maxPoints: 499 },
  { level: 3, minPoints: 500, maxPoints: 999 },
  { level: 4, minPoints: 1000, maxPoints: 2499 },
  { level: 5, minPoints: 2500, maxPoints: 4999 },
  { level: 6, minPoints: 5000, maxPoints: 9999 },
  { level: 7, minPoints: 10000, maxPoints: 19999 },
  { level: 8, minPoints: 20000, maxPoints: Infinity },
];

// 积分规则
export const POINT_RULES = {
  QUESTION_POST: { points: 2, desc: '发布问题' },
  QUESTION_UPVOTED: { points: 10, desc: '问题被点赞' },
  ANSWER_POST: { points: 5, desc: '回答问题' },
  ANSWER_CROSS_ROLE: { points: 8, desc: '跨岗位回答' },
  ANSWER_CROSS_ROLE_BONUS: { points: 3, desc: '跨岗位回答额外加成' },
  ANSWER_UPVOTED: { points: 10, desc: '回答被点赞' },
  ANSWER_ACCEPTED: { points: 15, desc: '回答被采纳' },
  ACCEPT_ANSWER: { points: 2, desc: '采纳他人回答' },
  SIGN_IN: { points: 1, desc: '每日签到' },
  DOWNVOTED: { points: -2, desc: '内容被踩' },
};

// 问题等级
export const QUESTION_LEVELS = [
  { key: 'easy', name: '简单', color: '#52c41a', bonusPoints: 5, recommendBounty: '0-20' },
  { key: 'medium', name: '中等', color: '#1890ff', bonusPoints: 10, recommendBounty: '20-50' },
  { key: 'hard', name: '困难', color: '#faad14', bonusPoints: 20, recommendBounty: '50-100' },
  { key: 'expert', name: '专家级', color: '#f5222d', bonusPoints: 50, recommendBounty: '100-500' },
];

// 问题状态
export const QUESTION_STATUS_MAP = {
  open: { name: '待回答', color: '#1890ff' },
  answered: { name: '已回答', color: '#52c41a' },
  solved: { name: '已解决', color: '#52c41a' },
  closed: { name: '已关闭', color: '#999' },
};

// API基础地址
export const API_BASE_URL = '/api';

// 每页条数
export const PAGE_SIZE = 20;

// 实践分类
export const PRACTICE_CATEGORIES = [
  { key: 'all', name: '全部', icon: '📋' },
  { key: 'implementation', name: '实施方案', icon: '🛠️' },
  { key: 'optimization', name: '优化改进', icon: '⚡' },
  { key: 'architecture', name: '架构设计', icon: '🏗️' },
  { key: 'tool', name: '工具使用', icon: '🔧' },
  { key: 'workflow', name: '工作流程', icon: '🔄' },
];

// 文章分类
export const ARTICLE_CATEGORIES = [
  { key: 'all', name: '全部', icon: '📋' },
  { key: 'tutorial', name: '教程', icon: '📚' },
  { key: 'guide', name: '指南', icon: '🗺️' },
  { key: 'case-study', name: '案例分析', icon: '💼' },
  { key: 'research', name: '研究', icon: '🔬' },
  { key: 'news', name: '资讯', icon: '📰' },
];
