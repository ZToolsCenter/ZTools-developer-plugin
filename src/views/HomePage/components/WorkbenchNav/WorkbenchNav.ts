import { HOME_ROUTE_NAMES, type HomeTab } from '@/views/HomePage/HomePage'

/**
 * 工作台标签导航使用的属性。
 */
export interface WorkbenchNavProps {
  /** 当前选中的插件路由标识。 */
  pluginId?: string
  /** 当前激活的路由标签。 */
  activeTab: HomeTab
}

/**
 * 工作台顶部导航项定义。
 */
export interface WorkbenchNavItem {
  /** 标签对应的路由键。 */
  tab: HomeTab
  /** 页面展示文案。 */
  label: string
  /** 导航图标对应的 UnoCSS class。 */
  iconClass: string
}

/**
 * 工作台顶部导航项顺序。
 */
export const workbenchNavItems: WorkbenchNavItem[] = [
  {
    tab: 'development',
    label: '应用开发',
    iconClass: 'i-z-development'
  },
  // {
  //   tab: 'history',
  //   label: '发布历史',
  //   iconClass: 'i-z-history'
  // },
  // {
  //   tab: 'feedback',
  //   label: '用户留言',
  //   iconClass: 'i-z-feedback'
  // },
  // {
  //   tab: 'services',
  //   label: '增值服务',
  //   iconClass: 'i-z-services'
  // },
  // {
  //   tab: 'team',
  //   label: '团队协作',
  //   iconClass: 'i-z-team'
  // }
]

/**
 * 根据标签键解析对应的路由名称。
 */
export function resolveRouteName(tab: HomeTab): string {
  return HOME_ROUTE_NAMES[tab]
}
