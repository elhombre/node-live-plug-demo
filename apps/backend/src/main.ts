import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'
import type { AppConfig } from './app/config/app.config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get<ConfigService>(ConfigService)
  const { host = 'localhost', port = 3000 } = configService.get('application') as AppConfig
  await app.listen(port, host)
}
bootstrap()
