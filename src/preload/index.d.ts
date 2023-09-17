import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      readDir(path: string): Promise<string[]>
      pathToFileURL(path: string): string
      readFile(path: string, file: string): Promise<Buffer>
    }
  }
}
