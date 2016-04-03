'use strict';

var React = require('react-native');

var {
  View,
    TabBarIOS
} = React;

var Icon = require('react-native-vector-icons/FontAwesome');

module.exports = React.createClass({
  getInitialState: function(){
    return {
      structure: this.props.structure,
      selectedTab: this.props.selectedTab,
      iconSize: this.props.iconSize ? this.props.iconSize : 30,
      activeTintColor: this.props.activeTintColor ? this.props.activeTintColor : null
    };
  },
    render: function(){
        return(
          <TabBarIOS tintColor={this.state.activeTintColor} translucent={true}>
            {this.state.structure.map((tabProps, tabIndex) => 
              <Icon.TabBarItem title={tabProps.title}
                  iconName={tabProps.iconName}
                  iconSize={this.state.iconSize}
                  selected={tabIndex == this.state.selectedTab}
                  onPress={() => {this.setState({selectedTab: tabIndex});}}
                  key={tabIndex}>
                {tabProps.renderContent()}
              </Icon.TabBarItem>
            )}
          </TabBarIOS>
        );
    }
});
