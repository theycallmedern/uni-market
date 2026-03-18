const market = require('../../data/market')
const savedStore = require('../../utils/saved')
const universitiesStore = require('../../utils/universities')
const tabbarStore = require('../../utils/tabbar')
const listingsUtils = require('../../utils/listings')

const UNIVERSITY_FILTER_OPTIONS = ['All universities', ...universitiesStore.getPublicUniversityOptions()]

Page({
  data: {
    search: '',
    categories: market.categories,
    activeCategoryId: 'all',
    filterPanelOpen: false,
    locationOptions: ['All locations'],
    universityOptions: UNIVERSITY_FILTER_OPTIONS,
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
    tabbarStore.syncTabBar(this, 0)
    this.refreshListings()
  },

  refreshListings() {
    const allListings = market.getFeedListings()
    const locationOptions = ['All locations', ...listingsUtils.uniqueOptions(allListings, 'location')]
    const universityOptions = UNIVERSITY_FILTER_OPTIONS

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
      const haystack = `${listing.title} ${listing.location} ${listing.address || ''} ${listing.university} ${listing.subcategory}`.toLowerCase()
      const matchesSearch = !keyword || haystack.includes(keyword)
      const matchesLocation = selectedLocation === 'All locations' || listing.location === selectedLocation
      const matchesUniversity = selectedUniversity === 'All universities' || listing.university === selectedUniversity
      return matchesCategory && matchesSearch && matchesLocation && matchesUniversity
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

    const visibleListings = savedStore.decorateListingsWithSaved(filtered)

    this.setData({ visibleListings })
  }
})
