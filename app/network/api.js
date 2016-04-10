'use strict';

var auth = {
  access_token: "7yCKitUOCF2p9tAzIN8XOXwYep3QJIBbvxaya1KcxFg"
};

// From: https://github.com/sindresorhus/query-string/blob/master/license
var toQueryString = function(obj) {
  return obj ? Object.keys(obj).sort().map(function (key) {
    var val = obj[key];
    if (Array.isArray(val)) {
      return val.sort().map(function (val2) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
      }).join('&');
    }
    return encodeURIComponent(key) + '=' + encodeURIComponent(val);
  }).join('&') : '';
}

exports.login = function(username, password, callback) {
  const params = {
    'client_id': 'bYGKuGVw91e0NMfPGp44euvGt59s',
    'client_secret': 'HP3RmkgAmEGro0gn1x9ioawQE8WMfvLXDz3ZqxpK',
    'grant_type': 'password',
    'username': username,
    'password': password,
  };

  fetch('https://oauth.secure.pixiv.net/auth/token', {
      method: 'POST',
      headers: {
        'Referer': 'http://www.pixiv.net/',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: toQueryString(params),
    })
    .then((response) => response.json())
    .then((json) => {
      // console.log(json);

      if (json.has_error) {
        console.error(json.errors.system);
      } else {
        auth = json.response;
        callback(json.response);
      }
    })
    .catch((error) => {
      console.warn(error);
    });
};

// http fetch for pixiv
var fetch_url = function(method, url, headers={}, params=null, data=null, callback=null) {
  if (!auth.hasOwnProperty('access_token')) {
    console.error("Authorization needed!");
    return auth;
  }

  const merged_headers = {...headers, ...{
    'Authorization': `Bearer ${auth.access_token}`,
    'Referer': 'http://spapi.pixiv.net/',
    'User-Agent': 'PixivIOSApp/5.8.3',
  }}

  let response = null;
  if (method == 'get') {
    const params_string = toQueryString(params);
    if (params_string.length > 0) {
      response = fetch(url+'?'+params_string, {method: 'get', headers: merged_headers})
    } else {
      response = fetch(url, {method: 'get', headers: merged_headers})
    }
  }

  if (response) {
    response.then((response) => response.json())
      .then((json) => {
        callback(json);
      })
      .catch((error) => {
        console.warn(error);
      });
  } else {
    console.error(`Failed fetch(method=${method}, url=${url}), unsupported request`)
  }

};

exports.ranking = function(mode, page, callback) {
  fetch_url('get', `https://public-api.secure.pixiv.net/v1/ranking/illust.json`, {},
    {
      'mode': mode,
      'page': page,
      'per_page': 50,
      'include_stats': true,
      'include_sanity_level': true,
      'image_sizes': 'px_128x128,px_480mw,large',
      'profile_image_sizes': 'px_170x170,px_50x50',
    }, null, (json) => {
      if (json.status != 'success') {
        console.error(json);
      }
      callback(json.response[0].works);
    })
};
