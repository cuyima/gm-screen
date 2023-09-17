export interface FileSystemAPI {
  readFileString(filePath: string, fileName: string): Promise<string>
  readDir(filePath: string): Promise<string[]>
  pathToFileURL(filePath: string): string
}
