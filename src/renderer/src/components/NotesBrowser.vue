<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useWsStore } from '@renderer/stores/WorkspaceStore'
import Modal from './Modal.vue'
const store = useWsStore()

const currentPath = computed(() => store.currentWorkspace)
const selected = computed(() => store.currentNote)
const files = ref<string[]>([])
const fileToDelete = ref<string>('')
const searchString = ref<string>('')
const filteredFiles = computed(() =>
  files.value.filter((str) => {
    return str.toLowerCase().includes(searchString.value)
  })
)

watch(currentPath, () => {
  fillBrowser()
  window.electron.ipcRenderer.send('select-directory', currentPath.value)
})

function fillBrowser() {
  if (currentPath.value == null || currentPath.value == '') return
  files.value.splice(0, files.value.length)
  window.api.readDir(currentPath.value).then((filePaths) =>
    filePaths.forEach((file) => {
      files.value.push(file)
    })
  )
}

window.electron.ipcRenderer.on('directory-change-notification', () => {
  fillBrowser()
})

onMounted(() => {
  fillBrowser()
  window.electron.ipcRenderer.send('select-directory', currentPath.value)
})

async function deleteFile(file: string) {
  await window.api.deleteFile(currentPath.value, file)
  fileToDelete.value = ''
  if (selected.value == file) store.currentNote = ''
}
</script>

<template>
  <article class="panel is-flex is-flex-direction-column">
    <div class="panel-block">
      <p class="control has-icons-left">
        <input v-model="searchString" class="input" type="text" placeholder="Search" />
        <span class="icon is-left">
          <i class="fas fa-search"></i>
        </span>
        <span class="icon is-right clear pr-2">
          <button
            v-if="searchString != ''"
            class="delete is-small"
            @click="searchString = ''"
          ></button>
        </span>
      </p>
      <a class="ml-2 button is-inverted is-info" @click="fillBrowser">
        <span class="icon is-small">
          <i class="fas fa-sync" />
        </span>
      </a>
    </div>
    <div class="file-container is-flex-grow-1">
      <a
        v-for="file of filteredFiles"
        :key="file"
        class="panel-block py-1"
        :class="{ 'is-active': file == selected }"
        @click="store.currentNote = file"
      >
        <span class="panel-icon">
          <i class="fas fa-book"></i>
        </span>
        <span class="is-file-name is-flex-grow-1">{{ file }}</span>
        <button class="delete is-small delete-file" @click="fileToDelete = file"></button>
      </a>
    </div>
  </article>
  <Modal
    v-if="fileToDelete != ''"
    :title="`Are you sure you want to delete '${fileToDelete}'?`"
    :message="'This action can not be undone.'"
    @confirm="deleteFile(fileToDelete)"
    @cancel="fileToDelete = ''"
  />
</template>

<style scoped>
.panel {
  height: 30%;
}
.file-container {
  overflow-y: scroll;
  height: 1em;
}
.is-file-name {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.delete-file {
  display: none;
}
.panel-block:hover .delete-file {
  display: flex;
}

.clear {
  right: 0;
  z-index: auto !important;
  pointer-events: auto !important;
  width: 1.5rem !important;
}

.fa-sync {
  color: rgba(10, 10, 10, 0.2);
}
</style>
