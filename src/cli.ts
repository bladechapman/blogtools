#!/usr/bin/env node

import { ArgumentParser } from 'argparse';
import * as fs from 'fs';
import * as path from 'path';
import * as utils from './utils';

let argParser = new ArgumentParser({
  version: '1.0.7',
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

function interpretArguments(args: any) {
  if (!args.path) {
    return Promise.reject("You must provide a path to parse using the --path argument");
  }

  let configPath = path.resolve(args.config);
  let config: any;
  let configCheck = (potentialConfig: any): potentialConfig is utils.Config => {
    let activeRules = potentialConfig.activeRules;
    let indexIgnorePatterns = potentialConfig.indexIgnorePatterns;

    return !!activeRules && !!indexIgnorePatterns &&
      activeRules.map((activeRule: any) => activeRule instanceof Function).reduce((a: boolean, b: boolean) => a && b, true) &&
      indexIgnorePatterns.map((pattern: any) => pattern instanceof RegExp).reduce((a: boolean, b: boolean) => a && b, true)
  }

  try {
    config = require(configPath);
    if (!configCheck(config)) { throw new Error("The imported config does not fit the Config interface."); }
  }
  catch (e) {
    return Promise.reject(`The configuration file at ${configPath} is incorrectly configured\n\n${e}`);
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
