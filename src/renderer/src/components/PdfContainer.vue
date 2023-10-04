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
  <div class="box is-fluid is-flex is-flex-grow-1 is-flex-direction-column pt-2">
    <div class="is-flex">
      <span ref="tabs" class="tabs overflow" @wheel="scroll">
        <ul>
          <li
            v-for="(source, index) in currentFiles"
            :key="source"
            :class="{ 'is-active': source == selectedFile }"
            class="is-flex is-align-items-center"
          >
            <a class="px-2">
              <span class="pr-2" @click="store.selectedFile = source">{{
                getFileName(source)
              }}</span>
              <button class="delete is-small" @click="closeFile(index)"></button>
            </a>
          </li>
        </ul>
      </span>
    </div>
    <div v-if="selectedFile" class="is-flex is-flex-direction-column is-flex-grow-1">
      <PdfViewer />
    </div>
  </div>
</template>

<style scoped>
.overflow {
  overflow-x: auto;
}

::-webkit-scrollbar {
  display: none;
}
</style>
