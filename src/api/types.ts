export interface FileSystemAPI {
  readFileString(filePath: string, fileName: string): Promise<string>
  readDir(filePath: string): Promise<string[]>
  pathToFileURL(filePath: string): string
  saveFile(
    filePath: string,
    file: { title: string | undefined; content: string | undefined }
  ): Promise<void>
  deleteFile(filePath: string, fileName: string): Promise<void>
}
