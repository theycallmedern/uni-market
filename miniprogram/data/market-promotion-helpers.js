function createMarketPromotionHelpers({
  profileStore,
  toLookupKey,
  getSellerKey,
  getCustomListings,
  baseListings,
  getListingById,
  updateListing,
  getStoredPromotionRequests,
  savePromotionRequests,
  getStoredSellerProSubscriptions,
  saveSellerProSubscriptions
}) {
  const SELLER_PRO_PHOTO_LIMIT = 10
  const DEFAULT_PHOTO_LIMIT = 5
  const PROMOTION_PLAN_CONFIGS = {
    featured_1d: {
      id: 'featured_1d',
      label: 'Featured for 1 day',
      durationDays: 1,
      durationHours: 24,
      priceLabel: '29 RMB'
    },
    featured_2d: {
      id: 'featured_2d',
      label: 'Featured for 2 days',
      durationDays: 2,
      durationHours: 48,
      priceLabel: '49 RMB'
    },
    featured_3d: {
      id: 'featured_3d',
      label: 'Featured for 3 days',
      durationDays: 3,
      durationHours: 72,
      priceLabel: '69 RMB'
    },
    featured_7d: {
      id: 'featured_7d',
      label: 'Featured for 7 days',
      durationDays: 7,
      durationHours: 168,
      priceLabel: '129 RMB'
    }
  }

  function addOneMonth(value) {
    const baseDate = value ? new Date(value) : new Date()
    const date = Number.isNaN(baseDate.getTime()) ? new Date() : new Date(baseDate)
    date.setMonth(date.getMonth() + 1)
    return date.toISOString()
  }

  function normalizeSellerProSubscription(rawSubscription = {}) {
    const nickname = String(rawSubscription.nickname || '').trim()
    const sellerKey = toLookupKey(rawSubscription.sellerKey || '')
    const nicknameKey = toLookupKey(rawSubscription.nicknameKey || nickname)
    const wechat = String(rawSubscription.wechat || '').trim()
    const wechatKey = toLookupKey(rawSubscription.wechatKey || wechat)
    const id = String(rawSubscription.id || `pro-${sellerKey || nicknameKey}`)
    const grantedAt = String(rawSubscription.grantedAt || '')
    const expiresAt = String(rawSubscription.expiresAt || addOneMonth(grantedAt))
    const expiresAtTs = Date.parse(expiresAt)
    const isExpired = Number.isFinite(expiresAtTs) && expiresAtTs <= Date.now()

    return {
      id,
      sellerKey,
      nickname,
      nicknameKey,
      wechat,
      wechatKey,
      isActive: rawSubscription.isActive !== false && !isExpired,
      grantedAt,
      expiresAt,
      grantedBy: String(rawSubscription.grantedBy || 'admin')
    }
  }

  function revokeSellerProSubscription(id) {
    const targetId = String(id || '')

    if (!targetId) {
      return null
    }

    const subscriptions = getStoredSellerProSubscriptions()
    const target = subscriptions.find((subscription) => subscription.id === targetId)

    if (!target) {
      return null
    }

    const nextSubscriptions = subscriptions.map((subscription) => (
      subscription.id === targetId
        ? normalizeSellerProSubscription({
          ...subscription,
          isActive: false,
          expiresAt: subscription.expiresAt || new Date(Date.now()).toISOString()
        })
        : subscription
    ))

    saveSellerProSubscriptions(nextSubscriptions)
    return nextSubscriptions.find((subscription) => subscription.id === targetId) || null
  }

  function getSellerProLookup() {
    const activeSubscriptions = getStoredSellerProSubscriptions()
      .filter((subscription) => subscription.isActive)

    const sellerKeys = new Set()
    const nicknameKeys = new Set()
    const wechatKeys = new Set()

    activeSubscriptions.forEach((subscription) => {
      if (subscription.sellerKey) {
        sellerKeys.add(subscription.sellerKey)
      }
      if (subscription.nicknameKey) {
        nicknameKeys.add(subscription.nicknameKey)
      }
      if (subscription.wechatKey) {
        wechatKeys.add(subscription.wechatKey)
      }
    })

    return { sellerKeys, nicknameKeys, wechatKeys }
  }

  function isSellerProSeller(sellerKey, sellerName, sellerWechat = '', lookup = null) {
    const safeLookup = lookup && lookup.sellerKeys && lookup.nicknameKeys && lookup.wechatKeys
      ? lookup
      : getSellerProLookup()
    const normalizedSellerKey = toLookupKey(sellerKey)
    const normalizedSellerName = toLookupKey(sellerName)
    const normalizedSellerWechat = toLookupKey(sellerWechat)
    return safeLookup.sellerKeys.has(normalizedSellerKey) ||
      safeLookup.nicknameKeys.has(normalizedSellerName) ||
      safeLookup.wechatKeys.has(normalizedSellerWechat)
  }

  function decorateListingSellerPro(listing = {}, sellerProLookup = null) {
    const seller = listing.seller || {}
    const sellerKey = getSellerKey(listing)
    const isSellerPro = isSellerProSeller(sellerKey, seller.name || '', seller.wechat || '', sellerProLookup)

    if (!isSellerPro) {
      return {
        ...listing,
        isSellerPro: false
      }
    }

    return {
      ...listing,
      isSellerPro: true,
      seller: {
        ...seller,
        badge: 'Seller Pro'
      }
    }
  }

  function normalizePromotion(rawPromotion = {}) {
    const now = Date.now()
    const status = String(rawPromotion.status || 'none')
    const planId = rawPromotion.plan && PROMOTION_PLAN_CONFIGS[rawPromotion.plan]
      ? rawPromotion.plan
      : 'featured_1d'
    const requestedAt = String(rawPromotion.requestedAt || '')
    const activatedAt = String(rawPromotion.activatedAt || '')
    const activeUntil = String(rawPromotion.activeUntil || '')
    const activeUntilTs = Date.parse(activeUntil)
    const isActive = status === 'active' && Number.isFinite(activeUntilTs) && activeUntilTs > now
    const normalizedStatus = isActive
      ? 'active'
      : status === 'requested'
        ? 'requested'
        : status === 'active'
          ? 'expired'
          : status

    return {
      status: ['none', 'requested', 'active', 'expired'].includes(normalizedStatus) ? normalizedStatus : 'none',
      plan: planId,
      requestedAt,
      activatedAt,
      activeUntil,
      label: PROMOTION_PLAN_CONFIGS[planId].label,
      priceLabel: PROMOTION_PLAN_CONFIGS[planId].priceLabel
    }
  }

  function decorateListingPromotion(listing = {}) {
    const promotion = normalizePromotion(listing.promotion || {})

    return {
      ...listing,
      promotion,
      promotionStatus: promotion.status,
      promotionPlan: promotion.plan,
      promotionRequestedAt: promotion.requestedAt,
      promotionActiveUntil: promotion.activeUntil,
      isPromotionRequested: promotion.status === 'requested',
      isPromoted: promotion.status === 'active'
    }
  }

  function sortByPromotionPriority(listings = []) {
    return [...listings].sort((a, b) => {
      const promotedDiff = Number(Boolean(b && b.isPromoted)) - Number(Boolean(a && a.isPromoted))
      if (promotedDiff !== 0) {
        return promotedDiff
      }

      const sellerProDiff = Number(Boolean(b && b.isSellerPro)) - Number(Boolean(a && a.isSellerPro))
      if (sellerProDiff !== 0) {
        return sellerProDiff
      }

      return 0
    })
  }

  function normalizePromotionRequest(rawRequest = {}) {
    const planId = rawRequest.planId && PROMOTION_PLAN_CONFIGS[rawRequest.planId]
      ? rawRequest.planId
      : 'featured_1d'
    const plan = PROMOTION_PLAN_CONFIGS[planId]
    const status = String(rawRequest.status || 'pending')

    return {
      id: String(rawRequest.id || ''),
      listingId: String(rawRequest.listingId || ''),
      listingTitle: String(rawRequest.listingTitle || ''),
      sellerName: String(rawRequest.sellerName || ''),
      sellerWechat: String(rawRequest.sellerWechat || ''),
      planId,
      planLabel: plan.label,
      durationDays: plan.durationDays,
      priceLabel: plan.priceLabel,
      status: ['pending', 'approved', 'rejected'].includes(status) ? status : 'pending',
      note: String(rawRequest.note || ''),
      source: String(rawRequest.source || 'manual'),
      createdAt: String(rawRequest.createdAt || ''),
      reviewedAt: String(rawRequest.reviewedAt || '')
    }
  }

  function getPromotionPlans() {
    return Object.values(PROMOTION_PLAN_CONFIGS).sort((a, b) => a.durationDays - b.durationDays)
  }

  function getPromotionRequests(options = {}) {
    const statusFilter = options.status ? String(options.status) : ''
    const requests = getStoredPromotionRequests()

    const filtered = statusFilter
      ? requests.filter((request) => request.status === statusFilter)
      : requests

    return filtered
      .map((request) => {
        const listing = getListingById(request.listingId, {
          includeResolved: true,
          includeHiddenByUser: true,
          includeSold: true
        })

        return {
          ...request,
          listingExists: Boolean(listing),
          listingIsSold: Boolean(listing && listing.isSold),
          listingStatusLabel: listing ? (listing.isSold ? 'Sold' : 'Active') : 'Missing',
          isSellerPro: Boolean(listing && listing.isSellerPro)
        }
      })
      .sort((a, b) => {
        const proDiff = Number(Boolean(b && b.isSellerPro)) - Number(Boolean(a && a.isSellerPro))
        if (proDiff !== 0) {
          return proDiff
        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }

  function requestListingPromotion(id, planId = 'featured_1d', options = {}) {
    const listing = getListingById(id, { includeSold: true, includeResolved: true, includeHiddenByUser: true })
    if (!listing || !listing.isCustom || listing.isSold) {
      return null
    }

    const safePlanId = PROMOTION_PLAN_CONFIGS[planId] ? planId : 'featured_1d'
    const existingPending = getStoredPromotionRequests()
      .find((request) => request.listingId === String(id) && request.status === 'pending')

    if (listing.isPromoted || existingPending) {
      return listing
    }

    const nowIso = new Date(Date.now()).toISOString()
    const requestId = `promo-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const plan = PROMOTION_PLAN_CONFIGS[safePlanId]
    const request = normalizePromotionRequest({
      id: requestId,
      listingId: String(id),
      listingTitle: listing.title || 'Untitled listing',
      sellerName: listing.seller && listing.seller.name ? listing.seller.name : 'Seller',
      sellerWechat: listing.seller && listing.seller.wechat ? listing.seller.wechat : '',
      planId: safePlanId,
      status: 'pending',
      note: options.note || '',
      source: options.source || 'manual',
      createdAt: nowIso
    })
    const nextRequests = [request, ...getStoredPromotionRequests()]
    savePromotionRequests(nextRequests)

    const updatedListing = updateListing(id, {
      promotion: {
        status: 'requested',
        plan: safePlanId,
        requestedAt: nowIso,
        activatedAt: '',
        activeUntil: ''
      }
    })

    return updatedListing || decorateListingPromotion({
      ...listing,
      promotion: {
        status: 'requested',
        plan: safePlanId,
        requestedAt: nowIso,
        activatedAt: '',
        activeUntil: ''
      },
      promotionRequestId: requestId,
      promotionPriceLabel: plan.priceLabel
    })
  }

  function activateListingPromotion(id, options = {}) {
    const listing = getListingById(id, { includeSold: true, includeResolved: true, includeHiddenByUser: true })
    if (!listing || !listing.isCustom || listing.isSold) {
      return null
    }

    const planId = options.planId && PROMOTION_PLAN_CONFIGS[options.planId]
      ? options.planId
      : 'featured_1d'
    const durationHoursRaw = Number(options.durationHours)
    const durationHours = Number.isFinite(durationHoursRaw) && durationHoursRaw > 0
      ? durationHoursRaw
      : PROMOTION_PLAN_CONFIGS[planId].durationHours
    const now = Date.now()
    const activeUntil = new Date(now + durationHours * 60 * 60 * 1000).toISOString()

    return updateListing(id, {
      promotion: {
        status: 'active',
        plan: planId,
        requestedAt: listing.promotionRequestedAt || new Date(now).toISOString(),
        activatedAt: new Date(now).toISOString(),
        activeUntil
      }
    })
  }

  function rejectListingPromotion(id) {
    const listing = getListingById(id, { includeSold: true, includeResolved: true, includeHiddenByUser: true })
    if (!listing || !listing.isCustom) {
      return null
    }

    return updateListing(id, {
      promotion: {
        status: 'none',
        plan: listing.promotionPlan || 'featured_1d',
        requestedAt: '',
        activatedAt: '',
        activeUntil: ''
      }
    })
  }

  function reviewPromotionRequest(requestId, action, options = {}) {
    const targetId = String(requestId || '')
    const decision = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : ''
    if (!targetId || !decision) {
      return null
    }

    const requests = getStoredPromotionRequests()
    const target = requests.find((request) => request.id === targetId)
    if (!target || target.status !== 'pending') {
      return null
    }

    let listing = null
    if (decision === 'approved') {
      listing = activateListingPromotion(target.listingId, {
        planId: target.planId,
        durationHours: target.durationDays * 24
      })
    } else {
      listing = rejectListingPromotion(target.listingId)
    }

    const reviewedAt = new Date().toISOString()
    const nextRequests = requests.map((request) => (
      request.id === targetId
        ? normalizePromotionRequest({
          ...request,
          status: decision,
          reviewedAt,
          note: options.note || request.note || ''
        })
        : request
    ))
    savePromotionRequests(nextRequests)

    return {
      request: nextRequests.find((request) => request.id === targetId) || null,
      listing
    }
  }

  function getSellerProSubscriptions() {
    return getStoredSellerProSubscriptions()
      .filter((subscription) => subscription.isActive)
      .sort((a, b) => new Date(b.grantedAt).getTime() - new Date(a.grantedAt).getTime())
  }

  function getCurrentSellerPhotoLimit() {
    const profile = profileStore.getProfile()
    const profileSellerKey = profileStore.getProfileIdentityKey(profile)
    return isSellerProSeller(profileSellerKey, profile.name || '', profile.wechat || '')
      ? SELLER_PRO_PHOTO_LIMIT
      : DEFAULT_PHOTO_LIMIT
  }

  function grantSellerProByNickname(nickname, options = {}) {
    const normalizedNickname = toLookupKey(nickname)
    const trimmedNickname = String(nickname || '').trim()

    if (!normalizedNickname) {
      return null
    }

    const targets = []
    const pushTarget = (sellerKey, sellerName, sellerWechat = '') => {
      const normalizedSellerKey = toLookupKey(sellerKey)
      const normalizedSellerName = toLookupKey(sellerName)
      const normalizedSellerWechat = toLookupKey(sellerWechat)
      if (!normalizedSellerKey && !normalizedSellerName) {
        return
      }
      targets.push({
        sellerKey: normalizedSellerKey,
        nickname: String(sellerName || trimmedNickname).trim() || trimmedNickname,
        nicknameKey: normalizedSellerName || normalizedNickname,
        wechat: String(sellerWechat || '').trim(),
        wechatKey: normalizedSellerWechat
      })
    }

    ;[...getCustomListings(), ...baseListings].forEach((listing) => {
      const seller = listing && listing.seller ? listing.seller : {}
      if (toLookupKey(seller.name) === normalizedNickname) {
        pushTarget(getSellerKey(listing), seller.name || '', seller.wechat || '')
      }
    })

    const profile = profileStore.getProfile()
    if (toLookupKey(profile.name) === normalizedNickname) {
      pushTarget(profileStore.getProfileIdentityKey(profile), profile.name || trimmedNickname, profile.wechat || '')
    }

    const uniqueTargets = targets.reduce((acc, target) => {
      const key = target.sellerKey || `name:${target.nicknameKey}`
      if (!acc.some((item) => (item.sellerKey || `name:${item.nicknameKey}`) === key)) {
        acc.push(target)
      }
      return acc
    }, [])

    if (!uniqueTargets.length) {
      return null
    }

    const nowIso = new Date(Date.now()).toISOString()
    const activeSubscriptions = getStoredSellerProSubscriptions()
    const nextSubscriptions = [...activeSubscriptions]
    let grantedCount = 0

    uniqueTargets.forEach((target) => {
      const matchIndex = nextSubscriptions.findIndex((subscription) => (
        (target.sellerKey && subscription.sellerKey === target.sellerKey) ||
        subscription.nicknameKey === target.nicknameKey ||
        (target.wechatKey && subscription.wechatKey === target.wechatKey)
      ))

      const nextSubscription = normalizeSellerProSubscription({
        id: target.sellerKey ? `pro-${target.sellerKey}` : `pro-name-${target.nicknameKey}`,
        sellerKey: target.sellerKey,
        nickname: target.nickname,
        nicknameKey: target.nicknameKey,
        wechat: target.wechat,
        isActive: true,
        grantedAt: nowIso,
        expiresAt: addOneMonth(nowIso),
        grantedBy: options.grantedBy || 'admin'
      })

      if (matchIndex >= 0) {
        nextSubscriptions[matchIndex] = nextSubscription
      } else {
        nextSubscriptions.push(nextSubscription)
      }

      grantedCount += 1
    })

    saveSellerProSubscriptions(nextSubscriptions)

    return {
      nickname: trimmedNickname || uniqueTargets[0].nickname,
      grantedCount,
      subscriptions: uniqueTargets
    }
  }

  return {
    SELLER_PRO_PHOTO_LIMIT,
    DEFAULT_PHOTO_LIMIT,
    PROMOTION_PLAN_CONFIGS,
    addOneMonth,
    normalizeSellerProSubscription,
    getStoredSellerProSubscriptions,
    saveSellerProSubscriptions,
    revokeSellerProSubscription,
    getSellerProLookup,
    isSellerProSeller,
    decorateListingSellerPro,
    normalizePromotion,
    decorateListingPromotion,
    sortByPromotionPriority,
    normalizePromotionRequest,
    getStoredPromotionRequests,
    savePromotionRequests,
    getPromotionPlans,
    getPromotionRequests,
    requestListingPromotion,
    activateListingPromotion,
    reviewPromotionRequest,
    getSellerProSubscriptions,
    getCurrentSellerPhotoLimit,
    grantSellerProByNickname
  }
}

module.exports = {
  createMarketPromotionHelpers
}
