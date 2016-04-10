'use strict';

var React = require('react-native');

var {
  Image,
  TouchableHighlight,
} = React;

var css = require("./CommonStyles");

module.exports = React.createClass({

  render: function() {
    const work = this.props.illust.work;
    const max_width = this.props.max_width;
    return(
      <TouchableHighlight underlayColor={'#f3f3f2'} onPress={()=>this.props.onSelected(this.props.illust)}>
        <Image source={{uri: work.image_urls.px_128x128}}
          style={{width: max_width, height: max_width}} />
      </TouchableHighlight>
    );
  },

});
