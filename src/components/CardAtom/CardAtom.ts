import type { PropType } from 'vue'

/**
 * 卡片原子项图标色调。
 */
export type CardAtomIconTone = 'default' | 'muted' | 'primary' | 'success'

/**
 * 卡片原子项使用的属性。
 */
export interface CardAtomProps {
  /**
   * 原子项主标题，优先级高于同名插槽。
   */
  title?: string
  /**
   * 原子项描述文案，优先级高于同名插槽。
   */
  description?: string
  /**
   * 图标对应的 UnoCSS class，优先级高于 `icon` 插槽。
   */
  iconClass?: string
  /**
   * 图标色调。
   */
  iconTone?: CardAtomIconTone
  /**
   * 右侧状态文案，优先级高于 `status` 插槽。
   */
  status?: string
  /**
   * 当前原子项是否可点击。
   */
  clickable?: boolean
  /**
   * 当前原子项是否禁用。
   */
  disabled?: boolean
}
