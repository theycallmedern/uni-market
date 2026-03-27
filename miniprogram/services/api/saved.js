const savedStore = require('../../utils/saved')
const remoteApi = require('./remote')

function syncRemoteSavedIds(remoteIds) {
  if (Array.isArray(remoteIds)) {
    savedStore.setSavedListingIds(remoteIds)
  }

  return savedStore.getSavedListingIds()
}

module.exports = {
  get enabled() {
    return Boolean(remoteApi.saved && remoteApi.saved.enabled)
  },
  getSavedListingIds() {
    return savedStore.getSavedListingIds()
  },
  setSavedListingIds(ids) {
    return savedStore.setSavedListingIds(ids)
  },
  isListingSaved(id) {
    return savedStore.isListingSaved(id)
  },
  toggleSavedListing(id) {
    const result = savedStore.toggleSavedListing(id)

    if (remoteApi.saved && remoteApi.saved.enabled) {
      remoteApi.saved.setSaved(id, result.isSaved)
        .then((remoteIds) => {
          syncRemoteSavedIds(remoteIds)
        })
        .catch(() => {})
    }

    return result
  },
  decorateListingsWithSaved(listings) {
    return savedStore.decorateListingsWithSaved(listings)
  },
  removeSavedListings(ids) {
    const normalizedIds = Array.isArray(ids)
      ? ids.map((id) => String(id))
      : [String(ids)]
    const nextIds = savedStore.removeSavedListings(normalizedIds)

    if (remoteApi.saved && remoteApi.saved.enabled) {
      Promise.all(normalizedIds.map((id) => remoteApi.saved.setSaved(id, false).catch(() => null)))
        .then((results) => {
          const lastRemoteIds = results.filter(Array.isArray).pop()
          if (lastRemoteIds) {
            syncRemoteSavedIds(lastRemoteIds)
          }
        })
        .catch(() => {})
    }

    return nextIds
  },
  clearSavedListings() {
    const currentIds = savedStore.getSavedListingIds()
    savedStore.clearSavedListings()

    if (remoteApi.saved && remoteApi.saved.enabled && currentIds.length) {
      Promise.all(currentIds.map((id) => remoteApi.saved.setSaved(id, false).catch(() => null)))
        .then((results) => {
          const lastRemoteIds = results.filter(Array.isArray).pop()
          if (lastRemoteIds) {
            syncRemoteSavedIds(lastRemoteIds)
          }
        })
        .catch(() => {})
    }

    return []
  },
  async hydrateSavedListingIds() {
    if (!(remoteApi.saved && remoteApi.saved.enabled)) {
      return savedStore.hydrateSavedListingIds()
    }

    try {
      const remoteIds = await remoteApi.saved.getIds()
      return syncRemoteSavedIds(remoteIds)
    } catch (error) {
      return savedStore.hydrateSavedListingIds()
    }
  }
}
