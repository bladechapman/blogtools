'use strict'

module.exports = (item) => {
  let re = />\[Caption\].*</g;
  let match = re.exec(item.html);
  let changes = [];
  while (match !== null) {
    changes.push(match.index);
    match = re.exec(item.html);
  }
  for (change of changes.reverse()) {
    item.html = item.html.slice(0, change) + ` class="caption">` + item.html.slice(change + ">[Caption]".length);
  }
  return item;
}
