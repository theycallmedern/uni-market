const WECHAT_MIN_LENGTH = 6
const WECHAT_MAX_LENGTH = 20
const PRICE_MAX_DIGITS = 6
const PRICE_MIN_VALUE = 1
const PRICE_MAX_VALUE = 999999
const DEFAULT_CURRENCY = 'RMB'

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
  sanitizeSingleLine,
  sanitizeMultiline,
  sanitizeWeChatId,
  isValidWeChatId,
  hasMeaningfulText,
  extractPriceDigits,
  isValidPriceDigits,
  isPriceInRange,
  ensurePriceCurrency
}
