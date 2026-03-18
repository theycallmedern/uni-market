function safeGetStorage(key, fallback = null) {
  if (typeof wx === 'undefined' || !wx.getStorageSync) {
    return fallback
  }

  try {
    const value = wx.getStorageSync(key)
    return value === '' || value === undefined || value === null ? fallback : value
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

module.exports = {
  safeGetStorage,
  safeSetStorage,
  safeRemoveStorage
}
