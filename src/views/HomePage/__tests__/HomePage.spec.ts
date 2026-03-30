import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { defineComponent, h, nextTick, onMounted } from 'vue'
const { sidebarState } = vi.hoisted(() => ({
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
})
