<script setup lang="ts">
import { useWsStore } from '@renderer/stores/WorkspaceStore'
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import * as pdfjsLib from 'pdfjs-dist'
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'
import { usePdfStore } from '@renderer/stores/PdfStore'
import Loader from './Loader.vue'
import PdfToolbar from './PdfToolbar.vue'

const wsStore = useWsStore()
const pdfStore = usePdfStore()
const selectedFile = computed(() => wsStore.selectedFile)
const currentPageBuffer = computed(() => calculateBufferRange(pdfStore.currentPage))
const totalPages = computed(() => pdfStore.totalPages)
const isTwoPageMode = computed(() => pdfStore.isTwoPageMode)
const pdfContainer = ref<HTMLDivElement>()
const pdfPages = ref<HTMLCanvasElement[]>([])
const pdfTextLayer = ref<HTMLDivElement[]>([])
const isLoaded = ref<boolean>(false)

const groupedPageContainers = computed(() => {
  // Calculate grouped page containers based on isGrouped condition
  if (isTwoPageMode.value) {
    // Group pages in twos
    const pages = totalPages
    const groups: number[][] = []
    for (let i = 0; i < pages.value; i += 2) {
      const group: number[] = []
      if (i < pages.value) {
        group.push(i + 1) // Add first page of the pair
      }
      if (i + 1 < pages.value) {
        group.push(i + 2) // Add second page of the pair
      }
      groups.push(group)
    }
    return groups
  } else {
    // Not grouped, each page is in its own group
    const pages: number[] = []
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
    return pages
  }
})

const pages: PDFPageProxy[] = []
const visiblePages: number[] = []
const scaleFactor = computed(() => pdfStore.currentZoom)

let pdf: PDFDocumentProxy
let observer: IntersectionObserver
let isRenderScheduled = false

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

watch(currentPageBuffer, async () => {
  bufferPages()
})

function scrollToPage() {
  const element: HTMLCanvasElement = pdfPages.value[pdfStore.currentPage - 1]
  element.scrollIntoView({ block: 'start' })
}

async function unloadPdf() {
  if (pdf) await pdf.destroy()
  if (observer) observer.disconnect()
  visiblePages.length = 0
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
  pdfStore.currentZoom = 1.5
  await loadPDF()
  initializeIntersectionObserver()
  if (pdfStore.currentPage) {
    await bufferPages()
  } else {
    pdfStore.currentPage = 1
  }

  isLoaded.value = true

  let targetPage: HTMLCanvasElement
  if (pdfStore.currentPage) {
    targetPage = pdfPages.value[pdfStore.currentPage - 1]
  } else {
    targetPage = pdfPages.value[0]
  }
  if (targetPage) targetPage.scrollIntoView({ block: 'start' })
}

async function loadPDF() {
  const loadingTask = pdfjsLib.getDocument(selectedFile.value)
  pdf = await loadingTask.promise
  pdfStore.totalPages = pdf.numPages
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
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) continue

    const viewport = page.getViewport({ scale: scaleFactor.value })
    canvas.height = viewport.height
    canvas.width = viewport.width

    pdfPages.value.push(canvas)
    pages.push(page)
  }
}

async function bufferPages() {
  if (isRenderScheduled) return
  isRenderScheduled = true
  setTimeout(async () => {
    console.log(
      `Rendering pages ${currentPageBuffer.value.startPage} to ${currentPageBuffer.value.endPage}`
    )
    const buffer = currentPageBuffer.value
    await unrenderPagesOutsideBuffer(buffer)
    await renderPagesInsideBuffer(buffer)
    isRenderScheduled = false
  }, 500)
}

async function renderPage(pageNumber: number) {
  const page = pages[pageNumber - 1]
  if (!page) return

  //console.log(`Rendering page ${pageNumber}`)
  const canvas = pdfPages.value[pageNumber - 1]
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return

  const viewport = page.getViewport({ scale: scaleFactor.value })
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
  const page = pages[pageNumber - 1]
  if (!page) return
  //console.log(`Unrendering page ${pageNumber}`)
  page.cleanup()
  const canvas = pdfPages.value[pageNumber]
  if (!canvas) return
  const context = canvas.getContext('2d')
  if (context) context.clearRect(0, 0, canvas.width, canvas.height)
  visiblePages.splice(visiblePages.indexOf(pageNumber), 1)
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
    { threshold: 0.5 }
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

  const currentPages = visiblePages
  for (let pageNumber = startPage; pageNumber <= endPage; pageNumber++) {
    if (!currentPages.includes(pageNumber)) await renderPage(pageNumber)
  }
}

async function redraw() {
  await createPages()
  visiblePages.forEach((pageNumber) => {
    const page = pages[pageNumber - 1]
    if (!page) return

    //console.log(`Rendering page ${pageNumber}`)
    const canvas = pdfPages.value[pageNumber - 1]
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return

    const viewport = page.getViewport({ scale: scaleFactor.value })
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    }
    page.render(renderContext)
  })
}
</script>

<template>
  <div class="box is-flex is-flex-grow-1 is-flex-direction-column p-1">
    <div
      class="outer-container is-flex-grow-1 is-flex is-justify-content-center"
      :class="!isLoaded ? 'is-invisible' : ''"
    >
      <div ref="pdfContainer" class="viewer" :style="'--scale-factor:' + scaleFactor">
        <div
          v-for="(group, groupIndex) in groupedPageContainers"
          :key="groupIndex"
          class="page-group"
        >
          <!-- Render two page containers within each group -->
          <div v-for="pageNumber in group" :key="pageNumber" class="page-container">
            <canvas ref="pdfPages" class="page-canvas" :data-page="pageNumber"></canvas>
            <div ref="pdfTextLayer" class="text-layer"></div>
          </div>
        </div>
      </div>
      <Loader :class="isLoaded ? 'is-invisible' : ''" />
    </div>
  </div>
  <PdfToolbar @update-page="scrollToPage" @update-zoom="redraw" @update-page-mode="redraw" />
</template>

<style scoped lang="scss">
@import '../assets/css/pdf-viewer.scss';
.is-invisible {
  display: none !important;
}
.outer-container {
  overflow: auto;
  height: 1em;
}
.box:not(:last-child) {
  margin-bottom: unset;
}
</style>
