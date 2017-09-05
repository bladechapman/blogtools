'use strict';

import marked = require('marked');
import yaml = require('js-yaml');
import highlight = require('highlight.js');

let renderer = new marked.Renderer();

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



export const parseInput = (input: string, splitStr: RegExp | string | undefined) => {
  splitStr = (splitStr === undefined) ? /\n+&&&\n+/ : splitStr
  let dataToSplit = input.split(splitStr);
  let yamlToParse = dataToSplit[0];
  let mdToParse = dataToSplit.slice(1).join('');

  return {
    yaml: yaml.safeLoad(yamlToParse),
    html: marked(mdToParse)
  };
}
