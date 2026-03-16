const profileStore = require('./utils/profile')

App({
  globalData: {},

  onLaunch() {
    // Initialize local profile cache early so create/profile pages have prefilled values.
    profileStore.getProfile()
  }
})
