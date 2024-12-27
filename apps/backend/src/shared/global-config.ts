import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { cwd } from 'node:process'
import * as yaml from 'js-yaml'

export type SharedConfig = Readonly<{
  configDir: string
  rootDir: string
}>

const findConfigFile = (name: string, searchPath: string) => {
  const path = join(searchPath, name)
  if (existsSync(path)) {
    return path
  }

  const error = (reason: string) => {
    throw new Error(`${reason}, but config file not found`)
  }

  if (existsSync(join(searchPath, '.git'))) {
    error('Project root reached')
  }
  const outerPath = resolve(searchPath, '..')

  if (outerPath.length < 2) {
    error('FS root reached')
  }
  return findConfigFile(name, outerPath)
}

export default () => {
  const dev = process.env.NODE_ENV === 'development' ? '.dev' : ''
  const configName = `conf/.config${dev}.yaml`
  const configPath = findConfigFile(configName, cwd())
  const config = yaml.load(readFileSync(configPath, 'utf-8')) as Record<string, unknown>
  const configDir = dirname(configPath)
  const shared: SharedConfig = { configDir, rootDir: dirname(configDir) }
  return { ...config, shared }
}
