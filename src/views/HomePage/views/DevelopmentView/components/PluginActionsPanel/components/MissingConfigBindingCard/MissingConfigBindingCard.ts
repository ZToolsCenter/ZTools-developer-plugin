import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { logError, logWarn } from '@/utils/logger'

export interface MissingConfigBindingCardProps {
  /** 当前需要重新绑定配置的插件标识。 */
  pluginName: string
}

export interface MissingConfigBindingCardEmits {
  /** 重新绑定成功后请求父层刷新。 */
  (e: 'updated'): void
}

/**
 * 判断拖入文件是否为 plugin.json。
 */
const isPluginJsonFile = (fileName: string): boolean => fileName === 'plugin.json'

/**
 * 提供缺失配置卡片的交互逻辑。
 */
export function useMissingConfigBindingCard(
  props: MissingConfigBindingCardProps,
  emit: MissingConfigBindingCardEmits
) {
  /**
   * 当前是否处于拖拽悬停态。
   */
  const isDragging = ref(false)
  /**
   * 当前是否正在提交重新绑定请求。
   */
  const isSubmitting = ref(false)

  /**
   * 提交 plugin.json 路径到宿主执行重新绑定。
   */
  const submitConfigPath = async (configPath?: string): Promise<void> => {
    const hostInternal = window.ztools?.internal

    if (!hostInternal?.selectDevProjectConfig) {
      logWarn('MissingConfigBindingCard', '重新绑定配置', '宿主未提供 selectDevProjectConfig 能力')
      ElMessage.error('宿主服务不可用')
      return
    }

    isSubmitting.value = true

    try {
      const result = await hostInternal.selectDevProjectConfig(props.pluginName, configPath)

      if (!result?.success) {
        if (result?.error && result.error !== '未选择文件') {
          throw new Error(result.error)
        }

        return
      }

      emit('updated')
    } catch (error) {
      logError(
        'MissingConfigBindingCard',
        '重新绑定配置',
        `重新绑定失败: ${error instanceof Error ? error.message : 'unknown error'}`
      )
      ElMessage.error(error instanceof Error ? error.message : '选择配置文件失败')
    } finally {
      isDragging.value = false
      isSubmitting.value = false
    }
  }

  /**
   * 处理拖入 plugin.json 后的立即绑定。
   */
  const handleDrop = async (event: DragEvent): Promise<void> => {
    event.preventDefault()

    const files = event.dataTransfer?.files
    const file = files?.[0]

    if (!file || files.length !== 1 || !isPluginJsonFile(file.name)) {
      ElMessage.error('请选择 plugin.json 文件')
      isDragging.value = false
      return
    }

    const configPath = window.ztools?.getPathForFile?.(file)

    if (!configPath) {
      ElMessage.error('请选择 plugin.json 文件')
      isDragging.value = false
      return
    }

    await submitConfigPath(configPath)
  }

  return {
    isDragging,
    isSubmitting,
    handleDrop,
    submitConfigPath
  }
}
