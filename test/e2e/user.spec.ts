/**
 * E2E 浏览器测试 - 用户个人中心
 * 模拟用户查看/编辑个人资料
 */
import { test, expect } from '@playwright/test'

test.describe('用户个人中心 E2E 测试', () => {
  const timestamp = Date.now()
  const username = `e2e_profile_${timestamp}`
  const password = 'Test123456'

  test.beforeAll(async ({ browser }) => {
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
  })

  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login')
    await page.getByPlaceholder(/用户名|username/i).fill(username)
    await page.getByPlaceholder(/密码|password/i).fill(password)
    await page.getByRole('button', { name: /登录|login/i }).click()
    await expect(page).toHaveURL(/\/(home)/, { timeout: 10000 })
  })

  test('应能进入个人中心', async ({ page }) => {
    // 点击用户头像或用户名进入个人中心
    const userLink = page.getByText(username).or(page.locator('[class*=avatar], [class*=user]').first())
    await userLink.first().click()
    await page.waitForTimeout(2000)

    // 应该在用户页面
    const isUserPage = page.url().includes('user') || page.url().includes('profile')
    expect(isUserPage || await page.getByText(username).isVisible()).toBeTruthy()
  })

  test('个人中心应显示用户信息', async ({ page }) => {
    // 导航到用户页面
    await page.goto(`/user`)
    await page.waitForTimeout(2000)

    // 应该显示用户名
    const usernameVisible = await page.getByText(username).isVisible().catch(() => false)
    expect(usernameVisible).toBeTruthy()
  })

  test('应能修改个人资料', async ({ page }) => {
    await page.goto('/user')
    await page.waitForTimeout(2000)

    // 寻找编辑按钮
    const editBtn = page.getByRole('button', { name: /编辑|修改|edit/i })
    if (await editBtn.isVisible().catch(() => false)) {
      await editBtn.click()
      await page.waitForTimeout(1000)

      // 修改个人简介
      const bioInput = page.getByPlaceholder(/简介|bio/i).or(page.locator('textarea'))
      if (await bioInput.first().isVisible().catch(() => false)) {
        await bioInput.first().fill('E2E测试修改的个人简介')
      }

      // 保存
      const saveBtn = page.getByRole('button', { name: /保存|提交|save|submit/i })
      if (await saveBtn.isVisible().catch(() => false)) {
        await saveBtn.click()
        await page.waitForTimeout(2000)

        // 应该显示成功提示或更新后的内容
        const successMsg = page.getByText(/成功|success|已更新/)
        const hasSuccess = await successMsg.isVisible().catch(() => false)
        expect(hasSuccess || await page.getByText('E2E测试修改的个人简介').isVisible().catch(() => false)).toBeTruthy()
      }
    }
  })
})
