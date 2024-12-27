export default class Plugin {
  private version = '0.1'

  public load() {
    console.log('sample plugin loaded')
  }

  public unload() {
    console.log('sample plugin unloaded')
  }

  public process(): string {
    return `sample plugin version ${this.version}`
  }
}
