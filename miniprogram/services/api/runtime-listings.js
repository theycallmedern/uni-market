const localListings = require('./listings')
const remoteApi = require('./remote')

module.exports = {
  get writesEnabled() {
    return Boolean(remoteApi.listings && remoteApi.listings.writesEnabled)
  },
  get enabled() {
    return Boolean(remoteApi.listings && remoteApi.listings.enabled)
  },
  getAll(options = {}) {
    if (remoteApi.listings && remoteApi.listings.enabled) {
      return remoteApi.listings.getAll(options)
    }

    return localListings.getAll(options)
  },
  getFeed() {
    if (remoteApi.listings && remoteApi.listings.enabled) {
      return remoteApi.listings.getFeed()
    }

    return localListings.getFeed()
  },
  getById(id, options = {}) {
    if (remoteApi.listings && remoteApi.listings.enabled) {
      return remoteApi.listings.getById(id, options)
    }

    return localListings.getById(id, options)
  },
  getByCategory(categoryId, options = {}) {
    if (remoteApi.listings && remoteApi.listings.enabled) {
      return remoteApi.listings.getByCategory(categoryId, options)
    }

    return localListings.getByCategory(categoryId, options)
  },
  getFeedByCategory(categoryId) {
    if (remoteApi.listings && remoteApi.listings.enabled) {
      return remoteApi.listings.getFeedByCategory(categoryId)
    }

    return localListings.getFeedByCategory(categoryId)
  },
  getBySellerKey(sellerKey, options = {}) {
    if (remoteApi.listings && remoteApi.listings.enabled) {
      return remoteApi.listings.getBySellerKey(sellerKey, options)
    }

    return localListings.getBySellerKey(sellerKey, options)
  },
  getMy() {
    if (remoteApi.listings && remoteApi.listings.writesEnabled) {
      return remoteApi.listings.getMy()
    }

    return localListings.getMy()
  },
  create(payload = {}) {
    if (remoteApi.listings && remoteApi.listings.writesEnabled) {
      return remoteApi.listings.create(payload)
    }

    return localListings.create(payload)
  },
  update(id, payload = {}) {
    if (remoteApi.listings && remoteApi.listings.writesEnabled) {
      return remoteApi.listings.update(id, payload)
    }

    return localListings.update(id, payload)
  },
  remove(id) {
    if (remoteApi.listings && remoteApi.listings.writesEnabled) {
      return remoteApi.listings.remove(id)
    }

    return localListings.remove(id)
  },
  setSoldState(id, isSold, soldOnUniMarket = true) {
    if (remoteApi.listings && remoteApi.listings.writesEnabled) {
      return remoteApi.listings.setSoldState(id, isSold, soldOnUniMarket)
    }

    return localListings.setSoldState(id, isSold, soldOnUniMarket)
  },
  restore(id) {
    if (remoteApi.listings && remoteApi.listings.writesEnabled) {
      return remoteApi.listings.restore(id)
    }

    return localListings.restore(id)
  },
  getAnalytics(id) {
    if (remoteApi.listings && remoteApi.listings.enabled) {
      return remoteApi.listings.getAnalytics(id)
    }

    return localListings.getAnalytics(id)
  },
  getPromotionPlans() {
    if (remoteApi.listings && remoteApi.listings.writesEnabled) {
      return remoteApi.listings.getPromotionPlans()
    }

    return localListings.getPromotionPlans()
  },
  requestPromotion(id, planId = 'featured_1d', options = {}) {
    if (remoteApi.listings && remoteApi.listings.writesEnabled) {
      return remoteApi.listings.requestPromotion(id, planId, options)
    }

    return localListings.requestPromotion(id, planId, options)
  },
  getCurrentPhotoLimit() {
    return localListings.getCurrentPhotoLimit()
  },
  queueCreateMode(mode) {
    return localListings.queueCreateMode(mode)
  },
  consumeCreateMode() {
    return localListings.consumeCreateMode()
  },
  recordView(id) {
    if (remoteApi.listings && remoteApi.listings.writesEnabled) {
      return remoteApi.listings.recordView(id)
    }

    return localListings.recordView(id)
  },
  sortByPromotionPriority(listings = []) {
    return localListings.sortByPromotionPriority(listings)
  }
}
