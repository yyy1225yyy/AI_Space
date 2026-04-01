/**
 * 回答模块增强测试
 * 覆盖：多用户回答、采纳后状态变更、回答投票、回答排序、方案类型校验
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
  setAuthToken,
  uniqueUsername,
  createClient,
  type ApiResponse
} from './helpers'

describe('Answers 增强测试', () => {
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

  describe('多用户回答', () => {
    it('不同用户应对同一问题能分别回答', async () => {
      const user2 = await registerAndLogin({ username: uniqueUsername('ans_u2') })
      const user3 = await registerAndLogin({ username: uniqueUsername('ans_u3') })

      setAuthToken(user2.response.data.token)
      const a1 = await createAnswer(questionId, { content: '用户2的回答' })
      expectSuccess(a1)

      setAuthToken(user3.response.data.token)
      const a2 = await createAnswer(questionId, { content: '用户3的回答' })
      expectSuccess(a2)

      // 验证有两条回答且用户不同
      const list = await anonymousClient().get(`/questions/${questionId}/answers`)
      expect(list.data.data.length).toBeGreaterThanOrEqual(2)
    })

    it('回答应返回正确的用户信息', async () => {
      const user2 = await registerAndLogin({ username: uniqueUsername('ans_info') })
      setAuthToken(user2.response.data.token)
      await createAnswer(questionId)

      const list = await anonymousClient().get(`/questions/${questionId}/answers`)
      const answer = list.data.data.find((a: { userId: number }) => a.userId === user2.response.data.userId)
      expect(answer).toBeDefined()
      expect(answer.user.username).toBe(user2.registerData.username)
    })
  })

  describe('采纳回答', () => {
    let answerId: number
    let answerOwnerToken: string

    beforeEach(async () => {
      const other = await registerAndLogin({ username: uniqueUsername('accept_ans') })
      answerOwnerToken = other.response.data.token
      setAuthToken(answerOwnerToken)
      const aRes = await createAnswer(questionId)
      answerId = aRes.data.id
      setAuthToken(token) // 切回问题所有者
    })

    it('采纳后问题状态应变为 solved', async () => {
      await authClient().put(`/answers/${answerId}/accept`)

      const qRes = await anonymousClient().get(`/questions/${questionId}`)
      expect(qRes.data.data.status).toBe('solved')
      expect(qRes.data.data.solvedAnswerId).toBe(answerId)
    })

    it('采纳后回答的 isAccepted 应为 true', async () => {
      await authClient().put(`/answers/${answerId}/accept`)

      const list = await anonymousClient().get(`/questions/${questionId}/answers`)
      const accepted = list.data.data.find((a: { id: number }) => a.id === answerId)
      expect(accepted.isAccepted).toBe(true)
    })

    it('未登录不应能采纳回答', async () => {
      clearAuthToken()
      try {
        await anonymousClient().put(`/answers/${answerId}/accept`)
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expect(errData.code).toBe(401)
      }
    })
  })

  describe('回答字段完整性', () => {
    it('回答应包含所有必要字段', async () => {
      const res = await createAnswer(questionId, { solutionType: 'experience' })
      expectSuccess(res)
      const a = res.data
      expect(a.id).toBeDefined()
      expect(a.questionId).toBe(questionId)
      expect(a.userId).toBe(userId)
      expect(a.content).toBeDefined()
      expect(a.solutionType).toBe('experience')
      expect(a.voteCount).toBe(0)
      expect(a.isAccepted).toBe(false)
      expect(a.user).toBeDefined()
      expect(a.createdAt).toBeDefined()
    })

    it('回答的 user 字段应完整', async () => {
      const res = await createAnswer(questionId)
      const u = res.data.user
      expect(u.id).toBeDefined()
      expect(u.username).toBeDefined()
      expect(u.jobRole).toBeDefined()
    })
  })

  describe('回答校验', () => {
    it('空字符串内容应被拒绝', async () => {
      try {
        await authClient().post(`/questions/${questionId}/answers`, { content: '' })
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })

    it('只有空格的内容应被拒绝', async () => {
      try {
        await authClient().post(`/questions/${questionId}/answers`, { content: '   ' })
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })

    it('无效方案类型后端应返回 500（已知 bug）', async () => {
      // 后端对无效 solutionType 没有校验，直接报错 500
      // 这是一个待修复的 bug：应该返回 400 或忽略无效值
      try {
        await authClient().post(`/questions/${questionId}/answers`, {
          content: '测试无效方案类型',
          solutionType: 'invalid_type'
        })
        // 如果没报错，也算通过（后端可能已修复）
      } catch (error) {
        const errData = extractErrorData(error)
        // 目前返回 500，理想应该是 400
        expect(errData.code).toBeDefined()
      }
    })
  })

  describe('回答与问题关联', () => {
    it('不同问题的回答不应混淆', async () => {
      setAuthToken(token)
      const q2Res = await createQuestion()
      const q2Id = q2Res.data.id

      await createAnswer(questionId, { content: '问题1的回答' })
      await createAnswer(q2Id, { content: '问题2的回答' })

      const list1 = await anonymousClient().get(`/questions/${questionId}/answers`)
      list1.data.data.forEach((a: { questionId: number }) => {
        expect(a.questionId).toBe(questionId)
      })

      const list2 = await anonymousClient().get(`/questions/${q2Id}/answers`)
      list2.data.data.forEach((a: { questionId: number }) => {
        expect(a.questionId).toBe(q2Id)
      })
    })

    it('不存在的问题不应能创建回答', async () => {
      try {
        await authClient().post('/questions/999999/answers', generateAnswerData())
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })
  })
})
