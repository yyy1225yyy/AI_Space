/**
 * 岗位角色模块 API 测试
 * 覆盖：获取所有配置、按key获取、获取标签、获取统计
 */
import { describe, it, expect } from 'vitest'
import {
  anonymousClient,
  expectSuccess,
  expectError,
  extractErrorData
} from './helpers'

describe('Job Roles 模块', () => {
  const validRoles = ['rd', 'pm_ops', 'qa']

  // ==================== GET /api/job-roles ====================
  describe('GET /api/job-roles', () => {
    it('应返回所有岗位角色配置', async () => {
      const res = await anonymousClient().get('/job-roles')
      expectSuccess(res.data)
      expect(Array.isArray(res.data.data)).toBe(true)
      expect(res.data.data.length).toBe(3)
    })

    it('每个角色应包含必要字段', async () => {
      const res = await anonymousClient().get('/job-roles')
      expectSuccess(res.data)
      res.data.data.forEach((role: Record<string, unknown>) => {
        expect(role.roleKey).toBeDefined()
        expect(role.roleName).toBeDefined()
        expect(role.levelNames).toBeDefined()
      })
    })
  })

  // ==================== GET /api/job-roles/{key} ====================
  describe('GET /api/job-roles/{key}', () => {
    it('应能获取 rd 角色配置', async () => {
      const res = await anonymousClient().get('/job-roles/rd')
      expectSuccess(res.data)
      expect(res.data.data.roleKey).toBe('rd')
    })

    it('应能获取 pm_ops 角色配置', async () => {
      const res = await anonymousClient().get('/job-roles/pm_ops')
      expectSuccess(res.data)
      expect(res.data.data.roleKey).toBe('pm_ops')
    })

    it('应能获取 qa 角色配置', async () => {
      const res = await anonymousClient().get('/job-roles/qa')
      expectSuccess(res.data)
      expect(res.data.data.roleKey).toBe('qa')
    })

    it('不存在的角色应返回错误', async () => {
      try {
        await anonymousClient().get('/job-roles/invalid')
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })
  })

  // ==================== GET /api/job-roles/{key}/tags ====================
  describe('GET /api/job-roles/{key}/tags', () => {
    validRoles.forEach(role => {
      it(`${role} 应有关联标签`, async () => {
        const res = await anonymousClient().get(`/job-roles/${role}/tags`)
        expectSuccess(res.data)
        expect(Array.isArray(res.data.data)).toBe(true)
        expect(res.data.data.length).toBeGreaterThan(0)
        res.data.data.forEach((tag: { jobRole: string }) => {
          expect(tag.jobRole).toBe(role)
        })
      })
    })
  })

  // ==================== GET /api/job-roles/{key}/stats ====================
  describe('GET /api/job-roles/{key}/stats', () => {
    validRoles.forEach(role => {
      it(`${role} 应返回统计数据`, async () => {
        const res = await anonymousClient().get(`/job-roles/${role}/stats`)
        expectSuccess(res.data)
        expect(res.data.data).toBeDefined()
        // 统计应包含数字类型的数据
        expect(typeof res.data.data).toBe('object')
      })
    })
  })
})
