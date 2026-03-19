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

const THEME_STORAGE_KEY = 'uiThemeMode'
const LIGHT_THEME = 'light'
const DARK_THEME = 'dark'

function normalizeThemeMode(value) {
  return value === DARK_THEME ? DARK_THEME : LIGHT_THEME
}

function saveThemeMode(value) {
  const themeMode = normalizeThemeMode(value)
  safeSetStorage(THEME_STORAGE_KEY, themeMode)
  return themeMode
}

function getThemeData() {
  const themeMode = normalizeThemeMode(safeGetStorage(THEME_STORAGE_KEY, LIGHT_THEME))

  return {
    themeMode,
    themeClass: themeMode === DARK_THEME ? 'theme-dark' : 'theme-light',
    isDarkTheme: themeMode === DARK_THEME
  }
}

module.exports = {
  safeGetStorage,
  safeSetStorage,
  safeRemoveStorage,
  THEME_STORAGE_KEY,
  LIGHT_THEME,
  DARK_THEME,
  normalizeThemeMode,
  saveThemeMode,
  getThemeData
}
