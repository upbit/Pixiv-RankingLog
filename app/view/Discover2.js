/* ================================================================
 * autoresponsive_react_native_sample by xdf(xudafeng[at]126.com)
 *
 * first created at : Mon Jun 02 2014 20:15:51 GMT+0800 (CST)
 *
 * ================================================================
 * Copyright 2015 xdf
 *
 * Licensed under the MIT License
 * You may not use this file except in compliance with the License.
 *
 * ================================================================ */

let React = require('react-native');
let AutoResponisve = require('./AutoResponsive');
let Dimensions = require('Dimensions');

const screenWidth = Dimensions.get('window').width;
const noop = function() {};

let {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ScrollView
} = React;

class Discover2 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      array: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    };
  }

  getChildrenStyle() {
    return {
      width: (screenWidth - 18) / 2,
      height: parseInt(Math.random() * 20 + 12) * 10,
      backgroundColor: 'rgb(92, 67, 155)',
      paddingTop: 20,
      borderRadius: 8
    };
  }

  getAutoResponisveProps() {
    return {
      itemMargin: 8
    };
  }

  renderChildren() {
    return this.state.array.map(function(i, key) {
      return (
        <View style={this.getChildrenStyle()} key={key}>
          <Text style={styles.text}>{i}</Text>
        </View>
      );
    }, this);
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.title}>
          <Text style={styles.titleText}>autoresponsive</Text>
        </View>
        <AutoResponisve {...this.getAutoResponisveProps()}>
        {this.renderChildren()}
        </AutoResponisve>
      </ScrollView>
    );
  }
}

let styles = StyleSheet.create({
  container: {
    backgroundColor: '#301711'
  },
  title: {
    paddingTop: 20,
    paddingBottom: 20
  },
  titleText: {
    color: '#d0bbab',
    textAlign: 'center',
    fontSize: 36,
    fontWeight: 'bold'
  },
  text: {
    textAlign: 'center',
    fontSize: 60,
    fontWeight: 'bold',
    color: 'rgb(58, 45, 91)'
  }
});

module.exports = Discover2;
