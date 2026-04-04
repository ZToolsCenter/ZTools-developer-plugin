<script setup lang="ts">
import {CardAtom, CardGroup, TextEllipsis} from '@/components'
import MissingConfigBindingCard from './components/MissingConfigBindingCard'
import type { PluginActionsPanelEmits, PluginActionsPanelProps } from './PluginActionsPanel'
import { usePluginActionsPanel } from './PluginActionsPanel'

const props = defineProps<PluginActionsPanelProps>()
const emit = defineEmits<PluginActionsPanelEmits>()
const {
  configStatusDescription,
  configStatusMeta,
  configStatusTitle,
  devModeDescription,
  devModeStatus,
  devModeTitle,
  isDevModeDisabled,
  isDevModeInstalled,
  isOpenFolderDisabled,
  isOpeningFolder,
  isPackageDialogVisible,
  isPackageDisabled,
  isPackaging,
  isReloadDisabled,
  isReloading,
  isSelectConfigDisabled,
  packageDescription,
  packageDialogPath,
  packageDialogVersion,
  reloadDescription,
  selectConfigDescription,
  selectConfigStatus,
  showMissingConfigBindingCard,
  showSelectConfig,
  handleOpenFolder,
  handleOpenPackageDialog,
  handlePackagePlugin,
  handleReload,
  handleSelectConfig,
  handleSelectPackagePath,
  handleToggleDevMode
} = usePluginActionsPanel(props, emit)
</script>

<template>
  <div class="actions-panel">
    <CardGroup>
      <CardAtom
        :description="configStatusDescription"
        :status="configStatusMeta"
        icon-class="i-z-services"
        icon-tone="muted"
      >
        <template #title>
          <div class="actions-panel__status-title">
            <span>项目状态</span>
            <span class="actions-panel__status-pill">{{ configStatusTitle }}</span>
          </div>
        </template>
      </CardAtom>
    </CardGroup>

    <CardGroup>
      <MissingConfigBindingCard
        v-if="showMissingConfigBindingCard"
        :plugin-name="plugin!.name"
        @updated="emit('updated')"
      />
      <CardAtom
        v-else
        title="工程目录"
        icon-class="i-z-folder-open"
        icon-tone="muted"
        :status="isOpeningFolder ? '打开中…' : ''"
        :clickable="true"
        :disabled="isOpenFolderDisabled"
        @click="handleOpenFolder"
      >
        <template #description>
          <div class="w-full" style="font-size: 12px">
            <TextEllipsis
              :text="plugin?.configPath || '当前设备没有可用的工程目录绑定'"
              :lines="1"/>
          </div>
        </template>
      </CardAtom>
      <CardAtom
        data-testid="dev-mode-toggle"
        :title="devModeTitle"
        :description="devModeDescription"
        :status="devModeStatus"
        :clickable="true"
        :disabled="isDevModeDisabled"
        :class="[
          'actions-panel__card',
          isDevModeInstalled ? 'actions-panel__card--uninstall' : 'actions-panel__card--install'
        ]"
        @click="handleToggleDevMode"
      >
        <template #icon>
          <span
            class="actions-panel__icon"
            :class="
              isDevModeInstalled
                ? 'actions-panel__icon--uninstall'
                : 'actions-panel__icon--install'
            "
            aria-hidden="true"
          >
            <span
              class="actions-panel__icon-glyph"
              :class="
                isDevModeInstalled
                  ? 'actions-panel__icon-glyph--minus'
                  : 'actions-panel__icon-glyph--plus'
              "
            />
          </span>
        </template>
      </CardAtom>
      <CardAtom
        title="重载插件"
        :description="reloadDescription"
        icon-class="i-z-redo"
        icon-tone="success"
        :status="isReloading ? '重载中…' : ''"
        :clickable="true"
        :disabled="isReloadDisabled"
        @click="handleReload"
      />
      <CardAtom
        v-if="showSelectConfig"
        title="选择配置文件"
        :description="selectConfigDescription"
        icon-class="i-z-folder"
        icon-tone="primary"
        :status="selectConfigStatus"
        :clickable="true"
        :disabled="isSelectConfigDisabled"
        @click="handleSelectConfig"
      />
      <CardAtom
        title="打包插件"
        :description="packageDescription"
        icon-class="i-z-package"
        icon-tone="primary"
        :status="isPackaging ? '打包中…' : ''"
        :clickable="true"
        :disabled="isPackageDisabled"
        @click="handleOpenPackageDialog"
      />
    </CardGroup>
  </div>

  <!-- 打包配置 dialog -->
  <el-dialog
    v-model="isPackageDialogVisible"
    title="打包插件"
    width="480px"
    :close-on-click-modal="false"
    :close-on-press-escape="!isPackaging"
  >
    <el-form label-position="top" size="default" class="package-dialog__form">
      <el-form-item label="打包目录">
        <div class="package-dialog__path-row">
          <el-input
            :model-value="packageDialogPath"
            readonly
            placeholder="默认为项目根目录"
          />
          <el-button @click="handleSelectPackagePath">选择</el-button>
        </div>
      </el-form-item>
      <el-form-item label="版本号（可选）">
        <el-input
          v-model="packageDialogVersion"
          placeholder="留空则沿用 plugin.json 中的版本号"
          clearable
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="isPackaging" @click="isPackageDialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="isPackaging" @click="handlePackagePlugin">开始打包</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.actions-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
  gap: 8px;
}

.actions-panel__status-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.actions-panel__status-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: var(--u-color-fill-2);
  color: var(--u-color-text-2);
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
}

.actions-panel :deep(.actions-panel__card--install) {
  border-color: color-mix(in srgb, var(--u-color-success-6) 36%, var(--u-color-border-1));
}

.actions-panel :deep(.actions-panel__card--install .card-atom__title) {
  color: var(--u-color-success-7);
}

.actions-panel :deep(.actions-panel__card--uninstall) {
  border-color: color-mix(in srgb, var(--u-color-danger-6) 32%, var(--u-color-border-1));
}

.actions-panel :deep(.actions-panel__card--uninstall .card-atom__title) {
  color: var(--u-color-danger-7);
}

.actions-panel__icon {
  position: relative;
  display: inline-flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
}

.actions-panel__icon--install {
  background: var(--u-color-success-6);
}

.actions-panel__icon--uninstall {
  background: var(--u-color-danger-6);
}

.actions-panel__icon-glyph {
  position: relative;
  display: block;
  width: 14px;
  height: 14px;
}

.actions-panel__icon-glyph::before,
.actions-panel__icon-glyph::after {
  position: absolute;
  background: var(--u-color-white);
  border-radius: 999px;
  content: '';
}

.actions-panel__icon-glyph--plus::before,
.actions-panel__icon-glyph--minus::before {
  top: 6px;
  left: 0;
  width: 14px;
  height: 2px;
}

.actions-panel__icon-glyph--plus::after {
  top: 0;
  left: 6px;
  width: 2px;
  height: 14px;
}

.package-dialog__path-row {
  display: flex;
  gap: 8px;
  width: 100%;
}

.package-dialog__path-row .el-input {
  flex: 1;
  min-width: 0;
}
</style>
