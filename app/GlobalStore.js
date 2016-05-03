'use strict';

var React = require('react-native');

var { ListView, AsyncStorage } = React;

var PixivAPI = require("./network/pixiv_api");

class GlobalStore {
  constructor() {
    const now = new Date();
    this.api = new PixivAPI();
    this.settings = {
      username: 'usersp',
      password: 'passsp',
      mode: 'daily',
      date: now.toLocaleDateString().replace(/\//g, '-'),
    };
    this.ds = {
      current_mode: null,
      dataBlob: {},
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
        sectionHeaderHasChanged: (s1, s2) => s1 !== s2
      }),
      isLoaded: true,
    }
  }

  async _reloadSettings() {
    const setting_string = await AsyncStorage.getItem('settings');
    if (setting_string !== null){
      this.settings = JSON.parse(setting_string);
    }
    // reset ds
    this.ds = {
      current_mode: null,
      dataBlob: {},
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
        sectionHeaderHasChanged: (s1, s2) => s1 !== s2
      }),
      isLoaded: true,
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

  fetchRankingLog(mode: string, refresh: boolean) {
    if (this.ds.isLoaded == false) {
      console.log("Waiting, last fetch is in process...");
      return null;
    }

    var current_page = this.ds.page + 1;
    if (refresh || mode != this.ds.current_mode) {
      current_page = 1;
      this.ds.current_mode = mode;
    }
    this.ds.page = current_page;

    console.log(`Fetch RankingLog(${this.ds.current_mode}, page=${this.ds.page})...`);
    
    // real fetch pixiv rankings
    this.ds.isLoaded = false;
    GlobalStore.api.ranking(this.ds.current_mode, this.ds.page)
      .then((illusts) => {
        // storage result with section title key
        const sectionID = `${this.ds.current_mode}-Page${this.ds.page}`;
        var newDs = this.ds.dataBlob;
        newDs[sectionID] = illusts;
        this.ds.dataBlob = newDs;
      })
      .then(() => {
        // console.log(this.state.dataBlob);
        this.setState({
          dataSource: this.state.dataSource.cloneWithRowsAndSections(this.state.dataBlob),
          isLoaded: true,
        });
      });
  }

  reset() {
    // AsyncStorage.removeItem('pixiv_auth');
    AsyncStorage.removeItem('settings');
  }
}

module.exports = new GlobalStore();
