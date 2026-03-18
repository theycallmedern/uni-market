const market = require('../../data/market')
const savedStore = require('../../utils/saved')
const profileStore = require('../../utils/profile')
const tabbarStore = require('../../utils/tabbar')
const feedback = require('../../utils/ui-feedback')
const uiText = require('../../constants/messages')

const INITIAL_PROFILE = profileStore.getProfile()

Page({
  data: {
    activeListings: [],
    archivedListings: [],
    activeCount: 0,
    archivedCount: 0,
    isArchiveExpanded: false,
    soldCount: 0,
    savedCount: 0,
    profile: { ...INITIAL_PROFILE },
    avatarInitial: profileStore.getProfileInitial(INITIAL_PROFILE)
  },

  onShow() {
    tabbarStore.syncTabBar(this, 3)
    this.refreshListings()
  },

  refreshListings() {
    const profile = profileStore.getProfile()
    const myListings = market.getMyListings()
    const archivedListings = myListings.filter((listing) => Boolean(listing && listing.isSold))
    const activeListings = myListings.filter((listing) => !listing.isSold)
    const soldCount = archivedListings.filter((listing) => Boolean(listing && listing.soldOnUniMarket)).length

    this.setData({
      activeListings,
      archivedListings,
      activeCount: activeListings.length,
      archivedCount: archivedListings.length,
      soldCount,
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

  toggleSoldState(e) {
    const { id, sold } = e.currentTarget.dataset
    const isSold = String(sold) === '1'

    if (isSold) {
      const updatedListing = market.setListingSoldState(id, false)
      if (!updatedListing) {
        feedback.showNeutralToast(uiText.LISTINGS_MANAGER.LISTING_NOT_FOUND)
        return
      }

      this.refreshListings()
      feedback.showSuccessToast(uiText.LISTINGS_MANAGER.LISTED_AGAIN)
      return
    }

    wx.showActionSheet({
      itemList: ['Sold on UniMarket', 'Sold somewhere else'],
      success: (res) => {
        const soldOnUniMarket = Number(res.tapIndex) === 0
        const updatedListing = market.setListingSoldState(id, true, soldOnUniMarket)

        if (!updatedListing) {
          feedback.showNeutralToast(uiText.LISTINGS_MANAGER.LISTING_NOT_FOUND)
          return
        }

        this.refreshListings()
        feedback.showSuccessToast(
          soldOnUniMarket ? uiText.LISTINGS_MANAGER.SOLD_ON_UNIMARKET : uiText.LISTINGS_MANAGER.MOVED_TO_ARCHIVE
        )
      }
    })
  },

  toggleArchive() {
    if (!this.data.archivedCount) {
      return
    }

    this.setData({
      isArchiveExpanded: !this.data.isArchiveExpanded
    })
  },

  deleteListing(e) {
    const { id } = e.currentTarget.dataset

    feedback.showModal({
      title: uiText.LISTINGS_MANAGER.DELETE_TITLE,
      content: uiText.LISTINGS_MANAGER.DELETE_CONTENT,
      confirmText: 'Delete',
      confirmColor: '#111111',
      success: (res) => {
        if (!res.confirm) return

        market.deleteListing(id)
        this.refreshListings()

        feedback.showSuccessToast(uiText.LISTINGS_MANAGER.DELETED)
      }
    })
  }
})
