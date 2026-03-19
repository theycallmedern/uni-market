const adminStore = require('../../utils/admin')
const storage = require('../../utils/storage')
const feedback = require('../../utils/ui-feedback')
const uiText = require('../../constants/messages')

const THEME_STORAGE_KEY = 'uiThemeMode'
const LIGHT_THEME = 'light'
const DARK_THEME = 'dark'

function normalizeThemeMode(value) {
  return value === DARK_THEME ? DARK_THEME : LIGHT_THEME
}

function getThemeData() {
  const themeMode = normalizeThemeMode(storage.safeGetStorage(THEME_STORAGE_KEY, LIGHT_THEME))

  return {
    themeMode,
    themeClass: themeMode === DARK_THEME ? 'theme-dark' : 'theme-light',
    isDarkTheme: themeMode === DARK_THEME
  }
}

function saveThemeMode(value) {
  const themeMode = normalizeThemeMode(value)
  storage.safeSetStorage(THEME_STORAGE_KEY, themeMode)
  return themeMode
}

const INITIAL_THEME = getThemeData()

Page({
  data: {
    isAdmin: false,
    themeMode: INITIAL_THEME.themeMode,
    themeClass: INITIAL_THEME.themeClass,
    isDarkTheme: INITIAL_THEME.isDarkTheme
  },

  onShow() {
    this.refreshTheme()
    this.refreshState()
  },

  refreshState() {
    this.setData({
      isAdmin: adminStore.isAdmin()
    })
  },

  refreshTheme() {
    this.setData(getThemeData())
  },

  setLightTheme() {
    saveThemeMode(LIGHT_THEME)
    this.setData(getThemeData())
  },

  setDarkTheme() {
    saveThemeMode(DARK_THEME)
    this.setData(getThemeData())
  },

  goToModeration() {
    if (!adminStore.isAdmin()) {
      feedback.showNeutralToast(uiText.PROFILE.ADMIN_REQUIRED)
      return
    }

    wx.navigateTo({
      url: '/pages/moderation/moderation'
    })
  },

  openAdminGate() {
    feedback.showModal({
      title: uiText.PROFILE.ADMIN_TITLE,
      editable: true,
      placeholderText: uiText.PROFILE.ADMIN_PLACEHOLDER,
      confirmText: uiText.PROFILE.ADMIN_CONFIRM,
      success: (res) => {
        if (!res.confirm) {
          return
        }

        const success = adminStore.enableAdmin(res.content || '')
        if (success) {
          feedback.showSuccessToast(uiText.PROFILE.ADMIN_UNLOCKED)
          this.refreshState()
          return
        }

        feedback.showNeutralToast(uiText.PROFILE.ADMIN_WRONG_CODE)
      }
    })
  },

  disableAdmin() {
    adminStore.disableAdmin()
    this.refreshState()
    feedback.showNeutralToast(uiText.PROFILE.ADMIN_DISABLED)
  }
})
