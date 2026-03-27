const reviewsStore = require('../../utils/reviews')
const remoteApi = require('./remote')

function buildLocalSummary(options = {}) {
  const sellerKey = String(options.sellerKey || options.sellerUserId || '').trim().toLowerCase()
  const listingId = String(options.listingId || '')
  const reviewerKey = String(options.reviewerKey || options.reviewerUserId || '').trim().toLowerCase()
  const summary = reviewsStore.getSellerReviewSummary(sellerKey)

  return {
    ...summary,
    hasReviewedCurrentListing: listingId ? reviewsStore.hasReviewedListing(listingId, reviewerKey) : false
  }
}

module.exports = {
  get enabled() {
    return Boolean(remoteApi.reviews && remoteApi.reviews.enabled)
  },
  unlockReviewForListing(listingId) {
    return reviewsStore.unlockReviewForListing(listingId)
  },
  canReviewListing(listingId) {
    return reviewsStore.canReviewListing(listingId)
  },
  hasReviewedListing(listingId, reviewerKey = '') {
    return reviewsStore.hasReviewedListing(listingId, reviewerKey)
  },
  createReview(payload = {}) {
    return reviewsStore.createReview(payload)
  },
  getSellerReviews(sellerKey, limit = 0) {
    return reviewsStore.getSellerReviews(sellerKey, limit)
  },
  getSellerReviewSummary(sellerKey) {
    return reviewsStore.getSellerReviewSummary(sellerKey)
  },
  async getSummary(options = {}) {
    if (this.enabled) {
      try {
        return await remoteApi.reviews.getSummary(options)
      } catch (error) {}
    }

    return buildLocalSummary(options)
  },
  async submitReview(payload = {}) {
    if (this.enabled) {
      try {
        return await remoteApi.reviews.create(payload)
      } catch (error) {}
    }

    return reviewsStore.createReview(payload)
  },
  remapSellerKey(previousKeys = [], nextKey = '') {
    return reviewsStore.remapSellerKey(previousKeys, nextKey)
  }
}
