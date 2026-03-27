const {
  SESSION_TOKEN_STORAGE_KEY
} = require('./config')

function getSessionToken() {
  if (typeof wx === 'undefined' || typeof wx.getStorageSync !== 'function') {
    return ''
  }

  return String(wx.getStorageSync(SESSION_TOKEN_STORAGE_KEY) || '').trim()
}

function setSessionToken(token) {
  if (typeof wx === 'undefined' || typeof wx.setStorageSync !== 'function') {
    return ''
  }

  const normalizedToken = String(token || '').trim()
  wx.setStorageSync(SESSION_TOKEN_STORAGE_KEY, normalizedToken)
  return normalizedToken
}

function clearSessionToken() {
  if (typeof wx === 'undefined' || typeof wx.removeStorageSync !== 'function') {
    return
  }

  wx.removeStorageSync(SESSION_TOKEN_STORAGE_KEY)
}

module.exports = {
  getSessionToken,
  setSessionToken,
  clearSessionToken
}
