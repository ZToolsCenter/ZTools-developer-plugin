import { addZtoolsCodeEventListener } from '@/events/codeEvent'
import { showErrorMessage, showMessage } from '@/utils/message'
import { jumpFunctionPluginInstaller } from '@/views/HomePage'

const DEV_PROJECTS_REFRESH_EVENT = 'dev-projects:refresh-requested'

type DevProjectSummary = {
  name?: string
  isDevModeInstalled?: boolean
}

type ReloadFailure = {
  name: string
  message: string
}

function resolveFailureNames(failures: ReloadFailure[]): string {
  return failures
    .map((item) => item.name)
    .slice(0, 3)
    .join('、')
}

function dispatchDevProjectsRefreshRequested(): void {
  window.dispatchEvent(new Event(DEV_PROJECTS_REFRESH_EVENT))
}

async function handleReloadAllDevPlugins(): Promise<void> {
  const hostInternal = window.ztools?.internal

  if (!hostInternal?.getDevProjects || !hostInternal?.reloadDevProject) {
    showErrorMessage(undefined, '宿主服务不可用')
    return
  }

  try {
    const projects = await hostInternal.getDevProjects()
    const reloadableProjects = (Array.isArray(projects) ? projects : []).filter(
      (project: DevProjectSummary) => project?.isDevModeInstalled && project?.name
    )

    if (reloadableProjects.length === 0) {
      showMessage('没有可重载的开发模式插件', 'warning')
      return
    }

    let successCount = 0
    const failures: ReloadFailure[] = []

    for (const project of reloadableProjects) {
      try {
        const result = await hostInternal.reloadDevProject(project.name as string)
        if (!result?.success) {
          failures.push({
            name: project.name as string,
            message: result?.error || '重载失败'
          })
          continue
        }

        successCount += 1
      } catch (error) {
        failures.push({
          name: project.name as string,
          message: error instanceof Error ? error.message : '重载失败'
        })
      }
    }

    if (failures.length === 0) {
      showMessage(`重载完成：成功 ${successCount} 个`, 'success')
    } else if (successCount === 0) {
      showMessage(`重载失败：共 ${failures.length} 个项目失败（${resolveFailureNames(failures)}）`, 'error')
    } else {
      showMessage(
        `重载完成：成功 ${successCount} 个，失败 ${failures.length} 个（${resolveFailureNames(failures)}）`,
        'error'
      )
    }

    if (failures.length > 0) {
      console.error('[code-event] 批量重载开发模式插件存在失败项', failures)
    }

    dispatchDevProjectsRefreshRequested()
  } catch (error) {
    console.error('[code-event] 批量重载开发模式插件失败', error)
    showErrorMessage(error, '重载所有开发模式插件失败')
  }
}


/**
 * 添加开发中插件
 */
addZtoolsCodeEventListener('function.add-dev-plugin', (e) => {
  const { payload, code } = e.pluginEnterParams
  console.info(`[code-event] ${code} 成功接收事件`)
  const files = Array.isArray(payload) ? payload : []
  const installFilePaths = files
    .map((file: { path?: string }) => file.path?.trim())
    .filter((path): path is string => Boolean(path))

  if (files && files.length > 0) {
    console.log({ installFilePath: installFilePaths[0] })
    jumpFunctionPluginInstaller({ installFilePath: installFilePaths[0] })
  }
})

/**
 * 重载所有开发中插件
 */
addZtoolsCodeEventListener('function.reload-all-plugin', () => {
  void handleReloadAllDevPlugins()
})
