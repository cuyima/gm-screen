<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWsStore } from '@renderer/stores/WorkspaceStore'
import PdfViewer from './PdfViewer.vue'

const store = useWsStore()

const currentFiles = computed(() => store.currentFiles)
const selectedFile = computed(() => store.selectedFile)
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
</script>

<template>

    <PdfViewer />
  </div>
</template>

<style scoped>
.overflow {
  overflow-x: scroll;
}

::-webkit-scrollbar {
  display: none;
}
</style>
