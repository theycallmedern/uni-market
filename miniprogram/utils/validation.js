const WECHAT_MIN_LENGTH = 6
const WECHAT_MAX_LENGTH = 20
const PRICE_MAX_DIGITS = 6
const PRICE_MIN_VALUE = 1
const PRICE_MAX_VALUE = 999999
const DEFAULT_CURRENCY = 'RMB'
const DEFAULT_ADDRESS_MAX_LENGTH = 120
const ADDRESS_ANCHOR_KEYWORDS = [
  'hangzhou',
  'district',
  'campus',
  'university',
  'road',
  'rd',
  'street',
  'st',
  'avenue',
  'ave',
  'lane',
  'ln',
  'metro',
  'station',
  'gate'
]
const ADDRESS_DETAIL_KEYWORDS = [
  'building',
  'bldg',
  'block',
  'tower',
  'dorm',
  'apartment',
  'apt',
  'unit',
  'room',
  'floor',
  'gate'
]
const ADDRESS_ANCHOR_CJK_REGEX = /(区|路|街|道|校园|校区|大学|公寓|小区|苑|村|地铁|站)/
const ADDRESS_DETAIL_CJK_REGEX = /(号|楼|栋|单元|室|门|层|幢|座)/

function normalizeWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function sanitizeSingleLine(value, maxLength) {
  const normalized = normalizeWhitespace(value)
  return typeof maxLength === 'number' ? normalized.slice(0, maxLength) : normalized
}

function sanitizeMultiline(value, maxLength) {
  const normalized = String(value || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (typeof maxLength !== 'number') {
    return normalized
  }

  return normalized.slice(0, maxLength)
}

function sanitizeAddress(value, maxLength = DEFAULT_ADDRESS_MAX_LENGTH) {
  const normalized = String(value || '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[，、；;]+/g, ',')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .replace(/,{2,}/g, ',')
    .trim()
    .replace(/^[,\s.-]+|[,\s.-]+$/g, '')

  if (typeof maxLength !== 'number') {
    return normalized
  }

  return normalized.slice(0, maxLength)
}

function sanitizeWeChatId(value, maxLength = WECHAT_MAX_LENGTH) {
  return String(value || '')
    .replace(/\s+/g, '')
    .replace(/[^A-Za-z0-9_-]/g, '')
    .slice(0, maxLength)
}

function isValidWeChatId(wechat, options = {}) {
  const {
    allowEmpty = false,
    minLength = WECHAT_MIN_LENGTH,
    maxLength = WECHAT_MAX_LENGTH
  } = options
  const normalized = String(wechat || '')

  if (!normalized) {
    return Boolean(allowEmpty)
  }

  if (normalized.length < minLength || normalized.length > maxLength) {
    return false
  }

  return /^[A-Za-z][A-Za-z0-9_-]*$/.test(normalized)
}

function hasMeaningfulText(text) {
  return /[A-Za-z\u0400-\u04FF\u4E00-\u9FFF0-9]/.test(String(text || ''))
}

function hasKeyword(text, keywords) {
  return keywords.some((keyword) => {
    if (!keyword) {
      return false
    }

    if (keyword.length <= 2) {
      const shortWordPattern = new RegExp(`(^|\\W)${keyword}(\\W|$)`, 'i')
      return shortWordPattern.test(text)
    }

    return text.includes(keyword)
  })
}

function hasMeaningfulAddress(text) {
  const normalized = sanitizeAddress(text, DEFAULT_ADDRESS_MAX_LENGTH)
  const lower = normalized.toLowerCase()

  if (!hasMeaningfulText(normalized)) {
    return false
  }

  const tokenCount = (normalized.match(/[A-Za-z\u0400-\u04FF\u4E00-\u9FFF0-9]+/g) || []).length
  const hasDigit = /\d/.test(normalized)
  const hasAnchor =
    hasKeyword(lower, ADDRESS_ANCHOR_KEYWORDS) || ADDRESS_ANCHOR_CJK_REGEX.test(normalized)
  const hasDetail =
    hasDigit ||
    hasKeyword(lower, ADDRESS_DETAIL_KEYWORDS) ||
    ADDRESS_DETAIL_CJK_REGEX.test(normalized)

  if (hasAnchor) {
    return hasDetail || tokenCount >= 3
  }

  if (hasDetail) {
    return tokenCount >= 3
  }

  return false
}

function extractPriceDigits(value, maxDigits = PRICE_MAX_DIGITS) {
  return String(value || '')
    .replace(/\D+/g, '')
    .slice(0, maxDigits)
}

function isValidPriceDigits(value, maxDigits = PRICE_MAX_DIGITS) {
  return new RegExp(`^\\d{1,${maxDigits}}$`).test(String(value || ''))
}

function isPriceInRange(value, options = {}) {
  const {
    min = PRICE_MIN_VALUE,
    max = PRICE_MAX_VALUE
  } = options
  const numericValue = Number(value)
  return Number.isFinite(numericValue) && numericValue >= min && numericValue <= max
}

function ensurePriceCurrency(value, currency = DEFAULT_CURRENCY) {
  const normalized = normalizeWhitespace(value)

  if (!normalized) {
    return ''
  }

  if (/(?:\b(?:rmb|cny|usd|eur|rub)\b|[¥￥$€₽])/i.test(normalized)) {
    return normalized
  }

  if (!/\d/.test(normalized)) {
    return normalized
  }

  const match = normalized.match(/^([\d][\d\s.,]*)(.*)$/)
  if (!match) {
    return `${normalized} ${currency}`
  }

  const amount = String(match[1] || '').trim()
  const tail = String(match[2] || '').trim()

  return tail ? `${amount} ${currency} ${tail}` : `${amount} ${currency}`
}

module.exports = {
  WECHAT_MIN_LENGTH,
  WECHAT_MAX_LENGTH,
  PRICE_MAX_DIGITS,
  PRICE_MIN_VALUE,
  PRICE_MAX_VALUE,
  DEFAULT_ADDRESS_MAX_LENGTH,
  sanitizeSingleLine,
  sanitizeMultiline,
  sanitizeAddress,
  sanitizeWeChatId,
  isValidWeChatId,
  hasMeaningfulText,
  hasMeaningfulAddress,
  extractPriceDigits,
  isValidPriceDigits,
  isPriceInRange,
  ensurePriceCurrency
}
