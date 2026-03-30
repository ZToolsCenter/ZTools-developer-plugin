<script setup lang="ts">
import { useRouter } from 'vue-router'
import { logInfo } from '@/utils/logger'
import { resolveRouteName, workbenchNavItems, type WorkbenchNavProps } from './WorkbenchNav'

const props = defineProps<WorkbenchNavProps>()
const router = useRouter()

// 保留当前插件标识并切换顶部标签页。
const handleTabClick = async (tab: (typeof workbenchNavItems)[number]['tab']): Promise<void> => {
  if (!props.pluginId) {
    return
  }

  logInfo('WorkbenchNav', '切换导航', `切换到 ${tab}`)
  await router.push({
    name: resolveRouteName(tab),
    params: {
      pluginId: props.pluginId
    }
  })
}
</script>

<template>
  <header class="workbench-nav">
    <button
      v-for="item in workbenchNavItems"
      :key="item.tab"
      :data-tab="item.tab"
      type="button"
      class="workbench-nav__item"
      :class="{ 'workbench-nav__item--active': item.tab === props.activeTab }"
      :disabled="!props.pluginId"
      @click="handleTabClick(item.tab)"
    >
      <span class="workbench-nav__icon" :class="item.iconClass" aria-hidden="true" />
      <span class="workbench-nav__label">{{ item.label }}</span>
    </button>
  </header>
</template>

<style scoped>
.workbench-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: auto;
  background: transparent;
  padding: 8px 10px 10px;
}

.workbench-nav__item {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--u-color-text-2);
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  padding: 0 12px;
}

.workbench-nav__item:hover:enabled {
  background: var(--u-color-fill-2);
  color: var(--u-color-text-1);
}

.workbench-nav__item--active {
  background: rgba(var(--u-blue-1), 0.8) !important;
  color: var(--u-color-primary-7) !important;
  font-weight: 700;
}

.workbench-nav__icon {
  font-size: 18px;
}

.workbench-nav__label {
  white-space: nowrap;
}

.workbench-nav__item:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
