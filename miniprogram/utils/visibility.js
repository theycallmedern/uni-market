const HIDDEN_LISTING_IDS_STORAGE_KEY = 'marketHiddenListingIds'
const BLOCKED_SELLER_KEYS_STORAGE_KEY = 'marketBlockedSellerKeys'
const storage = require('./storage')

function normalizeList(value) {
  return Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : []
}

function toLookupKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function getSellerKeyFromListing(listing) {
  if (!listing) {
    return ''
  }

  const seller = listing.seller || {}
  return toLookupKey(
    seller.id || seller.wechat || `${seller.name || ''} ${listing.university || ''} ${listing.location || ''}`
  )
}

function getHiddenListingIds() {
  return normalizeList(storage.safeGetStorage(HIDDEN_LISTING_IDS_STORAGE_KEY, []))
}

function getBlockedSellerKeys() {
  return normalizeList(storage.safeGetStorage(BLOCKED_SELLER_KEYS_STORAGE_KEY, []))
}

function setHiddenListingIds(ids) {
  const normalizedIds = normalizeList(ids)
  storage.safeSetStorage(HIDDEN_LISTING_IDS_STORAGE_KEY, normalizedIds)
  return normalizedIds
}

function setBlockedSellerKeys(keys) {
  const normalizedKeys = normalizeList(keys).map((item) => toLookupKey(item))
  storage.safeSetStorage(BLOCKED_SELLER_KEYS_STORAGE_KEY, normalizedKeys)
  return normalizedKeys
}

function setVisibilityPreferences(preferences = {}) {
  const hiddenListingIds = setHiddenListingIds(preferences.hiddenListingIds || [])
  const blockedSellerKeys = setBlockedSellerKeys(preferences.blockedSellerKeys || [])

  return {
    hiddenListingIds,
    blockedSellerKeys
  }
}

function isListingHidden(listingId) {
  return getHiddenListingIds().includes(String(listingId))
}

function isSellerBlocked(sellerKey) {
  return getBlockedSellerKeys().includes(toLookupKey(sellerKey))
}

function hideListing(listingId) {
  const targetId = String(listingId)
  const nextIds = Array.from(new Set([...getHiddenListingIds(), targetId]))
  return setHiddenListingIds(nextIds)
}

function blockSeller(sellerKey) {
  const normalizedKey = toLookupKey(sellerKey)

  if (!normalizedKey) {
    return getBlockedSellerKeys()
  }

  const nextKeys = Array.from(new Set([...getBlockedSellerKeys(), normalizedKey]))
  return setBlockedSellerKeys(nextKeys)
}

function isListingVisible(listing) {
  if (!listing) {
    return false
  }

  return !isListingHidden(listing.id) && !isSellerBlocked(getSellerKeyFromListing(listing))
}

function filterVisibleListings(listings) {
  return (Array.isArray(listings) ? listings : []).filter(isListingVisible)
}

function hydrateVisibilityPreferences() {
  return {
    hiddenListingIds: getHiddenListingIds(),
    blockedSellerKeys: getBlockedSellerKeys()
  }
}

module.exports = {
  getSellerKeyFromListing,
  getHiddenListingIds,
  getBlockedSellerKeys,
  setHiddenListingIds,
  setBlockedSellerKeys,
  setVisibilityPreferences,
  isListingHidden,
  isSellerBlocked,
  hideListing,
  blockSeller,
  isListingVisible,
  filterVisibleListings,
  hydrateVisibilityPreferences
}
