import * as sass from 'sass';
import fs from 'fs';
import chalk from 'chalk';
import { terser } from 'rollup-plugin-terser';

class buildTools {
    constructor() { }
    // Banner
    static getBanner(pkg, type) {
        let banner = `/*! ${pkg.name} ${type} v${pkg.version} | (c) ${new Date().getFullYear()} ${pkg.author.name} */`;
        return banner;
    }
    static getOptions(configs, file, filename, minify) {
        return {
            file: `${configs.pathIn}/${file}`,
            outFile: `${configs.pathOut}/${filename}`,
            sourceMap: configs.sourceMap,
            sourceMapContents: configs.sourceMap,
            indentType: configs.indentType,
            indentWidth: configs.indentWidth,
            outputStyle: minify ? 'compressed' : 'expanded'
        };
    }
    static writeFile(pathOut, filename, fileData, pkg, printBanner = true) {
        // Create the directory path
        fs.mkdir(pathOut, { recursive: true }, function (err) {
            // If there's an error, throw it
            if (err) throw err;

            let banner = buildTools.getBanner(pkg, "CSS");

            // Write the file to the path
            fs.writeFile(`${pathOut}/${filename}`, fileData, function (err) {
                if (err) throw err;

                var data = fs.readFileSync(`${pathOut}/${filename}`);
                var fd = fs.openSync(`${pathOut}/${filename}`, 'w+');
                var insert = printBanner ? new Buffer.from(banner + '\n') : '';
                fs.writeSync(fd, insert, 0, insert.length, 0);
                fs.writeSync(fd, data, 0, data.length, insert.length);
                fs.close(fd, function (err) {
                    if (err) throw err;
                    console.log(chalk.green('Ok 👍  -> '), chalk.magenta(`${pathOut}/${filename}`));
                });
            });
        });
    }
    static parseSass(configs, file, pkg, minify) {
        const filename = `${file.slice(0, file.length - 5)}${minify ? '.min' : ''}.css`;
        sass.render(buildTools.getOptions(configs, file, filename, minify), function (err, result) {
            // If there's an error, throw it
            if (err) throw err;
            // Write the file
            buildTools.writeFile(configs.pathOut, filename, result.css, pkg);
            // Write external sourcemap
            if (!configs.sourceMap) return;
            buildTools.writeFile(configs.pathOut, filename + '.map', result.map, pkg, false);
        });
    }
    static createOutput(filename, minify, pkg, configs) {
        //let config;
       // console.log(JSON.stringify(configs, null, 2));

        return configs.formats.map(function (format) {
            let output = {
                file: `${configs.pathOut}/${filename}${format === configs.default ? '' : `.${format}`}${minify ? '.min' : ''}.js`,
                format: format,
                banner: buildTools.getBanner(pkg, "JS")
            };
            if (format === 'iife') {
                output.name = configs.name ? configs.name : pkg.name;
            }
            if (minify) {
                output.plugins = [terser()];
            }
            output.sourcemap = configs.sourceMap
            return output;
        });
    }
    static createOutputs(filename, pkg, configs) {
        let outputs = buildTools.createOutput(filename, false, pkg, configs);
        if (!configs.minify) return outputs;
        let outputsMin = buildTools.createOutput(filename, true, pkg, configs);
        return outputs.concat(outputsMin);
    }
}

export default buildTools; 