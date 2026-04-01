// 岗位方向
export type JobRole = 'rd' | 'pm_ops' | 'qa';

// 用户角色
export type UserRole = 'user' | 'expert' | 'admin';

// 问题状态
export type QuestionStatus = 'open' | 'answered' | 'solved' | 'closed';

// 问题等级
export type QuestionLevel = 'easy' | 'medium' | 'hard' | 'expert';

// 投票类型
export type VoteType = 'up' | 'down';

// 解决方案类型
export type SolutionType = 'skill' | 'file' | 'feasibility' | 'experience';

// 用户信息
export interface User {
  id: number;
  username: string;
  avatar: string;
  email: string;
  phone: string;
  department: string;
  jobRole: JobRole;
  roleName: string;
  level: number;
  levelName: string;
  points: number;
  bio: string;
  skillTags: string;
  createdAt: string;
}

// 问题
export interface Question {
  id: number;
  userId: number;
  title: string;
  content: string;
  jobRole: JobRole;
  level: QuestionLevel;
  status: QuestionStatus;
  bountyPoints: number;
  viewCount: number;
  answerCount: number;
  voteCount: number;
  likeCount: number;
  dislikeCount: number;
  solvedAnswerId: number | null;
  tags: Tag[];
  user: User;
  createdAt: string;
  updatedAt: string;
}

// 回答
export interface Answer {
  id: number;
  questionId: number;
  userId: number;
  content: string;
  solutionType: SolutionType | null;
  voteCount: number;
  likeCount: number;
  dislikeCount: number;
  isAccepted: boolean;
  user: User;
  createdAt: string;
}

// 评论
export interface Comment {
  id: number;
  targetId: number;
  targetType: 'question' | 'answer';
  userId: number;
  content: string;
  user: User;
  createdAt: string;
}

// 标签
export interface Tag {
  id: number;
  name: string;
  description: string;
  category: string;
  jobRole: JobRole;
  questionCount: number;
}

// 岗位配置
export interface JobRoleConfig {
  id: number;
  roleKey: JobRole;
  roleName: string;
  description: string;
  icon: string;
  levelNames: string[];
  sortOrder: number;
}

// 徽章
export interface Badge {
  id: number;
  name: string;
  icon: string;
  description: string;
  conditionType: string;
  conditionValue: number;
  jobRole: string;
}

// 积分记录
export interface PointRecord {
  id: number;
  userId: number;
  actionType: string;
  points: number;
  balance: number;
  targetId: number | null;
  targetType: string | null;
  isCrossRole: boolean;
  description: string;
  createdAt: string;
}

// 通知
export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  relatedId: number | null;
  relatedType: string | null;
  createdAt: string;
}

// 通用分页响应
export interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
}

// API 统一响应
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 登录响应
export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  jobRole: JobRole;
  role: string;
  level: number;
  points: number;
}

// 实践分类
export type PracticeCategory = 'implementation' | 'optimization' | 'architecture' | 'tool' | 'workflow';

// 最佳实践
export interface BestPractice {
  id: number;
  userId: number;
  title: string;
  content: string;
  description: string;
  jobRole: JobRole;
  category: PracticeCategory;
  categoryName: string;
  viewCount: number;
  voteCount: number;
  commentCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
}

// 文章分类
export type ArticleCategory = 'tutorial' | 'guide' | 'case-study' | 'research' | 'news';

// 知识文章
export interface Article {
  id: number;
  userId: number;
  title: string;
  content: string;
  summary: string;
  coverImage: string;
  jobRole: JobRole;
  category: ArticleCategory;
  categoryName: string;
  readTime: number;
  viewCount: number;
  voteCount: number;
  commentCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
}
