# Nxus Core

The Nxus Core package includes the basic Application framework for building a Nxus app.

## Installation

```
> npm install @nxus/core
```

## Usage

In your root application, create a new Application instance:

```
var Application = require('@nxus/core')

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


## License

The MIT License (MIT)

Copyright (c) 2015 ThirtyThings LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.