/**
 * E2E 浏览器测试 - 认证流程
 * 使用 Playwright 模拟浏览器操作：注册、登录、登出
 */
import { test, expect } from '@playwright/test'

test.describe('认证流程 E2E 测试', () => {
  const timestamp = Date.now()
  const testUsername = `e2e_user_${timestamp}`
  const testPassword = 'Test123456'
  const testEmail = `e2e_${timestamp}@test.com`

  test('应完成完整注册流程', async ({ page }) => {
    await page.goto('/register')

    // 填写注册表单
    await page.getByPlaceholder(/用户名|username/i).fill(testUsername)
    await page.getByPlaceholder(/密码|password/i).fill(testPassword)
    await page.getByPlaceholder(/邮箱|email/i).fill(testEmail)

    // 选择岗位角色
    await page.getByText(/研发|R&D|rd/i).first().click()

    // 提交注册
    await page.getByRole('button', { name: /注册|register/i }).click()

    // 注册成功后应跳转到首页或登录页
    await expect(page).toHaveURL(/\/(home|login)/, { timeout: 10000 })
  })

  test('应完成完整登录流程', async ({ page }) => {
    await page.goto('/login')

    // 填写登录表单
    await page.getByPlaceholder(/用户名|username/i).fill(testUsername)
    await page.getByPlaceholder(/密码|password/i).fill(testPassword)

    // 提交登录
    await page.getByRole('button', { name: /登录|login/i }).click()

    // 登录成功后应跳转到首页
    await expect(page).toHaveURL(/\/(home)/, { timeout: 10000 })

    // 验证用户信息已加载
    await expect(page.getByText(testUsername)).toBeVisible({ timeout: 5000 })
  })

  test('登录失败应显示错误信息', async ({ page }) => {
    await page.goto('/login')

    await page.getByPlaceholder(/用户名|username/i).fill('wrong_user')
    await page.getByPlaceholder(/密码|password/i).fill('wrong_password')
    await page.getByRole('button', { name: /登录|login/i }).click()

    // 应显示错误提示
    await expect(page.getByText(/错误|失败|invalid|error/i)).toBeVisible({ timeout: 5000 })
  })

  test('注册缺少必填字段应显示校验提示', async ({ page }) => {
    await page.goto('/register')

    // 直接点击注册，不填写任何字段
    await page.getByRole('button', { name: /注册|register/i }).click()

    // 应显示字段校验提示
    await expect(page.getByText(/请输入|必填|required|不能为空/i)).toBeVisible({ timeout: 5000 })
  })
})
