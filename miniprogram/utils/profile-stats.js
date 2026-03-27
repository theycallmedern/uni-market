const storage = require('./storage')

const STORAGE_KEY = 'marketSellerProfileStats'
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

  return {
    views: normalizeNumber(rawEntry.views),
    recentViewEvents,
    recentViews: countRecentEvents(recentViewEvents)
  }
}

function toProfileKey(value) {
  return String(value || '').trim().toLowerCase()
}

function getStatsMap() {
  const raw = storage.safeGetStorage(STORAGE_KEY, {})
  const source = raw && typeof raw === 'object' ? raw : {}

  return Object.keys(source).reduce((acc, key) => {
    acc[toProfileKey(key)] = normalizeEntry(source[key])
    return acc
  }, {})
}

function saveStatsMap(statsMap) {
  storage.safeSetStorage(STORAGE_KEY, statsMap)
}

function updateProfileStats(sellerKey, updater) {
  const profileKey = toProfileKey(sellerKey)

  if (!profileKey) {
    return null
  }

  const currentMap = getStatsMap()
  const current = currentMap[profileKey] || normalizeEntry()
  const next = normalizeEntry(typeof updater === 'function' ? updater(current) : current)

  currentMap[profileKey] = next
  saveStatsMap(currentMap)
  return next
}

function incrementViews(sellerKey, step = 1) {
  const viewsStep = normalizeNumber(step) || 1

  return updateProfileStats(sellerKey, (current) => ({
    ...current,
    views: current.views + viewsStep,
    recentViewEvents: current.recentViewEvents.concat(buildEventBatch(viewsStep))
  }))
}

function getProfileStats(sellerKey) {
  const profileKey = toProfileKey(sellerKey)

  if (!profileKey) {
    return normalizeEntry()
  }

  const statsMap = getStatsMap()
  return normalizeEntry(statsMap[profileKey] || {})
}

function remapProfileKey(previousKeys = [], nextKey = '') {
  const normalizedNextKey = toProfileKey(nextKey)
  const aliases = Array.from(new Set((Array.isArray(previousKeys) ? previousKeys : [])
    .map((value) => toProfileKey(value))
    .filter(Boolean)))

  if (!normalizedNextKey || !aliases.length) {
    return false
  }

  const statsMap = getStatsMap()
  const merged = aliases.reduce((acc, key) => {
    const entry = normalizeEntry(statsMap[key] || {})
    acc.views += Number(entry.views || 0)
    acc.recentViewEvents = acc.recentViewEvents.concat(entry.recentViewEvents || [])

    if (key !== normalizedNextKey) {
      delete statsMap[key]
    }

    return acc
  }, normalizeEntry(statsMap[normalizedNextKey] || {}))

  statsMap[normalizedNextKey] = normalizeEntry(merged)
  saveStatsMap(statsMap)
  return true
}

module.exports = {
  incrementViews,
  getProfileStats,
  remapProfileKey
}
