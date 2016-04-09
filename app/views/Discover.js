'use strict';

var React = require('react-native');

var {
  Text,
  View,
  StyleSheet,
  TouchableHighlight,
} = React;

var api = require("../network/api");
// var utils = require('../utils/functions');

var RefreshableListView = require('./RefreshableListView');

module.exports = React.createClass({
  getInitialState: function(){
    return {
      lastType: null
    };
  },

  render: function() {
    return(
      <RefreshableListView
          renderRow={(row)=>this.renderListViewRow(row, 'daily')}
          onRefresh={(page, callback)=>this.listViewOnRefresh('daily', page, callback)}
          backgroundColor={'#F6F6EF'}
          style={styles.listview}/>
    );
  },

  renderListViewRow: function(illust, pushNavBarTitle){
    return(
      <TouchableHighlight underlayColor={'#f3f3f2'} onPress={()=>this.selectRow(illust, pushNavBarTitle)}>
        <Text>{illust.work.title}</Text>
      </TouchableHighlight>
    );
  },
  listViewOnRefresh: function(ranking_type, page, callback) {
    if ((this.state.lastType == ranking_type) && (page != 1)) {
      console.log("down page=" + page);
    } else {
      console.log("page=" + page);
      this.fetchRankingLogByType(ranking_type, page, callback);
    }
    this.setState({lastType: ranking_type});
  },
  selectRow: function(illust, pushNavBarTitle){
    console.log(illust);
  },

  fetchRankingLogByType: function(ranking_type, page, callback){
    var rowsData = [];
    // api.login("usersp", "passsp", (json) => {
    //   console.log(json);
    // });

    api.ranking("daily", (illusts) => {
      console.log(illusts);

      for (var illust of illusts) {
        rowsData.push(illust);
      }
      callback(rowsData);
    });
  },
});

var styles = StyleSheet.create({
    listview: {
      marginBottom:0
    }
});
