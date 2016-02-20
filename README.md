# @nxus/core

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

1.  `init`: indicates the application is starting up and initializing modules.  Other modules are not gauranteed to be available at this phase.
2.  `load`: modules are initialized and loading. This is the place to do any internal setup (outside of the constructor). Other modules are not gauranteed to be available at this phase.
3.  `startup`: all modules have been loaded and are available. This is the place to do any setup that requires data/input from other modules (like Storage).
4.  `launch`: the application is launching and all services have been started. Routes are accessible. Use onceAfter('launch') to gaurantee execution after the application has completely launched.

#### Module Loading

By defaul the Application will look for other Nxus modules in the following order:

1.  @nxus namespaced npm modules in your `package.json` file.
2.  Any packages that match the 'namespace-' pattern passed in the `namespace` application config option.
3.  folders in the ./modules folder in the root of your project
4.  any modules specified in the _modules_ option passed into Application on instantiation.

#### Module Access

In order to access module commands, use the Application.get() method.

    let router = Application.get('router')

#### Application Configuration Options

Available options are:

_appDir_: the location to use to load the default 'package.json' file. 

_namespace_: any additional namespaces to use to load modules in the node\_modules folder. Can be a string or array of strings.

_modules_: an array of paths to require into the application

_debug_: Boolean to display debug messages, including startup banner

_script_: Boolean to indicate the application is a CLI script, silences all logging/output messages except for explicit console.log calls

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

### boot

Boots the application, cycling through the internal boot stages.

**Note**: Should rarely be called directly. Instead use #start

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

### get

Returns an internal Module object for the given name.

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the module to return

Returns **[Module](https://nodejs.org/api/modules.html)** 

### init

Initializes the application by loading plugins, then booting the application.

**Note**: this should rarely be called directly. Instead use #start

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

### restart

Restarts the Nxus application.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

### start

Starts the Nxus application.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

### stop

Stops the currently running application, removing all event listeners.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

## PluginManager

The PluginManager handles all of the module loading.  Load order is as follows:

1.  Packages in node\_modules that match the passed `namespace` config option, and packages in the `@nxus` namespace.
2.  Folders in the <appDir>/modules directory.
3.  Filepaths passed in the `modules` config option

### accumulatePackage

Creates the internal representation of a package

**Parameters**

-   `packages` **[array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** the list of active packages being loaded by Nxus
-   `directory` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the directory of the new package to load

Returns **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** the package, as returned by `require`

### arrayify

Helper method to ensure a passed variable is an array. Wraps the value in an array if it isn't already.

**Parameters**

-   `el` **anything** the item to ensure is an array

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** either a new empty array, or el as is if its an array, or el wrapped in an array.

### getDeps

Loads the dependencies for a particular package, as defined by the 'dependencies' object in the package.json file.

**Parameters**

-   `pkg` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** the package object generated by accumulatePackage()

Returns **[array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** an array of the package's dependencies, as filepaths or node\_module names

### getPluginPackageJson

Loads the package.json file for the specified packages.

**Parameters**

-   `path` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the root package folder path

Returns **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** the parsed json object in package.json

### loadCustomPlugins

Loads custom plugins in the <appDir>/modules directory

**Parameters**

-   `options` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** configuration options
-   `packages` **packages** the array of packages currently loaded by Nxus

### loadPackage

Loads a package

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the package
-   `directory` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** A path to the package
-   `packages` **[array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** An array of the currently loaded packages

### loadPackages

Loads all Nxus pacakges for an application

**Parameters**

-   `options` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** options to use to load the packages
-   `packages` **packages** the array of packages currently loaded by Nxus

### loadPassedPlugins

Loads manually passed in packages by path

**Parameters**

-   `options` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** configuration options
-   `packages` **packages** the array of packages currently loaded by Nxus

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

### after

Bind to after an event. Receives the event handlers results, should return 
 modified results or nothing.

**Parameters**

-   `event` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the event to bind to
-   `listener` **callable** The after handler for the event

### before

Bind to before an event. Receives the event arguments, should return 
 modified arguments or nothing.

**Parameters**

-   `event` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the event to bind to
-   `listener` **callable** The before handler for the event

### emit

Emits an event, calling all registered handlers.

**Parameters**

-   `event` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the event to emit.
-   `args` **...Any** Arguments to the event handlers

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Returns a promise that resolves when all handlers have completed, with any returned results as an array.

### once

Bind to an event once

**Parameters**

-   `event` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the event to bind to
-   `listener` **callable=** The handler for the event

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Returns a promise that resolves when the event fires

### onceAfter

Bind once to after an event. Receives the event handlers results, should return 
 modified results or nothing.

**Parameters**

-   `event` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the event to bind to
-   `listener` **callable** The after handler for the event

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Returns a promise that resolves when the event fires

### onceBefore

Bind once to before an event. Receives the event arguments, should return 
 modified arguments or nothing.

**Parameters**

-   `event` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the event to bind to
-   `listener` **callable** The before handler for the event

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Returns a promise that resolves when the event fires

## ConfigurationManager

ConfigurationManager loads the internal app.config hash using the following order (each overwrites any values of the previous):

1.  Opts loaded into the application object.
2.  Opts in the `config` hash of the project package.json file
3.  Any environment variables

### getConfig

Returns the final config option using the loading order described above.

Returns **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** the final composed configuration object.

### getEnvironmentVariables

Extracts the currently avaiable environment variables

Returns **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** A hash of the current environment variables

### getNodeEnv

Returns the current NODE\_ENV

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the current NODE\_ENV

### getPackageJSONConfig

Gets the local package.json file and tries to find an internal `config` key

Returns **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** the intenral `config` object or an empty object if it isn't defined.

## Module

**Extends Dispatcher**

The core Module class. This provides a messaging proxy layer between modules and calling code.
The main advantage of this proxy class is that missing modules won't cause exceptions in the code.

Modules are accessed through the Application.get() method

**Examples**

```javascript
let router = app.get('router')
```

### gather

Receive arguments provided to a delayed gather() call.

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the gather event
-   `handler` **callable** The handler for each provided value

### provide

Provide arguments to a delayed gather() call.

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the gather event
-   `args` **...Any** Arguments to provide to the gather event

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Resolves when the event is eventually handled

### provideAfter

Provide arguments to a delayed gather() call, after the main provide() calls.

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the gather event
-   `args` **...Any** Arguments to provide to the gather event

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Resolves when the event is eventually handled

### provideBefore

Provide arguments to a delayed gather() call, but do it before the other provide() calls.

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the gather event
-   `args` **...Any** Arguments to provide to the gather event

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Resolves when the event is eventually handled

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

### use

Let another instance use this module's events to reduce boilerplate calls

**Parameters**

-   `instance`  

## Watcher

The Watcher class monitors the project directory and restarts the application whenever 
there is a change in files detected. Useful for development.
