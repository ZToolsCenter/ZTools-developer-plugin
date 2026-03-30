import type { PropType } from 'vue'

/**
 * 分区卡片包装组件使用的属性。
 */
export interface CommonSectionCardProps {
  /**
   * 显示在卡片顶部的分区标题。
   */
  headline?: string
  /** 显示在标题下方的补充说明。 */
  subheadline?: string
}
