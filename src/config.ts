import headerRule from './rules/headerRule';
import cssRule from './rules/cssRule';
import imageResizeRule from './rules/imageResizeRule';
import captionRule from './rules/captionRule';
import spacerRule from './rules/spacerRule';
import tldrRule from './rules/tldrRule';

/**
 * A list of rules to be applied after parsing the raw 
 * markdown and yaml
 *
 * @type PostParseRule[]
 */
export const activeRules = [
  headerRule,
  cssRule,
  imageResizeRule,
  captionRule,
  spacerRule,
  tldrRule
]

/**
 * A list of patterns to match against to 
 * determine which files to ignore when generating
 * an index
 *
 * @type {RegExp[]}
 */
export const indexIgnorePatterns = [
  /^_.*/,
]
