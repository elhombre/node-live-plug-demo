import fs from 'node:fs'
import path from 'node:path'
import type { SharedConfig } from '@/shared/global-config'
import { Injectable, InternalServerErrorException, NotFoundException, type OnModuleInit } from '@nestjs/common'
// biome-ignore lint/style/useImportType: <explanation>
import { ConfigService } from '@nestjs/config'
import type { IPlugin, PluginDtoBase } from '@repo/shared'
import chokidar from 'chokidar'
import type { PluginsConfig } from './config/plugins.config'
// biome-ignore lint/style/useImportType: <explanation>
import { PluginsDtoValidator } from './helpers/plugins-dto-validator'

@Injectable()
export class PluginManagerService implements OnModuleInit {
  private plugins: Map<string, IPlugin> = new Map()
  private readonly pluginsDir: string
  private readonly pluginEntry = 'plugin.js'

  constructor(
    private readonly configService: ConfigService,
    private readonly pluginsDtoValidator: PluginsDtoValidator,
  ) {
    const { pluginsDir } = this.configService.get('plugins') as PluginsConfig
    const { rootDir } = this.configService.get('shared') as SharedConfig
    this.pluginsDir = path.join(rootDir, pluginsDir)
  }

  async onModuleInit() {
    await this.loadPlugins()
    this.watchPlugins()
  }

  public async getPluginSchema(pluginName: string): Promise<string> {
    return this.withExistingPlugin(pluginName, async () => {
      const schema = this.pluginsDtoValidator.getSchema(pluginName)
      return JSON.stringify(schema)
    })
  }

  public processPlugin(pluginName: string, dto: PluginDtoBase): Promise<string> {
    return this.withExistingPlugin(pluginName, async plugin => {
      try {
        return plugin.process(dto)
      } catch (err: unknown) {
        const message = `Cannot execute plugin "${pluginName}": ${(err as Error).message}`
        console.error(message)
        throw new InternalServerErrorException(message)
      }
    })
  }

  private getPluginCurrentDir(pluginName: string): string | null {
    const pluginDir = path.join(this.pluginsDir, pluginName)
    let subDirs: Array<string> = []
    try {
      subDirs = fs.readdirSync(pluginDir)
    } catch (_) {}
    const versions = subDirs
      .filter(d => d.match(/\d+/))
      .map(d => Number.parseInt(d))
      .sort((a, b) => a - b)
    const currentVersion = versions.at(-1)
    return currentVersion ? path.join(pluginDir, currentVersion.toString()) : null
  }

  private async loadPlugins() {
    let pluginNames = new Array<string>()
    try {
      pluginNames = fs.readdirSync(this.pluginsDir)
    } catch (_) {}

    for (const pluginName of pluginNames) {
      const pluginDir = this.getPluginCurrentDir(pluginName)
      if (pluginDir) {
        await this.reloadPlugin(pluginName, path.join(pluginDir))
      } else {
        console.error(`Plugin "${pluginName}" does not exist`)
      }
    }
  }

  private async reloadPlugin(pluginName: string, pluginDir: string) {
    let action = 'load'
    const pluginPath = path.join(pluginDir, this.pluginEntry)
    try {
      await this.waitForFile(pluginPath)
      const oldPlugin = this.plugins.get(pluginName)
      if (oldPlugin) {
        action = 'reload'
        oldPlugin.unload()
        this.pluginsDtoValidator.unregisterPlugin(pluginPath)
        console.info('[info] plugin unloaded:', pluginName)
      }

      const { default: PluginClass } = require(pluginPath)
      const instance = new PluginClass()
      instance.load()
      await this.pluginsDtoValidator.registerPlugin(pluginName, pluginDir)

      this.plugins.set(pluginName, instance)
      console.info('[info] plugin loaded:', pluginName)
    } catch (err: unknown) {
      const message = `Failed to ${action} plugin "${pluginName}: ${(err as Error).message}`
      console.error(message)
    }
  }

  private async waitForFile(filePath: string) {
    return new Promise<void>(resolve => {
      console.log('Waiting for file:', filePath)
      const touch = () => {
        setTimeout(async () => {
          try {
            await fs.promises.access(filePath)
            resolve()
          } catch (_) {
            touch()
          }
        }, 100)
      }
      touch()
    })
  }

  private async watchPlugins() {
    await fs.promises.mkdir(this.pluginsDir, { recursive: true })
    chokidar.watch(this.pluginsDir, { ignoreInitial: true }).on('addDir', async dir => {
      if (/^\d+$/.test(path.basename(dir))) {
        const pluginName = path.basename(path.dirname(dir))
        await this.reloadPlugin(pluginName, dir)
      }
    })
  }

  private async withExistingPlugin<T>(pluginName: string, callback: (plugin: IPlugin) => Promise<T>) {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      throw new NotFoundException(`Cannot find plugin "${pluginName}"`)
    }
    return callback(plugin)
  }
}
