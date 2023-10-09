import { PDFPageProxy } from 'pdfjs-dist'
import { TextItem } from 'pdfjs-dist/types/src/display/api'

export async function renderTextOnCanvas(canvas: HTMLCanvasElement, page: PDFPageProxy) {
  const context = canvas.getContext('2d')

  if (!context) return
  context.font = '12px Arial'
  context.fillStyle = 'black'

  const textContent = await page.getTextContent()

  textContent.items.forEach((textItem) => {
    const { str, transform } = textItem as TextItem
    const [x, y] = transform
    context.fillText(str, x, y)
  })
}
