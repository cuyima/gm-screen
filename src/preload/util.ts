import * as fs from 'fs/promises'
import * as path from 'path'
const allowedExtensions = ['.txt', '.md', '.pdf']

export async function readFile(filePath: string, fileName: string) {
  try {
    return await fs.readFile(path.join(filePath, fileName), { encoding: 'utf8' })
  } catch (err) {
    console.error(err)
    return ''
  }
}

export async function readDir(filePath: string) {
  return (await fs.readdir(filePath)).filter(
    (fileName) => allowedExtensions.indexOf(path.extname(fileName).toLowerCase()) != -1
  )
}
