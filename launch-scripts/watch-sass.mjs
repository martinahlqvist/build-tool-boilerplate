import chokidar from "chokidar";
import chalk from "chalk";
import { buildCSS } from "./buildTools.mjs";

let sassSrcFolder = "./src/scss/**/*.scss";

var watcher = chokidar.watch(sassSrcFolder, { persistent: true });
console.log(chalk.green("⏳ Watching folder " + sassSrcFolder));
watcher.on("change", function (path) {
  console.log("Change in  : " + path);
  buildCSS();
});
