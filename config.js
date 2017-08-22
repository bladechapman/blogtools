const headerRule = require('./src/rules/headerRule');
const cssRule = require('./src/rules/cssRule');
const imageResizeRule = require('./src/rules/imageResizeRule');
const captionRule = require('./src/rules/captionRule');
const spacerRule = require('./src/rules/spacerRule');
const tldrRule = require('./src/rules/tldrRule');

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
