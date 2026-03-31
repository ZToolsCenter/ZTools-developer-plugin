import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DevPluginSidebar from '../DevPluginSidebar.vue'

const { messageErrorMock } = vi.hoisted(() => ({
  messageErrorMock: vi.fn()
}))

vi.mock('element-plus/theme-chalk/base.css', () => ({}))
vi.mock('element-plus/theme-chalk/el-scrollbar.css', () => ({}))
vi.mock('element-plus/es/components/scrollbar/style/css', () => ({}))
vi.mock('vue-draggable-plus', () => ({
  VueDraggable: defineComponent({
    name: 'VueDraggable',
    props: {
      modelValue: {
        type: Array,
        default: () => []
      }
    },
    emits: ['update:modelValue', 'end'],
    setup(props, { slots }) {
      return () => h('div', { class: 'vue-draggable-stub' }, slots.default?.({ list: props.modelValue }))
    }
  })
}))

vi.mock('@/views/HomePage/components/DevPluginContextMenu', () => ({
  DevPluginContextMenu: defineComponent({
    name: 'DevPluginContextMenu',
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      plugin: {
        type: Object,
        default: null
      },
      position: {
        type: Object,
        default: () => ({ x: 0, y: 0 })
      }
    },
    emits: ['pin-to-top', 'close'],
    setup(_, { emit }) {
      return () =>
        h('div', { class: 'dev-plugin-context-menu-stub' }, [
          h(
            'button',
            {
              class: 'dev-plugin-context-menu-stub__pin',
              onClick: () => emit('pin-to-top', 'knowledge-dev')
            },
            'pin'
          ),
          h(
            'button',
            {
              class: 'dev-plugin-context-menu-stub__close',
              onClick: () => emit('close')
            },
            'close'
          )
        ])
    }
  })
}))

vi.mock('element-plus', () => ({
  ElMessage: Object.assign(
    vi.fn(({ message, type }) => {
      if (type === 'error') {
        messageErrorMock(message)
      }
    }),
    {
      error: messageErrorMock
    }
  ),
  ElScrollbar: defineComponent({
    name: 'ElScrollbar',
    setup(_, { slots }) {
      return () => h('div', { class: 'el-scrollbar' }, slots.default?.())
    }
  })
}))

describe('DevPluginSidebar', () => {
  const originalZtools = window.ztools
  const mockGetDevProjects = vi.fn()
  const mockGetRunningPlugins = vi.fn()
  const mockImportDevPlugin = vi.fn()
  const mockUpdateDevProjectsOrder = vi.fn()
  const initialPlugin = {
    name: 'rabbit-screenshot',
    title: '兔灵截图工具',
    version: '1.0.0',
    description: '开发中插件',
    author: 'xiaou',
    homepage: '',
    logo: '',
    path: '/mock/rabbit-screenshot',
    configPath: '/mock/rabbit-screenshot/plugin.json',
    localStatus: 'ready',
    lastValidatedAt: '2026-03-29T12:00:00.000Z',
    lastError: null,
    isDevModeInstalled: true
  }

  const importedPlugin = {
    name: 'knowledge-dev',
    title: '知识库开发',
    version: '0.1.0',
    description: '新导入的开发插件',
    author: 'team',
    homepage: '',
    logo: '',
    path: '/mock/knowledge-dev',
    configPath: '/mock/knowledge-dev/plugin.json',
    localStatus: 'ready',
    lastValidatedAt: '2026-03-29T12:05:00.000Z',
    lastError: null,
    isDevModeInstalled: false
  }

  beforeEach(() => {
    mockGetDevProjects.mockReset()
    mockGetRunningPlugins.mockReset()
    mockImportDevPlugin.mockReset()
    mockUpdateDevProjectsOrder.mockReset()
    messageErrorMock.mockClear()

    mockGetDevProjects.mockResolvedValueOnce([initialPlugin]).mockResolvedValueOnce([
      initialPlugin,
      importedPlugin
    ])
    mockGetRunningPlugins.mockResolvedValue([])
    mockImportDevPlugin.mockResolvedValue({ success: true })
    mockUpdateDevProjectsOrder.mockResolvedValue({ success: true })

    window.ztools = {
      internal: {
        getDevProjects: mockGetDevProjects,
        getRunningPlugins: mockGetRunningPlugins,
        importDevPlugin: mockImportDevPlugin,
        updateDevProjectsOrder: mockUpdateDevProjectsOrder
      }
    }
  })

  afterEach(() => {
    window.ztools = originalZtools
  })

  it('imports a new development plugin and emits the imported plugin id', async () => {
    const wrapper = mount(DevPluginSidebar, {
      props: {
        selectedPluginId: 'rabbit-screenshot'
      }
    })

    await flushPromises()
    await wrapper.find('.sidebar__create').trigger('click')
    await flushPromises()

    expect(window.ztools?.internal?.importDevPlugin).toHaveBeenCalledTimes(1)
    expect(window.ztools?.internal?.getDevProjects).toHaveBeenCalledTimes(2)
    expect(wrapper.emitted('loaded')).toHaveLength(2)
    expect(wrapper.emitted('select')?.[0]).toEqual(['knowledge-dev'])
  })

  it('exposes refresh ability for parent and reloads list when invoked', async () => {
    mockGetDevProjects.mockReset()
    mockGetRunningPlugins.mockReset()
    mockGetDevProjects.mockResolvedValueOnce([initialPlugin]).mockResolvedValueOnce([importedPlugin])
    mockGetRunningPlugins.mockResolvedValue([])

    const wrapper = mount(DevPluginSidebar, {
      props: {
        selectedPluginId: 'rabbit-screenshot'
      }
    })

    await flushPromises()
    await wrapper.vm.refreshPlugins()
    await flushPromises()

    expect(window.ztools?.internal?.getDevProjects).toHaveBeenCalledTimes(2)
    expect(wrapper.emitted('loaded')).toHaveLength(2)
    expect(wrapper.find('.sidebar__item-text').text()).toBe('知识库开发')
  })

  it('renders the development plugin list inside element-plus scrollbar', async () => {
    const wrapper = mount(DevPluginSidebar, {
      props: {
        selectedPluginId: 'rabbit-screenshot'
      }
    })

    await flushPromises()

    expect(wrapper.find('.sidebar__list-scrollbar').exists()).toBe(true)
    expect(wrapper.find('.el-scrollbar').exists()).toBe(true)
  })

  it('renders sidebar icons with the z icon namespace', async () => {
    const wrapper = mount(DevPluginSidebar, {
      props: {
        selectedPluginId: 'rabbit-screenshot'
      }
    })

    await flushPromises()

    expect(wrapper.find('.sidebar__item-icon.i-z-folder').exists()).toBe(true)
    expect(wrapper.find('.sidebar__create-icon.i-z-plus').exists()).toBe(true)
  })

  it('renders dev projects even when the host payload omits isDevelopment', async () => {
    mockGetDevProjects.mockReset()
    mockGetRunningPlugins.mockReset()
    mockGetDevProjects.mockResolvedValueOnce([
      {
        name: 'knowledge-dev',
        title: '知识库开发',
        version: '0.1.0',
        description: '新导入的开发插件',
        author: 'team',
        homepage: '',
        logo: '',
        path: '/mock/knowledge-dev',
        configPath: null,
        localStatus: 'unbound',
        lastValidatedAt: null,
        lastError: '项目未绑定到当前设备路径',
        isDevModeInstalled: false
      }
    ])
    mockGetRunningPlugins.mockResolvedValueOnce([])

    const wrapper = mount(DevPluginSidebar)

    await flushPromises()

    expect(wrapper.text()).toContain('知识库开发')
    expect(wrapper.text()).toContain('等待绑定')
  })

  it('shows Message.error when initial load fails', async () => {
    mockGetDevProjects.mockReset()
    mockGetRunningPlugins.mockReset()
    mockGetDevProjects.mockRejectedValueOnce(new Error('加载失败'))
    mockGetRunningPlugins.mockResolvedValueOnce([])

    const wrapper = mount(DevPluginSidebar)

    await flushPromises()

    expect(messageErrorMock).toHaveBeenCalledWith('加载失败')
    expect(wrapper.find('.sidebar__state--error').exists()).toBe(false)
  })

  it('shows Message.error when import fails', async () => {
    mockGetDevProjects.mockReset()
    mockGetRunningPlugins.mockReset()
    mockImportDevPlugin.mockReset()
    mockGetDevProjects.mockResolvedValueOnce([initialPlugin])
    mockGetRunningPlugins.mockResolvedValueOnce([])
    mockImportDevPlugin.mockResolvedValueOnce({ success: false, error: '导入失败' })

    const wrapper = mount(DevPluginSidebar, {
      props: {
        selectedPluginId: 'rabbit-screenshot'
      }
    })

    await flushPromises()
    await wrapper.find('.sidebar__create').trigger('click')
    await flushPromises()

    expect(messageErrorMock).toHaveBeenCalledWith('导入失败')
    expect(wrapper.find('.sidebar__create-error').exists()).toBe(false)
  })

  it('persists order after drag end', async () => {
    const wrapper = mount(DevPluginSidebar, {
      props: {
        selectedPluginId: 'rabbit-screenshot'
      }
    })

    await flushPromises()

    const draggable = wrapper.findComponent({ name: 'VueDraggable' })
    draggable.vm.$emit('update:modelValue', [
      {
        id: 'knowledge-dev',
        name: 'knowledge-dev',
        title: '知识库开发',
        version: '0.1.0',
        description: '',
        author: '',
        homepage: '',
        logo: '',
        path: '/mock/knowledge-dev',
        configPath: '/mock/knowledge-dev/plugin.json',
        localStatus: 'ready',
        lastValidatedAt: null,
        lastError: null,
        isRunning: false,
        isDevModeInstalled: false
      },
      {
        id: 'rabbit-screenshot',
        name: 'rabbit-screenshot',
        title: '兔灵截图工具',
        version: '1.0.0',
        description: '',
        author: '',
        homepage: '',
        logo: '',
        path: '/mock/rabbit-screenshot',
        configPath: '/mock/rabbit-screenshot/plugin.json',
        localStatus: 'ready',
        lastValidatedAt: null,
        lastError: null,
        isRunning: false,
        isDevModeInstalled: true
      }
    ])
    draggable.vm.$emit('end')
    await flushPromises()

    expect(mockUpdateDevProjectsOrder).toHaveBeenCalledWith(['knowledge-dev', 'rabbit-screenshot'])
  })

  it('pins the current plugin to the top via context menu', async () => {
    mockGetDevProjects.mockReset()
    mockGetRunningPlugins.mockReset()
    mockGetDevProjects.mockResolvedValueOnce([initialPlugin, importedPlugin])
    mockGetRunningPlugins.mockResolvedValueOnce([])

    const wrapper = mount(DevPluginSidebar, {
      props: {
        selectedPluginId: 'rabbit-screenshot'
      }
    })

    await flushPromises()
    await wrapper.find('.dev-plugin-context-menu-stub__pin').trigger('click')
    await flushPromises()

    expect(mockUpdateDevProjectsOrder).toHaveBeenCalledWith(['knowledge-dev', 'rabbit-screenshot'])
  })

  it('reloads host order when order persistence fails', async () => {
    mockGetDevProjects.mockReset()
    mockGetRunningPlugins.mockReset()
    mockUpdateDevProjectsOrder.mockReset()
    mockGetDevProjects
      .mockResolvedValueOnce([initialPlugin, importedPlugin])
      .mockResolvedValueOnce([initialPlugin, importedPlugin])
    mockGetRunningPlugins.mockResolvedValue([])
    mockUpdateDevProjectsOrder.mockResolvedValueOnce({ success: false, error: '保存失败' })

    const wrapper = mount(DevPluginSidebar, {
      props: {
        selectedPluginId: 'rabbit-screenshot'
      }
    })

    await flushPromises()
    await wrapper.find('.dev-plugin-context-menu-stub__pin').trigger('click')
    await flushPromises()

    expect(messageErrorMock).toHaveBeenCalledWith('保存失败')
    expect(mockGetDevProjects).toHaveBeenCalledTimes(2)
    expect(wrapper.findAll('.sidebar__item-text')[0]?.text()).toBe('兔灵截图工具')
  })
})
