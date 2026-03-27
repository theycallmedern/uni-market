const market = require('../../data/market')

module.exports = {
  getSellerKey(listing) {
    return market.getSellerKey(listing)
  },
  getOwnProfile() {
    return market.getOwnSellerProfile()
  },
  getProfileByListingId(listingId, options = {}) {
    return market.getSellerProfileByListingId(listingId, options)
  },
  syncCurrentProfileIntoListings(previousProfile = null, nextProfile = null) {
    return market.syncCurrentProfileIntoListings(previousProfile, nextProfile)
  },
  preserveCurrentProfileSellerPro(previousProfile = null, nextProfile = null) {
    return market.preserveCurrentProfileSellerPro(previousProfile, nextProfile)
  },
  preserveCurrentProfileIdentityData(previousProfile = null, nextProfile = null) {
    return market.preserveCurrentProfileIdentityData(previousProfile, nextProfile)
  },
  recordProfileView(sellerKey) {
    return market.recordSellerProfileView(sellerKey)
  }
}
