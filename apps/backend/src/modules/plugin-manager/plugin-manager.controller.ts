import { Body, Controller, Get, Header, Param, Post } from '@nestjs/common'
import type { PluginDtoBase } from '@repo/shared'
// biome-ignore lint/style/useImportType: <explanation>
import { PluginManagerService } from './plugin-manager.service'

@Controller('plugins')
export class PluginManagerController {
  constructor(private readonly pluginManager: PluginManagerService) {}

  @Get(':pluginName/schema')
  @Header('Content-Type', 'application/json')
  public async getPluginSchema(@Param('pluginName') pluginName: string): Promise<string> {
    return this.pluginManager.getPluginSchema(pluginName)
  }

  @Post(':pluginName/process')
  @Header('Content-Type', 'application/json')
  public async processPlugin(@Param('pluginName') pluginName: string, @Body() dto: PluginDtoBase): Promise<string> {
    return this.pluginManager.processPlugin(pluginName, dto)
  }
}
