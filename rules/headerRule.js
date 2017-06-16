'use strict'

function titleRule(item) {
  if (!("title" in item.yaml)) { return item; }
  let title = item.yaml["title"];
  return {
    yaml: item.yaml,
    path: item.path,
    html: `<h1 class="title">${title}</h1>\n` + item.html
  };
}

function dateRule(item) {
  if (!("date" in item.yaml)) { return item; }
  let date = item.yaml["date"];
  return {
    yaml: item.yaml,
    path: item.path,
    html: `<h3 class="date">${date}</h3>\n` + item.html
  };
}

function prependDivider(item) {
  return {
    yaml: item.yaml,
    path: item.path,
    html: `<div id="divider"></div>\n` + item.html
  };
}

function headerRule(item) {
  return titleRule(dateRule(prependDivider(item)));
}

module.exports = headerRule;
