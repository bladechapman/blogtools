#!/usr/bin/env node
'use strict'

const ArgumentParser = require('argparse').ArgumentParser;
const parseInput = require('./built/convert').parseInput;
const fs = require('fs-extra');
const path = require('path');
const utils = require("./built/utils");
const config = require("./built/config");
const genIndex = require('./built/genIndex').default;

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
    ['-i', '--index'],
    {
      action: 'storeTrue',
      defualtValue: false,
      help: 'Use this flag to generate an index.html'
    }
);
argParser.addArgument(
  ['-p', '--path'],
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
    })
    .catch((err) => {console.log(err)})
}

function processIndex(fpath) {
  return processDirectory(fpath).then((items) => {
    let flattened = utils.flatten(items);
    let indexHtml = genIndex(flattened);
    let indexPath = path.join(path.resolve(fpath), "index");
    return [{
      path: indexPath,
      html: indexHtml
    }];
  });
}

function interpretArguments(args) {
  if (fs.lstatSync(args.path).isDirectory() === true) {
    if (args.r === false) {
      console.log(args.path + " is a directory (not parsed)");
      process.exit(0);
    }
    else {
      if (args.index === true) {
        return processIndex(args.path);
      }
      else {
        return processDirectory(args.path);
      }
    }
  }
  else {
    if (args.index === true) {
      console.log("An index can only be generated from a directory");
      process.exit(0)
    }
    else {
      return processFile(args.path);
    }
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
  .then((items) => {
    let promises = items.map((item) => {
      let content = item.html;
      let path = item.path;
      return utils.write(path, content);
    });
    return Promise.all(promises);
  })
  .catch((err) => { console.log(err); })
