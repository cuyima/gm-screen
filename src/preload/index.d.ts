import { ElectronAPI } from '@electron-toolkit/preload'
import { FileSystemAPI } from '../api'

declare global {
  interface Window {
    electron: ElectronAPI
    api: FileSystemAPI
  }
}
