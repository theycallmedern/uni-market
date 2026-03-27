const profileStore = require('./utils/profile')
const {
  USE_BACKEND_LISTING_READS,
  USE_BACKEND_LISTING_WRITES,
  getApiBaseUrl
} = require('./services/api/config')
const { ensureBackendSession } = require('./services/api/session')

App({
  globalData: {},

  onLaunch() {
    // Initialize local profile cache early so create/profile pages have prefilled values.
    profileStore.getProfile()

    const shouldBootstrapBackendSession = Boolean(getApiBaseUrl()) && (USE_BACKEND_LISTING_READS || USE_BACKEND_LISTING_WRITES)
    if (shouldBootstrapBackendSession) {
      this.globalData.authReadyPromise = ensureBackendSession().catch(() => '')
    } else {
      this.globalData.authReadyPromise = Promise.resolve('')
    }
  }
})
