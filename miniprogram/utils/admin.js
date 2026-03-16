const STORAGE_KEY = 'adminAccess'
const ADMIN_PASSCODE = 'unimarket-admin'

function safeGetStorage(key, fallback = null) {
  if (typeof wx === 'undefined' || !wx.getStorageSync) {
    return fallback
  }

  try {
    const value = wx.getStorageSync(key)
    return value === '' || typeof value === 'undefined' ? fallback : value
  } catch (error) {
    return fallback
  }
}

function safeSetStorage(key, value) {
  if (typeof wx === 'undefined' || !wx.setStorageSync) {
    return
  }

  try {
    wx.setStorageSync(key, value)
  } catch (error) {}
}

function safeRemoveStorage(key) {
  if (typeof wx === 'undefined' || !wx.removeStorageSync) {
    return
  }

  try {
    wx.removeStorageSync(key)
  } catch (error) {}
}

function isAdmin() {
  return safeGetStorage(STORAGE_KEY, false) === true
}

function enableAdmin(code) {
  if (code !== ADMIN_PASSCODE) {
    return false
  }

  safeSetStorage(STORAGE_KEY, true)
  return true
}

function disableAdmin() {
  safeRemoveStorage(STORAGE_KEY)
}

module.exports = {
  isAdmin,
  enableAdmin,
  disableAdmin
}
