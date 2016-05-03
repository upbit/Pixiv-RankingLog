'use strict';

var React = require('react-native');

var {
  Text,
  View,
  ListView,
  ActivityIndicatorIOS,
  RecyclerViewBackedScrollView,
} = React;

var utils = require('../utils/functions');
var css = require("./CommonStyles");

var GlobalStore = require('../GlobalStore');
var Illust = require('./Illust');

module.exports = React.createClass({
  getInitialState() {
    return {
      isLogin: false,
      page: 0,
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
        sectionHeaderHasChanged: (s1, s2) => s1 !== s2
      }),
    };
  },

  componentDidMount() {
    GlobalStore.reloadSettings()
      .then(() => {
        GlobalStore.api.login_if_needed(GlobalStore.settings.username, GlobalStore.settings.password)
          .then((auth) => {
            this.setState({isLogin: true});
            this.fetch_next_page(true);
          });
      });
  },

  componentWillReceiveProps(props) {
    if (GlobalStore.state.currentMode != null && GlobalStore.state.currentMode != GlobalStore.settings.mode) {
      console.log(`Mode ${GlobalStore.state.currentMode} -> ${GlobalStore.settings.mode}, reset ListView datasource...`);
      GlobalStore.reloadSettings()
        .then(() => {
          this.setState({
            page: 0,
            dataSource: this.state.dataSource.cloneWithRowsAndSections({})
          });
        });
    }
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return (nextState.isLogin != this.isLogin) || (nextState.dataBlob != GlobalStore.state.dataBlob);
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
          visible={this.props.visible}
          dataSource={this.state.dataSource}
          pageSize={50}
          renderRow={this.renderRow}
          renderSectionHeader={this.renderSectionHeader}
          onEndReached={() => {this.fetch_next_page(false)}}
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
      <View style={{width: utils.SCREEN_WIDTH, alignItems: 'center', backgroundColor: '#CCCCCC'}}>
        <Text style={{color: '#86473F', fontWeight: 'bold'}}>{sectionID}</Text>
      </View>
      )
  },

  fetch_next_page(refresh: boolean) {
    if (GlobalStore.state.isLoaded == false) {
      console.log("Waiting, last fetch is in process...");
      return;
    }
    var next_page = this.state.page + 1;
    if (refresh) {
      next_page = 1;
    }

    GlobalStore.fetchRankingLog(GlobalStore.settings.mode, next_page)
      .then((illusts) => {
        console.log(GlobalStore.state.dataBlob);
        this.setState({
          page: next_page,
          dataSource: this.state.dataSource.cloneWithRowsAndSections(GlobalStore.state.dataBlob),
        });
      });
  },

  selectRow(illust) {
    console.log(illust);
  },

});
