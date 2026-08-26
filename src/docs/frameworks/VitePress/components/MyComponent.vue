<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const colors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6']
const i = ref(0)
let timer: number

onMounted(() => {
  timer = setInterval(() => { i.value = (i.value + 1) % colors.length }, 500)
})

onUnmounted(() => clearInterval(timer))
</script>

<template>
  <span class="rainbow" :style="{ color: colors[i] }">你好！</span>
</template>

<style scoped>
.rainbow {
  font-size: 2rem;
  font-weight: bold;
  transition: color 0.3s;
}
</style>


