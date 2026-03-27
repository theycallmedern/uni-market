const localeStore = require('../../utils/locale')

function getDefaultConfirmText() {
  const locale = localeStore.getLocale()

  if (locale === 'zh') {
    return '确定'
  }

  if (locale === 'ru') {
    return 'ОК'
  }

  return 'OK'
}

function getDefaultCancelText() {
  const locale = localeStore.getLocale()

  if (locale === 'zh') {
    return '取消'
  }

  if (locale === 'ru') {
    return 'Отмена'
  }

  return 'Cancel'
}

Component({
  properties: {
    themeMode: {
      type: String,
      value: 'light'
    }
  },

  data: {
    visible: false,
    title: '',
    content: '',
    editable: false,
    placeholderText: '',
    inputValue: '',
    showCancel: true,
    confirmText: getDefaultConfirmText(),
    cancelText: getDefaultCancelText(),
    confirmColor: '#576b95'
  },

  methods: {
    resolveConfirmColor(color) {
      const normalized = String(color || '#576b95').trim().toLowerCase()

      if (this.data.themeMode !== 'dark') {
        return normalized || '#576b95'
      }

      if (normalized === '#111111' || normalized === '#000000') {
        return '#f2f5f7'
      }

      if (normalized === '#2f7d32') {
        return '#9de0b0'
      }

      if (normalized === '#ba2d2d') {
        return '#ffb8be'
      }

      if (normalized === '#576b95') {
        return '#b8c7ea'
      }

      return normalized || '#b8c7ea'
    },

    present(options = {}) {
      this._success = typeof options.success === 'function' ? options.success : null
      this._complete = typeof options.complete === 'function' ? options.complete : null

      this.setData({
        visible: true,
        title: String(options.title || ''),
        content: String(options.content || ''),
        editable: Boolean(options.editable),
        placeholderText: String(options.placeholderText || ''),
        inputValue: String(options.content || ''),
        showCancel: typeof options.showCancel === 'boolean' ? options.showCancel : true,
        confirmText: String(options.confirmText || getDefaultConfirmText()),
        cancelText: String(options.cancelText || getDefaultCancelText()),
        confirmColor: this.resolveConfirmColor(options.confirmColor)
      })
    },

    noop() {},

    onInput(e) {
      this.setData({
        inputValue: String(e.detail && e.detail.value ? e.detail.value : '')
      })
    },

    closeWithResult(result) {
      const success = this._success
      const complete = this._complete

      this._success = null
      this._complete = null

      this.setData({
        visible: false
      }, () => {
        if (success) {
          success(result)
        }

        if (complete) {
          complete(result)
        }
      })
    },

    onCancel() {
      this.closeWithResult({
        confirm: false,
        cancel: true,
        content: this.data.inputValue
      })
    },

    onConfirm() {
      this.closeWithResult({
        confirm: true,
        cancel: false,
        content: this.data.inputValue
      })
    }
  }
})
