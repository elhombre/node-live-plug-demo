import { type MiddlewareConsumer, Module, type NestModule, RequestMethod } from '@nestjs/common'
import { PluginDtoValidationMiddleware } from 'src/modules/plugin-manager/middlewares/plugin-dto-validation-middleware'
import { PluginsDtoValidator } from './helpers/plugins-dto-validator'
import { PluginManagerController } from './plugin-manager.controller'
import { PluginManagerService } from './plugin-manager.service'

@Module({
  controllers: [PluginManagerController],
  providers: [PluginManagerService, PluginsDtoValidator],
})
export class PluginManagerModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PluginDtoValidationMiddleware)
      .forRoutes({ path: '/plugins/:pluginName/process', method: RequestMethod.POST })
  }
}
