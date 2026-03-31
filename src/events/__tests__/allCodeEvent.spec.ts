import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ZtoolsCodeEvent } from '@/events/codeEvent/ZtoolsCodeEvent'

const { showMessageMock, showErrorMessageMock, jumpFunctionPluginInstallerMock } = vi.hoisted(
  () => ({
    showMessageMock: vi.fn(),
    showErrorMessageMock: vi.fn(),
    jumpFunctionPluginInstallerMock: vi.fn()
  })
)

vi.mock('@/utils/message', () => ({
  showMessage: showMessageMock,
  showErrorMessage: showErrorMessageMock
}))

vi.mock('@/views/HomePage', () => ({
  jumpFunctionPluginInstaller: jumpFunctionPluginInstallerMock
}))

import '@/events/allCodeEvent'

type MockHostInternal = {
  getDevProjects?: ReturnType<typeof vi.fn>
  reloadDevProject?: ReturnType<typeof vi.fn>
}

const dispatchReloadAllPluginEvent = (): void => {
  window.dispatchEvent(
    new ZtoolsCodeEvent(
      {
        code: 'function.reload-all-plugin',
        type: 'text',
        payload: null,
        option: null
      },
      {} as any
    )
  )
}

const flushAsyncTasks = async (): Promise<void> => {
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
}

describe('allCodeEvent reload-all-plugin', () => {
  beforeEach(() => {
    showMessageMock.mockReset()
    showErrorMessageMock.mockReset()
    jumpFunctionPluginInstallerMock.mockReset()

    const hostInternal: MockHostInternal = {
      getDevProjects: vi.fn().mockResolvedValue([
        { name: 'dev-a', isDevModeInstalled: true },
        { name: 'dev-b', isDevModeInstalled: false },
        { name: 'dev-c', isDevModeInstalled: true }
      ]),
      reloadDevProject: vi
        .fn()
        .mockResolvedValueOnce({ success: true })
        .mockResolvedValueOnce({ success: false, error: 'boom' })
    }

    window.ztools = {
      internal: hostInternal as any
    } as unknown as typeof window.ztools
  })

  it('只重载已安装开发模式的项目，并汇总部分失败结果', async () => {
    dispatchReloadAllPluginEvent()

    await flushAsyncTasks()

    expect(window.ztools?.internal?.reloadDevProject).toHaveBeenNthCalledWith(1, 'dev-a')
    expect(window.ztools?.internal?.reloadDevProject).toHaveBeenNthCalledWith(2, 'dev-c')
    expect(window.ztools?.internal?.reloadDevProject).toHaveBeenCalledTimes(2)
    expect(showMessageMock).toHaveBeenCalledWith(
      '重载完成：成功 1 个，失败 1 个（dev-c）',
      'error'
    )
  })

  it('没有可重载项目时给出空状态提示', async () => {
    const getDevProjectsMock = window.ztools?.internal?.getDevProjects as ReturnType<typeof vi.fn>

    getDevProjectsMock.mockResolvedValueOnce([
      { name: 'plain-plugin', isDevModeInstalled: false }
    ])

    dispatchReloadAllPluginEvent()

    await flushAsyncTasks()

    expect(window.ztools?.internal?.reloadDevProject).not.toHaveBeenCalled()
    expect(showMessageMock).toHaveBeenCalledWith('没有可重载的开发模式插件', 'warning')
  })

  it('宿主缺少必要能力时提示宿主服务不可用', async () => {
    window.ztools = {
      internal: {
        getDevProjects: vi.fn()
      } as any
    } as unknown as typeof window.ztools

    dispatchReloadAllPluginEvent()

    await flushAsyncTasks()

    expect(showErrorMessageMock).toHaveBeenCalledWith(undefined, '宿主服务不可用')
  })

  it('某个项目抛异常时仍继续重载后续项目', async () => {
    window.ztools = {
      internal: {
        getDevProjects: vi.fn().mockResolvedValue([
          { name: 'dev-a', isDevModeInstalled: true },
          { name: 'dev-b', isDevModeInstalled: true }
        ]),
        reloadDevProject: vi
          .fn()
          .mockRejectedValueOnce(new Error('crash'))
          .mockResolvedValueOnce({ success: true })
      } as any
    } as unknown as typeof window.ztools

    dispatchReloadAllPluginEvent()

    await flushAsyncTasks()

    expect(window.ztools?.internal?.reloadDevProject).toHaveBeenNthCalledWith(1, 'dev-a')
    expect(window.ztools?.internal?.reloadDevProject).toHaveBeenNthCalledWith(2, 'dev-b')
    expect(window.ztools?.internal?.reloadDevProject).toHaveBeenCalledTimes(2)
  })
})
