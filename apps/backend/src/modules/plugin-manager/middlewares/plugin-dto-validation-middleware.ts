// NOTE: This middleware is intended to work only with Express.
import { Injectable, type NestMiddleware } from '@nestjs/common'
import type { NextFunction, Request, Response } from 'express'
// biome-ignore lint/style/useImportType: <explanation>
import { PluginsDtoValidator } from '../helpers/plugins-dto-validator'

@Injectable()
export class PluginDtoValidationMiddleware implements NestMiddleware {
  constructor(private readonly pluginsDtoValidator: PluginsDtoValidator) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const pluginName = req.params.pluginName
    this.pluginsDtoValidator.validate(pluginName, req.body)
    next()
  }
}
