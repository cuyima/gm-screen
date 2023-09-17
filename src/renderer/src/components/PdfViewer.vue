<script setup lang="ts">
import { onMounted, onUpdated, ref } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import PdfViewerPage from '@renderer/PdfViewerPage.vue'
import { PDFPageProxy } from 'pdfjs-dist/types/src/display/api'

const props = defineProps<{ url: string }>()
const totalPages = ref<number>(0)
const pages: PDFPageProxy[] = []
const scale = 1.5

onMounted(async () => {
  loadPdf()
})
onUpdated(async () => {
  loadPdf()
})

async function loadPdf() {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '../node_modules/pdfjs-dist/build/pdf.worker.js'
  try {
    const loadingTask = pdfjsLib.getDocument(props.url)
    const pdf = await loadingTask.promise
    for (let pageNumber = 1; pageNumber <= totalPages.value; pageNumber++) {
      pdf.getPage(pageNumber).then(function (page) {
        pages.push(page)
      })
    }
    totalPages.value = pdf.numPages
  } catch (error) {
    console.error('Error loading PDF:', error)
  }
}
</script>

<template>
  <div class="viewer is-flex-grow-1">
    <div v-for="pageNumber in totalPages" :key="pageNumber" class="page-container">
      <PdfViewerPage :page="pages[pageNumber - 1]" :scale="scale" />
    </div>
  </div>
</template>

<style scoped>
.viewer {
  overflow: scroll;
}
</style>
