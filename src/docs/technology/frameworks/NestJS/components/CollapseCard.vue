<!--
  组件：CollapseCard（折叠卡片）
  用途：点击标题展开/收起内容，适合展示多个库、工具或概念的对比说明。
  用法：<CollapseCard title="passport" summary="身份验证的'工具箱'">
          <p>详细内容...</p>
        </CollapseCard>
        <CollapseCard title="另一个" summary="摘要" :default-open="true">
          默认展开的内容
        </CollapseCard>
-->
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  title: string
  summary: string
  defaultOpen?: boolean
}>()

const isOpen = ref(false)

onMounted(() => {
  if (props.defaultOpen) {
    isOpen.value = true
  }
})
</script>

<template>
  <div class="collapse-card" :class="{ open: isOpen }">
    <button class="collapse-header" @click="isOpen = !isOpen">
      <span class="collapse-title">
        <code>{{ title }}</code>
        <span class="collapse-summary">— {{ summary }}</span>
      </span>
      <span class="collapse-arrow">{{ isOpen ? '▾' : '▸' }}</span>
    </button>
    <div v-show="isOpen" class="collapse-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.collapse-card {
  margin: 0.75rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.collapse-card.open {
  border-color: var(--vp-c-brand);
}

.collapse-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-size: 0.9rem;
  text-align: left;
  transition: background 0.2s;
}
.collapse-header:hover {
  background: var(--vp-c-bg-mute);
}

.collapse-title {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
}
.collapse-title code {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--vp-c-brand);
  background: none;
  padding: 0;
}
.collapse-summary {
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
}

.collapse-arrow {
  flex-shrink: 0;
  color: var(--vp-c-text-3);
  font-size: 0.8rem;
  transition: transform 0.2s;
}

.collapse-body {
  padding: 0.75rem 1rem 0.25rem;
  border-top: 1px solid var(--vp-c-divider);
}
</style>
