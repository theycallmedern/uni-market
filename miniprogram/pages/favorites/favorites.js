const market = require('../../data/market')
const savedStore = require('../../utils/saved')

Page({
  data: {
    listings: [],
    feedbackVisible: false,
    feedbackText: '',
    feedbackIcon: '',
    pulseListingId: ''
  },

  onShow() {
    const savedIds = savedStore.getSavedListingIds()
    const listings = market.getAllListings().filter((listing) => savedIds.includes(String(listing.id)))
    const decorated = savedStore.decorateListingsWithSaved(listings)

    this.setData({
      listings: decorated
    })
  },

  openListing(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/listing/listing?id=${id}`
    })
  },

  toggleSave(e) {
    const { id } = e.currentTarget.dataset
    savedStore.toggleSavedListing(id)

    const listings = this.data.listings.filter((listing) => String(listing.id) !== String(id))
    this.setData({ listings })
    this.playSaveFeedback(id)
  },

  playSaveFeedback(id) {
    this.setData({
      feedbackVisible: true,
      feedbackText: 'Removed',
      feedbackIcon: '✕',
      pulseListingId: Number(id)
    })

    setTimeout(() => {
      this.setData({
        feedbackVisible: false
      })
    }, 900)

    setTimeout(() => {
      this.setData({
        pulseListingId: 0
      })
    }, 420)
  }
})
