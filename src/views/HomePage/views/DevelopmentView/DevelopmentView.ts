import { computed, ref, watch } from 'vue'
import { logError, logInfo, logWarn } from '@/utils/logger'
import type { DevProjectLocalStatus } from '@/utils/host'

/**
 * 开发视图路由渲染所需的插件数据。
 */
export interface DevelopmentPluginOverview {
  /** 用于路由保持稳定的插件名称。 */
  name: string
  /** 页面内展示的插件标题。 */
  title: string
  /** 插件版本号。 */
  version: string
  /** 插件描述文案。 */
  description?: string
  /** 插件作者信息。 */
  author?: string
  /** 插件工程目录路径。 */
  path: string | null
  /** 当前设备绑定的配置文件路径。 */
  configPath: string | null
  /** 当前设备上的本地状态。 */
  localStatus: DevProjectLocalStatus
  /** 最近一次校验时间。 */
  lastValidatedAt: string | null
  /** 最近一次校验错误。 */
  lastError: string | null
  /** 插件图标地址。 */
  logo?: string
  /** 插件当前是否处于运行状态。 */
  isRunning: boolean
  /** 插件是否已安装开发模式。 */
  isDevModeInstalled: boolean
  /** 支持的平台列表。 */
  platform?: string[]
}

/**
 * 开发视图组件接收的属性。
 */
export interface DevelopmentViewProps {
  /** 当前选中的开发中插件，加载阶段可能为空。 */
  plugin?: DevelopmentPluginOverview | null
}

/**
 * 开发视图对外抛出的事件。
 */
export interface DevelopmentViewEmits {
  /** 请求父层刷新开发项目列表。 */
  (e: 'refresh-dev-projects'): void
}

/**
 * 提供开发视图渲染所需的派生状态。
 */
export function useDevelopmentView(props: DevelopmentViewProps, emit: DevelopmentViewEmits) {
  /**
   * 视图可以直接消费的插件对象。
   */
  const currentPlugin = computed(() => props.plugin ?? null)
  /**
   * 标记当前是否已经具备可渲染的插件数据。
   */
  const isDevelopmentViewReady = computed(() => Boolean(currentPlugin.value))
  /**
   * 避免同一项目在一次详情停留期间重复触发校验。
   */
  const validatedPluginName = ref<string | null>(null)

  /**
   * 按需校验当前详情项目的本地绑定状态。
   */
  async function validateCurrentPlugin(pluginName: string): Promise<void> {
    const host = window.ztools?.internal

    if (!host?.validateDevProject) {
      logWarn('DevelopmentView', '按需校验', '宿主未提供 validateDevProject 能力')
      return
    }

    logInfo('DevelopmentView', '按需校验', `开始校验开发项目: ${pluginName}`)

    try {
      const result = await host.validateDevProject(pluginName)
      if (!result?.success) {
        logWarn(
          'DevelopmentView',
          '按需校验',
          `开发项目校验未通过: ${result?.error || 'unknown error'}`
        )
      } else {
        logInfo('DevelopmentView', '按需校验', `开发项目校验完成: ${pluginName}`)
      }
    } catch (error) {
      logError(
        'DevelopmentView',
        '按需校验',
        `开发项目校验失败: ${error instanceof Error ? error.message : 'unknown error'}`
      )
    } finally {
      emit('refresh-dev-projects')
    }
  }

  watch(
    () => props.plugin?.name ?? '',
    async (pluginName) => {
      if (!pluginName) {
        logInfo('DevelopmentView', '按需校验', '当前未选中开发项目，跳过校验')
        validatedPluginName.value = null
        return
      }

      if (validatedPluginName.value === pluginName) {
        logInfo('DevelopmentView', '按需校验', `跳过重复校验: ${pluginName}`)
        return
      }

      validatedPluginName.value = pluginName
      await validateCurrentPlugin(pluginName)
    },
    { immediate: true }
  )

  return {
    currentPlugin,
    isDevelopmentViewReady,
    validateCurrentPlugin
  }
}
