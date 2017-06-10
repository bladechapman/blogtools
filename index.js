#!/usr/bin/env node
'use strict'

const ArgumentParser = require('argparse').ArgumentParser;
const parseInput = require('./convert').parseInput;
const fs = require('fs-extra');
const path = require('path');

let argParser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'Tools for maintaining Blade\'s blog'
});
argParser.addArgument(
  ['-r'],
  {
    action: 'storeTrue',
    defaultValue: false,
    help: 'For use with directories. Recursively converts all md files in a directory.'
  }
);
argParser.addArgument(
  ['path'],
  {
    help: 'Path to the target to be parsed from markdown to html.'
  }
);
let args = argParser.parseArgs();

if (fs.lstatSync(args.path).isDirectory() === true) {
  if (args.r === false) {
    console.log(args.path + " is a directory (not parsed)");
    process.exit(0);
  }
  else {
    fs.readdirSync(args.path).filter((filename))
  }
} else {
  processFile(args.path);
}



function processDirectory(currentPath) {
  return fs.readdir(currentPath)
    .then((err, files) => {
      let fullPaths = files.map((fileName) => return path.join(currentPath, filename));
      return fullPaths.map((path) => return fs.lstat(path).then((inode) => return {
        path: path,
        isDirectory: inode.isDirectory()
      }));
    })
    .then((directoryInfo) => {
      // use map


      // directoryInfo.forEach((item) => {
      //   if (item.isDirectory === false &&
      //     item.path.match(/.*\.blog$/) !== null) {
      //
      //   }
      // });
    });
  });


  // fs.readdirSync(currentPath).forEach((name) => {
  //   let candidatePath = path.join(currentPath, name);
  //   if (candidatePath)
  // });
}

function processFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(args.path, 'utf8', (err, data) => {
      if (err !== null) { reject(err); }
      else { resolve(parseInput(data)) };
    });
  });
}

// processFile(args.path)
//   .then((data) => { console.log(data); })
//   .catch((err) => { console.log(err); })
