'use strict';

var React = require('react-native');

var {
  Dimensions,
  PixelRatio,
} = React;

var {height, width} = Dimensions.get('window');

exports.SCREEN_WIDTH = width;
exports.SCREEN_HEIGHT = height;
