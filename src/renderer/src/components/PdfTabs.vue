<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWsStore } from '@renderer/stores/WorkspaceStore'
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
  <div ref="tabs" class="is-flex overflow mb-0" @wheel="scroll">
    <a
      v-for="(source, index) in currentFiles"
      :key="source"
      class="navbar-item px-0"
      :class="{ 'is-active': source == selectedFile }"
    >
      <span class="pr-1" @click="store.selectedFile = source">{{ getFileName(source) }}</span>
      <button class="delete is-tiny mr-2" @click="closeFile(index)"></button>
    </a>
  </div>
</template>

<style scoped lang="scss">
@import '../assets/css/variables.scss';
.overflow {
  overflow-x: scroll;
}

::-webkit-scrollbar {
  display: none;
}

.navbar-item {
  padding: 0 0.75rem;
}
.navbar-item.is-active {
  color: $gm-gold !important;
}

.navbar-item:hover {
  color: $gm-gold !important;
}

.delete {
  visibility: hidden;
}
.navbar-item:hover .delete {
  visibility: visible;
}
</style>
