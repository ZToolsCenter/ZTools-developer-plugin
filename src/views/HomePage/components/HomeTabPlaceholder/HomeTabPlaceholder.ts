import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { logInfo } from '@/utils/logger'
import { HOME_ROUTE_NAMES } from '@/views/HomePage/HomePage'

/**
 * 路由占位组件所需的静态元数据。
 */
export interface HomeTabPlaceholderMeta {
  /** 卡片顶部标题。 */
  readonly cardHeadline: string
  /** 标题下方的补充说明。 */
  readonly cardSubheadline: string
  /** 空状态主标题。 */
  readonly placeholderTitle: string
  /** 空状态描述文案。 */
  readonly placeholderDescription: string
  /** 指引用户返回当前工作区的提示文案。 */
  readonly placeholderHint: string
  /** 返回操作按钮文案。 */
  readonly actionLabel: string
}

/**
 * 共享路由占位组件使用的属性。
 */
export interface HomeTabPlaceholderProps {
  /** 当前占位页渲染使用的静态元数据。 */
  meta: HomeTabPlaceholderMeta
}

/**
 * 提供路由占位组件所需的状态与交互。
 */
export function useHomeTabPlaceholder() {
  /**
   * 当前激活的路由对象，用于解析插件标识。
   */
  const route = useRoute()
  /**
   * 用于执行回退导航的路由实例。
   */
  const router = useRouter()

  /**
   * 从当前路由参数中解析出的插件标识。
   */
  const selectedPluginId = computed(() => {
    const pluginId = route.params.pluginId
    return typeof pluginId === 'string' ? pluginId : ''
  })

  /**
   * 当前是否具备返回应用开发页的条件。
   */
  const canReturnToDevelopment = computed(() => Boolean(selectedPluginId.value))

  /**
   * 保留当前插件标识并返回应用开发页。
   */
  async function handleReturnToDevelopment(): Promise<void> {
    if (!selectedPluginId.value) {
      return
    }

    logInfo('HomeTabPlaceholder', '切换导航', `返回应用开发: ${selectedPluginId.value}`)
    await router.push({
      name: HOME_ROUTE_NAMES.development,
      params: {
        pluginId: selectedPluginId.value
      }
    })
  }

  return {
    canReturnToDevelopment,
    handleReturnToDevelopment
  }
}
