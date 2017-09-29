#!/usr/bin/env node

import { ArgumentParser } from 'argparse';
import * as fs from 'fs';
import * as path from 'path';
import * as utils from './utils';
import * as config from './config';

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
    defaultValue: false,
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

function interpretArguments(args: any) {
  if (!args.path) {
    throw new Error("You must provide a path to parse using the --path argument"); 
  }

  if (fs.lstatSync(args.path).isDirectory() === true) {
    if (args.r === false) {
      throw new Error(args.path + " is a directory (not parsed)");
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
      throw new Error("An index can only be generated from a directory");
    }
    else {
      return utils.processFile(args.path);
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
  .catch((err) => { console.log(err); });
