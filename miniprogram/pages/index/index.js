const market = require('../../data/market')
const savedStore = require('../../utils/saved')

function uniqueOptions(listings, field) {
  const values = listings
    .map((listing) => listing[field])
    .filter(Boolean)

  return [...new Set(values)]
}

function parsePriceValue(price = '') {
  const match = String(price).replace(/,/g, '').match(/(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : 0
}

Page({
  data: {
    search: '',
    categories: market.categories,
    activeCategoryId: 'all',
    filterPanelOpen: false,
    locationOptions: ['All locations'],
    universityOptions: ['All universities'],
    locationIndex: 0,
    universityIndex: 0,
    sortOptions: ['Newest', 'Price low to high', 'Price high to low'],
    sortIndex: 0,
    allListings: [],
    visibleListings: [],
    feedbackVisible: false,
    feedbackText: '',
    feedbackIcon: '',
    pulseListingId: ''
  },

  onShow() {
    this.refreshListings()
  },

  refreshListings() {
    const allListings = market.getFeedListings()
    const locationOptions = ['All locations', ...uniqueOptions(allListings, 'location')]
    const universityOptions = ['All universities', ...uniqueOptions(allListings, 'university')]

    this.setData({
      allListings,
      locationOptions,
      universityOptions,
      locationIndex: Math.min(this.data.locationIndex, locationOptions.length - 1),
      universityIndex: Math.min(this.data.universityIndex, universityOptions.length - 1)
    }, () => {
      this.applyFilters()
    })
  },

  onSearchInput(e) {
    this.setData({ search: e.detail.value }, () => {
      this.applyFilters()
    })
  },

  onCategoryTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/category/category?id=${id}`
    })
  },

  openFilterPanel() {
    this.setData({
      filterPanelOpen: true
    })
  },

  closeFilterPanel() {
    this.setData({
      filterPanelOpen: false
    })
  },

  stopPanelTap() {},

  onLocationChange(e) {
    this.setData({
      locationIndex: Number(e.detail.value)
    }, () => {
      this.applyFilters()
    })
  },

  onUniversityChange(e) {
    this.setData({
      universityIndex: Number(e.detail.value)
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

  resetHomeFilters() {
    this.setData({
      locationIndex: 0,
      universityIndex: 0,
      sortIndex: 0
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
    const result = savedStore.toggleSavedListing(id)

    this.applyFilters()
    this.playSaveFeedback(id, result.isSaved)
  },

  playSaveFeedback(id, isSaved) {
    this.setData({
      feedbackVisible: true,
      feedbackText: isSaved ? 'Saved' : 'Removed',
      feedbackIcon: isSaved ? '✓' : '✕',
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
  },

  applyFilters() {
    const {
      search,
      activeCategoryId,
      allListings,
      locationOptions,
      universityOptions,
      locationIndex,
      universityIndex,
      sortIndex
    } = this.data
    const keyword = search.trim().toLowerCase()
    const selectedLocation = locationOptions[locationIndex] || 'All locations'
    const selectedUniversity = universityOptions[universityIndex] || 'All universities'

    let filtered = allListings.filter((listing) => {
      const matchesCategory = activeCategoryId === 'all' || listing.categoryId === activeCategoryId
      const haystack = `${listing.title} ${listing.location} ${listing.university} ${listing.subcategory}`.toLowerCase()
      const matchesSearch = !keyword || haystack.includes(keyword)
      const matchesLocation = selectedLocation === 'All locations' || listing.location === selectedLocation
      const matchesUniversity = selectedUniversity === 'All universities' || listing.university === selectedUniversity
      return matchesCategory && matchesSearch && matchesLocation && matchesUniversity
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

    const visibleListings = savedStore.decorateListingsWithSaved(filtered)

    this.setData({ visibleListings })
  }
})
