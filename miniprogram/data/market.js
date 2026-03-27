const reportsStore = require('../utils/reports')
const visibilityStore = require('../utils/visibility')
const profileStore = require('../utils/profile')
const listingStatsStore = require('../utils/listing-stats')
const profileStatsStore = require('../utils/profile-stats')
const reviewsStore = require('../utils/reviews')
const storage = require('../utils/storage')
const validation = require('../utils/validation')
const { createMarketAdminService } = require('./market-admin-service')
const { createMarketCommandService } = require('./market-command-service')
const { createMarketListingHelpers } = require('./market-listing-helpers')
const { createMarketPromotionHelpers } = require('./market-promotion-helpers')
const { createMarketQueryService } = require('./market-query-service')
const { createMarketSellerHelpers } = require('./market-seller-helpers')
const {
  categories,
  categoryTitles,
  categoryConfigs,
  featuredCards,
  categoryFallbackImages,
  subcategoryFallbackImages,
  baseListings
} = require('./market-catalog')

const LISTING_ACTIVE_DAYS = 30
const LISTING_ACTIVE_MS = LISTING_ACTIVE_DAYS * 24 * 60 * 60 * 1000

function toLookupKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function getFallbackImage(categoryId) {
  return categoryFallbackImages[categoryId] || categoryFallbackImages.items
}

function normalizeCoordinate(value) {
  const coordinate = Number(value)
  return Number.isFinite(coordinate) ? coordinate : null
}

function getListingExpiresAt(rawListing = {}) {
  const explicitExpiresAt = String(rawListing.expiresAt || '').trim()
  if (explicitExpiresAt) {
    return explicitExpiresAt
  }

  const createdAtValue = String(rawListing.createdAt || '').trim()
  const createdAtTs = Date.parse(createdAtValue)
  if (Number.isFinite(createdAtTs)) {
    return new Date(createdAtTs + LISTING_ACTIVE_MS).toISOString()
  }

  return new Date(Date.now() + LISTING_ACTIVE_MS).toISOString()
}

function isListingExpired(rawListing = {}) {
  const expiresAtTs = Date.parse(getListingExpiresAt(rawListing))
  return Number.isFinite(expiresAtTs) && expiresAtTs <= Date.now()
}

function normalizeCustomListing(rawListing) {
  const categoryId = rawListing.categoryId || 'items'
  const images = Array.isArray(rawListing.images) ? rawListing.images.filter(Boolean) : []
  const image = images[0] || rawListing.image || getFallbackImage(categoryId)
  const isSold = Boolean(rawListing.isSold)
  const soldOnUniMarket = isSold ? rawListing.soldOnUniMarket !== false : false
  const promotion = normalizePromotion(rawListing.promotion || {})
  const status = String(rawListing.status || 'active').trim() || 'active'
  const expiresAt = getListingExpiresAt(rawListing)
  const isArchived = !isSold && (status === 'archived' || isListingExpired({ ...rawListing, expiresAt }))

  return {
    id: Number(rawListing.id),
    title: rawListing.title || 'Untitled listing',
    price: validation.ensurePriceCurrency(rawListing.price || 'Price on request'),
    location: rawListing.location || 'Hangzhou',
    address: validation.sanitizeAddress(rawListing.address || '', validation.DEFAULT_ADDRESS_MAX_LENGTH),
    lat: normalizeCoordinate(rawListing.lat || rawListing.latitude),
    lng: normalizeCoordinate(rawListing.lng || rawListing.longitude),
    university: rawListing.university || 'Student listing',
    image,
    categoryId,
    subcategory: rawListing.subcategory || '',
    condition: rawListing.condition || '',
    isSold,
    soldOnUniMarket,
    status,
    expiresAt,
    isArchived,
    archiveReason: isArchived ? 'expired' : (isSold ? 'sold' : ''),
    archivedAt: isArchived ? expiresAt : '',
    soldAt: isSold ? String(rawListing.soldAt || rawListing.updatedAt || rawListing.createdAt || '') : '',
    promotion,
    description: rawListing.description || 'No description yet.',
    images: images.length ? images : [image],
    createdAt: rawListing.createdAt || new Date(Date.now()).toISOString(),
    updatedAt: rawListing.updatedAt || rawListing.createdAt || new Date(Date.now()).toISOString(),
    isCustom: true,
    seller: {
      id: rawListing.seller && rawListing.seller.id ? String(rawListing.seller.id) : '',
      name: rawListing.seller && rawListing.seller.name ? rawListing.seller.name : 'You',
      badge: rawListing.seller && rawListing.seller.badge ? rawListing.seller.badge : 'Student seller',
      wechat: rawListing.seller && rawListing.seller.wechat ? rawListing.seller.wechat : '',
      note: rawListing.seller && rawListing.seller.note ? rawListing.seller.note : 'Recently published',
      avatarUrl: rawListing.seller && rawListing.seller.avatarUrl ? rawListing.seller.avatarUrl : '',
      bio: rawListing.seller && rawListing.seller.bio ? rawListing.seller.bio : '',
      campus: rawListing.seller && rawListing.seller.campus ? rawListing.seller.campus : rawListing.university || '',
      city: rawListing.seller && rawListing.seller.city ? rawListing.seller.city : rawListing.location || 'Hangzhou',
      joinedAt: rawListing.seller && rawListing.seller.joinedAt ? String(rawListing.seller.joinedAt).slice(0, 10) : ''
    }
  }
}

function getSellerKey(listing) {
  if (!listing) {
    return ''
  }

  const seller = listing.seller || {}
  return toLookupKey(
    seller.id || seller.wechat || `${seller.name || ''} ${listing.university || ''} ${listing.location || ''}`
  )
}

function getAllListings(options = {}) {
  return queryService.getAllListings(options)
}

function getListingById(id, options = {}) {
  return queryService.getListingById(id, options)
}

function getFeedListings() {
  return queryService.getFeedListings()
}

function getListingsByCategory(categoryId, options = {}) {
  return queryService.getListingsByCategory(categoryId, options)
}

function getListingsBySellerKey(sellerKey, options = {}) {
  return queryService.getListingsBySellerKey(sellerKey, options)
}

function getListingAnalytics(id) {
  return queryService.getListingAnalytics(id)
}

function getSubcategoryCards(categoryId) {
  return queryService.getSubcategoryCards(categoryId)
}

function getFeedListingsByCategory(categoryId) {
  return queryService.getFeedListingsByCategory(categoryId)
}

function getPublishCategories() {
  return queryService.getPublishCategories()
}

function createListing(payload) {
  return commandService.createListing(payload)
}

function getMyListings() {
  return commandService.getMyListings()
}

function deleteListing(id) {
  return commandService.deleteListing(id)
}

function updateListing(id, payload) {
  return commandService.updateListing(id, payload)
}

function setListingSoldState(id, isSold, soldOnUniMarket = true) {
  return commandService.setListingSoldState(id, isSold, soldOnUniMarket)
}

function restoreListing(id) {
  return commandService.restoreListing(id)
}

function getPromotionPlans() {
  return queryService.getPromotionPlans()
}

function getPromotionRequests(options = {}) {
  return queryService.getPromotionRequests(options)
}

function requestListingPromotion(id, planId = 'featured_1d', options = {}) {
  return commandService.requestListingPromotion(id, planId, options)
}

function activateListingPromotion(id, options = {}) {
  return commandService.activateListingPromotion(id, options)
}

function reviewPromotionRequest(requestId, action, options = {}) {
  return commandService.reviewPromotionRequest(requestId, action, options)
}

function getSellerProSubscriptions() {
  return queryService.getSellerProSubscriptions()
}

function getCurrentSellerPhotoLimit() {
  return queryService.getCurrentSellerPhotoLimit()
}

function grantSellerProByNickname(nickname, options = {}) {
  return commandService.grantSellerProByNickname(nickname, options)
}

function syncCurrentProfileIntoListings(previousProfile = null, nextProfile = null) {
  return commandService.syncCurrentProfileIntoListings(previousProfile, nextProfile)
}

function preserveCurrentProfileSellerPro(previousProfile = null, nextProfile = null) {
  return commandService.preserveCurrentProfileSellerPro(previousProfile, nextProfile)
}

function preserveCurrentProfileIdentityData(previousProfile = null, nextProfile = null) {
  return commandService.preserveCurrentProfileIdentityData(previousProfile, nextProfile)
}

function recordListingView(id) {
  return commandService.recordListingView(id)
}

function recordSellerProfileView(sellerKey) {
  return commandService.recordSellerProfileView(sellerKey)
}

function queueCreateMode(mode) {
  return commandService.queueCreateMode(mode)
}

function consumeCreateMode() {
  return commandService.consumeCreateMode()
}

let decorateListingSellerPro = (listing) => listing
let decorateListingPromotion = (listing) => listing
let normalizePromotion = (promotion) => promotion
let getSellerProLookup = () => ({
  sellerKeys: new Set(),
  nicknameKeys: new Set(),
  wechatKeys: new Set()
})
let isSellerProSeller = () => false
let sortByPromotionPriority = (listings = []) => [...listings]
let revokeSellerProSubscription = () => null
let normalizeSellerProSubscription = (subscription) => subscription
let normalizePromotionRequest = (request) => request
let getStoredSellerProSubscriptions = () => []
let saveSellerProSubscriptions = () => {}
let getStoredPromotionRequests = () => []
let savePromotionRequests = () => {}

const listingHelpers = createMarketListingHelpers({
  storage,
  profileStore,
  reportsStore,
  normalizeCustomListing,
  decorateListingSellerPro: (listing) => decorateListingSellerPro(listing),
  decorateListingPromotion: (listing) => decorateListingPromotion(listing),
  isSellerProSeller: (...args) => isSellerProSeller(...args)
})
const {
  getStoredCustomListings,
  saveStoredCustomListings,
  getCustomListings
} = listingHelpers

const adminService = createMarketAdminService({
  storage,
  normalizePromotionRequest: (request) => normalizePromotionRequest(request),
  normalizeSellerProSubscription: (subscription) => normalizeSellerProSubscription(subscription)
})
;({
  getStoredPromotionRequests,
  savePromotionRequests,
  getStoredSellerProSubscriptions,
  saveSellerProSubscriptions
} = adminService)

const promotionHelpers = createMarketPromotionHelpers({
  profileStore,
  toLookupKey,
  getSellerKey,
  getCustomListings,
  baseListings,
  getListingById,
  updateListing,
  getStoredPromotionRequests,
  savePromotionRequests,
  getStoredSellerProSubscriptions,
  saveSellerProSubscriptions
})
;({
  normalizeSellerProSubscription,
  normalizePromotionRequest,
  revokeSellerProSubscription,
  getSellerProLookup,
  isSellerProSeller,
  decorateListingSellerPro,
  normalizePromotion,
  decorateListingPromotion,
  sortByPromotionPriority
} = promotionHelpers)

const sellerHelpers = createMarketSellerHelpers({
  profileStore,
  listingStatsStore,
  profileStatsStore,
  reportsStore,
  reviewsStore,
  toLookupKey,
  normalizeCustomListing,
  getListingById,
  getListingsBySellerKey,
  getMyListings,
  getSellerKey,
  isSellerProSeller,
  getCustomListings,
  getStoredCustomListings,
  saveStoredCustomListings,
  getStoredSellerProSubscriptions,
  saveSellerProSubscriptions,
  normalizeSellerProSubscription
})
const {
  getSellerProfileByListingId,
  getOwnSellerProfile
} = sellerHelpers

const queryService = createMarketQueryService({
  reportsStore,
  visibilityStore,
  listingStatsStore,
  toLookupKey,
  categories,
  categoryConfigs,
  subcategoryFallbackImages,
  baseListings,
  getCustomListings,
  getSellerKey,
  getSellerProLookup,
  decorateListingSellerPro,
  decorateListingPromotion,
  sortByPromotionPriority,
  getFallbackImage,
  getSellerProfileByListingId,
  getOwnSellerProfile,
  getPromotionPlans: () => promotionHelpers.getPromotionPlans(),
  getPromotionRequests: (options) => promotionHelpers.getPromotionRequests(options),
  getSellerProSubscriptions: () => promotionHelpers.getSellerProSubscriptions(),
  getCurrentSellerPhotoLimit: () => promotionHelpers.getCurrentSellerPhotoLimit()
})

const commandService = createMarketCommandService({
  listingHelpers,
  promotionHelpers,
  sellerHelpers,
  revokeSellerProSubscription,
  listingStatsStore,
  profileStatsStore
})

module.exports = {
  categories,
  categoryTitles,
  categoryConfigs,
  featuredCards,
  listings: baseListings,
  getAllListings,
  getFeedListings,
  getListingById,
  getListingsByCategory,
  getSellerKey,
  getListingsBySellerKey,
  getSellerProfileByListingId,
  getOwnSellerProfile,
  getListingAnalytics,
  getSubcategoryCards,
  getFeedListingsByCategory,
  createListing,
  getMyListings,
  deleteListing,
  updateListing,
  setListingSoldState,
  restoreListing,
  getPromotionPlans,
  getPromotionRequests,
  requestListingPromotion,
  activateListingPromotion,
  reviewPromotionRequest,
  getSellerProSubscriptions,
  revokeSellerProSubscription,
  grantSellerProByNickname,
  syncCurrentProfileIntoListings,
  preserveCurrentProfileSellerPro,
  preserveCurrentProfileIdentityData,
  getCurrentSellerPhotoLimit,
  recordListingView,
  recordSellerProfileView,
  sortByPromotionPriority,
  queueCreateMode,
  consumeCreateMode,
  getPublishCategories,
  getFallbackImage
}
