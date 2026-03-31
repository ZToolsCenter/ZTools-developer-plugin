<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { logError, logInfo } from '@/utils/logger'
import {
  importDevelopmentPlugin,
  loadDevelopmentPlugins,
  logSidebarError,
  resolveSidebarPluginMeta,
  resolveImportedPluginId,
  type DevPluginSidebarEmits,
  type DevPluginSidebarExpose,
  type DevPluginSidebarProps
} from './DevPluginSidebar'
import type { HomePlugin } from '@/views/HomePage/HomePage'
import { showErrorMessage, toDisplayMessage } from '@/utils/message'

const props = defineProps<DevPluginSidebarProps>()
const emit = defineEmits<DevPluginSidebarEmits>()

// 侧边栏中展示的开发中插件列表。
const plugins = ref<HomePlugin[]>([])
// 插件列表加载状态。
const isLoadingList = ref(true)
// 导入开发项目时的按钮 loading 状态。
const isCreatingProject = ref(false)

// 加载开发中插件列表，并同步给父级布局。
const handleLoadPlugins = async (): Promise<void> => {
  isLoadingList.value = true

  try {
    const nextPlugins = await loadDevelopmentPlugins()
    plugins.value = nextPlugins
    emit('loaded', nextPlugins)
  } catch (error) {
    plugins.value = []
    emit('loaded', [])
    const message = toDisplayMessage(error, '加载开发项目失败')
    logSidebarError(message)
    showErrorMessage(error, '加载开发项目失败')
  } finally {
    isLoadingList.value = false
  }
}

// 供父层显式触发的刷新能力。
const refreshPlugins = async (): Promise<void> => {
  await handleLoadPlugins()
}

// 抛出当前点击的插件标识。
const handleSelectPlugin = (pluginId: string): void => {
  emit('select', pluginId)
}

// 调用宿主导入开发项目，并尝试选中新导入的插件。
const handleCreateProject = async (): Promise<void> => {
  isCreatingProject.value = true
  const previousPlugins = [...plugins.value]
  logInfo('DevPluginSidebar', '新建项目', '开始导入开发项目')

  try {
    await importDevelopmentPlugin()
    await refreshPlugins()
    const importedPluginId = resolveImportedPluginId(previousPlugins, plugins.value)

    if (importedPluginId) {
      logInfo('DevPluginSidebar', '新建项目', `导入完成并定位到插件: ${importedPluginId}`)
      emit('select', importedPluginId)
    }
  } catch (error) {
    const message = toDisplayMessage(error, '导入开发项目失败')
    logError('DevPluginSidebar', '新建项目', message)
    showErrorMessage(error, '导入开发项目失败')
  } finally {
    isCreatingProject.value = false
  }
}

onMounted(() => {
  void refreshPlugins()
})

defineExpose<DevPluginSidebarExpose>({
  refreshPlugins
})
</script>

<template>
  <aside class="sidebar">
    <el-scrollbar class="sidebar__list-scrollbar">
      <div class="sidebar__list">
        <button
          v-for="plugin in plugins"
          :key="plugin.id"
          type="button"
          class="sidebar__item"
          :class="{ 'sidebar__item--active': plugin.id === props.selectedPluginId }"
          @click="handleSelectPlugin(plugin.id)"
        >
          <span class="sidebar__item-icon i-z-folder" aria-hidden="true" />
          <span class="sidebar__item-content">
            <span class="sidebar__item-text">{{ plugin.title }}</span>
            <span class="sidebar__item-meta">{{ resolveSidebarPluginMeta(plugin) }}</span>
          </span>
        </button>
      </div>
    </el-scrollbar>

    <button
      type="button"
      class="sidebar__create"
      :disabled="isCreatingProject"
      @click="handleCreateProject"
    >
      <span class="sidebar__create-icon i-z-plus" aria-hidden="true" />
      <span>{{ isCreatingProject ? '导入中...' : '新建项目' }}</span>
    </button>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  width: clamp(208px, 28vw, 250px);
  min-width: 0;
  min-height: 0;
  flex-shrink: 0;
  flex-direction: column;
  gap: 8px;
  //background: var(--u-color-bg-3);
  padding: 8px 0 14px;
  border-right: 1px solid rgba(var(--u-gray-5), 0.4);
}

.sidebar__list-scrollbar {
  flex: 1;
  min-height: 0;
}

.sidebar__list-scrollbar :deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}

.sidebar__list {
  display: grid;
  flex: 1;
  min-height: 0;
  gap: 6px;
  padding: 8px;
}

.sidebar__item {
  display: flex;
  min-width: 0;
  min-height: 42px;
  align-items: center;
  gap: 6px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--u-color-text-1);
  cursor: pointer;
  padding: 10px;
  text-align: left;
  transition: background-color 250ms linear;
}

.sidebar__item:hover {
  background-color: var(--u-color-fill-2);
}

.sidebar__item--active {
  background-color: var(--u-color-fill-2);
  color: var(--u-color-text-1);
}

.sidebar__item-icon {
  flex-shrink: 0;
  color: var(--u-color-text-3);
  font-size: 16px;
}

.sidebar__item-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.sidebar__item-content {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 2px;
}

.sidebar__item-meta {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--u-color-text-3);
  font-size: 11px;
}

.sidebar__create {
  display: inline-flex;
  min-height: 35px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 10px;
  border: none;
  border-radius: 8px;
  background: var(--u-color-fill-2);
  color: var(--u-color-text-1);
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  padding: 8px 16px;
}

.sidebar__create:hover:enabled {
  background: var(--u-color-fill-3);
}

.sidebar__create:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.sidebar__create-icon {
  font-size: 18px;
}
</style>
