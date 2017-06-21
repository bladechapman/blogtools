const headerRule = require('./rules/headerRule');
const cssRule = require('./rules/cssRule');
const imageResizeRule = require('./rules/imageResizeRule');
const captionRule = require('./rules/captionRule');

module.exports = {
  activeRules: [
    headerRule,
    cssRule,
    imageResizeRule,
    captionRule
  ]
}
