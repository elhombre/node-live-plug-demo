import fs from 'node:fs'
import { join } from 'node:path'
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { Ajv } from 'ajv'
import type { JsonObject } from 'type-fest'

@Injectable()
export class PluginsDtoValidator {
  private readonly validators = new Map<string, [Ajv, JsonObject]>()
  private readonly pluginSchema = 'dto-schema.json'

  public getSchema(pluginName: string): JsonObject | null {
    const [_, schema] = this.validators.get(pluginName) || []
    return schema || null
  }

  public async registerPlugin(pluginName: string, pluginDir: string) {
    const schemaPath = join(pluginDir, this.pluginSchema)
    const buffer = await fs.promises.readFile(schemaPath)
    const schema = JSON.parse(buffer.toString())
    const ajv = new Ajv({ allErrors: true, strict: false })
    ajv.addSchema(schema)
    this.validators.set(pluginName, [ajv, schema])
  }

  public validate(pluginName: string, dto: JsonObject) {
    const [ajv] = this.validators.get(pluginName) || []
    if (!ajv) {
      throw new InternalServerErrorException(`Cannot find validator for plugin "${pluginName}"`)
    }

    const validate = ajv.getSchema('#/definitions/PluginDto')
    if (!validate) {
      throw new InternalServerErrorException(`Invalid JSON schema for plugin "${pluginName}"`)
    }
    const isValid = validate(dto)
    if (!isValid) {
      throw new BadRequestException({
        message: `Payload validation failed for plugin "${pluginName}"`,
        errors: validate.errors,
      })
    }
  }

  public unregisterPlugin(name: string) {
    this.validators.delete(name)
  }
}
