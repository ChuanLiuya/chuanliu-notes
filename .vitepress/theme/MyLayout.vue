<script setup>
import DefaultTheme from "vitepress/theme";
import StarsBackground from "./StarsBackground.vue";

const { Layout } = DefaultTheme;

//手机版导航栏颜色改变逻辑
import { useWindowScroll } from "@vueuse/core";
import { watch, onMounted, onUnmounted } from "vue";

const { y } = useWindowScroll();

watch(y, (val) => {
  const nav = document.querySelector(".VPLocalNav");
  if (!nav) return;
  const navHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue(
      "--vp-nav-height",
    ),
  );
  nav.classList.toggle("is-stuck", val >= navHeight);
});
</script>

<template>
  <StarsBackground :class="$style.bg" />
  <Layout />
</template>

<style module>
.bg {
  position: fixed;
  inset: 0;
  z-index: -1;
}
</style>
