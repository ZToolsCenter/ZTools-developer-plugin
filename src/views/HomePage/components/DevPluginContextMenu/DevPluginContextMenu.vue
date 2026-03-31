<script setup lang="ts">
import type { DropdownInstance } from 'element-plus'
import { nextTick, ref, watch } from 'vue'
import {
  resolveVirtualTriggerRect,
  type DevPluginContextMenuEmits,
  type DevPluginContextMenuProps
} from './DevPluginContextMenu'

const props = defineProps<DevPluginContextMenuProps>()
const emit = defineEmits<DevPluginContextMenuEmits>()

const dropdownRef = ref<DropdownInstance>()
const virtualTriggerRect = ref(resolveVirtualTriggerRect(props.position))
const virtualTriggerRef = ref({
  getBoundingClientRect: (): DOMRect => virtualTriggerRect.value
})
const popperOptions = {
  modifiers: [
    {
      name: 'offset',
      options: {
        offset: [0, 0]
      }
    }
  ]
}

watch(
  () => props.position,
  (nextPosition) => {
    virtualTriggerRect.value = resolveVirtualTriggerRect(nextPosition)
  },
  {
    deep: true,
    immediate: true
  }
)

// Element Plus Dropdown 不支持 visible 受控属性，需通过实例方法同步开关状态。
watch(
  () => props.visible,
  async (nextVisible) => {
    await nextTick()

    if (nextVisible) {
      dropdownRef.value?.handleOpen?.()
      return
    }

    dropdownRef.value?.handleClose?.()
  }
)

// 点击“置顶”时抛出当前目标插件。
const handlePinToTop = (): void => {
  if (!props.plugin?.id) {
    return
  }

  emit('pin-to-top', props.plugin.id)
}

// 仅在菜单真正关闭时通知父层回收状态。
const handleVisibleChange = (nextVisible: boolean): void => {
  if (!nextVisible) {
    emit('close')
  }
}
</script>

<template>
  <el-dropdown
    ref="dropdownRef"
    :show-arrow="false"
    :popper-options="popperOptions"
    trigger="contextmenu"
    :virtual-ref="virtualTriggerRef"
    virtual-triggering
    placement="bottom-start"
    size="small"
    popper-class="u-dropdown-popper u-dropdown-popper__small"
    @visible-change="handleVisibleChange"
  >
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="handlePinToTop">
          <div class="flex gap-2 items-center">
            <div class="i-z-to-top w-4 h-4"></div>
            <div>置顶</div>
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
