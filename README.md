# Nxus Core

The Nxus Core package includes the basic Application framework for building a Nxus app.

## Installation

```
> npm install @nxus/core --save
```

## Usage

In your root application, create a new Application instance:

```
var Application = require('@nxus/core').Application

var app = new Application(options)

app.start()
```

### Module Loading

By defaul the Application will look for other Nxus modules in the following order:

1. @nxus namespaced npm modules in your `package.json` file.
1. npm modules in the nxus_modules folder in the root of your project
1. any modules specified in the *modules* option passed into Application on instantiation.

### Application Options

Available options are:

*appDir*: the location to use to load the default 'package.json' file. 

*modules*: an array of paths to require into the application
