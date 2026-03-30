/// <reference types="vite/client" />

import type { HostInternalAccess } from './src/utils/host'

declare global {
  interface Window {
    /** 桌面容器注入的宿主能力（含 getDevProjects 与开发模式安装/卸载能力）。 */
    ztools?: {
      /** 将拖入文件转换为本地路径。 */
      getPathForFile?: (file: File) => string
      /** 开发者工作台使用的内部桥接对象。 */
      internal?: HostInternalAccess
    }
  }
}
