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
  get_ratio_height: function(illust, max_width) {
    return illust.height * (max_width / illust.width);
  },

  render: function() {
    var illust = this.props.illust;
    var max_width = this.props.max_width;
    return (
      <View style={[styles.container, css.row]}>
        <Image style={[styles.background, {width: max_width}, {height: this.get_ratio_height(illust, max_width)}]}
            source={{uri: illust.image_urls.px_480mw}}/>
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
