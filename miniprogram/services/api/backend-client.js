const {
  categories,
  categoryConfigs,
  subcategoryFallbackImages
} = require('../../data/market-catalog')
const { request, setSessionToken, clearSessionToken } = require('./request')

function sortByPromotionPriority(listings = []) {
  return [...listings].sort((a, b) => {
    const promotedDiff = Number(Boolean(b && b.isPromoted)) - Number(Boolean(a && a.isPromoted))
    if (promotedDiff !== 0) {
      return promotedDiff
    }

    const sellerProDiff = Number(Boolean(b && b.isSellerPro)) - Number(Boolean(a && a.isSellerPro))
    if (sellerProDiff !== 0) {
      return sellerProDiff
    }

    return 0
  })
}

function getFallbackImage(categoryId) {
  const safeCategoryId = String(categoryId || 'items')
  return `/assets/categories/${safeCategoryId}.png`
}

const auth = {
  async loginWithWechatCode(code) {
    const response = await request({
      path: '/auth/wechat/login',
      method: 'POST',
      auth: false,
      data: {
        code: String(code || '')
      }
    })

    if (response && response.token) {
      setSessionToken(response.token)
    }

    return response
  },

  async getMe() {
    return request({
      path: '/me',
      method: 'GET'
    })
  },

  async updateMyProfile(payload = {}) {
    return request({
      path: '/me/profile',
      method: 'PUT',
      data: payload
    })
  },

  async requestSellerPro() {
    return request({
      path: '/seller-pro/requests',
      method: 'POST'
    })
  },

  async enableAdminAccess(code) {
    return request({
      path: '/admin/access',
      method: 'POST',
      data: {
        code: String(code || '')
      }
    })
  },

  async disableAdminAccess() {
    return request({
      path: '/admin/access',
      method: 'DELETE'
    })
  },

  clearSession() {
    clearSessionToken()
    return true
  }
}

const catalog = {
  categories,
  categoryConfigs,

  getPublishCategories() {
    return categories.filter((category) => category.id !== 'all')
  },

  getFallbackImage(categoryId) {
    return getFallbackImage(categoryId)
  },

  getSubcategoryCards(categoryId) {
    const category = categoryConfigs[categoryId]

    if (!category) {
      return []
    }

    return category.subcategories.map((name, index) => ({
      id: `${categoryId}-${index}`,
      name,
      image: subcategoryFallbackImages[name] || getFallbackImage(categoryId)
    }))
  }
}

const listings = {
  async getAll(options = {}) {
    return request({
      path: '/listings',
      method: 'GET',
      query: options
    })
  },

  async getFeed() {
    return request({
      path: '/listings',
      method: 'GET',
      query: {
        includeResolved: false,
        includeSold: false
      }
    })
  },

  async getById(id, options = {}) {
    return request({
      path: `/listings/${encodeURIComponent(String(id || ''))}`,
      method: 'GET',
      query: options
    })
  },

  async getByCategory(categoryId, options = {}) {
    return request({
      path: '/listings',
      method: 'GET',
      query: {
        categoryId,
        ...options
      }
    })
  },

  async getFeedByCategory(categoryId) {
    return request({
      path: '/listings',
      method: 'GET',
      query: {
        categoryId,
        includeResolved: false,
        includeSold: false
      }
    })
  },

  async getBySellerKey(sellerKey, options = {}) {
    return request({
      path: '/listings',
      method: 'GET',
      query: {
        sellerKey,
        ...options
      }
    })
  },

  async getMy() {
    return request({
      path: '/me/listings',
      method: 'GET',
      query: {
        includeSold: true,
        includeResolved: true
      }
    })
  },

  async create(payload) {
    return request({
      path: '/listings',
      method: 'POST',
      data: payload
    })
  },

  async update(id, payload) {
    return request({
      path: `/listings/${encodeURIComponent(String(id || ''))}`,
      method: 'PATCH',
      data: payload
    })
  },

  async remove(id) {
    return request({
      path: `/listings/${encodeURIComponent(String(id || ''))}`,
      method: 'DELETE'
    })
  },

  async setSoldState(id, isSold, soldOnUniMarket = true) {
    return request({
      path: `/listings/${encodeURIComponent(String(id || ''))}/mark-sold`,
      method: 'POST',
      data: {
        isSold: Boolean(isSold),
        soldOnUniMarket: Boolean(soldOnUniMarket)
      }
    })
  },

  async restore(id) {
    return request({
      path: `/listings/${encodeURIComponent(String(id || ''))}/restore`,
      method: 'POST'
    })
  },

  async getAnalytics(id) {
    return request({
      path: `/listings/${encodeURIComponent(String(id || ''))}/analytics`,
      method: 'GET'
    })
  },

  async getPromotionPlans() {
    return request({
      path: '/promotions/plans',
      method: 'GET'
    })
  },

  async requestPromotion(id, planId = 'featured_1d', options = {}) {
    return request({
      path: '/promotions/requests',
      method: 'POST',
      data: {
        listingId: String(id || ''),
        planId,
        ...options
      }
    })
  },

  async getCurrentPhotoLimit() {
    const response = await request({
      path: '/me',
      method: 'GET'
    })

    return Number(response && response.photoLimit) || 5
  },

  async getSaved() {
    return request({
      path: '/me/saved',
      method: 'GET'
    })
  },

  async save(id) {
    return request({
      path: `/listings/${encodeURIComponent(String(id || ''))}/save`,
      method: 'POST'
    })
  },

  async unsave(id) {
    return request({
      path: `/listings/${encodeURIComponent(String(id || ''))}/save`,
      method: 'DELETE'
    })
  },

  queueCreateMode(mode) {
    return mode
  },

  consumeCreateMode() {
    return null
  },

  async recordView(id) {
    return request({
      path: `/listings/${encodeURIComponent(String(id || ''))}/view`,
      method: 'POST'
    })
  },

  sortByPromotionPriority
}

const sellers = {
  getSellerKey(listing) {
    const seller = listing && listing.seller ? listing.seller : {}
    return String(seller.id || seller.wechat || '').trim().toLowerCase()
  },

  async getOwnProfile() {
    return request({
      path: '/me',
      method: 'GET'
    })
  },

  async getProfileByListingId(listingId, options = {}) {
    return request({
      path: `/profiles/by-listing/${encodeURIComponent(String(listingId || ''))}`,
      method: 'GET',
      query: options
    })
  },

  async recordProfileView(sellerKey) {
    return request({
      path: `/profiles/${encodeURIComponent(String(sellerKey || ''))}/view`,
      method: 'POST'
    })
  }
}

const moderation = {
  async getReports() {
    return request({
      path: '/moderation/reports',
      method: 'GET'
    })
  },

  async createReport(payload = {}) {
    return request({
      path: '/reports',
      method: 'POST',
      data: payload
    })
  },

  async updateReportStatus(reportId, status) {
    return request({
      path: `/moderation/reports/${encodeURIComponent(String(reportId || ''))}`,
      method: 'PATCH',
      data: {
        status
      }
    })
  },

  async getPromotionRequests(options = {}) {
    return request({
      path: '/moderation/promotion-requests',
      method: 'GET',
      query: options
    })
  },

  async reviewPromotionRequest(requestId, action, options = {}) {
    return request({
      path: `/moderation/promotion-requests/${encodeURIComponent(String(requestId || ''))}`,
      method: 'PATCH',
      data: {
        action,
        ...options
      }
    })
  },

  async getSellerProSubscriptions(options = {}) {
    return request({
      path: '/moderation/seller-pro-subscriptions',
      method: 'GET',
      query: options
    })
  },

  async grantSellerProByNickname(nickname, options = {}) {
    return request({
      path: '/moderation/seller-pro-subscriptions',
      method: 'POST',
      data: {
        nickname,
        ...options
      }
    })
  },

  async reviewSellerProSubscription(id, action, options = {}) {
    return request({
      path: `/moderation/seller-pro-subscriptions/${encodeURIComponent(String(id || ''))}`,
      method: 'PATCH',
      data: {
        action,
        ...options
      }
    })
  },

  async revokeSellerProSubscription(id) {
    return request({
      path: `/moderation/seller-pro-subscriptions/${encodeURIComponent(String(id || ''))}`,
      method: 'DELETE'
    })
  }
}

const reviews = {
  async getSummary(options = {}) {
    return request({
      path: '/reviews',
      method: 'GET',
      query: options
    })
  },

  async create(payload = {}) {
    return request({
      path: '/reviews',
      method: 'POST',
      data: payload
    })
  }
}

const visibility = {
  async getPreferences() {
    return request({
      path: '/me/visibility',
      method: 'GET'
    })
  },

  async hideListing(listingId) {
    return request({
      path: '/me/visibility/hide-listing',
      method: 'POST',
      data: {
        listingId: String(listingId || '')
      }
    })
  },

  async blockSeller(sellerKey) {
    return request({
      path: '/me/visibility/block-seller',
      method: 'POST',
      data: {
        sellerKey: String(sellerKey || '')
      }
    })
  }
}

module.exports = {
  auth,
  catalog,
  listings,
  sellers,
  moderation,
  reviews,
  visibility
}
