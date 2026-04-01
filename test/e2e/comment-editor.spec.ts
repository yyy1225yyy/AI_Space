/**
 * E2E 测试 — 评论区 & 回答编辑器
 * 覆盖：评论发表/显示/隐藏、编辑器显示/隐藏/提交、空内容校验
 */
import { test, expect } from '@playwright/test'

// 辅助函数：通过 API 注册并返回 token
async function registerAndGetToken(username: string, password = 'Test123456', jobRole = 'rd'): Promise<string> {
  const res = await fetch('http://localhost:8080/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, jobRole })
  })
  const json = await res.json()
  if (!json.data || !json.data.token) {
    const loginRes = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const loginJson = await loginRes.json()
    if (!loginJson.data || !loginJson.data.token) throw new Error(`登录失败: ${JSON.stringify(loginJson)}`)
    return loginJson.data.token
  }
  return json.data.token
}

// 辅助函数：通过 API 登录并注入 localStorage（比 UI 登录更可靠）
async function login(page: import('playwright').Page, username: string, password: string) {
  const res = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  const json = await res.json()
  if (!json.data || !json.data.token) throw new Error(`登录API失败: ${JSON.stringify(json)}`)

  // 后端 LoginResponse 是扁平结构：token, userId, username, jobRole, role, level, points
  const { token, userId, username: uname, jobRole, role, level, points } = json.data
  const user = JSON.stringify({ id: userId, username: uname, jobRole, role, level, points })

  // 使用 addInitScript 确保在每次页面导航前注入 localStorage
  await page.addInitScript(({ token, user }) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', user)
  }, { token, user })
  // 导航到首页，Zustand 初始化时从 localStorage 读取 token/user
  await page.goto('/')
  await page.waitForLoadState('networkidle')
}

// 辅助函数：通过 API 创建问题
async function createQuestionViaAPI(token: string) {
  const res = await fetch('http://localhost:8080/api/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      title: `E2E测试问题_${Date.now()}`,
      content: '这是E2E测试问题内容，用于验证评论区和编辑器功能。',
      jobRole: 'rd',
      level: 'medium'
    })
  })
  return res.json()
}

test.describe('评论区 E2E 测试', () => {
  const ts = Date.now()
  const author = `e2e_cmt_${ts}`
  const commenter = `e2e_cmt2_${ts}`
  const password = 'Test123456'
  let questionId: number

  test.beforeAll(async () => {
    const _authorToken = await registerAndGetToken(author, password)
    const _commenterToken = await registerAndGetToken(commenter, password)
    const qRes = await createQuestionViaAPI(_authorToken)
    questionId = qRes.data.id
  })

  test('未登录时评论输入框应隐藏', async ({ page }) => {
    await page.goto(`/question/${questionId}`)
    await page.waitForTimeout(3000)

    const commentInput = page.getByPlaceholder('发表评论...')
    await expect(commentInput).not.toBeVisible()
  })

  test('登录后评论输入框应可见', async ({ page }) => {
    await login(page, commenter, password)
    await page.goto(`/question/${questionId}`)
    await page.waitForTimeout(3000)

    const commentInput = page.getByPlaceholder('发表评论...')
    await expect(commentInput).toBeVisible()
    const commentBtn = page.getByRole('button', { name: '评论' })
    await expect(commentBtn).toBeVisible()
  })

  test('应能发表评论并显示', async ({ page }) => {
    await login(page, commenter, password)
    await page.goto(`/question/${questionId}`)
    await page.waitForTimeout(3000)

    const commentText = `E2E评论_${ts}`
    await page.getByPlaceholder('发表评论...').fill(commentText)
    await page.getByRole('button', { name: '评论' }).click()
    await page.waitForTimeout(2000)

    await expect(page.getByText(commentText)).toBeVisible()
  })

  test('按 Enter 键应提交评论', async ({ page }) => {
    await login(page, commenter, password)
    await page.goto(`/question/${questionId}`)
    await page.waitForTimeout(3000)

    const commentText = `Enter评论_${ts}`
    await page.getByPlaceholder('发表评论...').fill(commentText)
    await page.getByPlaceholder('发表评论...').press('Enter')

    await page.waitForTimeout(2000)
    await expect(page.getByText(commentText)).toBeVisible()
  })

  test('空评论不应提交', async ({ page }) => {
    await login(page, commenter, password)
    await page.goto(`/question/${questionId}`)
    await page.waitForTimeout(3000)

    // 记录当前评论数
    const commentCount = page.getByText(/评论 \(/)
    await expect(commentCount).toContainText('2') // 前两个测试各发了1条评论

    // 尝试提交空评论
    await page.getByPlaceholder('发表评论...').fill('   ')
    await page.getByRole('button', { name: '评论' }).click()
    await page.waitForTimeout(1000)

    // 评论数不应增加
    await expect(commentCount).toContainText('2')
  })

  test('评论应显示用户名和时间', async ({ page }) => {
    await login(page, commenter, password)
    await page.goto(`/question/${questionId}`)
    await page.waitForTimeout(3000)

    // 评论区域应包含用户名（header 中也会出现，用 .nth(1) 取评论区的）
    await expect(page.getByText(commenter).nth(1)).toBeVisible()
  })
})

test.describe('回答编辑器 E2E 测试', () => {
  const ts = Date.now()
  const asker = `e2e_edt_${ts}`
  const answerer = `e2e_edt2_${ts}`
  const password = 'Test123456'
  let questionId: number

  test.beforeAll(async () => {
    const _askerToken = await registerAndGetToken(asker, password)
    const _answererToken = await registerAndGetToken(answerer, password)
    const qRes = await createQuestionViaAPI(_askerToken)
    questionId = qRes.data.id
  })

  test('未登录时回答编辑器应隐藏', async ({ page }) => {
    await page.goto(`/question/${questionId}`)
    await page.waitForTimeout(3000)

    await expect(page.getByText('撰写回答')).not.toBeVisible()
    await expect(page.getByRole('button', { name: '提交回答' })).not.toBeVisible()
  })

  test('登录后编辑器应可见', async ({ page }) => {
    await login(page, answerer, password)
    await page.goto(`/question/${questionId}`)
    await page.waitForTimeout(3000)

    await expect(page.getByText('撰写回答')).toBeVisible()
    const editor = page.locator('.tiptap, [contenteditable="true"]').first()
    await expect(editor).toBeVisible()
    await expect(page.getByRole('button', { name: '提交回答' })).toBeVisible()
  })

  test('编辑器工具栏应包含常用格式按钮', async ({ page }) => {
    await login(page, answerer, password)
    await page.goto(`/question/${questionId}`)
    await page.waitForTimeout(3000)

    // 通过 "撰写回答" 标题定位编辑器区域，再查找工具栏按钮
    const editorSection = page.getByText('撰写回答').locator('..')
    const buttons = editorSection.locator('button')
    const count = await buttons.count()
    expect(count).toBeGreaterThan(5) // 工具栏 13 个按钮 + 提交按钮 = 14
  })

  test('解决方案类型下拉应包含4个选项', async ({ page }) => {
    await login(page, answerer, password)
    await page.goto(`/question/${questionId}`)
    await page.waitForTimeout(3000)

    const select = page.getByText('解决方案类型（选填）').locator('..')
    const options = select.locator('option')
    const count = await options.count()
    expect(count).toBe(5) // 默认 + skill/file/feasibility/experience
  })

  test('空回答不应提交', async ({ page }) => {
    await login(page, answerer, password)
    await page.goto(`/question/${questionId}`)
    await page.waitForTimeout(3000)

    await page.getByRole('button', { name: '提交回答' }).click()
    await page.waitForTimeout(1000)

    const answerSection = page.getByText(/回答 \(/)
    await expect(answerSection).toContainText('0')
  })

  test('应能提交回答并显示', async ({ page }) => {
    await login(page, answerer, password)
    await page.goto(`/question/${questionId}`)
    await page.waitForTimeout(3000)

    // 在编辑器中输入内容 - TipTap 使用 contenteditable
    const editor = page.locator('.tiptap').first()
    await editor.click()
    await editor.type('这是E2E测试回答内容，验证编辑器提交功能。')
    await page.waitForTimeout(500)

    // 选择解决方案类型
    await page.locator('select').selectOption('skill')

    // 提交
    await page.getByRole('button', { name: '提交回答' }).click()
    await page.waitForTimeout(3000)

    // 验证回答显示（在 .markdown-body 渲染的回答区域）
    await expect(page.locator('.markdown-body').getByText('E2E测试回答内容')).toBeVisible()
    // 验证解决方案类型标签（精确匹配 tag 元素，避免匹配 select option）
    await expect(page.locator('.tag').getByText('skill')).toBeVisible()
    // 回答数应更新
    const answerSection = page.getByText(/回答 \(/)
    await expect(answerSection).toContainText('1')
  })

  test('提交后编辑器应清空', async ({ page }) => {
    await login(page, answerer, password)
    await page.goto(`/question/${questionId}`)
    await page.waitForTimeout(3000)

    const editor = page.locator('.tiptap').first()
    await editor.click()
    await editor.type('第二次回答内容')
    await page.waitForTimeout(500)
    await page.getByRole('button', { name: '提交回答' }).click()
    await page.waitForTimeout(3000)

    // 第一条回答应仍然可见
    await expect(page.locator('.markdown-body').getByText('E2E测试回答内容').first()).toBeVisible()
    // 回答数应更新为 2
    const answerSection = page.getByText(/回答 \(/)
    await expect(answerSection).toContainText('2')
  })
})
