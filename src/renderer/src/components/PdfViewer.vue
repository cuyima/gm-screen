<script setup lang="ts">
import { useWsStore } from '@renderer/stores/WorkspaceStore'
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import * as pdfjsLib from 'pdfjs-dist'
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'
import { usePdfStore } from '@renderer/stores/PdfStore'

const wsStore = useWsStore()
const pdfStore = usePdfStore()
const selectedFile = computed(() => wsStore.selectedFile)
const currentPage = computed(() => pdfStore.currentPage)
const pdfContainer = ref<HTMLDivElement>()
const pdfPages = ref<HTMLCanvasElement[]>([])
const pdfTextLayer = ref<HTMLDivElement[]>([])
const totalPages = ref<number>(0)
const isLoaded = ref<boolean>(false)

const pages: PDFPageProxy[] = []
const visiblePages: number[] = []
const scaleFactor = 1.5

let pdf: PDFDocumentProxy
let observer: IntersectionObserver

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'

onMounted(() => {
  isLoaded.value = false
  if (selectedFile.value) {
    initialLoad()
  } else {
    isLoaded.value = true
  }
})

onUnmounted(() => {
  if (pdf) unloadPdf()
  if (observer) observer.disconnect()
})

watch(selectedFile, async () => {
  isLoaded.value = false
  await unloadPdf()
  if (selectedFile.value) {
    initialLoad()
  } else {
    isLoaded.value = true
  }
})

watch(currentPage, async () => {
  renderPages(currentPage.value)
})

async function unloadPdf() {
  if (pdf) await pdf.destroy()
  if (observer) observer.disconnect()

  pdfTextLayer.value.forEach((element) => {
    while (element.firstChild) {
      element.removeChild(element.firstChild)
    }
    element.removeAttribute('style')
  })

  pdfPages.value.forEach((element) => {
    element.removeAttribute('height')
    element.removeAttribute('width')
    element.removeAttribute('style')
  })
}

async function initialLoad() {
  loadPDF()
    .then(() => {
      initializeIntersectionObserver()
      if (pdfStore.currentPage) {
        return renderPages(pdfStore.currentPage)
      } else {
        return renderPages(1)
      }
    })
    .then(() => {
      isLoaded.value = true
      let targetPage: HTMLCanvasElement
      if (pdfStore.currentPage) {
        targetPage = pdfPages.value[pdfStore.currentPage - 1]
      } else {
        targetPage = pdfPages.value[0]
      }
      if (targetPage) targetPage.scrollIntoView({ block: 'start' })
    })
}

async function loadPDF() {
  const loadingTask = pdfjsLib.getDocument(selectedFile.value)
  loadingTask.promise.then((lt) => {
    pdf = lt
    totalPages.value = pdf.numPages
    return createPages()
  })
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

    const viewport = page.getViewport({ scale: scaleFactor })
    canvas.height = viewport.height
    canvas.width = viewport.width

    pdfPages.value.push(canvas)
    pages.push(page)
  }
}

async function renderPages(pageNumber: number) {
  const buffer = calculateBufferRange(pageNumber)
  await renderPagesInsideBuffer(buffer)
  await unrenderPagesOutsideBuffer(buffer)
}

async function renderPage(pageNumber: number) {
  const page = pages[pageNumber]
  if (!page) return

  console.log(`Rendering page ${pageNumber}`)
  const canvas = pdfPages.value[pageNumber - 1]
  const context = canvas.getContext('2d')
  if (!context) return

  const viewport = page.getViewport({ scale: scaleFactor })
  const renderContext = {
    canvasContext: context,
    viewport: viewport
  }
  const renderTask = page.render(renderContext)

  renderTask.promise
    .then(() => {
      return page.getTextContent()
    })
    .then((textContent) => {
      const textLayer = pdfTextLayer.value[pageNumber - 1]
      textLayer.style.left = canvas.offsetLeft + 'px'
      textLayer.style.top = canvas.offsetTop + 'px'
      textLayer.style.height = canvas.offsetHeight + 'px'
      textLayer.style.width = canvas.offsetWidth + 'px'

      return pdfjsLib.renderTextLayer({
        textContentSource: textContent,
        container: textLayer,
        viewport: viewport,
        textDivs: []
      })
    })
  visiblePages.push(pageNumber)
}

async function unrenderPage(pageNumber: number) {
  const page = pages[pageNumber]
  if (!page) return
  console.log(`Unrendering page ${pageNumber}`)
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
        pdfStore.currentPage = pageNumber
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

async function unrenderPagesOutsideBuffer(bufferRange: { startPage: number; endPage: number }) {
  const { startPage, endPage } = bufferRange
  const currentPages = visiblePages

  currentPages.forEach(async (pageNumber) => {
    if (pageNumber < startPage || pageNumber > endPage) await unrenderPage(pageNumber)
  })
}

async function renderPagesInsideBuffer(bufferRange: { startPage: number; endPage: number }) {
  const { startPage, endPage } = bufferRange
  for (let pageNumber = startPage; pageNumber <= endPage; pageNumber++) {
    if (!visiblePages.includes(pageNumber)) await renderPage(pageNumber)
  }
}
</script>

<template>
  <div>{{ currentPage }}</div>
  <div
    class="outer-container is-flex-grow-1 is-flex is-justify-content-center"
    :class="!isLoaded ? 'is-invisible' : ''"
  >
    <div ref="pdfContainer" class="viewer" :style="'--scale-factor:' + scaleFactor">
      <div v-for="pageNumber in totalPages" :key="pageNumber" class="page-container">
        <canvas ref="pdfPages" class="page-canvas" :data-page="pageNumber"></canvas>
        <div ref="pdfTextLayer" class="text-layer"></div>
      </div>
    </div>
  </div>
  <div v-show="!isLoaded" class="pageloader is-active">
    <progress class="progress is-primary" max="100"></progress>
  </div>
</template>

<style scoped>
.is-invisible {
  display: none !important;
}
.outer-container {
  overflow: auto;
  height: 1em;
}

.pageloader {
  height: 1em;
}

.viewer::-webkit-scrollbar {
  width: auto;
}

/* TODO: Move to own file */
* {
  padding: 0;
  margin: 0;
}

.page-container {
  direction: ltr;
  position: relative;
  overflow: visible;
  background-clip: content-box;
  background-color: rgba(255, 255, 255, 1);
}

.page-canvas {
  user-select: none;
}

.text-layer {
  position: absolute;
  text-align: initial;
  inset: 0;
  overflow: hidden;
  opacity: 0.25;
  line-height: 1;
  text-size-adjust: none;
  forced-color-adjust: none;
  transform-origin: 0 0;
  z-index: 2;
}

.text-layer :is(span, br) {
  color: transparent;
  position: absolute;
  white-space: pre;
  cursor: text;
  transform-origin: 0% 0%;
}

.text-layer span.markedContent {
  top: 0;
  height: 0;
}
.text-layer br::selection {
  background: transparent;
}

.text-layer ::selection {
  background: rgba(0, 0, 255, 1);
}
</style>
