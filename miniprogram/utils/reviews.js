const REVIEWS_STORAGE_KEY = 'marketSellerReviews'
const REVIEW_UNLOCKS_STORAGE_KEY = 'marketReviewUnlocks'

function safeGetStorage(key, fallback) {
  if (typeof wx === 'undefined' || !wx.getStorageSync) {
    return fallback
  }

  try {
    const value = wx.getStorageSync(key)
    return value === '' || value === undefined || value === null ? fallback : value
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

function cleanText(value, maxLength = 200) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function normalizeRating(value) {
  const rating = Number(value)
  if (!Number.isFinite(rating)) {
    return 0
  }

  return Math.max(1, Math.min(5, Math.round(rating)))
}

function toLookupKey(value) {
  return cleanText(value, 160).toLowerCase()
}

function normalizeReview(rawReview = {}) {
  const rating = normalizeRating(rawReview.rating)

  if (!rawReview.sellerKey || !rawReview.listingId || !rating) {
    return null
  }

  return {
    id: String(rawReview.id || `${rawReview.listingId}-${Date.now()}`),
    sellerKey: toLookupKey(rawReview.sellerKey),
    listingId: String(rawReview.listingId),
    rating,
    comment: cleanText(rawReview.comment || rawReview.note || '', 200),
    reviewerName: cleanText(rawReview.reviewerName || 'UniMarket user', 32) || 'UniMarket user',
    createdAt: cleanText(rawReview.createdAt || new Date().toISOString(), 40)
  }
}

function getStoredReviews() {
  const stored = safeGetStorage(REVIEWS_STORAGE_KEY, [])
  return Array.isArray(stored)
    ? stored.map(normalizeReview).filter(Boolean)
    : []
}

function saveReviews(reviews) {
  safeSetStorage(REVIEWS_STORAGE_KEY, reviews)
}

function getReviewUnlocks() {
  const stored = safeGetStorage(REVIEW_UNLOCKS_STORAGE_KEY, [])
  return Array.isArray(stored)
    ? stored.map((listingId) => String(listingId)).filter(Boolean)
    : []
}

function saveReviewUnlocks(listingIds) {
  safeSetStorage(REVIEW_UNLOCKS_STORAGE_KEY, listingIds)
}

function unlockReviewForListing(listingId) {
  const targetId = String(listingId || '')

  if (!targetId) {
    return []
  }

  const nextUnlocks = Array.from(new Set([...getReviewUnlocks(), targetId]))
  saveReviewUnlocks(nextUnlocks)
  return nextUnlocks
}

function canReviewListing(listingId) {
  return getReviewUnlocks().includes(String(listingId || ''))
}

function hasReviewedListing(listingId) {
  return getStoredReviews().some((review) => review.listingId === String(listingId || ''))
}

function createReview(payload = {}) {
  const review = normalizeReview({
    ...payload,
    id: Date.now(),
    createdAt: new Date().toISOString()
  })

  if (!review || hasReviewedListing(review.listingId)) {
    return null
  }

  const nextReviews = [review, ...getStoredReviews()]
  saveReviews(nextReviews)
  return review
}

function getSellerReviews(sellerKey, limit = 0) {
  const normalizedKey = toLookupKey(sellerKey)
  const reviews = getStoredReviews()
    .filter((review) => review.sellerKey === normalizedKey)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return limit > 0 ? reviews.slice(0, limit) : reviews
}

function formatReviewDate(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  } catch (error) {
    return String(value).slice(0, 10)
  }
}

function getSellerReviewSummary(sellerKey) {
  const reviews = getSellerReviews(sellerKey)
  const count = reviews.length
  const average = count
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / count
    : 0

  return {
    average,
    averageLabel: count ? average.toFixed(1) : 'New',
    count,
    countLabel: count === 1 ? '1 review' : `${count} reviews`,
    recentReviews: reviews.slice(0, 3).map((review) => ({
      ...review,
      dateLabel: formatReviewDate(review.createdAt)
    }))
  }
}

module.exports = {
  unlockReviewForListing,
  canReviewListing,
  hasReviewedListing,
  createReview,
  getSellerReviews,
  getSellerReviewSummary
}
