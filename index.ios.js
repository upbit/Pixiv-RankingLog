/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  ListView,
  View,
} = React;

var api = require("./App/Network/api");
var utils = require('./App/Utils/functions');
var css = require("./App/View/CommonStyles");

var PixivIllust = require("./App/View/PixivIllust");

var resultsCache = {
  data: null,
  page: 1,
};

var PixivRankingLog = React.createClass({
  getInitialState: function() {
    return {
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
      loaded: false,
    };
  },
  componentDidMount: function() {
    this.fetchData(false);
  },

  updataResultsCache: function(responseData) {
    if (resultsCache.data) {
      var cached_replies = resultsCache.data.slice();
      Array.prototype.push.apply(cached_replies, responseData);
      resultsCache.data = cached_replies;
    } else {
      resultsCache.data = responseData;
    }
    resultsCache.page += 1;
  },
  fetchData: function(loadingTail) {
    api.ranking(resultsCache.page, (responseData) => {
      this.updataResultsCache(responseData);
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(resultsCache.data),
        loaded: true,
      });

      if (loadingTail) {
        this.setState({
          isLoadingTail: false,
        });
      };
    });
  },

  render: function() {
    if(!this.state.loaded){
      return(
        <View style={[css.center, css.transparent, css.flex]}>
          <Text>
            Loading...
          </Text>
        </View>
      );
    }
    return (
      this.renderListView()
    );
  },

  onEndReached: function() {
    if (this.state.isLoadingTail) {
      console.log("onEndReached - loadingTail = true");
      return;
    };

    console.log("onEndReached:", resultsCache.page);
    this.setState({
      isLoadingTail: true,
    });
    this.fetchData(true);
  },

  renderListView: function() {
    return(
      <ListView
        contentContainerStyle={[css.row, {flexWrap: 'wrap', justifyContent: 'center'}]}
        dataSource={this.state.dataSource}
        onEndReached={this.onEndReached}
        onEndReachedThreshold={utils.SCREEN_HEIGHT * 0.4}
        renderRow={this.renderIllust}
        style={{backgroundColor: 'white'}}/>
    );
  },
  renderIllust: function(illust) {
    return(
      <PixivIllust
        onPress={() => this.onIllustPress(illust)}
        illust={illust}/>
    );
  },

  onIllustPress: function(illust) {

  },
});

AppRegistry.registerComponent('PixivRankingLog', () => PixivRankingLog);
