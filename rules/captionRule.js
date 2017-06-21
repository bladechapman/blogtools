'use strict'

module.exports = (item) => {
  let re = /<p>\[Caption\].*<\/p>/g;
  let match = re.exec(item.html);
  let changes = [];
  let classStr = ` class="caption "`;
  while (match !== null) {
    changes.push(match.index);
    match = re.exec(item.html);
  }
  for (change of changes.reverse()) {
    item.html = item.html.slice(0, change) + `<p class="caption">` + item.html.slice(change + "<p>[Caption]".length);
  }
  return item;
}
