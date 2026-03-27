function createMarketCommandService({
  listingHelpers,
  promotionHelpers,
  sellerHelpers,
  revokeSellerProSubscription,
  listingStatsStore,
  profileStatsStore
}) {
  function createListing(payload) {
    return listingHelpers.createListing(payload)
  }

  function getMyListings() {
    return listingHelpers.getMyListings()
  }

  function deleteListing(id) {
    return listingHelpers.deleteListing(id)
  }

  function updateListing(id, payload) {
    return listingHelpers.updateListing(id, payload)
  }

  function setListingSoldState(id, isSold, soldOnUniMarket = true) {
    return listingHelpers.setListingSoldState(id, isSold, soldOnUniMarket)
  }

  function restoreListing(id) {
    return listingHelpers.restoreListing(id)
  }

  function requestListingPromotion(id, planId = 'featured_1d', options = {}) {
    return promotionHelpers.requestListingPromotion(id, planId, options)
  }

  function activateListingPromotion(id, options = {}) {
    return promotionHelpers.activateListingPromotion(id, options)
  }

  function reviewPromotionRequest(requestId, action, options = {}) {
    return promotionHelpers.reviewPromotionRequest(requestId, action, options)
  }

  function grantSellerProByNickname(nickname, options = {}) {
    return promotionHelpers.grantSellerProByNickname(nickname, options)
  }

  function syncCurrentProfileIntoListings(previousProfile = null, nextProfile = null) {
    return sellerHelpers.syncCurrentProfileIntoListings(previousProfile, nextProfile)
  }

  function preserveCurrentProfileSellerPro(previousProfile = null, nextProfile = null) {
    return sellerHelpers.preserveCurrentProfileSellerPro(previousProfile, nextProfile)
  }

  function preserveCurrentProfileIdentityData(previousProfile = null, nextProfile = null) {
    return sellerHelpers.preserveCurrentProfileIdentityData(previousProfile, nextProfile)
  }

  function recordListingView(id) {
    return listingStatsStore.incrementViews(id)
  }

  function recordSellerProfileView(sellerKey) {
    return profileStatsStore.incrementViews(sellerKey)
  }

  function queueCreateMode(mode) {
    return listingHelpers.queueCreateMode(mode)
  }

  function consumeCreateMode() {
    return listingHelpers.consumeCreateMode()
  }

  return {
    createListing,
    getMyListings,
    deleteListing,
    updateListing,
    setListingSoldState,
    restoreListing,
    requestListingPromotion,
    activateListingPromotion,
    reviewPromotionRequest,
    revokeSellerProSubscription,
    grantSellerProByNickname,
    syncCurrentProfileIntoListings,
    preserveCurrentProfileSellerPro,
    preserveCurrentProfileIdentityData,
    recordListingView,
    recordSellerProfileView,
    queueCreateMode,
    consumeCreateMode
  }
}

module.exports = {
  createMarketCommandService
}
