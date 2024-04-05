import * as sass from "sass";
import fs from "fs";
import chalk from "chalk";
import { rollup } from "rollup";
import { terser } from "rollup-plugin-terser";
import path from "path";

// Read package.json
const pkg = JSON.parse(fs.readFileSync("./package.json"));

/**
 * Returns a banner to add at top in files. Used by both CSS and JS
 * @constructor
 * @param {string} type - Type of code within document ie. 'CSS' or 'JS'
 * @returns {string} banner - Banner to add at top of file
 */
function getBanner(type) {
	let banner = `/*!  ${pkg.name} ${type} v${
		pkg.version
	} | (c) ${new Date().getFullYear()} ${pkg.author.name} */`;
	return banner;
}

/**
 * Creates output filename
 * @constructor
 * @param {string} str - Name of file to adjust name of
 * @param {boolean} minify - Use .min in file name
 */
function getFileName(str, minify) {
	let result = "";
	if (str) {
		str = str.toString();
		if (str.indexOf(".scss") > -1) {
			result = `${str.slice(0, str.length - 5)}${minify ? ".min" : ""}.css`;
		}
	}
	return result;
}

/**
 * Creates options for sass.render
 * @constructor
 * @param {string} file - Type of code within document ie. 'CSS' or 'JS'
 * @returns {object} options - Options to use when rendering sass
 */
function getSassOptions(file) {
	const outFile =
		pkg.configs.css.pathOut + "/" + getFileName(file, pkg.configs.css.minify);
	return {
		file: `${pkg.configs.css.pathIn}/${file}`,
		outFile: outFile,
		indentType: "space",
		indentWidth: "4",
		outputStyle: pkg.configs.css.minify ? "compressed" : "expanded",
	};
}

/**
 * Creates and writes javascript files using rollup
 * @constructor
 */
export async function buildJS() {
	let pathToJsFiles = "./" + pkg.configs.js.pathIn;
	let files = await getListOfFiles(pathToJsFiles);
	files = files.filter((s) => ~s.indexOf(".js"));

	let cleanFiles = [];
	for (let i = 0; i < files.length; i++) {
		let fileStringName = files[i].toString();
		let pathName = pkg.configs.js.pathIn + "/" + fileStringName;
		cleanFiles.push(pathName);
		console.log(chalk.green("Inkluderar  -> "), chalk.magenta(pathName));
	}

	let inputOptions = {
		input: cleanFiles,
		logLevel: "error",
		cache: false,
	};

	let outputOptions = createOutOptions();
	let buildFailed = false;
	let bundle;
	try {
		bundle = await rollup(inputOptions);
		await bundle.write(outputOptions);
	} catch (error) {
		buildFailed = true;
		// do some error reporting
		console.error("☠️  " + error);
	}
	if (bundle) {
		// closes the bundle
		console.log(chalk.green("JS filer skapade 👍"));
		await bundle.close();
	}
	process.exit(buildFailed ? 1 : 0);
}

/**
 * Creates and writes file
 * @constructor
 * @param {string} path - path to store file in eg. 'dist/css'
 * @param {string} name - Full name of file including suffix
 * @param {string} fileData - Contents of file
 * @param {boolean} printBanner - Place banner at top of file
 * @param {string} type - Type of code within document ie. 'CSS' or 'JS'
 */
function buildAndStore(path, name, fileData, printBanner = true, type) {
	// Create the directory path
	fs.mkdir(path, { recursive: true }, function (err) {
		// If there's an error, throw it
		if (err) throw err;

		// Write the file to the path
		fs.writeFile(`${path}/${name}`, fileData, function (err) {
			if (err) throw err;

			var data = fs.readFileSync(`${path}/${name}`);
			var fd = fs.openSync(`${path}/${name}`, "w+");
			var insert = printBanner ? new Buffer.from(getBanner(type) + "\n") : "";

			fs.writeSync(fd, insert, 0, insert.length, 0);
			fs.writeSync(fd, data, 0, data.length, insert.length);
			fs.close(fd, function (err) {
				if (err) throw err;
				console.log(
					chalk.green("Ok 👍  -> "),
					chalk.magenta(`${path}/${name}`)
				);
			});
		});
	});
}

/**
 * Build CSS if now paramaters are passed information from package.json will be used instead
 * @constructor
 * @param {string} src - Path from wich files are read
 * @param {string} outPath - Path to storing location in eg. 'dist/css'
 * @param {boolean} mini - Minify file yes (true) or no (false)
 */
export function buildCSS(src, outPath, mini) {
	// if src, inPath, outPath and mini are undefined use package.json information
	let scssSrcFolder = "./" + pkg.configs.css.pathIn;
	src = src === undefined ? scssSrcFolder : src;
	outPath = outPath === undefined ? pkg.configs.css.pathOut : outPath;
	mini = mini === undefined ? pkg.configs.css.minify : mini;

	console.log(chalk.green("⏳ Initierar kompilering av CSS"));
	// Look for files in the scss source folder and add to configs
	fs.readdir(src, (err, files) => {
		files.forEach((file) => {
			let fileStringName = file.toString();
			let isScss = fileStringName.indexOf(".scss");
			if (isScss > -1) {
				// is scss file render css using options
				// build file and store in correct location
				sass.render(
					getSassOptions(fileStringName, true),
					function (err, result) {
						// If there's an error, throw it
						if (err) throw err;
						// Write the file
						const filename = getFileName(file, mini);
						buildAndStore(outPath, filename, result.css, mini, "CSS");
					}
				);
			}
		});
		if (err) throw err;
	});
}
/**
 * Get list of files in src folder
 * returns array of files
 * @param {*} src the path to the folder
 * @returns array of files
 */
export async function getListOfFiles(src) {
	let files = [];
	if (!src) {
		console.log(chalk.red("No src folder."));
		return files;
	}
	try {
		files = await fs.promises.readdir(src);
		return files;
	} catch (e) {
		console.error(e);
	}
}

/**
 * Generat outputOptions for rollup
 * Used by js.mjs file
 * @returns outputOptions for rollup
 */
export function createOutOptions() {
	let outputOptions = {
		dir: pkg.configs.js.pathOut,
		format: "es",
		banner: getBanner("JS"),
		sourcemap: true,
		name: "app",
		plugins: [
			terser(),
			//getBabelOutputPlugin({presets: ['@babel/preset-env']})
		],
	};
	return outputOptions;
}
