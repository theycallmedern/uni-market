const market = require('../../data/market')
const savedStore = require('../../utils/saved')

Page({
  data: {
    profile: {
      name: 'Misha',
      campus: 'Zhejiang University',
      city: 'Hangzhou'
    },
    myListings: [],
    savedCount: 0
  },

  onShow() {
    this.refreshProfile()
  },

  refreshProfile() {
    const myListings = market.getMyListings()
    const savedCount = savedStore.getSavedListingIds().length

    this.setData({
      myListings,
      savedCount
    })
  },

  openListing(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/listing/listing?id=${id}`
    })
  },

  goToPost() {
    wx.switchTab({
      url: '/pages/create/create'
    })
  },

  deleteListing(e) {
    const { id } = e.currentTarget.dataset

    wx.showModal({
      title: 'Delete listing?',
      content: 'This will remove the listing from your profile and the marketplace feed.',
      confirmText: 'Delete',
      confirmColor: '#111111',
      success: (res) => {
        if (!res.confirm) return

        market.deleteListing(id)
        this.refreshProfile()

        wx.showToast({
          title: 'Deleted',
          icon: 'success'
        })
      }
    })
  }
})
