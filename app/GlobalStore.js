'use strict';

var React = require('react-native');

var { AsyncStorage } = React;

var PixivAPI = require("./network/pixiv_api");

class GlobalStore {
  constructor() {
    const now = new Date();
    this.api = new PixivAPI();
    this.settings = {
      username: null,
      password: null,
      mode: 'daily',
      date: now.toLocaleDateString().replace(/\//g, '-'),
    };
  }

  async _reloadSettings() {
    const setting_string = await AsyncStorage.getItem('settings');
    if (setting_string !== null){
      this.settings = JSON.parse(setting_string);
    }
  }

  reloadSettings() {
    return this._reloadSettings();
  }

  saveSettings(settings) {
    this.settings = settings;
    AsyncStorage.setItem('settings', JSON.stringify(this.settings), () => {
      console.log(`Save settings to AsyncStorage, mode=${this.settings.mode} date=${this.settings.date}`);
    });
  }

  reset() {
    AsyncStorage.removeItem('pixiv_auth');
    AsyncStorage.removeItem('settings');
  }
}

module.exports = new GlobalStore();
