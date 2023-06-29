// Plugins
import pkg from './package.json' assert { type: "json" };
import buildTools from './buildTools.mjs';
import chalk from 'chalk';

// Configs
var configs = {
	name: 'BuildToolsCookbook',
	files: ['main.js', 'detects.js', 'another-file.js'],
	formats: ['iife'],//['iife', 'es', 'amd', 'cjs'],
	default: 'iife',
	pathIn: 'src/js',
	pathOut: 'dist/js',
	logLevel: 'silent',
	minify: true,
	sourceMap: false
};

console.log(chalk.green('⏳ Initierar kompilering av JS'));
var createExport = function (file) {
	return configs.files.map(function (file) {
		var filename = file.replace('.js', '');
		return {
			input: `${configs.pathIn}/${file}`,
			output: buildTools.createOutputs(filename, pkg, configs),
			logLevel: configs.logLevel
		};
	});
};

export default createExport();