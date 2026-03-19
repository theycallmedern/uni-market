const market = require('../../data/market')
const savedStore = require('../../utils/saved')
const storage = require('../../utils/storage')
const universitiesStore = require('../../utils/universities')
const listingsUtils = require('../../utils/listings')

const UNIVERSITY_FILTER_OPTIONS = ['All universities', ...universitiesStore.getPublicUniversityOptions()]
const INITIAL_THEME = storage.getThemeData()

Page({
  data: {
    themeMode: INITIAL_THEME.themeMode,
    themeClass: INITIAL_THEME.themeClass,
    isDarkTheme: INITIAL_THEME.isDarkTheme,
    navTitle: 'Results',
    categoryId: '',
    categoryTitle: '',
    subcategory: '',
    quickSubcategory: '',
    activeSubcategoryLabel: '',
    search: '',
    priceMin: '',
    priceMax: '',
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
    pulseListingId: '',
    pendingInitialFilters: null
  },

  onLoad(query) {
    this.refreshTheme()
    const categoryId = query.categoryId || 'housing'
    const subcategory = decodeURIComponent(query.subcategory || '')
    const quickSubcategory = decodeURIComponent(query.quickSubcategory || '')
    const activeSubcategoryLabel = subcategory || quickSubcategory
    const categoryTitle = market.categoryTitles[categoryId] || 'Results'
    const pendingInitialFilters = {
      university: decodeURIComponent(query.university || ''),
      priceMin: query.priceMin || '',
      priceMax: query.priceMax || '',
      sortIndex: Number(query.sort || 0)
    }

    wx.setNavigationBarTitle({
      title: activeSubcategoryLabel ? `${categoryTitle} · ${activeSubcategoryLabel}` : categoryTitle
    })

    this.setData({
      navTitle: categoryTitle,
      categoryId,
      categoryTitle,
      subcategory,
      quickSubcategory,
      activeSubcategoryLabel,
      pendingInitialFilters
    }, () => {
      this.refreshListings()
    })
  },

  onShow() {
    this.refreshTheme()
    this.refreshListings()
  },

  refreshTheme() {
    this.setData(storage.getThemeData())
  },

  refreshListings() {
    const { categoryId, subcategory, quickSubcategory, pendingInitialFilters } = this.data
    const filteredByCategory = market.getFeedListingsByCategory(categoryId)
    const filtered = filteredByCategory.filter((listing) => {
      const matchesSubcategory = !subcategory || listing.subcategory === subcategory
      const matchesQuickSubcategory = !quickSubcategory || listing.subcategory === quickSubcategory

      return matchesSubcategory && matchesQuickSubcategory
    })

    const locationOptions = ['All locations', ...listingsUtils.uniqueOptions(filtered, 'location')]
    const universityOptions = UNIVERSITY_FILTER_OPTIONS

    this.setData({
      allListings: filtered,
      locationOptions,
      universityOptions
    }, () => {
      const nextLocationIndex = Math.min(this.data.locationIndex, locationOptions.length - 1)
      let nextUniversityIndex = Math.min(this.data.universityIndex, universityOptions.length - 1)

      if (pendingInitialFilters && pendingInitialFilters.university) {
        const matchedIndex = universityOptions.indexOf(pendingInitialFilters.university)
        nextUniversityIndex = matchedIndex >= 0 ? matchedIndex : 0
      }

      this.setData({
        locationIndex: nextLocationIndex,
        universityIndex: nextUniversityIndex,
        priceMin: pendingInitialFilters ? pendingInitialFilters.priceMin : this.data.priceMin,
        priceMax: pendingInitialFilters ? pendingInitialFilters.priceMax : this.data.priceMax,
        sortIndex: pendingInitialFilters ? pendingInitialFilters.sortIndex : this.data.sortIndex,
        pendingInitialFilters: null
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
      const haystack = `${listing.title} ${listing.location} ${listing.address || ''} ${listing.university} ${listing.subcategory} ${listing.description}`.toLowerCase()
      const priceValue = listingsUtils.parsePriceValue(listing.price)
      const matchesKeyword = !keyword || haystack.includes(keyword)
      const matchesLocation = selectedLocation === 'All locations' || listing.location === selectedLocation
      const matchesUniversity = selectedUniversity === 'All universities' || listing.university === selectedUniversity
      const matchesMin = !min || priceValue >= min
      const matchesMax = !max || priceValue <= max

      return matchesKeyword && matchesLocation && matchesUniversity && matchesMin && matchesMax
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
      visibleListings: savedStore.decorateListingsWithSaved(market.sortByPromotionPriority(filtered))
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
