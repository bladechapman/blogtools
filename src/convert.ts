'use strict';

import marked = require('marked');
import yaml = require('js-yaml');
import highlight = require('highlight.js');

marked.setOptions({
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





let spacerLexRule = function (currentTokens: any, lexerState: any, lexer: any) {
  let pattern = /^\[spacer\][\n]+?/;
  var cap = null;
  if (cap = pattern.exec(lexerState.src)) {
    currentTokens.push({
      type: 'spacer'
    });
    return cap[0].length;
  }
  return 0;
}

let additionalTypes = {
  spacer: (tok: any) => { return `<div class="spacer"></div>\n` }
};

let lexer = marked.lexer;
let parser = marked.parser;




export function parseInput(input: string, splitStr: RegExp | string | undefined) {
  splitStr = (splitStr === undefined) ? /\n+&&&\n+/ : splitStr
  let dataToSplit = input.split(splitStr);
  let yamlToParse = dataToSplit[0];
  let mdToParse = dataToSplit.slice(1).join('');

  let tokens = lexer(mdToParse, {
    additionalRules: [spacerLexRule],
  });

  let html = parser(tokens, {
    additionalTypes
  });

  return {
    yaml: yaml.safeLoad(yamlToParse),
    html
  };
}
