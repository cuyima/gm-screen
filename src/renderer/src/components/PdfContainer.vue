<script setup lang="ts">
import { ref } from 'vue'
//import PdfViewer from '@renderer/PdfViewer.vue'

const filePaths = ref<string[]>([])
const selectedFile = ref('')
const tabs = ref<HTMLSpanElement>()

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
  const fPaths = filePaths.value
  const file = fPaths[index]
  fPaths.splice(index, 1)
  if (fPaths.length == 0) {
    selectedFile.value = ''
  }

  if (file != selectedFile.value) return

  if (fPaths.length > index) {
    selectedFile.value = fPaths[index]
  }
  if (fPaths.length == index) {
    selectedFile.value = fPaths[index - 1]
  }
  if (fPaths.length < index) {
    selectedFile.value = fPaths[fPaths.length - 1]
  }
}

async function openFile() {
  const args = {
    filter: { name: 'PDFs', extensions: ['pdf'] },
    isFile: true
  }
  const files = await window.electron.ipcRenderer.invoke('open-explorer', args)
  if (files.canceled) return

  const currentLen = filePaths.value.length

  files.filePaths.forEach((path: string) => {
    path = window.api.pathToFileURL(path)
    if (!filePaths.value.includes(path)) filePaths.value.push(path)
  })

  if (currentLen == filePaths.value.length) return

  selectedFile.value = filePaths.value[filePaths.value.length - files.filePaths.length]
}
</script>

<template>
  <div class="box is-fluid is-flex is-flex-grow-1 is-flex-direction-column">
    <div class="is-flex mb-2">
      <button class="button mr-1 p-2 is-outlined" @click="openFile()">Open File</button>
      <span ref="tabs" class="tabs overflow" @wheel="scroll">
        <ul>
          <li
            v-for="(source, index) in filePaths"
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
