'use strict';

import React, {
  Component,
} from 'react';

import {
  View,
  Text,
} from 'react-native';

import NavigationBar from 'react-native-navbar';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import Discover from './views/Discover';
import Settings from './views/Settings';

console.ignoredYellowBox = [ 'Warning: Failed propType' ];

export default class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settingVisible: false,
    };
  }

  _setSettingVisible(visible) {
    this.setState({settingVisible: visible});
  }

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

        <Discover visible={!this.state.settingVisible}/>
      </View>
    );
  }
}
