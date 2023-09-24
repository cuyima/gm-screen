<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import showdown from 'showdown'
import { useWsStore } from '@renderer/stores/WorkspaceStore'
const store = useWsStore()

const currentNotePath = ref('')
const text = ref('')
const html = ref('')
const converter = new showdown.Converter()
const isActive = ref(false)
const textArea = ref<HTMLDivElement>()

onMounted(() => {
  transformInput()
})

store.$subscribe(
  (_mutation, state) => {
    if (state.currentNote == currentNotePath.value) return
    openNote(state.currentNote)
  },
  { detached: true }
)

async function openNote(path: string) {
  const fileBuffer = await window.api.readFileString(store.currentWorkspace, path)
  text.value = fileBuffer.toString()
  transformInput()
}

function transformInput() {
  html.value = converter.makeHtml(text.value)
}

function focusText() {
  isActive.value = true
  nextTick(() => {
    textArea.value?.focus()
  })
}

function unfocusText() {
  isActive.value = false
  if (text.value != '') {
    //todo: save document
  }
}

function createNew() {
  unfocusText()
  focusText()
  text.value = ''
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

  text.value = newValue
  element.selectionStart = element.selectionEnd = selectionStart ?? 0 + 1
}
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->
  <div class="box is-flex is-flex-grow-1 is-flex-direction-column mb-2">
    <div class="is-flex mb-2">
      <input class="input is-flex-grow-1 mr-1" type="text" placeholder="Title" tabindex="0" />
      <button class="button mx-1" @click="createNew">New</button>
      <button class="button" :disabled="!isActive" @click="unfocusText">Save</button>
    </div>
    <textarea
      v-show="isActive"
      ref="textArea"
      v-model="text"
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
      v-html="html"
    />
  </div>
</template>

<style scoped>
.box {
  text-align: left;
}

.textarea {
  overflow: scroll;
}

.textarea:not([rows]) {
  max-height: unset;
}
</style>
