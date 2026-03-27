const localModeration = require('./local-moderation')
const remoteApi = require('./remote')

module.exports = {
  get enabled() {
    return Boolean(remoteApi.moderation && remoteApi.moderation.enabled)
  },
  async getPromotionRequests(options = {}) {
    if (this.enabled) {
      try {
        return await remoteApi.moderation.getPromotionRequests(options)
      } catch (error) {}
    }

    return localModeration.getPromotionRequests(options)
  },
  async reviewPromotionRequest(requestId, action, options = {}) {
    if (this.enabled) {
      try {
        return await remoteApi.moderation.reviewPromotionRequest(requestId, action, options)
      } catch (error) {}
    }

    return localModeration.reviewPromotionRequest(requestId, action, options)
  },
  async getSellerProSubscriptions(options = {}) {
    if (this.enabled) {
      try {
        return await remoteApi.moderation.getSellerProSubscriptions(options)
      } catch (error) {}
    }

    return localModeration.getSellerProSubscriptions(options)
  },
  async grantSellerProByNickname(nickname, options = {}) {
    if (this.enabled) {
      try {
        return await remoteApi.moderation.grantSellerProByNickname(nickname, options)
      } catch (error) {}
    }

    return localModeration.grantSellerProByNickname(nickname, options)
  },
  async reviewSellerProSubscription(id, action, options = {}) {
    if (this.enabled) {
      try {
        return await remoteApi.moderation.reviewSellerProSubscription(id, action, options)
      } catch (error) {}
    }

    return localModeration.reviewSellerProSubscription(id, action, options)
  },
  async revokeSellerProSubscription(id) {
    if (this.enabled) {
      try {
        return await remoteApi.moderation.revokeSellerProSubscription(id)
      } catch (error) {}
    }

    return localModeration.revokeSellerProSubscription(id)
  }
}
