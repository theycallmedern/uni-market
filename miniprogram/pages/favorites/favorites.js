const market = require('../../data/market')
const savedStore = require('../../utils/saved')
const tabbarStore = require('../../utils/tabbar')

const SORT_OPTIONS = ['Newest', 'Price low to high', 'Price high to low']

function parsePriceValue(price = '') {
  const match = String(price).replace(/,/g, '').match(/(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : 0
}

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
        return parsePriceValue(a.price) - parsePriceValue(b.price)
      }

      if (sortIndex === 2) {
        return parsePriceValue(b.price) - parsePriceValue(a.price)
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

    wx.showModal({
      title: 'Clear all saved?',
      content: 'This will remove all saved listings from this device.',
      confirmText: 'Clear',
      confirmColor: '#111111',
      success: (res) => {
        if (!res.confirm) return

        savedStore.clearSavedListings()
        this.refreshListings()

        wx.showToast({
          title: 'Saved cleared',
          icon: 'success'
        })
      }
    })
  },

  removeUnavailable() {
    const savedIds = savedStore.getSavedListingIds()
    const visibleIds = market.getFeedListings().map((listing) => String(listing.id))
    const unavailableIds = savedIds.filter((id) => !visibleIds.includes(String(id)))

    if (!unavailableIds.length) {
      wx.showToast({
        title: 'No unavailable items',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: 'Remove unavailable?',
      content: `Remove ${unavailableIds.length} unavailable saved listing${unavailableIds.length === 1 ? '' : 's'} from this device?`,
      confirmText: 'Remove',
      confirmColor: '#111111',
      success: (res) => {
        if (!res.confirm) return

        savedStore.removeSavedListings(unavailableIds)
        this.refreshListings()

        wx.showToast({
          title: 'Unavailable removed',
          icon: 'success'
        })
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
