// Shared service configuration.
window.SUPABASE_CONFIG = {
  url: 'https://jlnfnnrboozwywikxtel.supabase.co',
  anonKey: 'sb_publishable_hVMMz3_-yMQtsF4REDyDoQ_PRLgRGYE'
};

window.TMA_STORAGE_CONFIG = {
  publicBaseUrl: 'https://assets.tmastudy.io.vn',
  examsBaseUrl: 'https://assets.tmastudy.io.vn/data/exams/',
  gatewayUrl: 'https://tma-upload-gateway.vhai22102007.workers.dev'
};

window.TMA_AI_CONFIG = {
  endpoint: 'https://tma-upload-gateway.vhai22102007.workers.dev/ai'
};

(function () {
  'use strict';

  function cleanObjectKey(value) {
    return String(value || '')
      .replace(/\\/g, '/')
      .replace(/^\/+/, '')
      .split('/')
      .filter(function (part) { return part && part !== '.' && part !== '..'; })
      .join('/');
  }

  async function getTeacherToken() {
    try {
      if (window.supabaseClient && window.supabaseClient.auth) {
        var sessionResult = await window.supabaseClient.auth.getSession();
        var freshToken = sessionResult && sessionResult.data && sessionResult.data.session && sessionResult.data.session.access_token;
        if (freshToken) {
          var currentInfo = JSON.parse(localStorage.getItem('teacherInfo') || '{}');
          currentInfo.token = freshToken;
          localStorage.setItem('teacherInfo', JSON.stringify(currentInfo));
          return freshToken;
        }
      }
    } catch (error) {
      console.warn('Khong the lam moi phien giao vien cho R2:', error);
    }

    try {
      var teacherInfo = JSON.parse(localStorage.getItem('teacherInfo') || 'null');
      return teacherInfo && teacherInfo.token ? String(teacherInfo.token) : '';
    } catch (error) {
      return '';
    }
  }

  async function gatewayRequest(path, options) {
    var token = await getTeacherToken();
    if (!token) throw new Error('Phien giao vien da het han. Vui long dang nhap lai.');
    var requestOptions = options || {};
    var headers = new Headers(requestOptions.headers || {});
    headers.set('Authorization', 'Bearer ' + token);
    requestOptions.headers = headers;

    var response = await fetch(window.TMA_STORAGE_CONFIG.gatewayUrl + path, requestOptions);
    var result = await response.json().catch(function () { return {}; });
    if (!response.ok || result.success === false) {
      throw new Error((result.error && (result.error.message || result.error)) || result.message || ('R2 tra ve loi ' + response.status));
    }
    return result;
  }

  async function upload(key, body, contentType) {
    var objectKey = cleanObjectKey(key);
    if (!objectKey) throw new Error('Duong dan R2 khong hop le.');
    var slashIndex = objectKey.lastIndexOf('/');
    var folder = slashIndex === -1 ? '' : objectKey.slice(0, slashIndex);
    var fileName = slashIndex === -1 ? objectKey : objectKey.slice(slashIndex + 1);
    return gatewayRequest('/', {
      method: 'POST',
      headers: {
        'Content-Type': contentType || (body && body.type) || 'application/octet-stream',
        'X-File-Name': encodeURIComponent(fileName),
        'X-File-Path': encodeURIComponent(folder)
      },
      body: body
    });
  }

  window.TMAR2 = {
    publicUrl: function (key) {
      return window.TMA_STORAGE_CONFIG.publicBaseUrl.replace(/\/$/, '') + '/' + cleanObjectKey(key);
    },
    examUrl: function (fileName) {
      return window.TMA_STORAGE_CONFIG.examsBaseUrl + cleanObjectKey(fileName);
    },
    upload: upload,
    putJson: function (key, value) {
      return upload(key, new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }), 'application/json');
    },
    list: function (prefix) {
      return gatewayRequest('/objects?prefix=' + encodeURIComponent(cleanObjectKey(prefix)), { method: 'GET' });
    },
    remove: function (key) {
      return gatewayRequest('/objects?key=' + encodeURIComponent(cleanObjectKey(key)), { method: 'DELETE' });
    }
  };
})();
