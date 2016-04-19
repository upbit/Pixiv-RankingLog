'use strict';

var React = require('react-native');

var {
  Text,
  View,
  ListView,
  ActivityIndicatorIOS,
  RecyclerViewBackedScrollView,
  AsyncStorage,
  StyleSheet,
} = React;

var utils = require('../utils/functions');
var css = require("./CommonStyles");
var PixivAPI = require("../network/pixiv_api");
var Illust = require('./Illust');

module.exports = React.createClass({
  getInitialState() {
    const now = new Date();
    return {
      api: null,
      isLogin: false,
      // ranking states
      settings: {
        username: null,
        password: null,
        mode: 'daily',
        date: now.toLocaleDateString().replace(/\//g, '-'),
      },
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
    this.reloadSettings()
      .then(() => {
        if (this.state.api == null) {
          // Init api and login
          this.state.api = new PixivAPI();
          this.state.api.login_if_needed(this.state.settings.username, this.state.settings.password)
            .then((auth) => {
              this.setState({isLogin: true});
              this.fetch_rankings(true);        // fetch default rankings
            });
        }
      });
  },

  async reloadSettings() {
    const setting_string = await AsyncStorage.getItem('settings');
    if (setting_string !== null){
      var setting_state = JSON.parse(setting_string);
      this.setState({settings: setting_state});
    }
  },

  render() {
    if (this.state.isLogin == false) {
      return (
        <View style={[css.column, css.center, {width: utils.SCREEN_WIDTH}]}>
          <ActivityIndicatorIOS style={{marginTop: 8, marginBottom: 8}}/>
          <Text>Login to Pixiv...</Text>
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
          max_width={(utils.SCREEN_WIDTH-1) / columnNumber}
          onSelected={(illust) => this.selectRow(illust)} />
    );
  },

  renderSectionHeader: function(sectionData, sectionID) {
    return (
      <View style={{width: utils.SCREEN_WIDTH, alignItems: 'center', backgroundColor: '#336774'}}>
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
    console.log(`Fetch ${this.state.settings.mode} page=${this.state.page}...`);

    // real fetch pixiv rankings
    this.state.api.ranking(this.state.settings.mode, this.state.page)
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

  selectRow(illust) {
    console.log(illust);
  },

});
