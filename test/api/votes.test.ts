/**
 * 投票模块 API 测试
 * 覆盖：对问题投票、对回答投票、点赞/踩
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  createClient,
  authClient,
  anonymousClient,
  registerAndLogin,
  registerUser,
  setAuthToken,
  createQuestion,
  createAnswer,
  expectSuccess,
  expectError,
  extractErrorData,
  clearAuthToken
} from './helpers'

describe('Votes 模块', () => {
  let questionId: number
  let answerId: number
  let voterToken: string

  beforeEach(async () => {
    // User A creates question and answer
    const { response } = await registerAndLogin()
    const qRes = await createQuestion()
    questionId = qRes.data.id
    const aRes = await createAnswer(questionId)
    answerId = aRes.data.id

    // User B will be the voter
    const voterRes = await registerUser()
    voterToken = voterRes.data.token
  })

  // ==================== POST /api/votes ====================
  describe('POST 投票', () => {
    it('应能对问题点赞', async () => {
      const res = await createClient(voterToken).post('/votes', {
        targetId: questionId,
        targetType: 'question',
        voteType: 'up'
      })
      expectSuccess(res.data)
    })

    it('应能对问题踩', async () => {
      const res = await createClient(voterToken).post('/votes', {
        targetId: questionId,
        targetType: 'question',
        voteType: 'down'
      })
      expectSuccess(res.data)
    })

    it('应能对回答点赞', async () => {
      const res = await createClient(voterToken).post('/votes', {
        targetId: answerId,
        targetType: 'answer',
        voteType: 'up'
      })
      expectSuccess(res.data)
    })

    it('应能对回答踩', async () => {
      const res = await createClient(voterToken).post('/votes', {
        targetId: answerId,
        targetType: 'answer',
        voteType: 'down'
      })
      expectSuccess(res.data)
    })

    it('无效的 voteType 应被拒绝', async () => {
      try {
        await createClient(voterToken).post('/votes', {
          targetId: questionId,
          targetType: 'question',
          voteType: 'invalid'
        })
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })

    it('无效的 targetType 应被拒绝', async () => {
      try {
        await createClient(voterToken).post('/votes', {
          targetId: questionId,
          targetType: 'invalid',
          voteType: 'up'
        })
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expectError(errData)
      }
    })

    it('未登录不应能投票', async () => {
      clearAuthToken()
      try {
        await anonymousClient().post('/votes', {
          targetId: questionId,
          targetType: 'question',
          voteType: 'up'
        })
        expect.unreachable('应该抛出错误')
      } catch (error) {
        const errData = extractErrorData(error)
        expect(errData.code).toBe(401)
      }
    })

    it('投票后问题的 voteCount 应更新', async () => {
      // 获取投票前的问题状态
      const before = await anonymousClient().get(`/questions/${questionId}`)
      const voteCountBefore = before.data.data.voteCount

      // 用另一个用户投票
      await createClient(voterToken).post('/votes', {
        targetId: questionId,
        targetType: 'question',
        voteType: 'up'
      })

      // 获取投票后的问题状态
      const after = await anonymousClient().get(`/questions/${questionId}`)
      expect(after.data.data.voteCount).toBe(voteCountBefore + 1)
    })

    it('大小写 targetType 都应支持（QUESTION / question）', async () => {
      // 用大写 QUESTION 投票
      const res1 = await createClient(voterToken).post('/votes', {
        targetId: answerId,
        targetType: 'ANSWER',
        voteType: 'up'
      })
      expectSuccess(res1.data)

      // 用小写 question 投票（验证 Converter 兼容旧数据）
      const res2 = await createClient(voterToken).post('/votes', {
        targetId: questionId,
        targetType: 'question',
        voteType: 'up'
      })
      expectSuccess(res2.data)
    })

    it('重复投票应能取消（同向取消）', async () => {
      const voter = createClient(voterToken)
      // 第一次投票
      await voter.post('/votes', {
        targetId: questionId,
        targetType: 'question',
        voteType: 'up'
      })
      // 获取投票后的 voteCount
      const after1 = await anonymousClient().get(`/questions/${questionId}`)
      const countAfterVote = after1.data.data.voteCount

      // 同向再投 = 取消
      try {
        await voter.post('/votes', {
          targetId: questionId,
          targetType: 'question',
          voteType: 'up'
        })
      } catch (error) {
        const errData = extractErrorData(error)
        // 如果后端尚未重启应用 Converter 修复，会返回 500
        if (errData && errData.code === 500) {
          console.log('重复投票500错误详情:', JSON.stringify(errData))
        }
        throw error
      }
      const after2 = await anonymousClient().get(`/questions/${questionId}`)
      expect(after2.data.data.voteCount).toBe(countAfterVote - 1)
    })

    it('反向投票应切换（赞→踩）', async () => {
      const voter = createClient(voterToken)
      // 先赞
      await voter.post('/votes', {
        targetId: questionId,
        targetType: 'question',
        voteType: 'up'
      })
      const after1 = await anonymousClient().get(`/questions/${questionId}`)
      const countAfterUp = after1.data.data.voteCount

      // 改踩
      await voter.post('/votes', {
        targetId: questionId,
        targetType: 'question',
        voteType: 'down'
      })
      const after2 = await anonymousClient().get(`/questions/${questionId}`)
      expect(after2.data.data.voteCount).toBe(countAfterUp - 1)
    })
  })
})
