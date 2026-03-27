const storage = require('./storage')
const localeStore = require('./locale')

function canUseWxMethod(name) {
  return typeof wx !== 'undefined' && wx && typeof wx[name] === 'function'
}

function getCurrentPage() {
  if (typeof getCurrentPages !== 'function') {
    return null
  }

  const pages = getCurrentPages()
  return pages && pages.length ? pages[pages.length - 1] : null
}

function getThemeMode() {
  const themeData = storage.getThemeData ? storage.getThemeData() : null
  return themeData && themeData.themeMode ? themeData.themeMode : 'light'
}

function getLocale() {
  const page = getCurrentPage()
  const pageLocale = page && page.data ? page.data.locale : ''
  return localeStore.normalizeLocale(pageLocale || localeStore.getLocale())
}

function getDefaultCancelText() {
  const locale = getLocale()

  if (locale === 'zh') {
    return '取消'
  }

  if (locale === 'ru') {
    return 'Отмена'
  }

  return 'Cancel'
}

function getDefaultConfirmText() {
  const locale = getLocale()

  if (locale === 'zh') {
    return '确定'
  }

  if (locale === 'ru') {
    return 'ОК'
  }

  return 'OK'
}

function getFeedbackModal() {
  const page = getCurrentPage()
  if (!page || typeof page.selectComponent !== 'function') {
    return null
  }

  return page.selectComponent('#feedback-modal')
}

function getFeedbackActionSheet() {
  const page = getCurrentPage()
  if (!page || typeof page.selectComponent !== 'function') {
    return null
  }

  return page.selectComponent('#feedback-action-sheet')
}

function normalizeToastOptions(optionsOrTitle, icon = 'none', extra = {}) {
  if (typeof optionsOrTitle === 'string') {
    return {
      title: optionsOrTitle,
      icon,
      ...extra
    }
  }

  const options = optionsOrTitle && typeof optionsOrTitle === 'object'
    ? optionsOrTitle
    : {}

  return {
    icon: 'none',
    ...options
  }
}

function showToast(optionsOrTitle, icon = 'none', extra = {}) {
  if (!canUseWxMethod('showToast')) {
    return
  }

  wx.showToast(normalizeToastOptions(optionsOrTitle, icon, extra))
}

function showSuccessToast(title, extra = {}) {
  showToast(title, 'success', extra)
}

function showNeutralToast(title, extra = {}) {
  showToast(title, 'none', extra)
}

function showModal(options = {}) {
  const presentOptions = {
    cancelText: getDefaultCancelText(),
    confirmText: getDefaultConfirmText(),
    themeMode: getThemeMode(),
    ...options
  }
  const modal = getFeedbackModal()
  if (modal && typeof modal.present === 'function') {
    modal.present(presentOptions)
    return
  }

  const fallbackToNative = () => {
    if (!canUseWxMethod('showModal')) {
      return
    }

    wx.showModal(presentOptions)
  }

  if (typeof wx !== 'undefined' && wx && typeof wx.nextTick === 'function') {
    wx.nextTick(() => {
      const delayedModal = getFeedbackModal()
      if (delayedModal && typeof delayedModal.present === 'function') {
        delayedModal.present(presentOptions)
        return
      }

      setTimeout(() => {
        const retriedModal = getFeedbackModal()
        if (retriedModal && typeof retriedModal.present === 'function') {
          retriedModal.present(presentOptions)
          return
        }

        fallbackToNative()
      }, 40)
    })
    return
  }

  fallbackToNative()
}

function showInfoModal(options = {}) {
  showModal({
    showCancel: false,
    ...options
  })
}

function showActionSheet(options = {}) {
  const presentOptions = {
    cancelText: getDefaultCancelText(),
    themeMode: getThemeMode(),
    ...options
  }
  const sheet = getFeedbackActionSheet()
  if (sheet && typeof sheet.present === 'function') {
    sheet.present(presentOptions)
    return
  }

  const fallbackToNative = () => {
    if (!canUseWxMethod('showActionSheet')) {
      return
    }

    wx.showActionSheet(presentOptions)
  }

  if (typeof wx !== 'undefined' && wx && typeof wx.nextTick === 'function') {
    wx.nextTick(() => {
      const delayedSheet = getFeedbackActionSheet()
      if (delayedSheet && typeof delayedSheet.present === 'function') {
        delayedSheet.present(presentOptions)
        return
      }

      setTimeout(() => {
        const retriedSheet = getFeedbackActionSheet()
        if (retriedSheet && typeof retriedSheet.present === 'function') {
          retriedSheet.present(presentOptions)
          return
        }

        fallbackToNative()
      }, 40)
    })
    return
  }

  fallbackToNative()
}

module.exports = {
  showToast,
  showSuccessToast,
  showNeutralToast,
  showModal,
  showInfoModal,
  showActionSheet
}
