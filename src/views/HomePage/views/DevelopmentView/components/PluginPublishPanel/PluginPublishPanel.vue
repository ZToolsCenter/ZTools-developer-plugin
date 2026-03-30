<script setup lang="ts">
import { CardAtom, CardGroup } from '@/components'
import { pluginPublishPanelContent } from './PluginPublishPanel'
</script>

<template>
  <CardGroup>
    <CardAtom
      :title="pluginPublishPanelContent.title"
      :description="pluginPublishPanelContent.description"
      icon-class="i-u-globe"
      icon-tone="muted"
    />
  </CardGroup>
</template>

<style scoped></style>
