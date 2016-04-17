'use strict';

var React = require('react-native');

var {
  Text,
  View,
  Image,
  ActivityIndicatorIOS,
  StyleSheet,
} = React;

var utils = require('../utils/functions');
var css = require("./CommonStyles");
var PixivAPI = require("../network/pixiv_api");
var RefreshableListView = require('./RefreshableListView');
var Illust = require('./Illust');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      api: null,
      isLogin: false,
      columnNumber: 2,
    };
  },

  componentDidMount() {
    if (this.state.api == null) {
      this.state.api = new PixivAPI();
      this.state.api.login_if_needed("usersp", "passsp", (auth) => {
        this.setState({isLogin: true});
      });
    }
  },

  render: function() {
    if (this.state.isLogin == false) {
      return (
        <View style={[css.row, css.center, {height: utils.SCREEN_HEIGHT}]}>
          <ActivityIndicatorIOS />
        </View>
      );
    }

    return (
      <RefreshableListView
          renderRow={(row)=>this.renderListViewRow(row, 'daily')}
          onRefresh={(page, callback)=>this.listViewOnRefresh('daily', page, callback)}
          backgroundColor={'#F6F6EF'}
          loadMoreText={'加载更多'}/>
    );
  },

  renderListViewRow: function(illust, pushNavBarTitle) {
    return(
      <Illust illust={illust}
          max_width={(utils.SCREEN_WIDTH-8) / this.state.columnNumber}
          onSelected={(illust) => this.selectRow(illust)} />
    );
  },

  listViewOnRefresh: function(mode, page, callback) {
    console.log(`Fetch ${mode} page=${page}...`);
    this.state.api.ranking(mode, page, (new_illusts) => {
      // console.log(new_illusts);
      callback(new_illusts);
    });
  },

  selectRow: function(illust) {
    console.log(illust);
  },

});
