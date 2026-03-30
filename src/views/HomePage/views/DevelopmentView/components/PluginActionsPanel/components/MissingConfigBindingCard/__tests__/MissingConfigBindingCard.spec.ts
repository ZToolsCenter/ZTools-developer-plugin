import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MissingConfigBindingCard from '../MissingConfigBindingCard.vue'

const { messageErrorMock } = vi.hoisted(() => ({
  messageErrorMock: vi.fn()
}))

vi.mock('element-plus', () => ({
  ElMessage: {
    error: messageErrorMock
  }
}))

describe('MissingConfigBindingCard', () => {
  beforeEach(() => {
    messageErrorMock.mockClear()
  })

  it('calls selectDevProjectConfig immediately after dropping plugin.json', async () => {
    const selectDevProjectConfig = vi.fn().mockResolvedValue({ success: true })
    const getPathForFile = vi.fn().mockReturnValue('/mock/plugin/plugin.json')
    window.ztools = {
      getPathForFile,
      internal: {
        getDevProjects: vi.fn(),
        getRunningPlugins: vi.fn(),
        selectDevProjectConfig
      }
    }

    const wrapper = mount(MissingConfigBindingCard, {
      props: { pluginName: 'excellent-todo' }
    })

    const file = new File(['{}'], 'plugin.json', { type: 'application/json' })
    await wrapper.trigger('drop', {
      dataTransfer: { files: [file] }
    })
    await flushPromises()

    expect(getPathForFile).toHaveBeenCalledWith(file)
    expect(selectDevProjectConfig).toHaveBeenCalledWith(
      'excellent-todo',
      '/mock/plugin/plugin.json'
    )
    expect(wrapper.emitted('updated')).toHaveLength(1)
  })

  it('shows ElMessage.error and aborts when the dropped file is not plugin.json', async () => {
    const selectDevProjectConfig = vi.fn()
    window.ztools = {
      getPathForFile: vi.fn().mockReturnValue('/mock/plugin/not-plugin.txt'),
      internal: {
        getDevProjects: vi.fn(),
        getRunningPlugins: vi.fn(),
        selectDevProjectConfig
      }
    }

    const wrapper = mount(MissingConfigBindingCard, {
      props: { pluginName: 'excellent-todo' }
    })

    const file = new File(['x'], 'readme.md', { type: 'text/markdown' })
    await wrapper.trigger('drop', {
      dataTransfer: { files: [file] }
    })
    await flushPromises()

    expect(messageErrorMock).toHaveBeenCalledWith('请选择 plugin.json 文件')
    expect(selectDevProjectConfig).not.toHaveBeenCalled()
    expect(wrapper.emitted('updated')).toBeUndefined()
  })

  it('calls selectDevProjectConfig without explicit path when clicking the card', async () => {
    const selectDevProjectConfig = vi.fn().mockResolvedValue({ success: true })
    window.ztools = {
      getPathForFile: vi.fn(),
      internal: {
        getDevProjects: vi.fn(),
        getRunningPlugins: vi.fn(),
        selectDevProjectConfig
      }
    }

    const wrapper = mount(MissingConfigBindingCard, {
      props: { pluginName: 'excellent-todo' }
    })

    await wrapper.trigger('click')
    await flushPromises()

    expect(selectDevProjectConfig).toHaveBeenCalledWith('excellent-todo', undefined)
    expect(wrapper.emitted('updated')).toHaveLength(1)
  })
})
