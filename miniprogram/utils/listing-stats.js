const storage = require('./storage')

const STORAGE_KEY = 'marketListingEngagementStats'
const DAY_MS = 24 * 60 * 60 * 1000
const RECENT_WINDOW_DAYS = 7
const RETENTION_WINDOW_DAYS = 30

function normalizeNumber(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric < 0) {
    return 0
  }

  return Math.floor(numeric)
}

function normalizeEventList(rawEvents = []) {
  const now = Date.now()
  const retentionThreshold = now - (RETENTION_WINDOW_DAYS * DAY_MS)

  return (Array.isArray(rawEvents) ? rawEvents : [])
    .map((value) => String(value || '').trim())
    .filter((value) => {
      const timestamp = new Date(value).getTime()
      return Number.isFinite(timestamp) && timestamp >= retentionThreshold
    })
}

function buildEventBatch(count = 1) {
  const size = normalizeNumber(count) || 1
  const nowIso = new Date().toISOString()
  return Array.from({ length: size }, () => nowIso)
}

function countRecentEvents(events = [], days = RECENT_WINDOW_DAYS) {
  const threshold = Date.now() - ((normalizeNumber(days) || RECENT_WINDOW_DAYS) * DAY_MS)

  return normalizeEventList(events).filter((value) => new Date(value).getTime() >= threshold).length
}

function normalizeEntry(rawEntry = {}) {
  const recentViewEvents = normalizeEventList(rawEntry.recentViewEvents)
  const recentSaveEvents = normalizeEventList(rawEntry.recentSaveEvents)

  return {
    views: normalizeNumber(rawEntry.views),
    saves: normalizeNumber(rawEntry.saves),
    recentViewEvents,
    recentSaveEvents,
    recentViews: countRecentEvents(recentViewEvents),
    recentSaves: countRecentEvents(recentSaveEvents)
  }
}

function getStatsMap() {
  const raw = storage.safeGetStorage(STORAGE_KEY, {})
  const source = raw && typeof raw === 'object' ? raw : {}

  return Object.keys(source).reduce((acc, id) => {
    acc[String(id)] = normalizeEntry(source[id])
    return acc
  }, {})
}

function saveStatsMap(statsMap) {
  storage.safeSetStorage(STORAGE_KEY, statsMap)
}

function updateListingStats(id, updater) {
  const listingId = String(id || '')
  if (!listingId) {
    return null
  }

  const currentMap = getStatsMap()
  const current = currentMap[listingId] || normalizeEntry()
  const next = normalizeEntry(typeof updater === 'function' ? updater(current) : current)

  currentMap[listingId] = next
  saveStatsMap(currentMap)
  return next
}

function incrementViews(id, step = 1) {
  const viewsStep = normalizeNumber(step) || 1
  return updateListingStats(id, (current) => ({
    ...current,
    views: current.views + viewsStep,
    recentViewEvents: current.recentViewEvents.concat(buildEventBatch(viewsStep))
  }))
}

function updateSaveState(id, isSaved) {
  return updateListingStats(id, (current) => ({
    ...current,
    saves: isSaved ? current.saves + 1 : Math.max(0, current.saves - 1),
    recentSaveEvents: isSaved
      ? current.recentSaveEvents.concat(buildEventBatch(1))
      : current.recentSaveEvents
  }))
}

function getListingStats(id) {
  const listingId = String(id || '')
  if (!listingId) {
    return normalizeEntry()
  }

  const statsMap = getStatsMap()
  return normalizeEntry(statsMap[listingId] || {})
}

function getListingsAggregateStats(listings = []) {
  return (Array.isArray(listings) ? listings : []).reduce((acc, listing) => {
    const stats = getListingStats(listing && listing.id)
    acc.views += stats.views
    acc.saves += stats.saves
    acc.recentViews += stats.recentViews
    acc.recentSaves += stats.recentSaves
    return acc
  }, { views: 0, saves: 0, recentViews: 0, recentSaves: 0 })
}

module.exports = {
  incrementViews,
  updateSaveState,
  getListingStats,
  getListingsAggregateStats
}
