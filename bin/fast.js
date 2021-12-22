#!/usr/bin/env node
const program = require('commander')
program.version('1.3.1')
    .usage('<command> [项目名称]')
    .command('init', '初始化项目')
    .parse(process.argv)