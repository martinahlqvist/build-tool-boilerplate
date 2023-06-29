import buildTools from './buildTools.mjs';
import pkg from './package.json' assert { type: "json" };
import chalk from 'chalk';

// Configs
var configs = {
	files: ['critical.scss', 'main.scss', 'startpage.scss', 'print.scss'],
	pathIn: 'src/scss',
	pathOut: 'dist/css',
	indentType: 'tab',
	indentWidth: 1,
	minify: true,
	sourceMap: false
};

console.log(chalk.green('⏳ Initierar kompilering av CSS'));
for (var i = 0; i < configs.files.length; i++) {
    buildTools.parseSass(configs, configs.files[i], pkg, configs.minify);
}