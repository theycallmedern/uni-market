const STORAGE_KEY = 'savedListingIds'

function getSavedListingIds() {
  return wx.getStorageSync(STORAGE_KEY) || []
}

function setSavedListingIds(ids) {
  wx.setStorageSync(STORAGE_KEY, ids)
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

module.exports = {
  getSavedListingIds,
  isListingSaved,
  toggleSavedListing,
  decorateListingsWithSaved
}
