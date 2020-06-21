# env-emitter

Node.js module that adds event emitters to `process.env`. Requires no dependencies.

<!-- TOC is automatically generated -->
<!-- update with `npx markdown-toc -i README.md` -->

<!-- toc -->

- [Installation](#installation)
- [Usage](#usage)
  * [Listen for get events](#listen-for-get-events)
  * [Listen for set events](#listen-for-set-events)
- [More examples](#more-examples)
  * [Prevent any changes to `process.env`](#prevent-any-changes-to-processenv)
  * [Log warning for undefined vars](#log-warning-for-undefined-vars)

<!-- tocstop -->

## Installation

```bash
npm install env-emitter
```

Include the module at top of main file. This is only needed once in the application because it replaces the global `process.env`.

```typescript
import 'env-emitter'
```

## Usage

### Listen for get events
```typescript
import 'env-emitter'

process.env.on('get', event => {
    console.log(`Variable ${event.name} used at ${event.caller}`)
})

const test = process.env.FOO_BAR

// outputs: FOO_BAR used at /app/directory/file.js:7:13
```

event properties available:
- `event.name`
    - Name of variable accessed, such as `NODE_ENV`
- `event.value`
    - Value of variable accessed (or `undefined`)
- `event.caller`
    - String of where accessed, such as  `/app/directory/file.js:7:13` 
- `event.callerIsCoreNode`
    - Boolean, `true` if variable was accessed from a core Node module. This is helpful for filtering. Example being `console.log()` access lots of environment variables. 

### Listen for set events
```typescript
import 'env-emitter'

process.env.on('set', event => {
    console.log(`Variable ${event.name} changed to ${event.newValue} at ${event.caller}`)
})

process.env.FOO_BAR = 'baz'

// outputs: FOO_BAR changed to baz at /app/directory/file.js:7:13
```

event properties available:
- `event.name`
    - Name of variable being changed, such as `NODE_ENV`
- `event.caller`
    - String of where variable is being changed, such as `/app/directory/file.js:7:13` 
- `event.previousValue`
    - Value of variable BEFORE change (current value)
- `event.newValue`
    - Value of variable AFTER change (value after any listeners complete)

## More examples

### Prevent any changes to `process.env`

```typescript
process.env.on('set', event => {
    throw new Error('Setting environment variables is not allowed')
})
```

### Log warning for undefined vars

```typescript
process.env.on('get', event => {
    // skip internal Node usage
    if (event.callerIsCoreNode) {
        return
    }   

    if (event.value === undefined) {
        console.log(`⚠️ ${event.name} at ${event.caller}`)
    }
})
```

