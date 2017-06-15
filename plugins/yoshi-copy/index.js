'use strict';

const path = require('path');
const fs = require('fs');
const gulp = require('gulp');
const glob = require('glob');
const mkdirp = require('mkdirp');


function copyFiles(patterns, destination = '', base = '.') {
  return Promise.all(patterns.map(pattern =>
    copy(pattern, destination, path.resolve(base))));
}

function copy(pattern, destination, base) {
  return matchFiles(path.resolve(pattern)).then(matches =>
    Promise.all(matches.map(match => {
      const dest = path.resolve('dist', destination);
      const to = path.join(dest, match.replace(base, ''));
      return copyFile(match, to);
    })));
}

function matchFiles(pattern) {
  return new Promise((resolve, reject) => {
    glob(pattern, (err, matches) => err ? reject(err) : resolve(matches));
  });
}

function copyFile(from, to) {
  return ensureDir(path.dirname(to)).then(() => {
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(from);
      const writeStream = fs.createWriteStream(to);

      readStream.on('error', reject);
      writeStream.on('error', reject);
      writeStream.once('finish', resolve);
      readStream.pipe(writeStream);
    });
  });
}

function ensureDir(dir) {
  return new Promise((resolve, reject) =>
    mkdirp(dir, err => err ? reject(err) : resolve(dir)));
}

module.exports = ({log, watch, base}) => {
  function copyAssets({output = 'statics'} = {}) {
    const assets = `${base()}/assets/**/*`;
    const htmlAssets = `${base()}/**/*.{ejs,html,vm}`;
    const serverAssets = `${base()}/**/*.{css,json,d.ts}`;

    const copyAllAssets = () => Promise.all([
      copyFiles([assets, htmlAssets, serverAssets]),
      copyFiles([assets, htmlAssets], output, path.join(process.cwd(), 'src'))
    ]);

    if (watch) {
      gulp.watch([assets, htmlAssets, serverAssets], copyAllAssets);
    }

    return copyAllAssets();
  }

  return log(copyAssets);
};
