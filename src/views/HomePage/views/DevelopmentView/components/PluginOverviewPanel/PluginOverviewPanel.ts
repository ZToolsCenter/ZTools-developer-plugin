import { computed, reactive, ref } from 'vue'
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

  const displayPlatform = computed(() => {
    const p = props.plugin?.platform
    return Array.isArray(p) && p.length > 0 ? p.join(' / ') : ''
  })

  // ---- 编辑登记信息 ----
  const isEditDialogVisible = ref(false)
  const isEditing = ref(false)
  const isRefreshing = ref(false)
  const editForm = reactive({
    name: '',
    title: '',
    description: '',
    platform: [] as string[],
    author: ''
  })

  function openEditDialog(): void {
    editForm.name = props.plugin?.name ?? ''
    editForm.title = props.plugin?.title ?? ''
    editForm.description = props.plugin?.description ?? ''
    editForm.platform = Array.isArray(props.plugin?.platform) ? [...props.plugin!.platform!] : []
    editForm.author = props.plugin?.author ?? ''
    isEditDialogVisible.value = true
  }

  async function handleRefreshProject(): Promise<void> {
    if (!props.plugin?.name) return

    const hostInternal = resolveHostInternal()
    if (!hostInternal?.validateDevProject) {
      showErrorMessage(undefined, '宿主服务不可用')
      return
    }

    isRefreshing.value = true
    try {
      ensureActionSuccess(await hostInternal.validateDevProject(props.plugin.name), '刷新失败')
      notifyUpdated()
    } catch (error) {
      logError('PluginOverviewPanel', '刷新项目', `失败: ${error instanceof Error ? error.message : 'unknown'}`)
      showErrorMessage(error, '刷新项目信息失败')
    } finally {
      isRefreshing.value = false
    }
  }

  async function handleUpdateMeta(form: { name: string; title: string; description: string; platform: string[]; author: string }): Promise<void> {
    if (!props.plugin?.name) return

    const hostInternal = resolveHostInternal()
    if (!hostInternal?.updateDevProjectMeta) {
      showErrorMessage(undefined, '宿主服务不可用')
      return
    }

    isEditing.value = true
    try {
      const result = await hostInternal.updateDevProjectMeta(props.plugin.name, {
        title: form.title,
        description: form.description,
        platform: [...form.platform],
        author: form.author
      })
      ensureActionSuccess(result, '更新失败')
      isEditDialogVisible.value = false
      notifyUpdated()
    } catch (error) {
      logError('PluginOverviewPanel', '更新登记信息', `失败: ${error instanceof Error ? error.message : 'unknown'}`)
      showErrorMessage(error, '更新登记信息失败')
    } finally {
      isEditing.value = false
    }
  }

  // ---- 开发指南弹窗 ----
  const isGuideDialogVisible = ref(false)

  function openGuideDialog(): void {
    isGuideDialogVisible.value = true
  }

  function openProjectFolder(): void {
    const projectPath = props.plugin?.path
    if (projectPath) {
      window.ztools?.shellOpenPath(projectPath)
    }
  }

  return {
    displayAuthor,
    displayPluginId,
    displayDescription,
    displayPlatform,
    handleRemoveProject,
    handleRefreshProject,
    isRefreshing,
    isEditDialogVisible,
    isEditing,
    editForm,
    openEditDialog,
    handleUpdateMeta,
    isGuideDialogVisible,
    openGuideDialog,
    openProjectFolder,
  }
}
