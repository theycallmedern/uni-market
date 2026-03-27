const STORAGE_KEY = 'savedListingIds'
const listingStats = require('./listing-stats')

function canUseStorage() {
  return typeof wx !== 'undefined'
    && wx
    && typeof wx.getStorageSync === 'function'
    && typeof wx.setStorageSync === 'function'
}

function getSavedListingIds() {
  if (!canUseStorage()) {
    return []
  }

  return wx.getStorageSync(STORAGE_KEY) || []
}

function setSavedListingIds(ids) {
  if (!canUseStorage()) {
    return ids
  }

  wx.setStorageSync(STORAGE_KEY, ids)
  return ids
}

function isListingSaved(id) {
  return getSavedListingIds().includes(String(id))
}

function toggleSavedListing(id) {
  const normalizedId = String(id)
  const current = getSavedListingIds()
  const exists = current.includes(normalizedId)
  const next = exists
    ? current.filter((item) => item !== normalizedId)
    : current.concat(normalizedId)

  setSavedListingIds(next)
  listingStats.updateSaveState(normalizedId, !exists)

  return {
    isSaved: !exists,
    ids: next
  }
}

function decorateListingsWithSaved(listings) {
  const savedIds = getSavedListingIds()
  return listings.map((listing) => ({
    ...listing,
    isSaved: savedIds.includes(String(listing.id))
  }))
}

function removeSavedListings(idsToRemove) {
  const targets = Array.isArray(idsToRemove)
    ? idsToRemove.map((id) => String(id))
    : [String(idsToRemove)]
  const next = getSavedListingIds().filter((id) => !targets.includes(String(id)))
  setSavedListingIds(next)
  return next
}

function clearSavedListings() {
  setSavedListingIds([])
  return []
}

function hydrateSavedListingIds() {
  return getSavedListingIds()
}

module.exports = {
  getSavedListingIds,
  setSavedListingIds,
  isListingSaved,
  toggleSavedListing,
  decorateListingsWithSaved,
  removeSavedListings,
  clearSavedListings,
  hydrateSavedListingIds
}
