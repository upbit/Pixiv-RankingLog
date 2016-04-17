'use strict';

var React = require('react-native');

var {
  StyleSheet,
} = React;

module.exports = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  separator: {
    height: 1,
    backgroundColor: '#CCCCCC',
  },
});
