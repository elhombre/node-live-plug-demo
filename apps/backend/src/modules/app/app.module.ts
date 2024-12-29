import globalConfig from '@/shared/global-config'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PluginManagerModule } from '../plugin-manager/plugin-manager.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [globalConfig],
    }),
    PluginManagerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
