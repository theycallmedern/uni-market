const api = require('../../services/api')
const listingsRuntime = require('../../services/api/runtime-listings')
const savedStore = require('../../services/api/saved')
const storage = require('../../utils/storage')
const localeStore = require('../../utils/locale')
const universitiesStore = require('../../utils/universities')
const tabbarStore = require('../../utils/tabbar')
const listingsUtils = require('../../utils/listings')
const visibilityStore = require('../../services/api/visibility')
const copyStore = require('../../constants/copy')

const INITIAL_THEME = storage.getThemeData()
const INITIAL_LOCALE = localeStore.getLocale()
const catalogApi = api.catalog
const listingsApi = api.listings

Page({
  data: {
    locale: INITIAL_LOCALE,
    copy: copyStore.getPageCopy('home', INITIAL_LOCALE),
    commonCopy: copyStore.getCommonCopy(INITIAL_LOCALE),
    themeMode: INITIAL_THEME.themeMode,
    themeClass: INITIAL_THEME.themeClass,
    isDarkTheme: INITIAL_THEME.isDarkTheme,
    search: '',
    categories: copyStore.mapCategories(catalogApi.categories, INITIAL_LOCALE),
    activeCategoryId: 'all',
    filterPanelOpen: false,
    locationOptions: [copyStore.getCommonCopy(INITIAL_LOCALE).allLocations],
    universityOptions: copyStore.getUniversityFilterOptions(INITIAL_LOCALE),
    locationIndex: 0,
    universityIndex: 0,
    sortOptions: copyStore.getCommonCopy(INITIAL_LOCALE).sortOptions,
    sortIndex: 0,
    allListings: [],
    visibleListings: [],
    applyFilterLabel: copyStore.getHomeApplyLabel(0, INITIAL_LOCALE),
    feedbackVisible: false,
    feedbackText: '',
    feedbackIcon: '',
    pulseListingId: ''
  },

  onShow() {
    this.refreshLocale(() => {
      this.refreshTheme(() => {
        tabbarStore.syncTabBar(this, 0, {
          themeMode: this.data.themeMode,
          locale: this.data.locale
        })
      })
      this.refreshListings()
    })
  },

  refreshTheme(callback) {
    this.setData(storage.getThemeData(), callback)
  },

  refreshLocale(callback) {
    const locale = localeStore.getLocale()
    const commonCopy = copyStore.getCommonCopy(locale)

    this.setData({
      locale,
      copy: copyStore.getPageCopy('home', locale),
      commonCopy,
      categories: copyStore.mapCategories(catalogApi.categories, locale),
      universityOptions: copyStore.getUniversityFilterOptions(locale),
      sortOptions: commonCopy.sortOptions
    }, callback)
  },

  async refreshListings() {
    const { locale } = this.data
    const commonCopy = copyStore.getCommonCopy(locale)
    const universityOptions = copyStore.getUniversityFilterOptions(locale)
    if (visibilityStore.enabled) {
      await visibilityStore.syncPreferences()
    }

    if (!listingsRuntime.enabled) {
      const initialListings = listingsApi.getFeed()
      const initialLocationOptions = [commonCopy.allLocations, ...listingsUtils.uniqueOptions(initialListings, 'location')]

      this.setData({
        allListings: initialListings,
        locationOptions: initialLocationOptions,
        universityOptions,
        locationIndex: Math.min(this.data.locationIndex, initialLocationOptions.length - 1),
        universityIndex: Math.min(this.data.universityIndex, universityOptions.length - 1)
      }, () => {
        this.applyFilters()
      })
      return
    }

    const allListings = await listingsRuntime.getFeed()
    const locationOptions = [commonCopy.allLocations, ...listingsUtils.uniqueOptions(allListings, 'location')]

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
      feedbackText: isSaved ? this.data.commonCopy.saved : this.data.commonCopy.removed,
      feedbackIcon: isSaved ? '✓' : '✕',
      pulseListingId: String(id)
    })

    setTimeout(() => {
      this.setData({
        feedbackVisible: false
      })
    }, 900)

    setTimeout(() => {
      this.setData({
        pulseListingId: ''
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
    const commonCopy = copyStore.getCommonCopy(this.data.locale)
    const keyword = search.trim().toLowerCase()
    const selectedLocation = locationOptions[locationIndex] || commonCopy.allLocations
    const selectedUniversity = universityOptions[universityIndex] || commonCopy.allUniversities

    let filtered = allListings.filter((listing) => {
      const matchesCategory = activeCategoryId === 'all' || listing.categoryId === activeCategoryId
      const haystack = `${listing.title} ${listing.location} ${listing.address || ''} ${listing.university} ${listing.subcategory}`.toLowerCase()
      const matchesSearch = !keyword || haystack.includes(keyword)
      const matchesLocation = selectedLocation === commonCopy.allLocations || listing.location === selectedLocation
      const matchesUniversity = selectedUniversity === commonCopy.allUniversities || listing.university === selectedUniversity
      return matchesCategory && matchesSearch && matchesLocation && matchesUniversity
    })

    filtered = filtered.sort((a, b) => {
      if (sortIndex === 1) {
        return listingsUtils.parsePriceValue(a.price) - listingsUtils.parsePriceValue(b.price)
      }

      if (sortIndex === 2) {
        return listingsUtils.parsePriceValue(b.price) - listingsUtils.parsePriceValue(a.price)
      }

      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime()
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime()

      if (bTime !== aTime) {
        return bTime - aTime
      }

      return String(b.id || '').localeCompare(String(a.id || ''))
    })

    const visibleListings = savedStore.decorateListingsWithSaved(filtered)

    this.setData({
      visibleListings,
      applyFilterLabel: copyStore.getHomeApplyLabel(visibleListings.length, this.data.locale)
    })
  }
})
