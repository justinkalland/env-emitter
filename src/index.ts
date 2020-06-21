import { EventEmitter } from 'events'

declare global {
  namespace NodeJS { // eslint-disable-line @typescript-eslint/no-namespace
    interface ProcessEnv extends ProcessEnvEventEmitter{
      on: ((eventName: 'get', listener: (event: ProcessEnvGetEvent) => void) => this) & ((eventName: 'set', listener: (event: ProcessEnvSetEvent) => void) => this)
      once: ((eventName: 'get', listener: (event: ProcessEnvGetEvent) => void) => this) & ((eventName: 'set', listener: (event: ProcessEnvSetEvent) => void) => this)
    }
  }
}

interface ProcessEnvGetEvent {
  name: string
  caller: string
  callerIsCoreNode: boolean
  value: string
}

interface ProcessEnvSetEvent {
  name: string
  caller: string
  previousValue: string
  newValue: string
}

class ProcessEnvEventEmitter extends EventEmitter {
  [key: string]: any
}
const processEnv = Object.assign(new ProcessEnvEventEmitter(), process.env)

let skipGetEmit = false
function emitGet (name: string, value: string): void {
  const stackTrace = new Error().stack.split('\n')
  const caller = stackTrace[3].match(/\((.*\/.*:.*)\)/)[1]
  const callerIsCoreNode = caller.startsWith('internal')

  /*
    Node modules also use environment variables
    Without this logic an endless loop can be created, for example when using console.log() in a listener
  */
  if (skipGetEmit) {
    return
  }

  if (callerIsCoreNode) {
    skipGetEmit = true
  }

  processEnv.emit('get', { name, caller, value, callerIsCoreNode })

  skipGetEmit = false
}

function emitSet (name: string, previousValue: string, newValue: string): void {
  const stackTrace = new Error().stack.split('\n')
  const caller = stackTrace[3].match(/\((.*\/.*:.*)\)/)[1]

  processEnv.emit('set', { name, caller, previousValue, newValue })
}

const handler = {
  get: function (target, property) {
    if (typeof target[property] === 'string' || target[property] === undefined) {
      emitGet(property, target[property])
    }

    return Reflect.get(target, property)
  },
  set: function (target, property, value) {
    if (!String(property).startsWith('_events')) {
      emitSet(property, target[property], value)
    }

    return Reflect.set(target, property, value)
  }
}

process.env = new Proxy(processEnv, handler)
