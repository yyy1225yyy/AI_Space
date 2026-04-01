/**
 * 问题模块 API 测试
 * 覆盖：创建、查询、更新、删除、筛选、分页
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  authClient,
  anonymousClient,
  registerAndLogin,
  createQuestion,
  generateQuestionData,
  expectSuccess,
  expectError,
  extractErrorData,
  clearAuthToken,
  createClient,
  uniqueUsername,
  type QuestionDTO
} from './helpers'

describe('Questions 模块', () => {
  let userId: number
  let token: string

  beforeEach(async () => {
    const { response } = await registerAndLogin()
    userId = response.data.userId
    token = response.data.token
  })

  // ==================== POST /api/questions ====================
  describe('POST /api/questions', () => {
    it('应成功创建问题', async () => {
      const data = generateQuestionData()
      const res = await authClient().post('/questions', data)
      expectSuccess(res.data)
      expect(res.data.data.title).toBe(data.title)
      expect(res.data.data.content).toBe(data.content)
      expect(res.data.data.jobRole).toBe(data.jobRole)
      expect(res.data.data.status).toBe('open')
      expect(res.data.data.userId).toBe(userId)
    })

    it('应能创建不同难度的问题', async () => {
      for (const level of ['easy', 'medium', 'hard', 'expert']) {
        const res = await authClient().post('/questions', generateQuestionData({ level }))
        expectSuccess(res.data)
        expect(res.data.data.level).toBe(level)
      }
    })

    it('应能创建不同岗位的问题', async () => {
      for (const jobRole of ['rd', 'pm_ops', 'qa']) {
        const res = await authClient().post('/questions', generateQuestionData({ jobRole }))
        expectSuccess(res.data)
        expect(res.data.data.jobRole).toBe(jobRole)
      }
    })

    it('应能设置悬赏积分', async () => {
      const res = await authClient().post('/questions', generateQuestionData({ bountyPoints: 50 }))
      expectSuccess(res.data)
      expect(res.data.data.bountyPoints).toBe(50)
    })

    it('缺少标题应被拒绝', async () => {
      try {
        await authClient().post('/questions', { content: '内容', jobRole: 'rd' })
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })

    it('缺少内容应被拒绝', async () => {
      try {
        await authClient().post('/questions', { title: '标题', jobRole: 'rd' })
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })

    it('未登录不应能创建问题', async () => {
      clearAuthToken()
      try {
        await anonymousClient().post('/questions', generateQuestionData())
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expect(errData.code).toBe(401)
      }
    })
  })

  // ==================== GET /api/questions ====================
  describe('GET /api/questions', () => {
    let questionId1: number
    let questionId2: number

    beforeEach(async () => {
      const q1 = await createQuestion({ jobRole: 'rd', level: 'easy' })
      questionId1 = q1.data.id
      const q2 = await createQuestion({ jobRole: 'pm_ops', level: 'hard' })
      questionId2 = q2.data.id
    })

    it('应返回问题列表（分页）', async () => {
      const res = await anonymousClient().get('/questions')
      expectSuccess(res.data)
      expect(res.data.data.list).toBeDefined()
      expect(res.data.data.total).toBeGreaterThan(0)
      expect(Array.isArray(res.data.data.list)).toBe(true)
    })

    it('应能按岗位筛选问题', async () => {
      const res = await anonymousClient().get('/questions', { params: { jobRole: 'rd' } })
      expectSuccess(res.data)
      const list: QuestionDTO[] = res.data.data.list
      list.forEach(q => expect(q.jobRole).toBe('rd'))
    })

    it('应能按状态筛选问题', async () => {
      const res = await anonymousClient().get('/questions', { params: { status: 'open' } })
      expectSuccess(res.data)
      const list: QuestionDTO[] = res.data.data.list
      list.forEach(q => expect(q.status).toBe('open'))
    })

    it('应支持分页参数', async () => {
      const res = await anonymousClient().get('/questions', { params: { page: 1, size: 5 } })
      expectSuccess(res.data)
      expect(res.data.data.size).toBeLessThanOrEqual(5)
    })

    it('无需登录即可浏览问题列表', async () => {
      clearAuthToken()
      const res = await anonymousClient().get('/questions')
      expectSuccess(res.data)
    })
  })

  // ==================== GET /api/questions/{id} ====================
  describe('GET /api/questions/{id}', () => {
    let questionId: number
    let questionData: ReturnType<typeof generateQuestionData>

    beforeEach(async () => {
      questionData = generateQuestionData()
      const res = await createQuestion(questionData)
      questionId = res.data.id
    })

    it('应能获取问题详情', async () => {
      const res = await anonymousClient().get(`/questions/${questionId}`)
      expectSuccess(res.data)
      expect(res.data.data.id).toBe(questionId)
      expect(res.data.data.title).toBe(questionData.title)
      expect(res.data.data.content).toBe(questionData.content)
    })

    it('不存在的问题应返回错误', async () => {
      try {
        await anonymousClient().get('/questions/999999')
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })

    it('默认获取问题应增加浏览量', async () => {
      // 第一次获取，记录 viewCount
      const res1 = await anonymousClient().get(`/questions/${questionId}`)
      expectSuccess(res1.data)
      const viewCount1 = res1.data.data.viewCount

      // 第二次获取（默认 incrementView=true）
      const res2 = await anonymousClient().get(`/questions/${questionId}`)
      expectSuccess(res2.data)
      expect(res2.data.data.viewCount).toBe(viewCount1 + 1)
    })

    it('incrementView=false 时不应增加浏览量', async () => {
      // 第一次获取
      const res1 = await anonymousClient().get(`/questions/${questionId}`)
      expectSuccess(res1.data)
      const viewCount1 = res1.data.data.viewCount

      // incrementView=false 获取
      const res2 = await anonymousClient().get(`/questions/${questionId}?incrementView=false`)
      expectSuccess(res2.data)
      expect(res2.data.data.viewCount).toBe(viewCount1)

      // 再次 incrementView=false，仍不变
      const res3 = await anonymousClient().get(`/questions/${questionId}?incrementView=false`)
      expectSuccess(res3.data)
      expect(res3.data.data.viewCount).toBe(viewCount1)
    })

    it('incrementView=true 和默认行为一致', async () => {
      const res1 = await anonymousClient().get(`/questions/${questionId}?incrementView=false`)
      const viewCount1 = res1.data.data.viewCount

      const res2 = await anonymousClient().get(`/questions/${questionId}?incrementView=true`)
      expectSuccess(res2.data)
      expect(res2.data.data.viewCount).toBe(viewCount1 + 1)
    })
  })

  // ==================== PUT /api/questions/{id} ====================
  describe('PUT /api/questions/{id}', () => {
    let questionId: number

    beforeEach(async () => {
      const res = await createQuestion()
      questionId = res.data.id
    })

    it('应能更新自己的问题', async () => {
      const updateData = {
        title: '更新后的标题',
        content: '更新后的内容',
        jobRole: 'rd',
        level: 'hard'
      }
      const res = await authClient().put(`/questions/${questionId}`, updateData)
      expectSuccess(res.data)
      expect(res.data.data.title).toBe(updateData.title)
      expect(res.data.data.level).toBe('hard')
    })

    it('不应能更新他人的问题', async () => {
      const other = await registerAndLogin({ username: uniqueUsername('other'), jobRole: 'pm_ops' })
      try {
        await createClient(other.response.data.token).put(`/questions/${questionId}`, {
          title: '黑客修改',
          content: '内容',
          jobRole: 'rd'
        })
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })
  })

  // ==================== DELETE /api/questions/{id} ====================
  describe('DELETE /api/questions/{id}', () => {
    let questionId: number

    beforeEach(async () => {
      const res = await createQuestion()
      questionId = res.data.id
    })

    it('应能删除自己的问题', async () => {
      const res = await authClient().delete(`/questions/${questionId}`)
      expectSuccess(res.data)

      // 确认已删除
      try {
        await anonymousClient().get(`/questions/${questionId}`)
        expect.unreachable('问题应该已被删除')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })

    it('不应能删除他人的问题', async () => {
      const other = await registerAndLogin({ username: uniqueUsername('other2'), jobRole: 'qa' })
      try {
        await createClient(other.response.data.token).delete(`/questions/${questionId}`)
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })
  })
})
