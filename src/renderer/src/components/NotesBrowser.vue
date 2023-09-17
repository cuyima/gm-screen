<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWsStore } from '@renderer/stores/WorkspaceStore'
const store = useWsStore()

const currentPath = ref<string>('')
const selected = ref('')
const files = ref<string[]>([])

store.$subscribe(
  (_mutation, state) => {
    if (state.workspace == currentPath.value) return
    fillBrowser(state.workspace)
  },
  { detached: true }
)

function fillBrowser(folder: string) {
  if (store.workspace == null || store.workspace == '') return
  files.value.splice(0)
  window.api.readDir(folder).then((filePaths) =>
    filePaths.forEach((file) => {
      files.value.push(file)
    })
  )
}

onMounted(() => {
  fillBrowser(store.workspace)
})

function selectNote(file: string) {
  selected.value = file
  store.setCurrentNotePath(file)
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
      <a class="ml-2 button is-inverted is-info" @click="fillBrowser(store.workspace)">
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
        <span class="is-file-name">{{ file }}</span>
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
</style>
