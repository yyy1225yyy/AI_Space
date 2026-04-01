/**
 * 用户模块 API 测试
 * 覆盖：获取当前用户、获取指定用户、更新用户、更新岗位角色
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  authClient,
  anonymousClient,
  registerAndLogin,
  expectSuccess,
  expectError,
  extractErrorData,
  clearAuthToken,
  createClient
} from './helpers'

describe('Users 模块', () => {
  let userId: number
  let token: string

  beforeEach(async () => {
    const { response } = await registerAndLogin()
    userId = response.data.userId
    token = response.data.token
  })

  // ==================== GET /api/users/me ====================
  describe('GET /api/users/me', () => {
    it('已登录用户应能获取自己的信息', async () => {
      const res = await authClient().get('/users/me')
      expectSuccess(res.data)
      const user = res.data.data
      expect(user.id).toBe(userId)
      expect(user.username).toBeDefined()
      expect(user.jobRole).toBeDefined()
      expect(user.level).toBeDefined()
      expect(user.points).toBeDefined()
    })

    it('未登录用户应被拒绝', async () => {
      clearAuthToken()
      try {
        await anonymousClient().get('/users/me')
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expect(errData.code).toBe(401)
      }
    })
  })

  // ==================== GET /api/users/{id} ====================
  describe('GET /api/users/{id}', () => {
    it('应能获取指定用户信息（无需登录）', async () => {
      const res = await anonymousClient().get(`/users/${userId}`)
      expectSuccess(res.data)
      expect(res.data.data.id).toBe(userId)
    })

    it('不存在的用户ID应返回错误', async () => {
      try {
        await anonymousClient().get('/users/999999')
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })
  })

  // ==================== PUT /api/users/{id} ====================
  describe('PUT /api/users/{id}', () => {
    it('应能更新自己的资料', async () => {
      const updateData = {
        email: 'updated@test.com',
        phone: '13800138000',
        department: '测试部门',
        bio: '这是个人简介测试'
      }
      const res = await authClient().put(`/users/${userId}`, updateData)
      expectSuccess(res.data)
      expect(res.data.data.email).toBe(updateData.email)
      expect(res.data.data.phone).toBe(updateData.phone)
      expect(res.data.data.department).toBe(updateData.department)
      expect(res.data.data.bio).toBe(updateData.bio)
    })

    it('应能部分更新（仅更新 email）', async () => {
      const res = await authClient().put(`/users/${userId}`, { email: 'partial@test.com' })
      expectSuccess(res.data)
      expect(res.data.data.email).toBe('partial@test.com')
    })

    it('不应能更新其他用户的资料', async () => {
      // 注册另一个用户
      const other = await registerAndLogin({ jobRole: 'pm_ops' })
      // 用 other 的 token 尝试更新第一个用户
      try {
        await createClient(other.response.data.token).put(`/users/${userId}`, { email: 'hack@test.com' })
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })

    it('未登录不应能更新用户资料', async () => {
      clearAuthToken()
      try {
        await anonymousClient().put(`/users/${userId}`, { email: 'noauth@test.com' })
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expect(errData.code).toBe(401)
      }
    })
  })

  // ==================== PUT /api/users/{id}/job-role ====================
  describe('PUT /api/users/{id}/job-role', () => {
    it('应能切换自己的岗位角色', async () => {
      const res = await authClient().put(`/users/${userId}/job-role`, null, {
        params: { jobRole: 'pm_ops' }
      })
      expectSuccess(res.data)
      expect(res.data.data.jobRole).toBe('pm_ops')
    })

    it('应能切换到 qa 角色', async () => {
      const res = await authClient().put(`/users/${userId}/job-role`, null, {
        params: { jobRole: 'qa' }
      })
      expectSuccess(res.data)
      expect(res.data.data.jobRole).toBe('qa')
    })

    it('应拒绝无效的岗位角色', async () => {
      try {
        await authClient().put(`/users/${userId}/job-role`, null, {
          params: { jobRole: 'invalid' }
        })
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })
  })
})
