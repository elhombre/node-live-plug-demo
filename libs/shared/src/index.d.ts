export interface IPlugin {
  load(): void
  process(dto: PluginDtoBase): string
  unload(): void
}

export type PluginDtoBase = Readonly<{
  action: string
}>
