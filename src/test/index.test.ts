import '../'
import sinon from 'sinon'

describe('doesnt break process.env', () => {
  it('preserves environment variable', () => {
    expect(process.env.TEST_FOO).toEqual('bar')
  })

  it('allows setting new environment variable', () => {
    process.env.TEST_ANOTHER_FOO = 'bar'
    expect(process.env.TEST_ANOTHER_FOO).toEqual('bar')
  })

  it('allows modifying environment variable', () => {
    process.env.TEST_FOO = 'baz'
    expect(process.env.TEST_FOO).toEqual('baz')
    process.env.TEST_FOO = 'bar'
  })
})

describe('event get', () => {
  it('emits', () => {
    const callback = sinon.fake()
    process.env.once('get', callback)

    expect(process.env.TEST_FOO).toEqual('bar')
    expect(callback.called).toEqual(true)
  })

  it('emits name', () => {
    process.env.TEST_EMITS_NAME = 'boo'

    let result = false
    process.env.once('get', event => {
      if (event.name === 'TEST_EMITS_NAME') {
        result = true
      }
    })

    expect(process.env.TEST_EMITS_NAME).toEqual('boo')
    expect(result).toEqual(true)
  })

  it('emits name on undefined', () => {
    let result = false
    process.env.once('get', event => {
      if (event.name === 'TEST_EMITS_NAME_UNDEF') {
        result = true
      }
    })

    expect(process.env.TEST_EMITS_NAME_UNDEF).toBeUndefined()
    expect(result).toEqual(true)
  })

  it('emits value', () => {
    process.env.TEST_EMITS_VALUE = 'boo'

    let result
    process.env.once('get', event => {
      if (event.name === 'TEST_EMITS_VALUE') {
        result = event.value
      }
    })

    expect(process.env.TEST_EMITS_VALUE).toEqual('boo')
    expect(result).toEqual('boo')
  })

  it('emits value on undefined', () => {
    let result = 'defined'
    process.env.once('get', event => {
      if (event.name === 'TEST_EMITS_VALUE_UNDEF') {
        result = event.value
      }
    })

    expect(process.env.TEST_EMITS_VALUE_UNDEF).toBeUndefined()
    expect(result).toBeUndefined()
  })

  it('emits caller', () => {
    process.env.TEST_GET_EMITS_CALLER = 'boo'

    let result
    process.env.once('get', event => {
      result = event.caller
    })

    expect(process.env.TEST_GET_EMITS_CALLER).toEqual('boo')
    expect(result).toContain(__filename)
  })

  it('emits caller on undefined', () => {
    let result
    process.env.once('get', event => {
      result = event.caller
    })

    expect(process.env.TEST_GET_EMITS_CALLER_UNDEF).toBeUndefined()
    expect(result).toContain(__filename)
  })

  it('emits callerIsCoreNode', () => {
    let result = true
    process.env.once('get', event => {
      result = event.callerIsCoreNode
    })

    expect(process.env.TEST_GET_EMITS_CALLERISCORE).toBeUndefined()
    expect(result).toEqual(false)
  })

  it('allows logging on emit (no endless loop)', () => {
    process.env.once('get', (event) => {
      console.log(`${event.name} at ${event.caller}`)
    })

    expect(process.env.TEST_FOO).toEqual('bar')
  })
})

describe('event set', () => {
  it('emits', () => {
    const callback = sinon.fake()
    process.env.once('set', callback)

    process.env.TEST_ANOTHER_FOO = 'boo'
    expect(callback.called).toEqual(true)
  })

  it('emits name', () => {
    let result = false
    process.env.once('set', event => {
      if (event.name === 'TEST_SET_EMITS_NAME') {
        result = true
      }
    })

    process.env.TEST_SET_EMITS_NAME = 'good'
    expect(result).toEqual(true)
  })

  it('emits caller', () => {
    let result
    process.env.once('set', event => {
      result = event.caller
    })

    process.env.TEST_SET_EMITS_CALLER = 'foo'
    expect(result).toContain(__filename)
  })

  it('emits previous value', () => {
    process.env.TEST_SET_EMITS_PREVIOUS = 'foo'

    let result
    process.env.once('set', event => {
      result = event.previousValue
    })

    process.env.TEST_SET_EMITS_PREVIOUS = 'bar'
    expect(result).toEqual('foo')
  })

  it('emits new value', () => {
    process.env.TEST_SET_EMITS_NEW = 'foo'

    let result
    process.env.once('set', event => {
      result = event.newValue
    })

    process.env.TEST_SET_EMITS_NEW = 'bar'
    expect(result).toEqual('bar')
  })
})
