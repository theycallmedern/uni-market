function canUseWxMethod(name) {
  return typeof wx !== 'undefined' && wx && typeof wx[name] === 'function'
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
  if (!canUseWxMethod('showModal')) {
    return
  }

  wx.showModal(options)
}

function showInfoModal(options = {}) {
  showModal({
    showCancel: false,
    confirmText: 'OK',
    ...options
  })
}

module.exports = {
  showToast,
  showSuccessToast,
  showNeutralToast,
  showModal,
  showInfoModal
}
