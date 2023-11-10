import chalk from "chalk";
import { buildJS } from "./buildTools.mjs";

console.log(chalk.green("⏳ Init compile of JS"));
buildJS();
