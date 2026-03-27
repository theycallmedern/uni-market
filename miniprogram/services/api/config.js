const SESSION_TOKEN_STORAGE_KEY = 'apiSessionToken'
const API_TIMEOUT_MS = 10000
const USE_BACKEND_LISTING_READS = true
const USE_BACKEND_LISTING_WRITES = true
const DEV_API_BASE_URL = 'https://unimarket-api-dev.mishabeliako.workers.dev'
const PROD_API_BASE_URL = 'https://api.clauseon.tech'

function getMiniProgramEnvVersion() {
  if (typeof wx !== 'undefined' && wx && typeof wx.getAccountInfoSync === 'function') {
    try {
      const accountInfo = wx.getAccountInfoSync()
      const envVersion = accountInfo
        && accountInfo.miniProgram
        && accountInfo.miniProgram.envVersion
        ? String(accountInfo.miniProgram.envVersion)
        : ''

      if (envVersion) {
        return envVersion
      }
    } catch (error) {
      // Fall through to safe defaults below.
    }
  }

  if (typeof __wxConfig !== 'undefined' && __wxConfig && __wxConfig.envVersion) {
    return String(__wxConfig.envVersion)
  }

  return 'develop'
}

function resolveApiBaseUrl() {
  const envVersion = getMiniProgramEnvVersion()
  const baseUrl = envVersion === 'trial' || envVersion === 'release'
    ? PROD_API_BASE_URL
    : DEV_API_BASE_URL

  return String(baseUrl || '').trim().replace(/\/+$/, '')
}

function getApiBaseUrl() {
  return resolveApiBaseUrl()
}

module.exports = {
  SESSION_TOKEN_STORAGE_KEY,
  API_TIMEOUT_MS,
  USE_BACKEND_LISTING_READS,
  USE_BACKEND_LISTING_WRITES,
  getMiniProgramEnvVersion,
  getApiBaseUrl
}
