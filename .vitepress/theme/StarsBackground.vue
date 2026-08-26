<script setup lang="ts">
// 导入 motion-v 动画库的类型和 API
import type { SpringOptions } from "motion-v"
import { motion, useMotionValue, useSpring } from "motion-v"
// 导入 Vue 组合式 API
import { computed, onMounted, onUnmounted, ref, watch } from "vue"

// 组件的 Props 类型定义
interface StarsBackgroundProps {
  factor?: number        // 鼠标视差灵敏度，越大星星位移越明显
  speed?: number         // 星星滚动速度，越小越快
  transition?: SpringOptions  // 弹簧动画参数（刚度和阻尼）
  starColor?: string     // 星星颜色
  class?: string         // 外部传入的 CSS 类名
}

// 定义 Props 及其默认值
const props = withDefaults(defineProps<StarsBackgroundProps>(), {
  factor: 0.05,          // 默认视差系数 5%
  speed: 50,             // 默认速度
  transition: () => ({ stiffness: 50, damping: 20 }),  // 默认弹簧：刚度50，阻尼20
  starColor: "#fff",     // 默认白色星星
})

/**
 * 生成星星的 box-shadow 字符串
 * 核心思路：一个空 div，通过 box-shadow 画无数个"投影点"，每个点就是一颗星
 * @param count - 星星数量
 * @param starColor - 星星颜色
 * @returns 形如 "10px 20px #fff, -50px 100px #fff, ..." 的字符串
 */
function generateStars(count: number, starColor: string) {
  const shadows: string[] = []
  for (let i = 0; i < count; i++) {
    // 在 4000×4000 的范围内随机分布，居中偏移 -2000
    const x = Math.floor(Math.random() * 4000) - 2000
    const y = Math.floor(Math.random() * 4000) - 2000
    shadows.push(`${x}px ${y}px ${starColor}`)
  }
  return shadows.join(", ")  // 用逗号拼接所有投影
}

// 鼠标偏移的原始值（motion-v 响应式数值），初始为 0 避免首帧跳动
const offsetX = useMotionValue(0)
const offsetY = useMotionValue(0)

// 对原始偏移值施加弹簧动画，实现弹性跟手效果
const springX = useSpring(offsetX, props.transition)
const springY = useSpring(offsetY, props.transition)

/**
 * 鼠标移动事件处理
 * 计算鼠标相对于屏幕中心的偏移，乘以 factor 得到星空位移量
 * 取负值：鼠标向右移→星空向左移，产生"跟手"视差
 */
function handleMouseMove(e: MouseEvent) {
  const centerX = window.innerWidth / 2   // 屏幕水平中心
  const centerY = window.innerHeight / 2  // 屏幕垂直中心
  offsetX.set(-(e.clientX - centerX) * props.factor)
  offsetY.set(-(e.clientY - centerY) * props.factor)
}

// 三层星星的 box-shadow 字符串
const boxShadow1 = ref("")  // 第1层：1000 颗 1px 小星，最快
const boxShadow2 = ref("")  // 第2层：400 颗 2px 中星，中速
const boxShadow3 = ref("")  // 第3层：200 颗 3px 大星，最慢

// 组件挂载时生成星星并监听鼠标移动
onMounted(() => {
  boxShadow1.value = generateStars(1000, props.starColor)
  boxShadow2.value = generateStars(400, props.starColor)
  boxShadow3.value = generateStars(200, props.starColor)
  // 监听 window 全局鼠标移动（而不是 div 的 @mousemove）
  // 因为 z-index: -1 放在底层，鼠标事件会被上层内容拦截
  window.addEventListener("mousemove", handleMouseMove)
})

// 组件卸载时移除监听
onUnmounted(() => {
  window.removeEventListener("mousemove", handleMouseMove)
})

// 监听星星颜色变化，重新生成
watch(() => props.starColor, (newColor) => {
  boxShadow1.value = generateStars(1000, newColor)
  boxShadow2.value = generateStars(400, newColor)
  boxShadow3.value = generateStars(200, newColor)
})

// 第1层动画配置：最快（速度 × 1）
const starLayer1Transition = computed(() => ({
  repeat: Infinity, duration: props.speed, ease: "linear",
}) as any)

// 第2层动画配置：中速（速度 × 2 = 更慢）
const starLayer2Transition = computed(() => ({
  repeat: Infinity, duration: props.speed * 2, ease: "linear",
}) as any)

// 第3层动画配置：最慢（速度 × 3）
const starLayer3Transition = computed(() => ({
  repeat: Infinity, duration: props.speed * 3, ease: "linear",
}) as any)
</script>

<template>
  <!-- 外层容器：全屏固定，接收外部 class -->
  <div :class="[$style.container, props.class]">
    <!-- motion.div：跟随鼠标做弹簧位移（视差效果） -->
    <motion.div :class="$style.wrapper" :style="{ x: springX, y: springY }">
      <!-- 第 1 层星星：1px，1000 颗，滚动最快 -->
      <motion.div
        :class="$style.track" style="height: 2000px"
        :initial="{ y: 0 }"                      
        :animate="{ y: [0, -2000] }"              
        :transition="starLayer1Transition"        
      >
        <!-- 主轨道上的星星 -->
        <div :class="$style.dot" style="width: 1px; height: 1px" :style="{ boxShadow: boxShadow1 }" />
        <!-- 副本：紧接在主轨道下方 2000px，实现无缝循环 -->
        <div :class="[$style.dot, $style.dotCopy]" style="width: 1px; height: 1px; top: 2000px" :style="{ boxShadow: boxShadow1 }" />
      </motion.div>

      <!-- 第 2 层星星：2px，400 颗，中速滚动 -->
      <motion.div
        :class="$style.track" style="height: 2000px"
        :initial="{ y: 0 }"
        :animate="{ y: [0, -2000] }"
        :transition="starLayer2Transition"
      >
        <div :class="$style.dot" style="width: 2px; height: 2px" :style="{ boxShadow: boxShadow2 }" />
        <div :class="[$style.dot, $style.dotCopy]" style="width: 2px; height: 2px; top: 2000px" :style="{ boxShadow: boxShadow2 }" />
      </motion.div>

      <!-- 第 3 层星星：3px，200 颗，滚动最慢 -->
      <motion.div
        :class="$style.track" style="height: 2000px"
        :initial="{ y: 0 }"
        :animate="{ y: [0, -2000] }"
        :transition="starLayer3Transition"
      >
        <div :class="$style.dot" style="width: 3px; height: 3px" :style="{ boxShadow: boxShadow3 }" />
        <div :class="[$style.dot, $style.dotCopy]" style="width: 3px; height: 3px; top: 2000px" :style="{ boxShadow: boxShadow3 }" />
      </motion.div>
    </motion.div>
  </div>
</template>

<style module>
/* 外层容器：填充父元素，裁剪溢出，深色渐变背景 */
.container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: radial-gradient(ellipse at bottom, #1a1a2e 0%, #000 100%);
}

/* 星星层包装器：绝对定位填满父容器，跟随鼠标平移 */
.wrapper {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

/* 滚动轨道：绝对定位在顶部，宽度 100%，供 motion 做 Y 轴动画 */
.track {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

/* 星星点：用 box-shadow 画出无数个投影，每个投影是一颗星 */
.dot {
  position: absolute;
  border-radius: 9999px;       /* 圆形 */
  background: transparent;     /* 元素本身透明，全靠 box-shadow 显示 */
}

/* 星星点副本：与主轨道内容完全相同，放在下方 2000px 实现无缝滚动 */
.dotCopy {
  position: absolute;
  border-radius: 9999px;
  background: transparent;
}
</style>
