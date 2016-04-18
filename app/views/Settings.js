'use strict';

var React = require('react-native');

var {
  Modal,
  View,
  Text,
  TextInput,
  DatePickerIOS,
  StyleSheet,
} = React;

var FontAwesome = require('react-native-vector-icons/FontAwesome');

var css = require("./CommonStyles");

var WithLabel = React.createClass({
  render() {
    return (
      <View style={[css.row, css.center]}>
        <View>
          <Text>{this.props.label}</Text>
        </View>
        {this.props.children}
      </View>
    );
  }
});

module.exports = React.createClass({
  getInitialState() {
    return {
      username: null,
      password: null,
      date: new Date(),
    };
  },

  onDateChange(date) {
    this.setState({ date: date });
  },

  render() {
    return (
      <Modal
        animated={true}
        transparent={true}
        visible={this.props.visible}
        onRequestClose={this.props.onClose}
        >
        <View style={[css.center, css.column, {flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.8)'}]}>
          <WithLabel label="Value:">
            <Text>{this.state.date.toLocaleDateString()}</Text>
          </WithLabel>
          <DatePickerIOS
            date={this.state.date}
            mode="date"
            onDateChange={this.onDateChange}
          />

          <FontAwesome.Button name="check" size={20}
            color="#000000"
            backgroundColor="#CCCCCC"
            onPress={this.props.onClose}
          >
            Save
          </FontAwesome.Button>
        </View>
      </Modal>
    );
  },

});

var WithLabel = React.createClass({
  render: function() {
    return (
      <View style={styles.labelContainer}>
        <View style={styles.labelView}>
          <Text style={styles.label}>
            {this.props.label}
          </Text>
        </View>
        {this.props.children}
      </View>
    );
  }
});

var styles = StyleSheet.create({
  textinput: {
    height: 26,
    width: 50,
    borderWidth: 0.5,
    borderColor: '#0f0f0f',
    padding: 4,
    fontSize: 13,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  labelView: {
    marginRight: 10,
    paddingVertical: 2,
  },
  label: {
    fontWeight: 'bold',
  },
});
