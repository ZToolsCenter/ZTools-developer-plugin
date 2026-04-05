export type ProjectTemplate = 'vue-vite' | 'react-vite'

/**
 * 项目元数据表单弹窗的属性定义。
 */
export interface ProjectMetaDialogProps {
  /** 弹窗是否可见（v-model） */
  visible: boolean
  /** 弹窗标题 */
  title?: string
  /** 确认按钮文案 */
  confirmText?: string
  /** 是否处于提交状态 */
  loading?: boolean
  /** 应用ID（name）字段是否只读 */
  nameReadonly?: boolean
  /** 是否显示模板和路径选择（新建模式） */
  showScaffold?: boolean
  /** 表单初始值 */
  form: {
    name: string
    title: string
    description: string
    platform: string[]
    author: string
  }
}

export interface ProjectMetaDialogConfirmPayload {
  name: string
  title: string
  description: string
  platform: string[]
  author: string
  template?: ProjectTemplate
  projectPath?: string
}

export interface ProjectMetaDialogEmits {
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', form: ProjectMetaDialogConfirmPayload): void
}
