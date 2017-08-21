
function* yieldImages(html) {
  let re = /\n<p>(?:<img.*>){2}<\/p>\n/g;
  let match = re.exec(html);
  while (match !== null) {
    yield match;
    match = re.exec(html);
  }
}

function countImages(html) {
  return html.match(/<(img)[^>]*>/g).length;
}

function resizeString(html) {
  let numImages = countImages(html);
  let newWidth = `${Math.floor(100 / numImages)}%`;
  return html.replace(/<img/g, `<img style="max-width:${newWidth};display:inline-block"`)
    .replace(/<p/g, `<p style="display:flex;align-items:flex-end;" `);
}

function imageResizeRule(item) {
  let changes = [];
  for (imageMatch of yieldImages(item.html)) {
    let resizedString = resizeString(imageMatch[0]);
    changes.push({
      newStr: resizedString,
      originalStr: imageMatch[0],
      index: imageMatch.index
    });
  }

  for (change of changes.reverse()) {
    item.html = item.html.slice(0, change.index) +
      change.newStr + item.html.slice(change.index +
      change.originalStr.length);
  }

  return item;
}

module.exports = imageResizeRule;
