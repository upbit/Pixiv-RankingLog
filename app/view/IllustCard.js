'use strict';

var React = require('react-native');

var {
  Text,
  View,
  StyleSheet,
} = React;

var css = require("./CommonStyles");
var utils = require("../utils/functions");

var ExImage = require('react-native-eximage');

module.exports = React.createClass({
  get_ratio_height: function(illust, max_width) {
    //return illust.height * (max_width / illust.width);
    return max_width;
  },

  render: function() {
    var illust = this.props.illust;
    var max_width = this.props.max_width;

    var errorEle = null;
    // if (this.state.loadFailed) {
    //   errorEle = (<Text>Failed.</Text>);
    // }

    return (
      <View style={[styles.container, css.row]}>
        <ExImage
          source={{uri: illust.image_urls.px_128x128}}
          style={[styles.background, {width: max_width}, {height: this.get_ratio_height(illust, max_width)}]}
          resizeMode='cover'
          // onLoadStart={(event) => { this.setState({loadFailed: false}); }}
          // onLoadError={(event) => { this.setState({loadFailed: true}); }}
          // onLoadProgress={(event) => { ; }}
          // onLoaded={(event) => { ; }}
          >
          {errorEle}
        </ExImage>
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
