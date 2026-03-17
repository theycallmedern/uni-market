Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    showBack: {
      type: Boolean,
      value: false
    }
  },

  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    sideWidth: 96
  },

  lifetimes: {
    attached() {
      this.setMetrics()
    }
  },

  methods: {
    setMetrics() {
      const fallback = {
        statusBarHeight: 20,
        navBarHeight: 44,
        sideWidth: 96
      }

      try {
        const menuButton = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null
        const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
        const statusBarHeight = Number(windowInfo.statusBarHeight) || fallback.statusBarHeight

        if (!menuButton || !menuButton.width || !menuButton.top || !menuButton.height) {
          this.setData(fallback)
          return
        }

        const navGap = menuButton.top - statusBarHeight
        const navBarHeight = menuButton.height + navGap * 2

        this.setData({
          statusBarHeight,
          navBarHeight,
          sideWidth: menuButton.width
        })
      } catch (error) {
        this.setData(fallback)
      }
    },

    handleBack() {
      const pages = getCurrentPages()

      if (pages.length > 1) {
        wx.navigateBack()
        return
      }

      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  }
})
