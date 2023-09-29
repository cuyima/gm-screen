import { PDFPageProxy } from 'pdfjs-dist'
import { TextContent, TextItem } from 'pdfjs-dist/types/src/display/api'

export function renderTextOnCanvas(canvas: HTMLCanvasElement, textContent: TextContent) {
  const context = canvas.getContext('2d')

  if (!context) return
  context.font = '12px Arial'
  context.fillStyle = 'black'

  textContent.items.forEach((textItem) => {
    if (textItem.constructor.name == 'TextMarkedContent') return
    const { str, transform } = textItem as TextItem
    const [x, y] = transform
    context.fillText(str, x, y)
  })
}

export async function parseTextContent(page: PDFPageProxy) {
  const textContent = await page.getTextContent()
  return textContent.items
}
