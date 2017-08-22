import headerRule = require('./src/rules/headerRule');
import cssRule = require('./src/rules/cssRule');
import imageResizeRule = require('./src/rules/imageResizeRule');
import captionRule = require('./src/rules/captionRule');
import spacerRule = require('./src/rules/spacerRule');
import tldrRule = require('./src/rules/tldrRule');

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
