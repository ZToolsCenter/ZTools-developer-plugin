<script setup lang="ts">
import { CommonEmptyState } from '@/components'
import type { DevelopmentViewEmits, DevelopmentViewProps } from './DevelopmentView'
import { useDevelopmentView } from './DevelopmentView'
import PluginActionsPanel from './components/PluginActionsPanel/PluginActionsPanel.vue'
import PluginOverviewPanel from './components/PluginOverviewPanel/PluginOverviewPanel.vue'

const props = defineProps<DevelopmentViewProps>()
const emit = defineEmits<DevelopmentViewEmits>()

const { currentPlugin, isDevelopmentViewReady } = useDevelopmentView(props, emit)

// 开发模式安装状态变化后请求父层刷新项目列表。
const handleDevProjectsUpdated = (): void => {
  emit('refresh-dev-projects')
}
</script>

<template>
  <section class="development-view">
    <div v-if="isDevelopmentViewReady" class="development-view__body">
      <PluginOverviewPanel :plugin="currentPlugin" @updated="handleDevProjectsUpdated" />

      <div class="development-view__groups">
        <div class="development-view__group">
          <PluginActionsPanel :plugin="currentPlugin" @updated="handleDevProjectsUpdated" />
        </div>

        <div class="development-view__group">
          <!--          <PluginPublishPanel />-->
        </div>
      </div>
    </div>

    <CommonEmptyState
      v-else
      title="等待开发中的插件"
      description="请先在左侧选择一个正在开发的插件或回到 ZTools 激活一个项目。"
    />
  </section>
</template>

<style scoped>
.development-view {
  flex: 1;
  min-width: 0;
  padding: 10px 20px;
}

.development-view__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.development-view__groups {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 16px;
}

.development-view__group {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
</style>
