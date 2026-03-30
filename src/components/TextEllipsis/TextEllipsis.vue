<script setup lang="ts">
import {
  textEllipsisPropsDefaults,
  useTextEllipsis,
  type TextEllipsisEmits,
  type TextEllipsisProps
} from './TextEllipsis'

const props = withDefaults(defineProps<TextEllipsisProps>(), textEllipsisPropsDefaults)
const emit = defineEmits<TextEllipsisEmits>()

const { handleClick, textRef, tooltipClass, tooltipShow } = useTextEllipsis(props, emit)
</script>

<template>
  <el-tooltip :popper-class="tooltipClass"
              :disabled="!tooltipShow"
              :effect="effect"
              placement="top">
    <template #content>
      <slot name="default">{{ text }}</slot>
    </template>
    <span
      ref="textRef"
      class="text-ellipsis"
      :class="[textClass, lines > 1 ? 'multiline-ellipsis' : 'omit-text']"
      :style="{ '-webkit-line-clamp': lines }"
      @click="handleClick"
    >
      <slot name="prefix"></slot>
      <slot name="default">{{ text }}</slot>
    </span>
  </el-tooltip>
</template>

<style lang="less" scoped>
.text-ellipsis {
  display: block;
  width: 100%;
  min-width: 0;
  max-width: 100%;
}

.omit-text {
  white-space: nowrap;
  overflow: hidden;
  overflow-wrap: normal;
  word-break: normal;
  text-overflow: ellipsis;
}

.multiline-ellipsis {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  line-height: 1.5;
  max-height: calc(1.5em * v-bind(lines));
}
</style>

<style>
.card-text_ellipsis {
  max-width: 50%;
}
.card-text_ellipsis_light {
  background: #fff !important;
}
</style>
