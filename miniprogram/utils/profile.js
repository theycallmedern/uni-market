const STORAGE_KEY = 'userProfile'
const CUSTOM_LISTINGS_STORAGE_KEY = 'marketCustomListings'
const JOINED_AT_STORAGE_KEY = 'userProfileJoinedAt'
const universitiesStore = require('./universities')
const FIXED_CITY = 'Hangzhou'

const DEFAULT_PROFILE = {
  name: 'Misha',
  campus: 'Zhejiang University',
  city: FIXED_CITY,
  avatarUrl: '',
  wechat: '',
  bio: 'Your personal hub for saved items, published listings, and quick access to the student marketplace flow.'
}

function safeGetStorage(key, fallback = null) {
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

function cleanText(value, maxLength = 80) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function normalizeDateOnly(value) {
  const normalized = String(value || '').trim()
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : ''
}

function getTodayDateOnly() {
  return new Date().toISOString().slice(0, 10)
}

function getOldestCustomListingDate() {
  const listings = safeGetStorage(CUSTOM_LISTINGS_STORAGE_KEY, [])

  if (!Array.isArray(listings) || !listings.length) {
    return ''
  }

  const oldestDate = listings
    .map((listing) => String(listing && listing.createdAt ? listing.createdAt : '').slice(0, 10))
    .filter((date) => normalizeDateOnly(date))
    .sort()[0]

  return normalizeDateOnly(oldestDate)
}

function ensureJoinedAt(rawProfile = {}) {
  const storedJoinedAt = normalizeDateOnly(safeGetStorage(JOINED_AT_STORAGE_KEY, ''))
  const profileJoinedAt = normalizeDateOnly(rawProfile.joinedAt)
  const fallbackJoinedAt = getOldestCustomListingDate() || getTodayDateOnly()
  const joinedAt = storedJoinedAt || profileJoinedAt || fallbackJoinedAt

  if (joinedAt && joinedAt !== storedJoinedAt) {
    safeSetStorage(JOINED_AT_STORAGE_KEY, joinedAt)
  }

  return joinedAt
}

function formatMemberSince(joinedAt) {
  const normalized = normalizeDateOnly(joinedAt)

  if (!normalized) {
    return ''
  }

  const date = new Date(`${normalized}T00:00:00`)

  try {
    const formatted = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)

    return `On UniMarket since ${formatted}`
  } catch (error) {
    return `On UniMarket since ${normalized}`
  }
}

function inferWechatFromCustomListings() {
  const listings = safeGetStorage(CUSTOM_LISTINGS_STORAGE_KEY, [])
  if (!Array.isArray(listings)) {
    return ''
  }

  const firstWithWechat = listings.find(
    (listing) => listing && listing.seller && cleanText(listing.seller.wechat, 40)
  )

  if (!firstWithWechat || !firstWithWechat.seller) {
    return ''
  }

  return cleanText(firstWithWechat.seller.wechat, 40)
}

function normalizeProfile(rawProfile = {}) {
  const universityOptions = universitiesStore.HANGZHOU_UNIVERSITIES
  const campusIndex = universitiesStore.getUniversityIndex(rawProfile.campus || DEFAULT_PROFILE.campus, universityOptions)
  const joinedAt = ensureJoinedAt(rawProfile)

  return {
    name: cleanText(rawProfile.name || DEFAULT_PROFILE.name, 40) || DEFAULT_PROFILE.name,
    campus: universityOptions[campusIndex] || universityOptions[0] || DEFAULT_PROFILE.campus,
    city: FIXED_CITY,
    avatarUrl: cleanText(rawProfile.avatarUrl || '', 500),
    wechat: cleanText(rawProfile.wechat || '', 40),
    bio: cleanText(rawProfile.bio || DEFAULT_PROFILE.bio, 180) || DEFAULT_PROFILE.bio,
    joinedAt
  }
}

function getProfile() {
  const stored = safeGetStorage(STORAGE_KEY, null)
  const profile = normalizeProfile({
    ...DEFAULT_PROFILE,
    ...(stored || {})
  })

  if (!profile.wechat) {
    const inferredWechat = inferWechatFromCustomListings()
    if (inferredWechat) {
      profile.wechat = inferredWechat
      safeSetStorage(STORAGE_KEY, profile)
    }
  }

  return profile
}

function saveProfile(nextProfile) {
  const profile = normalizeProfile(nextProfile)
  safeSetStorage(STORAGE_KEY, profile)
  return profile
}

function getProfileInitial(profile) {
  const currentProfile = profile || getProfile()
  return String(currentProfile.name || 'U').slice(0, 1).toUpperCase()
}

module.exports = {
  getProfile,
  saveProfile,
  normalizeProfile,
  getProfileInitial,
  formatMemberSince
}
