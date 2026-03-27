const adminStore = require('../../utils/admin')
const remoteApi = require('./remote')

module.exports = {
  get enabled() {
    return Boolean(remoteApi.auth && remoteApi.auth.enabled)
  },
  isAdmin() {
    return adminStore.isAdmin()
  },
  async getAdminState() {
    let isAdmin = adminStore.isAdmin()

    if (this.enabled) {
      try {
        const me = await remoteApi.auth.getMe()
        isAdmin = Boolean(me && me.isAdmin)
      } catch (error) {}
    }

    return isAdmin
  },
  async enableAdminAccess(code) {
    if (this.enabled) {
      return remoteApi.auth.enableAdminAccess(code)
    }

    return null
  },
  setAdminAccess(isEnabled) {
    return adminStore.setAdminAccess(isEnabled)
  },
  async disableAdminAccess() {
    if (this.enabled) {
      return remoteApi.auth.disableAdminAccess()
    }

    adminStore.disableAdmin()
    return { ok: true, isAdmin: false }
  },
  disableAdmin() {
    return adminStore.disableAdmin()
  }
}
