# Nxus Core

The Nxus Core package includes the basic Application framework for building a Nxus app.

[![Build Status](https://travis-ci.org/nxus/core.svg?branch=master)](https://travis-ci.org/nxus/core)

## Introduction

You'll probably find the following resources useful background and help in building Nxus applcations.

* [Getting Started]() (TODO)
* [Design Patterns]() (TODO)
* [Nxus Modules]() (TODO)
* [Recipes]() (TODO)
* [Developing a ]() (TODO)

## Installation

```
> npm install @nxus/core --save
```

## Usage

In your root application, create a new Application instance:

```
import {Application} from '@nxus/core'

let app = new Application(options)

app.start()

export default app
```

### Events

Nxus is built around the concept of a boot cycle.  The application dispatches events in the following order:

1. `init`: indicates the application is starting up and initializing modules.  Other modules are not gauranteed to be available at this phase.
1. `load`: modules are initialized and loading. This is the place to do any internal setup (outside of the constructor). Other modules are not gauranteed to be available at this phase.
1. `startup`: all modules have been loaded and are available. This is the place to do any setup that requires data/input from other modules (like Storage).
1. `launch`: the application is launching and all services have been started. Routes are accessible. Use onceAfter('launch') to gaurantee execution after the application has completely launched.

### Module Loading

By defaul the Application will look for other Nxus modules in the following order:

1. @nxus namespaced npm modules in your `package.json` file.
1. Any packages that match the 'namespace-' pattern passed in the `namespace` application config option.
1. folders in the ./modules folder in the root of your project
1. any modules specified in the *modules* option passed into Application on instantiation.

### Module Access

In order to access module commands, use the Application.get() method.

```
let router = Application.get('router')
```

### Application Configuration Options

Available options are:

*appDir*: the location to use to load the default 'package.json' file. 

*namespace*: any additional namespaces to use to load modules in the node_modules folder. Can be a string or array of strings.

*modules*: an array of paths to require into the application

*debug*: Boolean to display debug messages, including startup banner

*script*: Boolean to indicate the application is a CLI script, silences all logging/output messages except for explicit console.log calls


