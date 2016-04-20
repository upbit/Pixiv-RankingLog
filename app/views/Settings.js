'use strict';

var React = require('react-native');

var {
  Modal,
  View,
  Text,
  TextInput,
  Picker,
  DatePickerIOS,
  StyleSheet,
} = React;

var FontAwesome = require('react-native-vector-icons/FontAwesome');

var utils = require('../utils/functions');
var css = require("./CommonStyles");
var GlobalStore = require('../GlobalStore');

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

var RANKING_MODES = [
  'daily',
  'weekly',
  'male',
  'female',
  'daily_r18',
  'weekly_r18',
  'male_r18',
  'female_r18',
  'r18g',
];

module.exports = React.createClass({
  getInitialState() {
    const now = new Date();
    return {
      username: null,
      password: null,
      mode: 'daily',
      date: now.toLocaleDateString().replace(/\//g, '-'),
    };
  },

  componentDidMount() {
    GlobalStore.reloadSettings()
      .then(() => {
        this.setState(GlobalStore.settings);
      });
  },

  componentWillReceiveProps(props) {
    if (props.visible == false) {
      GlobalStore.saveSettings(this.state);   // onClose, sync state to AsyncStorage
    }
  },

  render() {
    const obj_date = new Date(this.state.date);
    return (
      <Modal
        animated={true}
        transparent={true}
        visible={this.props.visible}
        onRequestClose={this.props.onClose}
        >
        <View style={[css.center, {flex: 1, backgroundColor: '#FFFFFF'}]}>
          <WithLabel label="Username:">
            <TextInput
              style={{height: 24, width: utils.SCREEN_WIDTH/2}}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="username"
              onChangeText={(text) => this.setState({username: text})}
              value={this.state.username} />
          </WithLabel>

          <WithLabel label="Password:">
            <TextInput
              style={{height: 24, width: utils.SCREEN_WIDTH/2}}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={true}
              placeholder="password"
              onChangeText={(text) => this.setState({password: text})}
              value={this.state.password} />
          </WithLabel>

          <WithLabel label="Mode:">
            <Text>{this.state.mode}</Text>
          </WithLabel>
          <Picker
            style={{width: utils.SCREEN_WIDTH}}
            selectedValue={this.state.mode}
            onValueChange={(value) => this.setState({mode: value})}>
            {RANKING_MODES.map((mode) => (
              <Picker.Item key={mode} value={mode} label={mode} />
            ))}
          </Picker>

          <WithLabel label="Date:">
            <Text>{this.state.date}</Text>
          </WithLabel>
          <DatePickerIOS
            style={{width: utils.SCREEN_WIDTH}}
            date={obj_date}
            mode="date"
            onDateChange={(date) => this.setState({ date: date.toLocaleDateString().replace(/\//g, '-') })} />

          <FontAwesome.Button name="check" size={20}
            color="#000000"
            backgroundColor="#CCCCCC"
            onPress={this.props.onClose}
          >
            Save
          </FontAwesome.Button>

          <FontAwesome.Button name="remove" size={20}
            color="#FF0000"
            backgroundColor="#CCCCCC"
            onPress={() => { GlobalStore.reset() }}
          >
            Reset
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
