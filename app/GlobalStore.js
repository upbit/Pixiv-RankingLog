'use strict';

var React = require('react-native');

var { AsyncStorage } = React;

var PixivAPI = require("./network/pixiv_api");

class GlobalStore {
  initState() {
    return {
      currentMode: null,
      isLoaded: true,
      dataBlob: {},
    };
  }

  constructor() {
    const now = new Date();
    this.settings = {
      username: 'usersp',
      password: 'passsp',
      mode: 'daily',
      date: now.toLocaleDateString().replace(/\//g, '-'),
    };
    // state
    this.state = this.initState();
    this.api = new PixivAPI();
  }

  async _reloadSettings() {
    const setting_string = await AsyncStorage.getItem('settings');
    if (setting_string !== null){
      this.settings = JSON.parse(setting_string);
    }
    this.state = this.initState();
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

  fetchRankingLog(mode: string, page: number) {
    if (this.state.isLoaded == false) {
      console.log("Waiting, last fetch is in process...");
      return null;
    }

    console.log(`Fetch RankingLog(${mode}, page=${page})...`);
    // this.setState({ currentMode: mode, isLoaded: false });
    this.state.currentMode = mode;
    this.state.isLoaded = false;

    // real fetch pixiv rankings
    return this.api.ranking(mode, page)
      .then((illusts) => {
        // storage result with section title key
        const sectionID = `${mode} page-${page}`;
        var newDs = this.state.dataBlob;
        newDs[sectionID] = illusts;
        // this.setState({ isLoaded: true, dataBlob: newDs });
        this.state.isLoaded = true;
        this.state.dataBlob = newDs;
        return illusts;
      });
  }

  reset() {
    // AsyncStorage.removeItem('pixiv_auth');
    AsyncStorage.removeItem('settings');
  }
}

module.exports = new GlobalStore();
