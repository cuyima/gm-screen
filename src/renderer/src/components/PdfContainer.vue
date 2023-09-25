<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useWsStore } from '@renderer/stores/WorkspaceStore'

//import PdfViewer from '@renderer/PdfViewer.vue'
const store = useWsStore()

const currentFiles = ref<string[]>([''])
const selectedFile = ref<string>('')
const tabs = ref<HTMLSpanElement>()

store.$subscribe(
  (_mutation, state) => {
    if (state.currentFiles != currentFiles.value) currentFiles.value = state.currentFiles
    if (state.selectedFile != selectedFile.value) selectedFile.value = state.selectedFile
  },
  { detached: true }
)

onMounted(() => {
  currentFiles.value = store.currentFiles
  selectedFile.value = store.selectedFile
})

function scroll(e: WheelEvent) {
  const tabsValue = tabs.value
  if (tabsValue) {
    tabsValue.scrollLeft += e.deltaY
  }
}

function getFileName(filePath: string) {
  const parts = filePath.split('/')
  return parts[parts.length - 1]
}

function closeFile(index: number) {
  const fPaths = currentFiles.value
  const file = fPaths[index]
  fPaths.splice(index, 1)
  if (fPaths.length == 0) {
    store.selectedFile = ''
  }

  if (file != store.selectedFile) return

  if (fPaths.length > index) {
    store.selectedFile = fPaths[index]
  }
  if (fPaths.length == index) {
    store.selectedFile = fPaths[index - 1]
  }
  if (fPaths.length < index) {
    store.selectedFile = fPaths[fPaths.length - 1]
  }
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
  <div class="box is-fluid is-flex is-flex-grow-1 is-flex-direction-column">
    <div class="is-flex mb-2">
      <button class="button mr-1 p-2 is-family-secondary" @click="openFile">Open File</button>
      <span ref="tabs" class="tabs overflow" @wheel="scroll">
        <ul>
          <li
            v-for="(source, index) in currentFiles"
            :key="source"
            :class="{ 'is-active': source === selectedFile }"
            class="is-flex is-align-items-center"
          >
            <a class="px-2">
              <span class="pr-2" @click="selectedFile = source">{{ getFileName(source) }}</span>
              <button class="delete is-small" @click="closeFile(index)"></button>
            </a>
          </li>
        </ul>
      </span>
    </div>
    <!-- <PdfViewer :url="selectedFile" v-if="selectedFile"/> -->
    <iframe
      v-if="selectedFile != ''"
      class="is-flex-grow-1"
      :src="selectedFile + '#toolbar=0'"
      type="application/pdf"
    />
  </div>
</template>

<style scoped>
.overflow {
  overflow-x: scroll;
}
</style>
