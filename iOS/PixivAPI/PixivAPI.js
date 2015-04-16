/**
 * @providesModule PixivAPI
 * @flow
 */
'use strict';

var PixivAPI = require('NativeModules').PixivAPI;

module.exports = {
  SAPI_ranking: function(page: number, mode: string, content: string, callback: Function) {
    PixivAPI.SAPI_ranking(callback, page, mode, content);
  },
};
