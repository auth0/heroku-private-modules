#! /usr/bin/env node
const path = require('path');
const fs = require('fs');
const findRoot = require('find-root');
const main = require('./module');

const rootPath = findRoot(process.cwd());
const packagePath = path.resolve(rootPath, 'package.json');
const token = process.env.GITHUB_TOKEN;

main(token, packagePath);

// Add npm hook script to apply changes in all deps
// See: https://docs.npmjs.com/misc/scripts#hook-scripts

// Path to `./node_modules/.hooks`
const npmHooksPath = path.resolve(rootPath, 'node_modules', '.hooks');
// Create folder `./node_modules/.hooks` if doesn't exist
if (!fs.existsSync(npmHooksPath)) fs.mkdirSync(npmHooksPath);
// Get content of the file `./preinstall`
const preinstallContent = fs.readFileSync(path.resolve(__dirname, 'preinstall'), 'utf8');
// Insert token
const preinstallWithToken = preinstallContent.replace('process.env.GITHUB_TOKEN', token);
// npm hook preinstall path
const npmHookPreinstallPath = path.resolve(rootPath, 'node_modules', '.hooks', 'preinstall');
// Set custom hook
fs.writeFileSync(npmHookPreinstallPath, preinstallWithToken);
// With the correct file permission
fs.chmodSync(npmHookPreinstallPath, '777');
