#!/usr/bin/env node

var Application = require('../lib').Application;
var app = new Application({appDir: process.cwd()});
app.start();
