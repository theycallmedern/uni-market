const api = require('../../services/api')
const listingsRuntime = require('../../services/api/runtime-listings')
const savedStore = require('../../services/api/saved')
const storage = require('../../utils/storage')
const localeStore = require('../../utils/locale')
const tabbarStore = require('../../utils/tabbar')
const listingsUtils = require('../../utils/listings')
const visibilityStore = require('../../services/api/visibility')
const feedback = require('../../utils/ui-feedback')
const uiText = require('../../constants/messages')
const copyStore = require('../../constants/copy')

const INITIAL_THEME = storage.getThemeData()
const INITIAL_LOCALE = localeStore.getLocale()
const catalogApi = api.catalog
const listingsApi = api.listings

Page({
  data: {
    locale: INITIAL_LOCALE,
    copy: copyStore.getPageCopy('favorites', INITIAL_LOCALE),
    commonCopy: copyStore.getCommonCopy(INITIAL_LOCALE),
    themeMode: INITIAL_THEME.themeMode,
    themeClass: INITIAL_THEME.themeClass,
    isDarkTheme: INITIAL_THEME.isDarkTheme,
    allListings: [],
    listings: [],
    categoryOptions: [copyStore.getCommonCopy(INITIAL_LOCALE).allCategories],
    categoryOptionValues: ['all'],
    categoryIndex: 0,
    sortOptions: copyStore.getCommonCopy(INITIAL_LOCALE).sortOptions,
    sortIndex: 0,
    savedCount: 0,
    unavailableCount: 0,
    emptyTitle: copyStore.getPageCopy('favorites', INITIAL_LOCALE).emptyTitle,
    emptyCopy: copyStore.getPageCopy('favorites', INITIAL_LOCALE).emptyCopy,
    unavailableMeta: copyStore.getUnavailableMeta(0, INITIAL_LOCALE),
    feedbackVisible: false,
    feedbackText: '',
    feedbackIcon: '',
    pulseListingId: ''
  },

  onShow() {
    this.refreshLocale(() => {
      this.refreshTheme(() => {
        tabbarStore.syncTabBar(this, 1, {
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
      copy: copyStore.getPageCopy('favorites', locale),
      commonCopy,
      sortOptions: commonCopy.sortOptions
    }, callback)
  },

  async refreshListings() {
    const { locale } = this.data
    const commonCopy = copyStore.getCommonCopy(locale)
    if (visibilityStore.enabled) {
      await visibilityStore.syncPreferences()
    }
    if (savedStore.enabled) {
      await savedStore.hydrateSavedListingIds()
    }
    const savedIds = savedStore.getSavedListingIds()
    const applyListings = (feedListings, knownListings) => {
      const visibleListings = feedListings.filter((listing) => savedIds.includes(String(listing.id)))
      const allKnownIds = knownListings.map((listing) => String(listing.id))
      const unavailableCount = savedIds.filter((id) => !allKnownIds.includes(String(id))).length
      const categoryOptionValues = ['all'].concat(
        catalogApi.categories
          .filter((category) => category.id !== 'all' && visibleListings.some((listing) => listing.categoryId === category.id))
          .map((category) => category.id)
      )
      const categoryOptions = [commonCopy.allCategories].concat(
        categoryOptionValues
          .filter((value) => value !== 'all')
          .map((categoryId) => copyStore.getCategoryLabel(categoryId, locale))
      )

      const emptyState = copyStore.getFavoritesEmptyState(savedIds.length > 0, locale)

      this.setData({
        allListings: visibleListings,
        savedCount: savedIds.length,
        unavailableCount,
        unavailableMeta: copyStore.getUnavailableMeta(unavailableCount, locale),
        categoryOptions,
        categoryOptionValues,
        emptyTitle: emptyState.title,
        emptyCopy: emptyState.copy,
        categoryIndex: Math.min(this.data.categoryIndex, categoryOptions.length - 1)
      }, () => {
        this.applyFilters()
      })
    }

    if (!listingsRuntime.enabled) {
      const initialFeedListings = listingsApi.getFeed()
      const initialKnownListings = listingsApi.getAll({
        includeResolved: true,
        includeHiddenByUser: true
      })
      applyListings(initialFeedListings, initialKnownListings)
      return
    }

    const feedListings = await listingsRuntime.getFeed()
    const knownListings = await listingsRuntime.getAll({
      includeResolved: true,
      includeHiddenByUser: true
    })
    applyListings(feedListings, knownListings)
  },

  applyFilters() {
    const {
      allListings,
      categoryOptionValues,
      categoryIndex,
      sortIndex
    } = this.data
    const selectedCategoryValue = categoryOptionValues[categoryIndex] || 'all'

    let filtered = (allListings || []).filter((listing) => {
      if (selectedCategoryValue === 'all') {
        return true
      }

      return listing.categoryId === selectedCategoryValue
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
      confirmText: this.data.commonCopy.clear,
      confirmColor: '#111111',
      success: (res) => {
        if (!res.confirm) return

        savedStore.clearSavedListings()
        this.refreshListings()

        feedback.showSuccessToast(uiText.FAVORITES.CLEAR_SUCCESS)
      }
    })
  },

  async removeUnavailable() {
    const savedIds = savedStore.getSavedListingIds()
    const visibleIds = (
      listingsRuntime.enabled
        ? await listingsRuntime.getFeed()
        : listingsApi.getFeed()
    ).map((listing) => String(listing.id))
    const unavailableIds = savedIds.filter((id) => !visibleIds.includes(String(id)))

    if (!unavailableIds.length) {
      feedback.showNeutralToast(uiText.FAVORITES.NO_UNAVAILABLE)
      return
    }

    feedback.showModal({
      title: uiText.FAVORITES.REMOVE_UNAVAILABLE_TITLE,
      content: uiText.FAVORITES.removeUnavailableContent(unavailableIds.length),
      confirmText: this.data.commonCopy.remove,
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
      feedbackText: this.data.commonCopy.removed,
      feedbackIcon: '✕',
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
  }
})
