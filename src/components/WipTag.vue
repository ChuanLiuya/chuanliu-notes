<!--
  组件：WipTag（Work In Progress）
  用途：标记笔记中尚未写完的章节或段落，显示一个醒目的"待完善"标签。
  用法：<WipTag />
        <WipTag text="具体说明" />
-->
<script setup lang="ts">
defineProps<{
  text?: string
}>()
</script>

<template>
  <span class="wip-tag" :title="text || '这部分还没写完~'">
    待完善
  </span>
</template>

<style scoped>
.wip-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #f59e0b;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  cursor: help;
  white-space: nowrap;
}

.wip-icon {
  width: 14px;
  height: 14px;
}

.dark .wip-tag {
  color: #fbbf24;
  background: #78350f40;
  border-color: #92400e;
}
</style>
