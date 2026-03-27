const api = require('../../services/api')
const listingsRuntime = require('../../services/api/runtime-listings')
const savedStore = require('../../services/api/saved')
const storage = require('../../utils/storage')
const localeStore = require('../../utils/locale')
const universitiesStore = require('../../utils/universities')
const listingsUtils = require('../../utils/listings')
const visibilityStore = require('../../services/api/visibility')
const copyStore = require('../../constants/copy')

const INITIAL_THEME = storage.getThemeData()
const INITIAL_LOCALE = localeStore.getLocale()
const listingsApi = api.listings

Page({
  data: {
    locale: INITIAL_LOCALE,
    copy: copyStore.getPageCopy('results', INITIAL_LOCALE),
    commonCopy: copyStore.getCommonCopy(INITIAL_LOCALE),
    themeMode: INITIAL_THEME.themeMode,
    themeClass: INITIAL_THEME.themeClass,
    isDarkTheme: INITIAL_THEME.isDarkTheme,
    navTitle: copyStore.getPageCopy('results', INITIAL_LOCALE).navTitle,
    categoryId: '',
    categoryTitle: '',
    subcategory: '',
    quickSubcategory: '',
    activeSubcategoryLabel: '',
    search: '',
    priceMin: '',
    priceMax: '',
    locationOptions: [copyStore.getCommonCopy(INITIAL_LOCALE).allLocations],
    universityOptions: copyStore.getUniversityFilterOptions(INITIAL_LOCALE),
    locationIndex: 0,
    universityIndex: 0,
    sortOptions: copyStore.getCommonCopy(INITIAL_LOCALE).sortOptions,
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
    this.refreshLocale(() => {
      const categoryId = query.categoryId || 'housing'
      const subcategory = decodeURIComponent(query.subcategory || '')
      const quickSubcategory = decodeURIComponent(query.quickSubcategory || '')
      const activeSubcategoryLabel = copyStore.translateSubcategory(subcategory || quickSubcategory, this.data.locale)
      const categoryTitle = copyStore.getCategoryLabel(categoryId, this.data.locale) || this.data.copy.navTitle
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
    })
  },

  onShow() {
    this.refreshLocale(() => {
      this.refreshTheme()
      this.refreshListings()
    })
  },

  refreshTheme() {
    this.setData(storage.getThemeData())
  },

  refreshLocale(callback) {
    const locale = localeStore.getLocale()
    const categoryTitle = this.data.categoryId
      ? copyStore.getCategoryLabel(this.data.categoryId, locale)
      : copyStore.getPageCopy('results', locale).navTitle
    const activeSubcategoryLabel = copyStore.translateSubcategory(this.data.subcategory || this.data.quickSubcategory, locale)
    wx.setNavigationBarTitle({
      title: activeSubcategoryLabel ? `${categoryTitle} · ${activeSubcategoryLabel}` : categoryTitle
    })

    this.setData({
      locale,
      copy: copyStore.getPageCopy('results', locale),
      commonCopy: copyStore.getCommonCopy(locale),
      navTitle: categoryTitle,
      categoryTitle,
      activeSubcategoryLabel,
      sortOptions: copyStore.getCommonCopy(locale).sortOptions,
      universityOptions: copyStore.getUniversityFilterOptions(locale)
    }, callback)
  },

  async refreshListings() {
    const { categoryId, subcategory, quickSubcategory, pendingInitialFilters } = this.data
    if (visibilityStore.enabled) {
      await visibilityStore.syncPreferences()
    }
    const applyListings = (listings) => {
      const filtered = listings.filter((listing) => {
        const matchesSubcategory = !subcategory || listing.subcategory === subcategory
        const matchesQuickSubcategory = !quickSubcategory || listing.subcategory === quickSubcategory

        return matchesSubcategory && matchesQuickSubcategory
      })

      const locationOptions = [this.data.commonCopy.allLocations, ...listingsUtils.uniqueOptions(filtered, 'location')]
      const universityOptions = copyStore.getUniversityFilterOptions(this.data.locale)

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
    }

    if (!listingsRuntime.enabled) {
      const initialFilteredByCategory = listingsApi.getFeedByCategory(categoryId)
      applyListings(initialFilteredByCategory)
      return
    }

    const filteredByCategory = await listingsRuntime.getFeedByCategory(categoryId)
    applyListings(filteredByCategory)
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
    const selectedLocation = locationOptions[locationIndex] || this.data.commonCopy.allLocations
    const selectedUniversity = universityOptions[universityIndex] || this.data.commonCopy.allUniversities
    const min = Number(priceMin) || 0
    const max = Number(priceMax) || 0

    let filtered = allListings.filter((listing) => {
      const haystack = `${listing.title} ${listing.location} ${listing.address || ''} ${listing.university} ${listing.subcategory} ${listing.description}`.toLowerCase()
      const priceValue = listingsUtils.parsePriceValue(listing.price)
      const matchesKeyword = !keyword || haystack.includes(keyword)
      const matchesLocation = selectedLocation === this.data.commonCopy.allLocations || listing.location === selectedLocation
      const matchesUniversity = selectedUniversity === this.data.commonCopy.allUniversities || listing.university === selectedUniversity
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

      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime()
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime()

      if (bTime !== aTime) {
        return bTime - aTime
      }

      return String(b.id || '').localeCompare(String(a.id || ''))
    })

    this.setData({
      visibleListings: savedStore.decorateListingsWithSaved(filtered).map((item) => ({
        ...item,
        displaySubcategory: copyStore.translateSubcategory(item.subcategory, this.data.locale),
        displayLocation: copyStore.translateCity(item.location, this.data.locale)
      }))
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

  openListing(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/listing/listing?id=${id}`
    })
  }
})
