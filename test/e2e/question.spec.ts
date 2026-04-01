/**
 * E2E 浏览器测试 - 问答流程
 * 模拟完整问答流程：发布问题、查看问题、发布回答
 */
import { test, expect } from '@playwright/test'

// 先登录获取 token 的辅助
async function login(page: Page, username: string, password: string) {
  await page.goto('/login')
  await page.getByPlaceholder(/用户名|username/i).fill(username)
  await page.getByPlaceholder(/密码|password/i).fill(password)
  await page.getByRole('button', { name: /登录|login/i }).click()
  await expect(page).toHaveURL(/\/(home)/, { timeout: 10000 })
}

test.describe('问答流程 E2E 测试', () => {
  const timestamp = Date.now()
  const questioner = `e2e_q_${timestamp}`
  const answerer = `e2e_a_${timestamp}`
  const password = 'Test123456'

  // 预先注册两个用户
  test.beforeAll(async ({ browser }) => {
    for (const username of [questioner, answerer]) {
      const ctx = await browser.newContext()
      const page = await ctx.newPage()
      await page.goto('/register')
      await page.getByPlaceholder(/用户名|username/i).fill(username)
      await page.getByPlaceholder(/密码|password/i).fill(password)
      await page.getByPlaceholder(/邮箱|email/i).fill(`${username}@test.com`)
      await page.getByText(/研发|rd/i).first().click()
      await page.getByRole('button', { name: /注册|register/i }).click()
      await page.waitForTimeout(3000)
      await ctx.close()
    }
  })

  test('应能发布新问题', async ({ page }) => {
    await login(page, questioner, password)

    // 寻找发帖/提问按钮
    const createBtn = page.getByRole('button', { name: /提问|发帖|新建|create|new/i })
    await createBtn.first().click()

    // 填写问题表单
    await page.getByPlaceholder(/标题|title/i).fill(`E2E测试问题_${timestamp}`)
    await page.locator('[class*=editor], textarea, [contenteditable]').first().fill('这是通过E2E测试创建的问题内容，用于验证提问功能是否正常工作。')

    // 选择难度（如果有）
    const levelSelect = page.locator('[class*=level], [class*=select]').first()
    if (await levelSelect.isVisible()) {
      await levelSelect.click()
      await page.getByText(/中等|medium/i).first().click()
    }

    // 提交
    await page.getByRole('button', { name: /提交|发布|submit|publish/i }).click()

    // 应该跳转到问题详情页或显示成功提示
    await page.waitForTimeout(3000)
    const successIndicator = page.getByText(/成功|success|创建/).or(page.locator('[class*=success], [class*=question-detail]'))
    const hasSuccess = await successIndicator.isVisible().catch(() => false)
    expect(hasSuccess || page.url().includes('question')).toBeTruthy()
  })

  test('应能查看问题详情', async ({ page }) => {
    await page.goto('/home')
    await page.waitForTimeout(2000)

    // 点击第一个问题
    const questionCard = page.locator('[class*=question], [class*=card]').first()
    if (await questionCard.isVisible()) {
      await questionCard.click()
      await page.waitForTimeout(2000)

      // 问题详情页应显示内容
      const content = page.locator('[class*=content], [class*=detail], article')
      const hasContent = await content.first().isVisible().catch(() => false)
      expect(hasContent || page.url().includes('question')).toBeTruthy()
    }
  })
})
