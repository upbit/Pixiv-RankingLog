'use strict';

import React, {
  Component,
} from 'react';

import {
  Image,
  TouchableHighlight,
} from 'react-native';

// var css = require("./CommonStyles");

export default class Illust extends Component {
  render() {
    const work = this.props.illust.work;
    const max_width = this.props.max_width;
    return(
      <TouchableHighlight underlayColor={'#f3f3f2'} onPress={()=>this.props.onSelected(this.props.illust)}>
        <Image source={{uri: work.image_urls.px_128x128}}
          style={{width: max_width, height: max_width}} />
      </TouchableHighlight>
    );
  }
}
