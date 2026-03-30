<script setup lang="ts">
import { CommonSectionCard } from '@/components'
import type { HomeTabPlaceholderProps } from './HomeTabPlaceholder'
import { useHomeTabPlaceholder } from './HomeTabPlaceholder'

const props = defineProps<HomeTabPlaceholderProps>()

const { canReturnToDevelopment, handleReturnToDevelopment } = useHomeTabPlaceholder()
</script>

<template>
  <section class="placeholder-view">
    <CommonSectionCard
      class="placeholder-view__card"
      :headline="props.meta.cardHeadline"
      :subheadline="props.meta.cardSubheadline"
    >
      <div class="placeholder-view__content">
        <div class="placeholder-view__copy">
          <h2 class="placeholder-view__title">{{ props.meta.placeholderTitle }}</h2>
          <p class="placeholder-view__description">{{ props.meta.placeholderDescription }}</p>
        </div>

        <button
          type="button"
          class="placeholder-view__action"
          :disabled="!canReturnToDevelopment"
          @click="handleReturnToDevelopment"
        >
          {{ props.meta.actionLabel }}
        </button>
      </div>

      <p class="placeholder-view__hint">{{ props.meta.placeholderHint }}</p>
    </CommonSectionCard>
  </section>
</template>

<style scoped>
.placeholder-view {
  box-sizing: border-box;
  display: flex;
  flex: 1;
  min-width: 0;
  padding: 20px;
}

.placeholder-view__card {
  width: 100%;
}

.placeholder-view__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.placeholder-view__copy {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.placeholder-view__title {
  margin: 0;
  color: var(--u-color-text-1);
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.placeholder-view__description {
  margin: 0;
  color: var(--u-color-text-3);
  font-size: 14px;
  line-height: 1.6;
}

.placeholder-view__action {
  align-self: flex-start;
  border: none;
  border-radius: 8px;
  background: var(--u-color-fill-2);
  color: var(--u-color-text-1);
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 18px;
}

.placeholder-view__action:hover:enabled {
  background: var(--u-color-fill-3);
}

.placeholder-view__action:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.placeholder-view__hint {
  margin: 0;
  color: var(--u-color-text-3);
  font-size: 14px;
  line-height: 1.6;
}
</style>
