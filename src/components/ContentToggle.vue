<!--
  组件：ContentToggle（内容切换）
  用途：在“浅显解析”和“深入解析”之间切换。
  用法：<ContentToggle>
          <template #simple>浅显内容</template>
          <template #deep>深入内容</template>
        </ContentToggle>
-->
<script setup lang="ts">
import { ref } from 'vue'

const isDeep = ref(false)
</script>

<template>
  <div class="content-toggle">
    <div class="toggle-bar">
      <button
        :class="['toggle-btn', { active: !isDeep }]"
        @click="isDeep = false"
      >
        📖 浅显解析
      </button>
      <button
        :class="['toggle-btn', { active: isDeep }]"
        @click="isDeep = true"
      >
        🔬 深入解析
      </button>
    </div>
    <div class="toggle-content">
      <div v-show="!isDeep">
        <slot name="simple" />
      </div>
      <div v-show="isDeep">
        <slot name="deep" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-toggle {
  margin: 1.5rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}
.toggle-bar {
  display: flex;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}
.toggle-btn {
  flex: 1;
  padding: 8px 16px;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}
.toggle-btn:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-mute);
}
.toggle-btn.active {
  color: var(--vp-c-brand);
  border-bottom-color: var(--vp-c-brand);
}
.toggle-content {
  padding: 0 1rem 0.5rem;
}
</style>
