function createMarketSellerHelpers({
  profileStore,
  listingStatsStore,
  profileStatsStore,
  reportsStore,
  reviewsStore,
  toLookupKey,
  normalizeCustomListing,
  getListingById,
  getListingsBySellerKey,
  getMyListings,
  getSellerKey,
  isSellerProSeller,
  getCustomListings,
  getStoredCustomListings,
  saveStoredCustomListings,
  getStoredSellerProSubscriptions,
  saveSellerProSubscriptions,
  normalizeSellerProSubscription
}) {
  function buildSellerAnalytics(listings = [], soldCount = 0) {
    const aggregate = listingStatsStore.getListingsAggregateStats(listings)
    const views = Number(aggregate.views || 0)
    const saves = Number(aggregate.saves || 0)
    const conversionRate = views > 0
      ? Math.round((Number(soldCount || 0) / views) * 1000) / 10
      : 0

    return {
      views,
      saves,
      conversionRate
    }
  }

  function buildOwnSellerAnalytics(sellerKey, listings = []) {
    const aggregate = listingStatsStore.getListingsAggregateStats(listings)
    const profileStats = profileStatsStore.getProfileStats(sellerKey)

    return {
      profileViews: Number(profileStats.views || 0),
      recentProfileViews: Number(profileStats.recentViews || 0),
      listingSaves: Number(aggregate.saves || 0),
      recentListingSaves: Number(aggregate.recentSaves || 0)
    }
  }

  function getProfileSellerKey(profile, listings = []) {
    const normalizedListings = Array.isArray(listings) ? listings : []

    if (normalizedListings.length) {
      return getSellerKey(normalizedListings[0])
    }

    return profileStore.getProfileIdentityKey(profile)
  }

  function getSellerProfileByListingId(listingId, options = {}) {
    const { includeHiddenByUser = false } = options
    const listing = getListingById(listingId, { includeHiddenByUser })

    if (!listing) {
      return null
    }

    const sellerKey = getSellerKey(listing)
    const sellerListingsAllStates = getListingsBySellerKey(sellerKey, { includeResolved: true, includeHiddenByUser: true, includeSold: true })
    const listings = getListingsBySellerKey(sellerKey, { includeResolved: false, includeHiddenByUser, includeSold: false })
      .sort((a, b) => Number(b.id) - Number(a.id))
    const soldCount = sellerListingsAllStates
      .filter((item) => Boolean(item && item.isSold && item.soldOnUniMarket))
      .length
    const seller = listing.seller || {}
    const isSellerPro = isSellerProSeller(sellerKey, seller.name || '', seller.wechat || '')
    const analytics = buildSellerAnalytics(sellerListingsAllStates, soldCount)
    const fallbackJoinedAt = sellerListingsAllStates
      .map((item) => item && item.createdAt ? String(item.createdAt).slice(0, 10) : '')
      .filter(Boolean)
      .sort()[0] || '2025-08-26'

    return {
      sellerKey,
      name: seller.name || 'Student seller',
      badge: isSellerPro ? 'Seller Pro' : (seller.badge || 'Community member'),
      wechat: seller.wechat || '',
      note: seller.note || '',
      avatarUrl: seller.avatarUrl || '',
      bio: seller.bio || '',
      campus: seller.campus || listing.university || '',
      city: seller.city || listing.location || 'Hangzhou',
      joinedAt: seller.joinedAt || fallbackJoinedAt,
      listings,
      soldCount,
      isSellerPro,
      analytics
    }
  }

  function getOwnSellerProfile() {
    const profile = profileStore.getProfile()
    const allMyListings = getMyListings().sort((a, b) => Number(b.id) - Number(a.id))
    const listings = allMyListings.filter((listing) => !listing.isSold)
    const soldCount = allMyListings.filter((listing) => listing.isSold && listing.soldOnUniMarket).length
    const sellerKey = getProfileSellerKey(profile, allMyListings)
    const isSellerPro = isSellerProSeller(sellerKey, profile.name || '', profile.wechat || '')
    const analytics = buildOwnSellerAnalytics(sellerKey, allMyListings)

    return {
      sellerKey,
      name: profile.name || 'You',
      badge: isSellerPro ? 'Seller Pro' : 'Verified student',
      wechat: profile.wechat || '',
      note: listings.length
        ? 'Active on UniMarket'
        : soldCount
          ? `Sold ${soldCount} item${soldCount === 1 ? '' : 's'} on UniMarket`
          : 'Build your profile before your first listing',
      avatarUrl: profile.avatarUrl || '',
      bio: profile.bio || '',
      campus: profile.campus || '',
      city: profile.city || 'Hangzhou',
      joinedAt: profile.joinedAt || '',
      listings,
      soldCount,
      isSellerPro,
      analytics
    }
  }

  function syncCurrentProfileIntoListings(previousProfile = null, nextProfile = null) {
    const prevProfile = previousProfile ? profileStore.normalizeProfile(previousProfile) : null
    const currentProfile = profileStore.normalizeProfile(nextProfile || profileStore.getProfile())
    const rawListings = getStoredCustomListings()

    if (!Array.isArray(rawListings) || !rawListings.length) {
      return []
    }

    const previousKeys = new Set()

    if (prevProfile) {
      previousKeys.add(toLookupKey(prevProfile.name))
      previousKeys.add(toLookupKey(prevProfile.wechat))
      previousKeys.add(getProfileSellerKey(prevProfile, rawListings.map((listing) => normalizeCustomListing(listing))))
    }

    const nextListings = rawListings.map((rawListing) => {
      const listing = normalizeCustomListing(rawListing)
      const seller = listing.seller || {}
      const shouldSync = !previousKeys.size ||
        previousKeys.has(getSellerKey(listing)) ||
        previousKeys.has(toLookupKey(seller.name)) ||
        previousKeys.has(toLookupKey(seller.wechat))

      if (!shouldSync) {
        return rawListing
      }

      return {
        ...rawListing,
        seller: {
          ...(rawListing && rawListing.seller ? rawListing.seller : {}),
          id: currentProfile.id,
          name: currentProfile.name,
          wechat: currentProfile.wechat,
          avatarUrl: currentProfile.avatarUrl,
          bio: currentProfile.bio,
          campus: currentProfile.campus,
          city: currentProfile.city,
          joinedAt: currentProfile.joinedAt
        }
      }
    })

    saveStoredCustomListings(nextListings)
    return nextListings
  }

  function preserveCurrentProfileSellerPro(previousProfile = null, nextProfile = null) {
    const prevProfile = previousProfile ? profileStore.normalizeProfile(previousProfile) : null
    const currentProfile = profileStore.normalizeProfile(nextProfile || profileStore.getProfile())

    if (!prevProfile) {
      return false
    }

    const currentListings = getCustomListings()
    const prevSellerKey = getProfileSellerKey(prevProfile)
    const nextSellerKey = getProfileSellerKey(currentProfile, currentListings)
    const prevNameKey = toLookupKey(prevProfile.name)
    const prevWechatKey = toLookupKey(prevProfile.wechat)
    const nextSubscriptions = getStoredSellerProSubscriptions().map((subscription) => {
      const matched = (prevSellerKey && subscription.sellerKey === prevSellerKey) ||
        (prevNameKey && subscription.nicknameKey === prevNameKey) ||
        (prevWechatKey && subscription.wechatKey === prevWechatKey)

      if (!matched) {
        return subscription
      }

      return normalizeSellerProSubscription({
        ...subscription,
        id: nextSellerKey ? `pro-${nextSellerKey}` : subscription.id,
        sellerKey: nextSellerKey || subscription.sellerKey,
        nickname: currentProfile.name || subscription.nickname,
        nicknameKey: toLookupKey(currentProfile.name || subscription.nickname),
        wechat: currentProfile.wechat || subscription.wechat
      })
    })

    saveSellerProSubscriptions(nextSubscriptions)
    return true
  }

  function preserveCurrentProfileIdentityData(previousProfile = null, nextProfile = null) {
    const prevProfile = previousProfile ? profileStore.normalizeProfile(previousProfile) : null
    const currentProfile = profileStore.normalizeProfile(nextProfile || profileStore.getProfile())

    if (!prevProfile) {
      return false
    }

    const currentListings = getCustomListings()
    const previousKeys = Array.from(new Set([
      getProfileSellerKey(prevProfile),
      toLookupKey(prevProfile.name),
      toLookupKey(prevProfile.wechat)
    ].filter(Boolean)))

    const nextSellerKey = getProfileSellerKey(currentProfile, currentListings)

    if (!previousKeys.length || !nextSellerKey) {
      return false
    }

    profileStatsStore.remapProfileKey(previousKeys, nextSellerKey)
    reportsStore.remapProfileKey(previousKeys, nextSellerKey)
    reviewsStore.remapSellerKey(previousKeys, nextSellerKey)
    return true
  }

  return {
    buildSellerAnalytics,
    buildOwnSellerAnalytics,
    getSellerProfileByListingId,
    getProfileSellerKey,
    getOwnSellerProfile,
    syncCurrentProfileIntoListings,
    preserveCurrentProfileSellerPro,
    preserveCurrentProfileIdentityData
  }
}

module.exports = {
  createMarketSellerHelpers
}
