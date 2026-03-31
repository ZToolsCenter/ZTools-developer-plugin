import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import DevPluginContextMenu from '../DevPluginContextMenu.vue'

const { dropdownHandleOpenMock, dropdownHandleCloseMock } = vi.hoisted(() => ({
  dropdownHandleOpenMock: vi.fn(),
  dropdownHandleCloseMock: vi.fn()
}))

vi.mock('element-plus/theme-chalk/base.css', () => ({}))
vi.mock('element-plus/theme-chalk/el-dropdown.css', () => ({}))
vi.mock('element-plus/theme-chalk/el-dropdown-menu.css', () => ({}))
vi.mock('element-plus/theme-chalk/el-dropdown-item.css', () => ({}))

vi.mock('element-plus', () => ({
  ElDropdown: defineComponent({
    name: 'ElDropdown',
    props: {
      virtualRef: {
        type: Object,
        default: null
      },
      showArrow: {
        type: Boolean,
        default: true
      },
      popperOptions: {
        type: Object,
        default: () => ({})
      },
      virtualTriggering: {
        type: Boolean,
        default: false
      },
      trigger: {
        type: String,
        default: ''
      },
      placement: {
        type: String,
        default: ''
      }
    },
    emits: ['visible-change'],
    setup(_, { slots, emit, expose }) {
      expose({
        handleOpen: dropdownHandleOpenMock,
        handleClose: dropdownHandleCloseMock
      })

      return () =>
        h('div', { class: 'el-dropdown' }, [
          slots.default?.(),
          h('div', { class: 'el-dropdown__menu' }, slots.dropdown?.()),
          h(
            'button',
            {
              class: 'el-dropdown__close',
              onClick: () => emit('visible-change', false)
            },
            'close'
          )
        ])
    }
  }),
  ElDropdownMenu: defineComponent({
    name: 'ElDropdownMenu',
    setup(_, { slots }) {
      return () => h('div', { class: 'el-dropdown-menu' }, slots.default?.())
    }
  }),
  ElDropdownItem: defineComponent({
    name: 'ElDropdownItem',
    emits: ['click'],
    setup(_, { slots, emit }) {
      return () =>
        h(
          'button',
          {
            class: 'el-dropdown-item',
            onClick: () => emit('click')
          },
          slots.default?.()
        )
    }
  })
}))

describe('DevPluginContextMenu', () => {
  it('uses a virtual trigger rect mapped from the contextmenu position', async () => {
    const wrapper = mount(DevPluginContextMenu, {
      props: {
        visible: false,
        plugin: null,
        position: {
          x: 120,
          y: 240
        }
      }
    })

    const dropdown = wrapper.findComponent({ name: 'ElDropdown' })
    const virtualRef = dropdown.props('virtualRef') as
      | { getBoundingClientRect: () => DOMRect }
      | undefined

    expect(dropdown.props('showArrow')).toBe(false)
    expect(dropdown.props('trigger')).toBe('contextmenu')
    expect(dropdown.props('placement')).toBe('bottom-start')
    expect(dropdown.props('virtualTriggering')).toBe(true)
    expect(typeof virtualRef?.getBoundingClientRect).toBe('function')

    const rect = virtualRef?.getBoundingClientRect()

    expect(rect?.x).toBe(120)
    expect(rect?.y).toBe(240)
    expect(rect?.left).toBe(120)
    expect(rect?.top).toBe(240)
  })

  it('opens and closes the dropdown instance when visibility changes', async () => {
    dropdownHandleOpenMock.mockReset()
    dropdownHandleCloseMock.mockReset()

    const wrapper = mount(DevPluginContextMenu, {
      props: {
        visible: false,
        plugin: null,
        position: {
          x: 10,
          y: 20
        }
      }
    })

    expect(dropdownHandleOpenMock).not.toHaveBeenCalled()
    expect(dropdownHandleCloseMock).not.toHaveBeenCalled()

    await wrapper.setProps({ visible: true })
    await flushPromises()

    expect(dropdownHandleOpenMock).toHaveBeenCalledTimes(1)

    await wrapper.setProps({ visible: false })
    await flushPromises()

    expect(dropdownHandleCloseMock).toHaveBeenCalledTimes(1)
  })

  it('emits pin-to-top with the current plugin id', async () => {
    dropdownHandleOpenMock.mockReset()
    dropdownHandleCloseMock.mockReset()

    const wrapper = mount(DevPluginContextMenu, {
      props: {
        visible: true,
        plugin: {
          id: 'alpha',
          name: 'alpha',
          title: 'Alpha',
          version: '1.0.0',
          description: '',
          author: '',
          homepage: '',
          logo: '',
          path: null,
          configPath: null,
          localStatus: 'ready',
          lastValidatedAt: null,
          lastError: null,
          isRunning: false,
          isDevModeInstalled: false
        },
        position: {
          x: 120,
          y: 240
        }
      }
    })

    await wrapper.findComponent({ name: 'ElDropdownItem' }).trigger('click')
    await flushPromises()

    expect(wrapper.emitted('pin-to-top')?.[0]).toEqual(['alpha'])
  })

  it('emits close when dropdown visibility turns false', async () => {
    dropdownHandleOpenMock.mockReset()
    dropdownHandleCloseMock.mockReset()

    const wrapper = mount(DevPluginContextMenu, {
      props: {
        visible: true,
        plugin: null,
        position: {
          x: 10,
          y: 20
        }
      }
    })

    await wrapper.find('.el-dropdown__close').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
