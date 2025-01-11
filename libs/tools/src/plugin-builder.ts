import fs from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import chokidar from 'chokidar'
import esbuild from 'esbuild'
import { type Config, createGenerator } from 'ts-json-schema-generator'
import type { PluginBuilderOptions } from './types'

const defaults = {
  distDir: 'dist/plugins',
  pluginEntry: 'src/plugin.ts',
  pluginsDir: 'plugins',
  schemaName: 'dto-schema.json',
}

export class PluginBuilder {
  private readonly entryPoint: string
  private readonly pluginDir: string
  private readonly pluginName: string
  private readonly sourceDir: string

  constructor(private readonly options: PluginBuilderOptions) {
    const projectRoot = this.findProjectRoot()
    const pluginEntry = options.pluginEntry ?? defaults.pluginEntry
    this.entryPoint = resolve(options.baseDir, pluginEntry)
    this.pluginName = options.pluginName
    this.pluginDir = resolve(projectRoot, options.distDir ?? defaults.distDir, this.pluginName)
    this.sourceDir = resolve(options.baseDir, dirname(pluginEntry))
  }

  private get outputDir() {
    const currentVersion = this.findCurrentVersion()
    return join(this.pluginDir, currentVersion.toString())
  }

  public async build() {
    const { outputDir: outdir } = this
    fs.mkdirSync(outdir, { recursive: true })

    // Build schema before bundle.
    await this.buildJsonSchema(outdir)

    const ctx = await esbuild.context({
      bundle: this.options.bundleDependencies,
      entryPoints: [this.entryPoint],
      minify: this.options.minify,
      outdir,
      platform: 'node',
      sourcemap: true,
    })
    await ctx.rebuild()
    await ctx.dispose()
  }

  public async clean() {
    // Remove all versions except the most recent.
    for (const version of this.findAllVersions().slice(0, -1)) {
      const p = join(this.pluginDir, version.toString())
      await fs.promises.rm(p, { recursive: true })
    }
  }

  public async watch() {
    const watcher = chokidar.watch(this.sourceDir, { ignoreInitial: true })
    const watchPattern = this.options.watchPattern ?? /.*\.ts$/

    await this.build()

    console.log('Watching for changes...')
    watcher.on('change', async (path, _stats) => {
      if (watchPattern.test(path)) {
        console.log(`Rebuilding plugin: ${this.pluginName}`)
        await this.build()
      }
    })
  }

  private async buildJsonSchema(outputDir: string) {
    const { baseDir, dtoPath } = this.options
    if (dtoPath) {
      const config = {
        path: join(baseDir, dtoPath),
        tsconfig: join(baseDir, 'tsconfig.json'),
        type: '*',
      } satisfies Config

      const outputPath = join(outputDir, defaults.schemaName)
      const schema = createGenerator(config).createSchema(config.type)
      const schemaString = JSON.stringify(schema, null, 2)
      await fs.promises.writeFile(outputPath, schemaString)
    }
  }

  private findProjectRoot(searchPath = __dirname): string {
    if (fs.existsSync(join(searchPath, '.git'))) {
      return searchPath
    }
    const outerPath = resolve(searchPath, '..')
    if (outerPath.length < 3) {
      throw new Error('File system root reached, but GIT directory not found')
    }
    return this.findProjectRoot(outerPath)
  }

  private findCurrentVersion() {
    const baseVersion = 1
    const versions = this.findAllVersions()
    return (versions.at(-1) ?? 0) + baseVersion
  }

  private findAllVersions() {
    try {
      const subDirs = fs.readdirSync(this.pluginDir)
      return subDirs
        .filter(d => d.match(/\d+/))
        .map(d => Number.parseInt(d))
        .sort((a, b) => a - b)
    } catch (_) {
      return []
    }
  }
}
