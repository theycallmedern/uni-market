const STORAGE_KEY = 'adminAccess'
const ADMIN_PASSCODE = 'unimarket-admin'
const storage = require('./storage')

function isAdmin() {
  return storage.safeGetStorage(STORAGE_KEY, false) === true
}

function enableAdmin(code) {
  if (code !== ADMIN_PASSCODE) {
    return false
  }

  storage.safeSetStorage(STORAGE_KEY, true)
  return true
}

function disableAdmin() {
  storage.safeRemoveStorage(STORAGE_KEY)
}

module.exports = {
  isAdmin,
  enableAdmin,
  disableAdmin
}
