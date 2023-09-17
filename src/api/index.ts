import * as fs from 'fs/promises'
import * as path from 'path'
import { FileSystemAPI } from './types'
import { pathToFileURL } from 'url'
const allowedExtensions = ['.txt', '.md']

export type { FileSystemAPI } from './types'

export const fileSystemAPI: FileSystemAPI = {
  readFileString: async function (filePath: string, fileName: string): Promise<string> {
    if (allowedExtensions.indexOf(path.extname(fileName).toLowerCase()) != -1) return ''
    try {
      return (await fs.readFile(path.join(filePath, fileName), { encoding: 'utf8' })).toString()
    } catch (err) {
      console.error(err)
      return ''
    }
  },
  readDir: async function (filePath: string): Promise<string[]> {
    return await fs.readdir(filePath)
  },
  pathToFileURL: function (path: string): string {
    return pathToFileURL(path).href
  }
}
