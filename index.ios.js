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
  View,
} = React;

var PixivAPI = require('PixivAPI');

var PixivRankingLog = React.createClass({
  componentWillMount: function() {
    // PixivAPI.loginIfNeeded("username", "password", (results) => {
    //   console.log("loginIfNeeded");
    //   console.log(results);
    // });

    PixivAPI.SAPI_ranking(1, "daily", "all", false, (results) => {
      console.log("SAPI_ranking");
      var json_results = JSON.parse(results);
      console.log(json_results);
      console.log(json_results[0])
      console.log(json_results[1].mobileURL)
    });
  },

  render: function() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit index.ios.js
        </Text>
        <Text style={styles.instructions}>
          Press Cmd+R to reload,{'\n'}
          Cmd+Control+Z for dev menu
        </Text>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('PixivRankingLog', () => PixivRankingLog);
