# Build Tool Boilerplate

The purpose of this boilerplate is to provide a simple, lightweight, and resilient build tool for your projects specifically with Sitevision CMS in mind.

## Quick Start

Each task has just one or two dependencies, so I recommend deleting the ones you don't need before running `npm install`. Learn more in [the documentation](#documentation) below.

1. In bash/terminal/command line, `cd` into your project directory.
2. Run `npm install`.
3. Run `npm run build`.

## Documentation

This is a boilerplate that you can use as a starting point for your projects.

[Running Tasks](#running-tasks) · [JavaScript](#javascript) · [Sass => CSS](#sass--css) · [Copy Files](#copy-files) · [Clean](#clean) · [Complete Build](#complete-build) · [Watch for Changes](#watch-for-changes) · [Server](#server)

### Running Tasks

The boilerplate uses the `npm run` command to run tasks. These work on macOS, Linux, and Windows systems.

```bash
# Main Tasks
npm run js              # compile and minify
npm run css             # compile and minify Sass into CSS
npm run copy            # copy files from the src/copy directory as-is into /dist
npm run clean           # delete the /dist directory
npm run build           # run all tasks
npm run watch           # watch for changes and rebuild
npm run server          # run a localhost server that reloads when files change
npm run deploy-files    # deploy files to Sitevision (needs a restApp (file-handler) to be build and configured first)

# Modular Tasks
npm run watch-js        # watch for changes to the /js directory
npm run watch-css       # watch for changes to the /css directory
npm run watch-copy      # watch for changes to the /copy directory
npm run build-dirty     # run a new build without deleting the /dist directory
npm run server-start    # start a server without watching for changes
```

### JavaScript and CSS

The boilerplate uses [rollup.js](https://rollupjs.org) with the [terser](https://terser.org/) plugin to parse, compile, and minify JavaScript files.

The boilerplate uses the Node implementation of [dart-sass](https://sass-lang.com/dart-sass) to parse `.scss` files into CSS.

A banner is automatically generated from your `package.json` data for both JS and CSS files. It includes the project name and version, a copyright notice with the current year and the package author name, the license type, and a link to the project repository.

Also in the `package.json` file, there's a section that you can use to control the src and destination of the JS and SCSS/CSS files.

```js
// Configs
"configs": {
    "css": {
      "pathIn": "src/scss",
      "pathOut": "dist/css",
      "minify": true
    },
    "js": {
      "pathIn": "src/js",
      "pathOut": "dist/js"
    }
  },
```

_If a `configs.name` property is included, that will be used. If not, the banner defaults to the `name` property in your `package.json` file._

```js
// Banner
var banner = `/*! ${configs.name ? configs.name : pkg.name} v${
  pkg.version
} | (c) ${new Date().getFullYear()} ${pkg.author.name} | ${
  pkg.license
} License | ${pkg.repository.url} */`;
```

_**Note for FireFox users:** ensure that ['Use Source Maps'](https://github.com/cferdinandi/build-tool-boilerplate/issues/7#issuecomment-811432626), and ['Show original sources'](https://github.com/cferdinandi/build-tool-boilerplate/issues/7#issuecomment-811855711) options are enabled in Developer Tools._

### Copy Files

The boilerplate uses [recursive-fs](https://github.com/simov/recursive-fs) to provide a cross-OS copying solution. This package is also used for the `clean` task, so only remove it if you're deleting both tasks.

```json
{
  "devDependencies": {
    "recursive-fs": "^2.1.0"
  }
}
```

If you have files you want copied as-is, place them in the `src/copy` directory.

Use this task to run the build.

```bash
npm run copy
```

### Clean

The boilerplate uses [recursive-fs](https://www.npmjs.com/package/recursive-fs) to provide a cross-OS recursive directory deleting solution. This package is also used for the `copy` task, so only remove it if you're deleting both tasks.

```json
{
  "devDependencies": {
    "recursive-fs": "^2.1.0"
  }
}
```

You can delete the `/dist` directory before running a build to clean up any junk that might have ended up there. The `build` task runs this task before doing anything else.

```bash
npm run clean
```

### Complete Build

It's possible to upload all JS and CSS files with the `npm run deploy-files`

```bash
npm run build
```

If you want to run your build _without_ first deleting the `/dist` directory, run this task instead.

```bash
npm run build-dirty
```

Regardless of which task you use, be sure to delete any tasks you're not using from the `build-dirty` task under `scripts` in your `package.json` file first. The `npm-run-all -p` command is used to run all tasks in parallel ([see below for more details](#core-dependencies)).

```bash
# default build-dirty task
npm-run-all -p js css copy
```

### Watch for Changes

The boilerplate uses [Chokidar CLI](https://www.npmjs.com/package/chokidar-cli) to watch for changes to the `/src` directory and run tasks in response.

```json
{
  "devDependencies": {
    "chokidar-cli": "^2.1.0"
  }
}
```

Use this task to watch for changes and run a build. It will also run a fresh build when it starts.

```bash
npm run watch
```

If you only want to watch for changes to a specific directory in `/src`, you can use a task-specific watcher task.

```bash
npm run watch-js   # watch for changes to the /js directory
npm run watch-css  # watch for changes to the /css directory
npm run watch-copy # watch for changes to the /copy directory
```

## Server

The boilerplate uses [Browsersync](https://www.browsersync.io/) to run a local server and automatically update it whenever your files change.

```json
{
  "devDependencies": {
    "browser-sync": "^2.26.14"
  }
}
```

Use this task to watch for changes. It will also run the `watch` task, and automatically rebuild whenever a file in `/src` changes.

```bash
npm run server
```

If you want to run the server _without_ the `watch` task, run this task instead.

```bash
npm run server-start
```

## Upload files to Sitevision

In order to upload files to to the sitevision server you first need to create a restApp that handles the upload. The restApp is called `file-handler` and is located in the `src/restApps` folder. [file-handler read.me](src/restApps/file-handler/README.md).

You also need to create a `.deploy_properties.json` file in the root of the project. This file should contain the following properties:

```json
{
  "domain": "http://localhost",
  "distFolder": "./dist",
  "username": "system",
  "password": "system"
}
```

Use this task to upload folder with files.

```bash
npm run deploy-files
```

## Core Dependencies

The boilerplate uses [npm-run-all](https://www.npmjs.com/package/npm-run-all) to run tasks consistently across different operating systems, and in parallel.

```json
{
  "devDependencies": {
    "npm-run-all": "^4.1.5"
  }
}
```

The `npm-run-all` package removes the need for Windows-specific tasks.

It also allows you to run tasks in parallel. By running all of the tasks in the `build` tasks at the same time, you dramatically reduce the build time. This is also what makes it possible to run a localhost server _and_ watch for file changes in one task.

**In other words, don't remove this dependency.**

## Sitevision webapps

In order to create new webApps and restApps follow these steps:

```bash
# Navigate to src/webapps or src/restapps in the terminal
cd src/webapps
# Create web or rest app with the following command
npx @sitevision/create-sitevision-app@3 your-app-name
```

## Why does this exist?

For years, I've been an avid [Gulp](https://gulpjs.com/) user. Gulp is great. But it's also _a lot_.

**I wanted a simpler, more resilient, leaner set of build tools.**

I'm tired of having to repair my build anytime I don't use it for a few months. I'm tired of installing 270mb of `node_modules` dependencies to build a simple website or web app.

With NPM, you can build a simplish build tool that does just what you want (_and nothing more_) with a fraction of the footprint.

❤️ _This boilerplate is heavily based on [Build Tool Boilerplate](https://github.com/cferdinandi/build-tool-boilerplate) by Chris Ferdinandi (cferdinandi)_

❤️ _Major kudos to Keith Cirkel for [teaching me about this years ago](https://www.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/), before I was ready to hear it._
