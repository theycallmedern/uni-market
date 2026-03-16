const market = require('../../data/market')
const savedStore = require('../../utils/saved')

Page({
  data: {
    id: '',
    listing: null,
    isSaved: false,
    currentImage: 1,
    feedbackVisible: false,
    feedbackText: '',
    feedbackIcon: ''
  },

  onLoad(query) {
    const id = String(query.id || '')
    this.setData({
      id,
      isSaved: savedStore.isListingSaved(id)
    }, () => {
      this.refreshListing()
    })
  },

  onShow() {
    this.refreshListing()
  },

  refreshListing() {
    const id = this.data.id
    const listing = market.getListingById(id) || market.getAllListings()[0] || null

    if (!listing) return

    wx.setNavigationBarTitle({
      title: listing.title || 'Listing'
    })

    this.setData({
      listing,
      isSaved: savedStore.isListingSaved(id),
      sellerInitial: listing.seller && listing.seller.name ? listing.seller.name.slice(0, 1) : 'U',
      currentImage: 1
    })
  },

  onSwiperChange(e) {
    this.setData({
      currentImage: Number(e.detail.current) + 1
    })
  },

  toggleSave() {
    const result = savedStore.toggleSavedListing(this.data.id)
    this.setData({
      isSaved: result.isSaved
    })
    this.playSaveFeedback(result.isSaved)
  },

  playSaveFeedback(isSaved) {
    this.setData({
      feedbackVisible: true,
      feedbackText: isSaved ? 'Saved' : 'Removed',
      feedbackIcon: isSaved ? '✓' : '✕'
    })

    setTimeout(() => {
      this.setData({
        feedbackVisible: false
      })
    }, 900)
  },

  contactSeller() {
    const listing = this.data.listing || {}
    const seller = listing.seller || {}
    const wechat = seller.wechat || ''
    if (!wechat) return

    wx.setClipboardData({
      data: wechat
    })
  }
})
