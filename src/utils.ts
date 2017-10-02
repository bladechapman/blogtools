import * as fs from 'fs-extra';
import * as path from 'path';
import yaml = require('js-yaml');
import highlight = require('highlight.js');
import marked = require('marked');
const renderer = new marked.Renderer();
marked.setOptions({
  renderer: renderer,
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  highlight: (code) => {
    return highlight.highlightAuto(code).value;
  }
});

export interface BlogItem {
  yaml: any;
  html: string;
  path: string
}

export type PostParseRule = (item: BlogItem) => BlogItem;

export interface Config {
  activeRules: PostParseRule[];
  indexIgnorePatterns: RegExp[]
}

/**
 * Takes any input and returns a flattened version of it.
 *
 * If the input is not an array, it will simply return the item placed in an
 * Array
 *
 * If the item is an array, it will return the flattened contents
 *
 * @param  {any} input
 * @return {any[]}
 */
export const flatten = function(input: any): any[] {
  if (!Array.isArray(input)) return [input];
  return input.reduce((accumulator, current) => accumulator.concat(flatten(current)), []);
}

/**
 * Writes content to a given path (relative or absolute). If
 * the path does not exist, a directory will be made for every missing
 * directory to allow for a write
 *
 * @param  {string} pathToWrite
 * @param  {string} content
 * @param  {string} pathTraversed    defaults to empty string, typically not used
 * @return {Promise<boolean>}
 */
export const write = function(pathToWrite: string, content: string, pathTraversed=""): Promise<boolean> {
  let pathComponents = path.normalize(pathToWrite).split('/');

  // Base case. We've reached the end of the path, so we can write
  if (pathComponents.length === 1) {
    return fs.open(path.join(pathTraversed, pathComponents[0]), 'w')
      .then((fd: number) => {
        return fs.write(fd, content, 0).then(() => {
          console.log(path.join(pathTraversed, pathToWrite) + " written")
          return true;
        });
      })
      .catch((err) => {
        console.log(`Unable to write file ${path.join(pathTraversed, pathToWrite)}`);
        return false;
      });
  }


  // Recursive case, follow the path, creating a directory if necessary

  // handle the case where we're starting from root (which is represented)
  // by an empty string within pathComponents
  pathComponents[0] = pathComponents[0] || '/';

  return fs.lstat(path.join(pathTraversed, pathComponents[0]))
    .then((inode) => {
      if (inode.isDirectory() === true) {
        return _proceedWithWrite(pathTraversed, content, pathComponents);
      }
      else {
        // error out otherwise
        throw `It looks like a non-directory is blocking the creation of ${path.join(pathTraversed, pathToWrite)}`;
      }
    })
    .catch((err) => {
      // make a directory if necessary and continue
      console.log(`Creating directory at ${path.join(pathTraversed, pathComponents[0])}`);
      return fs.mkdir(path.join(pathTraversed, pathComponents[0]))
        .then(() => {
          return _proceedWithWrite(pathTraversed, content, pathComponents);
        });
    })
}

/**
 * Private helper function for #write.
 *
 * @param  {string}   pathTraversed
 * @param  {string}   content
 * @param  {string[]} pathComponents
 * @return {Promise<boolean>}
 */
const _proceedWithWrite = function(pathTraversed: string, content: string, pathComponents: string[]) {
  pathTraversed = path.join(pathTraversed, pathComponents[0]);
  let pathToWrite = pathComponents.slice(1).join('/') || '';
  return write(pathToWrite, content, pathTraversed);
}

/**
 * processFile
 *
 * @param {string} filePath The path of the file to process
 * @returns {Promise<void | BlogItem[]>}
 */
export const processFile = function(filePath: string, config: Config): Promise<BlogItem[]> {
  return fs.readFile(filePath, 'utf8')
    .then((data: string) => {
      let parsed = parseInput(data);
      parsed.path = filePath;
      let rules: PostParseRule[] = config.activeRules;
      rules.forEach((rule) => {
        parsed = rule(parsed);
      });
      return [parsed]
    });
}

/**
 * processDirectory
 *
 * @param {string} currentPath The path of the directory to process
 * @returns {Promise<void | BlogItem[]>}
 */
export const processDirectory = function(currentPath: string, config: Config): Promise<BlogItem[]> {
  return fs.readdir(currentPath)
    .then((files) => {
      let fullPaths = files.map((fileName) => { return path.join(currentPath, fileName); });
      let promises = fullPaths.map((path) => {
        return fs.lstat(path).then((inode) => {
          return {
            path,
            isDirectory: inode.isDirectory()
          };
        });
      });
      return Promise.all(promises);
    })
    .then((directoryInfo: { path: string, isDirectory: boolean }[]) => {
      let promises = directoryInfo.map((infoItem) => {
        if (infoItem.isDirectory === true) {
          return processDirectory(infoItem.path, config);
        }
        else if (infoItem.path.match(/.*\.blg$/) !== null) {
          return processFile(infoItem.path, config);
        }
        else {
          return null;
        }
      });

      let promiseFilter = (item: any): item is Promise<BlogItem[]> => { return item !== null; }
      let filteredPromises = promises.filter(promiseFilter);

      return Promise.all(filteredPromises);
    })
    .then(flatten);
}

/**
 * processIndex
 *
 * @param {string} currentPath The path of the directory from which the directory will be generated
 * @returns {Promise<void | BlogItem[]>}
 */
export const processIndex = function(currentPath: string, config: Config): Promise<BlogItem[]> {
  return processDirectory(currentPath, config).then((items) => {
    let indexHtml = genIndex(items, config.indexIgnorePatterns);
    let indexPath = path.join(path.resolve(currentPath), "index");
    return [{
      path: indexPath,
      html: indexHtml,
      yaml: {}
    }];
  });
}

/**
 * A helper function for genIndex
 *
 * @param {string[]} listItemHtml an array of html strings representing each list item
 * @returns {string}
 */
function generateHtml(listItemHtml: string[]): string {
  const listHtml = listItemHtml.join('');
  const stylesheetLocation = `./index.css`;
  const indexTemplate = `<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=0"><meta name="apple-mobile-web-app-capable" content="yes" /><title>Writing</title><link rel="stylesheet" type="text/css" href="${stylesheetLocation}"><body><div id="title">Writing</div><div class="divider"></div><div id="links"><a href="http://bladeismyna.me">Blade Chapman</a></div><ul style="list-style-type:none">${listHtml}</ul></body>`;

  return indexTemplate;
}

/**
 * genIndex
 *
 * @param {BlogItems[]} items The list of blog items to generate an index from
 * @param {string[]} ignorePatterns Regexes for paths to ignore
 * @returns {string}
 */
export const genIndex = function(items: BlogItem[], ignorePatterns: RegExp[]): string {
  let sorted = items.concat().sort((a: BlogItem, b: BlogItem): number => {
    if (new Date(a) < new Date(b)) return -1;
    else if (new Date(a) > new Date(b)) return 1;
    else return 0;
  });

  let listItems = sorted.map((item: BlogItem): string => {
    let date = item.yaml.date;
    let title = item.yaml.title;
    let subtitle = item.yaml.subtitle;
    let link = item.path + ".html";

    let shouldIgnore = ignorePatterns.map((pattern) => link.match(pattern) !== null).reduce((a, b) => a || b, false);

    if (shouldIgnore === true) {
      return '';
    }
    else {
      return `<li><a href="${link}"><div class="item-title">${title}</div></a><div class="item-subtitle">${subtitle}</div><div class="item-date">${date}</div></li>`;
    }
  });

  return generateHtml(listItems);
}

/**
 * parseInput
 *
 * @param {string} input The markdown-like text to parse
 * @param {RegExp | string | undefined} splitStr? The pattern to split the document between yaml and markdown
 * @returns {BlogItem}
 */
export const parseInput = (input: string, splitStr?: RegExp | string | undefined): BlogItem => {
  splitStr = (splitStr === undefined) ? /\n+&&&\n+/ : splitStr
  let dataToSplit = input.split(splitStr);
  let yamlToParse = dataToSplit[0];
  let mdToParse = dataToSplit.slice(1).join('');

  return {
    yaml: yaml.safeLoad(yamlToParse),
    html: marked(mdToParse),
    path: ''
  };
}
