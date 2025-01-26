export type PluginBuilderOptions = Readonly<{
  baseDir: string // Plugin's __dirname
  bundleDependencies?: boolean
  distDir?: string // Relative to project root
  dtoPath?: string
  external?: Array<string>
  minify?: boolean
  onAfterBuild?: (targetDir: string) => void
  pluginEntry?: string
  pluginName: string
  watchPattern?: RegExp
}>

export declare class PluginBuilder {
  constructor(options: PluginBuilderOptions)
  public build(): Promise<void>
  public clean(): Promise<void>
  public watch(): Promise<void>
}
