const profileStore = require('../../utils/profile')

module.exports = {
  loginWithWechatCode(code) {
    return {
      ok: true,
      code: String(code || ''),
      profile: profileStore.getProfile(),
      token: ''
    }
  },
  getMe() {
    return {
      profile: profileStore.getProfile()
    }
  },
  updateMyProfile(payload = {}) {
    return {
      profile: profileStore.saveProfile(payload)
    }
  },
  clearSession() {
    return true
  }
}
