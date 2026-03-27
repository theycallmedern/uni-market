function createMarketAdminService({
  storage,
  normalizePromotionRequest,
  normalizeSellerProSubscription
}) {
  const PROMOTION_REQUESTS_STORAGE_KEY = 'marketPromotionRequests'
  const SELLER_PRO_STORAGE_KEY = 'marketSellerProSubscriptions'

  function getStoredPromotionRequests() {
    const stored = storage.safeGetStorage(PROMOTION_REQUESTS_STORAGE_KEY, [])
    return (Array.isArray(stored) ? stored : [])
      .map((request) => normalizePromotionRequest(request))
      .filter((request) => request.id && request.listingId)
  }

  function savePromotionRequests(requests) {
    storage.safeSetStorage(PROMOTION_REQUESTS_STORAGE_KEY, requests)
  }

  function getStoredSellerProSubscriptions() {
    const stored = storage.safeGetStorage(SELLER_PRO_STORAGE_KEY, [])
    return (Array.isArray(stored) ? stored : [])
      .map((subscription) => normalizeSellerProSubscription(subscription))
      .filter((subscription) => subscription.id && (subscription.sellerKey || subscription.nicknameKey || subscription.wechatKey))
  }

  function saveSellerProSubscriptions(subscriptions) {
    storage.safeSetStorage(SELLER_PRO_STORAGE_KEY, subscriptions)
  }

  return {
    getStoredPromotionRequests,
    savePromotionRequests,
    getStoredSellerProSubscriptions,
    saveSellerProSubscriptions
  }
}

module.exports = {
  createMarketAdminService
}
