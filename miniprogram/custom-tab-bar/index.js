const copyStore = require('../constants/copy')
const localeStore = require('../utils/locale')

Component({
  data: {
    selected: 0,
    themeMode: 'light',
    locale: localeStore.getLocale(),
    color: '#9b9b9b',
    selectedColor: '#111111',
    list: copyStore.getTabBarItems(localeStore.getLocale())
  },

  observers: {
    locale() {
      this.applyLocale()
    }
  },

  lifetimes: {
    attached() {
      this.applyLocale()
    }
  },

  methods: {
    applyLocale() {
      this.setData({
        list: copyStore.getTabBarItems(this.data.locale)
      })
    },

    switchTab(e) {
      const { index, path } = e.currentTarget.dataset
      if (typeof index === 'undefined' || !path) {
        return
      }

      if (Number(index) === this.data.selected) {
        return
      }

      wx.switchTab({
        url: path
      })
    }
  }
})
