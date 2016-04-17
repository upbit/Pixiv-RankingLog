'use strict';

import React, {
  AppRegistry,
  Component,
  View,
  TouchableOpacity,
} from 'react-native';

var NavigationBar = require('react-native-navbar');
var Icon = require('react-native-vector-icons/FontAwesome');

var Discover = require('./app/views/Discover');

class PixivRankingLog extends Component {
  render() {
    return (
      <View style={{flex: 1}}>
        <NavigationBar
            title={{title: "RankingLog"}}
            leftButton={
              <TouchableOpacity onPress={() => alert('Bulbazaaaavr!')}>
                <Icon name="ion-gear-a" size={24} />
              </TouchableOpacity>
            }
          />
        <Discover />
      </View>
    );
  }
}

AppRegistry.registerComponent('PixivRankingLog', () => PixivRankingLog);
