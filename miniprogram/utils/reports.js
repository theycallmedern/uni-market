const STORAGE_KEY = 'listingReports'

function normalizeStoredReport(report = {}) {
  const targetType = report.targetType || 'listing'

  return {
    ...report,
    targetType,
    listingId: targetType === 'listing' ? String(report.listingId || '') : '',
    profileKey: targetType === 'profile' ? String(report.profileKey || '') : '',
    profileName: targetType === 'profile' ? report.profileName || '' : '',
    sourceListingId: report.sourceListingId ? String(report.sourceListingId) : ''
  }
}

function safeGetStorage(key, fallback = []) {
  if (typeof wx === 'undefined' || !wx.getStorageSync) {
    return fallback
  }

  try {
    const value = wx.getStorageSync(key)
    return value === '' || typeof value === 'undefined' ? fallback : value
  } catch (error) {
    return fallback
  }
}

function safeSetStorage(key, value) {
  if (typeof wx === 'undefined' || !wx.setStorageSync) {
    return
  }

  try {
    wx.setStorageSync(key, value)
  } catch (error) {}
}

function getReports() {
  return safeGetStorage(STORAGE_KEY, []).map((report) => normalizeStoredReport(report))
}

function saveReports(reports) {
  safeSetStorage(STORAGE_KEY, reports)
}

function hasReportedListing(listingId) {
  const normalizedId = String(listingId)
  return getReports().some((report) => report.targetType === 'listing' && String(report.listingId) === normalizedId)
}

function hasReportedProfile(profileKey) {
  const normalizedKey = String(profileKey || '')
  return getReports().some((report) => report.targetType === 'profile' && String(report.profileKey) === normalizedKey)
}

function createReport(payload) {
  const reports = getReports()
  const report = {
    id: Date.now(),
    targetType: 'listing',
    listingId: String(payload.listingId),
    listingTitle: payload.listingTitle || '',
    reason: payload.reason || 'Other',
    note: payload.note || '',
    createdAt: new Date().toISOString(),
    status: 'pending'
  }

  saveReports([report, ...reports])

  return report
}

function createProfileReport(payload) {
  const reports = getReports()
  const report = {
    id: Date.now(),
    targetType: 'profile',
    profileKey: String(payload.profileKey || ''),
    profileName: payload.profileName || '',
    sourceListingId: payload.sourceListingId ? String(payload.sourceListingId) : '',
    reason: payload.reason || 'Other',
    note: payload.note || '',
    createdAt: new Date().toISOString(),
    status: 'pending'
  }

  saveReports([report, ...reports])

  return report
}

function updateReportStatus(reportId, status) {
  const targetId = Number(reportId)
  const reports = getReports()
  const nextReports = reports.map((report) =>
    Number(report.id) === targetId
      ? { ...report, status, updatedAt: new Date().toISOString() }
      : report
  )

  saveReports(nextReports)
  return nextReports.find((report) => Number(report.id) === targetId) || null
}

function getListingModerationMap() {
  const reports = getReports()
  const map = {}

  reports.forEach((report) => {
    if ((report.targetType || 'listing') !== 'listing') {
      return
    }

    const listingId = String(report.listingId || '')
    if (!listingId) {
      return
    }

    const status = report.status || 'pending'
    const current = map[listingId] || 'clear'

    if (status === 'resolved') {
      map[listingId] = 'resolved'
      return
    }

    if (current === 'resolved') {
      return
    }

    if (status === 'reviewing') {
      map[listingId] = 'reviewing'
      return
    }

    if (status === 'pending' && current !== 'reviewing') {
      map[listingId] = 'pending'
      return
    }

    if (status === 'dismissed' && current === 'clear') {
      map[listingId] = 'dismissed'
    }
  })

  return map
}

function getListingModerationStatus(listingId) {
  const map = getListingModerationMap()
  return map[String(listingId)] || 'clear'
}

function isListingHiddenByModeration(listingId) {
  return getListingModerationStatus(listingId) === 'resolved'
}

function decorateListingsWithModeration(listings) {
  const map = getListingModerationMap()

  return listings.map((listing) => {
    const moderationStatus = map[String(listing.id)] || 'clear'

    return {
      ...listing,
      moderationStatus,
      isHiddenByModeration: moderationStatus === 'resolved'
    }
  })
}

function filterVisibleListings(listings) {
  return decorateListingsWithModeration(listings).filter((listing) => !listing.isHiddenByModeration)
}

module.exports = {
  getReports,
  hasReportedListing,
  hasReportedProfile,
  createReport,
  createProfileReport,
  updateReportStatus,
  getListingModerationStatus,
  isListingHiddenByModeration,
  decorateListingsWithModeration,
  filterVisibleListings
}
