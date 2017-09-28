import { PostParseRule } from '../utils';

const spacerRule: PostParseRule = (item) => {
  let re = /<p>\[spacer\]<\/p>/g;
  item.html = item.html.replace(re, `<div class="spacer"></div>`);
  return item;
}

export default spacerRule;
