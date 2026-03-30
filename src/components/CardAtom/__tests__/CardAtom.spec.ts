import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CardAtom from '../CardAtom.vue'

describe('CardAtom', () => {
  it('prefers props content and falls back to slots for icon and status', () => {
    const wrapper = mount(CardAtom, {
      props: {
        title: '工程目录',
        description: '/mock/rabbit-screenshot',
      },
      slots: {
        title: '<span class="card-atom-test__slot-title">插槽标题</span>',
        description: '<span class="card-atom-test__slot-description">插槽描述</span>',
        icon: '<span class="card-atom-test__icon">icon</span>',
        status: '<span class="card-atom-test__status">status</span>',
      }
    })

    expect(wrapper.text()).toContain('工程目录')
    expect(wrapper.text()).toContain('/mock/rabbit-screenshot')
    expect(wrapper.text()).not.toContain('插槽标题')
    expect(wrapper.text()).not.toContain('插槽描述')
    expect(wrapper.find('.card-atom-test__icon').exists()).toBe(true)
    expect(wrapper.find('.card-atom-test__status').exists()).toBe(true)
  })

  it('renders slot content when title and description props are absent', () => {
    const wrapper = mount(CardAtom, {
      slots: {
        title: '<span class="card-atom-test__title">插槽标题</span>',
        description: '<span class="card-atom-test__description">插槽描述</span>',
      }
    })

    expect(wrapper.find('.card-atom-test__title').exists()).toBe(true)
    expect(wrapper.find('.card-atom-test__description').exists()).toBe(true)
  })

  it('keeps default content wrappers when title, description, and status come from slots', () => {
    const wrapper = mount(CardAtom, {
      slots: {
        title: '<span class="card-atom-test__title">插槽标题</span>',
        description: '<span class="card-atom-test__description">插槽描述</span>',
        status: '<span class="card-atom-test__status">插槽状态</span>',
      }
    })

    expect(wrapper.find('.card-atom__title .card-atom-test__title').exists()).toBe(true)
    expect(wrapper.find('.card-atom__description .card-atom-test__description').exists()).toBe(true)
    expect(wrapper.find('.card-atom__status .card-atom-test__status').exists()).toBe(true)
  })
})
