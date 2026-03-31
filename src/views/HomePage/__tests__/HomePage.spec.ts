import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { defineComponent, h, nextTick, onMounted } from 'vue'
const { sidebarState, messageErrorMock } = vi.hoisted(() => ({
  sidebarState: {
    plugins: [] as Array<{
      id: string
      name: string
      title: string
      version: string
      path: string | null
      configPath: string | null
      localStatus: 'ready' | 'config_missing' | 'invalid_config' | 'unbound'
      lastValidatedAt: string | null
      lastError: string | null
      isRunning: boolean
      isDevModeInstalled: boolean
    }>,
    refreshCalls: 0,
  },
  messageErrorMock: vi.fn()
}))

vi.mock('element-plus', async (importOriginal) => {
  const actual = await importOriginal<typeof import('element-plus')>()
  return {
    ...actual,
    ElMessage: {
      ...actual.ElMessage,
      error: messageErrorMock
    }
  }
})

vi.mock('@/composables', () => ({
  useJumpFunction: (handler: (state: Record<string, unknown>) => void) => {
    onMounted(() => {
      handler((window.history.state as Record<string, unknown>) ?? {})
    })
  }
}))

vi.mock('@/views/HomePage/components/DevPluginSidebar', () => ({
  DevPluginSidebar: defineComponent({
    name: 'DevPluginSidebar',
    props: {
      selectedPluginId: {
        type: String,
        default: '',
      },
    },
    emits: ['loaded', 'select'],
    setup(_, { emit, expose }) {
      const refreshPlugins = async () => {
        sidebarState.refreshCalls += 1
        emit('loaded', sidebarState.plugins)
      }

      onMounted(() => {
        emit('loaded', sidebarState.plugins)
      })

      expose({
        refreshPlugins
      })

      return {
        handleSelect(pluginId: string) {
          emit('select', pluginId)
        }
      }
    },
    render() {
      return h('aside', { class: 'sidebar-stub' }, [
        h('span', '新建项目'),
        ...sidebarState.plugins.map((plugin) =>
          h(
            'button',
            {
              class: 'sidebar-stub__item',
              onClick: () => this.handleSelect(plugin.id),
            },
            plugin.title
          )
        ),
      ])
    },
  }),
}))

import HomePage from '@/views/HomePage/HomePage.vue'

enableAutoUnmount(afterEach)

const DevelopmentRouteStub = defineComponent({
  name: 'DevelopmentRouteStub',
  props: {
    plugin: {
      type: Object,
      default: null
    }
  },
  emits: ['refresh-dev-projects'],
  render() {
    return h('div', { class: 'development-route-stub' }, [
      h('span', this.plugin?.title ?? 'empty'),
      h(
        'button',
        {
          class: 'development-route-stub__refresh',
          onClick: () => this.$emit('refresh-dev-projects')
        },
        'refresh-dev-projects'
      )
    ])
  }
})

function createHomeRouter() {
  return createRouter({
    history: createWebHashHistory(),
    routes: [
      {
        path: '/home',
        component: HomePage,
        children: [
          {
            path: ':pluginId/development',
            name: 'home-development',
            component: DevelopmentRouteStub
          },
          {
            path: ':pluginId/history',
            name: 'home-history',
            component: { template: '<div>history-view</div>' }
          },
          {
            path: ':pluginId/feedback',
            name: 'home-feedback',
            component: { template: '<div>feedback-view</div>' }
          },
          {
            path: ':pluginId/services',
            name: 'home-services',
            component: { template: '<div>services-view</div>' }
          },
          {
            path: ':pluginId/team',
            name: 'home-team',
            component: { template: '<div>team-view</div>' }
          }
        ]
      }
    ]
  })
}

describe('HomePage', () => {
  beforeEach(() => {
    sidebarState.refreshCalls = 0
    messageErrorMock.mockReset()
    window.history.replaceState({}, '', '#/')
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }) as typeof window.matchMedia
    sidebarState.plugins = [
      {
        id: 'rabbit-screenshot',
        name: 'rabbit-screenshot',
        title: '兔灵截图工具',
        version: '1.0.0',
        path: '/mock/rabbit-screenshot',
        configPath: '/mock/rabbit-screenshot/plugin.json',
        localStatus: 'ready',
        lastValidatedAt: '2026-03-29T12:00:00.000Z',
        lastError: null,
        isRunning: true,
        isDevModeInstalled: true
      },
    ]

    window.ztools = {
      internal: {
        getDevProjects: vi.fn().mockResolvedValue([
          {
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
            isRunning: true,
            isDevModeInstalled: true
          },
          {
            name: 'released-plugin',
            title: '正式插件',
            version: '1.0.0',
            description: '正式插件',
            author: 'team',
            homepage: '',
            logo: '',
            path: '/mock/released-plugin',
            configPath: '/mock/released-plugin/plugin.json',
            localStatus: 'ready',
            lastValidatedAt: '2026-03-29T12:00:00.000Z',
            lastError: null,
            isRunning: false,
            isDevModeInstalled: false
          }
        ]),
        getRunningPlugins: vi.fn().mockResolvedValue(['/mock/rabbit-screenshot'])
      }
    }
  })

  it('renders layout chrome with sidebar, nav, and router outlet', async () => {
    const router = createHomeRouter()
    await router.push('/home/rabbit-screenshot/development')
    await router.isReady()

    const wrapper = mount(HomePage, {
      global: {
        plugins: [router]
      }
    })

    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('新建项目')
    expect(wrapper.text()).toContain('应用开发')
    expect(wrapper.text()).toContain('兔灵截图工具')
    expect(wrapper.find('.home-page__body').exists()).toBe(true)
  })

  it('shows only development plugins and redirects from /home', async () => {
    const router = createHomeRouter()
    await router.push('/home')
    await router.isReady()

    const wrapper = mount(HomePage, {
      global: {
        plugins: [router]
      }
    })

    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('兔灵截图工具')
    expect(wrapper.text()).not.toContain('正式插件')
    expect(router.currentRoute.value.fullPath).toBe('/home/rabbit-screenshot/development')
  })

  it('keeps plugin id while switching workbench tabs', async () => {
    const router = createHomeRouter()
    await router.push('/home/rabbit-screenshot/development')
    await router.isReady()

    const wrapper = mount(HomePage, {
      global: {
        plugins: [router]
      }
    })

    await flushPromises()
    await nextTick()
    await wrapper.find('[data-tab="history"]').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/home/rabbit-screenshot/history')
  })

  it('falls back to empty state instead of page error when sidebar load fails', async () => {
    sidebarState.plugins = []
    window.ztools = {
      internal: {
        getDevProjects: vi.fn().mockRejectedValue(new Error('加载失败')),
        getRunningPlugins: vi.fn().mockResolvedValue([])
      }
    }

    const router = createHomeRouter()
    await router.push('/home')
    await router.isReady()

    const wrapper = mount(HomePage, {
      global: {
        plugins: [router]
      }
    })

    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('暂无开发项目')
    expect(wrapper.text()).not.toContain('加载失败')
  })

  it('refreshes sidebar list when development view requests refresh', async () => {
    const router = createHomeRouter()
    await router.push('/home/rabbit-screenshot/development')
    await router.isReady()

    const wrapper = mount(HomePage, {
      global: {
        plugins: [router]
      }
    })

    await flushPromises()
    await nextTick()
    await wrapper.find('.development-route-stub__refresh').trigger('click')
    await flushPromises()

    expect(sidebarState.refreshCalls).toBe(1)
  })

  it('refreshes sidebar when dev-project refresh event is dispatched', async () => {
    const router = createHomeRouter()
    await router.push('/home/rabbit-screenshot/development')
    await router.isReady()

    mount(HomePage, {
      global: {
        plugins: [router]
      }
    })

    await flushPromises()
    await nextTick()

    expect(sidebarState.refreshCalls).toBe(0)

    window.dispatchEvent(new Event('dev-projects:refresh-requested'))
    await flushPromises()
    await nextTick()

    expect(sidebarState.refreshCalls).toBeGreaterThan(0)
  })

  it('refreshes sidebar and routes to the imported project after jump install succeeds', async () => {
    const upsertDevProjectByConfigPath = vi.fn().mockResolvedValue({
      success: true,
      pluginName: 'new-plugin'
    })

    window.ztools = {
      internal: {
        getDevProjects: vi.fn().mockResolvedValue([]),
        getRunningPlugins: vi.fn().mockResolvedValue([]),
        upsertDevProjectByConfigPath
      }
    }

    sidebarState.plugins = [
      {
        id: 'new-plugin',
        name: 'new-plugin',
        title: '新插件',
        version: '1.0.0',
        path: '/mock/new-plugin',
        configPath: '/mock/new-plugin/plugin.json',
        localStatus: 'ready',
        lastValidatedAt: null,
        lastError: null,
        isRunning: false,
        isDevModeInstalled: false
      }
    ]

    window.history.replaceState({ installFilePath: '/mock/new-plugin/plugin.json' }, '', '#/home')

    const router = createHomeRouter()
    await router.push('/home')
    await router.isReady()

    mount(HomePage, {
      global: {
        plugins: [router]
      }
    })

    await flushPromises()
    await nextTick()

    expect(upsertDevProjectByConfigPath).toHaveBeenCalledWith('/mock/new-plugin/plugin.json')
    expect(router.currentRoute.value.fullPath).toBe('/home/new-plugin/development')
  })

  it('shows error and keeps current route when jump install fails', async () => {
    const upsertDevProjectByConfigPath = vi.fn().mockResolvedValue({
      success: false,
      error: 'plugin.json 格式错误'
    })

    window.ztools = {
      internal: {
        getDevProjects: vi.fn().mockResolvedValue([]),
        getRunningPlugins: vi.fn().mockResolvedValue([]),
        upsertDevProjectByConfigPath
      }
    }

    window.history.replaceState(
      { installFilePath: '/mock/broken/plugin.json' },
      '',
      '#/home/rabbit-screenshot/development'
    )

    const router = createHomeRouter()
    await router.push('/home/rabbit-screenshot/development')
    await router.isReady()

    mount(HomePage, {
      global: {
        plugins: [router]
      }
    })

    await flushPromises()
    await nextTick()

    expect(upsertDevProjectByConfigPath).toHaveBeenCalledWith('/mock/broken/plugin.json')
    expect(messageErrorMock).toHaveBeenCalledWith('plugin.json 格式错误')
    expect(router.currentRoute.value.fullPath).toBe('/home/rabbit-screenshot/development')
  })
})
