export interface FileSystemAPI {
  readFileString(filePath: string, fileName: string): Promise<string>
  readDir(filePath: string): Promise<string[]>
  pathToFileURL(filePath: string): string
  saveFile(filePath: string, file: { title: string; content: string }): Promise<void>
  deleteFile(filePath: string, fileName: string): Promise<void>
  getHash(dataArray: Uint8Array): string
}
