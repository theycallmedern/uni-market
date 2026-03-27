const market = require('../../data/market')

module.exports = {
  getAll(options = {}) {
    return market.getAllListings(options)
  },
  getFeed() {
    return market.getFeedListings()
  },
  getById(id, options = {}) {
    return market.getListingById(id, options)
  },
  getByCategory(categoryId, options = {}) {
    return market.getListingsByCategory(categoryId, options)
  },
  getFeedByCategory(categoryId) {
    return market.getFeedListingsByCategory(categoryId)
  },
  getBySellerKey(sellerKey, options = {}) {
    return market.getListingsBySellerKey(sellerKey, options)
  },
  getMy() {
    return market.getMyListings()
  },
  create(payload) {
    return market.createListing(payload)
  },
  update(id, payload) {
    return market.updateListing(id, payload)
  },
  remove(id) {
    return market.deleteListing(id)
  },
  setSoldState(id, isSold, soldOnUniMarket = true) {
    return market.setListingSoldState(id, isSold, soldOnUniMarket)
  },
  restore(id) {
    return market.restoreListing(id)
  },
  getAnalytics(id) {
    return market.getListingAnalytics(id)
  },
  getPromotionPlans() {
    return market.getPromotionPlans()
  },
  requestPromotion(id, planId = 'featured_1d', options = {}) {
    return market.requestListingPromotion(id, planId, options)
  },
  getCurrentPhotoLimit() {
    return market.getCurrentSellerPhotoLimit()
  },
  queueCreateMode(mode) {
    return market.queueCreateMode(mode)
  },
  consumeCreateMode() {
    return market.consumeCreateMode()
  },
  recordView(id) {
    return market.recordListingView(id)
  },
  sortByPromotionPriority(listings = []) {
    return market.sortByPromotionPriority(listings)
  }
}
