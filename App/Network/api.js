var PixivAPI = require('PixivAPI');

exports.login = function (username, password, callback) {
	PixivAPI.loginIfNeeded(username, password, callback);
};

exports.ranking_all = function (page, callback) {
	PixivAPI.PAPI_ranking_all("weekly", page, callback);
};
