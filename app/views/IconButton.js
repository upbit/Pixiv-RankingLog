'use strict';

var React = require('react-native');

var {
  TouchableOpacity,
} = React;

var Icon = require('react-native-vector-icons/FontAwesome');

module.exports = React.createClass({
  render: function() {
    return(
      <TouchableOpacity style={{ marginLeft: 10, marginTop: 10 }} onPress={()=>this.props.onPress()}>
        <Icon name={this.props.name} size={24} color={this.props.color} />
      </TouchableOpacity>
    );
  },
});
