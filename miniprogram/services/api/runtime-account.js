const authApi = require('./auth')
const remoteApi = require('./remote')
const sellersApi = require('./sellers')

module.exports = {
  get enabled() {
    return Boolean(remoteApi.auth && remoteApi.auth.enabled)
  },
  async getMe() {
    if (remoteApi.auth && remoteApi.auth.enabled) {
      try {
        return await remoteApi.auth.getMe()
      } catch (error) {}
    }

    const sellerProfile = sellersApi.getOwnProfile()
    const authProfile = authApi.getMe()

    return {
      authenticated: false,
      backendReady: false,
      photoLimit: 5,
      isSellerPro: Boolean(sellerProfile && sellerProfile.isSellerPro),
      isAdmin: false,
      profile: authProfile && authProfile.profile ? authProfile.profile : null
    }
  },
  updateMyProfile(payload = {}) {
    if (remoteApi.auth && remoteApi.auth.enabled) {
      return remoteApi.auth.updateMyProfile(payload)
    }

    return authApi.updateMyProfile(payload)
  },
  requestSellerPro() {
    if (remoteApi.auth && remoteApi.auth.enabled) {
      return remoteApi.auth.requestSellerPro()
    }

    return Promise.resolve(null)
  }
}
