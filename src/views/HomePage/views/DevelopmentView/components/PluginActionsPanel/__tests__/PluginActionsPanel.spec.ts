import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PluginActionsPanel from '../PluginActionsPanel.vue'

const { messageErrorMock } = vi.hoisted(() => ({
  messageErrorMock: vi.fn()
}))

vi.mock('element-plus', () => ({
  ElMessage: {
    error: messageErrorMock
  }
}))

const findCardByTitle = (wrapper: ReturnType<typeof mount>, title: string) => {
  return wrapper.findAll('.card-atom').find((card) => card.text().includes(title))
}

describe('PluginActionsPanel', () => {
  const originalZtools = window.ztools
  const basePlugin = {
    name: 'excellent-todo',
    title: '优秀待办',
    path: '/mock/plugin',
    configPath: '/mock/plugin/plugin.json',
    localStatus: 'ready' as const,
    lastValidatedAt: '2026-03-29T12:00:00.000Z',
    lastError: null,
    isDevModeInstalled: true
  }

  beforeEach(() => {
    messageErrorMock.mockClear()
  })

  afterEach(() => {
    window.ztools = originalZtools
  })

  it('shows Message.error when reloadDevProject is missing', async () => {
    window.ztools = {
      internal: {
        getDevProjects: vi.fn(),
        getRunningPlugins: vi.fn(),
        revealInFinder: vi.fn()
      }
    }

    const wrapper = mount(PluginActionsPanel, {
      props: {
        plugin: basePlugin
      }
    })

    await findCardByTitle(wrapper, '重载插件')?.trigger('click')

    expect(messageErrorMock).toHaveBeenCalledWith('宿主服务不可用')
  })

  it('shows Message.error when packageDevProject rejects', async () => {
    window.ztools = {
      internal: {
        getDevProjects: vi.fn(),
        getRunningPlugins: vi.fn(),
        revealInFinder: vi.fn(),
        reloadDevProject: vi.fn(),
        packageDevProject: vi.fn().mockResolvedValue({ success: false, error: '打包失败' })
      }
    }

    const wrapper = mount(PluginActionsPanel, {
      props: {
        plugin: basePlugin
      }
    })

    await findCardByTitle(wrapper, '打包插件')?.trigger('click')
    await flushPromises()

    expect(messageErrorMock).toHaveBeenCalledWith('打包失败')
  })

  it('replaces the folder card with the missing-config binding card when project is config_missing', async () => {
    window.ztools = {
      getPathForFile: vi.fn(),
      internal: {
        getDevProjects: vi.fn(),
        getRunningPlugins: vi.fn(),
        selectDevProjectConfig: vi.fn().mockResolvedValue({ success: true })
      }
    }

    const wrapper = mount(PluginActionsPanel, {
      props: {
        plugin: {
          ...basePlugin,
          localStatus: 'config_missing',
          isDevModeInstalled: false
        }
      }
    })

    expect(wrapper.text()).toContain('导入源码工程')
    expect(wrapper.text()).not.toContain('工程目录')
    expect(wrapper.text()).not.toContain('选择配置文件')
    expect(wrapper.text()).toContain('配置文件缺失')
  })

  it('keeps the legacy repair action for invalid_config and unbound', () => {
    const wrapper = mount(PluginActionsPanel, {
      props: {
        plugin: {
          ...basePlugin,
          localStatus: 'invalid_config',
          isDevModeInstalled: false
        }
      }
    })

    expect(wrapper.text()).toContain('选择配置文件')
    expect(wrapper.text()).toContain('工程目录')
  })

  it('renders the last validated time inside the project status description instead of the right status slot', () => {
    const wrapper = mount(PluginActionsPanel, {
      props: {
        plugin: basePlugin
      }
    })

    const projectStatusCard = findCardByTitle(wrapper, '项目状态')

    expect(projectStatusCard?.find('.card-atom__description').text()).toContain('最近校验')
    expect(projectStatusCard?.find('.card-atom__status').exists()).toBe(false)
  })

  it('disables reload action when the project is unbound', async () => {
    const reloadDevProject = vi.fn()
    window.ztools = {
      internal: {
        getDevProjects: vi.fn(),
        getRunningPlugins: vi.fn(),
        reloadDevProject,
        selectDevProjectConfig: vi.fn().mockResolvedValue({ success: true })
      }
    }

    const wrapper = mount(PluginActionsPanel, {
      props: {
        plugin: {
          ...basePlugin,
          path: null,
          configPath: null,
          localStatus: 'unbound',
          lastValidatedAt: null,
          lastError: '项目未绑定到当前设备路径',
          isDevModeInstalled: false
        }
      }
    })

    const reloadCard = findCardByTitle(wrapper, '重载插件')
    expect(reloadCard?.attributes('disabled')).toBeDefined()
    await reloadCard?.trigger('click')

    expect(reloadDevProject).not.toHaveBeenCalled()
  })

  it('calls selectDevProjectConfig and emits updated when repairing config', async () => {
    const selectDevProjectConfig = vi.fn().mockResolvedValue({ success: true })
    window.ztools = {
      internal: {
        getDevProjects: vi.fn(),
        getRunningPlugins: vi.fn(),
        selectDevProjectConfig
      }
    }

    const wrapper = mount(PluginActionsPanel, {
      props: {
        plugin: {
          ...basePlugin,
          localStatus: 'invalid_config',
          isDevModeInstalled: false
        }
      }
    })

    await findCardByTitle(wrapper, '选择配置文件')?.trigger('click')
    await flushPromises()

    expect(selectDevProjectConfig).toHaveBeenCalledWith(basePlugin.name)
    expect(wrapper.emitted('updated')).toHaveLength(1)
  })
})
