#!/usr/bin/env node
'use strict'

const ArgumentParser = require('argparse').ArgumentParser;
const parseInput = require('./built/convert').parseInput;
const fs = require('fs-extra');
const path = require('path');
const utils = require("./built/utils");
const config = require("./built/config");

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

function interpretArguments(args) {
  if (fs.lstatSync(args.path).isDirectory() === true) {
    if (args.r === false) {
      console.log(args.path + " is a directory (not parsed)");
      process.exit(0);
    }
    else {
      if (args.index === true) {
        return utils.processIndex(args.path);
      }
      else {
        return utils.processDirectory(args.path);
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
