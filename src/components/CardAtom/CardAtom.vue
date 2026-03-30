<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { CardAtomProps } from './CardAtom'

const props = withDefaults(defineProps<CardAtomProps>(), {
  title: '',
  description: '',
  iconClass: '',
  iconTone: 'default',
  status: '',
  clickable: false,
  disabled: false
})

const emit = defineEmits<{
  /** 点击当前卡片原子项时抛出事件。 */
  (e: 'click', event: MouseEvent): void
}>()

const slots = useSlots()

// 根据是否可点击决定根节点标签。
const rootTag = computed(() => (props.clickable ? 'button' : 'div'))

// 当前是否存在图标内容。
const hasIcon = computed(() => Boolean(props.iconClass || slots.icon))
// 当前是否存在标题内容。
const hasTitle = computed(() => Boolean(props.title || slots.title))
// 当前是否存在描述内容。
const hasDescription = computed(() => Boolean(props.description || slots.description))
// 当前是否存在右侧状态内容。
const hasStatus = computed(() => Boolean(props.status || slots.status))

// 抛出点击事件，仅对可点击且未禁用状态生效。
const handleClick = (event: MouseEvent): void => {
  if (!props.clickable || props.disabled) {
    return
  }

  emit('click', event)
}
</script>

<template>
  <component
    :is="rootTag"
    class="card-atom"
    :class="{
      'card-atom--interactive': props.clickable,
      'card-atom--disabled': props.disabled
    }"
    :type="props.clickable ? 'button' : undefined"
    :disabled="props.clickable ? props.disabled : undefined"
    @click="handleClick"
  >
    <div class="card-atom__main">
      <span
        v-if="props.iconClass"
        class="card-atom__icon"
        :class="[
          props.iconClass,
          `card-atom__icon--${props.iconTone}`
        ]"
        aria-hidden="true"
      />
      <div
        v-else-if="hasIcon"
        class="card-atom__icon card-atom__icon--slot"
        aria-hidden="true"
      >
        <slot name="icon" />
      </div>

      <div class="card-atom__content">
        <div v-if="hasTitle" class="card-atom__title">
          <template v-if="props.title">{{ props.title }}</template>
          <slot v-else name="title" />
        </div>

        <div v-if="hasDescription" class="card-atom__description">
          <template v-if="props.description">{{ props.description }}</template>
          <slot v-else name="description" />
        </div>
      </div>
    </div>

    <div v-if="hasStatus" class="card-atom__status">
      <template v-if="props.status">{{ props.status }}</template>
      <slot v-else name="status" />
    </div>
  </component>
</template>

<style scoped lang="less">
.card-atom {
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  padding: 12px;
  text-align: left;
}

.card-atom__main {
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: center;
  gap: 16px;
}

.card-atom--interactive {
  cursor: pointer;
}

.card-atom--interactive:hover:not(.card-atom--disabled) {
  background: var(--u-color-fill-3);
}

.card-atom--disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.card-atom__icon {
  flex-shrink: 0;
  font-size: 20px;
}

.card-atom__icon--slot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.card-atom__icon--default {
  color: var(--u-color-text-2);
}

.card-atom__icon--muted {
  color: var(--u-color-text-3);
}

.card-atom__icon--primary {
  color: var(--u-color-primary-6);
}

.card-atom__icon--success {
  color: var(--u-color-success-6);
}

.card-atom__content {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.card-atom__title {
  color: var(--u-color-text-1);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
}

.card-atom__description {
  overflow-wrap: anywhere;
  color: var(--u-color-text-2);
  font-size: 12px;
  line-height: 1.5;
}

.card-atom__status {
  min-width: 0;
  flex-shrink: 1;
  overflow-wrap: anywhere;
  color: var(--u-color-text-3);
  font-size: 12px;
  text-align: right;
}
</style>
