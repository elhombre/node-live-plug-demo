import { build } from 'esbuild'

const main = async () => {
  await build({
    bundle: true,
    entryPoints: ['./src/index.ts'],
    format: 'cjs',
    minify: true,
    outdir: './dist',
    packages: 'external',
    platform: 'node',
    sourcemap: true,
    target: 'esnext',
  })
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
