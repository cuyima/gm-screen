<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useWsStore } from '@renderer/stores/WorkspaceStore'

const store = useWsStore()
const appTitle = ref('')
const recent = computed(() => store.recentWorkspaces)
const currentFiles = computed(() => store.currentFiles)

onMounted(async () => {
  appTitle.value = await window.electron.ipcRenderer.invoke('get-app-title')
})

function reload() {
  window.electron.ipcRenderer.send('reload')
}
function openDevTools() {
  window.electron.ipcRenderer.send('open-devtools')
}

async function openFolder() {
  const args = {
    filter: null,
    isFile: false
  }
  const folders = await window.electron.ipcRenderer.invoke('open-explorer', args)
  if (folders.canceled) return
  store.addWorkspace(folders.filePaths[0])
}

async function openFile() {
  const args = {
    filter: { name: 'PDFs', extensions: ['pdf'] },
    isFile: true
  }
  const files = await window.electron.ipcRenderer.invoke('open-explorer', args)
  if (files.canceled) return

  const currentLen = currentFiles.value.length

  files.filePaths.forEach((path: string) => {
    path = window.api.pathToFileURL(path)
    if (!currentFiles.value.includes(path)) currentFiles.value.push(path)
  })

  if (currentLen == currentFiles.value.length) return

  store.selectedFile = currentFiles.value[currentFiles.value.length - files.filePaths.length]
}
</script>

<template>
  <nav class="navbar has-shadow" role="navigation">
    <img class="icon" src="../assets/img/icon.png" />
    <div class="navbar-item has-dropdown is-hoverable">
      <a class="navbar-link"> Workspace </a>
      <div class="navbar-dropdown p-0">
        <a class="navbar-item" @click="openFile"> Open File... </a>
        <a class="navbar-item" @click="openFolder"> Open Folder... </a>
        <hr class="navbar-divider m-0" />
        <a
          v-for="ws of recent"
          :key="ws"
          class="navbar-item is-opacity-low"
          @click="store.addWorkspace(ws)"
        >
          {{ ws }}
        </a>
      </div>
    </div>
    <a class="navbar-item pl-1" @click="reload">Reload</a>
    <a class="navbar-item" @click="openDevTools">DevTools</a>
    <a class="navbar-item app-title">
      <span>{{ appTitle }} </span>
      <span v-if="store.currentWorkspace" class="pl-1"> - {{ store.currentWorkspace }}</span>
    </a>
    <a class="navbar-item filler" />
  </nav>
</template>

<style lang="scss" scoped>
.filler {
  -webkit-app-region: drag;
  flex: 1 !important;
}

.navbar-item,
.navbar-link {
  padding: 0 0.75rem;
}

.icon {
  -webkit-user-drag: none;
  margin-left: 0.25rem;
  margin-top: 0.15rem;
}

.app-title {
  user-select: none;
  position: absolute;
  transform: translate(50%, 10%);
  right: 50%;
  opacity: 50%;
}

.is-opacity-low {
  opacity: 0.75;
}
</style>
