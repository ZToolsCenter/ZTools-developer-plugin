import { addZtoolsCodeEventListener } from '@/events/codeEvent'
import { jumpFunctionPluginInstaller } from '@/views/HomePage'
import { showErrorMessage, showMessage } from '@/utils/message'

const DEV_PROJECTS_REFRESH_EVENT = 'dev-projects:refresh-requested'

export function dispatchDevProjectsRefreshRequested(): void {
  window.dispatchEvent(new Event(DEV_PROJECTS_REFRESH_EVENT))
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
 * 重载所有已安装开发模式的插件
 */
addZtoolsCodeEventListener('function.reload-all-plugin', async () => {
  const internal = window.ztools?.internal
  if (!internal?.getDevProjects || !internal?.reloadDevProject) {
    showErrorMessage(undefined, '宿主服务不可用')
    return
  }

  const projects = await internal.getDevProjects()
  const targets = projects.filter((p) => p.isDevModeInstalled)

  if (targets.length === 0) {
    showMessage('没有可重载的开发模式插件', 'warning')
    return
  }

  const failedNames: string[] = []
  let successCount = 0

  for (const project of targets) {
    try {
      const result = await internal.reloadDevProject!(project.name)
      if (result.success) {
        successCount++
      } else {
        failedNames.push(project.name)
      }
    } catch {
      failedNames.push(project.name)
    }
  }

  if (failedNames.length === 0) {
    showMessage(`重载完成：全部 ${successCount} 个成功`, 'success')
  } else {
    showMessage(
      `重载完成：成功 ${successCount} 个，失败 ${failedNames.length} 个（${failedNames.join('、')}）`,
      'error'
    )
  }
})
