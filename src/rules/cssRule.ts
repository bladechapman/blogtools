import { PostParseRule } from '../utils';

const cssRule: PostParseRule = (item) => {
  if (!("stylesheets" in item.yaml)) { return item; }
  let stylesheets = item.yaml["stylesheets"];
  let cssLinks = stylesheets.map((source: string) => {
    return `<link rel="stylesheet" type="text/css" href=${source}>\n`;
  });

  return {
    yaml: item.yaml,
    path: item.path,
    html: `${cssLinks.join("")}\n` + item.html
  };
}

export default cssRule;
