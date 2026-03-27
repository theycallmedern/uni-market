const visibilityStore = require('../../utils/visibility')
const remoteApi = require('./remote')

function syncRemotePreferences(preferences = {}) {
  return visibilityStore.setVisibilityPreferences(preferences)
}

module.exports = {
  get enabled() {
    return Boolean(remoteApi.visibility && remoteApi.visibility.enabled)
  },
  getSellerKeyFromListing(listing) {
    return visibilityStore.getSellerKeyFromListing(listing)
  },
  getHiddenListingIds() {
    return visibilityStore.getHiddenListingIds()
  },
  getBlockedSellerKeys() {
    return visibilityStore.getBlockedSellerKeys()
  },
  isListingHidden(listingId) {
    return visibilityStore.isListingHidden(listingId)
  },
  isSellerBlocked(sellerKey) {
    return visibilityStore.isSellerBlocked(sellerKey)
  },
  hideListing(listingId) {
    const hiddenListingIds = visibilityStore.hideListing(listingId)

    if (remoteApi.visibility && remoteApi.visibility.enabled) {
      remoteApi.visibility.hideListing(listingId)
        .then((preferences) => {
          syncRemotePreferences(preferences)
        })
        .catch(() => {})
    }

    return hiddenListingIds
  },
  blockSeller(sellerKey) {
    const blockedSellerKeys = visibilityStore.blockSeller(sellerKey)

    if (remoteApi.visibility && remoteApi.visibility.enabled) {
      remoteApi.visibility.blockSeller(sellerKey)
        .then((preferences) => {
          syncRemotePreferences(preferences)
        })
        .catch(() => {})
    }

    return blockedSellerKeys
  },
  isListingVisible(listing) {
    return visibilityStore.isListingVisible(listing)
  },
  filterVisibleListings(listings) {
    return visibilityStore.filterVisibleListings(listings)
  },
  hydrateVisibilityPreferences() {
    return visibilityStore.hydrateVisibilityPreferences()
  },
  async syncPreferences() {
    if (remoteApi.visibility && remoteApi.visibility.enabled) {
      try {
        const preferences = await remoteApi.visibility.getPreferences()
        return syncRemotePreferences(preferences)
      } catch (error) {
        return visibilityStore.hydrateVisibilityPreferences()
      }
    }

    return visibilityStore.hydrateVisibilityPreferences()
  }
}
