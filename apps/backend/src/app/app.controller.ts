import { Controller, Get, Param } from '@nestjs/common'
// biome-ignore lint/style/useImportType: <explanation>
import { AppService } from './app.service'
// biome-ignore lint/style/useImportType: <explanation>
import { PluginManagerService } from './plugin-manager.service'

@Controller('plugins')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly pluginManager: PluginManagerService,
  ) {}

  @Get()
  public getHello(): string {
    return this.appService.getHello()
  }

  @Get(':pluginName/process')
  public processPlugin(@Param('pluginName') pluginName: string): string {
    const plugin = this.pluginManager.getPluginInstance(pluginName)
    return plugin.process()
  }
}
