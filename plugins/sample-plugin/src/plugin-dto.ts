export type PluginDto =
  | { action: 'create-item'; payload: TestItem }
  | { action: 'echo'; payload: EchoPayload }
  | { action: 'test'; payload: TestPayload }

export type EchoPayload = Readonly<{
  message: string
}>

export type TestItem = Readonly<{
  name: string
}>

export type TestPayload = Readonly<{
  /**
   * @maximum 999
   */
  counter: number
  items: Array<TestItem>
}>
