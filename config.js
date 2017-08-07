const headerRule = require('./rules/headerRule');
const cssRule = require('./rules/cssRule');
const imageResizeRule = require('./rules/imageResizeRule');
const captionRule = require('./rules/captionRule');
const spacerRule = require('./rules/spacerRule');
const tldrRule = require('./rules/tldrRule');

module.exports = {
  activeRules: [
    headerRule,
    cssRule,
    imageResizeRule,
    captionRule,
    spacerRule,
    tldrRule
  ]
}
