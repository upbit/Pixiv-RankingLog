'use strict';

var React = require('react-native');

var {
  Text,
  View,
  ScrollView,
  Image,
} = React;

var Dimensions = require('Dimensions');

var api = require("../network/api");
var utils = require('../utils/functions');
var css = require("./CommonStyles");

var AutoResponisve = require('./AutoResponsive');
//var IllustCard = require("./IllustCard");

var resultsCache = {
  data: null,
  page: 1,
};

var Discover = React.createClass({
  getInitialState: function() {
    console.log("getInitialState");
    return ({
      urls: [
        "http://i2.pixiv.net/c/480x960/img-master/img/2015/11/15/02/06/49/53560081_p0_master1200.jpg",
        "http://i1.pixiv.net/c/480x960/img-master/img/2015/11/15/09/22/08/53563052_p0_master1200.jpg",
        "http://i1.pixiv.net/c/480x960/img-master/img/2015/11/15/00/07/26/53557252_p0_master1200.jpg",
        "http://i4.pixiv.net/c/480x960/img-master/img/2015/11/15/02/14/34/53560211_p0_master1200.jpg",
        "http://i1.pixiv.net/c/480x960/img-master/img/2015/11/15/22/34/00/53575736_p0_master1200.jpg",
        "http://i3.pixiv.net/c/480x960/img-master/img/2015/11/15/09/57/45/53563298_p0_master1200.jpg",
        "http://i1.pixiv.net/c/480x960/img-master/img/2015/11/15/00/34/48/53558076_p0_master1200.jpg",
      ],
    });
  },

  getChildrenStyle: function() {
    return {
      width: (utils.SCREEN_WIDTH - 12) / 2,
      height: parseInt(Math.random() * 20 + 12) * 10,
      backgroundColor: 'rgb(92, 67, 155)',
      marginLeft: 4,
      borderRadius: 8
    };
  },

  getAutoResponisveProps: function() {
    return {
      itemMargin: 4,
    };
  },

  renderChildren: function() {
    return this.state.urls.map(function(url, key) {
      return (
        <View style={this.getChildrenStyle()} key={key}>
          <Image
            style={{flex: 1}}
            source={{uri: url}} />
        </View>
      );
    }, this);
  },

  render: function() {
    return (
      <ScrollView>
        <AutoResponisve {...this.getAutoResponisveProps()}>
        {this.renderChildren()}
        </AutoResponisve>
      </ScrollView>
    );
  },
});

module.exports = Discover;