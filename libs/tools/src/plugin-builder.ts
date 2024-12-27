import fs from 'node:fs'
import path from 'node:path'
import chokidar from 'chokidar'
import esbuild from 'esbuild'
import type { PluginBuilderOptions } from './types'

export class PluginBuilder {
  constructor(
    options: PluginBuilderOptions,
    private readonly baseDir = options.baseDir,
    private readonly distDir = options.distDir,
    private readonly pluginEntry = options.pluginEntry ?? './src/plugin.ts',
    private readonly pluginName = options.pluginName,
    private readonly watchPattern = options.watchPattern ?? /.*\.ts$/,
  ) {}

  private get pluginDir(): string {
    return path.resolve(this.baseDir, this.distDir, this.pluginName)
  }

  private get sourceDir(): string {
    return path.resolve(this.baseDir, path.dirname(this.pluginEntry))
  }

  public async build() {
    const ctx = await this.createContext()
    await ctx.rebuild()
    await ctx.dispose()
  }

  public async watch() {
    const watcher = chokidar.watch(this.sourceDir, { ignoreInitial: true })
    await this.build()

    console.log('Watching for changes...')
    watcher.on('change', async (path, _stats) => {
      if (this.watchPattern.test(path)) {
        console.log(`Rebuilding plugin: ${this.pluginName}`)
        await this.build()
      }
    })
  }

  private findCurrentVersion() {
    const baseVersion = 1
    try {
      const subDirs = fs.readdirSync(this.pluginDir)
      const versions = subDirs
        .filter(d => d.match(/\d+/))
        .map(d => Number.parseInt(d))
        .sort((a, b) => (a === b ? 0 : a > b ? 1 : -1))
      return (versions.at(-1) ?? 0) + baseVersion
    } catch (_) {
      return baseVersion
    }
  }

  private async createContext() {
    const currentVersion = this.findCurrentVersion()
    const outdir = path.join(this.pluginDir, currentVersion.toString())
    fs.mkdirSync(outdir, { recursive: true })
    return esbuild.context({
      bundle: false,
      entryPoints: [path.resolve(this.baseDir, this.pluginEntry)],
      outdir,
      platform: 'node',
      sourcemap: true,
    })
  }
}
