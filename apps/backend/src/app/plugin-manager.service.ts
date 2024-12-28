import fs from 'node:fs'
import path from 'node:path'
import type { SharedConfig } from '@/shared/global-config'
import { Injectable, type OnModuleInit, ServiceUnavailableException } from '@nestjs/common'
// biome-ignore lint/style/useImportType: <explanation>
import { ConfigService } from '@nestjs/config'
import type { IPlugin } from '@repo/shared'
import chokidar from 'chokidar'
import type { AppConfig } from './config/app.config'

@Injectable()
export class PluginManagerService implements OnModuleInit {
  private plugins: Map<string, IPlugin> = new Map()
  private readonly pluginsDir: string
  private readonly pluginEntry = 'plugin.js'

  constructor(private readonly configService: ConfigService) {
    const { pluginsDir } = this.configService.get('application') as AppConfig
    const { rootDir } = this.configService.get('shared') as SharedConfig
    this.pluginsDir = path.join(rootDir, pluginsDir)
  }

  async onModuleInit() {
    await this.loadPlugins()
    this.watchPlugins()
  }

  public getPluginInstance(pluginName: string): IPlugin {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      throw new ServiceUnavailableException(`Cannot find plugin "${pluginName}"`)
    }
    return plugin
  }

  private getPluginPath(pluginName: string): string | null {
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
    return currentVersion ? path.join(pluginDir, currentVersion.toString(), this.pluginEntry) : null
  }

  private async loadPlugins() {
    let pluginNames = new Array<string>()
    try {
      pluginNames = fs.readdirSync(this.pluginsDir)
    } catch (_) {}

    for (const pluginName of pluginNames) {
      const pluginPath = this.getPluginPath(pluginName)
      if (pluginPath) {
        await this.reloadPlugin(pluginName, pluginPath)
      } else {
        console.error(`Plugin "${pluginName}" does not exist`)
      }
    }
  }

  private async reloadPlugin(pluginName: string, pluginPath: string) {
    await this.waitForFile(pluginPath)

    const oldPlugin = this.plugins.get(pluginName)
    if (oldPlugin) {
      oldPlugin.unload()
      console.info('[info] plugin unloaded:', pluginName)
    }

    const { default: PluginClass } = require(pluginPath)
    const instance = new PluginClass()
    instance.load()

    this.plugins.set(pluginName, instance)
    console.info('[info] plugin loaded:', pluginName)
  }

  private async waitForFile(filePath: string) {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        console.log('Waiting for file:', filePath)
        try {
          fs.promises.access(filePath).then(() => resolve())
        } catch (_) {}
      }, 100)
    })
  }

  private async watchPlugins() {
    await fs.promises.mkdir(this.pluginsDir, { recursive: true })
    chokidar.watch(this.pluginsDir, { ignoreInitial: true }).on('addDir', async dir => {
      if (/^\d+$/.test(path.basename(dir))) {
        const pluginName = path.basename(path.dirname(dir))
        const pluginPath = path.join(dir, this.pluginEntry)
        this.reloadPlugin(pluginName, pluginPath)
      }
    })
  }
}
