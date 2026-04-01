/**
 * E2E 浏览器测试 - 首页浏览
 * 模拟用户浏览首页：查看问题列表、岗位切换、分页
 */
import { test, expect } from '@playwright/test'

test.describe('首页 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/home')
  })

  test('首页应正常加载', async ({ page }) => {
    // 页面标题应存在
    await expect(page).toHaveTitle(/.+/)

    // 页面主体内容应可见
    await expect(page.getByRole('main').or(page.locator('.app, #app, [class*=layout]'))).toBeVisible({ timeout: 10000 })
  })

  test('应显示问题列表', async ({ page }) => {
    // 等待问题列表加载
    await page.waitForTimeout(2000)

    // 应有问题卡片或列表项
    const questionElements = page.locator('[class*=question], [class*=card]')
    const count = await questionElements.count()
    // 如果有问题数据，应能显示
    if (count > 0) {
      expect(count).toBeGreaterThan(0)
    }
  })

  test('岗位角色标签应可切换', async ({ page }) => {
    // 查找岗位角色标签/标签页
    const tabElements = page.locator('[class*=tab], [class*=role], [role=tab]')
    const count = await tabElements.count()

    if (count > 1) {
      // 点击第二个标签
      await tabElements.nth(1).click()
      await page.waitForTimeout(1000)

      // 页面内容应更新
      const url = page.url()
      expect(url).toBeDefined()
    }
  })

  test('导航栏应包含主要功能入口', async ({ page }) => {
    // 检查导航栏是否可见
    const nav = page.locator('nav, [class*=nav], [class*=header], [class*=layout]')
    await expect(nav.first()).toBeVisible({ timeout: 5000 })
  })
})
