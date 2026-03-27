const backendClient = require('./backend-client')
const localClient = require('./local-client')
const profileStore = require('../../utils/profile')
const reviewsStore = require('../../utils/reviews')
const adminStore = require('../../utils/admin')
const visibilityStore = require('../../utils/visibility')
const {
  USE_BACKEND_LISTING_READS,
  USE_BACKEND_LISTING_WRITES,
  getApiBaseUrl
} = require('./config')

function canUseWxRequest() {
  return typeof wx !== 'undefined'
    && wx
    && typeof wx.request === 'function'
}

function toPromise(value) {
  if (value && typeof value.then === 'function') {
    return value
  }

  return Promise.resolve(value)
}

function normalizeListing(listing) {
  if (!listing) {
    return null
  }

  const price = String(listing.price || listing.priceLabel || '').trim()
  const images = Array.isArray(listing.images)
    ? listing.images.filter(Boolean)
    : []

  return {
    ...listing,
    price,
    image: listing.image || images[0] || '',
    images,
    seller: {
      ...(listing.seller || {})
    }
  }
}

function normalizeListings(listings) {
  return Array.isArray(listings)
    ? listings.map(normalizeListing).filter(Boolean)
    : []
}

function normalizeProfileResponse(response) {
  const profile = response && response.profile ? response.profile : null
  if (!profile) {
    return null
  }

  return profileStore.normalizeProfile(profile)
}

function applyVisibilityFilters(listings, options = {}) {
  const includeHiddenByUser = Boolean(options && options.includeHiddenByUser)
  const normalizedListings = normalizeListings(listings)

  if (includeHiddenByUser) {
    return normalizedListings
  }

  return visibilityStore.filterVisibleListings(normalizedListings)
}

async function withListingFallback(primary, fallback) {
  try {
    const result = await toPromise(primary())
    return result
  } catch (error) {
    return toPromise(fallback())
  }
}

const shouldUseBackendReads = USE_BACKEND_LISTING_READS && Boolean(getApiBaseUrl()) && canUseWxRequest()
const shouldUseBackendWrites = USE_BACKEND_LISTING_WRITES && Boolean(getApiBaseUrl()) && canUseWxRequest()

const listings = {
  enabled: shouldUseBackendReads,
  writesEnabled: shouldUseBackendWrites,

  async getFeed() {
    const result = await withListingFallback(
      () => shouldUseBackendReads ? backendClient.listings.getFeed() : localClient.listings.getFeed(),
      () => localClient.listings.getFeed()
    )

    return applyVisibilityFilters(Array.isArray(result && result.items) ? result.items : result)
  },

  async getAll(options = {}) {
    const result = await withListingFallback(
      () => shouldUseBackendReads ? backendClient.listings.getAll(options) : localClient.listings.getAll(options),
      () => localClient.listings.getAll(options)
    )

    return applyVisibilityFilters(Array.isArray(result && result.items) ? result.items : result, options)
  },

  async getById(id, options = {}) {
    const result = await withListingFallback(
      () => shouldUseBackendReads ? backendClient.listings.getById(id, options) : localClient.listings.getById(id, options),
      () => localClient.listings.getById(id, options)
    )

    const listing = normalizeListing(result)
    if (!listing) {
      return null
    }

    if (options && options.includeHiddenByUser) {
      return listing
    }

    return visibilityStore.isListingVisible(listing) ? listing : null
  },

  async getFeedByCategory(categoryId) {
    const result = await withListingFallback(
      () => shouldUseBackendReads ? backendClient.listings.getFeedByCategory(categoryId) : localClient.listings.getFeedByCategory(categoryId),
      () => localClient.listings.getFeedByCategory(categoryId)
    )

    return applyVisibilityFilters(Array.isArray(result && result.items) ? result.items : result)
  },

  async getBySellerKey(sellerKey, options = {}) {
    const result = await withListingFallback(
      () => shouldUseBackendReads ? backendClient.listings.getBySellerKey(sellerKey, options) : localClient.listings.getBySellerKey(sellerKey, options),
      () => localClient.listings.getBySellerKey(sellerKey, options)
    )

    return applyVisibilityFilters(Array.isArray(result && result.items) ? result.items : result, options)
  },

  async getAnalytics(id) {
    return withListingFallback(
      () => shouldUseBackendReads ? backendClient.listings.getAnalytics(id) : localClient.listings.getAnalytics(id),
      () => localClient.listings.getAnalytics(id)
    )
  },

  async getMy() {
    const result = await withListingFallback(
      () => shouldUseBackendWrites ? backendClient.listings.getMy() : localClient.listings.getMy(),
      () => localClient.listings.getMy()
    )

    return normalizeListings(Array.isArray(result && result.items) ? result.items : result)
  },

  async create(payload) {
    if (!shouldUseBackendWrites) {
      return toPromise(localClient.listings.create(payload))
    }

    return backendClient.listings.create(payload)
  },

  async update(id, payload) {
    if (!shouldUseBackendWrites) {
      return toPromise(localClient.listings.update(id, payload))
    }

    return backendClient.listings.update(id, payload)
  },

  async setSoldState(id, isSold, soldOnUniMarket = true) {
    if (!shouldUseBackendWrites) {
      return toPromise(localClient.listings.setSoldState(id, isSold, soldOnUniMarket))
    }

    return backendClient.listings.setSoldState(id, isSold, soldOnUniMarket)
  },

  async restore(id) {
    if (!shouldUseBackendWrites) {
      return toPromise(localClient.listings.restore(id))
    }

    return backendClient.listings.restore(id)
  },

  async remove(id) {
    if (!shouldUseBackendWrites) {
      return toPromise(localClient.listings.remove(id))
    }

    return backendClient.listings.remove(id)
  },

  async getPromotionPlans() {
    const result = await withListingFallback(
      () => shouldUseBackendWrites ? backendClient.listings.getPromotionPlans() : localClient.listings.getPromotionPlans(),
      () => localClient.listings.getPromotionPlans()
    )

    return Array.isArray(result) ? result : []
  },

  async requestPromotion(id, planId = 'featured_1d', options = {}) {
    if (!shouldUseBackendWrites) {
      return toPromise(localClient.listings.requestPromotion(id, planId, options))
    }

    return backendClient.listings.requestPromotion(id, planId, options)
  },

  async recordView(id) {
    if (!shouldUseBackendWrites) {
      return toPromise(localClient.listings.recordView(id))
    }

    return backendClient.listings.recordView(id)
  }
}

module.exports = {
  listings,
  sellers: {
    enabled: shouldUseBackendWrites,

    async getProfileByListingId(listingId, options = {}) {
      const result = await withListingFallback(
        () => shouldUseBackendWrites ? backendClient.sellers.getProfileByListingId(listingId, options) : localClient.sellers.getProfileByListingId(listingId, options),
        () => localClient.sellers.getProfileByListingId(listingId, options)
      )

      return result || null
    },

    async recordProfileView(sellerKey) {
      if (!shouldUseBackendWrites) {
        return toPromise(localClient.sellers.recordProfileView(sellerKey))
      }

      return backendClient.sellers.recordProfileView(sellerKey)
    }
  },
  auth: {
    enabled: shouldUseBackendWrites,

    async getMe() {
      if (!shouldUseBackendWrites) {
        return toPromise(localClient.auth.getMe())
      }

      const result = await backendClient.auth.getMe()
      adminStore.setAdminAccess(Boolean(result && result.isAdmin))
      return result
    },

    async updateMyProfile(payload = {}) {
      if (!shouldUseBackendWrites) {
        return toPromise(localClient.auth.updateMyProfile(payload))
      }

      return backendClient.auth.updateMyProfile(payload)
    },

    async enableAdminAccess(code) {
      if (!shouldUseBackendWrites) {
        return null
      }

      const result = await backendClient.auth.enableAdminAccess(code)
      adminStore.setAdminAccess(Boolean(result && result.isAdmin))
      return result
    },

    async disableAdminAccess() {
      if (!shouldUseBackendWrites) {
        adminStore.disableAdmin()
        return { ok: true, isAdmin: false }
      }

      const result = await backendClient.auth.disableAdminAccess()
      adminStore.setAdminAccess(Boolean(result && result.isAdmin))
      return result
    },

    async requestSellerPro() {
      if (!shouldUseBackendWrites) {
        return null
      }

      return backendClient.auth.requestSellerPro()
    },

    normalizeProfileResponse
  },
  saved: {
    enabled: shouldUseBackendWrites,

    async getIds() {
      if (!shouldUseBackendWrites) {
        return []
      }

      const result = await backendClient.listings.getSaved()
      return Array.isArray(result && result.ids) ? result.ids.map((id) => String(id)) : []
    },

    async setSaved(id, shouldSave) {
      if (!shouldUseBackendWrites) {
        return []
      }

      const result = shouldSave
        ? await backendClient.listings.save(id)
        : await backendClient.listings.unsave(id)

      return Array.isArray(result && result.ids) ? result.ids.map((item) => String(item)) : []
    }
  },
  moderation: {
    enabled: shouldUseBackendWrites,

    async getReports() {
      if (!shouldUseBackendWrites) {
        return []
      }

      return backendClient.moderation.getReports()
    },

    async createReport(payload = {}) {
      if (!shouldUseBackendWrites) {
        return null
      }

      return backendClient.moderation.createReport(payload)
    },

    async updateReportStatus(reportId, status) {
      if (!shouldUseBackendWrites) {
        return null
      }

      return backendClient.moderation.updateReportStatus(reportId, status)
    },

    async getPromotionRequests(options = {}) {
      if (!shouldUseBackendWrites) {
        return toPromise(localClient.moderation.getPromotionRequests(options))
      }

      return backendClient.moderation.getPromotionRequests(options)
    },

    async reviewPromotionRequest(requestId, action, options = {}) {
      if (!shouldUseBackendWrites) {
        return toPromise(localClient.moderation.reviewPromotionRequest(requestId, action, options))
      }

      return backendClient.moderation.reviewPromotionRequest(requestId, action, options)
    },

    async getSellerProSubscriptions(options = {}) {
      if (!shouldUseBackendWrites) {
        return toPromise(localClient.moderation.getSellerProSubscriptions(options))
      }

      return backendClient.moderation.getSellerProSubscriptions(options)
    },

    async grantSellerProByNickname(nickname, options = {}) {
      if (!shouldUseBackendWrites) {
        return toPromise(localClient.moderation.grantSellerProByNickname(nickname, options))
      }

      return backendClient.moderation.grantSellerProByNickname(nickname, options)
    },

    async reviewSellerProSubscription(id, action, options = {}) {
      if (!shouldUseBackendWrites) {
        return null
      }

      return backendClient.moderation.reviewSellerProSubscription(id, action, options)
    },

    async revokeSellerProSubscription(id) {
      if (!shouldUseBackendWrites) {
        return toPromise(localClient.moderation.revokeSellerProSubscription(id))
      }

      return backendClient.moderation.revokeSellerProSubscription(id)
    }
  },
  reviews: {
    enabled: shouldUseBackendWrites,

    async getSummary(options = {}) {
      if (!shouldUseBackendWrites) {
        const sellerKey = String(options.sellerKey || options.sellerUserId || '').trim().toLowerCase()
        const listingId = String(options.listingId || '')
        const reviewerKey = String(options.reviewerKey || options.reviewerUserId || '').trim().toLowerCase()
        const summary = reviewsStore.getSellerReviewSummary(sellerKey)

        return {
          ...summary,
          hasReviewedCurrentListing: listingId ? reviewsStore.hasReviewedListing(listingId, reviewerKey) : false
        }
      }

      return backendClient.reviews.getSummary(options)
    },

    async create(payload = {}) {
      if (!shouldUseBackendWrites) {
        return toPromise(reviewsStore.createReview(payload))
      }

      return backendClient.reviews.create(payload)
    }
  },
  visibility: {
    enabled: shouldUseBackendWrites,

    async getPreferences() {
      if (!shouldUseBackendWrites) {
        return {
          hiddenListingIds: visibilityStore.getHiddenListingIds(),
          blockedSellerKeys: visibilityStore.getBlockedSellerKeys()
        }
      }

      return backendClient.visibility.getPreferences()
    },

    async hideListing(listingId) {
      if (!shouldUseBackendWrites) {
        return {
          hiddenListingIds: visibilityStore.getHiddenListingIds(),
          blockedSellerKeys: visibilityStore.getBlockedSellerKeys()
        }
      }

      return backendClient.visibility.hideListing(listingId)
    },

    async blockSeller(sellerKey) {
      if (!shouldUseBackendWrites) {
        return {
          hiddenListingIds: visibilityStore.getHiddenListingIds(),
          blockedSellerKeys: visibilityStore.getBlockedSellerKeys()
        }
      }

      return backendClient.visibility.blockSeller(sellerKey)
    }
  }
}
