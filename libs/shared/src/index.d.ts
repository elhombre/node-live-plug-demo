export interface IPlugin {
  load(): void
  process(): string
  unload(): void
}
