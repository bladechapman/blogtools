#!/usr/bin/env node
'use strict'

const ArgumentParser = require('argparse').ArgumentParser;
const parseInput = require('./convert').parseInput;
const fs = require('fs-extra');
const path = require('path');
const utils = require("./utils");
const config = require("./config");

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


function processDirectory(currentPath) {
  return fs.readdir(currentPath)
    .then((files, err) => {
      let fullPaths = files.map((fileName) => { return path.join(currentPath, fileName) });
      let promises = fullPaths.map((path) => {
        return fs.lstat(path).then((inode) => {
          return {
            path: path,
            isDirectory: inode.isDirectory()
          };
        });
      });
      return Promise.all(promises);
    })
    .then((directoryInfo) => {
      let promises = directoryInfo.map((infoItem) => {
        if (infoItem.isDirectory === true) {
          return processDirectory(infoItem.path);
        }
        else if (infoItem.path.match(/.*\.blog$/) !== null) {
          return processFile(infoItem.path);
        } else {
          return null;
        }
      }).filter((item) => { return item !== null; })
      return Promise.all(promises);
    })
    .catch((err) => {
      return err;
    });
}

function processFile(path) {
  return fs.readFile(path, 'utf8')
    .then((data, err) => {
      let parsed = parseInput(data);
      parsed["path"] = path;
      let rules = config.activeRules;
      rules.forEach((rule) => {
        parsed = rule(parsed);
      });
      return [parsed];
    });
}

function interpretArguments(args) {
  if (fs.lstatSync(args.path).isDirectory() === true) {
    if (args.r === false) {
      console.log(args.path + " is a directory (not parsed)");
      process.exit(0);
    }
    else {
      return processDirectory(args.path);
    }
  } else {
    return processFile(args.path);
  }
}


interpretArguments(args)
  .then(utils.flatten)
  .then((items) => {
    items.forEach((item) => {
      item.path += ".html";
    });
    return items;
  })
  .then((items) => items.forEach((item) => {
    let content = item.html;
    let path = item.path;
    utils.write(path, content);
  }))
  .catch((err) => { console.log(err); })
