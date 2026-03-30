<script setup lang="ts">
import type { CardGroupProps } from './CardGroup'

const props = withDefaults(defineProps<CardGroupProps>(), {
  divided: true
})
</script>

<template>
  <section class="card-group" :class="{ 'card-group--divided': props.divided }">
    <slot />
  </section>
</template>

<style scoped>
.card-group {
  width: 100%;
  min-width: 0;
  overflow: hidden;
  border-radius: 8px;
  background: var(--u-color-fill-2);
}
</style>
