import { PluginBuilder } from '@repo/tools'

const pluginBuilder = new PluginBuilder({
  baseDir: __dirname,
  distDir: '../../dist/plugins',
  pluginName: 'sample-plugin',
})

try {
  if (process.argv.includes('--watch')) {
    pluginBuilder.watch()
  } else {
    pluginBuilder.build()
  }
} catch (err) {
  console.log(err)
  process.exit(1)
}
