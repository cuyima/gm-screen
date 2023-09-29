<script setup lang="ts">
import { useWsStore } from '@renderer/stores/WorkspaceStore'
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import * as pdfjsLib from 'pdfjs-dist'
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'

const store = useWsStore()
const selectedFile = computed(() => store.selectedFile)
const pdfContainer = ref<HTMLDivElement>()
const pdfPages = ref<HTMLCanvasElement[]>([])
const totalPages = ref<number>(0)
const pages: PDFPageProxy[] = []
const currentPage = ref<number>(0)

const visiblePages: number[] = []

let pdf: PDFDocumentProxy
let observer: IntersectionObserver

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'

watch(selectedFile, async () => {
  if (pdf) await pdf.destroy()
  if (observer) observer.disconnect()
  await loadPDF()
  initializeIntersectionObserver()
})

onMounted(async () => {
  if (selectedFile.value) await loadPDF()
  initializeIntersectionObserver()
})

onUnmounted(() => {
  if (pdf) pdf.destroy()
  if (observer) observer.disconnect()
})

async function loadPDF() {
  const loadingTask = pdfjsLib.getDocument(selectedFile.value)
  pdf = await loadingTask.promise
  totalPages.value = pdf.numPages
  await createPages()
}

async function createPages() {
  if (!pdf) return
  pages.length = 0
  for (let pageNumber = 1; pageNumber <= totalPages.value; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    if (!page) continue

    const canvas = pdfPages.value[pageNumber - 1]
    if (!canvas) continue
    const context = canvas.getContext('2d')
    if (!context) continue

    const viewport = page.getViewport({ scale: 1.5 })
    canvas.height = viewport.height
    canvas.width = viewport.width

    pdfPages.value.push(canvas)
    pages.push(page)
  }
}

async function loadPage(pageNumber: number) {
  const page = pages[pageNumber]
  if (!page) return

  const canvas = pdfPages.value[pageNumber - 1]
  const context = canvas.getContext('2d')
  if (!context) return

  const viewport = page.getViewport({ scale: 1.5 })
  const renderContext = {
    canvasContext: context,
    viewport: viewport
  }
  page.render(renderContext)
  visiblePages.push(pageNumber)
}

async function unloadPage(pageNumber: number) {
  const page = pages[pageNumber]
  if (!page) return
  page.cleanup()
  const canvas = pdfPages.value[pageNumber]
  if (!canvas) return
  const context = canvas.getContext('2d')
  if (context) context.clearRect(0, 0, canvas.width, canvas.height)
  visiblePages.slice(visiblePages.indexOf(pageNumber))
}

function initializeIntersectionObserver() {
  const container = pdfContainer.value
  if (!container) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(async (entry) => {
        if (!entry.isIntersecting) return
        const page = entry.target as HTMLCanvasElement
        const attr = page.getAttribute('data-page')
        if (!attr) return
        const pageNumber = parseInt(attr, 10)
        currentPage.value = pageNumber
        const bufferRange = calculateBufferRange(pageNumber)

        await unloadPagesOutsideBuffer(bufferRange)
        await loadPagesInsideBuffer(bufferRange)
      })
    },
    { threshold: 0 }
  )

  pdfPages.value.forEach((page) => {
    observer.observe(page)
  })
}

function calculateBufferRange(pageNumber: number) {
  const buffer = 5
  const startPage = Math.max(pageNumber - buffer, 1)
  const endPage = Math.min(pageNumber + buffer, totalPages.value)
  return { startPage, endPage }
}

async function unloadPagesOutsideBuffer(bufferRange: { startPage: number; endPage: number }) {
  const { startPage, endPage } = bufferRange
  const currentPages = visiblePages

  currentPages.forEach(async (pageNumber) => {
    if (pageNumber < startPage || pageNumber > endPage) await unloadPage(pageNumber)
  })
}

async function loadPagesInsideBuffer(bufferRange: { startPage: number; endPage: number }) {
  const { startPage, endPage } = bufferRange
  for (let pageNumber = startPage; pageNumber <= endPage; pageNumber++) {
    if (!visiblePages.includes(pageNumber)) await loadPage(pageNumber)
  }
}
</script>

<template>
  <div>{{ currentPage }}</div>
  <div ref="pdfContainer" class="viewer is-flex-grow-1">
    <div v-for="pageNumber in totalPages" :key="pageNumber">
      <canvas ref="pdfPages" class="page-canvas" :data-page="pageNumber"></canvas>
    </div>
  </div>
</template>

<style scoped>
.viewer {
  overflow: scroll;
  height: 1em;
}

.viewer::-webkit-scrollbar {
  width: auto;
}
</style>
