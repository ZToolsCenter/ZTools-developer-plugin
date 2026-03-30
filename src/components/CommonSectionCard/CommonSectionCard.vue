<script setup lang="ts">
import type { CommonSectionCardProps } from './CommonSectionCard'

defineProps<CommonSectionCardProps>()
</script>

<template>
  <article class="common-section-card">
    <header v-if="headline" class="common-section-card__header">
      <h3 class="common-section-card__headline">{{ headline }}</h3>
      <p v-if="subheadline" class="common-section-card__subheadline">{{ subheadline }}</p>
    </header>
    <div class="common-section-card__body">
      <slot />
    </div>
  </article>
</template>

<style scoped>
.common-section-card {
  border-radius: 8px;
  background: var(--u-color-bg-4);
  padding: 20px;
}

.common-section-card__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.common-section-card__headline {
  margin: 0;
  color: var(--u-color-text-1);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
}

.common-section-card__subheadline {
  margin: 0;
  color: var(--u-color-text-3);
  font-size: 14px;
  line-height: 1.5;
}

.common-section-card__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}
</style>
