'use strict'

import fs = require('fs-extra');
import path = require('path');

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
