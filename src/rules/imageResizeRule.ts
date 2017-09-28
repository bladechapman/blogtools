import { BlogItem, PostParseRule } from '../utils';

function* yieldImages(html: string) {
  let re = /\n<p>(?:<img.*>){2}<\/p>\n/g;
  let match = re.exec(html);
  while (match !== null) {
    yield match;
    match = re.exec(html);
  }
}

function countImages(html: string) {
  let match = html.match(/<(img)[^>]*>/g);
  return (match === null) ? 0 : match.length;
}

function resizeString(html: string) {
  let numImages = countImages(html);
  let newWidth = `${Math.floor(100 / numImages)}%`;
  return html.replace(/<img/g, `<img style="max-width:${newWidth};display:inline-block"`)
    .replace(/<p/g, `<p style="display:flex;align-items:flex-end;" `);
}

const imageResizeRule: PostParseRule = function(item: BlogItem) {
  let changes = [];
  for (let imageMatch of yieldImages(item.html)) {
    let resizedString = resizeString(imageMatch[0]);
    changes.push({
      newStr: resizedString,
      originalStr: imageMatch[0],
      index: imageMatch.index
    });
  }

  for (let change of changes.reverse()) {
    item.html = item.html.slice(0, change.index) +
      change.newStr + item.html.slice(change.index +
      change.originalStr.length);
  }

  return item;
}

export default imageResizeRule;
