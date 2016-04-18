'use strict';

import React, {
  AppRegistry,
  Component,
  View,
  Text,
} from 'react-native';

var NavigationBar = require('react-native-navbar');
var FontAwesome = require('react-native-vector-icons/FontAwesome');

var Discover = require('./app/views/Discover');

class PixivRankingLog extends Component {
  render() {
    return (
      <View style={{flex: 1}}>
        <NavigationBar
            tintColor="#F0F0F0"
            title={{title: "RankingLog"}}
            leftButton={
              <FontAwesome.Button name="gear" size={28}
                  color="#000000"
                  backgroundColor="#EEEEEE"
                  onPress={() => alert("Configure!")} />
            }
          />
        <Discover />
      </View>
    );
  }
}

AppRegistry.registerComponent('PixivRankingLog', () => PixivRankingLog);
