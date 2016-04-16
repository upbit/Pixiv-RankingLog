'use strict';

var { AsyncStorage } = require('react-native');

class PixivAPI {
  constructor() {
    this.auth = {};
  }

  // From: https://github.com/sindresorhus/query-string/blob/master/license
  toQueryString(obj) {
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

  login(username, password, callback) {
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
        body: this.toQueryString(params),
      })
      .then((response) => response.json())
      .then((json) => {
        if (json.has_error) {
          console.error(json.errors.system);
        } else {
          this.auth = json.response;
          this.auth.date = new Date();
          AsyncStorage.setItem('pixiv_auth', JSON.stringify(this.auth), () => {
            console.log(`Set auth to AsyncStorage, access_token=${this.auth.access_token}`);
          });

          callback(json.response);
        }
      })
      .catch((error) => {
        console.warn(error);
      });
  };

  login_if_needed(username, password, callback) {
    AsyncStorage.getItem('pixiv_auth')
      .then((response) => {
        if (!response) {
          this.login(username, password, callback);
        } else {
          // check storage
          let auth = JSON.parse(response);
          let expire_ts = new Date(auth.date).getTime() + auth.expires_in * 1000;
          let now_ts = new Date().getTime();

          if (now_ts > expire_ts) {
            this.login(username, password, callback);
          } else {
            this.auth = auth;
            console.log(`Get auth from AsyncStorage, access_token=${this.auth.access_token}`);
            callback(this.auth);
          }
        }
      });
  };

  _http_call(method, url, headers={}, params=null, data=null, callback=null) {
    if (!this.auth.hasOwnProperty('access_token')) {
      console.error("Authorization needed!");
      return this.auth;
    }

    const merged_headers = {...headers, ...{
      'Authorization': `Bearer ${this.auth.access_token}`,
      'Referer': 'http://spapi.pixiv.net/',
      'User-Agent': 'PixivIOSApp/5.8.3',
    }}

    let response = null;
    if (method == 'get') {
      const params_string = this.toQueryString(params);
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

  ranking(mode, page, callback) {
    this._http_call('get', `https://public-api.secure.pixiv.net/v1/ranking/illust.json`, {},
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

}

module.exports = PixivAPI;
