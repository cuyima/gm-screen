import { createApp } from 'vue'
import App from '@renderer/App.vue'
import { createPinia } from 'pinia'
import '@renderer/assets/css/style.scss'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const app = createApp(App)
app.use(createPinia().use(piniaPluginPersistedstate))
app.mount('#app')
