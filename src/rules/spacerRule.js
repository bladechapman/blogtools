'use strict'

function spacerRule(item) {
  let re = /<p>\[spacer\]<\/p>/g;
  item.html = item.html.replace(re, `<div class="spacer"></div>`);
  return item;
}

module.exports = spacerRule;
