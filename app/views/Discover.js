'use strict';

var React = require('react-native');

var {
  Text,
  View,
  StyleSheet,
  TouchableHighlight,
} = React;

// var api = require("../network/api");
// var utils = require('../utils/functions');

var TabBar = require("./TabBar");
var RefreshableListView = require('./RefreshableListView');

module.exports = React.createClass({
  getInitialState: function(){
    return {
      lastType: null
    };
  },

  render: function() {
    return(
      <TabBar structure={[
          {
            title: 'Daily',
            iconName: 'level-up',
            renderContent: () => {return(
              <RefreshableListView
                  renderRow={(row)=>this.renderListViewRow(row, 'daily')}
                  onRefresh={(page, callback)=>this.listViewOnRefresh('daily', page, callback)}
                  backgroundColor={'#F6F6EF'}
                  style={styles.listview}/>
            );}
          },
          {
            title: 'Bookmarks',
            iconName: 'star',
            renderContent: () => {return(
              <RefreshableListView
                  renderRow={(row)=>this.renderListViewRow(row, 'bookmarks')}
                  onRefresh={(page, callback)=>this.listViewOnRefresh('bookmarks', page, callback)}
                  backgroundColor={'#F6F6EF'}
                  style={styles.listview}/>
            );}
          },
        ]}
        selectedTab={0}
        activeTintColor={'#ff8533'}
        iconSize={16}/>
    );
  },

  renderListViewRow: function(row, pushNavBarTitle){
    return(
      <TouchableHighlight underlayColor={'#f3f3f2'} onPress={()=>this.selectRow(row, pushNavBarTitle)}>
        <Text>{row.id}</Text>
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
  selectRow: function(row, pushNavBarTitle){
    console.log(row);
    // this.props.navigator.push({
    //   title: pushNavBarTitle+' #'+row.count,
    //   component: Post,
    //   passProps: {post: row},
    //   backButtonTitle: 'Back',
    //   rightButtonTitle: 'Share',
    //   onRightButtonPress: () => {
    //     ActivityView.show({
    //       text: row.title, 
    //       url: row.url
    //     });
    //   },
    // });
  },

  fetchRankingLogByType: function(ranking_type, page, callback){
    var rowsData = [];
    fetch("https://api.github.com/repos/upbit/pixivpy/issues?state=closed")
      .then((response) => response.json())
      .then((json) => {
        for (var data of json) {
          rowsData.push(data);
        }
        callback(rowsData);
      })
      .done();
  },
});

var styles = StyleSheet.create({
    rowContainer:{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowCount: {
        fontSize: 20,
        textAlign: 'right',
        color: 'gray',
        margin: 10,
        marginLeft: 15,
    },
    rowDetailsContainer: {
        flex: 1,
    },
    rowTitle: {
        fontSize: 15,
        textAlign: 'left',
        marginTop: 10,
        marginBottom: 4,
        marginRight: 10,
        color: '#FF6600'
    },
    rowDetailsLine: {
        fontSize: 12,
        marginBottom: 10,
        color: 'gray',
    },
    listview: {
      marginBottom:49
    },
    separator: {
        height: 1,
        backgroundColor: '#CCCCCC'
    } 
});
