'use strict';

var React = require('react-native');

var {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableHighlight,
} = React;

var api = require("../network/api");
// var utils = require('../utils/functions');

var RefreshableListView = require('./RefreshableListView');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      illusts: [],
    };
  },

  render: function() {
    return(
      <RefreshableListView
          renderRow={(row)=>this.renderListViewRow(row, 'daily')}
          onRefresh={(page, callback)=>this.listViewOnRefresh('daily', page, callback)}
          backgroundColor={'#F6F6EF'}/>
    );
  },

  renderListViewRow: function(illust, pushNavBarTitle) {
    let work = illust.work;
    return(
      <TouchableHighlight underlayColor={'#f3f3f2'} onPress={()=>this.selectRow(illust, pushNavBarTitle)}>
        <Image source={{uri: work.image_urls.px_128x128}}
          style={{width: 128, height: 128}} />
      </TouchableHighlight>
    );
  },

  listViewOnRefresh: function(mode, page, callback) {
    this.fetchRankingLogByType(mode, page, callback);
  },

  selectRow: function(illust, pushNavBarTitle){
    console.log(illust);
  },

  fetchRankingLogByType: function(mode, page, callback){
    // api.login("usersp", "passsp", (response) => { console.log(response); });

    api.ranking(mode, page, (response) => {
      console.log(response);
      const new_illusts = response;
      this.setState({illusts: new_illusts});
      callback(new_illusts);
    });
  },
});
