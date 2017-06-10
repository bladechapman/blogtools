'use strict';

let marked = require('marked');
let yaml = require('yaml');

let renderer = new marked.Renderer();

marked.setOptions({
  renderer: renderer,
  gfm: true,
  sanitize: true
});

module.exports = {
  parseInput: (input, splitStr=/\n+&&&\n+/) => {
    let dataToSplit = input.split(splitStr);
    let yamlToParse = dataToSplit[0]
    let mdToParse = dataToSplit.slice(1).join('');

    return {
      yaml: yaml.eval(yamlToParse),
      md: marked(mdToParse)
    };
  }
};
