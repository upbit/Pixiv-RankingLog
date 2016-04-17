'use strict';

import React, {
  AppRegistry,
  Component,
  View,
  TouchableOpacity,
} from 'react-native';

var NavigationBar = require('react-native-navbar');

var Discover = require('./app/views/Discover');
var IconButton = require('./app/views/IconButton');

class PixivRankingLog extends Component {
  render() {
    return (
      <View style={{flex: 1}}>
        <NavigationBar
            title={{title: "RankingLog"}}
            leftButton={
              <IconButton name="gear" color="#666"
                onPress={() => alert("Configure!")} />
            }
          />
        <Discover />
      </View>
    );
  }
}

AppRegistry.registerComponent('PixivRankingLog', () => PixivRankingLog);
