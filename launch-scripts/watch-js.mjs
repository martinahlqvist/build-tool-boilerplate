import chokidar from "chokidar";
import chalk from "chalk";
import { buildJS } from "./buildTools.mjs";

let jsSrcFolder = "./src/js/**/*";
var watcher = chokidar.watch(jsSrcFolder, { persistent: true });
console.log(chalk.green("⏳ Watching folder  " + jsSrcFolder));
watcher.on("change", function (path) {
  console.log("Change in : " + path);
  buildJS();
});
