/**
 * API 测试共享工具模块
 * 提供HTTP客户端、测试数据生成、断言辅助等功能
 */
import axios, { AxiosInstance, AxiosResponse } from 'axios'

// ========== 配置 ==========
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080'

// ========== 类型定义 ==========
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface LoginResponse {
  token: string
  userId: number
  username: string
  jobRole: string
  role: string
  level: number
  points: number
}

export interface UserDTO {
  id: number
  username: string
  avatar: string | null
  email: string | null
  phone: string | null
  department: string | null
  jobRole: string
  roleName: string
  level: number
  levelName: string
  points: number
  bio: string | null
  skillTags: string | null
  createdAt: string
}

export interface QuestionDTO {
  id: number
  userId: number
  title: string
  content: string
  jobRole: string
  level: string
  status: string
  bountyPoints: number
  viewCount: number
  answerCount: number
  voteCount: number
  solvedAnswerId: number | null
  tags: TagDTO[]
  user: UserDTO
  createdAt: string
  updatedAt: string
}

export interface AnswerDTO {
  id: number
  questionId: number
  userId: number
  content: string
  solutionType: string | null
  voteCount: number
  isAccepted: boolean
  user: UserDTO
  createdAt: string
}

export interface CommentDTO {
  id: number
  targetId: number
  targetType: string
  userId: number
  content: string
  user: UserDTO
  createdAt: string
}

export interface TagDTO {
  id: number
  name: string
  description: string
  category: string
  jobRole: string
  questionCount: number
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  size: number
}

// ========== HTTP 客户端 ==========
let authToken: string | null = null

/** 创建带认证的 axios 实例 */
export function createClient(token?: string): AxiosInstance {
  const instance = axios.create({
    baseURL: `${BASE_URL}/api`,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  })
  return instance
}

/** 获取当前认证客户端 */
export function authClient(): AxiosInstance {
  if (!authToken) throw new Error('未登录，请先调用 setAuthToken()')
  return createClient(authToken)
}

/** 获取无认证客户端 */
export function anonymousClient(): AxiosInstance {
  return createClient()
}

/** 设置认证令牌 */
export function setAuthToken(token: string): void {
  authToken = token
}

/** 获取当前令牌 */
export function getAuthToken(): string | null {
  return authToken
}

/** 清除认证令牌 */
export function clearAuthToken(): void {
  authToken = null
}

// ========== 测试数据生成 ==========
let counter = Date.now()

/** 生成唯一用户名 */
export function uniqueUsername(prefix = 'testuser'): string {
  return `${prefix}_${++counter}`
}

/** 生成唯一邮箱 */
export function uniqueEmail(prefix = 'test'): string {
  return `${prefix}_${++counter}@test.com`
}

/** 标准注册数据 */
export function generateRegisterData(overrides: Record<string, unknown> = {}) {
  return {
    username: uniqueUsername(),
    password: 'Test123456',
    email: uniqueEmail(),
    jobRole: 'rd',
    ...overrides
  }
}

/** 标准登录数据 */
export function generateLoginData(username: string, password = 'Test123456') {
  return { username, password }
}

/** 标准问题数据 */
export function generateQuestionData(overrides: Record<string, unknown> = {}) {
  return {
    title: `测试问题_${++counter}`,
    content: `这是测试问题的内容，包含足够的字数来通过验证。counter=${counter}`,
    jobRole: 'rd',
    level: 'medium',
    tags: [],
    ...overrides
  }
}

/** 标准回答数据 */
export function generateAnswerData(overrides: Record<string, unknown> = {}) {
  return {
    content: `这是测试回答的内容，详细描述了解决方案。counter=${++counter}`,
    solutionType: 'skill',
    ...overrides
  }
}

/** 标准评论数据 */
export function generateCommentData(targetId: number, targetType: 'question' | 'answer') {
  return {
    targetId,
    targetType,
    content: `测试评论内容_${++counter}`
  }
}

// ========== 辅助函数 ==========

/** 注册用户并返回登录响应 */
export async function registerUser(data?: Record<string, unknown>): Promise<ApiResponse<LoginResponse>> {
  const res = await anonymousClient().post<ApiResponse<LoginResponse>>('/auth/register', data || generateRegisterData())
  return res.data
}

/** 登录用户并设置 token */
export async function loginUser(username: string, password = 'Test123456'): Promise<ApiResponse<LoginResponse>> {
  const res = await anonymousClient().post<ApiResponse<LoginResponse>>('/auth/login', { username, password })
  setAuthToken(res.data.data.token)
  return res.data
}

/** 注册并登录一个新用户 */
export async function registerAndLogin(overrides: Record<string, unknown> = {}): Promise<{ response: ApiResponse<LoginResponse>; registerData: ReturnType<typeof generateRegisterData> }> {
  const data = generateRegisterData(overrides)
  const regRes = await registerUser(data)
  if (regRes.data.token) {
    setAuthToken(regRes.data.token)
  }
  return { response: regRes, registerData: data }
}

/** 创建问题（需要先登录） */
export async function createQuestion(overrides: Record<string, unknown> = {}): Promise<ApiResponse<QuestionDTO>> {
  const res = await authClient().post<ApiResponse<QuestionDTO>>('/questions', generateQuestionData(overrides))
  return res.data
}

/** 创建回答（需要先登录） */
export async function createAnswer(questionId: number, overrides: Record<string, unknown> = {}): Promise<ApiResponse<AnswerDTO>> {
  const res = await authClient().post<ApiResponse<AnswerDTO>>(`/questions/${questionId}/answers`, generateAnswerData(overrides))
  return res.data
}

// ========== 断言辅助 ==========

/** 断言 API 响应成功 */
export function expectSuccess<T>(response: ApiResponse<T>, message?: string): void {
  expect(response.code).toBe(200)
  if (message) expect(response.message).toContain(message)
}

/** 断言 API 响应失败 */
export function expectError(response: { code: number; message: string }, expectedCode?: number): void {
  if (expectedCode) {
    expect(response.code).toBe(expectedCode)
  } else {
    expect(response.code).not.toBe(200)
  }
}

/** 从 axios 错误中提取响应数据 */
export function extractErrorData(error: unknown): { code: number; message: string; data: unknown } {
  if (axios.isAxiosError(error) && error.response) {
    return error.response.data as { code: number; message: string; data: unknown }
  }
  throw error
}
