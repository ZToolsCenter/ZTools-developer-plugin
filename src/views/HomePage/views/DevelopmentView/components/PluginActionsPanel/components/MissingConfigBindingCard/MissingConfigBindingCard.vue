<script setup lang="ts">
import type {
  MissingConfigBindingCardEmits,
  MissingConfigBindingCardProps
} from './MissingConfigBindingCard'
import { useMissingConfigBindingCard } from './MissingConfigBindingCard'

const props = defineProps<MissingConfigBindingCardProps>()
const emit = defineEmits<MissingConfigBindingCardEmits>()

const { isDragging, isSubmitting, handleDrop, submitConfigPath } = useMissingConfigBindingCard(
  props,
  emit
)
</script>

<template>
  <button
    class="missing-config-binding-card"
    :class="{
      'missing-config-binding-card--dragging': isDragging,
      'missing-config-binding-card--submitting': isSubmitting
    }"
    type="button"
    :disabled="isSubmitting"
    @click="submitConfigPath()"
    @dragenter.prevent="isDragging = true"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop="handleDrop"
  >
    <span class="missing-config-binding-card__icon i-u-folder-open" aria-hidden="true" />

    <span class="missing-config-binding-card__content">
      <span class="missing-config-binding-card__title">导入源码工程</span>
      <span class="missing-config-binding-card__description">
        选择插件应用源码工程的 plugin.json 文件，或将其拖放到此处
      </span>
    </span>
  </button>
</template>

<style scoped>
.missing-config-binding-card {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 16px;
  border-radius: 8px;
  background: var(--u-color-bg-1);
  color: inherit;
  font: inherit;
  padding: 12px;
  text-align: left;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.missing-config-binding-card:hover:not(:disabled) {
  background: var(--u-color-fill-2);
  cursor: pointer;
}

.missing-config-binding-card--dragging {
  border-color: var(--u-color-primary-6);
  background: color-mix(in srgb, var(--u-color-primary-light-1) 55%, var(--u-color-bg-1));
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--u-color-primary-6) 24%, transparent);
}

.missing-config-binding-card--submitting {
  cursor: progress;
}

.missing-config-binding-card:disabled {
  opacity: 0.72;
}

.missing-config-binding-card__icon {
  color: var(--u-color-text-3);
  font-size: 20px;
}

.missing-config-binding-card__content {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 4px;
}

.missing-config-binding-card__title {
  color: var(--u-color-text-1);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
}

.missing-config-binding-card__description {
  color: var(--u-color-text-2);
  font-size: 13px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
</style>
