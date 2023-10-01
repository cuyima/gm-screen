<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { usePdfStore } from '@renderer/stores/PdfStore'

const emit = defineEmits(['updatePage', 'updateZoom'])
const pdfStore = usePdfStore()
const currentPage = computed(() => pdfStore.currentPage)
const pageInput = ref<number>(pdfStore.currentPage)

const currentZoom = computed(() => pdfStore.currentZoom)
const zoomInput = ref<number>(pdfStore.currentZoom * 100)
const searchString = ref<string>('')

watch(currentPage, () => {
  pageInput.value = currentPage.value
})

watch(currentZoom, () => {
  zoomInput.value = currentZoom.value * 100
})

function updatePage() {
  if (pageInput.value < 1) {
    pdfStore.currentPage
  } else if (pageInput.value > pdfStore.totalPages) {
    pdfStore.currentPage = pdfStore.totalPages
  } else {
    pdfStore.currentPage = pageInput.value
  }
  emit('updatePage')
}

function decrementPage() {
  pdfStore.currentPage = Math.max(pdfStore.currentPage - 1, 1)
  emit('updatePage')
}

function incrementPage() {
  pdfStore.currentPage = Math.min(pdfStore.currentPage + 1, pdfStore.totalPages)
  emit('updatePage')
}

function updateZoom() {
  pdfStore.currentZoom = Math.round(zoomInput.value) / 100
  emit('updateZoom')
}

function incrementZoom() {
  pdfStore.currentZoom = Math.min(pdfStore.currentZoom + 0.25, 2)
  emit('updateZoom')
}

function decrementZoom() {
  pdfStore.currentZoom = Math.max(pdfStore.currentZoom - 0.25, 0.25)
  emit('updateZoom')
}
</script>

<template>
  <div class="toolbar-container is-flex is-align-items-center mb-1 px-2">
    <div class="is-flex">
      <div class="control has-icons-left">
        <input v-model="searchString" class="input is-small" type="text" placeholder="Search" />
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
      </div>
      <div class="buttons are-small has-addons ml-1">
        <button class="button">
          <span class="icon"> <i class="fas fa-chevron-left"></i> </span>
        </button>
        <button class="button">
          <span class="icon"> <i class="fas fa-chevron-right"></i> </span>
        </button>
      </div>
    </div>
    <div class="is-flex-grow-1"></div>
    <div>
      <div class="page-control buttons has-addons are-small">
        <button
          class="button"
          :class="pdfStore.currentPage == 1 ? 'is-static' : ''"
          @click="decrementPage"
        >
          <span class="icon"> <i class="fas fa-chevron-left"></i> </span>
        </button>
        <input v-model="pageInput" class="toolbar-input button" @keydown.enter="updatePage" />
        <button
          class="button"
          :class="pdfStore.currentPage == pdfStore.totalPages ? 'is-static' : ''"
          @click="incrementPage"
        >
          <span class="icon"> <i class="fas fa-chevron-right"></i> </span>
        </button>
      </div>
    </div>
    <div class="mx-2"></div>
    <div>
      <div class="zoom-control buttons has-addons are-small">
        <button
          class="button"
          :class="pdfStore.currentZoom == 0.25 ? 'is-static' : ''"
          @click="decrementZoom"
        >
          <span class="icon"><i class="fas fa-search-minus"></i> </span>
        </button>
        <input v-model="zoomInput" class="toolbar-input button" @keydown.enter="updateZoom" />
        <button
          class="button"
          :class="pdfStore.currentZoom == 2 ? 'is-static' : ''"
          @click="incrementZoom"
        >
          <span class="icon"><i class="fas fa-search-plus"></i> </span>
        </button>
      </div>
    </div>
    <div class="is-flex-grow-3"></div>
  </div>
</template>

<style scoped>
.toolbar-input {
  width: 4.5em;
  text-align: center;
  cursor: text;
}

.toolbar-container {
  padding: 0.25rem;
}

.clear {
  right: 0;
  z-index: auto !important;
  pointer-events: auto !important;
  width: 1.5rem !important;
}
</style>
