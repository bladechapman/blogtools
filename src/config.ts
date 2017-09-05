import headerRule = require('./rules/headerRule');
import cssRule = require('./rules/cssRule');
import imageResizeRule = require('./rules/imageResizeRule');
import captionRule = require('./rules/captionRule');
import spacerRule = require('./rules/spacerRule');
import tldrRule = require('./rules/tldrRule');

export = {
  activeRules: [
    headerRule,
    cssRule,
    imageResizeRule,
    captionRule,
    spacerRule,
    tldrRule
  ]
}
