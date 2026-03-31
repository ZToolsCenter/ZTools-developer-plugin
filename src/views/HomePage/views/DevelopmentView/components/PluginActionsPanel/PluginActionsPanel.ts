import { computed, ref } from 'vue'
import { logError, logInfo, logWarn } from '@/utils/logger'
import {showErrorMessage, showMessage} from '@/utils/message'
import type { HostActionResult, HostInternalAccess } from '@/utils/host'
import type { DevelopmentPluginOverview } from '../../DevelopmentView'

type PluginActionsPanelPlugin =
  | Pick<
      DevelopmentPluginOverview,
      | 'name'
      | 'title'
      | 'path'
      | 'configPath'
      | 'localStatus'
      | 'lastValidatedAt'
      | 'lastError'
      | 'isDevModeInstalled'
    >
  | null

/**
 * 动作卡片使用的属性。
 */
export interface PluginActionsPanelProps {
  /** 开发视图当前选中的插件。 */
  plugin?: PluginActionsPanelPlugin
}

/**
 * 动作卡片对外抛出的事件。
 */
export interface PluginActionsPanelEmits {
  /** 项目状态或开发模式状态更新后请求父层刷新。 */
  (e: 'updated'): void
}

/**
 * 格式化最近一次校验时间，供动作卡片展示。
 */
function formatValidatedAt(value?: string | null): string {
  if (!value) {
    return ''
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleString('zh-CN', { hour12: false })
}

/**
 * 统一校验宿主动作返回值，并在失败时抛出标准错误。
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
 * 提供动作卡片需要的状态与交互方法。
 */
export function usePluginActionsPanel(props: PluginActionsPanelProps, emit: PluginActionsPanelEmits) {
  /**
   * 安装开发模式时的加载状态。
   */
  const isInstalling = ref(false)
  /**
   * 卸载开发模式时的加载状态。
   */
  const isUninstalling = ref(false)
  /**
   * 打开工程目录时的加载状态。
   */
  const isOpeningFolder = ref(false)
  /**
   * 重载插件时的加载状态。
   */
  const isReloading = ref(false)
  /**
   * 重新选择配置文件时的加载状态。
   */
  const isSelectingConfig = ref(false)
  /**
   * 打包插件时的加载状态。
   */
  const isPackaging = ref(false)
  /**
   * 当前项目是否已安装开发模式。
   */
  const isDevModeInstalled = computed(() => Boolean(props.plugin?.isDevModeInstalled))
  /**
   * 当前项目是否具备安装开发模式的条件。
   */
  const canInstallDevMode = computed(
    () => props.plugin?.localStatus === 'ready' && !props.plugin?.isDevModeInstalled
  )
  /**
   * 开发模式卡片是否处于交互中。
   */
  const isDevModeBusy = computed(() => isInstalling.value || isUninstalling.value)
  /**
   * 工程目录是否可打开。
   */
  const canOpenFolder = computed(() => Boolean(props.plugin?.path))
  /**
   * 开发模式动作是否应被禁用。
   */
  const isDevModeDisabled = computed(() => {
    if (isDevModeBusy.value) {
      return true
    }

    if (isDevModeInstalled.value) {
      return !props.plugin?.name
    }

    return !canInstallDevMode.value
  })
  /**
   * 当前项目是否支持重载。
   */
  const canReload = computed(() =>
    ['ready', 'config_missing', 'invalid_config'].includes(props.plugin?.localStatus ?? '')
  )
  /**
   * 当前项目是否支持打包。
   */
  const canPackage = computed(() => props.plugin?.localStatus === 'ready')
  /**
   * 当前是否需要展示修复配置入口。
   */
  const showSelectConfig = computed(() =>
    ['invalid_config', 'unbound'].includes(props.plugin?.localStatus ?? '')
  )
  /**
   * 当前是否应以缺失配置替换卡片覆盖工程目录入口。
   */
  const showMissingConfigBindingCard = computed(
    () => props.plugin?.localStatus === 'config_missing' && Boolean(props.plugin?.name)
  )
  /**
   * 配置状态卡片标题。
   */
  const configStatusTitle = computed(() => {
    switch (props.plugin?.localStatus) {
      case 'ready':
        return '配置状态正常'
      case 'config_missing':
        return '配置文件缺失'
      case 'invalid_config':
        return '配置文件无效'
      case 'unbound':
      default:
        return '未绑定配置文件'
    }
  })
  /**
   * 配置状态卡片描述。
   */
  const configStatusDescription = computed(() => {
    const validatedAt = formatValidatedAt(props.plugin?.lastValidatedAt)
    return validatedAt ? `最近校验 ${validatedAt}` : ''
  })
  /**
   * 配置状态卡片右侧状态文案。
   */
  const configStatusMeta = computed(() => '')
  /**
   * 当前开发模式卡片的标题。
   */
  const devModeTitle = computed(() =>
    isDevModeInstalled.value ? '卸载（开发模式）' : '安装（开发模式）'
  )
  /**
   * 当前开发模式卡片的描述。
   */
  const devModeDescription = computed(() => {
    if (isDevModeInstalled.value) {
      return '将当前工程从 ZTools 的开发模式卸载'
    }

    if (props.plugin?.localStatus !== 'ready') {
      return '需先修复配置状态，才能安装开发模式'
    }

    return '将当前工程以开发模式安装到 ZTools'
  })
  /**
   * 当前开发模式卡片的状态文案。
   */
  const devModeStatus = computed(() => {
    if (isInstalling.value) {
      return '安装中…'
    }

    if (isUninstalling.value) {
      return '卸载中…'
    }

    if (!isDevModeInstalled.value && !canInstallDevMode.value) {
      return '待修复'
    }

    return ''
  })
  /**
   * 重载按钮是否禁用。
   */
  const isReloadDisabled = computed(() => isReloading.value || !canReload.value)
  /**
   * 打包按钮是否禁用。
   */
  const isPackageDisabled = computed(() => isPackaging.value || !canPackage.value)
  /**
   * 重载动作文案。
   */
  const reloadDescription = computed(() => {
    switch (props.plugin?.localStatus) {
      case 'config_missing':
        return '重新检查当前绑定的 plugin.json 是否恢复'
      case 'invalid_config':
        return '重新读取当前配置文件并刷新项目信息'
      case 'ready':
        return '重新读取 plugin.json 与开发资源'
      default:
        return '当前设备未绑定可重载的配置文件'
    }
  })
  /**
   * 打包动作文案。
   */
  const packageDescription = computed(() =>
    canPackage.value ? '生成当前插件的分发包' : '需先修复配置状态后才能打包'
  )
  /**
   * 修复配置卡片描述。
   */
  const selectConfigDescription = computed(() => {
    switch (props.plugin?.localStatus) {
      case 'config_missing':
        return '当前绑定的 plugin.json 不存在，请重新选择配置文件'
      case 'invalid_config':
        return '当前 plugin.json 非法或 identity 不匹配，请重新选择合法配置'
      case 'unbound':
      default:
        return '当前设备尚未绑定配置文件，请选择该项目的 plugin.json'
    }
  })
  /**
   * 修复配置卡片状态文案。
   */
  const selectConfigStatus = computed(() => (isSelectingConfig.value ? '选择中…' : ''))
  /**
   * 修复配置动作是否应被禁用。
   */
  const isSelectConfigDisabled = computed(() => isSelectingConfig.value || !showSelectConfig.value)

  /**
   * 解析当前动作卡片所使用的宿主接口。
   */
  function resolveHostInternal(): HostInternalAccess | undefined {
    // @ts-ignore
    return window.ztools?.internal
  }

  /**
   * 动作成功后通知父层刷新列表。
   */
  function notifyUpdated(): void {
    logInfo('PluginActionsPanel', '刷新列表', `请求刷新 ${props.plugin?.name || 'unknown project'}`)
    emit('updated')
  }

  /**
   * 请求宿主安装或卸载开发模式。
   */
  async function handleToggleDevMode() {
    if (!props.plugin?.name || isDevModeBusy.value) {
      return
    }

    const hostInternal = resolveHostInternal()

    if (isDevModeInstalled.value) {
      if (!hostInternal?.uninstallDevPlugin) {
        logWarn('PluginActionsPanel', '卸载开发模式', '宿主未提供 uninstallDevPlugin 能力')
        showErrorMessage(undefined, '宿主服务不可用')
        return
      }

      isUninstalling.value = true
      logInfo('PluginActionsPanel', '卸载开发模式', `开始卸载 ${props.plugin.name}`)

      try {
        ensureActionSuccess(
          await hostInternal.uninstallDevPlugin(props.plugin.name),
          '卸载开发模式失败'
        )
        logInfo('PluginActionsPanel', '卸载开发模式', `卸载完成: ${props.plugin.name}`)
        notifyUpdated()
      } catch (error) {
        logError(
          'PluginActionsPanel',
          '卸载开发模式',
          `卸载失败: ${error instanceof Error ? error.message : 'unknown error'}`
        )
        showErrorMessage(error, '卸载开发模式失败')
      } finally {
        isUninstalling.value = false
      }

      return
    }

    if (!canInstallDevMode.value) {
      return
    }

    if (!hostInternal?.installDevPlugin) {
      logWarn('PluginActionsPanel', '安装开发模式', '宿主未提供 installDevPlugin 能力')
      showErrorMessage(undefined, '宿主服务不可用')
      return
    }

    isInstalling.value = true
    logInfo('PluginActionsPanel', '安装开发模式', `开始安装 ${props.plugin.name}`)

    try {
      ensureActionSuccess(await hostInternal.installDevPlugin(props.plugin.name), '安装开发模式失败')
      logInfo('PluginActionsPanel', '安装开发模式', `安装完成: ${props.plugin.name}`)
      notifyUpdated()
    } catch (error) {
      logError(
        'PluginActionsPanel',
        '安装开发模式',
        `安装失败: ${error instanceof Error ? error.message : 'unknown error'}`
      )
      showErrorMessage(error, '安装开发模式失败')
    } finally {
      isInstalling.value = false
    }
  }

  /**
   * 请求宿主打开当前插件目录。
   */
  async function handleOpenFolder() {
    if (!props.plugin?.path) {
      return
    }

    isOpeningFolder.value = true
    logInfo('PluginActionsPanel', '打开目录', `请求打开 ${props.plugin.path}`)
    const hostInternal = resolveHostInternal()

    if (!hostInternal?.revealInFinder) {
      logWarn('PluginActionsPanel', '打开目录', '宿主未提供 revealInFinder 能力')
      showErrorMessage(undefined, '宿主服务不可用')
      isOpeningFolder.value = false
      return
    }

    try {
      await hostInternal.revealInFinder(props.plugin.path)
      logInfo('PluginActionsPanel', '打开目录', `已打开 ${props.plugin.path}`)
    } catch (error) {
      logError(
        'PluginActionsPanel',
        '打开目录',
        `打开目录失败: ${error instanceof Error ? error.message : 'unknown error'}`
      )
      showErrorMessage(error, '无法打开目录')
    } finally {
      isOpeningFolder.value = false
    }
  }

  /**
   * 请求宿主重新加载当前开发项目。
   */
  async function handleReload() {
    if (!props.plugin?.name || !canReload.value) {
      return
    }

    isReloading.value = true
    logInfo('PluginActionsPanel', '重载插件', `开始重载 ${props.plugin.name}`)
    const hostInternal = resolveHostInternal()

    if (!hostInternal?.reloadDevProject) {
      logWarn('PluginActionsPanel', '重载插件', '宿主未提供 reloadDevProject 能力')
      showErrorMessage(undefined, '宿主服务不可用')
      isReloading.value = false
      return
    }

    try {
      ensureActionSuccess(await hostInternal.reloadDevProject(props.plugin.name), '重载失败')
      logInfo('PluginActionsPanel', '重载插件', `重载完成: ${props.plugin.name}`)
      showMessage('重载插件成功', 'success')
      notifyUpdated()
    } catch (error) {
      logError(
        'PluginActionsPanel',
        '重载插件',
        `重载失败: ${error instanceof Error ? error.message : 'unknown error'}`
      )
      showErrorMessage(error, '重载失败')
    } finally {
      isReloading.value = false
    }
  }

  /**
   * 请求宿主重新选择配置文件。
   */
  async function handleSelectConfig() {
    if (!props.plugin?.name || !showSelectConfig.value) {
      return
    }

    const hostInternal = resolveHostInternal()

    if (!hostInternal?.selectDevProjectConfig) {
      logWarn('PluginActionsPanel', '选择配置文件', '宿主未提供 selectDevProjectConfig 能力')
      showErrorMessage(undefined, '宿主服务不可用')
      return
    }

    isSelectingConfig.value = true
    logInfo('PluginActionsPanel', '选择配置文件', `开始修复 ${props.plugin.name}`)

    try {
      ensureActionSuccess(
        await hostInternal.selectDevProjectConfig(props.plugin.name),
        '选择配置文件失败'
      )
      logInfo('PluginActionsPanel', '选择配置文件', `修复完成: ${props.plugin.name}`)
      notifyUpdated()
    } catch (error) {
      logError(
        'PluginActionsPanel',
        '选择配置文件',
        `修复失败: ${error instanceof Error ? error.message : 'unknown error'}`
      )
      showErrorMessage(error, '选择配置文件失败')
    } finally {
      isSelectingConfig.value = false
    }
  }

  /**
   * 请求宿主打包当前开发项目。
   */
  async function handlePackagePlugin() {
    if (!props.plugin?.name || !canPackage.value) {
      return
    }

    isPackaging.value = true
    logInfo('PluginActionsPanel', '打包插件', `打包请求: ${props.plugin.name}`)
    const hostInternal = resolveHostInternal()

    if (!hostInternal?.packageDevProject) {
      logWarn('PluginActionsPanel', '打包插件', '宿主未提供 packageDevProject 能力')
      showErrorMessage(undefined, '宿主服务不可用')
      isPackaging.value = false
      return
    }

    try {
      ensureActionSuccess(await hostInternal.packageDevProject(props.plugin.name), '打包失败')
      logInfo('PluginActionsPanel', '打包插件', `打包完成 ${props.plugin.name}`)
    } catch (error) {
      logError(
        'PluginActionsPanel',
        '打包插件',
        `打包失败: ${error instanceof Error ? error.message : 'unknown error'}`
      )
      showErrorMessage(error, '打包失败')
    } finally {
      isPackaging.value = false
    }
  }

  return {
    configStatusDescription,
    configStatusMeta,
    configStatusTitle,
    devModeDescription,
    devModeStatus,
    devModeTitle,
    isDevModeBusy,
    isDevModeDisabled,
    isDevModeInstalled,
    isOpenFolderDisabled: computed(() => isOpeningFolder.value || !canOpenFolder.value),
    isOpeningFolder,
    isPackageDisabled,
    isPackaging,
    isReloadDisabled,
    isReloading,
    packageDescription,
    reloadDescription,
    selectConfigDescription,
    isSelectConfigDisabled,
    selectConfigStatus,
    showMissingConfigBindingCard,
    showSelectConfig,
    handleOpenFolder,
    handlePackagePlugin,
    handleReload,
    handleSelectConfig,
    handleToggleDevMode
  }
}
