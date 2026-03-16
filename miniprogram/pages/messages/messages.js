const market = require('../../data/market')
const savedStore = require('../../utils/saved')
const profileStore = require('../../utils/profile')

const INITIAL_PROFILE = profileStore.getProfile()

Page({
  data: {
    myListings: [],
    savedCount: 0,
    profile: { ...INITIAL_PROFILE },
    avatarInitial: profileStore.getProfileInitial(INITIAL_PROFILE)
  },

  onShow() {
    this.refreshListings()
  },

  refreshListings() {
    const profile = profileStore.getProfile()

    this.setData({
      myListings: market.getMyListings(),
      savedCount: savedStore.getSavedListingIds().length,
      profile,
      avatarInitial: profileStore.getProfileInitial(profile)
    })
  },

  openListing(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/listing/listing?id=${id}`
    })
  },

  goToPost() {
    market.queueCreateMode({ type: 'create' })
    wx.switchTab({
      url: '/pages/create/create'
    })
  },

  editListing(e) {
    const { id } = e.currentTarget.dataset
    market.queueCreateMode({ type: 'edit', id })
    wx.switchTab({
      url: '/pages/create/create'
    })
  },

  deleteListing(e) {
    const { id } = e.currentTarget.dataset

    wx.showModal({
      title: 'Delete listing?',
      content: 'This will remove the listing from your listings tab and the marketplace feed.',
      confirmText: 'Delete',
      confirmColor: '#111111',
      success: (res) => {
        if (!res.confirm) return

        market.deleteListing(id)
        this.refreshListings()

        wx.showToast({
          title: 'Deleted',
          icon: 'success'
        })
      }
    })
  }
})
