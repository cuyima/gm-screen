<script setup lang="ts">
import { useWsStore } from '@renderer/stores/WorkspaceStore'
import * as pdfjsLib from 'pdfjs-dist'
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'
import { usePdfStore } from '@renderer/stores/PdfStore'
import Loader from './Loader.vue'
import { PdfDocument } from '../pdf-utils/PdfDocument'
import * as pdfDocUtils from '../pdf-utils/PdfDocument'

const wsStore = useWsStore()
const pdfStore = usePdfStore()
const selectedFile = computed(() => wsStore.selectedFile)
const totalPages = computed(() => pdfStore.totalPages)
const pdfContainer = ref<HTMLDivElement>()
const pdfPages = ref<HTMLCanvasElement[]>([])
const pdfTextLayer = ref<HTMLDivElement[]>([])
const isLoaded = ref<boolean>(false)

const scaleFactor = computed(() => pdfStore.currentZoom)

let pdf: PdfDocument
let observer: IntersectionObserver

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'

onMounted(() => {
  isLoaded.value = false
  if (selectedFile.value) {
    pdfDocUtils.createDocument(selectedFile.value)
  } else {
    isLoaded.value = true
  }
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})

watch(selectedFile, async () => {})
</script>

<template>
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
  <Loader :class="isLoaded ? 'is-invisible' : ''" />
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
</style>
