import { computed } from 'vue'
import { ElMessageBox } from 'element-plus'
import { logError, logInfo, logWarn } from '@/utils/logger'
import { showErrorMessage } from '@/utils/message'
import type { HostActionResult, HostInternalAccess } from '@/utils/host'
import type { DevelopmentPluginOverview } from '../../DevelopmentView'

/**
 * 插件概览卡片使用的属性。
 */
export interface PluginOverviewPanelProps {
  /** 路由层传入的插件元数据。 */
  plugin?: DevelopmentPluginOverview | null
}

/**
 * 概览卡片对外抛出的事件。
 */
export interface PluginOverviewPanelEmits {
  /** 项目删除后请求父层刷新。 */
  (e: 'updated'): void
}

/**
 * 删除动作与其他宿主操作统一使用的结果校验。
 */
function ensureActionSuccess(result: HostActionResult | void, fallback: string): void {
  if (!result) {
    return
  }

  if (!result.success) {
    throw new Error(result.error || fallback)
  }
}

/**
 * 提供概览卡片渲染所需的派生字段。
 */
export function usePluginOverviewPanel(
  props: PluginOverviewPanelProps,
  emit: PluginOverviewPanelEmits
) {
  /**
   * 宿主缺失作者信息时使用的兜底文案。
   */
  const displayAuthor = computed(() => props.plugin?.author ?? '未知开发者')
  /**
   * 宿主缺失应用标识时使用的兜底文案。
   */
  const displayPluginId = computed(() => props.plugin?.name ?? '--')
  /**
   * 宿主缺失版本号时使用的兜底文案。
   */
  const displayVersion = computed(() => props.plugin?.version ?? '--')
  /**
   * 宿主缺失描述信息时使用的兜底文案。
   */
  const displayDescription = computed(() => props.plugin?.description ?? '当前还没有可展示的插件描述。')

  /**
   * 解析概览卡片依赖的宿主接口。
   */
  function resolveHostInternal(): HostInternalAccess | undefined {
    return window.ztools?.internal
  }

  /**
   * 删除成功后通知父层刷新列表。
   */
  function notifyUpdated(): void {
    logInfo('PluginOverviewPanel', '刷新列表', `请求刷新 ${props.plugin?.name || 'unknown project'}`)
    emit('updated')
  }

  /**
   * 从开发项目列表中移除当前项目。
   */
  async function handleRemoveProject(): Promise<void> {
    if (!props.plugin?.name) {
      return
    }

    const hostInternal = resolveHostInternal()
    if (!hostInternal?.removeDevProject) {
      logWarn('PluginOverviewPanel', '删除项目', '宿主未提供 removeDevProject 能力')
      showErrorMessage(undefined, '宿主服务不可用')
      return
    }

    try {
      await ElMessageBox.confirm(
        '删除后将仅从开发项目列表中移除，不会删除磁盘上的工程目录。是否继续？',
        '删除项目',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning',
          confirmButtonClass: 'el-button--danger'
        }
      )
    } catch {
      return
    }

    logInfo('PluginOverviewPanel', '删除项目', `开始删除 ${props.plugin.name}`)

    try {
      ensureActionSuccess(await hostInternal.removeDevProject(props.plugin.name), '删除项目失败')
      logInfo('PluginOverviewPanel', '删除项目', `删除完成: ${props.plugin.name}`)
      notifyUpdated()
    } catch (error) {
      logError(
        'PluginOverviewPanel',
        '删除项目',
        `删除失败: ${error instanceof Error ? error.message : 'unknown error'}`
      )
      showErrorMessage(error, '删除项目失败')
    }
  }

  return {
    displayAuthor,
    displayPluginId,
    displayVersion,
    displayDescription,
    handleRemoveProject,
  }
}
