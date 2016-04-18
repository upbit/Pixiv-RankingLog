'use strict';

var React = require('react-native');

var {
  View,
  Text,
} = React;

var NavigationBar = require('react-native-navbar');
var FontAwesome = require('react-native-vector-icons/FontAwesome');

var Discover = require('./views/Discover');
var Settings = require('./views/Settings');

console.ignoredYellowBox = [ 'Warning: Failed propType' ];

module.exports = React.createClass({
  getInitialState() {
    return {
      settingVisible: true,
    };
  },

  _setSettingVisible(visible) {
    this.setState({settingVisible: visible});
  },

  render() {
    return(
      <View style={{flex: 1}}>
        <NavigationBar
          tintColor="#F0F0F0"
          title={{title: "RankingLog"}}
          leftButton={
            <FontAwesome.Button name="gear" size={28}
              color="#000000"
              backgroundColor="#EEEEEE"
              onPress={() => this._setSettingVisible(true)}
            />
          }
        />

        <Settings
          visible={this.state.settingVisible}
          onClose={() => this._setSettingVisible(false)}
        />

      </View>
    );
  },

});
