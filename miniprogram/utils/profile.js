const STORAGE_KEY = 'userProfile'
const CUSTOM_LISTINGS_STORAGE_KEY = 'marketCustomListings'
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

  return {
    name: cleanText(rawProfile.name || DEFAULT_PROFILE.name, 40) || DEFAULT_PROFILE.name,
    campus: universityOptions[campusIndex] || universityOptions[0] || DEFAULT_PROFILE.campus,
    city: FIXED_CITY,
    avatarUrl: cleanText(rawProfile.avatarUrl || '', 500),
    wechat: cleanText(rawProfile.wechat || '', 40),
    bio: cleanText(rawProfile.bio || DEFAULT_PROFILE.bio, 180) || DEFAULT_PROFILE.bio
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
  getProfileInitial
}
