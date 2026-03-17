const HIDDEN_LISTING_IDS_STORAGE_KEY = 'marketHiddenListingIds'
const BLOCKED_SELLER_KEYS_STORAGE_KEY = 'marketBlockedSellerKeys'

function safeGetStorage(key, fallback) {
  if (typeof wx === 'undefined' || !wx.getStorageSync) {
    return fallback
  }

  try {
    const value = wx.getStorageSync(key)
    return value === '' || value === undefined || value === null ? fallback : value
  } catch (error) {
    return fallback
  }
}

function safeSetStorage(key, value) {
  if (typeof wx === 'undefined' || !wx.setStorageSync) {
    return
  }

  try {
    wx.setStorageSync(key, value)
  } catch (error) {}
}

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
    seller.wechat || `${seller.name || ''} ${listing.university || ''} ${listing.location || ''}`
  )
}

function getHiddenListingIds() {
  return normalizeList(safeGetStorage(HIDDEN_LISTING_IDS_STORAGE_KEY, []))
}

function getBlockedSellerKeys() {
  return normalizeList(safeGetStorage(BLOCKED_SELLER_KEYS_STORAGE_KEY, []))
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
  safeSetStorage(HIDDEN_LISTING_IDS_STORAGE_KEY, nextIds)
  return nextIds
}

function blockSeller(sellerKey) {
  const normalizedKey = toLookupKey(sellerKey)

  if (!normalizedKey) {
    return getBlockedSellerKeys()
  }

  const nextKeys = Array.from(new Set([...getBlockedSellerKeys(), normalizedKey]))
  safeSetStorage(BLOCKED_SELLER_KEYS_STORAGE_KEY, nextKeys)
  return nextKeys
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

module.exports = {
  getSellerKeyFromListing,
  getHiddenListingIds,
  getBlockedSellerKeys,
  isListingHidden,
  isSellerBlocked,
  hideListing,
  blockSeller,
  isListingVisible,
  filterVisibleListings
}
