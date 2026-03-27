const adminStore = require('../../services/api/admin')
const storage = require('../../utils/storage')
const localeStore = require('../../utils/locale')
const feedback = require('../../utils/ui-feedback')
const uiText = require('../../constants/messages')
const copyStore = require('../../constants/copy')

const INITIAL_THEME = storage.getThemeData()
const INITIAL_LOCALE = localeStore.getLocale()

function getCurrentLanguageOption(locale) {
  return copyStore.getLanguageOptions(locale).find((option) => option.code === locale) || copyStore.getLanguageOptions(locale)[0] || null
}

Page({
  data: {
    isAdmin: false,
    locale: INITIAL_LOCALE,
    copy: copyStore.getPageCopy('settings', INITIAL_LOCALE),
    commonCopy: copyStore.getCommonCopy(INITIAL_LOCALE),
    languageOptions: copyStore.getLanguageOptions(INITIAL_LOCALE),
    currentLanguageOption: getCurrentLanguageOption(INITIAL_LOCALE),
    themeMode: INITIAL_THEME.themeMode,
    themeClass: INITIAL_THEME.themeClass,
    isDarkTheme: INITIAL_THEME.isDarkTheme
  },

  onShow() {
    this.refreshTheme()
    this.refreshLocale()
    this.refreshState()
  },

  async refreshState() {
    this.setData({
      isAdmin: await adminStore.getAdminState()
    })
  },

  refreshTheme() {
    this.setData(storage.getThemeData())
  },

  refreshLocale() {
    const locale = localeStore.getLocale()
    const languageOptions = copyStore.getLanguageOptions(locale)

    this.setData({
      locale,
      copy: copyStore.getPageCopy('settings', locale),
      commonCopy: copyStore.getCommonCopy(locale),
      languageOptions,
      currentLanguageOption: languageOptions.find((option) => option.code === locale) || languageOptions[0] || null
    })
  },

  setLightTheme() {
    storage.saveThemeMode(storage.LIGHT_THEME)
    this.setData(storage.getThemeData())
  },

  setDarkTheme() {
    storage.saveThemeMode(storage.DARK_THEME)
    this.setData(storage.getThemeData())
  },

  setLocale(e) {
    const nextLocale = e && e.currentTarget && e.currentTarget.dataset
      ? String(e.currentTarget.dataset.locale || '')
      : ''

    if (!nextLocale) {
      return
    }

    localeStore.setLocale(nextLocale)
    this.refreshLocale()
  },

  goToModeration() {
    if (!this.data.isAdmin) {
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
      success: async (res) => {
        if (!res.confirm) {
          return
        }

        try {
          const result = await adminStore.enableAdminAccess(res.content || '')
          if (result && result.isAdmin) {
            feedback.showSuccessToast(uiText.PROFILE.ADMIN_UNLOCKED)
            this.refreshState()
            return
          }
        } catch (error) {
          feedback.showNeutralToast(uiText.PROFILE.ADMIN_WRONG_CODE)
          return
        }

        if (await adminStore.getAdminState()) {
          feedback.showSuccessToast(uiText.PROFILE.ADMIN_UNLOCKED)
          this.refreshState()
          return
        }

        feedback.showNeutralToast(uiText.PROFILE.ADMIN_WRONG_CODE)
      }
    })
  },

  async disableAdmin() {
    try {
      await adminStore.disableAdminAccess()
    } catch (error) {}

    this.refreshState()
    feedback.showNeutralToast(uiText.PROFILE.ADMIN_DISABLED)
  }
})
