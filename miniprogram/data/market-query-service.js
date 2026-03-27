function createMarketQueryService({
  reportsStore,
  visibilityStore,
  listingStatsStore,
  toLookupKey,
  categories,
  categoryConfigs,
  subcategoryFallbackImages,
  baseListings,
  getCustomListings,
  getSellerKey,
  getSellerProLookup,
  decorateListingSellerPro,
  decorateListingPromotion,
  sortByPromotionPriority,
  getFallbackImage,
  getSellerProfileByListingId,
  getOwnSellerProfile,
  getPromotionPlans,
  getPromotionRequests,
  getSellerProSubscriptions,
  getCurrentSellerPhotoLimit
}) {
  function getAllListings(options = {}) {
    const {
      includeResolved = true,
      includeHiddenByUser = false,
      includeSold = true,
      includeArchived = true
    } = options
    let listings = reportsStore.decorateListingsWithModeration([...getCustomListings(), ...baseListings])

    if (!includeHiddenByUser) {
      listings = visibilityStore.filterVisibleListings(listings)
    }

    if (!includeSold) {
      listings = listings.filter((listing) => !listing.isSold)
    }

    if (!includeArchived) {
      listings = listings.filter((listing) => !listing.isArchived)
    }

    const resolvedListings = includeResolved
      ? listings
      : listings.filter((listing) => !listing.isHiddenByModeration)
    const sellerProLookup = getSellerProLookup()

    return resolvedListings
      .map((listing) => decorateListingSellerPro(listing, sellerProLookup))
      .map((listing) => decorateListingPromotion(listing))
  }

  function getListingById(id, options = {}) {
    return getAllListings({ includeResolved: true, ...options }).find((listing) => String(listing.id) === String(id)) || null
  }

  function getFeedListings() {
    return sortByPromotionPriority(getAllListings({ includeResolved: false, includeSold: false, includeArchived: false }))
  }

  function getListingsByCategory(categoryId, options = {}) {
    const {
      includeResolved = true,
      includeHiddenByUser = false,
      includeSold = true,
      includeArchived = true
    } = options
    return sortByPromotionPriority(
      getAllListings({ includeResolved, includeHiddenByUser, includeSold, includeArchived }).filter((listing) => listing.categoryId === categoryId)
    )
  }

  function getListingsBySellerKey(sellerKey, options = {}) {
    const normalizedKey = toLookupKey(sellerKey)

    if (!normalizedKey) {
      return []
    }

    return getAllListings(options).filter((listing) => getSellerKey(listing) === normalizedKey)
  }

  function getListingAnalytics(id) {
    const stats = listingStatsStore.getListingStats(id)

    return {
      views: Number(stats.views || 0),
      recentViews: Number(stats.recentViews || 0),
      saves: Number(stats.saves || 0),
      recentSaves: Number(stats.recentSaves || 0)
    }
  }

  function getSubcategoryCards(categoryId) {
    const category = categoryConfigs[categoryId]

    if (!category) {
      return []
    }

    const listings = getListingsByCategory(categoryId, { includeResolved: false, includeSold: false, includeArchived: false })

    return category.subcategories.map((name, index) => {
      const matchedListing = listings.find((listing) => listing.subcategory === name && listing.image)
      const fallbackImage = subcategoryFallbackImages[name]

      return {
        id: `${categoryId}-${index}`,
        name,
        image: fallbackImage || (matchedListing ? matchedListing.image : '') || getFallbackImage(categoryId)
      }
    })
  }

  function getFeedListingsByCategory(categoryId) {
    return getListingsByCategory(categoryId, { includeResolved: false, includeSold: false, includeArchived: false })
  }

  function getPublishCategories() {
    return categories.filter((category) => category.id !== 'all')
  }

  return {
    getAllListings,
    getListingById,
    getFeedListings,
    getListingsByCategory,
    getListingsBySellerKey,
    getListingAnalytics,
    getSubcategoryCards,
    getFeedListingsByCategory,
    getPublishCategories,
    getSellerProfileByListingId,
    getOwnSellerProfile,
    getPromotionPlans,
    getPromotionRequests,
    getSellerProSubscriptions,
    getCurrentSellerPhotoLimit
  }
}

module.exports = {
  createMarketQueryService
}
