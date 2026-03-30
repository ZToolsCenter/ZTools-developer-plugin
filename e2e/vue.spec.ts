import { test, expect } from '@playwright/test'

test('opens the home workspace and switches tabs', async ({ page }) => {
  await page.goto('/#/home')
  await expect(page.getByRole('button', { name: '新建项目' })).toBeVisible()
  await expect(page.getByText('应用开发')).toBeVisible()

  await page.getByRole('button', { name: '发布历史' }).click()
  await expect(page).toHaveURL(/history$/)
})

test('keeps sidebar scrolling isolated at 800x600', async ({ page }) => {
  await page.addInitScript(() => {
    const plugins = Array.from({ length: 24 }, (_, index) => ({
      name: `dev-plugin-${index + 1}`,
      title: `开发插件 ${index + 1}`,
      version: '1.0.0',
      description: '开发环境 mock 插件',
      author: 'xiaou',
      homepage: '',
      logo: '',
      path: `/mock/dev-plugin-${index + 1}`,
      isDevelopment: true
    }))

    window.ztools = {
      internal: {
        getPlugins: async () => plugins,
        getRunningPlugins: async () => []
      }
    }
  })

  await page.setViewportSize({ width: 800, height: 600 })
  await page.goto('/#/home')
  await expect(page.getByRole('button', { name: '新建项目' })).toBeVisible()

  const scrollMetrics = await page.evaluate(() => {
    const sidebarWrap = document.querySelector('.sidebar__list-scrollbar .el-scrollbar__wrap')

    if (!(sidebarWrap instanceof HTMLElement)) {
      throw new Error('Missing sidebar scroll container.')
    }

    window.scrollTo(0, 0)
    sidebarWrap.scrollTop = 160

    return {
      documentScrollable: document.documentElement.scrollHeight > window.innerHeight,
      sidebarScrollable: sidebarWrap.scrollHeight > sidebarWrap.clientHeight,
      pageTop: window.scrollY,
      sidebarTop: sidebarWrap.scrollTop
    }
  })

  expect(scrollMetrics.documentScrollable).toBe(false)
  expect(scrollMetrics.sidebarScrollable).toBe(true)
  expect(scrollMetrics.pageTop).toBe(0)
  expect(scrollMetrics.sidebarTop).toBeGreaterThan(0)
})
