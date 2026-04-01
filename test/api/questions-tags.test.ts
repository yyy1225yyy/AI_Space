/**
 * 带标签问题的增强测试
 * 模拟真实用户流程：从标签列表中选择已有标签 → 创建带标签问题 → 验证标签计数
 * 覆盖：选择已有标签创建问题、标签计数同步(B23)、更新问题标签、删除问题对标签影响
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
  setAuthToken,
  uniqueUsername,
  createClient,
  type TagDTO,
  type ApiResponse
} from './helpers'

/** 获取指定岗位的已有标签列表 */
async function getExistingTags(jobRole = 'rd'): Promise<TagDTO[]> {
  const res = await anonymousClient().get('/tags', { params: { jobRole } })
  expectSuccess(res.data)
  return res.data.data as TagDTO[]
}

/** 获取指定分类下的标签 */
function getTagsByCategory(tags: TagDTO[], category: string): TagDTO[] {
  return tags.filter(t => t.category === category)
}

describe('带标签问题增强测试', () => {
  let userId: number
  let token: string

  beforeEach(async () => {
    const { response } = await registerAndLogin()
    userId = response.data.userId
    token = response.data.token
  })

  describe('从标签列表中选择已有标签', () => {
    it('应能选择已有标签创建问题', async () => {
      const tags = await getExistingTags('rd')
      expect(tags.length).toBeGreaterThan(0)

      // 选择第一个已有标签
      const selectedTag = tags[0].name
      const res = await createQuestion({ tags: [selectedTag] })
      expectSuccess(res)
      expect(res.data.tags.some((t: TagDTO) => t.name === selectedTag)).toBe(true)
    })

    it('应能选择多个已有标签创建问题', async () => {
      const tags = await getExistingTags('rd')
      if (tags.length < 2) return

      const selected = [tags[0].name, tags[1].name]
      const res = await createQuestion({ tags: selected })
      expectSuccess(res)
      for (const name of selected) {
        expect(res.data.tags.some((t: TagDTO) => t.name === name)).toBe(true)
      }
    })

    it('选择标签后标签的 questionCount 应增加', async () => {
      const tags = await getExistingTags('rd')
      expect(tags.length).toBeGreaterThan(0)
      const tagName = tags[0].name
      const countBefore = tags[0].questionCount || 0

      await createQuestion({ tags: [tagName] })

      const tagsAfter = await getExistingTags('rd')
      const tagAfter = tagsAfter.find((t: TagDTO) => t.name === tagName)
      expect(tagAfter).toBeDefined()
      expect(tagAfter!.questionCount).toBeGreaterThan(countBefore)
    })
  })

  describe('各岗位使用已有标签创建问题', () => {
    it('研发岗位应能用 AI开发 类标签创建问题', async () => {
      const tags = await getExistingTags('rd')
      const aiDevTags = getTagsByCategory(tags, 'AI开发')
      if (aiDevTags.length === 0) return

      const selected = aiDevTags.map(t => t.name)
      const res = await createQuestion({ jobRole: 'rd', tags: selected })
      expectSuccess(res)
      for (const name of selected) {
        expect(res.data.tags.some((t: TagDTO) => t.name === name)).toBe(true)
      }
    })

    it('研发岗位应能用开发工具类标签创建问题', async () => {
      const tags = await getExistingTags('rd')
      const toolTags = getTagsByCategory(tags, '开发工具')
      if (toolTags.length === 0) return

      const res = await createQuestion({ jobRole: 'rd', tags: [toolTags[0].name] })
      expectSuccess(res)
      expect(res.data.tags.some((t: TagDTO) => t.name === toolTags[0].name)).toBe(true)
    })

    it('产品岗位应能用已有标签创建问题', async () => {
      const pmUser = await registerAndLogin({ username: uniqueUsername('pm_qtag'), jobRole: 'pm_ops' })
      setAuthToken(pmUser.response.data.token)

      const tags = await getExistingTags('pm_ops')
      if (tags.length === 0) return

      const res = await createQuestion({ jobRole: 'pm_ops', tags: [tags[0].name] })
      expectSuccess(res)
      expect(res.data.tags.some((t: TagDTO) => t.name === tags[0].name)).toBe(true)
    })

    it('测试岗位应能用已有标签创建问题', async () => {
      const qaUser = await registerAndLogin({ username: uniqueUsername('qa_qtag'), jobRole: 'qa' })
      setAuthToken(qaUser.response.data.token)

      const tags = await getExistingTags('qa')
      if (tags.length === 0) return

      const res = await createQuestion({ jobRole: 'qa', tags: [tags[0].name] })
      expectSuccess(res)
      expect(res.data.tags.some((t: TagDTO) => t.name === tags[0].name)).toBe(true)
    })

    it('跨分类标签应能同时选择', async () => {
      const tags = await getExistingTags('rd')
      const aiTags = getTagsByCategory(tags, 'AI开发')
      const appTags = getTagsByCategory(tags, '应用场景')
      if (aiTags.length === 0 || appTags.length === 0) return

      const selected = [aiTags[0].name, appTags[0].name]
      const res = await createQuestion({ jobRole: 'rd', tags: selected })
      expectSuccess(res)
      expect(res.data.tags.length).toBeGreaterThanOrEqual(2)
    })

    it('创建后应能通过标签名查询到该问题', async () => {
      const tags = await getExistingTags('rd')
      if (tags.length === 0) return

      const tagName = tags[0].name
      await createQuestion({ tags: [tagName] })

      // 通过标签名查询关联的问题
      const res = await anonymousClient().get(`/tags/${tagName}/questions`)
      expectSuccess(res.data)
      expect(res.data.data.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('B23 验证：标签 questionCount 同步', () => {
    it('多个问题使用同一标签时计数应正确累加', async () => {
      const tags = await getExistingTags('rd')
      expect(tags.length).toBeGreaterThan(0)
      const tagName = tags[0].name
      const countBefore = tags[0].questionCount || 0

      for (let i = 0; i < 2; i++) {
        setAuthToken(token)
        await createQuestion({ tags: [tagName] })
      }

      const tagsAfter = await getExistingTags('rd')
      const tagAfter = tagsAfter.find((t: TagDTO) => t.name === tagName)
      expect(tagAfter).toBeDefined()
      expect(tagAfter!.questionCount).toBe(countBefore + 2)
    })

    it('不同岗位的标签计数应独立', async () => {
      const rdTags = await getExistingTags('rd')
      const pmTags = await getExistingTags('pm_ops')

      if (rdTags.length === 0 || pmTags.length === 0) return

      const rdCountBefore = rdTags[0].questionCount || 0

      await createQuestion({ jobRole: 'rd', tags: [rdTags[0].name] })

      const rdTagsAfter = await getExistingTags('rd')
      const rdAfter = rdTagsAfter.find((t: TagDTO) => t.id === rdTags[0].id)
      expect(rdAfter!.questionCount).toBe(rdCountBefore + 1)

      const pmTagsAfter = await getExistingTags('pm_ops')
      const pmAfter = pmTagsAfter.find((t: TagDTO) => t.id === pmTags[0].id)
      expect(pmAfter!.questionCount).toBe(pmTags[0].questionCount)
    })
  })

  describe('更新问题标签', () => {
    it('应能将问题标签替换为其他已有标签', async () => {
      const tags = await getExistingTags('rd')
      if (tags.length < 2) return

      const q = await createQuestion({ tags: [tags[0].name] })
      expect(q.data.tags.some((t: TagDTO) => t.name === tags[0].name)).toBe(true)

      const updateRes = await authClient().put(`/questions/${q.data.id}`, {
        title: q.data.title,
        content: q.data.content,
        jobRole: 'rd',
        level: 'medium',
        tags: [tags[1].name]
      })
      expectSuccess(updateRes.data)
      expect(updateRes.data.data.tags.some((t: TagDTO) => t.name === tags[1].name)).toBe(true)
    })

    it('更新标签后旧标签计数应减少，新标签计数应增加', async () => {
      const tags = await getExistingTags('rd')
      if (tags.length < 2) return

      const oldTagName = tags[0].name
      const newTagName = tags[1].name
      const oldCountBefore = tags[0].questionCount || 0
      const newCountBefore = tags[1].questionCount || 0

      const q = await createQuestion({ tags: [oldTagName] })

      await authClient().put(`/questions/${q.data.id}`, {
        title: q.data.title,
        content: q.data.content,
        jobRole: 'rd',
        level: 'medium',
        tags: [newTagName]
      })

      const tagsAfter = await getExistingTags('rd')
      const oldTag = tagsAfter.find((t: TagDTO) => t.name === oldTagName)
      const newTag = tagsAfter.find((t: TagDTO) => t.name === newTagName)
      expect(oldTag!.questionCount).toBe(oldCountBefore)  // 创建+1，更新-1，抵消
      expect(newTag!.questionCount).toBe(newCountBefore + 1)
    })

    it('清空标签后原标签计数应减少', async () => {
      const tags = await getExistingTags('rd')
      if (tags.length === 0) return

      const tagName = tags[0].name
      const countBefore = tags[0].questionCount || 0

      const q = await createQuestion({ tags: [tagName] })

      await authClient().put(`/questions/${q.data.id}`, {
        title: q.data.title,
        content: q.data.content,
        jobRole: 'rd',
        level: 'medium',
        tags: []
      })

      const tagsAfter = await getExistingTags('rd')
      const tagAfter = tagsAfter.find((t: TagDTO) => t.name === tagName)
      expect(tagAfter!.questionCount).toBe(countBefore)
    })
  })

  describe('删除问题对标签计数的影响', () => {
    it('删除问题后对应标签计数应减少', async () => {
      const tags = await getExistingTags('rd')
      if (tags.length === 0) return

      const tagName = tags[0].name
      const countBefore = tags[0].questionCount || 0

      const q = await createQuestion({ tags: [tagName] })

      await authClient().delete(`/questions/${q.data.id}`)

      const tagsAfter = await getExistingTags('rd')
      const tagAfter = tagsAfter.find((t: TagDTO) => t.name === tagName)
      expect(tagAfter!.questionCount).toBe(countBefore)
    })
  })

  describe('标签列表查询', () => {
    it('标签列表应按岗位正确分组', async () => {
      const rdTags = await getExistingTags('rd')
      const pmTags = await getExistingTags('pm_ops')
      const qaTags = await getExistingTags('qa')

      rdTags.forEach(t => expect(t.jobRole).toBe('rd'))
      pmTags.forEach(t => expect(t.jobRole).toBe('pm_ops'))
      qaTags.forEach(t => expect(t.jobRole).toBe('qa'))
    })

    it('标签应包含 questionCount 和 category 字段', async () => {
      const tags = await getExistingTags('rd')
      expect(tags.length).toBeGreaterThan(0)
      tags.forEach(t => {
        expect(t.questionCount).toBeDefined()
        expect(typeof t.questionCount).toBe('number')
        expect(t.questionCount).toBeGreaterThanOrEqual(0)
        expect('category' in t).toBe(true)
      })
    })

    it('通过标签名查询应返回关联问题', async () => {
      const tags = await getExistingTags('rd')
      // 找一个有问题的标签
      const tagWithQuestions = tags.find(t => (t.questionCount || 0) > 0)
      if (!tagWithQuestions) return

      const res = await anonymousClient().get(`/tags/${tagWithQuestions.name}/questions`)
      expectSuccess(res.data)
      expect(res.data.data.length).toBeGreaterThan(0)
    })

    it('标签列表应包含真实业务标签（AI开发/应用场景/开发工具等分类）', async () => {
      const tags = await getExistingTags('rd')
      const categories = [...new Set(tags.map(t => t.category).filter(Boolean))]
      expect(categories.length).toBeGreaterThanOrEqual(2)
    })
  })
})
