const STORAGE_KEY = 'userProfile'
const CUSTOM_LISTINGS_STORAGE_KEY = 'marketCustomListings'
const JOINED_AT_STORAGE_KEY = 'userProfileJoinedAt'
const universitiesStore = require('./universities')
const storage = require('./storage')
const validation = require('./validation')
const FIXED_CITY = 'Hangzhou'
const PROFILE_NAME_MAX_LENGTH = 40
const PROFILE_BIO_MAX_LENGTH = 180
const WECHAT_MIN_LENGTH = validation.WECHAT_MIN_LENGTH
const WECHAT_MAX_LENGTH = validation.WECHAT_MAX_LENGTH

const DEFAULT_PROFILE = {
  name: 'Misha',
  campus: 'Zhejiang University',
  city: FIXED_CITY,
  avatarUrl: '',
  wechat: '',
  bio: 'Your personal hub for saved items, published listings, and quick access to the student marketplace flow.'
}

function cleanText(value, maxLength = 80) {
  return validation.sanitizeSingleLine(value, maxLength)
}

function sanitizeProfileName(value) {
  return cleanText(value, PROFILE_NAME_MAX_LENGTH)
}

function sanitizeProfileBio(value) {
  return cleanText(value, PROFILE_BIO_MAX_LENGTH)
}

function sanitizeWechatId(value) {
  return validation.sanitizeWeChatId(value, WECHAT_MAX_LENGTH)
}

function isValidWechatId(wechat) {
  return validation.isValidWeChatId(wechat, {
    allowEmpty: true,
    minLength: WECHAT_MIN_LENGTH,
    maxLength: WECHAT_MAX_LENGTH
  })
}

function normalizeDateOnly(value) {
  const normalized = String(value || '').trim()
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : ''
}

function getTodayDateOnly() {
  return new Date().toISOString().slice(0, 10)
}

function getOldestCustomListingDate() {
  const listings = storage.safeGetStorage(CUSTOM_LISTINGS_STORAGE_KEY, [])

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
  const storedJoinedAt = normalizeDateOnly(storage.safeGetStorage(JOINED_AT_STORAGE_KEY, ''))
  const profileJoinedAt = normalizeDateOnly(rawProfile.joinedAt)
  const fallbackJoinedAt = getOldestCustomListingDate() || getTodayDateOnly()
  const joinedAt = storedJoinedAt || profileJoinedAt || fallbackJoinedAt

  if (joinedAt && joinedAt !== storedJoinedAt) {
    storage.safeSetStorage(JOINED_AT_STORAGE_KEY, joinedAt)
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
  const listings = storage.safeGetStorage(CUSTOM_LISTINGS_STORAGE_KEY, [])
  if (!Array.isArray(listings)) {
    return ''
  }

  const firstWithWechat = listings.find(
    (listing) => listing && listing.seller && sanitizeWechatId(listing.seller.wechat)
  )

  if (!firstWithWechat || !firstWithWechat.seller) {
    return ''
  }

  return sanitizeWechatId(firstWithWechat.seller.wechat)
}

function normalizeProfile(rawProfile = {}) {
  const universityOptions = universitiesStore.HANGZHOU_UNIVERSITIES
  const campusIndex = universitiesStore.getUniversityIndex(rawProfile.campus || DEFAULT_PROFILE.campus, universityOptions)
  const joinedAt = ensureJoinedAt(rawProfile)

  return {
    name: sanitizeProfileName(rawProfile.name || DEFAULT_PROFILE.name) || DEFAULT_PROFILE.name,
    campus: universityOptions[campusIndex] || universityOptions[0] || DEFAULT_PROFILE.campus,
    city: FIXED_CITY,
    avatarUrl: cleanText(rawProfile.avatarUrl || '', 500),
    wechat: sanitizeWechatId(rawProfile.wechat || ''),
    bio: sanitizeProfileBio(rawProfile.bio || DEFAULT_PROFILE.bio) || DEFAULT_PROFILE.bio,
    joinedAt
  }
}

function getProfile() {
  const stored = storage.safeGetStorage(STORAGE_KEY, null)
  const profile = normalizeProfile({
    ...DEFAULT_PROFILE,
    ...(stored || {})
  })

  if (!profile.wechat) {
    const inferredWechat = inferWechatFromCustomListings()
    if (inferredWechat) {
      profile.wechat = inferredWechat
      storage.safeSetStorage(STORAGE_KEY, profile)
    }
  }

  return profile
}

function saveProfile(nextProfile) {
  const profile = normalizeProfile(nextProfile)
  storage.safeSetStorage(STORAGE_KEY, profile)
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
  formatMemberSince,
  sanitizeProfileName,
  sanitizeProfileBio,
  sanitizeWechatId,
  isValidWechatId,
  WECHAT_MIN_LENGTH,
  WECHAT_MAX_LENGTH
}
