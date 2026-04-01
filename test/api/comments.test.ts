/**
 * 评论模块 API 测试
 * 覆盖：创建评论、获取评论列表（问题评论 & 回答评论）
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  authClient,
  anonymousClient,
  registerAndLogin,
  createQuestion,
  createAnswer,
  generateCommentData,
  expectSuccess,
  expectError,
  extractErrorData,
  clearAuthToken
} from './helpers'

describe('Comments 模块', () => {
  let userId: number
  let token: string
  let questionId: number
  let answerId: number

  beforeEach(async () => {
    const { response } = await registerAndLogin()
    userId = response.data.userId
    token = response.data.token
    const qRes = await createQuestion()
    questionId = qRes.data.id
    const aRes = await createAnswer(questionId)
    answerId = aRes.data.id
  })

  // ==================== POST /api/comments ====================
  describe('POST 创建评论', () => {
    it('应能对问题发表评论', async () => {
      const data = generateCommentData(questionId, 'question')
      const res = await authClient().post('/comments', data)
      expectSuccess(res.data)
      expect(res.data.data.content).toBe(data.content)
      expect(res.data.data.targetId).toBe(questionId)
      expect(res.data.data.targetType).toBe('question')
      expect(res.data.data.userId).toBe(userId)
    })

    it('应能对回答发表评论', async () => {
      const data = generateCommentData(answerId, 'answer')
      const res = await authClient().post('/comments', data)
      expectSuccess(res.data)
      expect(res.data.data.targetId).toBe(answerId)
      expect(res.data.data.targetType).toBe('answer')
    })

    it('缺少内容应被拒绝', async () => {
      try {
        await authClient().post('/comments', { targetId: questionId, targetType: 'question' })
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })

    it('未登录不应能发表评论', async () => {
      clearAuthToken()
      try {
        await anonymousClient().post('/comments', generateCommentData(questionId, 'question'))
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expect(errData.code).toBe(401)
      }
    })
  })

  // ==================== GET /api/comments ====================
  describe('GET 获取评论列表', () => {
    beforeEach(async () => {
      await authClient().post('/comments', generateCommentData(questionId, 'question'))
      await authClient().post('/comments', generateCommentData(questionId, 'question'))
      await authClient().post('/comments', generateCommentData(answerId, 'answer'))
    })

    it('应能获取问题的评论列表', async () => {
      const res = await anonymousClient().get('/comments', {
        params: { targetId: questionId, targetType: 'question' }
      })
      expectSuccess(res.data)
      expect(Array.isArray(res.data.data)).toBe(true)
      expect(res.data.data.length).toBeGreaterThanOrEqual(2)
      res.data.data.forEach((c: { targetType: string }) => {
        expect(c.targetType).toBe('question')
      })
    })

    it('应能获取回答的评论列表', async () => {
      const res = await anonymousClient().get('/comments', {
        params: { targetId: answerId, targetType: 'answer' }
      })
      expectSuccess(res.data)
      expect(res.data.data.length).toBeGreaterThanOrEqual(1)
      res.data.data.forEach((c: { targetType: string }) => {
        expect(c.targetType).toBe('answer')
      })
    })

    it('评论应包含用户信息', async () => {
      const res = await anonymousClient().get('/comments', {
        params: { targetId: questionId, targetType: 'question' }
      })
      expectSuccess(res.data)
      const comment = res.data.data[0]
      expect(comment.user).toBeDefined()
      expect(comment.user.username).toBeDefined()
    })

    it('无需登录即可查看评论', async () => {
      clearAuthToken()
      const res = await anonymousClient().get('/comments', {
        params: { targetId: questionId, targetType: 'question' }
      })
      expectSuccess(res.data)
    })
  })
})
