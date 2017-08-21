'use strict'

function tldrRule(item) {
  let re = /<p>\[TLDR\](.*)<\/p>/g;
  let changes = [];

  item.html = item.html.replace(re,
    (match, text) => `<p class="tldr">${text}</p>`);

  return item
}

module.exports = tldrRule;
