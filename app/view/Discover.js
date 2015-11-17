'use strict';

var React = require('react-native');

var {
  Text,
  View,
  ListView,
  Image,
} = React;

var api = require("../network/api");
var utils = require('../utils/functions');
var css = require("./CommonStyles");

var IllustCard = require("./IllustCard");

var resultsCache = {
  data: null,
  page: 1,
};

var Discover = React.createClass({
  getInitialState: function() {
    return {
      dataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
      loaded: false,
    };
  },

  render: function() {
    if(!this.state.login){
      api.login("grave1", "6654321", (success) => {
        console.log(success)
        this.setState({ login: true });
      });
      return(
        <View style={[css.center, css.transparent, css.flex]}>
          <Text>
            Login Pixiv...
          </Text>
        </View>
      )
    }

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
      <ListView
        contentContainerStyle={[css.row, {flexWrap: 'wrap', justifyContent: 'center'}]}
        dataSource={this.state.dataSource}
        onEndReached={this.onEndReached}
        onEndReachedThreshold={utils.SCREEN_HEIGHT * 0.4}
        renderRow={this.renderIllust}
        style={{backgroundColor: 'white'}}/>
    );
  },

  componentDidMount: function() {
    console.log("componentDidMount fetchData");
    this.fetchData(false);
  },

  updataResultsCache: function(response) {
    if (resultsCache.data) {
      var cached_replies = resultsCache.data.slice();
      Array.prototype.push.apply(cached_replies, response);
      resultsCache.data = cached_replies;
    } else {
      resultsCache.data = response;
    }
    resultsCache.page += 1;
  },
  fetchData: function(loadingTail) {
    api.ranking_all(resultsCache.page, (responseData) => {
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

  renderIllust: function(illust) {
    var halfWidth = utils.SCREEN_WIDTH / 3;
    return(
      <IllustCard
        onPress={() => this.onIllustPress(illust)}
        illust={illust} max_width={halfWidth}/>
    );
  },

  onIllustPress: function(illust) {
    console.log(illust);
  },
});

module.exports = Discover;