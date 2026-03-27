const STORAGE_KEY = 'listingReports'
const storage = require('./storage')

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

function getReports() {
  return storage.safeGetStorage(STORAGE_KEY, []).map((report) => normalizeStoredReport(report))
}

function saveReports(reports) {
  storage.safeSetStorage(STORAGE_KEY, reports)
}

function replaceReports(reports = []) {
  const normalizedReports = (Array.isArray(reports) ? reports : []).map((report) => normalizeStoredReport(report))
  saveReports(normalizedReports)
  return normalizedReports
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

function remapProfileKey(previousKeys = [], nextKey = '') {
  const normalizedNextKey = String(nextKey || '').trim().toLowerCase()
  const aliases = Array.from(new Set((Array.isArray(previousKeys) ? previousKeys : [])
    .map((value) => String(value || '').trim().toLowerCase())
    .filter(Boolean)))

  if (!normalizedNextKey || !aliases.length) {
    return 0
  }

  const reports = getReports()
  let changed = 0
  const nextReports = reports.map((report) => {
    if (report.targetType !== 'profile') {
      return report
    }

    const profileKey = String(report.profileKey || '').trim().toLowerCase()
    if (!aliases.includes(profileKey)) {
      return report
    }

    if (profileKey !== normalizedNextKey) {
      changed += 1
    }

    return {
      ...report,
      profileKey: normalizedNextKey
    }
  })

  if (changed > 0) {
    saveReports(nextReports)
  }

  return changed
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

module.exports = {
  getReports,
  replaceReports,
  hasReportedListing,
  hasReportedProfile,
  createReport,
  createProfileReport,
  updateReportStatus,
  decorateListingsWithModeration,
  remapProfileKey
}
