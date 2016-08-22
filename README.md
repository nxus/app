# nxus-core

## \_

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

    > npm install @nxus/core --save

### Usage

In your root application, create a new Application instance:

    import {Application} from '@nxus/core'

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

#### Application Options

    new App(...options)

Available options are:

_appDir_: the location to use to load the default 'package.json' file. 

_namespace_: any additional namespaces to use to load modules in the node_modules folder. Can be a string or array of strings.

_modules_: an array of paths to require into the application

_debug_: Boolean to display debug messages, including startup banner

_script_: Boolean to indicate the application is a CLI script, silences all logging/output messages except for explicit console.log calls

#### Application Configuration

The Application exposes a core `config` object that contains application and module specific configuration values.

Nxus uses the [rc](https://www.npmjs.com/package/rc) library to provide application configuration.

The application configuration can usually be found in a `.nxusrc` file in the root folder.

You can override specific confirguation values using command line environment variables, which supports nesting.

    nxus_myconfig__value__first=true npm start

will translate into an application config of

    console.log(app.config.myconfig) // {value: {first: true}}

### API

## Application

**Extends Dispatcher**

The Core Application class.

**Parameters**

-   `opts` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** the configuration options

**Examples**

```javascript
import {Application} from '@nxus/core'
let app = new Application(options)
app.start()
export default app
```

### get

Returns an internal Module object for the given name.

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the module to return

Returns **[Module](https://nodejs.org/api/modules.html)** 

### init

Initializes the application by loading plugins, then booting the application.

**Note**: this should rarely be called directly. Instead use #start

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

### boot

Boots the application, cycling through the internal boot stages.

**Note**: Should rarely be called directly. Instead use #start

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

### stop

Stops the currently running application, removing all event listeners.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

### start

Starts the Nxus application.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

### restart

Restarts the Nxus application.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

## ConfigurationManager

ConfigurationManager loads the internal app.config hash using the following order (each overwrites any values of the previous):

1.  Opts loaded into the application object.
2.  Opts in the `config` hash of the project package.json file
3.  Any environment variables

### getNodeEnv

Returns the current NODE_ENV

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the current NODE_ENV

### getEnvironmentVariables

Extracts the currently avaiable environment variables

Returns **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** A hash of the current environment variables

### getConfig

Returns the final config option using the loading order described above.

Returns **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** the final composed configuration object.

## Dispatcher

**Extends EventEmitter**

The core Dispatcher class, which implements promisified

**Examples**

```javascript
import { Dispatcher } from '@nxus/core'
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

## Module

**Extends Dispatcher**

The core Module class. This provides a messaging proxy layer between modules and calling code.
The main advantage of this proxy class is that missing modules won't cause exceptions in the code.

Modules are accessed through the Application.get() method

**Examples**

```javascript
let router = app.get('router')

Producer modules should register themselves with the use() method, and define gather() and respond() handlers:
```

```javascript
app.get('router').use(this).gather('route')
```

```javascript
app.get('templater').use(this).respond('template')

Consumer modules should get the module they need to use and call provide or request
```

```javascript
app.get('router').provide('route', ...)
```

```javascript
app.get('templater').request('render', ...)

Modules proxy event names as methods to provide/request, so these are synomymous with above:
```

```javascript
app.get('router').route(...)
```

```javascript
app.get('templater').render(...)

Default implementations should be indicated by using default() to occur before provide()
Overriding another implementation can use replace() to occur after provide()
```

```javascript
app.get('router').default('route', GET', '/', ...)
```

```javascript
app.get('router').replace('route', GET', '/', ...)

Provide, default, and replace all return a proxy object if called with no arguments, so these are synonymous with above:
```

```javascript
app.get('router').default().route('GET', '/', ...)
```

```javascript
app.get('router').replace().route('GET', '/', ...)
```

### use

Let another instance use this module's events to reduce boilerplate calls

**Parameters**

-   `instance`  

### default

Provide default arguments to a delayed gather() call, before other provides

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the gather event
-   `args` **...Any** Arguments to provide to the gather event

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Resolves when the event is eventually handled

### provide

Provide arguments to a delayed gather() call.

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the gather event
-   `args` **...Any** Arguments to provide to the gather event

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Resolves when the event is eventually handled

### replace

Provide a replacement for a delayed gather() call (after others are provided)

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the gather event
-   `args` **...Any** Arguments to provide to the gather event

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Resolves when the event is eventually handled

### gather

Receive arguments provided to a delayed gather() call.

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the gather event
-   `handler` **callable** The handler for each provided value

### request

Request the result of processing a named event

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the request event
-   `args` **...Any** Arguments to provide to the responder

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Resolves to the result of the event's handler

### respond

Respond to a named event

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the request event
-   `handler` **callable** The handler for the request

## PluginManager

The PluginManager handles all of the module loading.  Load order is as follows:

1.  Packages in node_modules that match the passed `namespace` config option, and packages in the `@nxus` namespace.
2.  Folders in the <appDir>/modules directory.
3.  Filepaths passed in the `modules` config option

### loadNxusModules

[loadNxusModules description]

**Parameters**

-   `options` **\[type]** [description]

Returns **\[type]** [description]

### loadAdditionalModules

[loadAdditionalModules description]

**Parameters**

-   `options` **\[type]** [description]
-   `packages` **\[type]** [description]

Returns **\[type]** [description]

### loadPassedPlugins

Loads manually passed in packages by path

**Parameters**

-   `options` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** configuration options
-   `packages` **packages** the array of packages currently loaded by Nxus

## Watcher

The Watcher class monitors the project directory and restarts the application whenever 
there is a change in files detected. Useful for development.
