<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWsStore } from '@renderer/stores/WorkspaceStore'
const store = useWsStore()

const currentPath = ref<string>()
const selected = ref<string>()
const files = ref<string[]>([])

store.$subscribe(
  (_mutation, state) => {
    if (state.currentWorkspace == currentPath.value) return
    fillBrowser(state.currentWorkspace)
  },
  { detached: true }
)

function fillBrowser(folder: string) {
  if (store.currentWorkspace == null || store.currentWorkspace == '') return
  files.value.splice(0)
  window.api.readDir(folder).then((filePaths) =>
    filePaths.forEach((file) => {
      files.value.push(file)
    })
  )
}

onMounted(() => {
  fillBrowser(store.currentWorkspace)
})

function selectNote(file: string) {
  selected.value = file
  store.setCurrentNote(file)
}

async function deleteFile(file: string) {
  await window.api.deleteFile(store.currentWorkspace, file)
  fillBrowser(store.currentWorkspace)
}
</script>

<template>
  <article class="panel is-flex is-flex-direction-column">
    <div class="panel-block">
      <p class="control has-icons-left">
        <input class="input" type="text" placeholder="Search" />
        <span class="icon is-left">
          <i class="fas fa-search"></i>
        </span>
      </p>
      <a class="ml-2 button is-inverted is-info" @click="fillBrowser(store.currentWorkspace)">
        <span class="icon is-small">
          <i class="fas fa-sync-alt" />
        </span>
      </a>
    </div>
    <div class="file-container is-flex-grow-1">
      <a
        v-for="file of files"
        :key="file"
        class="panel-block py-1"
        :class="{ 'is-active': file === selected }"
        @click="selectNote(file)"
      >
        <span class="panel-icon">
          <i class="fas fa-book"></i>
        </span>
        <span class="is-file-name is-flex-grow-1 has-text-left">{{ file }}</span>
        <a class="icon is-small trash has-text-info" @click="deleteFile(file)"><i class="fas fa-trash"></i></a>
      </a>
    </div>
  </article>
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
</style>
