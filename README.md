# nxus-core

## 

[![Build Status](https://travis-ci.org/nxus/core.svg?branch=master)](https://travis-ci.org/nxus/core)

The Nxus Core package includes the basic Application framework for building a Nxus app.

### Introduction

You'll probably find the following resources useful background and help in building Nxus applcations.

-   [Getting Started](<>) (TODO)
-   [Design Patterns](<>) (TODO)
-   [Nxus Modules](<>) (TODO)
-   [Recipes](<>) (TODO)
-   [Developing a ](<>) (TODO)

### Documentation

The full set of Nxus docs is available at <http://docs.gonxus.org>.

### Installation

    > npm install nxus-core --save

### Usage

In your root application, create a new Application instance:

    import {Application} from 'nxus-core'

    let app = new Application(options)

    app.start()

    export default app

#### Events

Nxus is built around the concept of a boot cycle.  The application dispatches events in the following order:

| Boot Stage | Description                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `init`     | indicates the application is starting up and initializing modules.  Other modules are not gauranteed to be available at this phase.                                                  |
| `load`     | modules are initialized and loading. This is the place to do any internal setup (outside of the constructor). Other modules are not gauranteed to be available at this phase.        |
| `startup`  | all modules have been loaded and are available. This is the place to do any setup that requires data/input from other modules (like Storage)                                         |
| `launch`   | the application is launching and all services have been started. Routes are accessible. Use onceAfter('launch') to gaurantee execution after the application has completely launched |

#### Module Loading

By defaul the Application will look for other Nxus modules in the following order:

1.  @nxus namespaced npm modules in your `package.json` file.
2.  Any packages that match the 'namespace-' pattern passed in the `namespace` application config option.
3.  folders in the ./modules folder in the root of your project
4.  any modules specified in the _modules_ option passed into Application on instantiation.

#### Module Access

In order to access module commands, use the Application.get() method.

    let router = Application.get('router')

#### Application Configuration

The Application exposes a core `config` object that contains application and module specific configuration values.

Nxus uses the [rc](https://www.npmjs.com/package/rc) library to provide application configuration.

The application configuration can usually be found in a `.nxusrc` file in the root folder.

You can override specific confirguation values using command line environment variables, which supports nesting.

    nxus_myconfig__value__first=true npm start

will translate into an application config of

    console.log(app.config.myconfig) // {value: {first: true}}

## Application

**Extends Dispatcher**

The Core Application class.

#### Configuration Options

Available options are:

| Name      | Description                                                                                                                     |
| --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| appName   | the name of your app. Will be used for console logging.                                                                         |
| appDir    | the location to use to load the default 'package.json' file.                                                                    |
| namespace | any additional namespaces to use to load modules in the node_modules folder. Can be a string or array of strings.               |
| modules   | an array of paths to require into the application                                                                               |
| debug     | Boolean to display debug messages, including startup banner                                                                     |
| script    | Boolean to indicate the application is a CLI script, silences all logging/output messages except for explicit console.log calls |
| silent    | Don't show any console output. Useful for CLI scripts.                                                                          |

**Parameters**

-   `opts` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** the configuration options

**Examples**

```javascript
import {application} from 'nxus-core'

application.start()

export default application
```

### get

Returns an internal ModuleProxy object for the given name.

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the module to return

Returns **ModuleProxy** 

### stop

Stops the currently running application

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

### start

Starts the Nxus application.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

### restart

Restarts the Nxus application.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

## Dispatcher

**Extends EventEmitter**

The core Dispatcher class, which implements promisified

**Examples**

```javascript
import { Dispatcher } from 'nxus-core'
class MyClass extends Dispatcher {
  ...
}
```

### once

Bind to an event once

**Parameters**

-   `event` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the event to bind to
-   `listener` **\[callable]** The handler for the event

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Returns a promise that resolves when the event fires

### before

Bind to before an event. Receives the event arguments, should return 
 modified arguments or nothing.

**Parameters**

-   `event` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the event to bind to
-   `listener` **callable** The before handler for the event

### after

Bind to after an event. Receives the event handlers results, should return 
 modified results or nothing.

**Parameters**

-   `event` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the event to bind to
-   `listener` **callable** The after handler for the event

### onceBefore

Bind once to before an event. Receives the event arguments, should return 
 modified arguments or nothing.

**Parameters**

-   `event` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the event to bind to
-   `listener` **callable** The before handler for the event

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Returns a promise that resolves when the event fires

### onceAfter

Bind once to after an event. Receives the event handlers results, should return 
 modified results or nothing.

**Parameters**

-   `event` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the event to bind to
-   `listener` **callable** The after handler for the event

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Returns a promise that resolves when the event fires

### emit

Emits an event, calling all registered handlers.

**Parameters**

-   `event` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the event to emit.
-   `args` **...Any** Arguments to the event handlers

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Returns a promise that resolves when all handlers have completed, with any returned results as an array.

## NxusModule

The NxusModule class is a base class for all Nxus modules.

**Properties**

-   `config` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** The application configuration for this module.
-   `log` **Logger** The logger for the module.
