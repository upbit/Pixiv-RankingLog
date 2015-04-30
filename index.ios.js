/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  NavigatorIOS,
} = React;

var Discover = require("./App/View/Discover");

var PixivRankingLog = React.createClass({
  render: function() {
    return (
      <NavigatorIOS
        style={{flex: 1}}
        tintColor='gray'
        barTintColor='white'
        titleTextColor='#8900FF'
        initialRoute={{
          title: 'Discover',
          component: Discover,
        }}/>
    );
  },  
});

AppRegistry.registerComponent('PixivRankingLog', () => PixivRankingLog);
