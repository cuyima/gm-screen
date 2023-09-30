<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import showdown from 'showdown'
import { useWsStore } from '@renderer/stores/WorkspaceStore'
const store = useWsStore()

const currentNote = computed(() => store.currentNote)
const noteContent = ref<string>('')
const noteHtml = computed(() => converter.makeHtml(noteContent.value))
const noteTitle = ref<string>('')
const isActive = ref(false)
const textArea = ref<HTMLDivElement>()
const converter = new showdown.Converter()

onMounted(() => {
  openNote(currentNote.value)
})

watch(currentNote, () => {
  openNote(currentNote.value)
})

async function openNote(path: string) {
  if (path == '') clearNote()
  const fileBuffer = await window.api.readFileString(store.currentWorkspace, path)
  noteContent.value = fileBuffer.toString()
  const index = path.lastIndexOf('.')
  if (index != -1) {
    noteTitle.value = path.substring(0, index)
  } else {
    noteTitle.value = path
  }
}

function clearNote() {
  noteContent.value = ''
  noteTitle.value = ''
}

function focusText() {
  isActive.value = true
  nextTick(() => {
    textArea.value?.focus()
  })
}

async function unfocusText() {
  if (isActive.value == true) {
    await saveFile()
  }
  isActive.value = false
}

async function saveFile() {
  const currentDate = new Date().toISOString().replace(/[:.T]/g, '-').slice(0, -5)
  const title = noteTitle.value.trim() == '' ? currentDate : noteTitle.value
  await window.api.saveFile(store.currentWorkspace, {
    title: title + '.md',
    content: noteContent.value
  })
  store.currentNote = title + '.md'
}

async function createNew() {
  await saveFile()
  openNote('')
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
        @keyup.ctrl.enter="saveFile"
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
      @keyup.ctrl.enter="unfocusText()"
      @focusout="unfocusText()"
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
  overflow: auto;
}

.textarea:not([rows]) {
  max-height: unset;
}
</style>
