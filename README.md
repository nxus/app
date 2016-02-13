# Nxus Core

The Nxus Core package includes the basic Application framework for building a Nxus app.

[![Build Status](https://travis-ci.org/nxus/core.svg?branch=master)](https://travis-ci.org/nxus/core)

## Introduction

You'll probably find the following resources useful background and help in building Nxus applcations.

-   [Getting Started](<>) (TODO)
-   [Design Patterns](<>) (TODO)
-   [Nxus Modules](<>) (TODO)
-   [Recipes](<>) (TODO)
-   [Developing a ](<>) (TODO)

## Documentation

The full set of Nxus docs is available at [http://docs.gonxus.org](http://docs.gonxus.org).

## Installation

    > npm install @nxus/core --save

## Usage

In your root application, create a new Application instance:

    import {Application} from '@nxus/core'

    let app = new Application(options)

    app.start()

    export default app

### Events

Nxus is built around the concept of a boot cycle.  The application dispatches events in the following order:

1.  `init`: indicates the application is starting up and initializing modules.  Other modules are not gauranteed to be available at this phase.
2.  `load`: modules are initialized and loading. This is the place to do any internal setup (outside of the constructor). Other modules are not gauranteed to be available at this phase.
3.  `startup`: all modules have been loaded and are available. This is the place to do any setup that requires data/input from other modules (like Storage).
4.  `launch`: the application is launching and all services have been started. Routes are accessible. Use onceAfter('launch') to gaurantee execution after the application has completely launched.

### Module Loading

By defaul the Application will look for other Nxus modules in the following order:

1.  @nxus namespaced npm modules in your `package.json` file.
2.  Any packages that match the 'namespace-' pattern passed in the `namespace` application config option.
3.  folders in the ./modules folder in the root of your project
4.  any modules specified in the _modules_ option passed into Application on instantiation.

### Module Access

In order to access module commands, use the Application.get() method.

    let router = Application.get('router')

### Application Configuration Options

Available options are:

_appDir_: the location to use to load the default 'package.json' file. 

_namespace_: any additional namespaces to use to load modules in the node\_modules folder. Can be a string or array of strings.

_modules_: an array of paths to require into the application

_debug_: Boolean to display debug messages, including startup banner

_script_: Boolean to indicate the application is a CLI script, silences all logging/output messages except for explicit console.log calls

## API

### Application

[src/Application.js:45-279](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/Application.js#L45-L279 "Source code on GitHub")

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

#### boot

[src/Application.js:135-142](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/Application.js#L135-L142 "Source code on GitHub")

Boots the application, cycling through the internal boot stages.

**Note**: Should rarely be called directly. Instead use #start

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

#### get

[src/Application.js:107-110](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/Application.js#L107-L110 "Source code on GitHub")

Returns an internal Module object for the given name.

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the module to return

Returns **[Module](https://nodejs.org/api/modules.html)** 

#### init

[src/Application.js:119-126](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/Application.js#L119-L126 "Source code on GitHub")

Initializes the application by loading plugins, then booting the application.

**Note**: this should rarely be called directly. Instead use #start

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

#### restart

[src/Application.js:174-180](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/Application.js#L174-L180 "Source code on GitHub")

Restarts the Nxus application.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

#### start

[src/Application.js:163-167](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/Application.js#L163-L167 "Source code on GitHub")

Starts the Nxus application.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

#### stop

[src/Application.js:149-156](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/Application.js#L149-L156 "Source code on GitHub")

Stops the currently running application, removing all event listeners.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

### PluginManager

[src/PluginManager.js:23-213](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/PluginManager.js#L23-L213 "Source code on GitHub")

The PluginManager handles all of the module loading.  Load order is as follows:

1.  Packages in node\_modules that match the passed `namespace` config option, and packages in the `@nxus` namespace.
2.  Folders in the <appDir>/modules directory.
3.  Filepaths passed in the `modules` config option

#### accumulatePackage

[src/PluginManager.js:77-84](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/PluginManager.js#L77-L84 "Source code on GitHub")

Creates the internal representation of a package

**Parameters**

-   `packages` **[array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** the list of active packages being loaded by Nxus
-   `directory` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the directory of the new package to load

Returns **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** the package, as returned by `require`

#### arrayify

[src/PluginManager.js:44-47](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/PluginManager.js#L44-L47 "Source code on GitHub")

Helper method to ensure a passed variable is an array. Wraps the value in an array if it isn't already.

**Parameters**

-   `el` **anything** the item to ensure is an array

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** either a new empty array, or el as is if its an array, or el wrapped in an array.

#### getDeps

[src/PluginManager.js:64-69](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/PluginManager.js#L64-L69 "Source code on GitHub")

Loads the dependencies for a particular package, as defined by the 'dependencies' object in the package.json file.

**Parameters**

-   `pkg` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** the package object generated by accumulatePackage()

Returns **[array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** an array of the package's dependencies, as filepaths or node\_module names

#### getPluginPackageJson

[src/PluginManager.js:54-57](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/PluginManager.js#L54-L57 "Source code on GitHub")

Loads the package.json file for the specified packages.

**Parameters**

-   `path` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the root package folder path

Returns **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** the parsed json object in package.json

#### loadCustomPlugins

[src/PluginManager.js:172-193](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/PluginManager.js#L172-L193 "Source code on GitHub")

Loads custom plugins in the <appDir>/modules directory

**Parameters**

-   `options` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** configuration options
-   `packages` **packages** the array of packages currently loaded by Nxus

#### loadPackage

[src/PluginManager.js:92-123](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/PluginManager.js#L92-L123 "Source code on GitHub")

Loads a package

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the package
-   `directory` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** A path to the package
-   `packages` **[array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** An array of the currently loaded packages

#### loadPackages

[src/PluginManager.js:130-165](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/PluginManager.js#L130-L165 "Source code on GitHub")

Loads all Nxus pacakges for an application

**Parameters**

-   `options` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** options to use to load the packages
-   `packages` **packages** the array of packages currently loaded by Nxus

#### loadPassedPlugins

[src/PluginManager.js:200-212](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/PluginManager.js#L200-L212 "Source code on GitHub")

Loads manually passed in packages by path

**Parameters**

-   `options` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** configuration options
-   `packages` **packages** the array of packages currently loaded by Nxus

### Dispatcher

[src/Dispatcher.js:22-125](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/Dispatcher.js#L22-L125 "Source code on GitHub")

**Extends EventEmitter**

The core Dispatcher class, which implements promisified

**Examples**

```javascript
import { Dispatcher } from '@nxus/core'
class MyClass extends Dispatcher {
  ...
}
```

#### after

[src/Dispatcher.js:74-76](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/Dispatcher.js#L74-L76 "Source code on GitHub")

Bind to after an event. Receives the event handlers results, should return 
 modified results or nothing.

**Parameters**

-   `event` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the event to bind to
-   `listener` **callable** The after handler for the event

#### before

[src/Dispatcher.js:64-66](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/Dispatcher.js#L64-L66 "Source code on GitHub")

Bind to before an event. Receives the event arguments, should return 
 modified arguments or nothing.

**Parameters**

-   `event` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the event to bind to
-   `listener` **callable** The before handler for the event

#### emit

[src/Dispatcher.js:106-124](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/Dispatcher.js#L106-L124 "Source code on GitHub")

Emits an event, calling all registered handlers.

**Parameters**

-   `event` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the event to emit.
-   `args` **...Any** Arguments to the event handlers

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Returns a promise that resolves when all handlers have completed, with any returned results as an array.

#### once

[src/Dispatcher.js:34-56](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/Dispatcher.js#L34-L56 "Source code on GitHub")

Bind to an event once

**Parameters**

-   `event` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the event to bind to
-   `listener` **callable=** The handler for the event

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Returns a promise that resolves when the event fires

#### onceAfter

[src/Dispatcher.js:96-98](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/Dispatcher.js#L96-L98 "Source code on GitHub")

Bind once to after an event. Receives the event handlers results, should return 
 modified results or nothing.

**Parameters**

-   `event` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the event to bind to
-   `listener` **callable** The after handler for the event

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Returns a promise that resolves when the event fires

#### onceBefore

[src/Dispatcher.js:85-87](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/Dispatcher.js#L85-L87 "Source code on GitHub")

Bind once to before an event. Receives the event arguments, should return 
 modified arguments or nothing.

**Parameters**

-   `event` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the event to bind to
-   `listener` **callable** The before handler for the event

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Returns a promise that resolves when the event fires

### ConfigurationManager

[src/ConfigurationManager.js:20-87](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/ConfigurationManager.js#L20-L87 "Source code on GitHub")

ConfigurationManager loads the internal app.config hash using the following order (each overwrites any values of the previous):

1.  Opts loaded into the application object.
2.  Opts in the `config` hash of the project package.json file
3.  Any environment variables

#### getConfig

[src/ConfigurationManager.js:77-86](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/ConfigurationManager.js#L77-L86 "Source code on GitHub")

Returns the final config option using the loading order described above.

Returns **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** the final composed configuration object.

#### getEnvironmentVariables

[src/ConfigurationManager.js:61-71](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/ConfigurationManager.js#L61-L71 "Source code on GitHub")

Extracts the currently avaiable environment variables

Returns **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** A hash of the current environment variables

#### getNodeEnv

[src/ConfigurationManager.js:30-32](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/ConfigurationManager.js#L30-L32 "Source code on GitHub")

Returns the current NODE\_ENV

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the current NODE\_ENV

#### getPackageJSONConfig

[src/ConfigurationManager.js:38-55](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/ConfigurationManager.js#L38-L55 "Source code on GitHub")

Gets the local package.json file and tries to find an internal `config` key

Returns **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** the intenral `config` object or an empty object if it isn't defined.

### Module

[src/Module.js:23-149](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/Module.js#L23-L149 "Source code on GitHub")

**Extends Dispatcher**

The core Module class. This provides a messaging proxy layer between modules and calling code.
The main advantage of this proxy class is that missing modules won't cause exceptions in the code.

Modules are accessed through the Application.get() method

**Examples**

```javascript
let router = app.get('router')
```

#### gather

[src/Module.js:118-127](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/Module.js#L118-L127 "Source code on GitHub")

Receive arguments provided to a delayed gather() call.

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the gather event
-   `handler` **callable** The handler for each provided value

#### provide

[src/Module.js:84-93](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/Module.js#L84-L93 "Source code on GitHub")

Provide arguments to a delayed gather() call.

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the gather event
-   `args` **...Any** Arguments to provide to the gather event

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Resolves when the event is eventually handled

#### provideAfter

[src/Module.js:102-109](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/Module.js#L102-L109 "Source code on GitHub")

Provide arguments to a delayed gather() call, after the main provide() calls.

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the gather event
-   `args` **...Any** Arguments to provide to the gather event

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Resolves when the event is eventually handled

#### provideBefore

[src/Module.js:68-75](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/Module.js#L68-L75 "Source code on GitHub")

Provide arguments to a delayed gather() call, but do it before the other provide() calls.

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the gather event
-   `args` **...Any** Arguments to provide to the gather event

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Resolves when the event is eventually handled

#### request

[src/Module.js:136-138](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/Module.js#L136-L138 "Source code on GitHub")

Request the result of processing a named event

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the request event
-   `args` **...Any** Arguments to provide to the responder

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Resolves to the result of the event's handler

#### respond

[src/Module.js:146-148](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/Module.js#L146-L148 "Source code on GitHub")

Respond to a named event

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the request event
-   `handler` **callable** The handler for the request

#### use

[src/Module.js:41-59](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/Module.js#L41-L59 "Source code on GitHub")

Let another instance use this module's events to reduce boilerplate calls

**Parameters**

-   `instance`  

### Watcher

[src/Watcher.js:14-53](https://github.com/nxus/core/blob/235bab3b18e9b8bde7795cc542e85072be780911/src/Watcher.js#L14-L53 "Source code on GitHub")

The Watcher class monitors the project directory and restarts the application whenever 
there is a change in files detected. Useful for development.
