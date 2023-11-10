//var browserSync = require('browser-sync'); //.create();
//var browserSync = require("browser-sync");
import browserSync from "browser-sync";
import chokidar from "chokidar";
import chalk from "chalk";
import { buildJS } from "./buildTools.mjs";
import { buildCSS } from "./buildTools.mjs";

let jsSrcFolder = "./src/js/**/*";
let sassSrcFolder = "./src/scss/**/*.scss";

var jsWatcher = chokidar.watch(jsSrcFolder, { persistent: true });
console.log(chalk.green("⏳ Watching folder " + jsSrcFolder));
jsWatcher.on("change", function (path) {
  console.log("Change in : " + path);
  buildJS();
});

var cssWatcher = chokidar.watch(sassSrcFolder, { persistent: true });
console.log(chalk.green("⏳ Watching folder " + sassSrcFolder));
cssWatcher.on("change", function (path) {
  console.log("Change in  : " + path);
  buildCSS();
});

// Start the server
browserSync({ server: "./dist" });

// Call methods like reload
//browserSync.reload("core.css");
