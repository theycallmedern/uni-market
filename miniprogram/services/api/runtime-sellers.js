const remoteApi = require('./remote')
const sellersApi = require('./sellers')

module.exports = {
  get enabled() {
    return Boolean(remoteApi.sellers && remoteApi.sellers.enabled)
  },
  getSellerKey(listing) {
    return sellersApi.getSellerKey(listing)
  },
  getOwnProfile() {
    return sellersApi.getOwnProfile()
  },
  getProfileByListingId(listingId, options = {}) {
    if (remoteApi.sellers && remoteApi.sellers.enabled) {
      return remoteApi.sellers.getProfileByListingId(listingId, options)
    }

    return sellersApi.getProfileByListingId(listingId, options)
  },
  syncCurrentProfileIntoListings(previousProfile = null, nextProfile = null) {
    return sellersApi.syncCurrentProfileIntoListings(previousProfile, nextProfile)
  },
  preserveCurrentProfileSellerPro(previousProfile = null, nextProfile = null) {
    return sellersApi.preserveCurrentProfileSellerPro(previousProfile, nextProfile)
  },
  preserveCurrentProfileIdentityData(previousProfile = null, nextProfile = null) {
    return sellersApi.preserveCurrentProfileIdentityData(previousProfile, nextProfile)
  },
  recordProfileView(sellerKey) {
    if (remoteApi.sellers && remoteApi.sellers.enabled) {
      return remoteApi.sellers.recordProfileView(sellerKey)
    }

    return sellersApi.recordProfileView(sellerKey)
  }
}
