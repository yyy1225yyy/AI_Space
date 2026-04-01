/**
 * 认证模块 API 测试
 * 覆盖：注册、登录、参数校验、异常处理
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  anonymousClient,
  generateRegisterData,
  expectSuccess,
  expectError,
  extractErrorData,
  registerAndLogin,
  clearAuthToken,
  uniqueUsername
} from './helpers'

describe('Auth 模块', () => {
  beforeEach(() => {
    clearAuthToken()
  })

  // ==================== 注册 ====================
  describe('POST /api/auth/register', () => {
    it('应成功注册新用户（完整字段）', async () => {
      const data = generateRegisterData()
      const res = await anonymousClient().post('/auth/register', data)
      const body = res.data
      expectSuccess(body)
      expect(body.data.token).toBeDefined()
      expect(body.data.userId).toBeDefined()
      expect(body.data.username).toBe(data.username)
      expect(body.data.jobRole).toBe(data.jobRole)
      expect(body.data.role).toBe('user')
      expect(body.data.level).toBe(1)
      expect(body.data.points).toBe(100)
    })

    it('应成功注册（仅必填字段：username, password, jobRole）', async () => {
      const data = {
        username: uniqueUsername(),
        password: 'Test123456',
        jobRole: 'pm_ops'
      }
      const res = await anonymousClient().post('/auth/register', data)
      expectSuccess(res.data)
      expect(res.data.data.token).toBeDefined()
      expect(res.data.data.jobRole).toBe('pm_ops')
    })

    it('应支持 qa 岗位注册', async () => {
      const data = generateRegisterData({ jobRole: 'qa' })
      const res = await anonymousClient().post('/auth/register', data)
      expectSuccess(res.data)
      expect(res.data.data.jobRole).toBe('qa')
    })

    it('应拒绝缺少 username 的注册', async () => {
      const data = { password: 'Test123456', jobRole: 'rd' }
      try {
        await anonymousClient().post('/auth/register', data)
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })

    it('应拒绝缺少 password 的注册', async () => {
      const data = { username: uniqueUsername(), jobRole: 'rd' }
      try {
        await anonymousClient().post('/auth/register', data)
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })

    it('应拒绝缺少 jobRole 的注册', async () => {
      const data = { username: uniqueUsername(), password: 'Test123456' }
      try {
        await anonymousClient().post('/auth/register', data)
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })

    it('应拒绝重复用户名注册', async () => {
      const data = generateRegisterData()
      await anonymousClient().post('/auth/register', data)
      try {
        await anonymousClient().post('/auth/register', data)
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })

    it('应拒绝无效的 jobRole', async () => {
      const data = generateRegisterData({ jobRole: 'invalid_role' })
      try {
        await anonymousClient().post('/auth/register', data)
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })

    it('应拒绝过短的密码', async () => {
      const data = generateRegisterData({ password: '123' })
      try {
        await anonymousClient().post('/auth/register', data)
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })
  })

  // ==================== 登录 ====================
  describe('POST /api/auth/login', () => {
    it('应使用已注册用户成功登录', async () => {
      const { registerData } = await registerAndLogin()
      clearAuthToken()

      const res = await anonymousClient().post('/auth/login', {
        username: registerData.username,
        password: registerData.password
      })
      expectSuccess(res.data)
      expect(res.data.data.token).toBeDefined()
      expect(res.data.data.username).toBe(registerData.username)
    })

    it('应拒绝错误的密码', async () => {
      const { registerData } = await registerAndLogin()
      clearAuthToken()

      try {
        await anonymousClient().post('/auth/login', {
          username: registerData.username,
          password: 'WrongPassword1'
        })
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })

    it('应拒绝不存在的用户', async () => {
      try {
        await anonymousClient().post('/auth/login', {
          username: 'nonexistent_user_xyz',
          password: 'Test123456'
        })
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })

    it('应拒绝空请求体', async () => {
      try {
        await anonymousClient().post('/auth/login', {})
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })
  })

  // ==================== Token 有效性 ====================
  describe('Token 有效性', () => {
    it('注册返回的 token 应能用于认证接口', async () => {
      const { response } = await registerAndLogin()
      // 用 token 访问需要认证的接口
      const res = await anonymousClient().get('/users/me', {
        headers: { Authorization: `Bearer ${response.data.token}` }
      })
      expectSuccess(res.data)
      expect(res.data.data.username).toBe(response.data.username)
    })

    it('无效 token 应被拒绝', async () => {
      try {
        await anonymousClient().get('/users/me', {
          headers: { Authorization: 'Bearer invalid_token_xyz' }
        })
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expect(errData.code).toBe(401)
      }
    })

    it('无 token 访问受保护接口应被拒绝', async () => {
      try {
        await anonymousClient().get('/users/me')
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expect(errData.code).toBe(401)
      }
    })
  })
})
