export declare type PluginBuilderOptions = Readonly<{
  baseDir: string
  distDir: string
  pluginEntry?: string
  pluginName: string
  watchPattern?: RegExp
}>

export declare class PluginBuilder {
  constructor(options: PluginBuilderOptions)
  public build(): Promise<void>
  public watch(): Promise<void>
}
