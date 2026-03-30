import type { DevProjectLocalStatus } from '@/utils/host'

/**
 * Home 工作台支持的路由标签键。
 */
export type HomeTab = 'development' | 'history' | 'feedback' | 'services' | 'team'

/**
 * Home 工作台内部使用的开发中插件模型。
 */
export interface HomePlugin {
  /** 插件在路由中的稳定标识。 */
  id: string
  /** 宿主返回的原始插件名称。 */
  name: string
  /** 页面展示用的插件标题。 */
  title: string
  /** 插件版本号。 */
  version: string
  /** 插件描述。 */
  description?: string
  /** 插件作者。 */
  author?: string
  /** 插件主页地址。 */
  homepage?: string
  /** 插件图标地址。 */
  logo?: string
  /** 插件根目录路径。 */
  path: string | null
  /** 当前设备绑定的配置路径。 */
  configPath: string | null
  /** 当前设备上的本地状态。 */
  localStatus: DevProjectLocalStatus
  /** 最近一次校验时间。 */
  lastValidatedAt: string | null
  /** 最近一次校验错误。 */
  lastError: string | null
  /** 插件是否处于运行状态。 */
  isRunning: boolean
  /** 插件是否已安装开发模式。 */
  isDevModeInstalled: boolean
}

/**
 * Home 工作台标签与路由名称的映射关系。
 */
export const HOME_ROUTE_NAMES: Record<HomeTab, string> = {
  development: 'home-development',
  history: 'home-history',
  feedback: 'home-feedback',
  services: 'home-services',
  team: 'home-team'
}

/**
 * 根据当前路由名称解析对应的标签键。
 */
export function resolveHomeTab(routeName: unknown): HomeTab {
  switch (routeName) {
    case 'home-history':
      return 'history'
    case 'home-feedback':
      return 'feedback'
    case 'home-services':
      return 'services'
    case 'home-team':
      return 'team'
    case 'home-development':
    default:
      return 'development'
  }
}
