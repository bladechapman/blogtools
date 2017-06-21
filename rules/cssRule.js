'use strict'

function cssRule(item) {
  if (!("stylesheets" in item.yaml)) { return item; }
  let stylesheets = item.yaml["stylesheets"];
  let cssLinks = stylesheets.map((source) => {
    return `<link rel="stylesheet" type="text/css" href=${source}>\n`;
  });

  return {
    yaml: item.yaml,
    path: item.path,
    html: `${cssLinks.join("")}\n` + item.html
  };
}

module.exports = cssRule;
