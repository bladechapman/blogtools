'use strict';

const marked = require('marked');
const yaml = require('js-yaml');

let renderer = new marked.Renderer();

marked.setOptions({
  renderer: renderer,
  gfm: true,
  sanitize: true
});

module.exports = {
  parseInput: (input, splitStr) => {
    splitStr = (splitStr === undefined) ? /\n+&&&\n+/ : splitStr
    let dataToSplit = input.split(splitStr);
    let yamlToParse = dataToSplit[0];
    let mdToParse = dataToSplit.slice(1).join('');

    return {
      yaml: yaml.safeLoad(yamlToParse),
      html: marked(mdToParse)
    };
  }
};
