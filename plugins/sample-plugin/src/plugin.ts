import type { IPlugin } from '@repo/shared'
import type { PluginDto } from './plugin-dto'

export default class Plugin implements IPlugin {
  private version = '0.1'

  public async load() {
    console.log('sample plugin loaded')
  }

  public async unload() {
    console.log('sample plugin unloaded')
  }

  public async process(dto: PluginDto): Promise<string> {
    return JSON.stringify({
      description: 'sample plugin',
      response: this.createResponse(dto),
      version: this.version,
    })
  }

  private createResponse({ action, payload }: PluginDto) {
    switch (action) {
      case 'create-item':
        return { name: payload.name, result: 'ok' }
      case 'echo':
        return { message: payload.message }
      case 'test':
        return { counter: payload.counter + 1, itemNames: payload.items.map(item => item.name) }
    }
  }
}
