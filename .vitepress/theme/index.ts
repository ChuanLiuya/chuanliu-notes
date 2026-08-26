import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import './MyCss.css'
import MyLayout from "./MyLayout.vue"
import ContentToggle from '../../src/components/ContentToggle.vue'
import CollapseCard from '../../src/docs/frameworks/NestJS/components/CollapseCard.vue'
import CardGroup from '../../src/docs/frameworks/NestJS/components/CardGroup.vue'

const myTheme: Theme = {
  extends: DefaultTheme,
  Layout: MyLayout,
  enhanceApp({ app }) {
    app.component('ContentToggle', ContentToggle)
    app.component('CollapseCard', CollapseCard)
    app.component('CardGroup', CardGroup)
  },
}

export default myTheme