import { createApp } from 'vue'
import App from '@renderer/App.vue'
import { createPinia } from 'pinia'
import '@renderer/assets/css/style.scss'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { conditionalGrouping } from './directives/conditional-grouping'

const app = createApp(App)
app.use(createPinia().use(piniaPluginPersistedstate))
app.directive('conditionalGrouping', conditionalGrouping)
app.mount('#app')
