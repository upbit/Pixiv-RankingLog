'use strict';

var React = require('react-native');

var {
  Text,
  View,
  StyleSheet,
} = React;

var css = require("./CommonStyles");
var utils = require("../utils/functions");

module.exports = React.createClass({

  render: function() {
    var illust = this.props.illust;

    return (
      <View style={[styles.container, css.row]}>
      
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  background: {
    flex: 1,
    borderRadius: 4,
  },
});
