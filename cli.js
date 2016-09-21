#! /usr/bin/env node
const path = require('path');
const findRoot = require('find-root');
const main = require('./module');

const rootPath = findRoot(process.cwd());
const packagePath = path.resolve(rootPath, 'package.json');
const token = process.env.GITHUB_TOKEN;

main(token, packagePath);
