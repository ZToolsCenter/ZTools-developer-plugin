<script setup lang="ts">
import type { PluginOverviewPanelEmits, PluginOverviewPanelProps } from './PluginOverviewPanel'
import { usePluginOverviewPanel } from './PluginOverviewPanel'

const props = defineProps<PluginOverviewPanelProps>()
const emit = defineEmits<PluginOverviewPanelEmits>()
const { displayAuthor, displayVersion, displayDescription, handleRemoveProject } = usePluginOverviewPanel(props, emit)
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
          <span class="overview-panel__badge">v{{ displayVersion }}</span>
          <el-dropdown :show-arrow="false"
                       trigger="click"
                       size="small"
                       popper-class="u-dropdown-popper u-dropdown-popper__small">
            <div class="i-u-more w-5 h-5"></div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item class="flex justify-center"
                                  @click="handleRemoveProject">
                  <div class="flex items-center w-full gap-2"
                       style="color: rgb(var(--u-red-5))">
                    <div class="i-u-delete w-4 h-4"/>
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
          <span>开发者:</span>
          <span>{{ displayAuthor }}</span>
        </span>
      </div>

      <p class="overview-panel__description">{{ displayDescription }}</p>
    </div>
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
</style>
