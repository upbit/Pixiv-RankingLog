'use strict';

var React = require('react-native');

var {
  Text,
  View,
  ListView,
  ActivityIndicatorIOS,
  RecyclerViewBackedScrollView,
  StyleSheet,
} = React;

var utils = require('../utils/functions');
var css = require("./CommonStyles");
var PixivAPI = require("../network/pixiv_api");
var Illust = require('./Illust');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      api: null,
      isLogin: false,
      // ranking states
      mode: 'daily',
      page: 0,
      // dataSource
      isLoaded: true,
      dataBlob: {},
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
        sectionHeaderHasChanged: (s1, s2) => s1 !== s2
      }),
    };
  },

  componentDidMount() {
    if (this.state.api == null) {
      // Init api and login
      this.state.api = new PixivAPI();
      this.state.api.login_if_needed("usersp", "passsp")
        .then((auth) => {
          this.setState({isLogin: true});
          // fetch default rankings
          this.fetch_rankings(true);
        });
    }
  },

  render() {
    if (this.state.isLogin == false) {
      return (
        <View style={[css.row, css.center, {height: utils.SCREEN_HEIGHT}]}>
          <ActivityIndicatorIOS />
        </View>
      );
    }

    return (
      <ListView
          dataSource={this.state.dataSource}
          pageSize={50}
          renderRow={this.renderRow}
          renderSectionHeader={this.renderSectionHeader}
          onEndReached={() => {this.fetch_rankings(false)}}
          onEndReachedThreshold={50}
          // make ListView as GridView
          contentContainerStyle={{
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}
          renderScrollComponent={props => <RecyclerViewBackedScrollView {...props} />}
        />
    );
  },

  renderRow(illust) {
    const columnNumber = 3;
    return (
      <Illust illust={illust}
          max_width={(utils.SCREEN_WIDTH-2) / columnNumber}
          onSelected={(illust) => this.selectRow(illust)} />
    );
  },

  renderSectionHeader: function(sectionData, sectionID) {
    return (
      <View style={{width: utils.SCREEN_WIDTH, alignItems: 'center', backgroundColor: '#EEE',}}>
        <Text style={{color: '#DA552F', fontWeight: 'bold'}}>{sectionID}</Text>
      </View>
      )
  },

  fetch_rankings(refresh: boolean) {
    if (this.state.isLoaded == false) {
      console.log("Waiting, last fetch is in process...");
      return;
    }

    if (refresh) {
      this.setState({page: 1, isLoaded: false});
    } else {
      this.setState({page: this.state.page+1, isLoaded: false});
    }
    console.log(`Fetch ${this.state.mode} page=${this.state.page}...`);

    // real fetch pixiv rankings
    this.state.api.ranking(this.state.mode, this.state.page)
      .then((illusts) => {
        // storage result with section title key
        const sectionID = `Page${this.state.page}`;
        var newDs = this.state.dataBlob;
        newDs[sectionID] = illusts;
        this.setState({dataBlob: newDs});
      })
      .then(() => {
        // console.log(this.state.dataBlob);
        this.setState({
          dataSource: this.state.dataSource.cloneWithRowsAndSections(this.state.dataBlob),
          isLoaded: true,
        });
      });
  },

  selectRow: function(illust) {
    console.log(illust);
  },

});
