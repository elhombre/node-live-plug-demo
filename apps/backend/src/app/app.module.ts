import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import globalConfig from '../shared/global-config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PluginManagerService } from './plugin-manager.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [globalConfig],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PluginManagerService],
})
export class AppModule {}
