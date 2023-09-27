<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import showdown from 'showdown'
import { useWsStore } from '@renderer/stores/WorkspaceStore'
const store = useWsStore()

const currentNote = ref<string>('')
const noteContent = ref<string>('')
const noteTitle = ref<string>('')
const noteHtml = ref<string>('')
const isActive = ref(false)
const textArea = ref<HTMLDivElement>()
const converter = new showdown.Converter()

onMounted(() => {
  openNote(store.currentNote)
})

store.$subscribe(
  (_mutation, state) => {
    if (state.currentNote == currentNote.value) return
    openNote(state.currentNote)
  },
  { detached: true }
)

async function openNote(path: string) {
  const fileBuffer = await window.api.readFileString(store.currentWorkspace, path)
  noteContent.value = fileBuffer.toString()
  const index = path.lastIndexOf('.')
  if (index != -1) {
    noteTitle.value = path.substring(0, index)
  } else {
    noteTitle.value = path
  }
  transformInput()
}

function transformInput() {
  noteHtml.value = converter.makeHtml(noteContent.value)
}

function focusText() {
  isActive.value = true
  nextTick(() => {
    textArea.value?.focus()
  })
}

function unfocusText() {
  isActive.value = false
  if (noteContent.value != '') {
    saveFile()
  }
}

async function saveFile() {
  const currentDate = new Date().toISOString().replace(/[:.T]/g, '-').slice(0, -5)
  const title = noteTitle.value.trim() == '' ? currentDate : noteTitle.value
  noteTitle.value = title
  await window.api.saveFile(store.currentWorkspace, {
    title: title + '.md',
    content: noteContent.value
  })
}

function createNew() {
  unfocusText()
  focusText()
  noteContent.value = ''
  noteTitle.value = ''
  transformInput()
}

function insertTab(event: Event) {
  const element = event.target as HTMLInputElement
  const { selectionStart, selectionEnd } = element
  const tabCharacter = '\t'

  const newValue =
    element.value.substring(0, selectionStart ?? 0) +
    tabCharacter +
    element.value.substring(selectionEnd ?? 0)

  noteContent.value = newValue
  element.selectionStart = element.selectionEnd = selectionStart ?? 0 + 1
}
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->
  <div class="box is-flex is-flex-grow-1 is-flex-direction-column mb-2">
    <div class="is-flex mb-2">
      <input
        v-model="noteTitle"
        class="input is-flex-grow-1 mr-2 is-family-secondary"
        type="text"
        placeholder="Title"
        tabindex="0"
      />
      <button class="button" @click="createNew">
        <span class="icon is-small"> <i class="fas fa-plus"></i></span>
        <span class="is-family-secondary">Create</span>
      </button>
    </div>
    <textarea
      v-show="isActive"
      ref="textArea"
      v-model="noteContent"
      class="textarea has-fixed-size is-flex-grow-1 content mb-0"
      placeholder="# Notes"
      @input="transformInput"
      @keyup.ctrl.enter="unfocusText"
      @focusout="unfocusText"
      @keydown.tab.prevent="insertTab"
    />
    <div
      v-show="!isActive"
      class="textarea has-fixed-size is-flex-grow-1 content overflow"
      tabindex="0"
      @dblclick="focusText"
      @keydown="focusText"
      v-html="noteHtml"
    />
  </div>
</template>

<style scoped>
.textarea {
  overflow: scroll;
}

.textarea:not([rows]) {
  max-height: unset;
}
</style>
