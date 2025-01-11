export interface IPlugin {
  load(): Promise<void>
  process(dto: PluginDtoBase): Promise<string>
  unload(): Promise<void>
}

export type PluginDtoBase = Readonly<{
  action: string
}>
