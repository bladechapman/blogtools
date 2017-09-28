import { PostParseRule } from '../utils';

const tldrRule: PostParseRule = (item) => {
  let re = /<p>\[TLDR\](.*)<\/p>/g;
  let changes = [];

  item.html = item.html.replace(re,
    (match, text) => `<p class="tldr">${text}</p>`);

  return item
}

export default tldrRule;
