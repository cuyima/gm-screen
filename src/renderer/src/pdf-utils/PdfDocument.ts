import { PDFDocumentProxy } from 'pdfjs-dist'
import * as pdfjsLib from 'pdfjs-dist'

export class PdfDocument {
  private _doc: PDFDocumentProxy | undefined
  private _hash: string | undefined
  private _pages: number | undefined

  static async createAsync(documentUrl: string): Promise<PdfDocument> {
    const instance = new PdfDocument()
    const loadingTask = pdfjsLib.getDocument(documentUrl)
    instance._doc = await loadingTask.promise
    instance._pages = instance._doc.numPages
    instance._hash = await generateHash(instance._doc)

    return instance
  }

  getDocument() {
    return this._doc
  }
  getHash() {
    return this._hash
  }
  getPages() {
    return this._pages
  }
}

export async function createDocument(documentUrl: string): Promise<PdfDocument> {
  return await PdfDocument.createAsync(documentUrl)
}

async function generateHash(doc: PDFDocumentProxy): Promise<string> {
  return window.api.getHash(await doc.getData())
}
