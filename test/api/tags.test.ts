/**
 * 标签模块 API 测试
 * 覆盖：获取所有标签、按岗位获取、按名称获取
 */
import { describe, it, expect } from 'vitest'
import {
  anonymousClient,
  expectSuccess,
  expectError,
  extractErrorData
} from './helpers'

describe('Tags 模块', () => {

  // ==================== GET /api/tags ====================
  describe('GET /api/tags', () => {
    it('应返回所有标签列表', async () => {
      const res = await anonymousClient().get('/tags')
      expectSuccess(res.data)
      expect(Array.isArray(res.data.data)).toBe(true)
      expect(res.data.data.length).toBeGreaterThan(0)
    })

    it('标签应包含必要字段', async () => {
      const res = await anonymousClient().get('/tags')
      expectSuccess(res.data)
      const tag = res.data.data[0]
      expect(tag.id).toBeDefined()
      expect(tag.name).toBeDefined()
      expect(tag.jobRole).toBeDefined()
    })

    it('应能按岗位筛选标签', async () => {
      const res = await anonymousClient().get('/tags', { params: { jobRole: 'rd' } })
      expectSuccess(res.data)
      expect(Array.isArray(res.data.data)).toBe(true)
      res.data.data.forEach((tag: { jobRole: string }) => {
        expect(tag.jobRole).toBe('rd')
      })
    })

    it('pm_ops 岗位应有标签', async () => {
      const res = await anonymousClient().get('/tags', { params: { jobRole: 'pm_ops' } })
      expectSuccess(res.data)
      expect(res.data.data.length).toBeGreaterThan(0)
    })

    it('qa 岗位应有标签', async () => {
      const res = await anonymousClient().get('/tags', { params: { jobRole: 'qa' } })
      expectSuccess(res.data)
      expect(res.data.data.length).toBeGreaterThan(0)
    })
  })

  // ==================== GET /api/tags/{name} ====================
  describe('GET /api/tags/{name}', () => {
    it('应能按名称获取标签', async () => {
      // 先获取一个存在的标签名
      const allTags = await anonymousClient().get('/tags')
      expectSuccess(allTags.data)
      if (allTags.data.data.length > 0) {
        const tagName = allTags.data.data[0].name
        const res = await anonymousClient().get(`/tags/${tagName}`)
        expectSuccess(res.data)
        expect(res.data.data.name).toBe(tagName)
      }
    })

    it('不存在的标签名应返回错误', async () => {
      try {
        await anonymousClient().get('/tags/不存在的标签名_xyz')
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })
  })
})
