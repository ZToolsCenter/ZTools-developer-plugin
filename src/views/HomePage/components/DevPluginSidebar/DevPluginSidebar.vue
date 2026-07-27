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
import { ProjectMetaDialog } from '@/components'
import { ConfettiOverlay } from '@/components'
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
// 登记项目对话框是否可见。
const isRegisterDialogVisible = ref(false)
// 登记项目时的提交状态。
const isRegistering = ref(false)
// 登记项目表单数据。
const registerForm = ref({ name: '', title: '', description: '', platform: ['darwin', 'win32', 'linux'], author: '' })
// 创建完成引导弹窗是否可见。
const isGuideDialogVisible = ref(false)
// 创建完成的项目路径。
const scaffoldedProjectPath = ref('')

// 在系统资源管理器中打开已创建的项目目录。
const openScaffoldedProject = (): void => {
  window.ztools?.shellOpenPath(scaffoldedProjectPath.value)
}

// 是否显示礼花效果。
const showConfetti = ref(false)
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

// 打开登记项目对话框。
const handleOpenRegisterDialog = (): void => {
  registerForm.value = { name: '', title: '', description: '', platform: ['darwin', 'win32', 'linux'], author: '' }
  isRegisterDialogVisible.value = true
}

// 处理下拉菜单事件。
const handleCreateDropdownCommand = (command: string): void => {
  if (command === 'import') {
    handleCreateProject()
  }
}

/**
 * 提交模板脚手架表单，并在成功后刷新、定位新项目。
 * @param form 新项目的模板、存放位置与插件元数据
 * @returns 创建流程完成后结束的 Promise
 */
const handleRegisterProject = async (form: {
  name: string; title: string; description: string; platform: string[]; author: string;
  template?: string; projectPath?: string
}): Promise<void> => {
  if (!form.title.trim()) return
  if (!form.template || !form.projectPath) {
    showErrorMessage(undefined, '请选择模板和项目位置')
    return
  }

  isRegistering.value = true
  const previousPlugins = [...allPlugins.value]

  try {
    const hostInternal = window.ztools?.internal
    // 市场 ASAR 优先使用插件 preload 的物理模板复制能力，开发态回退到宿主实现。
    const scaffoldDevProject =
      window.ztoolsDeveloperPlugin?.scaffoldDevProject ?? hostInternal?.scaffoldDevProject
    if (!scaffoldDevProject) {
      throw new Error('当前宿主不支持模板创建')
    }
    const result = await scaffoldDevProject({
      template: form.template as 'vue-vite' | 'react-vite',
      projectPath: form.projectPath,
      name: form.name.trim(),
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      platform: form.platform.length > 0 ? [...form.platform] : undefined,
      author: form.author.trim() || undefined
    })
    if (!result?.success) {
      throw new Error(result?.error || '创建项目失败')
    }

    isRegisterDialogVisible.value = false

    // 记录项目路径，用于引导弹窗展示。
    scaffoldedProjectPath.value = `${form.projectPath}/${form.name}`
    isGuideDialogVisible.value = true
    showConfetti.value = true

    await refreshPlugins()
    const importedPluginId = resolveImportedPluginId(previousPlugins, allPlugins.value)
    if (importedPluginId) {
      emit('select', importedPluginId)
    } else if (result.pluginName) {
      emit('select', result.pluginName)
    }
  } catch (error) {
    logError('DevPluginSidebar', '登记项目', toDisplayMessage(error, '登记开发项目失败'))
    showErrorMessage(error, '登记开发项目失败')
  } finally {
    isRegistering.value = false
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
          <span v-if="plugin.isDevModeInstalled" class="sidebar__item-dot" />
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
          <span v-if="plugin.isDevModeInstalled" class="sidebar__item-dot" />
        </button>
      </div>
    </el-scrollbar>

    <el-dropdown
      class="sidebar__create-dropdown"
      split-button
      :disabled="isCreatingProject"
      @click="handleOpenRegisterDialog"
      @command="handleCreateDropdownCommand"
    >
      <span class="sidebar__create-label">
        <span class="sidebar__create-icon i-z-plus" aria-hidden="true" />
        <span>{{ isCreatingProject ? '导入中...' : '新建项目' }}</span>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="import">导入 plugin.json</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <DevPluginContextMenu
      :visible="isContextMenuVisible"
      :plugin="contextMenuPlugin"
      :position="contextMenuPosition"
      @pin-to-top="handlePinToTop"
      @close="closeContextMenu"
    />

    <ProjectMetaDialog
      :visible="isRegisterDialogVisible"
      title="新建项目"
      confirm-text="创建"
      :loading="isRegistering"
      :form="registerForm"
      show-scaffold
      @update:visible="isRegisterDialogVisible = $event"
      @confirm="handleRegisterProject"
    />

    <el-dialog
      :model-value="isGuideDialogVisible"
      title="项目创建成功"
      width="480px"
      :close-on-click-modal="false"
      @update:model-value="isGuideDialogVisible = $event"
    >
      <div class="guide">
        <p class="guide__desc">插件项目已创建到以下位置：</p>
        <code class="guide__path guide__path--clickable" @click="openScaffoldedProject">{{ scaffoldedProjectPath }}</code>
        <div class="guide__steps">
          <div class="guide__step">
            <span class="guide__step-num">1</span>
            <div class="guide__step-body">
              <p class="guide__step-title">安装依赖</p>
              <code class="guide__step-code">npm install</code>
            </div>
          </div>
          <div class="guide__step">
            <span class="guide__step-num">2</span>
            <div class="guide__step-body">
              <p class="guide__step-title">启动开发</p>
              <code class="guide__step-code">npm run dev</code>
            </div>
          </div>
          <div class="guide__step">
            <span class="guide__step-num">3</span>
            <div class="guide__step-body">
              <p class="guide__step-title">打包前构建</p>
              <code class="guide__step-code">npm run build</code>
            </div>
          </div>
          <div class="guide__step">
            <span class="guide__step-num">4</span>
            <div class="guide__step-body">
              <p class="guide__step-title">打包插件</p>
              <p class="guide__step-hint">默认打包 <code>src-ztools</code> 插件目录</p>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="isGuideDialogVisible = false">我知道了</el-button>
      </template>
    </el-dialog>

    <ConfettiOverlay v-if="showConfetti" @done="showConfetti = false" />
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

.sidebar__item-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgb(var(--u-green-6, 82 196 26));
}

.sidebar__create-dropdown {
  margin: 0 10px;
}

.sidebar__create-dropdown :deep(.el-button) {
  width: 100%;
}

.sidebar__create-dropdown :deep(.el-button-group) {
  display: flex;
  width: 100%;
}

.sidebar__create-dropdown :deep(.el-button-group > .el-button:first-child) {
  flex: 1;
}

.sidebar__create-dropdown :deep(.el-button-group > .el-button:last-child) {
  width: auto;
  flex: none;
  padding-inline: 10px;
}

.sidebar__create-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.sidebar__create-icon {
  font-size: 18px;
}

.guide__desc {
  margin: 0 0 8px;
  color: var(--u-color-text-2);
  font-size: 13px;
}

.guide__path {
  display: block;
  margin-bottom: 16px;
  padding: 8px 12px;
  border-radius: 6px;
  background: var(--u-color-fill-2);
  color: var(--u-color-text-1);
  font-size: 12px;
  word-break: break-all;
}

.guide__path--clickable {
  cursor: pointer;
  transition: background-color 150ms;
}

.guide__path--clickable:hover {
  background: var(--u-color-fill-3);
}

.guide__steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.guide__step {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.guide__step-num {
  display: flex;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--el-color-primary);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.guide__step-body {
  flex: 1;
  min-width: 0;
  padding-top: 1px;
}

.guide__step-title {
  margin: 0 0 4px;
  color: var(--u-color-text-1);
  font-size: 13px;
  font-weight: 500;
}

.guide__step-code {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--u-color-fill-2);
  color: var(--el-color-primary);
  font-size: 12px;
}

.guide__step-hint {
  margin: 0;
  color: var(--u-color-text-2);
  font-size: 12px;
}

.guide__step-hint code {
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--u-color-fill-2);
  color: var(--el-color-primary);
  font-size: 12px;
}
</style>
