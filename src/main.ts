import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as Sentry from '@sentry/vue'
import { onLCP, onINP, onCLS } from 'web-vitals'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

// Sentry 异常监控
Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration({ router })
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
})

// Web Vitals 性能监控
onLCP((metric) => {
  console.log('[Web Vitals] LCP:', metric.value)
  // 上报到后端或 Sentry
  // Sentry.metrics.distribution('web_vitals.lcp', metric.value)
})

onINP((metric) => {
  console.log('[Web Vitals] INP:', metric.value)
})

onCLS((metric) => {
  console.log('[Web Vitals] CLS:', metric.value)
})

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.mount('#app')
