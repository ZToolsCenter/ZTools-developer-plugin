import type { PropType } from 'vue'

/**
 * 空状态组件使用的共享属性。
 */
export interface CommonEmptyStateProps {
  /**
   * 用于概括当前空状态场景的主标题。
   */
  title: string
  /**
   * 用于说明下一步操作的辅助文案。
   */
  description?: string
  /**
   * 是否启用描述文案下方的操作插槽。
   */
  hasActionSlot?: boolean
}
