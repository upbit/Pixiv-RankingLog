'use strict';

import React, {
  AppRegistry,
  Component,
  StyleSheet,
  NavigatorIOS,
} from 'react-native';

var Discover = require('./app/views/Discover.js');

class PixivRankingLog extends Component {
  render() {
    return (
       <NavigatorIOS
        style={styles.container}
        tintColor='#FF6600'
        initialRoute={{
          title: 'RankingLog',
          component: Discover,
        }}/>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6EF',
  },
});

AppRegistry.registerComponent('PixivRankingLog', () => PixivRankingLog);
