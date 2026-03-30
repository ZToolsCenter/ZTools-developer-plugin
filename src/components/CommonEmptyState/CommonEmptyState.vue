<script setup lang="ts">
import type { CommonEmptyStateProps } from './CommonEmptyState'

defineProps<CommonEmptyStateProps>()
</script>

<template>
  <section class="common-empty-state">
    <header class="common-empty-state__header">
      <h2 class="common-empty-state__title">{{ title }}</h2>
      <p v-if="description" class="common-empty-state__description">{{ description }}</p>
    </header>
    <div v-if="hasActionSlot" class="common-empty-state__action">
      <slot name="action" />
    </div>
    <slot v-else />
  </section>
</template>

<style scoped>
.common-empty-state {
  border-radius: 8px;
  background: var(--u-color-bg-1);
  color: var(--u-color-text-1);
  padding: 20px;
}

.common-empty-state__header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.common-empty-state__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.common-empty-state__description {
  margin: 0;
  color: var(--u-color-text-3);
  font-size: 14px;
  line-height: 1.6;
}

.common-empty-state__action {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
