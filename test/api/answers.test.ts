/**
 * 回答模块 API 测试
 * 覆盖：创建回答、获取回答列表、采纳回答
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  authClient,
  anonymousClient,
  registerAndLogin,
  createQuestion,
  createAnswer,
  generateAnswerData,
  expectSuccess,
  expectError,
  extractErrorData,
  clearAuthToken,
  uniqueUsername,
  createClient,
  setAuthToken
} from './helpers'

describe('Answers 模块', () => {
  let questionId: number
  let userId: number
  let token: string

  beforeEach(async () => {
    const { response } = await registerAndLogin()
    userId = response.data.userId
    token = response.data.token
    const qRes = await createQuestion()
    questionId = qRes.data.id
  })

  // ==================== POST /api/questions/{questionId}/answers ====================
  describe('POST 创建回答', () => {
    it('应成功创建回答', async () => {
      const data = generateAnswerData()
      const res = await authClient().post(`/questions/${questionId}/answers`, data)
      expectSuccess(res.data)
      expect(res.data.data.content).toBe(data.content)
      expect(res.data.data.questionId).toBe(questionId)
      expect(res.data.data.userId).toBe(userId)
      expect(res.data.data.voteCount).toBe(0)
      expect(res.data.data.isAccepted).toBe(false)
    })

    it('应能指定解决方案类型', async () => {
      for (const type of ['skill', 'file', 'feasibility', 'experience']) {
        const res = await authClient().post(`/questions/${questionId}/answers`, generateAnswerData({ solutionType: type }))
        expectSuccess(res.data)
        expect(res.data.data.solutionType).toBe(type)
      }
    })

    it('缺少内容应被拒绝', async () => {
      try {
        await authClient().post(`/questions/${questionId}/answers`, {})
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })

    it('未登录不应能创建回答', async () => {
      clearAuthToken()
      try {
        await anonymousClient().post(`/questions/${questionId}/answers`, generateAnswerData())
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expect(errData.code).toBe(401)
      }
    })
  })

  // ==================== GET /api/questions/{questionId}/answers ====================
  describe('GET 获取回答列表', () => {
    beforeEach(async () => {
      await createAnswer(questionId)
      await createAnswer(questionId)
    })

    it('应返回指定问题的回答列表', async () => {
      const res = await anonymousClient().get(`/questions/${questionId}/answers`)
      expectSuccess(res.data)
      expect(Array.isArray(res.data.data)).toBe(true)
      expect(res.data.data.length).toBeGreaterThanOrEqual(2)
    })

    it('回答应包含用户信息', async () => {
      const res = await anonymousClient().get(`/questions/${questionId}/answers`)
      expectSuccess(res.data)
      const answer = res.data.data[0]
      expect(answer.user).toBeDefined()
      expect(answer.user.username).toBeDefined()
    })

    it('无需登录即可查看回答', async () => {
      clearAuthToken()
      const res = await anonymousClient().get(`/questions/${questionId}/answers`)
      expectSuccess(res.data)
    })
  })

  // ==================== PUT /api/answers/{id}/accept ====================
  describe('PUT 采纳回答', () => {
    let answerId: number
    let answerOwnerToken: string

    beforeEach(async () => {
      // 另一个用户创建回答
      const other = await registerAndLogin({ username: uniqueUsername('answerer'), jobRole: 'pm_ops' })
      answerOwnerToken = other.response.data.token
      const aRes = await createAnswer(questionId)
      answerId = aRes.data.id

      // 切回问题所有者
      setAuthToken(token)
    })

    it('问题所有者应能采纳回答', async () => {
      const res = await authClient().put(`/answers/${answerId}/accept`)
      expectSuccess(res.data)
      expect(res.data.data.isAccepted).toBe(true)
    })

    it('非问题所有者不应能采纳回答', async () => {
      try {
        await createClient(answerOwnerToken).put(`/answers/${answerId}/accept`)
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })
  })
})
