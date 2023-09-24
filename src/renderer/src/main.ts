import { createApp } from 'vue'
import App from '@renderer/App.vue'
import { createPinia } from 'pinia'
import '@renderer/assets/css/style.scss'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

createApp(App).use(createPinia().use(piniaPluginPersistedstate)).mount('#app')
