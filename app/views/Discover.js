'use strict';

var React = require('react-native');

var {
  Text,
  View,
  Image,
  ListView,
  ActivityIndicatorIOS,
  RecyclerViewBackedScrollView,
  TouchableHighlight,
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
      mode: 'daily',
      page: 0,
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
      this.state.api = new PixivAPI();
      this.state.api.login_if_needed("usersp", "passsp")
        .then((auth) => {
          this.setState({isLogin: true});
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
          renderRow={this.renderRow}
          renderSectionHeader={this.renderSectionHeader}
          // renderScrollComponent={props => <RecyclerViewBackedScrollView {...props} />}
          onEndReached={() => {this.fetch_rankings(false)}}
          onEndReachedThreshold={50}
        />
    );
  },

  renderRow(illust) {
    const columnNumber = 2;
    return (
      <TouchableHighlight
          underlayColor={'#f3f3f2'}
          onPress={()=>this.selectRow(illust.work)}>
        <Text>Illust {illust.work.title}</Text>
      </TouchableHighlight>
    );
    // return (
    //   <Illust illust={illust}
    //       max_width={(utils.SCREEN_WIDTH-8) / columnNumber}
    //       onSelected={(illust) => this.selectRow(illust)} />
    // );
  },

  renderSectionHeader: function(sectionData, sectionID) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionText}>{sectionID}</Text>
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

    this.state.api.ranking(this.state.mode, this.state.page)
      .then((illusts) => {
        const sectionID = `Page${this.state.page}`;
        var newDs = this.state.dataBlob;
        newDs[sectionID] = illusts;
        this.setState({dataBlob: newDs});
      })
      .then(() => {
        console.log(this.state.dataBlob);
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

var styles = StyleSheet.create({
  section: {
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  sectionText: {
    color: '#DA552F',
    fontWeight: 'bold'
  }
})
