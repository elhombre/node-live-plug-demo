export type PluginBuilderOptions = Readonly<{
  baseDir: string // Plugin's __dirname
  bundleDependencies?: boolean
  distDir?: string // Relative to project root
  dtoPath?: string
  minify?: boolean
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
