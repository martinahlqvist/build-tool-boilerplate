/**
 * This script goes through all webapps and deploys to the local sitevision server
 */

import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import chalk from "chalk";

// Fetches settings with url for the server, username and password from external file .deploy_properties.json in the web directory root
/*
{
    "domain": "dev.localhost",
    "distFolder" : "./dist",
    "username": "system",
    "password": "system"
}
*/
const deploy_properties = JSON.parse(
	fs.readFileSync("./.deploy_properties.json")
);
const postFileToUrl =
	deploy_properties.domain + "/rest-api/file-handler/createFileFromTemp"; // This is the path to the restApp that handles file uploads. Make sure to enable POST access in Sitevision.

const axiosInstance = axios.create({
	baseURL: deploy_properties.domain,
	auth: {
		username: deploy_properties.username,
		password: deploy_properties.password,
	},
});

/**
 * Create a FormData object and post it to a url with axios
 * @param {*} file
 * @param {*} subfolder
 * @returns true if the file was uploaded successfully
 */
const postFile = async (file, subfolder) => {
	const form = new FormData();
	let success = false;
	const filePath = deploy_properties.distFolder + "/" + subfolder + "/" + file;
	form.headers = {
		"Content-Type": "multipart/form-data",
	};
	form.append("file", fs.createReadStream(filePath));
	form.append("subFolder", subfolder);
	axiosInstance
		.post(postFileToUrl, form, {
			headers: form.getHeaders(),
		})
		.then((response) => {
			if (response.data.success === true) {
				console.log(
					chalk.green("Ok 👍  -> "),
					chalk.magenta(`${subfolder}/${file} (${response.data.message})`)
				);
				success = true;
			} else {
				console.log(chalk.red(`${subfolder}/${file} didn't upload`));
				console.log(response.data.message);
			}
		})
		.catch((error) => {
			console.error("Oops!");
			console.error(error);
		});
	return success;
};

/**
 * Gets the path to the folder and sends the names of the files in the folder to postFile
 * @param {string} folder - Path to the source folder of which the contents should be uploaded
 * @param {string} target - Name of the target folder in Sitevision
 * @returns {Promise<string[]>} - Array of which folder are present in the folder
 */
const uploadFiles = async (folder, target) => {
	let files = [];
	if (!folder) {
		console.log(chalk.red("No target folder specified."));
		return files;
	}
	try {
		files = await fs.promises.readdir(folder);
		console.log(
			chalk.green(
				"⏳ Uploading " + files.length + " " + target + "-files"
			)
		);
		for (let i = 0; i < files.length; i++) {
			let file = files[i];
			postFile(file, target);
		}
		return files;
	} catch (e) {
		console.error(e);
	}
};

/**
 * Checks what folders are present in a folder and sends the names of the folders to uploadFiles
 * @param {string} path - Path to the source folder of which the contents should be uploaded
 * @returns {Promise<string[]>} - Array of which folder are present in the folder
 */
const deployFolders = async (path) => {
	let folders = [];
	if (fs.existsSync(path)) {
		let directoryContents = await fs.promises.readdir(path, {
			withFileTypes: true,
		});
		directoryContents.map(function (dirent) {
			if (dirent.isDirectory()) {
				folders.push(dirent.name);
				let subFolderPath = path + "/" + dirent.name;
				uploadFiles(subFolderPath, dirent.name);
			}
		});
	} else {
		console.log(chalk.red("Unable to find folder using that path."));
	}
	return folders;
};

let folders = await deployFolders(deploy_properties.distFolder);
