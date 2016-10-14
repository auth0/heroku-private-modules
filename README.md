# This package is deprecated

Doesn't work with private packages inside other packages, I tried to solve this using the [npm hook](https://docs.npmjs.com/misc/scripts#hook-scripts) preinstall but this npm bug/feature makes the solution inviable [preinstall execution order in npm@3.x](https://github.com/npm/npm/issues/10379#issuecomment-163316532).

See [next](https://github.com/auth0/heroku-private-modules/tree/next) branch for the last unreleased version.

# Heroku Private Modules

Use private GitHub repos as npm dependencies on Heroku.

Heroku doesn't has access to your private git repositories so every deploy of an app with private git dependencies fails.

This changes your `package.json` private GitHub dependencies (before Heroku installs your dependencies) with a url of the dependency with a GitHub access token.

## Installation

```bash
npm i --save heroku-private-modules
```

## Usage

1. [Create a Github OAuth token with "repo" scope](https://help.github.com/articles/creating-an-access-token-for-command-line-use/).
2. [Set on Heroku the config var `GITHUB_TOKEN` with the token of the previous step](https://devcenter.heroku.com/articles/config-vars#setting-up-config-vars-for-a-deployed-application).
3. On your app add the [npm script](https://docs.npmjs.com/misc/scripts) heroku-prebuild with `npm i heroku-private-modules && heroku-private-modules`.
```json
"heroku-prebuild": "npm i heroku-private-modules && heroku-private-modules"
```

## Background

I choose this solution to have the secrets out of the source control, keep the projects with the minimum configuration required and also because it seems to me the less risky solution.

**Recommendation**: create a GitHub user and only give him permissions to the required private repos, and use the token from this account. So if the token gets compromised the attacker will only access to only a part of the privates repos of your org/personal user.

Other solutions with different tradeoffs:
- [Put your SSH key as Heroku config var and setup the SSH key on every deploy with a couple of npm scripts](http://stackoverflow.com/a/29677091).
- [Embed the username and password of your GitHub account into the dependency URL](http://stackoverflow.com/a/13353408).
- [Embed the Github OAuth token into the dependency URL](http://rzrsharp.net/2013/07/02/private-github-repos-with-npm-and-heroku.html).
- [Use a custom node Heroku buildpack](https://github.com/siassaj/heroku-buildpack-git-deploy-keys).

## License

Heroku Private Modules is [MIT licensed](./LICENSE.md).
