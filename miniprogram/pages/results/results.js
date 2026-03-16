const market = require('../../data/market')
const savedStore = require('../../utils/saved')

function parsePriceValue(price = '') {
  const match = String(price).replace(/,/g, '').match(/(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : 0
}

function uniqueOptions(listings, field) {
  const values = listings
    .map((listing) => listing[field])
    .filter(Boolean)

  return [...new Set(values)]
}

Page({
  data: {
    categoryId: '',
    categoryTitle: '',
    subcategory: '',
    search: '',
    priceMin: '',
    priceMax: '',
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

  onLoad(query) {
    const categoryId = query.categoryId || 'housing'
    const subcategory = decodeURIComponent(query.subcategory || '')
    const categoryTitle = market.categoryTitles[categoryId] || 'Results'

    wx.setNavigationBarTitle({
      title: subcategory ? `${categoryTitle} · ${subcategory}` : categoryTitle
    })

    this.setData({
      categoryId,
      categoryTitle,
      subcategory
    }, () => {
      this.refreshListings()
    })
  },

  onShow() {
    this.refreshListings()
  },

  refreshListings() {
    const { categoryId, subcategory } = this.data
    const filteredByCategory = market.getListingsByCategory(categoryId)
    const filtered = subcategory
      ? filteredByCategory.filter((listing) => listing.subcategory === subcategory)
      : filteredByCategory

    const locationOptions = ['All locations', ...uniqueOptions(filtered, 'location')]
    const universityOptions = ['All universities', ...uniqueOptions(filtered, 'university')]

    this.setData({
      allListings: filtered,
      locationOptions,
      universityOptions
    }, () => {
      const nextLocationIndex = Math.min(this.data.locationIndex, locationOptions.length - 1)
      const nextUniversityIndex = Math.min(this.data.universityIndex, universityOptions.length - 1)

      this.setData({
        locationIndex: nextLocationIndex,
        universityIndex: nextUniversityIndex
      }, () => {
        this.applyFilters()
      })
    })
  },

  onSearchInput(e) {
    this.setData({
      search: e.detail.value
    }, () => {
      this.applyFilters()
    })
  },

  onPriceInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [field]: e.detail.value
    }, () => {
      this.applyFilters()
    })
  },

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

  clearFilters() {
    this.setData({
      search: '',
      priceMin: '',
      priceMax: '',
      locationIndex: 0,
      universityIndex: 0,
      sortIndex: 0
    }, () => {
      this.applyFilters()
    })
  },

  applyFilters() {
    const {
      allListings,
      search,
      priceMin,
      priceMax,
      locationOptions,
      universityOptions,
      locationIndex,
      universityIndex,
      sortIndex
    } = this.data

    const keyword = String(search).trim().toLowerCase()
    const selectedLocation = locationOptions[locationIndex] || 'All locations'
    const selectedUniversity = universityOptions[universityIndex] || 'All universities'
    const min = Number(priceMin) || 0
    const max = Number(priceMax) || 0

    let filtered = allListings.filter((listing) => {
      const haystack = `${listing.title} ${listing.location} ${listing.university} ${listing.subcategory} ${listing.description}`.toLowerCase()
      const priceValue = parsePriceValue(listing.price)
      const matchesKeyword = !keyword || haystack.includes(keyword)
      const matchesLocation = selectedLocation === 'All locations' || listing.location === selectedLocation
      const matchesUniversity = selectedUniversity === 'All universities' || listing.university === selectedUniversity
      const matchesMin = !min || priceValue >= min
      const matchesMax = !max || priceValue <= max

      return matchesKeyword && matchesLocation && matchesUniversity && matchesMin && matchesMax
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
      visibleListings: savedStore.decorateListingsWithSaved(filtered)
    })
  },

  goBack() {
    wx.navigateBack()
  },

  toggleSave(e) {
    const { id } = e.currentTarget.dataset
    const result = savedStore.toggleSavedListing(id)
    const visibleListings = savedStore.decorateListingsWithSaved(this.data.visibleListings || [])

    this.setData({ visibleListings })
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

  openListing(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/listing/listing?id=${id}`
    })
  }
})
