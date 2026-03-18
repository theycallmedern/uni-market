const market = require('../../data/market')
const savedStore = require('../../utils/saved')
const tabbarStore = require('../../utils/tabbar')
const listingsUtils = require('../../utils/listings')
const feedback = require('../../utils/ui-feedback')
const uiText = require('../../constants/messages')

const SORT_OPTIONS = ['Newest', 'Price low to high', 'Price high to low']

Page({
  data: {
    allListings: [],
    listings: [],
    categoryOptions: ['All categories'],
    categoryIndex: 0,
    sortOptions: SORT_OPTIONS,
    sortIndex: 0,
    savedCount: 0,
    unavailableCount: 0,
    feedbackVisible: false,
    feedbackText: '',
    feedbackIcon: '',
    pulseListingId: ''
  },

  onShow() {
    tabbarStore.syncTabBar(this, 1)
    this.refreshListings()
  },

  refreshListings() {
    const savedIds = savedStore.getSavedListingIds()
    const visibleListings = market.getFeedListings().filter((listing) => savedIds.includes(String(listing.id)))
    const allKnownIds = market.getAllListings({
      includeResolved: true,
      includeHiddenByUser: true
    }).map((listing) => String(listing.id))
    const unavailableCount = savedIds.filter((id) => !allKnownIds.includes(String(id))).length
    const categoryOptions = ['All categories'].concat(
      market.categories
        .filter((category) => category.id !== 'all' && visibleListings.some((listing) => listing.categoryId === category.id))
        .map((category) => category.name)
    )

    this.setData({
      allListings: visibleListings,
      savedCount: savedIds.length,
      unavailableCount,
      categoryOptions,
      categoryIndex: Math.min(this.data.categoryIndex, categoryOptions.length - 1)
    }, () => {
      this.applyFilters()
    })
  },

  applyFilters() {
    const {
      allListings,
      categoryOptions,
      categoryIndex,
      sortIndex
    } = this.data
    const selectedCategory = categoryOptions[categoryIndex] || 'All categories'

    let filtered = (allListings || []).filter((listing) => {
      if (selectedCategory === 'All categories') {
        return true
      }

      const category = market.categories.find((item) => item.id === listing.categoryId)
      return category && category.name === selectedCategory
    })

    filtered = filtered.sort((a, b) => {
      if (sortIndex === 1) {
        return listingsUtils.parsePriceValue(a.price) - listingsUtils.parsePriceValue(b.price)
      }

      if (sortIndex === 2) {
        return listingsUtils.parsePriceValue(b.price) - listingsUtils.parsePriceValue(a.price)
      }

      return Number(b.id) - Number(a.id)
    })

    this.setData({
      listings: savedStore.decorateListingsWithSaved(filtered)
    })
  },

  onCategoryChange(e) {
    this.setData({
      categoryIndex: Number(e.detail.value)
    }, () => {
      this.applyFilters()
    })
  },

  onSortChange(e) {
    this.setData({
      sortIndex: Number(e.detail.value)
    }, () => {
      this.applyFilters()
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
    this.refreshListings()
    this.playSaveFeedback(id)
  },

  clearSaved() {
    if (!this.data.savedCount) {
      return
    }

    feedback.showModal({
      title: uiText.FAVORITES.CLEAR_TITLE,
      content: uiText.FAVORITES.CLEAR_CONTENT,
      confirmText: 'Clear',
      confirmColor: '#111111',
      success: (res) => {
        if (!res.confirm) return

        savedStore.clearSavedListings()
        this.refreshListings()

        feedback.showSuccessToast(uiText.FAVORITES.CLEAR_SUCCESS)
      }
    })
  },

  removeUnavailable() {
    const savedIds = savedStore.getSavedListingIds()
    const visibleIds = market.getFeedListings().map((listing) => String(listing.id))
    const unavailableIds = savedIds.filter((id) => !visibleIds.includes(String(id)))

    if (!unavailableIds.length) {
      feedback.showNeutralToast(uiText.FAVORITES.NO_UNAVAILABLE)
      return
    }

    feedback.showModal({
      title: uiText.FAVORITES.REMOVE_UNAVAILABLE_TITLE,
      content: uiText.FAVORITES.removeUnavailableContent(unavailableIds.length),
      confirmText: 'Remove',
      confirmColor: '#111111',
      success: (res) => {
        if (!res.confirm) return

        savedStore.removeSavedListings(unavailableIds)
        this.refreshListings()

        feedback.showSuccessToast(uiText.FAVORITES.REMOVE_UNAVAILABLE_SUCCESS)
      }
    })
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
