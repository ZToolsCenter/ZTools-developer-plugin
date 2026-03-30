/**
 * 按统一格式拼接模块、功能与日志内容。
 */
function formatLogMessage(moduleName: string, feature: string, message: string): string {
  return `【${moduleName}】【${feature}】${message}`
}

/**
 * 输出符合规范的信息日志。
 */
export function logInfo(moduleName: string, feature: string, message: string): void {
  console.info(formatLogMessage(moduleName, feature, message))
}

/**
 * 输出符合规范的警告日志。
 */
export function logWarn(moduleName: string, feature: string, message: string): void {
  console.warn(formatLogMessage(moduleName, feature, message))
}

/**
 * 输出符合规范的错误日志。
 */
export function logError(moduleName: string, feature: string, message: string): void {
  console.error(formatLogMessage(moduleName, feature, message))
}
