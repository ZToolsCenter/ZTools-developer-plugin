import { createHostAccess, type DevProjectLocalStatus, type HostDevProject } from '@/utils/host'
import { logError, logInfo } from '@/utils/logger'
import type { HomePlugin } from '@/views/HomePage/HomePage'

/**
 * 将宿主插件模型转换为 Home 页面使用的数据结构。
 */
const normalizeDevelopmentPlugins = (
  plugins: HostDevProject[],
  runningPluginPaths: string[]
): HomePlugin[] => {
  return plugins
    .map((plugin) => ({
      id: plugin.name,
      name: plugin.name,
      title: plugin.title || plugin.name,
      version: plugin.version,
      description: plugin.description || '',
      author: plugin.author || '',
      homepage: plugin.homepage || '',
      logo: plugin.logo || '',
      path: plugin.path,
      configPath: plugin.configPath,
      localStatus: plugin.localStatus,
      lastValidatedAt: plugin.lastValidatedAt || null,
      lastError: plugin.lastError || null,
      isRunning: Boolean(plugin.isRunning || (plugin.path && runningPluginPaths.includes(plugin.path))),
      isDevModeInstalled: Boolean(plugin.isDevModeInstalled),
      sortOrder: plugin.sortOrder
    }))
}

/**
 * 生成提交给宿主的完整开发项目顺序载荷。
 */
export function buildDevProjectsOrderPayload(plugins: HomePlugin[]): string[] {
  return plugins.map((plugin) => plugin.id)
}

/**
 * 将指定插件移动到当前列表顶部。
 */
export function movePluginToTop(plugins: HomePlugin[], pluginId: string): HomePlugin[] {
  const targetPlugin = plugins.find((plugin) => plugin.id === pluginId)
  if (!targetPlugin) {
    return [...plugins]
  }

  return [targetPlugin, ...plugins.filter((plugin) => plugin.id !== pluginId)]
}

/**
 * 根据目标 id 顺序重建完整插件列表，未命中的项保持原相对顺序并追加到末尾。
 */
export function reorderPluginsByIds(plugins: HomePlugin[], orderedIds: string[]): HomePlugin[] {
  const pluginMap = new Map(plugins.map((plugin) => [plugin.id, plugin]))
  const reorderedPlugins = orderedIds
    .map((pluginId) => pluginMap.get(pluginId))
    .filter((plugin): plugin is HomePlugin => Boolean(plugin))
  const orderedSet = new Set(reorderedPlugins.map((plugin) => plugin.id))

  return [
    ...reorderedPlugins,
    ...plugins.filter((plugin) => !orderedSet.has(plugin.id))
  ]
}

/**
 * 侧边栏展示用的开发项目状态文案映射。
 */
const DEV_PROJECT_STATUS_LABELS: Record<DevProjectLocalStatus, string> = {
  ready: '配置正常',
  config_missing: '配置缺失',
  invalid_config: '配置无效',
  unbound: '等待绑定'
}

/**
 * 开发中插件侧边栏使用的属性。
 */
export interface DevPluginSidebarProps {
  /** 当前选中的插件标识。 */
  selectedPluginId?: string
}

/**
 * 开发中插件侧边栏对外暴露的事件。
 */
export interface DevPluginSidebarEmits {
  /** 加载完成后抛出标准化的开发中插件列表。 */
  (e: 'loaded', plugins: HomePlugin[]): void
  /** 抛出当前点击的插件标识。 */
  (e: 'select', pluginId: string): void
}

/**
 * 侧边栏向父层暴露的实例方法。
 */
export interface DevPluginSidebarExpose {
  /** 主动刷新当前开发项目列表。 */
  refreshPlugins: () => Promise<void>
}

/**
 * 将最新顺序持久化到宿主主记录。
 */
export async function updateDevelopmentPluginsOrder(pluginIds: string[]): Promise<void> {
  const hostInternal = window.ztools?.internal

  if (!hostInternal?.updateDevProjectsOrder) {
    throw new Error('当前宿主不支持更新开发项目顺序')
  }

  const result = await hostInternal.updateDevProjectsOrder(pluginIds)
  if (!result?.success) {
    throw new Error(result?.error || '保存开发项目顺序失败')
  }
}

/**
 * 加载并标准化侧边栏所需的开发中插件数据。
 */
export async function loadDevelopmentPlugins(): Promise<HomePlugin[]> {
  const host = createHostAccess()
  logInfo('DevPluginSidebar', '加载列表', '开始从宿主读取开发项目列表')
  const [plugins, runningPluginPaths] = await Promise.all([
    host.getDevProjects(),
    host.getRunningPlugins()
  ])
  const normalizedPlugins = normalizeDevelopmentPlugins(plugins, runningPluginPaths)

  logInfo('DevPluginSidebar', '加载列表', `开发中插件数量: ${normalizedPlugins.length}`)
  return normalizedPlugins
}

/**
 * 生成侧边栏项目的简短状态文案。
 */
export function resolveSidebarPluginMeta(plugin: HomePlugin): string {
  const parts = [DEV_PROJECT_STATUS_LABELS[plugin.localStatus]]

  if (plugin.isRunning) {
    parts.push('运行中')
  }

  if (plugin.isDevModeInstalled) {
    parts.push('DEV 已安装')
  }

  return parts.join(' · ')
}

/**
 * 调用宿主能力导入新的开发中插件。
 */
export async function importDevelopmentPlugin(): Promise<void> {
  const hostInternal = window.ztools?.internal

  if (!hostInternal?.importDevPlugin) {
    throw new Error('当前宿主不支持导入开发项目')
  }

  logInfo('DevPluginSidebar', '新建项目', '开始导入开发项目')
  const result = await hostInternal.importDevPlugin()

  if (!result?.success) {
    throw new Error(result?.error || '导入开发项目失败')
  }

  logInfo(
    'DevPluginSidebar',
    '新建项目',
    `导入完成: ${result.pluginName || 'unknown project'}`
  )
}

/**
 * 在导入完成后定位新增的插件标识。
 */
export function resolveImportedPluginId(
  previousPlugins: HomePlugin[],
  nextPlugins: HomePlugin[]
): string {
  const previousPluginIds = new Set(previousPlugins.map((plugin) => plugin.id))
  const importedPlugin = nextPlugins.find((plugin) => !previousPluginIds.has(plugin.id))

  return importedPlugin?.id ?? (previousPlugins.length === 0 ? nextPlugins[0]?.id || '' : '')
}

/**
 * 以统一日志格式记录侧边栏加载失败。
 */
export function logSidebarError(message: string): void {
  logError('DevPluginSidebar', '异常处理', message)
}
