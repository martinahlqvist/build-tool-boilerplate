import fs from "fs";
import chalk from "chalk";
import { exec } from "child_process";

const webappsFolder = "./src/webapps";
const restappsFolder = "./src/restapps";
const rootFolder = "./";

console.log(chalk.green("Installing all webapps and restapps"));

const npmInstall = (folder) => {
  return new Promise((resolve, reject) => {
    // 🤓  exec(`cd ${folder} && npm install --install-strategy linked --no-fund`, (error, stdout, stderr) => {
    exec(
      `cd ${folder} && npm install --install-strategy hoisted --no-fund`,
      (error, stdout, stderr) => {
        if (error) {
          console.log(chalk.red(`Error: ${error.message}`));
          reject(error);
        }
        if (stderr) {
          console.log(chalk.red(`Stderr: ${stderr}`));
          reject(stderr);
        }
        resolve(stdout);
      }
    );
  }).then(console.log(chalk.green("👍 " + folder + " installed")));
};

const npmFindDupes = (folder) => {
  return new Promise((resolve, reject) => {
    exec(
      `cd ${folder} && npm find-dupes --install-strategy linked --no-fund`,
      (error, stdout, stderr) => {
        if (error) {
          console.log(chalk.red(`Error: ${error.message}`));
          reject(error);
        }
        if (stderr) {
          console.log(chalk.red(`Stderr: ${stderr}`));
          reject(stderr);
        }
        resolve(stdout);
      }
    );
  }).then(console.log(chalk.green("👍 Ran find-dupes on " + folder + ".")));
};

const dedupe = async (folder) => {
  return new Promise((resolve, reject) => {
    exec(`cd ${folder} && npm dedupe`, (error, stdout, stderr) => {
      if (error) {
        console.log(chalk.red(`Error: ${error.message}`));
        reject(error);
      }
      if (stderr) {
        console.log(chalk.red(`Stderr: ${stderr}`));
        reject(stderr);
      }
      console.log(chalk.green("👍 Ran npm dedupe on " + folder + "."));
      resolve(stdout);
    });
  }).then(console.log);
};

const npmCommands = async (folder) => {
  // await npmFindDupes(folder);
  await npmInstall(folder);
};

const installFolders = async (path) => {
  let folders = [];
  if (fs.existsSync(path)) {
    let directoryContents = await fs.promises.readdir(path, {
      withFileTypes: true,
    });
    directoryContents.map(function (dirent) {
      if (dirent.isDirectory()) {
        folders.push(dirent.name);
        let subFolderPath = path + "/" + dirent.name;
        console.log("subFolderPath: " + subFolderPath);
        npmCommands(subFolderPath);
        //uploadFiles(subFolderPath, dirent.name);
      }
    });
  } else {
    console.log(chalk.red("Unable to find folder using that path."));
  }
  return folders;
};

const run = async () => {
  installFolders(webappsFolder);
  installFolders(restappsFolder);

  await dedupe(rootFolder);
};

run();
