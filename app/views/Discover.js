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
      last_mode: null,
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
    GlobalStore.reloadSettings()
      .then(() => {
        GlobalStore.api.login_if_needed(GlobalStore.settings.username, GlobalStore.settings.password)
          .then((auth) => {
            this.setState({isLogin: true});
            this.fetch_rankings(true);
          });
      });
  },

  componentWillReceiveProps(props) {
    if (this.state.last_mode != null && this.state.last_mode != GlobalStore.settings.mode) {
      console.log(`Mode ${this.state.last_mode} -> ${GlobalStore.settings.mode}, reset ListView datasource...`);
      GlobalStore.reloadSettings()
        .then(() => {
          this.setState({
            page: 0,
            dataBlob: {},
            dataSource: this.state.dataSource.cloneWithRowsAndSections({})
          });
        });
    }
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return (nextState.isLogin != this.isLogin) || (nextState.dataBlob != this.dataBlob);
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
      <View style={{width: utils.SCREEN_WIDTH, alignItems: 'center', backgroundColor: '#CCCCCC'}}>
        <Text style={{color: '#86473F', fontWeight: 'bold'}}>{sectionID}</Text>
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
    console.log(`Fetch ${GlobalStore.settings.mode} page=${this.state.page}...`);
    
    // real fetch pixiv rankings
    GlobalStore.api.ranking(GlobalStore.settings.mode, this.state.page)
      .then((illusts) => {
        // storage result with section title key
        const sectionID = `Page${this.state.page}`;
        var newDs = this.state.dataBlob;
        newDs[sectionID] = illusts;
        this.setState({dataBlob: newDs, last_mode: GlobalStore.settings.mode});
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
