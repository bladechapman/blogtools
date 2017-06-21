'use strict'

function titleRule(item) {
  if (!("title" in item.yaml)) { return item; }
  let title = item.yaml["title"];
  return {
    yaml: item.yaml,
    path: item.path,
    html: `<h1 id="title">${title}</h1>\n` + item.html
  };
}

function subtitleRule(item) {
  if (!("subtitle" in item.yaml)) { return item; }
  let subtitle = item.yaml["subtitle"];
  return {
    yaml: item.yaml,
    path: item.path,
    html: `<h4 id="subtitle">${subtitle}</h4>\n` + item.html
  };
}

function dateRule(item) {
  if (!("date" in item.yaml)) {
    d = new Date();
    item.html = `<p id="date">${d.getMonth()}/${d.getDate()}/${d.getFullYear()} - <a href="http://bladeismyna.me" style="color:inherit;>Blade Chapman</a></p>\n` + item.html;
    return item;
  }
  let date = item.yaml["date"];
  return {
    yaml: item.yaml,
    path: item.path,
    html: `<p id="date">${date} - <a href="http://bladeismyna.me" style="color:inherit;">Blade Chapman</a></p>\n` + item.html
  };
}

function prependDivider(item) {
  return {
    yaml: item.yaml,
    path: item.path,
    html: `<div class="divider"></div>\n` + item.html
  };
}

function headerRule(item) {
  return titleRule(subtitleRule(dateRule(prependDivider(item))));
}

module.exports = headerRule;
