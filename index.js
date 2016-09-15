#! /usr/bin/env node
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const findRoot = require('find-root');
const hostedGitInfo = require('hosted-git-info');

const rootPath = findRoot(process.cwd());
const packagePath = path.resolve(rootPath, 'package.json');
const dependenciesFields = [
  'dependencies', 'devDependencies', 'peerDependencies',
  'bundledDependencies', 'optionalDependencies'
];
const token = process.env.GITHUB_TOKEN;

if (!token) {
  console.error('Define GITHUB_TOKEN on the Heroku panel and set it to required on app.json');
  process.exit(1);
}

readPackageJson(packageRaw => {
  const parsedPackage = JSON.parse(packageRaw);
  const existingDepFields = dependenciesFields.filter(field => !!parsedPackage[field]);

  existingDepFields.forEach(field => {
    const deps = parsedPackage[field];
    const depsNames = Object.keys(deps);

    depsNames
      .forEach(depName => {
        const semver = deps[depName];
        const indentifyDep = hostedGitInfo.fromUrl(semver);
        const isTypeGitHub = indentifyDep && indentifyDep.type === 'github';
        if (!isTypeGitHub) return;
        const urlToCheck = indentifyDep.bugs();

        isPublicRepo(urlToCheck)
          .catch(error => {
            if (error.response.status !== 404) return;
            deps[depName] = githubTokenizeUrl(indentifyDep.https());
            savePackageJson(JSON.stringify(parsedPackage, null, 2));
          });
      });
  });
});

function readPackageJson(cb) {
  fs.readFile(packagePath, 'utf8', (error, packageRaw) => {
    if (error) {
      console.error('Failed while reading the package.json');
      process.exit(1);
    }
    cb(packageRaw);
  });
}

function isPublicRepo(urlToCheck) {
  return axios.get(urlToCheck);
}

function githubTokenizeUrl(url) {
  const initial = 'git+https://';
  const newUrl = url.replace(initial, `${initial}${token}:x-oauth-basic@`);

  return newUrl;
}

function savePackageJson(stringifiedJson) {
  fs.writeFile(packagePath, stringifiedJson, (err) => {
    if (err) {
      console.error('Failed while saving the package.json');
      process.exit(1);
    }
  });
}
