/**
 * 发布卡片展示的静态内容。
 */
export interface PluginPublishPanelContent {
  /** 发布卡片标题。 */
  title: string
  /** 发布卡片描述。 */
  description: string
}

/**
 * 发布卡片使用的静态展示文案。
 */
export const pluginPublishPanelContent: PluginPublishPanelContent = {
  title: '发布到 zTools 插件应用市场',
  description: '管理员审核通过后将上架插件应用市场'
}
