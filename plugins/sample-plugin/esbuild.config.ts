import { PluginBuilder } from '@repo/tools'

const pluginBuilder = new PluginBuilder({
  baseDir: __dirname,
  bundleDependencies: true,
  dtoPath: 'src/plugin-dto.ts',
  minify: false, // When using minify=true, debugging may not work correctly.
  pluginName: 'sample-plugin',
})

try {
  if (process.argv.includes('--clean')) {
    pluginBuilder.clean()
  } else if (process.argv.includes('--watch')) {
    pluginBuilder.watch()
  } else {
    pluginBuilder.build()
  }
} catch (err) {
  console.log(err)
  process.exit(1)
}
