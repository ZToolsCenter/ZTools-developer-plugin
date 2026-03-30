import { describe, expect, it, vi } from 'vitest'
import { createHostAccess } from '@/utils/host'
import { logInfo } from '@/utils/logger'

describe('host utilities', () => {
  it('formats module and feature prefixes', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    logInfo('HomePage', '初始化', '开始加载')
    expect(spy).toHaveBeenCalledWith('【HomePage】【初始化】开始加载')
    spy.mockRestore()
  })

  it('provides mock plugins when the host API is missing', async () => {
    const host = createHostAccess(undefined)
    const plugins = await host.getDevProjects()
    expect(Array.isArray(plugins)).toBe(true)
    expect(plugins[0]?.localStatus).toBe('ready')
    expect(plugins[0]?.isDevModeInstalled).toBe(true)
  })

  it('preserves optional dev project actions from the host bridge', async () => {
    const validateDevProject = vi.fn().mockResolvedValue({ success: true })
    const selectDevProjectConfig = vi.fn().mockResolvedValue({ success: true })
    const host = createHostAccess({
      getDevProjects: async () => [],
      getRunningPlugins: async () => [],
      validateDevProject,
      selectDevProjectConfig
    })

    await host.validateDevProject?.('excellent-todo')
    await host.selectDevProjectConfig?.('excellent-todo', '/mock/plugin/plugin.json')

    expect(validateDevProject).toHaveBeenCalledWith('excellent-todo')
    expect(selectDevProjectConfig).toHaveBeenCalledWith(
      'excellent-todo',
      '/mock/plugin/plugin.json'
    )
  })
})
