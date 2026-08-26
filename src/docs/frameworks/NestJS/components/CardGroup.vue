<!--
  组件：CardGroup（卡片组）
  用途：将多个 CollapseCard 包裹在一起，形成统一的视觉分组。
  用法：<CardGroup>
          <CollapseCard ...>...</CollapseCard>
          <CollapseCard ...>...</CollapseCard>
        </CardGroup>
-->
<script setup lang="ts">
defineProps<{
  label?: string
}>()
</script>

<template>
  <div class="card-group">
    <div v-if="label" class="card-group-label">{{ label }}</div>
    <div class="card-group-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.card-group {
  margin: 1rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}
.card-group-label {
  padding: 8px 16px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.card-group-body {
  padding: 0.5rem;
}
.card-group-body :deep(.collapse-card) {
  margin: 0.25rem 0;
  border-radius: 6px;
}
</style>
