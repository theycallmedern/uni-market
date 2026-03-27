function createMarketListingHelpers({
  storage,
  profileStore,
  reportsStore,
  normalizeCustomListing,
  decorateListingSellerPro,
  decorateListingPromotion,
  isSellerProSeller
}) {
  const CUSTOM_LISTINGS_STORAGE_KEY = 'marketCustomListings'
  const CREATE_MODE_STORAGE_KEY = 'marketCreateMode'

  function getStoredCustomListings() {
    return storage.safeGetStorage(CUSTOM_LISTINGS_STORAGE_KEY, [])
  }

  function saveStoredCustomListings(listings) {
    storage.safeSetStorage(CUSTOM_LISTINGS_STORAGE_KEY, listings)
  }

  function getCustomListings() {
    return getStoredCustomListings()
      .map((listing) => normalizeCustomListing(listing))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  function createListing(payload) {
    const customListings = getStoredCustomListings()
    const profile = profileStore.getProfile()
    const isSellerPro = isSellerProSeller('', profile.name || '', profile.wechat || '')
    const nowIso = new Date(Date.now()).toISOString()
    const nextPayload = {
      ...payload,
      seller: {
        ...(payload && payload.seller ? payload.seller : {}),
        id: profile.id || '',
        badge: isSellerPro ? 'Seller Pro' : (payload && payload.seller && payload.seller.badge ? payload.seller.badge : 'Student seller')
      }
    }
    const listing = normalizeCustomListing({
      ...nextPayload,
      id: Date.now(),
      createdAt: nowIso,
      updatedAt: nowIso,
      status: 'active'
    })

    saveStoredCustomListings([listing, ...customListings])

    return decorateListingPromotion(decorateListingSellerPro(listing))
  }

  function getMyListings() {
    return reportsStore.decorateListingsWithModeration(getCustomListings())
      .map((listing) => decorateListingSellerPro(listing))
      .map((listing) => decorateListingPromotion(listing))
  }

  function deleteListing(id) {
    const targetId = String(id)
    const nextListings = getStoredCustomListings().filter(
      (listing) => String(listing.id) !== targetId
    )

    saveStoredCustomListings(nextListings)
  }

  function updateListing(id, payload) {
    const targetId = String(id)
    const customListings = getStoredCustomListings()
    const currentListing = customListings.find((listing) => String(listing.id) === targetId)

    if (!currentListing) {
      return null
    }

    const updatedListing = normalizeCustomListing({
      ...currentListing,
      ...payload,
      id: currentListing.id,
      createdAt: currentListing.createdAt,
      updatedAt: new Date(Date.now()).toISOString()
    })

    const nextListings = customListings.map((listing) =>
      String(listing.id) === targetId ? updatedListing : listing
    )

    saveStoredCustomListings(nextListings)

    return decorateListingPromotion(decorateListingSellerPro(updatedListing))
  }

  function setListingSoldState(id, isSold, soldOnUniMarket = true) {
    const sold = Boolean(isSold)

    return updateListing(id, {
      isSold: sold,
      soldOnUniMarket: sold ? Boolean(soldOnUniMarket) : false,
      soldAt: sold ? new Date(Date.now()).toISOString() : '',
      expiresAt: sold ? undefined : new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString(),
      status: 'active'
    })
  }

  function restoreListing(id) {
    return updateListing(id, {
      status: 'active',
      expiresAt: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString()
    })
  }

  function queueCreateMode(mode) {
    storage.safeSetStorage(CREATE_MODE_STORAGE_KEY, mode)
  }

  function consumeCreateMode() {
    const mode = storage.safeGetStorage(CREATE_MODE_STORAGE_KEY, null)
    storage.safeRemoveStorage(CREATE_MODE_STORAGE_KEY)
    return mode
  }

  return {
    getStoredCustomListings,
    saveStoredCustomListings,
    getCustomListings,
    createListing,
    getMyListings,
    deleteListing,
    updateListing,
    setListingSoldState,
    restoreListing,
    queueCreateMode,
    consumeCreateMode
  }
}

module.exports = {
  createMarketListingHelpers
}
