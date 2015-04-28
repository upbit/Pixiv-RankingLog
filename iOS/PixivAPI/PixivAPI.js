/**
 * @providesModule PixivAPI
 * @flow
 */
'use strict';

var PixivAPI = require('NativeModules').PixivAPI;

module.exports = {
	loginIfNeeded: function(username: string, password: string, callback: Function) {
		PixivAPI.loginIfNeeded(username, password, callback);
	},
	SAPI_ranking: function(page: number, mode: string, content: string, requireAuth: boolean, callback: Function) {
		PixivAPI.SAPI_ranking(page, mode, content, requireAuth, callback);
	},
};
