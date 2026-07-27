/// <reference types="vite/client" />
/// <reference types="@ztools-center/ztools-api-types" />

import type {
  HostInternalAccess,
  ScaffoldDevProjectParams,
  ScaffoldDevProjectResult
} from './src/utils/host'

declare global {
  interface ZToolsApi {
    /** 将拖入文件转换为本地路径。 */
    getPathForFile?: (file: File) => string
    /** 开发者工作台使用的内部桥接对象。 */
    internal?: HostInternalAccess
  }

  interface Window {
    /** 桌面容器注入的宿主能力；测试环境允许只挂载当前场景需要的子集。 */
    ztools?: Partial<ZToolsApi>
    /** 开发者插件 preload 注入的 ASAR 兼容脚手架能力。 */
    ztoolsDeveloperPlugin?: {
      scaffoldDevProject(params: ScaffoldDevProjectParams): Promise<ScaffoldDevProjectResult>
    }
  }
}

export {}
