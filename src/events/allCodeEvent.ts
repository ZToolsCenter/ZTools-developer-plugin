import { addZtoolsCodeEventListener } from '@/events/codeEvent'
import {jumpFunctionPluginInstaller} from "@/views/HomePage";


/**
 * 添加开发中插件
 */
addZtoolsCodeEventListener('function.add-dev-plugin', (e) => {
  const { payload, code } = e.pluginEnterParams
  console.info(`[code-event] ${code} 成功接收事件`)
  const files = Array.isArray(payload) ? payload : []
  const installFilePaths = files
    .map((file: { path?: string }) => file.path?.trim())
    .filter((path): path is string => Boolean(path))

  if (files && files.length > 0) {
    console.log({ installFilePath: installFilePaths[0] })
    jumpFunctionPluginInstaller({ installFilePath: installFilePaths[0] })
  }
})
