const storage = require('./storage')

const LOCALE_STORAGE_KEY = 'appLocale'
const DEFAULT_LOCALE = 'en'
const SUPPORTED_LOCALES = ['en', 'zh', 'ru']

function normalizeLocale(value) {
  return SUPPORTED_LOCALES.includes(value) ? value : DEFAULT_LOCALE
}

function getLocale() {
  return normalizeLocale(storage.safeGetStorage(LOCALE_STORAGE_KEY, DEFAULT_LOCALE))
}

function setLocale(value) {
  const locale = normalizeLocale(value)
  storage.safeSetStorage(LOCALE_STORAGE_KEY, locale)
  return locale
}

module.exports = {
  LOCALE_STORAGE_KEY,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  normalizeLocale,
  getLocale,
  setLocale
}
