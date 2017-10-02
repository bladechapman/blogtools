#!/usr/bin/env node

import { ArgumentParser } from 'argparse';
import * as fs from 'fs';
import * as path from 'path';
import * as utils from './utils';

let argParser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'Tools for maintaining Blade\'s blog'
});
argParser.addArgument(
  ['-r', '--recursive'],
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
    defaultValue: false,
    help: 'Use this flag to generate an index.blog.html'
  }
);
argParser.addArgument(
  ['-p', '--path'],
  {
    defaultValue: '.',
    help: 'Path to the target to be parsed from markdown to html.'
  }
);
argParser.addArgument(
  ['-c', '--config'],
  {
    defaultValue: './blog.config.js',
    help: 'Path to the blogtools config file.'
  }
)
let args = argParser.parseArgs();

let config: any;
try {
  config = require(path.resolve(args.config));
}
catch (e) {
  console.log("Something went wrong with your config!");
  console.log(e);
  process.exit(0);
}

function interpretArguments(args: any) {
  if (!args.path) {
    return Promise.reject("You must provide a path to parse using the --path argument");
  }

  if (fs.lstatSync(args.path).isDirectory() === true) {
    if (args.r === false) {
      return Promise.reject(args.path + " is a directory (not parsed)");
    }
    else {
      if (args.index === true) {
        return utils.processIndex(args.path, config);
      }
      else {
        return utils.processDirectory(args.path, config);
      }
    }
  }
  else {
    if (args.index === true) {
      return Promise.reject("An index can only be generated from a directory");
    }
    else {
      return utils.processFile(args.path, config);
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
  .catch((err) => {
    console.log(err);
  });
