<script setup lang="ts">
import type { PluginOverviewPanelEmits, PluginOverviewPanelProps } from './PluginOverviewPanel'
import { usePluginOverviewPanel } from './PluginOverviewPanel'
import { ProjectMetaDialog } from '@/components'

const props = defineProps<PluginOverviewPanelProps>()
const emit = defineEmits<PluginOverviewPanelEmits>()
const { displayAuthor, displayPluginId, displayDescription, displayPlatform, handleRemoveProject,
  handleRefreshProject, isRefreshing,
  isEditDialogVisible, isEditing, editForm, openEditDialog, handleUpdateMeta,
  isGuideDialogVisible, openGuideDialog, openProjectFolder } = usePluginOverviewPanel(props, emit)
</script>

<template>
  <section class="overview-panel">
    <div class="overview-panel__logo">
      <img v-if="plugin?.logo" :src="plugin.logo" alt="插件图标" class="overview-panel__logo-img" />
      <span v-else class="overview-panel__logo-text">{{ plugin?.title?.charAt(0) ?? 'U' }}</span>
    </div>

    <div class="overview-panel__content">
      <div class="overview-panel__headline">
        <h2 class="overview-panel__title">{{ plugin?.title ?? '未命名插件' }}</h2>
        <div class="overview-panel__badges">
          <span v-if="plugin?.isRunning" class="overview-panel__badge overview-panel__badge--success">运行中</span>
          <el-dropdown :show-arrow="false"
                       trigger="click"
                       size="small"
                       popper-class="u-dropdown-popper u-dropdown-popper__small">
            <div class="i-z-more w-5 h-5"></div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item class="flex justify-center"
                                  @click="openEditDialog">
                  <div class="flex items-center w-full gap-2">
                    <div class="i-z-edit w-4 h-4"/>
                    <div>编辑</div>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item class="flex justify-center"
                                  :disabled="isRefreshing"
                                  @click="handleRefreshProject">
                  <div class="flex items-center w-full gap-2">
                    <div class="i-z-refresh w-4 h-4"/>
                    <div>{{ isRefreshing ? '刷新中…' : '刷新' }}</div>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item class="flex justify-center"
                                  @click="openGuideDialog">
                  <div class="flex items-center w-full gap-2">
                    <div class="i-z-services w-4 h-4"/>
                    <div>开发指南</div>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item class="flex justify-center"
                                  @click="handleRemoveProject">
                  <div class="flex items-center w-full gap-2"
                       style="color: rgb(var(--u-red-5))">
                    <div class="i-z-delete w-4 h-4"/>
                    <div>删除</div>
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <div class="overview-panel__meta">
        <span class="overview-panel__meta-item">
          <span>应用ID:</span>
          <span>{{ displayPluginId }}</span>
        </span>
        <span class="overview-panel__meta-item">
          <span>开发者:</span>
          <span>{{ displayAuthor }}</span>
        </span>
        <span v-if="displayPlatform" class="overview-panel__meta-item">
          <span>平台:</span>
          <span>{{ displayPlatform }}</span>
        </span>
      </div>

      <p class="overview-panel__description">{{ displayDescription }}</p>
    </div>

    <ProjectMetaDialog
      :visible="isEditDialogVisible"
      title="编辑项目信息"
      confirm-text="保存"
      :loading="isEditing"
      :form="editForm"
      name-readonly
      @update:visible="isEditDialogVisible = $event"
      @confirm="handleUpdateMeta"
    />

    <el-dialog
      :model-value="isGuideDialogVisible"
      title="开发指南"
      width="480px"
      :close-on-click-modal="false"
      @update:model-value="isGuideDialogVisible = $event"
    >
      <div class="guide">
        <p v-if="plugin?.path" class="guide__desc">项目位置：</p>
        <code v-if="plugin?.path" class="guide__path guide__path--clickable" @click="openProjectFolder">{{ plugin.path }}</code>
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
              <p class="guide__step-hint">打包时选择 <code>dist</code> 文件夹作为构建产物目录</p>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="isGuideDialogVisible = false">我知道了</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<style>
.u-dropdown-popper {

}
</style>
<style scoped>
.overview-panel {
  display: flex;
  gap: 20px;
  border-radius: 8px;
  background: var(--u-color-fill-2);
  padding: 10px;
}

.overview-panel__logo {
  display: flex;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--u-radius-large);
  background: linear-gradient(
    135deg,
    var(--u-color-primary-light-3) 0%,
    var(--u-color-primary-6) 55%,
    var(--u-color-danger-light-3) 100%
  );
}

.overview-panel__logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overview-panel__logo-text {
  color: var(--u-color-white);
  font-size: 24px;
  font-weight: 700;
}

.overview-panel__content {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 2px;
}

.overview-panel__headline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.overview-panel__title {
  margin: 0;
  color: var(--u-color-text-1);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
}

.overview-panel__badges {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
}

.overview-panel__badge {
  border-radius: 999px;
  background: var(--u-color-fill-2);
  color: var(--u-color-text-2);
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
}

.overview-panel__badge--success {
  background: var(--u-color-success-light-1);
  color: var(--u-color-success-6);
}

.overview-panel__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}

.overview-panel__meta-item {
  color: var(--u-color-text-2);
  font-size: 14px;
  line-height: 1.6;
  >span:first-child {
    font-size: 12px;
    margin-right: 4px;
  }
  >span:last-child {
    font-size: 12px;
    font-weight: 500;
    color: var(--u-color-text-1);
  }
}

.overview-panel__description {
  margin: 0;
  color: var(--u-color-text-2);
  font-size: 12px;
  line-height: 1.7;
}

@media (max-width: 767px) {
  .overview-panel {
    flex-direction: column;
  }

  .overview-panel__headline {
    flex-direction: column;
  }
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
