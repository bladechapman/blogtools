import { PostParseRule } from '../utils';

const titleRule: PostParseRule = (item) => {
  if (!("title" in item.yaml)) { return item; }
  let title = item.yaml["title"];
  return {
    yaml: item.yaml,
    path: item.path,
    html: `<h1 id="title">${title}</h1>\n` + item.html
  };
}

const subtitleRule: PostParseRule = (item) => {
  if (!("subtitle" in item.yaml)) { return item; }
  let subtitle = item.yaml["subtitle"];
  return {
    yaml: item.yaml,
    path: item.path,
    html: `<h4 id="subtitle">${subtitle}</h4>\n` + item.html
  };
}

const dateRule: PostParseRule = (item) => {
  let d = new Date();
  let date = `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;
  if ("date" in item.yaml) {
    date = item.yaml["date"];
  }
  return {
    yaml: item.yaml,
    path: item.path,
    html: `<p id="date">${date} - <a href="http://bladeismyna.me" style="color:inherit;">Blade Chapman</a></p>\n` + item.html
  };
}

const prependDivider: PostParseRule = (item) => {
  return {
    yaml: item.yaml,
    path: item.path,
    html: `<div class="divider"></div>\n` + item.html
  };
}

const headerRule: PostParseRule = (item) => {
  return titleRule(subtitleRule(dateRule(prependDivider(item))));
}
export default headerRule;

