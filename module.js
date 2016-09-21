const fs = require('fs');
const axios = require('axios');
const hostedGitInfo = require('hosted-git-info');

const dependenciesFields = [
  'dependencies', 'devDependencies', 'peerDependencies',
  'bundledDependencies', 'optionalDependencies'
];

module.exports = (token, packagePath) => {
  if (!token) throw new Error('GitHub token is required.');
  if (!packagePath) throw new Error('package.json path is required.');

  const packageRaw = readPackageJson(packagePath);
  const packageParsed = JSON.parse(packageRaw);
  const existingDepFields = dependenciesFields.filter(field => !!packageParsed[field]);

  existingDepFields.forEach(field => {
    const deps = packageParsed[field];
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
            deps[depName] = githubTokenizeUrl(token, indentifyDep.https());
            savePackageJson(packagePath, JSON.stringify(packageParsed, null, 2));
          });
      });
  });
};

function readPackageJson(packagePath) {
  return fs.readFileSync(packagePath, 'utf8');
}

function isPublicRepo(urlToCheck) {
  return axios.get(urlToCheck);
}

function githubTokenizeUrl(token, url) {
  const initial = 'git+https://';
  const newUrl = url.replace(initial, `${initial}${token}:x-oauth-basic@`);

  return newUrl;
}

function savePackageJson(packagePath, stringifiedJson) {
  return fs.writeFileSync(packagePath, stringifiedJson);
}
