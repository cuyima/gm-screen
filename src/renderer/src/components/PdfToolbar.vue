<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { usePdfStore } from '@renderer/stores/PdfStore'

const emit = defineEmits(['updatePage', 'updateZoom', 'updatePageMode'])
const pdfStore = usePdfStore()
const currentPage = computed(() => pdfStore.currentPage)
const pageInput = ref<number>(pdfStore.currentPage)

const currentZoom = computed(() => pdfStore.currentZoom)
const zoomInput = ref<number>(pdfStore.currentZoom * 100)
const isTwoPageMode = computed(() => pdfStore.isTwoPageMode)
//const searchString = ref<string>('')

const maxZoom = 5
const minZoom = 0.25

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
  pdfStore.currentZoom = Math.min(pdfStore.currentZoom + 0.25, maxZoom)
  emit('updateZoom')
}

function decrementZoom() {
  pdfStore.currentZoom = Math.max(pdfStore.currentZoom - 0.25, minZoom)
  emit('updateZoom')
}

function updatePageMode() {
  pdfStore.isTwoPageMode = !pdfStore.isTwoPageMode
  emit('updatePageMode')
}
</script>

<template>
  <div
    class="box is-flex-grow-1 is-flex is-flex-direction-column is-align-items-center is-justify-content-space-between py-1 p-0 m-0"
  >
    <button class="button is-activity">
      <span class="icon fa-lg"><i class="fas fa-search"></i> </span>
    </button>
    <hr class="my-0" />
    <div class="is-flex is-flex-direction-column">
      <button
        class="button is-activity"
        :class="pdfStore.currentPage == 1 ? 'is-static' : ''"
        @click="decrementPage"
      >
        <span class="icon fa-lg"> <i class="fas fa-chevron-up"></i> </span>
      </button>
      <input v-model="pageInput" class="toolbar-input button p-0" @keydown.enter="updatePage" />
      <div class="has-text-centered is-size-6 mt-2">{{ pdfStore.totalPages }}</div>
      <button
        class="button is-activity"
        :class="pdfStore.currentPage == pdfStore.totalPages ? 'is-static' : ''"
        @click="incrementPage"
      >
        <span class="icon fa-lg"> <i class="fas fa-chevron-down"></i> </span>
      </button>
    </div>
    <hr class="my-0" />
    <div class="is-flex is-flex-direction-column">
      <button
        class="button is-activity"
        :class="pdfStore.currentZoom == maxZoom ? 'is-static' : ''"
        @click="incrementZoom"
      >
        <span class="icon fa-lg"><i class="fas fa-search-plus"></i> </span>
      </button>
      <input v-model="zoomInput" class="toolbar-input button p-0" @keydown.enter="updateZoom" />
      <button
        class="button is-activity"
        :class="pdfStore.currentZoom == minZoom ? 'is-static' : ''"
        @click="decrementZoom"
      >
        <span class="icon fa-lg"><i class="fas fa-search-minus"></i> </span>
      </button>
    </div>
    <hr class="my-0" />
    <button class="button is-activity" @click="updatePageMode">
      <span class="icon fa-lg">
        <i v-if="isTwoPageMode" class="fas fa-columns"></i>
        <i v-else class="far fa-window-maximize"></i>
      </span>
    </button>
    <div class="spacer is-flex-grow-1"></div>
  </div>
</template>

<style scoped>
.toolbar-input {
  width: 2.5em;
  height: 2.5em;
  text-align: center;
  cursor: text;
  align-self: center;
}

.box {
  width: 2.5em;
}
hr {
  width: 100%;
}
</style>
