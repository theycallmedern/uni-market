const localeStore = require('../../utils/locale')

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
    itemList: [],
    itemColor: '#111111',
    cancelText: getDefaultCancelText()
  },

  methods: {
    resolveItemColor(color) {
      const normalized = String(color || '#111111').trim().toLowerCase()

      if (this.data.themeMode !== 'dark') {
        return normalized || '#111111'
      }

      if (normalized === '#111111' || normalized === '#000000') {
        return '#f2f5f7'
      }

      if (normalized === '#ba2d2d') {
        return '#ffb8be'
      }

      return normalized || '#f2f5f7'
    },

    present(options = {}) {
      this._success = typeof options.success === 'function' ? options.success : null
      this._fail = typeof options.fail === 'function' ? options.fail : null
      this._complete = typeof options.complete === 'function' ? options.complete : null

      this.setData({
        visible: true,
        itemList: Array.isArray(options.itemList) ? options.itemList.map((item) => String(item || '')) : [],
        itemColor: this.resolveItemColor(options.itemColor),
        cancelText: String(options.cancelText || getDefaultCancelText())
      })
    },

    noop() {},

    close() {
      this.setData({
        visible: false
      })
    },

    onCancel() {
      const fail = this._fail
      const complete = this._complete

      this._success = null
      this._fail = null
      this._complete = null

      this.close()

      const result = {
        errMsg: 'showActionSheet:fail cancel'
      }

      if (fail) {
        fail(result)
      }

      if (complete) {
        complete(result)
      }
    },

    onItemTap(e) {
      const tapIndex = Number(e.currentTarget.dataset.index)
      const success = this._success
      const complete = this._complete

      this._success = null
      this._fail = null
      this._complete = null

      this.close()

      const result = { tapIndex }

      if (success) {
        success(result)
      }

      if (complete) {
        complete(result)
      }
    }
  }
})
