const market = require('../../data/market')
const universitiesStore = require('../../utils/universities')
const listingsUtils = require('../../utils/listings')

const UNIVERSITY_OPTIONS = ['All universities', ...universitiesStore.getPublicUniversityOptions()]
const SORT_OPTIONS = ['Newest', 'Price low to high', 'Price high to low']

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

function buildPrimaryFilters(category) {
  return [
    {
      key: 'subcategory',
      label: category.primaryFilters[0],
      optionLabels: ['All', ...category.subcategories],
      selectedIndex: 0,
      displayLabel: category.primaryFilters[0]
    },
    {
      key: 'university',
      label: category.primaryFilters[1],
      optionLabels: UNIVERSITY_OPTIONS,
      selectedIndex: 0,
      displayLabel: category.primaryFilters[1]
    }
  ]
}

function buildSecondaryFilters(categoryId, category) {
  const priceRanges = PRICE_RANGE_CONFIGS[categoryId] || PRICE_RANGE_CONFIGS.items

  return [
    {
      key: 'priceRange',
      label: category.secondaryFilters[0],
      optionLabels: priceRanges.map((item) => item.label),
      selectedIndex: 0,
      displayLabel: category.secondaryFilters[0]
    },
    {
      key: 'sort',
      label: category.secondaryFilters[1],
      optionLabels: SORT_OPTIONS,
      selectedIndex: 0,
      displayLabel: category.secondaryFilters[1]
    }
  ]
}

function buildQuickFilters(categoryId) {
  const presets = QUICK_PRESETS[categoryId] || QUICK_PRESETS.items
  return presets.map((preset, index) => ({
    key: `${categoryId}-${index}`,
    label: preset.label,
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
      ? primaryFilters[0].optionLabels[primaryFilters[0].selectedIndex]
      : ''
  const selectedUniversity =
    primaryFilters[1] && primaryFilters[1].selectedIndex > 0
      ? primaryFilters[1].optionLabels[primaryFilters[1].selectedIndex]
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

function buildShowResultsLabel(count) {
  if (!count) {
    return 'No listings found'
  }

  return count === 1 ? 'Show 1 listing' : `Show ${count} listings`
}

Page({
  data: {
    navTitle: 'Categories',
    categoryId: '',
    isAllCategories: false,
    category: null,
    subcategoryCards: [],
    featured: [],
    categories: [],
    allListings: [],
    primaryFilters: [],
    secondaryFilters: [],
    quickFilters: [],
    filteredCount: 0,
    showResultsLabel: 'Show listings'
  },

  onLoad(query) {
    const categoryId = query.id || 'all'

    if (categoryId === 'all') {
      wx.setNavigationBarTitle({
        title: 'Categories'
      })

      this.setData({
        navTitle: 'Categories',
        categoryId,
        isAllCategories: true,
        categories: market.getPublishCategories()
      })
      return
    }

    this.initializeCategory(categoryId)
  },

  onShow() {
    if (!this.data.isAllCategories && this.data.categoryId) {
      this.setData({
        allListings: market.getFeedListingsByCategory(this.data.categoryId),
        subcategoryCards: market.getSubcategoryCards(this.data.categoryId)
      }, () => {
        this.applyFilters()
      })
    }
  },

  initializeCategory(categoryId) {
    const category = market.categoryConfigs[categoryId] || market.categoryConfigs.housing
    const featured = market.featuredCards[categoryId] || market.featuredCards.housing
    const allListings = market.getFeedListingsByCategory(categoryId)
    const primaryFilters = buildPrimaryFilters(category)
    const secondaryFilters = buildSecondaryFilters(categoryId, category)
    const quickFilters = buildQuickFilters(categoryId)

    wx.setNavigationBarTitle({
      title: category.title
    })

    this.setData({
      navTitle: category.title,
      categoryId,
      isAllCategories: false,
      category,
      featured,
      allListings,
      primaryFilters,
      secondaryFilters,
      quickFilters,
      subcategoryCards: market.getSubcategoryCards(categoryId)
    }, () => {
      this.applyFilters()
    })
  },

  applyFilters() {
    const { categoryId, allListings, primaryFilters, secondaryFilters, quickFilters } = this.data
    const selectedFilters = normalizeSelectedFilters(categoryId, primaryFilters, secondaryFilters, quickFilters)
    const filteredListings = filterListings(allListings, selectedFilters)

    this.setData({
      filteredCount: filteredListings.length,
      showResultsLabel: buildShowResultsLabel(filteredListings.length)
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

    this.setData({
      primaryFilters: buildPrimaryFilters(category),
      secondaryFilters: buildSecondaryFilters(categoryId, category),
      quickFilters: buildQuickFilters(categoryId)
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
