<script setup lang="ts">
import { ref, onRenderTriggered } from 'vue'
import { PDFPageProxy } from 'pdfjs-dist'

const props = defineProps<{ page: PDFPageProxy; scale: number }>()
const pdfCanvas = ref<HTMLCanvasElement>()
const height = ref<number>()
const width = ref<number>()
const isReady = ref(false)

onRenderTriggered(async () => {
  if (props.page && pdfCanvas.value) {
    const canvas = pdfCanvas.value
    const context = canvas.getContext('2d')
    const viewport = props.page.getViewport({ scale: props.scale })
    height.value = viewport.height
    width.value = viewport.width

    if (!context) return

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    }
    const renderTask = props.page.render(renderContext)
    renderTask.promise.then(function () {
      isReady.value = true
    })
  }
})
</script>

<template>
  <canvas v-if="isReady" ref="pdfCanvas" class="page" :width="width" :height="height"></canvas>
  <div v-else>Loading...</div>
</template>
