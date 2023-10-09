import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import { Ref } from 'vue'

export async function createPages(
  pdf: PDFDocumentProxy,
  pages: PDFPageProxy[],
  pdfPages: Ref<HTMLCanvasElement[]>
) {
  if (!pdf) return
  pages.length = 0
  const totalPages = pdf.numPages
  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    if (!page) continue

    const canvas = pdfPages[pageNumber - 1]
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

export function calculateBufferRange(pageNumber: number, totalPages: Ref<number>) {
  const buffer = 5
  const startPage = Math.max(pageNumber - buffer, 1)
  const endPage = Math.min(pageNumber + buffer, totalPages.value)
  return { startPage, endPage }
}

export async function loadPage(
  pageNumber: number,
  pages: PDFPageProxy,
  pdfPages: Ref<HTMLCanvasElement[]>,
  visiblePages: number[]
) {
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

export async function unloadPage(
  pageNumber: number,
  pages: PDFPageProxy,
  pdfPages: Ref<HTMLCanvasElement[]>,
  visiblePages: number[]
) {
  const page = pages[pageNumber]
  if (!page) return
  page.cleanup()
  const canvas = pdfPages.value[pageNumber]
  if (!canvas) return
  const context = canvas.getContext('2d')
  if (context) context.clearRect(0, 0, canvas.width, canvas.height)
  visiblePages.slice(visiblePages.indexOf(pageNumber))
}
