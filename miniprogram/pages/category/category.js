const api = require('../../services/api')
const listingsRuntime = require('../../services/api/runtime-listings')
const storage = require('../../utils/storage')
const localeStore = require('../../utils/locale')
const universitiesStore = require('../../utils/universities')
const listingsUtils = require('../../utils/listings')
const visibilityStore = require('../../services/api/visibility')
const copyStore = require('../../constants/copy')

const INITIAL_THEME = storage.getThemeData()
const INITIAL_LOCALE = localeStore.getLocale()
const catalogApi = api.catalog
const listingsApi = api.listings

const PRICE_RANGE_CONFIGS = {
  housing: [
    { label: 'Any price' },
    { label: 'Up to 2500 RMB', max: 2500 },
    { label: '2500-4000 RMB', min: 2500, max: 4000 },
    { label: '4000+ RMB', min: 4000 }
  ],
  electronics: [
    { label: 'Any price' },
    { label: 'Up to 1000 RMB', max: 1000 },
    { label: '1000-3000 RMB', min: 1000, max: 3000 },
    { label: '3000+ RMB', min: 3000 }
  ],
  transport: [
    { label: 'Any price' },
    { label: 'Up to 500 RMB', max: 500 },
    { label: '500-1500 RMB', min: 500, max: 1500 },
    { label: '1500+ RMB', min: 1500 }
  ],
  items: [
    { label: 'Any price' },
    { label: 'Up to 300 RMB', max: 300 },
    { label: '300-1000 RMB', min: 300, max: 1000 },
    { label: '1000+ RMB', min: 1000 }
  ],
  services: [
    { label: 'Any price' },
    { label: 'Up to 150 RMB', max: 150 },
    { label: '150-300 RMB', min: 150, max: 300 },
    { label: '300+ RMB', min: 300 }
  ],
  study: [
    { label: 'Any price' },
    { label: 'Up to 100 RMB', max: 100 },
    { label: '100-300 RMB', min: 100, max: 300 },
    { label: '300+ RMB', min: 300 }
  ],
  other: [
    { label: 'Any price' },
    { label: 'Up to 300 RMB', max: 300 },
    { label: '300-1000 RMB', min: 300, max: 1000 },
    { label: '1000+ RMB', min: 1000 }
  ]
}

const QUICK_PRESETS = {
  housing: [
    { label: 'All' },
    { label: 'Budget', priceMax: 2500 },
    { label: 'ZJU', university: 'Zhejiang University' }
  ],
  electronics: [
    { label: 'All' },
    { label: 'Budget', priceMax: 3000 },
    { label: 'ZJU', university: 'Zhejiang University' }
  ],
  transport: [
    { label: 'All' },
    { label: 'Under 500 RMB', priceMax: 500 },
    { label: 'ZJU', university: 'Zhejiang University' }
  ],
  items: [
    { label: 'All' },
    { label: 'Under 300 RMB', priceMax: 300 },
    { label: 'ZJU', university: 'Zhejiang University' }
  ],
  services: [
    { label: 'All' },
    { label: 'Airport pickup', subcategory: 'Airport pickup' },
    { label: 'ZJU', university: 'Zhejiang University' }
  ],
  study: [
    { label: 'All' },
    { label: 'HSK / IELTS prep', subcategory: 'HSK / IELTS prep' },
    { label: 'ZJU', university: 'Zhejiang University' }
  ],
  other: [
    { label: 'All' },
    { label: 'Free stuff', subcategory: 'Free stuff' },
    { label: 'ZJU', university: 'Zhejiang University' }
  ]
}

function buildPrimaryFilters(category, locale) {
  const allOption = copyStore.getPageCopy('categoryPage', locale).allOption
  const universityOptions = copyStore.getUniversityFilterOptions(locale)
  const subcategoryValues = category.subcategories || []
  const subcategoryLabel = copyStore.getCategoryPrimaryFilterLabel(category.primaryFilters[0], locale)
  const universityLabel = copyStore.getCategoryPrimaryFilterLabel(category.primaryFilters[1], locale)

  return [
    {
      key: 'subcategory',
      label: subcategoryLabel,
      optionValues: [''].concat(subcategoryValues),
      optionLabels: [allOption].concat(subcategoryValues.map((item) => copyStore.translateSubcategory(item, locale))),
      selectedIndex: 0,
      displayLabel: subcategoryLabel
    },
    {
      key: 'university',
      label: universityLabel,
      optionValues: [''].concat(universitiesStore.getPublicUniversityOptions()),
      optionLabels: universityOptions,
      selectedIndex: 0,
      displayLabel: universityLabel
    }
  ]
}

function buildSecondaryFilters(categoryId, category, locale) {
  const priceRanges = PRICE_RANGE_CONFIGS[categoryId] || PRICE_RANGE_CONFIGS.items
  const priceLabel = copyStore.getCategorySecondaryFilterLabel(category.secondaryFilters[0], locale)
  const sortLabel = copyStore.getCategorySecondaryFilterLabel(category.secondaryFilters[1], locale)

  return [
    {
      key: 'priceRange',
      label: priceLabel,
      optionLabels: priceRanges.map((item) => copyStore.getCategoryPriceRangeLabel(item.label, locale)),
      selectedIndex: 0,
      displayLabel: priceLabel
    },
    {
      key: 'sort',
      label: sortLabel,
      optionLabels: copyStore.getCommonCopy(locale).sortOptions,
      selectedIndex: 0,
      displayLabel: sortLabel
    }
  ]
}

function buildQuickFilters(categoryId, locale) {
  const presets = QUICK_PRESETS[categoryId] || QUICK_PRESETS.items
  return presets.map((preset, index) => ({
    key: `${categoryId}-${index}`,
    label: copyStore.getCategoryQuickPresetLabel(preset.label, locale),
    isActive: index === 0
  }))
}

function getActiveQuickPreset(categoryId, quickFilters = []) {
  const presets = QUICK_PRESETS[categoryId] || QUICK_PRESETS.items
  const activeIndex = quickFilters.findIndex((item) => item.isActive)
  return presets[activeIndex >= 0 ? activeIndex : 0] || presets[0]
}

function getPriceRange(categoryId, selectedIndex) {
  const priceRanges = PRICE_RANGE_CONFIGS[categoryId] || PRICE_RANGE_CONFIGS.items
  return priceRanges[selectedIndex] || priceRanges[0]
}

function normalizeSelectedFilters(categoryId, primaryFilters, secondaryFilters, quickFilters) {
  const selectedSubcategory =
    primaryFilters[0] && primaryFilters[0].selectedIndex > 0
      ? ((primaryFilters[0].optionValues && primaryFilters[0].optionValues[primaryFilters[0].selectedIndex]) || '')
      : ''
  const selectedUniversity =
    primaryFilters[1] && primaryFilters[1].selectedIndex > 0
      ? ((primaryFilters[1].optionValues && primaryFilters[1].optionValues[primaryFilters[1].selectedIndex]) || '')
      : ''
  const selectedPriceRange = getPriceRange(categoryId, secondaryFilters[0] ? secondaryFilters[0].selectedIndex : 0)
  const activeQuickPreset = getActiveQuickPreset(categoryId, quickFilters)

  const minCandidates = [selectedPriceRange.min || 0]
  const maxCandidates = [selectedPriceRange.max || 0]

  if (activeQuickPreset.priceMin) {
    minCandidates.push(activeQuickPreset.priceMin)
  }

  if (activeQuickPreset.priceMax) {
    maxCandidates.push(activeQuickPreset.priceMax)
  }

  return {
    subcategory: selectedSubcategory,
    university: selectedUniversity || activeQuickPreset.university || '',
    quickSubcategory: activeQuickPreset.subcategory || '',
    priceMin: Math.max(...minCandidates),
    priceMax: maxCandidates.filter(Boolean).length ? Math.min(...maxCandidates.filter(Boolean)) : 0,
    sortIndex: secondaryFilters[1] ? secondaryFilters[1].selectedIndex : 0
  }
}

function filterListings(listings, filters) {
  return listings.filter((listing) => {
    const priceValue = listingsUtils.parsePriceValue(listing.price)
    const matchesSubcategory = !filters.subcategory || listing.subcategory === filters.subcategory
    const matchesQuickSubcategory = !filters.quickSubcategory || listing.subcategory === filters.quickSubcategory
    const matchesUniversity = !filters.university || listing.university === filters.university
    const matchesMin = !filters.priceMin || priceValue >= filters.priceMin
    const matchesMax = !filters.priceMax || priceValue <= filters.priceMax

    return matchesSubcategory && matchesQuickSubcategory && matchesUniversity && matchesMin && matchesMax
  })
}

Page({
  data: {
    locale: INITIAL_LOCALE,
    copy: copyStore.getPageCopy('categoryPage', INITIAL_LOCALE),
    themeMode: INITIAL_THEME.themeMode,
    themeClass: INITIAL_THEME.themeClass,
    isDarkTheme: INITIAL_THEME.isDarkTheme,
    navTitle: copyStore.getPageCopy('categoryPage', INITIAL_LOCALE).navTitle,
    categoryId: '',
    isAllCategories: false,
    category: null,
    categoryRegionLabel: '',
    subcategoryCards: [],
    featured: [],
    categories: [],
    allListings: [],
    primaryFilters: [],
    secondaryFilters: [],
    quickFilters: [],
    filterSheetOpen: false,
    filterSheetGroup: '',
    filterSheetKey: '',
    filterSheetTitle: '',
    filterSheetOptions: [],
    filterSheetValue: 0,
    filteredCount: 0,
    showResultsLabel: 'Show listings'
  },

  onLoad(query) {
    this.refreshTheme()
    this.refreshLocale(() => {
      const categoryId = query.id || 'all'

      if (categoryId === 'all') {
        wx.setNavigationBarTitle({
          title: this.data.copy.navTitle
        })

        this.setData({
          navTitle: this.data.copy.navTitle,
          categoryId,
          isAllCategories: true,
          categories: copyStore.mapCategories(catalogApi.getPublishCategories(), this.data.locale)
        })
        return
      }

      this.initializeCategory(categoryId)
    })
  },

  onShow() {
    this.refreshLocale(() => {
      this.refreshTheme()
      if (this.data.isAllCategories) {
        this.setData({
          navTitle: this.data.copy.navTitle,
          categories: copyStore.mapCategories(catalogApi.getPublishCategories(), this.data.locale)
        })
        return
      }
      if (!this.data.isAllCategories && this.data.categoryId) {
        this.initializeCategory(this.data.categoryId)
      }
    })
  },

  refreshTheme() {
    this.setData(storage.getThemeData())
  },

  refreshLocale(callback) {
    const locale = localeStore.getLocale()

    this.setData({
      locale,
      copy: copyStore.getPageCopy('categoryPage', locale)
    }, callback)
  },

  async initializeCategory(categoryId) {
    const locale = this.data.locale
    const rawCategory = catalogApi.categoryConfigs[categoryId] || catalogApi.categoryConfigs.housing
    const category = {
      ...rawCategory,
      title: copyStore.getCategoryLabel(categoryId, locale),
      region: copyStore.getCategoryRegionLabel(rawCategory.region, locale)
    }
    const featured = copyStore.getLocalizedFeaturedCards(categoryId, locale)
    const primaryFilters = buildPrimaryFilters(rawCategory, locale)
    const secondaryFilters = buildSecondaryFilters(categoryId, rawCategory, locale)
    const quickFilters = buildQuickFilters(categoryId, locale)

    wx.setNavigationBarTitle({
      title: category.title
    })

    this.setData({
      navTitle: category.title,
      categoryId,
      isAllCategories: false,
      category,
      categoryRegionLabel: category.region,
      featured,
      allListings: listingsRuntime.enabled ? [] : listingsApi.getFeedByCategory(categoryId),
      primaryFilters,
      secondaryFilters,
      quickFilters,
      subcategoryCards: catalogApi.getSubcategoryCards(categoryId).map((item) => ({
        ...item,
        rawName: item.name,
        name: copyStore.translateSubcategory(item.name, locale)
      }))
    }, () => {
      this.applyFilters()
    })

    if (!listingsRuntime.enabled) {
      return
    }

    if (visibilityStore.enabled) {
      await visibilityStore.syncPreferences()
    }
    const allListings = await listingsRuntime.getFeedByCategory(categoryId)

    this.setData({
      allListings
    }, () => {
      this.applyFilters()
    })
  },

  applyFilters() {
    const { categoryId, category, allListings, primaryFilters, secondaryFilters, quickFilters } = this.data
    const selectedFilters = normalizeSelectedFilters(categoryId, primaryFilters, secondaryFilters, quickFilters)
    const filteredListings = filterListings(allListings, selectedFilters)

    this.setData({
      categoryRegionLabel: selectedFilters.university || (category ? category.region : ''),
      filteredCount: filteredListings.length,
      showResultsLabel: copyStore.getCategoryShowResultsLabel(filteredListings.length, this.data.locale)
    })
  },

  onPrimaryFilterChange(e) {
    const { key } = e.currentTarget.dataset
    const selectedIndex = Number(e.detail.value)
    const nextFilters = (this.data.primaryFilters || []).map((filter) => {
      if (filter.key !== key) {
        return filter
      }

      return {
        ...filter,
        selectedIndex,
        displayLabel: selectedIndex ? filter.optionLabels[selectedIndex] : filter.label
      }
    })

    this.setData({
      primaryFilters: nextFilters
    }, () => {
      this.applyFilters()
    })
  },

  onSecondaryFilterChange(e) {
    const { key } = e.currentTarget.dataset
    const selectedIndex = Number(e.detail.value)
    const nextFilters = (this.data.secondaryFilters || []).map((filter) => {
      if (filter.key !== key) {
        return filter
      }

      return {
        ...filter,
        selectedIndex,
        displayLabel: selectedIndex ? filter.optionLabels[selectedIndex] : filter.label
      }
    })

    this.setData({
      secondaryFilters: nextFilters
    }, () => {
      this.applyFilters()
    })
  },

  openFilterSheet(e) {
    const { group, key } = e.currentTarget.dataset
    const sourceFilters = group === 'secondary' ? this.data.secondaryFilters : this.data.primaryFilters
    const targetFilter = (sourceFilters || []).find((filter) => filter.key === key)

    if (!targetFilter || !Array.isArray(targetFilter.optionLabels) || !targetFilter.optionLabels.length) {
      return
    }

    this.setData({
      filterSheetOpen: true,
      filterSheetGroup: group || 'primary',
      filterSheetKey: key || '',
      filterSheetTitle: targetFilter.label || this.data.copy.selectOption,
      filterSheetOptions: targetFilter.optionLabels,
      filterSheetValue: Number(targetFilter.selectedIndex) || 0
    })
  },

  closeFilterSheet() {
    this.setData({
      filterSheetOpen: false
    })
  },

  stopFilterSheetTap() {},

  onFilterOptionTap(e) {
    const selectedIndex = Number(e.currentTarget.dataset.index)
    const group = this.data.filterSheetGroup
    const key = this.data.filterSheetKey

    this.setData({
      filterSheetOpen: false
    })

    if (group === 'secondary') {
      this.onSecondaryFilterChange({
        currentTarget: {
          dataset: {
            key
          }
        },
        detail: {
          value: selectedIndex
        }
      })
      return
    }

    this.onPrimaryFilterChange({
      currentTarget: {
        dataset: {
          key
        }
      },
      detail: {
        value: selectedIndex
      }
    })
  },

  onQuickFilterTap(e) {
    const selectedIndex = Number(e.currentTarget.dataset.index)
    const nextFilters = (this.data.quickFilters || []).map((filter, index) => ({
      ...filter,
      isActive: index === selectedIndex
    }))

    this.setData({
      quickFilters: nextFilters
    }, () => {
      this.applyFilters()
    })
  },

  resetFilters() {
    const { categoryId, category } = this.data
    const rawCategory = catalogApi.categoryConfigs[categoryId] || category

    this.setData({
      primaryFilters: buildPrimaryFilters(rawCategory, this.data.locale),
      secondaryFilters: buildSecondaryFilters(categoryId, rawCategory, this.data.locale),
      quickFilters: buildQuickFilters(categoryId, this.data.locale),
      filterSheetOpen: false
    }, () => {
      this.applyFilters()
    })
  },

  goBack() {
    wx.navigateBack()
  },

  buildResultsUrl(extra = {}) {
    const { categoryId, primaryFilters, secondaryFilters, quickFilters } = this.data
    const filters = {
      ...normalizeSelectedFilters(categoryId, primaryFilters, secondaryFilters, quickFilters),
      ...extra
    }
    const params = [`categoryId=${categoryId}`]

    if (filters.subcategory) {
      params.push(`subcategory=${encodeURIComponent(filters.subcategory)}`)
    }

    if (filters.quickSubcategory) {
      params.push(`quickSubcategory=${encodeURIComponent(filters.quickSubcategory)}`)
    }

    if (filters.university) {
      params.push(`university=${encodeURIComponent(filters.university)}`)
    }

    if (filters.priceMin) {
      params.push(`priceMin=${filters.priceMin}`)
    }

    if (filters.priceMax) {
      params.push(`priceMax=${filters.priceMax}`)
    }

    if (filters.sortIndex) {
      params.push(`sort=${filters.sortIndex}`)
    }

    return `/pages/results/results?${params.join('&')}`
  },

  openResults() {
    wx.navigateTo({
      url: this.buildResultsUrl()
    })
  },

  openCategory(e) {
    const { id } = e.currentTarget.dataset
    wx.redirectTo({
      url: `/pages/category/category?id=${id}`
    })
  },

  openSubcategory(e) {
    const { name } = e.currentTarget.dataset
    wx.navigateTo({
      url: this.buildResultsUrl({ subcategory: name, quickSubcategory: '' })
    })
  }
})
