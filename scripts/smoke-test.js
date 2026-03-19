const assert = require('node:assert/strict')
const path = require('node:path')

const ROOT = path.resolve(__dirname, '..')
const CORE_MODULES = [
  'miniprogram/utils/profile.js',
  'miniprogram/utils/reports.js',
  'miniprogram/data/market.js',
  'miniprogram/utils/saved.js',
  'miniprogram/utils/listing-stats.js',
  'miniprogram/utils/visibility.js',
  'miniprogram/utils/validation.js'
]

function createWxMock() {
  const store = new Map()

  return {
    store,
    wx: {
      getStorageSync(key) {
        return store.has(key) ? store.get(key) : ''
      },
      setStorageSync(key, value) {
        store.set(key, value)
      },
      removeStorageSync(key) {
        store.delete(key)
      },
      setNavigationBarTitle() {},
      navigateTo() {},
      redirectTo() {},
      navigateBack() {}
    }
  }
}

function loadPageModule(relativePath) {
  const absolutePath = path.join(ROOT, relativePath)
  delete require.cache[require.resolve(absolutePath)]

  const originalPage = global.Page
  let pageConfig = null

  global.Page = (config) => {
    pageConfig = config
  }

  try {
    require(absolutePath)
  } finally {
    global.Page = originalPage
  }

  return pageConfig
}

function createPageInstance(config) {
  const initialData = JSON.parse(JSON.stringify((config && config.data) || {}))
  const instance = {
    data: initialData,
    setData(nextData, callback) {
      this.data = {
        ...this.data,
        ...nextData
      }

      if (typeof callback === 'function') {
        callback()
      }
    }
  }

  Object.keys(config || {}).forEach((key) => {
    if (key === 'data') {
      return
    }

    instance[key] = config[key]
  })

  return instance
}

function loadCoreModules() {
  CORE_MODULES.forEach((relativePath) => {
    const absolutePath = path.join(ROOT, relativePath)
    delete require.cache[require.resolve(absolutePath)]
  })

  return {
    profileStore: require(path.join(ROOT, 'miniprogram/utils/profile.js')),
    reportsStore: require(path.join(ROOT, 'miniprogram/utils/reports.js')),
    market: require(path.join(ROOT, 'miniprogram/data/market.js')),
    savedStore: require(path.join(ROOT, 'miniprogram/utils/saved.js')),
    visibilityStore: require(path.join(ROOT, 'miniprogram/utils/visibility.js')),
    validation: require(path.join(ROOT, 'miniprogram/utils/validation.js'))
  }
}

function withMockedNow(run) {
  const originalNow = Date.now
  let now = 1777777700000

  Date.now = () => {
    now += 1
    return now
  }

  try {
    run()
  } finally {
    Date.now = originalNow
  }
}

function withFreshRuntime(run) {
  const { wx } = createWxMock()
  global.wx = wx

  try {
    run(loadCoreModules())
  } finally {
    delete global.wx
  }
}

function runValidationSmokeTest() {
  withFreshRuntime(({ validation }) => {
    assert.equal(validation.extractPriceDigits('12abc34xyz'), '1234')
    assert.equal(validation.isValidPriceDigits('999999'), true)
    assert.equal(validation.isValidPriceDigits('1000000'), false)
    assert.equal(validation.isPriceInRange('1'), true)
    assert.equal(validation.isPriceInRange('0'), false)
    assert.equal(validation.ensurePriceCurrency('1234'), '1234 RMB')
    assert.equal(validation.sanitizeAddress('  Xihu  District ，  Road  1 ; Building 2  '), 'Xihu District, Road 1, Building 2')
    assert.equal(validation.hasMeaningfulAddress('--- , , ...'), false)
    assert.equal(validation.hasMeaningfulAddress('asdfghqwerty'), false)
    assert.equal(validation.hasMeaningfulAddress('ZJU Gate 1'), true)
    assert.equal(validation.hasMeaningfulAddress('Building 3 Room 202'), true)
    assert.equal(validation.sanitizeWeChatId(' smoke__id '), 'smoke__id')
    assert.equal(validation.isValidWeChatId('smoke__id'), true)
  })
}

function runProfileStoreSmokeTest() {
  withFreshRuntime(({ profileStore }) => {
    const defaultProfile = profileStore.getProfile()
    assert.ok(defaultProfile)
    assert.equal(defaultProfile.city, 'Hangzhou')

    const savedProfile = profileStore.saveProfile({
      name: '  Smoke  User  ',
      campus: 'Zhejiang University',
      wechat: ' smoke__id ',
      bio: '  Testing profile normalization.  '
    })

    assert.equal(savedProfile.name, 'smoke__id')
    assert.equal(savedProfile.wechat, 'smoke__id')
    assert.equal(savedProfile.city, 'Hangzhou')
  })
}

function runReportsStoreSmokeTest() {
  withFreshRuntime(({ reportsStore }) => {
    assert.equal(reportsStore.getReports().length, 0)

    const report = reportsStore.createReport({
      listingId: 'smoke-listing-id',
      listingTitle: 'Smoke listing',
      reason: 'Other',
      note: 'Smoke test'
    })

    assert.ok(report && report.id)
    assert.equal(reportsStore.hasReportedListing('smoke-listing-id'), true)

    const updated = reportsStore.updateReportStatus(report.id, 'resolved')
    assert.ok(updated)
    assert.equal(updated.status, 'resolved')

    const profileReport = reportsStore.createProfileReport({
      profileKey: 'seller-key-1',
      profileName: 'Smoke Seller',
      sourceListingId: 'smoke-listing-id',
      reason: 'Spam',
      note: ''
    })

    assert.ok(profileReport && profileReport.id)
    assert.equal(reportsStore.hasReportedProfile('seller-key-1'), true)
  })
}

function runMarketStoreSmokeTest() {
  withFreshRuntime(({ market }) => {
    withMockedNow(() => {
      const categories = market.getPublishCategories()
      assert.ok(Array.isArray(categories))
      assert.equal(categories.some((item) => item.id === 'all'), false)

      const listing = market.createListing({
        title: 'Smoke listing',
        price: '1234',
        location: 'Hangzhou',
        address: 'ZJU Xixi Campus, Building 1',
        university: 'Zhejiang University',
        categoryId: 'items',
        subcategory: 'Dorm essentials',
        condition: 'Used',
        description: 'Smoke test listing for store checks.',
        images: ['/tmp/smoke.png'],
        seller: {
          name: 'Smoke User',
          wechat: 'smoke__id'
        }
      })

      assert.ok(listing && listing.id)
      assert.match(String(listing.price), /RMB/i)

      const fetched = market.getListingById(listing.id, {
        includeResolved: true,
        includeHiddenByUser: true,
        includeSold: true
      })
      assert.ok(fetched)
      assert.equal(fetched.title, 'Smoke listing')

      const feedHasActive = market.getFeedListings().some((item) => String(item.id) === String(listing.id))
      assert.equal(feedHasActive, true)

      const sellerProGrant = market.grantSellerProByNickname('Smoke User', { grantedBy: 'smoke-test' })
      assert.ok(sellerProGrant)
      assert.ok(Number(sellerProGrant.grantedCount) >= 1)
      assert.ok(market.getSellerProSubscriptions().length >= 1)
      assert.ok(market.getSellerProSubscriptions().every((subscription) => Boolean(subscription.expiresAt)))

      const listingAfterSellerPro = market.getListingById(listing.id, {
        includeResolved: true,
        includeHiddenByUser: true,
        includeSold: true
      })
      assert.equal(Boolean(listingAfterSellerPro && listingAfterSellerPro.isSellerPro), true)

      const ownDefaultPhotoLimit = market.getCurrentSellerPhotoLimit()
      assert.equal(ownDefaultPhotoLimit, 10)
      const ownProGrant = market.grantSellerProByNickname('smoke__id', { grantedBy: 'smoke-test' })
      assert.ok(ownProGrant)
      assert.equal(market.getCurrentSellerPhotoLimit(), 10)

      const sold = market.setListingSoldState(listing.id, true, true)
      assert.ok(sold)
      assert.equal(sold.isSold, true)
      assert.equal(sold.soldOnUniMarket, true)

      const feedHasSold = market.getFeedListings().some((item) => String(item.id) === String(listing.id))
      assert.equal(feedHasSold, false)

      const ownProfile = market.getOwnSellerProfile()
      assert.ok(ownProfile)
      assert.equal(Boolean(ownProfile.isSellerPro), true)
      assert.ok(Number(ownProfile.soldCount) >= 1)

      market.getSellerProSubscriptions().forEach((subscription) => {
        market.revokeSellerProSubscription(subscription.id)
      })

      assert.equal(market.getSellerProSubscriptions().length, 0)
      assert.equal(market.getCurrentSellerPhotoLimit(), 5)
    })
  })
}

function runMarketplaceFlowSmokeTest() {
  withFreshRuntime(({ market, savedStore, reportsStore }) => {
    withMockedNow(() => {
      const firstListing = market.createListing({
        title: 'Flow listing A',
        price: '500',
        location: 'Hangzhou',
        address: 'Xihu District, Road 1',
        university: 'Zhejiang University',
        categoryId: 'transport',
        subcategory: 'Bikes',
        condition: 'Used',
        description: 'Flow smoke listing A for marketplace behavior.',
        images: ['/tmp/flow-a.png'],
        seller: {
          name: 'Flow User',
          wechat: 'flow_user'
        }
      })

      const secondListing = market.createListing({
        title: 'Flow listing B',
        price: '700',
        location: 'Hangzhou',
        address: 'Xihu District, Road 2',
        university: 'Zhejiang University',
        categoryId: 'transport',
        subcategory: 'Scooters',
        condition: 'Used',
        description: 'Flow smoke listing B for marketplace behavior.',
        images: ['/tmp/flow-b.png'],
        seller: {
          name: 'Flow User',
          wechat: 'flow_user'
        }
      })

      const promoRequested = market.requestListingPromotion(secondListing.id, 'featured_3d')
      assert.ok(promoRequested)
      assert.equal(Boolean(promoRequested.isPromotionRequested), true)

      const pendingRequests = market.getPromotionRequests({ status: 'pending' })
      assert.equal(pendingRequests.length, 1)
      assert.equal(String(pendingRequests[0].listingId), String(secondListing.id))
      assert.equal(String(pendingRequests[0].planId), 'featured_3d')

      const approvedRequest = market.reviewPromotionRequest(pendingRequests[0].id, 'approve')
      assert.ok(approvedRequest)
      assert.ok(approvedRequest.listing)
      assert.equal(Boolean(approvedRequest.listing.isPromoted), true)

      market.recordListingView(firstListing.id)
      market.recordListingView(firstListing.id)
      savedStore.toggleSavedListing(firstListing.id)
      assert.equal(savedStore.isListingSaved(firstListing.id), true)
      market.recordSellerProfileView(market.getOwnSellerProfile().sellerKey)
      market.recordSellerProfileView(market.getOwnSellerProfile().sellerKey)

      const initialFeedIds = market.getFeedListings().map((item) => String(item.id))
      assert.equal(initialFeedIds.includes(String(firstListing.id)), true)
      assert.equal(initialFeedIds.includes(String(secondListing.id)), true)
      assert.equal(initialFeedIds[0], String(secondListing.id))

      market.setListingSoldState(firstListing.id, true, false)
      const afterSoldElsewhereFeedIds = market.getFeedListings().map((item) => String(item.id))
      assert.equal(afterSoldElsewhereFeedIds.includes(String(firstListing.id)), false)
      assert.equal(afterSoldElsewhereFeedIds.includes(String(secondListing.id)), true)

      const ownAfterExternalSale = market.getOwnSellerProfile()
      assert.equal(Number(ownAfterExternalSale.soldCount), 0)
      assert.ok(ownAfterExternalSale.analytics)
      assert.ok(Number(ownAfterExternalSale.analytics.profileViews) >= 2)
      assert.ok(Number(ownAfterExternalSale.analytics.listingSaves) >= 1)

      market.setListingSoldState(secondListing.id, true, true)
      const ownAfterUniSale = market.getOwnSellerProfile()
      assert.equal(Number(ownAfterUniSale.soldCount), 1)

      const myListings = market.getMyListings()
      const archivedCount = myListings.filter((item) => Boolean(item && item.isSold)).length
      const activeCount = myListings.filter((item) => !item.isSold).length
      assert.equal(archivedCount, 2)
      assert.equal(activeCount, 0)

      const report = reportsStore.createReport({
        listingId: secondListing.id,
        listingTitle: secondListing.title,
        reason: 'Other',
        note: 'Flow smoke report'
      })

      const pendingStillVisible = market.getAllListings({ includeResolved: false, includeSold: true })
        .some((item) => String(item.id) === String(secondListing.id))
      assert.equal(pendingStillVisible, true)

      reportsStore.updateReportStatus(report.id, 'resolved')
      const resolvedHidden = market.getAllListings({ includeResolved: false, includeSold: true })
        .some((item) => String(item.id) === String(secondListing.id))
      assert.equal(resolvedHidden, false)
    })
  })
}

function runCategoryAndResultsPageSmokeTest() {
  withFreshRuntime(() => {
    const categoryPage = createPageInstance(loadPageModule('miniprogram/pages/category/category.js'))
    categoryPage.onLoad({ id: 'electronics' })

    assert.equal(categoryPage.data.categoryRegionLabel, 'All campuses')
    assert.equal(categoryPage.data.filteredCount > 0, true)

    categoryPage.onPrimaryFilterChange({
      currentTarget: {
        dataset: {
          key: 'university'
        }
      },
      detail: {
        value: '1'
      }
    })

    assert.equal(categoryPage.data.categoryRegionLabel, 'Zhejiang University')
    assert.match(categoryPage.buildResultsUrl(), /university=Zhejiang%20University/)

    categoryPage.resetFilters()
    assert.equal(categoryPage.data.categoryRegionLabel, 'All campuses')

    categoryPage.onQuickFilterTap({
      currentTarget: {
        dataset: {
          index: '2'
        }
      }
    })

    assert.equal(categoryPage.data.categoryRegionLabel, 'Zhejiang University')
    assert.match(categoryPage.buildResultsUrl(), /university=Zhejiang%20University/)

    const quickScopedResultsPage = createPageInstance(loadPageModule('miniprogram/pages/results/results.js'))
    quickScopedResultsPage.onLoad({
      categoryId: 'electronics',
      quickSubcategory: encodeURIComponent('Phones')
    })

    assert.equal(quickScopedResultsPage.data.activeSubcategoryLabel, 'Phones')
    assert.equal(quickScopedResultsPage.data.visibleListings.length, 1)
    assert.equal(quickScopedResultsPage.data.visibleListings[0].subcategory, 'Phones')

    const resultsPage = createPageInstance(loadPageModule('miniprogram/pages/results/results.js'))
    resultsPage.onLoad({
      categoryId: 'electronics',
      university: encodeURIComponent('Zhejiang University')
    })

    assert.equal(resultsPage.data.universityOptions[resultsPage.data.universityIndex], 'Zhejiang University')
    assert.equal(resultsPage.data.visibleListings.every((listing) => listing.university === 'Zhejiang University'), true)

    const searchableResultsPage = createPageInstance(loadPageModule('miniprogram/pages/results/results.js'))
    searchableResultsPage.onLoad({
      categoryId: 'electronics'
    })

    searchableResultsPage.onSearchInput({
      detail: {
        value: 'iphone'
      }
    })

    assert.equal(searchableResultsPage.data.visibleListings.length, 1)
    assert.match(searchableResultsPage.data.visibleListings[0].title.toLowerCase(), /iphone/)

    searchableResultsPage.clearFilters()
    assert.equal(searchableResultsPage.data.universityIndex, 0)
    assert.equal(searchableResultsPage.data.visibleListings.length >= 3, true)
  })
}

function runSmokeTests() {
  runValidationSmokeTest()
  runProfileStoreSmokeTest()
  runReportsStoreSmokeTest()
  runMarketStoreSmokeTest()
  runMarketplaceFlowSmokeTest()
  runCategoryAndResultsPageSmokeTest()
}

try {
  runSmokeTests()
  console.log('Smoke tests passed.')
} catch (error) {
  console.error('Smoke tests failed.')
  console.error(error && error.stack ? error.stack : error)
  process.exit(1)
}
