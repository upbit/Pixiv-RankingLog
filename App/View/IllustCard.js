'use strict';

var React = require('react-native');

var {
  Text,
  View,
  StyleSheet,
  TouchableHighlight,
  Image,
} = React;

var css = require("./CommonStyles");
var utils = require("../Utils/functions");

module.exports = React.createClass({
  render: function() {
    var illust = this.props.illust;
    return (
      <View style={[styles.container, css.row]}>
        <Image style={[styles.background]} source={{uri: illust.image_urls.px_128x128}}/>
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
    width: 128,
    height: 128,
    borderRadius: 4,
  },
});
