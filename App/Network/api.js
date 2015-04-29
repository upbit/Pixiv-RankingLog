var PixivAPI = require('PixivAPI');

exports.ranking = function (page, callback) {
	PixivAPI.SAPI_ranking(page, "week", "all", false, callback);
};
