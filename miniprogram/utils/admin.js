const STORAGE_KEY = 'adminAccess'
const storage = require('./storage')

function isAdmin() {
  return storage.safeGetStorage(STORAGE_KEY, false) === true
}

function setAdminAccess(isEnabled) {
  storage.safeSetStorage(STORAGE_KEY, Boolean(isEnabled))
  return Boolean(isEnabled)
}

function disableAdmin() {
  storage.safeRemoveStorage(STORAGE_KEY)
}

module.exports = {
  isAdmin,
  setAdminAccess,
  disableAdmin
}
