import { flushPromises, mount } from '@vue/test-utils'
import { ElMessageBox } from 'element-plus'
import { describe, expect, it, vi } from 'vitest'
import DevelopmentView from '../DevelopmentView.vue'
import type { DevelopmentPluginOverview } from '../DevelopmentView'

const mockPlugin: DevelopmentPluginOverview = {
  name: 'rabbit-screenshot',
  title: '兔灵截图工具',
  version: '1.0.0',
  description: '插件描述',
  author: 'xiaou',
  path: '/mock/rabbit-screenshot',
  configPath: '/mock/rabbit-screenshot/plugin.json',
  localStatus: 'ready',
  lastValidatedAt: '2026-03-29T12:00:00.000Z',
  lastError: null,
  logo: '',
  isRunning: false,
  isDevModeInstalled: true
}

const clickCardButtonByText = async (wrapper: ReturnType<typeof mount>, text: string) => {
  const targetButton = wrapper.findAll('button').find((button) => button.text().includes(text))

  if (!targetButton) {
    throw new Error(`Expected card button "${text}" to be rendered.`)
  }

  await targetButton.trigger('click')
}

const triggerOverviewDelete = async (wrapper: ReturnType<typeof mount>) => {
  const dropdownItem = wrapper.findAllComponents({ name: 'ElDropdownItem' })[0]

  if (!dropdownItem) {
    throw new Error('Expected overview delete dropdown item to be rendered.')
  }

  dropdownItem.vm.$emit('click')
  await flushPromises()
}

describe('DevelopmentView', () => {
  it('renders overview data from the selected plugin', () => {
    const wrapper = mount(DevelopmentView, {
      props: { plugin: mockPlugin }
    })

    expect(wrapper.text()).toContain('兔灵截图工具')
    expect(wrapper.text()).toContain('xiaou')
    expect(wrapper.text()).toContain('配置状态正常')
    expect(wrapper.text()).toContain('卸载（开发模式）')
    expect(wrapper.findAll('.card-group')).toHaveLength(2)
    expect(wrapper.findAll('.card-atom')).toHaveLength(5)
  })

  it('validates the selected project on detail open and requests refresh', async () => {
    const validateDevProject = vi.fn().mockResolvedValue({ success: true })
    const originalZtools = window.ztools
    window.ztools = {
      internal: {
        getDevProjects: vi.fn().mockResolvedValue([]),
        getRunningPlugins: vi.fn().mockResolvedValue([]),
        validateDevProject
      }
    } as unknown as typeof window.ztools

    const wrapper = mount(DevelopmentView, {
      props: { plugin: mockPlugin }
    })

    await flushPromises()

    expect(validateDevProject).toHaveBeenCalledWith(mockPlugin.name)
    expect(wrapper.emitted('refresh-dev-projects')).toHaveLength(1)
    window.ztools = originalZtools
  })

  it('calls host actions for open folder, reload, and package buttons', async () => {
    const revealInFinder = vi.fn().mockResolvedValue(undefined)
    const validateDevProject = vi.fn().mockResolvedValue({ success: true })
    const reloadDevProject = vi.fn().mockResolvedValue({ success: true })
    const packageDevProject = vi.fn().mockResolvedValue({ success: true })

    const originalZtools = window.ztools
    window.ztools = {
      internal: {
        getDevProjects: vi.fn().mockResolvedValue([]),
        getRunningPlugins: vi.fn().mockResolvedValue([]),
        validateDevProject,
        revealInFinder,
        reloadDevProject,
        packageDevProject,
        installDevPlugin: vi.fn().mockResolvedValue({ success: true }),
        uninstallDevPlugin: vi.fn().mockResolvedValue({ success: true })
      }
    } as unknown as typeof window.ztools

    const wrapper = mount(DevelopmentView, {
      props: { plugin: mockPlugin }
    })

    await flushPromises()
    await clickCardButtonByText(wrapper, '工程目录')
    await flushPromises()
    expect(revealInFinder).toHaveBeenCalledWith(mockPlugin.path)

    await clickCardButtonByText(wrapper, '重载插件')
    await flushPromises()
    expect(reloadDevProject).toHaveBeenCalledWith(mockPlugin.name)

    await clickCardButtonByText(wrapper, '打包插件')
    await flushPromises()
    expect(packageDevProject).toHaveBeenCalledWith(mockPlugin.name)

    window.ztools = originalZtools
  })

  it('installs plugin in dev mode and emits refresh event', async () => {
    const installDevPlugin = vi.fn().mockResolvedValue({ success: true })
    const validateDevProject = vi.fn().mockResolvedValue({ success: true })
    const originalZtools = window.ztools
    window.ztools = {
      internal: {
        getDevProjects: vi.fn().mockResolvedValue([]),
        getRunningPlugins: vi.fn().mockResolvedValue([]),
        validateDevProject,
        installDevPlugin
      }
    } as unknown as typeof window.ztools

    const wrapper = mount(DevelopmentView, {
      props: {
        plugin: {
          ...mockPlugin,
          isDevModeInstalled: false
        }
      }
    })

    await flushPromises()
    await clickCardButtonByText(wrapper, '安装（开发模式）')
    await flushPromises()

    expect(installDevPlugin).toHaveBeenCalledWith(mockPlugin.name)
    expect(wrapper.emitted('refresh-dev-projects')).toHaveLength(2)
    window.ztools = originalZtools
  })

  it('uninstalls plugin from dev mode and emits refresh event', async () => {
    const uninstallDevPlugin = vi.fn().mockResolvedValue({ success: true })
    const validateDevProject = vi.fn().mockResolvedValue({ success: true })
    const originalZtools = window.ztools
    window.ztools = {
      internal: {
        getDevProjects: vi.fn().mockResolvedValue([]),
        getRunningPlugins: vi.fn().mockResolvedValue([]),
        validateDevProject,
        uninstallDevPlugin
      }
    } as unknown as typeof window.ztools

    const wrapper = mount(DevelopmentView, {
      props: { plugin: mockPlugin }
    })

    await flushPromises()
    await clickCardButtonByText(wrapper, '卸载（开发模式）')
    await flushPromises()

    expect(uninstallDevPlugin).toHaveBeenCalledWith(mockPlugin.name)
    expect(wrapper.emitted('refresh-dev-projects')).toHaveLength(2)
    window.ztools = originalZtools
  })

  it('removes project from overview panel after confirm and emits refresh event', async () => {
    const confirm = vi.spyOn(ElMessageBox, 'confirm').mockResolvedValue('confirm' as never)
    const removeDevProject = vi.fn().mockResolvedValue({ success: true })
    const validateDevProject = vi.fn().mockResolvedValue({ success: true })
    const originalZtools = window.ztools
    window.ztools = {
      internal: {
        getDevProjects: vi.fn().mockResolvedValue([]),
        getRunningPlugins: vi.fn().mockResolvedValue([]),
        validateDevProject,
        removeDevProject
      }
    } as unknown as typeof window.ztools

    const wrapper = mount(DevelopmentView, {
      props: { plugin: mockPlugin }
    })

    await flushPromises()
    await triggerOverviewDelete(wrapper)

    expect(confirm).toHaveBeenCalled()
    expect(removeDevProject).toHaveBeenCalledWith(mockPlugin.name)
    expect(wrapper.emitted('refresh-dev-projects')).toHaveLength(2)

    confirm.mockRestore()
    window.ztools = originalZtools
  })

  it('does not remove project when delete confirmation is cancelled', async () => {
    const confirm = vi.spyOn(ElMessageBox, 'confirm').mockRejectedValue(new Error('cancel'))
    const removeDevProject = vi.fn().mockResolvedValue({ success: true })
    const validateDevProject = vi.fn().mockResolvedValue({ success: true })
    const originalZtools = window.ztools
    window.ztools = {
      internal: {
        getDevProjects: vi.fn().mockResolvedValue([]),
        getRunningPlugins: vi.fn().mockResolvedValue([]),
        validateDevProject,
        removeDevProject
      }
    } as unknown as typeof window.ztools

    const wrapper = mount(DevelopmentView, {
      props: { plugin: mockPlugin }
    })

    await flushPromises()
    await triggerOverviewDelete(wrapper)

    expect(confirm).toHaveBeenCalled()
    expect(removeDevProject).not.toHaveBeenCalled()
    expect(wrapper.emitted('refresh-dev-projects')).toHaveLength(1)

    confirm.mockRestore()
    window.ztools = originalZtools
  })
})
