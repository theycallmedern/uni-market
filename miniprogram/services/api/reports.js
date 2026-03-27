const reportsStore = require('../../utils/reports')
const remoteApi = require('./remote')

function mirrorReportToLocalCache(payload = {}) {
  const targetType = String(payload.targetType || 'listing')

  if (targetType === 'profile') {
    return reportsStore.createProfileReport(payload)
  }

  return reportsStore.createReport(payload)
}

module.exports = {
  get enabled() {
    return Boolean(remoteApi.moderation && remoteApi.moderation.enabled)
  },
  getReports() {
    return reportsStore.getReports()
  },
  async getModerationReports() {
    if (this.enabled) {
      try {
        const reports = await remoteApi.moderation.getReports()
        return reportsStore.replaceReports(reports)
      } catch (error) {}
    }

    return reportsStore.getReports()
  },
  hasReportedListing(listingId) {
    return reportsStore.hasReportedListing(listingId)
  },
  hasReportedProfile(profileKey) {
    return reportsStore.hasReportedProfile(profileKey)
  },
  createReport(payload = {}) {
    return reportsStore.createReport(payload)
  },
  async submitReport(payload = {}) {
    if (this.enabled) {
      try {
        const result = await remoteApi.moderation.createReport(payload)
        if (result) {
          mirrorReportToLocalCache(payload)
        }
        return result
      } catch (error) {}
    }

    return mirrorReportToLocalCache(payload)
  },
  createProfileReport(payload = {}) {
    return reportsStore.createProfileReport(payload)
  },
  async submitProfileReport(payload = {}) {
    const normalizedPayload = {
      ...payload,
      targetType: 'profile'
    }

    return this.submitReport(normalizedPayload)
  },
  updateReportStatus(reportId, status) {
    return reportsStore.updateReportStatus(reportId, status)
  },
  async updateModerationReportStatus(reportId, status) {
    if (this.enabled) {
      try {
        const result = await remoteApi.moderation.updateReportStatus(reportId, status)
        reportsStore.updateReportStatus(reportId, status)
        return result
      } catch (error) {}
    }

    return reportsStore.updateReportStatus(reportId, status)
  },
  decorateListingsWithModeration(listings = []) {
    return reportsStore.decorateListingsWithModeration(listings)
  },
  remapProfileKey(previousKeys = [], nextKey = '') {
    return reportsStore.remapProfileKey(previousKeys, nextKey)
  }
}
