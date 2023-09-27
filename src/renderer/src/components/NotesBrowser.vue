<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useWsStore } from '@renderer/stores/WorkspaceStore'
import Modal from './Modal.vue'
const store = useWsStore()

const currentPath = ref<string>('')
const selected = ref<string>()
const files = ref<string[]>([])
const fileToDelete = ref<string>('')
const searchString = ref<string>('')
const filteredFiles = computed(() =>
  files.value.filter((str) => {
    return str.toLowerCase().includes(searchString.value)
  })
)

store.$subscribe(
  (_mutation, state) => {
    if (state.currentWorkspace != currentPath.value) {
      fillBrowser()
      window.electron.ipcRenderer.send('select-directory', currentPath.value)
    }
  },
  { detached: true }
)

function fillBrowser() {
  if (store.currentWorkspace == null || store.currentWorkspace == '') return
  currentPath.value = store.currentWorkspace
  files.value = []
  window.api.readDir(store.currentWorkspace).then((filePaths) =>
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
  if (currentPath.value != undefined)
    window.electron.ipcRenderer.send('select-directory', currentPath.value)
})

function selectNote(file: string) {
  selected.value = file
  store.setCurrentNote(file)
}

async function deleteFile(file: string) {
  await window.api.deleteFile(store.currentWorkspace, file)
  fileToDelete.value = ''
  if (store.currentNote == file) store.setCurrentNote('')
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
        :class="{ 'is-active': file === selected }"
        @click="selectNote(file)"
      >
        <span class="panel-icon">
          <i class="fas fa-book"></i>
        </span>
        <span class="is-file-name is-flex-grow-1">{{ file }}</span>
        <a class="icon is-small trash has-text-info" @click="fileToDelete = file">
          <i class="fas fa-trash"></i>
        </a>
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
.trash {
  display: none;
}
.panel-block:hover .trash {
  display: flex;
  opacity: 50%;
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
.refresh {
  background-color: unset;
  border: none;
  cursor: pointer;
  pointer-events: auto;
  display: inline-block;
  flex-grow: 0;
  flex-shrink: 0;
  outline: none;
  position: relative;
  vertical-align: top;
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: center;
}
</style>
