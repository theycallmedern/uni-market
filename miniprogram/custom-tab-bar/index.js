Component({
  data: {
    selected: 0,
    themeMode: 'light',
    color: '#9b9b9b',
    selectedColor: '#111111',
    list: [
      {
        pagePath: '/pages/index/index',
        text: 'Search',
        iconPath: '../assets/tabbar/search-normal.png',
        selectedIconPath: '../assets/tabbar/search-active.png'
      },
      {
        pagePath: '/pages/favorites/favorites',
        text: 'Saved',
        iconPath: '../assets/tabbar/saved-normal.png',
        selectedIconPath: '../assets/tabbar/saved-active.png'
      },
      {
        pagePath: '/pages/create/create',
        text: 'Post',
        iconPath: '../assets/tabbar/post-normal.png',
        selectedIconPath: '../assets/tabbar/post-active.png',
        isPrimary: true
      },
      {
        pagePath: '/pages/messages/messages',
        text: 'Listings',
        iconPath: '../assets/tabbar/listings-normal.png',
        selectedIconPath: '../assets/tabbar/listings-active.png'
      },
      {
        pagePath: '/pages/profile/profile',
        text: 'Profile',
        iconPath: '../assets/tabbar/profile-normal.png',
        selectedIconPath: '../assets/tabbar/profile-active.png'
      }
    ]
  },

  methods: {
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
