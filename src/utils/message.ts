import { ElMessage } from 'element-plus'

/**
 * 将未知错误归一化为可直接展示给用户的文案。
 */
export function toDisplayMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string' && error.trim()) {
    return error.trim()
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim()
  }

  return fallback
}

/**
 * 展示统一的错误提示。
 */
export function showErrorMessage(error: unknown, fallback: string): void {
  ElMessage.error(toDisplayMessage(error, fallback))
}
