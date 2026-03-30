import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TextEllipsis from '../TextEllipsis.vue'

describe('TextEllipsis', () => {
  it('renders single-line ellipsis class for one-line text', () => {
    const wrapper = mount(TextEllipsis, {
      props: {
        text: '这是一个很长很长的路径文本'
      },
      global: {
        stubs: {
          ElTooltip: {
            props: ['disabled', 'effect', 'placement', 'popperClass'],
            template: '<div class="el-tooltip-stub"><slot /><slot name="content" /></div>'
          }
        }
      }
    })

    expect(wrapper.find('.omit-text').exists()).toBe(true)
    expect(wrapper.find('.text-ellipsis').exists()).toBe(true)
  })

  it('enables tooltip only after overflow is detected', async () => {
    const wrapper = mount(TextEllipsis, {
      props: {
        text: '这是一个很长很长的路径文本'
      },
      global: {
        stubs: {
          ElTooltip: {
            props: ['disabled', 'effect', 'placement', 'popperClass'],
            template: '<div class="el-tooltip-stub" :data-disabled="String(disabled)"><slot /><slot name="content" /></div>'
          }
        }
      }
    })

    const text = wrapper.find('.text-ellipsis').element
    Object.defineProperty(text, 'clientWidth', {
      configurable: true,
      value: 100
    })
    Object.defineProperty(text, 'scrollWidth', {
      configurable: true,
      value: 200
    })

    window.dispatchEvent(new Event('resize'))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.el-tooltip-stub').attributes('data-disabled')).toBe('false')
  })
})
