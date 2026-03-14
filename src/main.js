import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
router
  .isReady()
  .then(() => {
    app.mount('#app')
  })
  .catch((error) => {
    console.error('Router initialization failed. Mounting app anyway.', error)
    app.mount('#app')
  })
