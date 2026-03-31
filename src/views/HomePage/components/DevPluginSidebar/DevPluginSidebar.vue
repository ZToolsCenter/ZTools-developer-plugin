<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { logError, logInfo } from '@/utils/logger'
import {
  buildDevProjectsOrderPayload,
  importDevelopmentPlugin,
  loadDevelopmentPlugins,
  logSidebarError,
  movePluginToTop,
  resolveSidebarPluginMeta,
  resolveImportedPluginId,
  updateDevelopmentPluginsOrder,
  type DevPluginSidebarEmits,
  type DevPluginSidebarExpose,
  type DevPluginSidebarProps
} from './DevPluginSidebar'
import type { HomePlugin } from '@/views/HomePage/HomePage'
import { showErrorMessage, toDisplayMessage } from '@/utils/message'
import { DevPluginContextMenu } from '@/views/HomePage/components/DevPluginContextMenu'
import {useZtoolsSubInput} from "@/composables";
import PinyinMatch from 'pinyin-match';

const props = defineProps<DevPluginSidebarProps>()
const emit = defineEmits<DevPluginSidebarEmits>()

// 侧边栏中展示的开发中插件列表。
const allPlugins = ref<HomePlugin[]>([])
// 插件列表加载状态。
const isLoadingList = ref(true)
// 导入开发项目时的按钮 loading 状态。
const isCreatingProject = ref(false)
// 当前是否正在保存顺序，避免并发覆盖。
const isPersistingOrder = ref(false)
// 未来检索接入后的搜索词真源；当前阶段默认空值。
const { value: searchKeyword } = useZtoolsSubInput('', '搜索项目');

// 右键菜单显隐状态。
const isContextMenuVisible = ref(false)
// 当前右键命中的插件。
const contextMenuPlugin = ref<HomePlugin | null>(null)
// 右键菜单打开坐标。
const contextMenuPosition = ref({
  x: 0,
  y: 0
})

// 只要存在检索词，就视为检索态并禁用拖拽。
const isSearchMode = computed(() => searchKeyword.value.trim().length > 0)
// 当前侧边栏实际展示列表；当前阶段等价于完整列表。
const visiblePlugins = computed(() => allPlugins.value
  .filter(item => {
    if (item.name.toString().toLowerCase().includes(searchKeyword.value.toLowerCase())) {
      return true
    }
    return PinyinMatch.match(item.title, searchKeyword.value) !== false
  }))

// 加载开发中插件列表，并同步给父级布局。
const handleLoadPlugins = async (): Promise<void> => {
  isLoadingList.value = true

  try {
    const nextPlugins = await loadDevelopmentPlugins()
    allPlugins.value = nextPlugins
    emit('loaded', nextPlugins)
  } catch (error) {
    allPlugins.value = []
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
  const previousPlugins = [...allPlugins.value]
  logInfo('DevPluginSidebar', '新建项目', '开始导入开发项目')

  try {
    await importDevelopmentPlugin()
    await refreshPlugins()
    const importedPluginId = resolveImportedPluginId(previousPlugins, allPlugins.value)

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

// 关闭右键菜单并清理当前目标插件。
const closeContextMenu = (): void => {
  isContextMenuVisible.value = false
  contextMenuPlugin.value = null
}

// 在当前鼠标坐标打开右键菜单。
const handlePluginContextMenu = (event: MouseEvent, plugin: HomePlugin): void => {
  contextMenuPosition.value = {
    x: event.clientX,
    y: event.clientY
  }
  contextMenuPlugin.value = plugin
  isContextMenuVisible.value = true
}

// 将最新完整顺序写入宿主；失败时回滚到宿主真源。
const persistPluginOrder = async (nextPlugins: HomePlugin[]): Promise<void> => {
  if (isPersistingOrder.value) {
    return
  }

  isPersistingOrder.value = true

  try {
    await updateDevelopmentPluginsOrder(buildDevProjectsOrderPayload(nextPlugins))
    emit('loaded', nextPlugins)
  } catch (error) {
    const message = toDisplayMessage(error, '保存开发项目顺序失败')
    logError('DevPluginSidebar', '保存顺序', message)
    showErrorMessage(error, '保存开发项目顺序失败')
    await refreshPlugins()
  } finally {
    isPersistingOrder.value = false
  }
}

// 拖拽完成后同步写入宿主顺序。
const handleDragEnd = async (): Promise<void> => {
  await persistPluginOrder(allPlugins.value)
}

// 右键菜单中的“置顶”动作。
const handlePinToTop = async (pluginId: string): Promise<void> => {
  closeContextMenu()
  const previousPlugins = [...allPlugins.value]
  const nextPlugins = movePluginToTop(previousPlugins, pluginId)
  allPlugins.value = nextPlugins
  await persistPluginOrder(nextPlugins)
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
      <VueDraggable
        v-if="!isSearchMode"
        v-model="allPlugins"
        item-key="id"
        class="sidebar__list"
        @end="handleDragEnd"
      >
        <button
          v-for="plugin in allPlugins"
          :key="plugin.id"
          type="button"
          class="sidebar__item"
          :class="{ 'sidebar__item--active': plugin.id === props.selectedPluginId }"
          @click="handleSelectPlugin(plugin.id)"
          @contextmenu.prevent="handlePluginContextMenu($event, plugin)"
        >
          <span class="sidebar__item-icon i-z-folder" aria-hidden="true" />
          <span class="sidebar__item-content">
            <span class="sidebar__item-text">{{ plugin.title }}</span>
            <span class="sidebar__item-meta">{{ resolveSidebarPluginMeta(plugin) }}</span>
          </span>
        </button>
      </VueDraggable>

      <div v-else class="sidebar__list">
        <button
          v-for="plugin in visiblePlugins"
          :key="plugin.id"
          type="button"
          class="sidebar__item"
          :class="{ 'sidebar__item--active': plugin.id === props.selectedPluginId }"
          @click="handleSelectPlugin(plugin.id)"
          @contextmenu.prevent="handlePluginContextMenu($event, plugin)"
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

    <DevPluginContextMenu
      :visible="isContextMenuVisible"
      :plugin="contextMenuPlugin"
      :position="contextMenuPosition"
      @pin-to-top="handlePinToTop"
      @close="closeContextMenu"
    />
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
