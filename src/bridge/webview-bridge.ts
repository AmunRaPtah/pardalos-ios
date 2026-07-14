// ── Injected JavaScript that enables native ↔ web communication ──

/**
 * Returns a block of JavaScript that will be injected into every page the
 * WebView loads.  It exposes a `window.PardalosBridge` object the web app
 * can call to interact with the native shell.
 *
 * ## API exposed to the web app
 *
 * ```js
 * window.PardalosBridge = {
 *   // Navigate to a native screen
 *   openNativeScreen(screenName, params)
 *
 *   // Open the system share-sheet for a file
 *   shareFile(uri, mimeType)
 *
 *   // Save a remote URL to the device's local files
 *   saveFile(url, fileName)
 *
 *   // Get the Pardalos server URL (Promise<string>)
 *   getServerUrl()
 *
 *   // Get the app version / build info (Promise<object>)
 *   getAppInfo()
 *
 *   // Copy text to the system clipboard
 *   copyToClipboard(text)
 *
 *   // Trigger haptic feedback ('light' | 'medium' | 'heavy')
 *   hapticFeedback(style)
 *
 *   // Open a URL in the system browser
 *   openUrl(url)
 * }
 * ```
 */
export function getBridgeInjectionScript(): string {
  return `
(function() {
  if (window.__PardalosBridgeInjected) return;
  window.__PardalosBridgeInjected = true;

  var _pending = {};   // id → { resolve, reject }
  var _msgId = 0;

  function _nextId() { return 'br_' + (++_msgId) + '_' + Date.now(); }

  function _post(type, payload) {
    return new Promise(function (resolve, reject) {
      var id = _nextId();
      _pending[id] = { resolve: resolve, reject: reject };
      try {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, payload: payload, id: id }));
      } catch (e) {
        delete _pending[id];
        reject(e);
      }
      // Timeout after 10 s
      setTimeout(function () {
        if (_pending[id]) {
          delete _pending[id];
          reject(new Error('Bridge call "' + type + '" timed out'));
        }
      }, 10000);
    });
  }

  // Listen for responses from native
  window.addEventListener('pardalos-bridge-response', function (e) {
    var detail = e.detail;
    if (detail && detail.id && _pending[detail.id]) {
      _pending[detail.id].resolve(detail.payload || {});
      delete _pending[detail.id];
    }
  });

  // Listen for unsolicited native messages
  window.addEventListener('pardalos-bridge-message', function (e) {
    var detail = e.detail;
    // The web app can listen for these events too
    var evt = new CustomEvent('pardalos:' + detail.type, { detail: detail.payload });
    window.dispatchEvent(evt);
  });

  // The public API
  window.PardalosBridge = {
    openNativeScreen: function (screen, params) {
      return _post('openNativeScreen', { screen: screen, params: params });
    },
    shareFile: function (uri, mimeType) {
      return _post('shareFile', { uri: uri, mimeType: mimeType || 'application/octet-stream' });
    },
    saveFile: function (url, fileName) {
      return _post('saveFile', { url: url, fileName: fileName });
    },
    getServerUrl: function () {
      return _post('getServerUrl');
    },
    getAppInfo: function () {
      return _post('getAppInfo');
    },
    copyToClipboard: function (text) {
      return _post('copyToClipboard', { text: text });
    },
    hapticFeedback: function (style) {
      return _post('hapticFeedback', { style: style || 'medium' });
    },
    openUrl: function (url) {
      return _post('openUrl', { url: url });
    },
    openGrantProgram: function (programId) {
      return _post('openGrantProgram', { programId: programId });
    },
    openGrantDashboard: function () {
      return _post('openGrantDashboard');
    },
    openGrantApplications: function () {
      return _post('openGrantApplications');
    },
  };

  // Notify the web app that the bridge is ready
  var ready = new CustomEvent('pardalos:bridgeReady', { detail: {} });
  window.dispatchEvent(ready);
})();
true;
`
}
