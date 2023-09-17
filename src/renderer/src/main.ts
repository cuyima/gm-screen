import { createApp } from 'vue'
import App from '@renderer/App.vue'
import { createPinia } from 'pinia'
import '@renderer/assets/css/style.scss'

createApp(App).use(createPinia()).mount('#app')
