'use strict';

var React = require('react-native');

var {
  Modal,
  View,
  Text,
  TextInput,
  Picker,
  DatePickerIOS,
  AsyncStorage,
  StyleSheet,
} = React;

var FontAwesome = require('react-native-vector-icons/FontAwesome');

var utils = require('../utils/functions');
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
    return {
      username: null,
      password: null,
      mode: 'daily',
      date: new Date(),
    };
  },

  componentDidMount() {
    this._loadInitialState().done();
  },

  async _loadInitialState() {
    const setting_string = await AsyncStorage.getItem('settings');
    if (setting_string !== null){
      var last_state = JSON.parse(setting_string);
      last_state.date = new Date(last_state.date);
      console.log(`Get settings from AsyncStorage, mode=${last_state.mode} date=${last_state.date.toLocaleDateString()}`);
      this.setState(last_state);
    }
  },

  componentWillReceiveProps: function(props) {
    if (props.visible == false) {
      // onClose, sync state to AsyncStorage
      AsyncStorage.setItem('settings', JSON.stringify(this.state), () => {
        console.log(`Save settings to AsyncStorage, mode=${this.state.mode} date=${this.state.date.toLocaleDateString()}`);
      });
    }
  },

  render() {
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
            <Text>{this.state.type}</Text>
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
            <Text>{this.state.date.toLocaleDateString()}</Text>
          </WithLabel>
          <DatePickerIOS
            style={{width: utils.SCREEN_WIDTH}}
            date={this.state.date}
            mode="date"
            onDateChange={(date) => this.setState({ date: date })} />

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
