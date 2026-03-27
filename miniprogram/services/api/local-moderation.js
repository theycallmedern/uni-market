const market = require('../../data/market')

function toPromise(value) {
  if (value && typeof value.then === 'function') {
    return value
  }

  return Promise.resolve(value)
}

module.exports = {
  getReports() {
    return []
  },
  createReport(payload = {}) {
    const reportsStore = require('../../utils/reports')
    const targetType = String(payload.targetType || 'listing')

    if (targetType === 'profile') {
      return reportsStore.createProfileReport(payload)
    }

    return reportsStore.createReport(payload)
  },
  updateReportStatus(reportId, status) {
    const reportsStore = require('../../utils/reports')
    return reportsStore.updateReportStatus(reportId, status)
  },
  getPromotionRequests(options = {}) {
    return toPromise(market.getPromotionRequests(options))
  },
  reviewPromotionRequest(requestId, action, options = {}) {
    return toPromise(market.reviewPromotionRequest(requestId, action, options))
  },
  getSellerProSubscriptions(options = {}) {
    const subscriptions = market.getSellerProSubscriptions()
    const targetStatus = String(options.status || '').trim().toLowerCase()

    if (!targetStatus) {
      return toPromise(subscriptions)
    }

    return toPromise(subscriptions.filter((subscription) => String(subscription.status || '').trim().toLowerCase() === targetStatus))
  },
  grantSellerProByNickname(nickname, options = {}) {
    return toPromise(market.grantSellerProByNickname(nickname, options))
  },
  reviewSellerProSubscription() {
    return Promise.resolve(null)
  },
  revokeSellerProSubscription(id) {
    return toPromise(market.revokeSellerProSubscription(id))
  }
}
