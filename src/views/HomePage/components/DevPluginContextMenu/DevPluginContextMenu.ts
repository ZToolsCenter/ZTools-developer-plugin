import type { HomePlugin } from '@/views/HomePage/HomePage'

export interface DevPluginContextMenuPosition {
  x: number
  y: number
}

export interface DevPluginContextMenuProps {
  /** 当前菜单是否可见。 */
  visible: boolean
  /** 当前右键命中的插件。 */
  plugin: HomePlugin | null
  /** 右键菜单锚点坐标。 */
  position: DevPluginContextMenuPosition
}

export interface DevPluginContextMenuEmits {
  /** 点击置顶时抛出目标插件标识。 */
  (e: 'pin-to-top', pluginId: string): void
  /** 菜单关闭时通知父层。 */
  (e: 'close'): void
}

/**
 * 将鼠标坐标转换为 Dropdown 可识别的虚拟矩形。
 */
export const resolveVirtualTriggerRect = (position: DevPluginContextMenuPosition): DOMRect => {
  if (typeof DOMRect !== 'undefined' && typeof DOMRect.fromRect === 'function') {
    return DOMRect.fromRect({
      x: position.x,
      y: position.y,
      width: 0,
      height: 0
    })
  }

  return {
    x: position.x,
    y: position.y,
    width: 0,
    height: 0,
    top: position.y,
    right: position.x,
    bottom: position.y,
    left: position.x,
    toJSON: () => ({})
  } as DOMRect
}
