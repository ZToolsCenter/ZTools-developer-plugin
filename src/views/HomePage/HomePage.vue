<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { logInfo, logWarn } from '@/utils/logger'
import { DevPluginSidebar } from './components/DevPluginSidebar'
import type { DevPluginSidebarExpose } from './components/DevPluginSidebar/DevPluginSidebar'
import { WorkbenchNav } from './components/WorkbenchNav'
import { HOME_ROUTE_NAMES, resolveHomeTab, type HomePlugin } from './HomePage'

const route = useRoute()
const router = useRouter()

// 已加载的开发中插件列表，用于解析当前路由状态。
const plugins = ref<HomePlugin[]>([])
// 侧边栏完成加载前的页面级 loading 状态。
const isPageLoading = ref(true)
// 侧边栏实例引用，用于主动触发刷新。
const sidebarRef = ref<DevPluginSidebarExpose | null>(null)

// 当前路由中的插件标识。
const selectedPluginId = computed(() => {
  const pluginId = route.params.pluginId
  return typeof pluginId === 'string' ? pluginId : ''
})

// 当前路由对应的工作台标签。
const activeTab = computed(() => resolveHomeTab(route.name))

// 当前路由匹配到的开发中插件。
const selectedPlugin = computed(() => {
  return plugins.value.find((plugin) => plugin.id === selectedPluginId.value) ?? null
})

// 当路由缺失或插件无效时，回退到首个可用插件。
const ensureValidPluginRoute = async (): Promise<void> => {
  if (plugins.value.length === 0) {
    return
  }

  if (!selectedPluginId.value || !selectedPlugin.value) {
    const fallbackPlugin = plugins.value[0]
    if (!fallbackPlugin) {
      return
    }

    logWarn('HomePage', '路由回退', `回退到默认插件: ${fallbackPlugin.id}`)
    await router.replace({
      name: HOME_ROUTE_NAMES[activeTab.value],
      params: {
        pluginId: fallbackPlugin.id
      }
    })
  }
}

// 处理侧边栏返回的标准化插件列表。
const handlePluginsLoaded = async (nextPlugins: HomePlugin[]): Promise<void> => {
  plugins.value = nextPlugins
  isPageLoading.value = false
  logInfo('HomePage', '初始化', `开发中插件数量: ${nextPlugins.length}`)
  await ensureValidPluginRoute()
}

// 切换左侧插件时，保留当前标签页并更新路由。
const handlePluginSelect = async (pluginId: string): Promise<void> => {
  logInfo('HomePage', '选择插件', `切换插件: ${pluginId}`)
  await router.push({
    name: HOME_ROUTE_NAMES[activeTab.value],
    params: {
      pluginId
    }
  })
}

// 处理开发页发起的项目刷新请求。
const handleRefreshDevProjects = async (): Promise<void> => {
  await sidebarRef.value?.refreshPlugins()
}

watch(
  () => [selectedPluginId.value, plugins.value.length] as const,
  async () => {
    if (!isPageLoading.value) {
      await ensureValidPluginRoute()
    }
  }
)
</script>

<template>
  <div class="home-page">
    <DevPluginSidebar
      ref="sidebarRef"
      :selected-plugin-id="selectedPluginId"
      @loaded="handlePluginsLoaded"
      @select="handlePluginSelect"
    />

    <main class="home-page__content">
      <WorkbenchNav :plugin-id="selectedPluginId" :active-tab="activeTab" />

      <div class="home-page__body">
        <div v-if="!isPageLoading && !selectedPlugin" class="home-page__state">
          <el-empty description="暂无开发项目" />
        </div>

        <RouterView v-else v-slot="{ Component }">
          <component
            :is="Component"
            v-if="Component"
            :plugin="selectedPlugin"
            @refresh-dev-projects="handleRefreshDevProjects"
          />
        </RouterView>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  //background: var(--u-color-bg-4);
  color: var(--u-color-text-1);
}

.home-page__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.home-page__body {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.home-page__state {
  display: flex;
  flex: 1;
  align-items: flex-start;
  justify-content: center;
  padding: 20px;
}

.home-page__state :deep(.common-empty-state) {
  width: min(100%, 640px);
  margin-top: 20px;
}
</style>
