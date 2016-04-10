'use strict';

var React = require('react-native');

var {
  Text,
  View,
  Image,
  StyleSheet,
  AsyncStorage,
} = React;

var api = require("../network/api");
var utils = require('../utils/functions');

var RefreshableListView = require('./RefreshableListView');
var Illust = require('./Illust');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      columnNumber: 2,
      illusts: [],
    };
  },

  render: function() {
    return(
      <RefreshableListView
          renderRow={(row)=>this.renderListViewRow(row, 'daily')}
          onRefresh={(page, callback)=>this.listViewOnRefresh('daily', page, callback)}
          backgroundColor={'#F6F6EF'}
          loadMoreText={'Loading...'}/>
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
    this.fetchRankingLogByType(mode, page, callback);
  },

  login: function(username, password) {
    api.login(username, password, (response) => {
      let auth = response;
      auth.date = new Date();
      AsyncStorage.setItem('pixiv_auth', JSON.stringify(auth), () => {
        console.log(`Set auth to AsyncStorage, access_token=${auth.access_token}`);
      });
      return auth;
    });
  },

  fetchRankingLogByType: function(mode, page, callback) {
    AsyncStorage.getItem('pixiv_auth')
      .then((response) => {
        if (!response) {
          this.login("usersp", "passsp");
        } else {
          // check storage
          let auth = JSON.parse(response);
          let expire_ts = new Date(auth.date).getTime() + auth.expires_in * 1000;
          let now_ts = new Date().getTime();

          if (now_ts > expire_ts) {
            return this.login("usersp", "passsp");
          } else {
            console.log(`Get auth from AsyncStorage, access_token=${auth.access_token}`);
            return auth;
          }
        }
      })
      .then((auth) => {
        api.ranking(mode, page, (response) => {
          console.log(response);
          const new_illusts = response;
          this.setState({illusts: new_illusts});
          callback(new_illusts);
        });
      });

  },

  selectRow: function(illust) {
    console.log(illust);
  },

});
