'use strict'

const fs = require('fs-extra');
const path = require('path');

function flatten(input) {
  let ret = [];
  for (let item of input) {
    if (Array.isArray(item)) {
      ret = [...ret, ...flatten(item)];
    } else {
      ret = [...ret, item];
    }
  }
  return ret;
}

function smartWrite(pathToWrite, content, pathTraversed="") {
  let pathComponents = pathToWrite.split('/');
  if (pathComponents[0] === ".") { pathComponents.splice(0, 1); }
  if (pathComponents.length === 1) {
    return fs.open(path.join(pathTraversed, pathComponents[0]), 'w')
      .then((fd, err) => {
        return fs.write(fd, content).then(() => console.log(path.join(pathTraversed, pathToWrite) + " written"));
      });
  } else {
    fs.lstat(path.join(pathTraversed, pathComponents[0]))
      .then((inode) => {
        if (inode.isDirectory() === true) {
          // proceed normally if directory already exists
          pathTraversed = path.join(pathTraversed, pathComponents[0]);
          pathToWrite = pathComponents.slice(1)[0] || '';
          return smartWrite(pathToWrite, content, pathTraversed);
        } else {
          // error out otherwise
          console.log("It looks like a non-directory is blocking the creation of " + path.join(pathTraversed, pathToWrite));
          return;
        }
      })
      .catch((err) => {
        // make a directory if necessary and continue
        console.log("Creating directory at " + path.join(pathTraversed, pathComponents[0]));
        return fs.mkdir(path.join(pathTraversed, pathComponents[0]))
          .then(() => {
            pathTraversed = path.join(pathTraversed, pathComponents[0]);
            pathToWrite = pathComponents.slice(1)[0] || '';
            return smartWrite(pathToWrite, content, pathTraversed);
          });
      })
  }
}

module.exports = {
  flatten: flatten,
  write: smartWrite
}
