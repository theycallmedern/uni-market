const api = require('../../services/api')
const listingsRuntime = require('../../services/api/runtime-listings')
const sellersRuntime = require('../../services/api/runtime-sellers')
const profileStore = require('../../utils/profile')
const savedStore = require('../../services/api/saved')
const storage = require('../../utils/storage')
const localeStore = require('../../utils/locale')
const reportsStore = require('../../services/api/reports')
const adminStore = require('../../services/api/admin')
const visibilityStore = require('../../services/api/visibility')
const reviewsStore = require('../../services/api/reviews')
const feedback = require('../../utils/ui-feedback')
const uiText = require('../../constants/messages')
const copyStore = require('../../constants/copy')
const INITIAL_THEME = storage.getThemeData()
const INITIAL_LOCALE = localeStore.getLocale()
const listingsApi = api.listings
const sellersApi = api.sellers
const FOUNDER_PROFILE_KEYS = new Set([
  'seller-mn45iqst-8ug7z6',
  'miskathaa'
])

function isFounderSeller(seller = {}) {
  const sellerId = String(seller.id || '').trim().toLowerCase()
  const sellerWechat = String(seller.wechat || '').trim().toLowerCase()

  return FOUNDER_PROFILE_KEYS.has(sellerId)
    || FOUNDER_PROFILE_KEYS.has(sellerWechat)
}

function getReportReasons(locale) {
  if (locale === 'zh') {
    return ['诈骗或欺诈', '违禁物品', '分类错误', '不当内容', '其他']
  }

  if (locale === 'ru') {
    return ['Мошенничество', 'Запрещённый товар', 'Неверная категория', 'Неприемлемый контент', 'Другое']
  }

  return ['Scam or fraud', 'Prohibited item', 'Wrong category', 'Inappropriate content', 'Other']
}

function getOtherReasonLabel(locale) {
  if (locale === 'zh') {
    return '其他'
  }

  if (locale === 'ru') {
    return 'Другое'
  }

  return 'Other'
}

function getHideConfirmText(locale) {
  if (locale === 'zh') {
    return '隐藏'
  }

  if (locale === 'ru') {
    return 'Скрыть'
  }

  return 'Hide'
}

function getBlockConfirmText(locale) {
  if (locale === 'zh') {
    return '屏蔽'
  }

  if (locale === 'ru') {
    return 'Заблокировать'
  }

  return 'Block'
}

function getSendConfirmText(locale) {
  if (locale === 'zh') {
    return '发送'
  }

  if (locale === 'ru') {
    return 'Отправить'
  }

  return 'Send'
}

function getSaveFeedbackText(isSaved, locale) {
  if (locale === 'zh') {
    return isSaved ? '已收藏' : '已移除'
  }

  if (locale === 'ru') {
    return isSaved ? 'Сохранено' : 'Убрано'
  }

  return isSaved ? 'Saved' : 'Removed'
}

function getHiddenNotice(listing, locale) {
  if (!listing || !listing.isHiddenByModeration) {
    return ''
  }

  if (locale === 'zh') {
    return listing.isCustom
      ? '该发布已被审核隐藏。只有你和管理员可以查看。'
      : '该发布已被审核隐藏。'
  }

  if (locale === 'ru') {
    return listing.isCustom
      ? 'Объявление скрыто модерацией. Его можете открыть только вы и администраторы.'
      : 'Объявление скрыто модерацией.'
  }

  return listing.isCustom
    ? 'Hidden by moderation. Only you and admins can open this listing.'
    : 'Hidden by moderation.'
}

function getSoldNotice(listing, locale) {
  if (!listing || !listing.isSold) {
    return ''
  }

  if (locale === 'zh') {
    return listing.soldOnUniMarket
      ? '这件物品已在 UniMarket 售出。'
      : '这件物品已在站外售出。'
  }

  if (locale === 'ru') {
    return listing.soldOnUniMarket
      ? 'Этот товар был продан на UniMarket.'
      : 'Этот товар был продан вне UniMarket.'
  }

  return listing.soldOnUniMarket
    ? 'This item was sold on UniMarket.'
    : 'This item was sold outside UniMarket.'
}

function getArchivedNotice(listing, locale) {
  if (!listing || !listing.isArchived) {
    return ''
  }

  if (locale === 'zh') {
    return '这条发布满 30 天后已自动归档。你仍可以在归档中恢复它。'
  }

  if (locale === 'ru') {
    return 'Это объявление автоматически ушло в архив через 30 дней. Его можно восстановить из архива.'
  }

  return 'This listing was auto-archived after 30 days. You can restore it from the archive.'
}

function getShareFallbackTitle(locale) {
  if (locale === 'zh') {
    return 'UniMarket 发布'
  }

  if (locale === 'ru') {
    return 'Объявление UniMarket'
  }

  return 'UniMarket listing'
}

function createReviewSummary(locale) {
  return {
    average: 0,
    averageLabel: copyStore.getReviewAverageLabel(0, 0, locale),
    count: 0,
    countLabel: copyStore.getReviewCountLabel(0, locale)
  }
}

function localizeReviewSummary(summary, locale) {
  const safeSummary = summary || createReviewSummary(locale)
  return {
    ...safeSummary,
    averageLabel: copyStore.getReviewAverageLabel(safeSummary.average, safeSummary.count, locale),
    countLabel: copyStore.getReviewCountLabel(safeSummary.count, locale)
  }
}

Page({
  data: {
    locale: INITIAL_LOCALE,
    copy: copyStore.getPageCopy('listing', INITIAL_LOCALE),
    themeMode: INITIAL_THEME.themeMode,
    themeClass: INITIAL_THEME.themeClass,
    isDarkTheme: INITIAL_THEME.isDarkTheme,
    navTitle: copyStore.getPageCopy('listing', INITIAL_LOCALE).navListing,
    id: '',
    listing: null,
    isSaved: false,
    isOwnListing: false,
    showOwnerAnalytics: false,
    ownerListingAnalytics: null,
    currentImage: 1,
    viewerVisible: false,
    viewerImages: [],
    viewerIndex: 0,
    feedbackVisible: false,
    feedbackText: '',
    feedbackIcon: '',
    hasReported: false,
    menuOpen: false,
    blockedByModeration: false,
    notFound: false,
    hiddenNotice: '',
    soldNotice: '',
    archivedNotice: '',
    sellerMemberLabel: '',
    listingPublishedLabel: '',
    sellerTrustLabel: '',
    sellerStatusLabel: 'New seller',
    sellerStatusClass: 'seller-rating__value--new',
    conditionChipClass: '',
    hiddenByUser: false,
    blockedSeller: false,
    viewTrackedId: '',
    reviewSummary: createReviewSummary(INITIAL_LOCALE)
  },

  onLoad(query) {
    this.refreshTheme()
    const id = String(query.id || '')
    this.setData({
      id,
      isSaved: savedStore.isListingSaved(id)
    }, () => {
      this.refreshListing()
    })
  },

  onShow() {
    this.refreshLocale(() => {
      this.refreshTheme()
      this.refreshListing()
    })
  },

  refreshTheme() {
    this.setData(storage.getThemeData())
  },

  refreshLocale(callback) {
    const locale = localeStore.getLocale()

    this.setData({
      locale,
      copy: copyStore.getPageCopy('listing', locale)
    }, callback)
  },

  async refreshListing() {
    const locale = this.data.locale
    const id = this.data.id
    if (visibilityStore.enabled) {
      await visibilityStore.syncPreferences()
    }
    const listing = listingsRuntime.enabled
      ? await listingsRuntime.getById(id, { includeArchived: true })
      : listingsApi.getById(id, { includeArchived: true })
    const rawListing = listingsRuntime.enabled
      ? await listingsRuntime.getById(id, { includeHiddenByUser: true, includeArchived: true })
      : listingsApi.getById(id, { includeHiddenByUser: true, includeArchived: true })

    if (!listing && rawListing) {
      const sellerKey = sellersRuntime.getSellerKey(rawListing)
      const hiddenByUser = visibilityStore.isListingHidden(id)
      const blockedSeller = visibilityStore.isSellerBlocked(sellerKey)

      wx.setNavigationBarTitle({
        title: blockedSeller ? this.data.copy.navSellerHidden : this.data.copy.navListingHidden
      })

      this.setData({
        navTitle: blockedSeller ? this.data.copy.navSellerHidden : this.data.copy.navListingHidden,
        listing: null,
        isOwnListing: false,
        showOwnerAnalytics: false,
        ownerListingAnalytics: null,
        blockedByModeration: false,
        notFound: false,
        hiddenNotice: '',
        soldNotice: '',
        archivedNotice: '',
        sellerMemberLabel: '',
        listingPublishedLabel: '',
        sellerTrustLabel: '',
        sellerStatusLabel: copyStore.getSellerStatusLabel('new', locale),
        sellerStatusClass: 'seller-rating__value--new',
        conditionChipClass: '',
        hiddenByUser,
        blockedSeller,
        reviewSummary: createReviewSummary(locale),
        viewTrackedId: ''
      })
      return
    }

    if (!listing) {
      wx.setNavigationBarTitle({
        title: this.data.copy.navListingUnavailable
      })

      this.setData({
        navTitle: this.data.copy.navListingUnavailable,
        listing: null,
        isOwnListing: false,
        showOwnerAnalytics: false,
        ownerListingAnalytics: null,
        blockedByModeration: false,
        notFound: true,
        hiddenNotice: '',
        soldNotice: '',
        archivedNotice: '',
        sellerMemberLabel: '',
        listingPublishedLabel: '',
        sellerTrustLabel: '',
        sellerStatusLabel: copyStore.getSellerStatusLabel('new', locale),
        sellerStatusClass: 'seller-rating__value--new',
        conditionChipClass: '',
        hiddenByUser: false,
        blockedSeller: false,
        reviewSummary: createReviewSummary(locale),
        viewTrackedId: ''
      })
      return
    }

    const sellerKey = sellersRuntime.getSellerKey(listing)
    const ownSellerProfile = sellersRuntime.getOwnProfile()
    const isOwnListing = Boolean(ownSellerProfile.sellerKey && ownSellerProfile.sellerKey === sellerKey)
    const isAdmin = await adminStore.getAdminState()
    const canViewHiddenListing = isAdmin || isOwnListing

    if (listing.isHiddenByModeration && !canViewHiddenListing) {
      wx.setNavigationBarTitle({
        title: this.data.copy.navListingUnavailable
      })

      this.setData({
        navTitle: this.data.copy.navListingUnavailable,
        listing: null,
        isOwnListing: false,
        showOwnerAnalytics: false,
        ownerListingAnalytics: null,
        blockedByModeration: true,
        notFound: false,
        hiddenNotice: '',
        soldNotice: '',
        archivedNotice: '',
        sellerMemberLabel: '',
        listingPublishedLabel: '',
        sellerTrustLabel: '',
        sellerStatusLabel: copyStore.getSellerStatusLabel('new', locale),
        sellerStatusClass: 'seller-rating__value--new',
        conditionChipClass: '',
        hiddenByUser: false,
        blockedSeller: false,
        reviewSummary: createReviewSummary(locale),
        viewTrackedId: ''
      })
      return
    }

    wx.setNavigationBarTitle({
      title: listing.title || this.data.copy.navListing
    })

    const sellerListings = listingsRuntime.enabled
      ? await listingsRuntime.getBySellerKey(sellerKey, {
        includeResolved: true,
        includeHiddenByUser: true,
        includeSold: true,
        includeArchived: true
      })
      : listingsApi.getBySellerKey(sellerKey, {
        includeResolved: true,
        includeHiddenByUser: true,
        includeSold: true,
        includeArchived: true
      })
    const sellerListingsCount = sellerListings.length
    const founderSeller = isFounderSeller(listing && listing.seller ? listing.seller : {})
    const sellerStatusLabel = founderSeller
      ? copyStore.translateBadge('Founder, UniMarket', locale)
      : listing.isSellerPro
        ? copyStore.getSellerStatusLabel('pro', locale)
        : sellerListingsCount >= 3
          ? copyStore.getSellerStatusLabel('seller', locale)
          : copyStore.getSellerStatusLabel('new', locale)
    const sellerStatusClass = founderSeller
      ? 'seller-rating__value--founder'
      : listing.isSellerPro
        ? 'seller-rating__value--pro'
        : sellerListingsCount >= 3
          ? 'seller-rating__value--seller'
          : 'seller-rating__value--new'
    const sellerSoldCount = sellerListings.filter((item) => Boolean(item && item.isSold && item.soldOnUniMarket)).length
    const sellerMemberLabel = copyStore.getMemberSinceChipLabel(listing && listing.seller ? listing.seller.joinedAt || '' : '', locale)
    const listingPublishedLabel = copyStore.getListingPublishedLabel(listing.createdAt, locale)
    const sellerTrustLabel = copyStore.getSellerTrustLabel(
      sellerSoldCount,
      sellerListingsCount,
      listing && listing.seller ? listing.seller.joinedAt || '' : '',
      locale
    )
    const ownerListingAnalytics = isOwnListing && listing.isSellerPro
      ? await listingsRuntime.getAnalytics(listing.id)
      : null
    const localizedListing = {
      ...listing,
      displayPromotedBadge: this.data.copy.promotedBadge,
      displayCondition: copyStore.translateCondition(listing.condition, locale),
      displaySubcategory: copyStore.translateSubcategory(listing.subcategory, locale),
      displayLocation: copyStore.translateCity(listing.location, locale)
    }
    const profile = profileStore.getProfile()
    let reviewSummary = localizeReviewSummary(
      await reviewsStore.getSummary({
        sellerUserId: listing && listing.seller ? listing.seller.id : '',
        sellerKey,
        listingId: listing.id,
        reviewerUserId: profile && profile.id ? profile.id : '',
        reviewerKey: profileStore.getProfileIdentityKey(profile)
      }),
      locale
    )

    this.setData({
      navTitle: listing.title || this.data.copy.navListing,
      listing: localizedListing,
      isSaved: savedStore.isListingSaved(id),
      isOwnListing,
      showOwnerAnalytics: Boolean(ownerListingAnalytics),
      ownerListingAnalytics,
      sellerInitial: listing.seller && listing.seller.name ? listing.seller.name.slice(0, 1) : 'U',
      currentImage: 1,
      hasReported: reportsStore.hasReportedListing(id),
      blockedByModeration: false,
      notFound: false,
      hiddenByUser: false,
      blockedSeller: false,
      reviewSummary,
      sellerMemberLabel,
      listingPublishedLabel,
      sellerTrustLabel,
      sellerStatusLabel,
      sellerStatusClass,
      conditionChipClass: this.getConditionChipClass(listing.condition),
      hiddenNotice: getHiddenNotice(listing, locale),
      soldNotice: getSoldNotice(listing, locale),
      archivedNotice: getArchivedNotice(listing, locale)
    })

    const trackedId = String(this.data.viewTrackedId || '')
    const listingId = String(listing.id || '')
    if (listingId && trackedId !== listingId) {
      this.setData({
        viewTrackedId: listingId
      })

      if (!isOwnListing) {
        if (listingsRuntime.writesEnabled) {
          listingsRuntime.recordView(listingId)
        } else {
          listingsApi.recordView(listingId)
        }
      }
    }
  },

  getConditionChipClass(condition) {
    const normalized = String(condition || '').trim().toLowerCase()

    if (normalized === 'new') return 'listing-chip--condition-new'
    if (normalized === 'like new') return 'listing-chip--condition-like-new'
    if (normalized === 'used') return 'listing-chip--condition-used'
    if (normalized === 'refurbished') return 'listing-chip--condition-refurbished'
    if (normalized === 'for parts') return 'listing-chip--condition-parts'
    if (normalized) return 'listing-chip--condition-default'

    return ''
  },

  onSwiperChange(e) {
    this.setData({
      currentImage: Number(e.detail.current) + 1
    })
  },

  previewListingImage(e) {
    const listing = this.data.listing || {}
    const images = Array.isArray(listing.images) ? listing.images.filter(Boolean) : []
    const imageIndex = Number(e.currentTarget.dataset.index || 0)
    if (!images.length) {
      return
    }

    this.setData({
      viewerVisible: true,
      viewerImages: images,
      viewerIndex: imageIndex
    })
  },

  previewSellerAvatar() {
    const listing = this.data.listing || {}
    const avatarUrl = listing && listing.seller ? listing.seller.avatarUrl || '' : ''

    if (!avatarUrl) {
      return
    }

    this.setData({
      viewerVisible: true,
      viewerImages: [avatarUrl],
      viewerIndex: 0
    })
  },

  closePhotoViewer() {
    this.setData({
      viewerVisible: false
    })
  },

  onPhotoViewerChange(e) {
    this.setData({
      viewerIndex: Number(e.detail.current) || 0
    })
  },

  async toggleSave() {
    if (!this.data.listing) return

    const result = savedStore.toggleSavedListing(this.data.id)
    const nextState = {
      isSaved: result.isSaved
    }

    if (this.data.showOwnerAnalytics) {
      nextState.ownerListingAnalytics = listingsRuntime.enabled
        ? await listingsRuntime.getAnalytics(this.data.id)
        : listingsApi.getAnalytics(this.data.id)
    }

    this.setData(nextState)
    this.playSaveFeedback(result.isSaved)
  },

  playSaveFeedback(isSaved) {
    this.setData({
      feedbackVisible: true,
      feedbackText: getSaveFeedbackText(isSaved, this.data.locale),
      feedbackIcon: isSaved ? '✓' : '✕'
    })

    setTimeout(() => {
      this.setData({
        feedbackVisible: false
      })
    }, 900)
  },

  contactSeller() {
    const listing = this.data.listing || {}
    if (listing.isSold) {
      feedback.showNeutralToast(uiText.LISTING.ITEM_ALREADY_SOLD)
      return
    }

    const seller = listing.seller || {}
    const wechat = seller.wechat || ''
    if (!wechat) return

    wx.setClipboardData({
      data: wechat,
      success: () => {
        reviewsStore.unlockReviewForListing(this.data.id)
        this.setData({
          reviewSummary: localizeReviewSummary(reviewsStore.getSellerReviewSummary(sellersApi.getSellerKey(listing)), this.data.locale)
        })

        feedback.showInfoModal({
          title: uiText.COMMON.WRITE_IN_WECHAT_TITLE,
          content: uiText.COMMON.WRITE_IN_WECHAT_CONTENT
        })
      }
    })
  },

  copyAddress() {
    const listing = this.data.listing || {}
    const address = String(listing.address || '').trim()

    if (!address) {
      feedback.showNeutralToast(uiText.LISTING.ADDRESS_UNAVAILABLE)
      return
    }

    wx.setClipboardData({
      data: address,
      success: () => {
        feedback.showSuccessToast(uiText.LISTING.ADDRESS_COPIED)
      }
    })
  },

  copyListingLink() {
    if (!this.data.id) {
      return
    }

    this.closeMenu()

    wx.setClipboardData({
      data: `/pages/listing/listing?id=${this.data.id}`,
      success: () => {
        feedback.showSuccessToast(uiText.LISTING.LINK_COPIED)
      }
    })
  },

  copySellerWechat() {
    this.closeMenu()
    this.contactSeller()
  },

  hideListing() {
    const listing = this.data.listing || {}

    if (!listing.id) {
      return
    }

    this.closeMenu()

    feedback.showModal({
      title: uiText.LISTING.HIDE_TITLE,
      content: uiText.LISTING.HIDE_CONTENT,
      confirmText: getHideConfirmText(this.data.locale),
      confirmColor: '#111111',
      success: (res) => {
        if (!res.confirm) return

        visibilityStore.hideListing(listing.id)
        feedback.showSuccessToast(uiText.LISTING.HIDDEN_SUCCESS)

        setTimeout(() => {
          this.goBackAfterHide()
        }, 350)
      }
    })
  },

  blockSeller() {
    const listing = this.data.listing || {}
    const sellerKey = sellersApi.getSellerKey(listing)
    const sellerName = listing.seller && listing.seller.name ? listing.seller.name : 'this seller'

    if (!sellerKey) {
      return
    }

    this.closeMenu()

    feedback.showModal({
      title: uiText.LISTING.BLOCK_TITLE,
      content: uiText.LISTING.blockContent(sellerName),
      confirmText: getBlockConfirmText(this.data.locale),
      confirmColor: '#ba2d2d',
      success: (res) => {
        if (!res.confirm) return

        visibilityStore.blockSeller(sellerKey)
        feedback.showSuccessToast(uiText.LISTING.BLOCKED_SUCCESS)

        setTimeout(() => {
          this.goBackAfterHide()
        }, 350)
      }
    })
  },

  openSellerProfile() {
    if (!this.data.id) {
      return
    }

    wx.navigateTo({
      url: `/pages/user-profile/user-profile?listingId=${this.data.id}`
    })
  },

  openMenu() {
    this.setData({
      menuOpen: true
    })
  },

  closeMenu() {
    this.setData({
      menuOpen: false
    })
  },

  stopMenuTap() {},

  reportListing() {
    if (!this.data.listing) return

    this.closeMenu()

    const listingId = this.data.id

    if (!listingId) return

    if (reportsStore.hasReportedListing(listingId)) {
      this.setData({ hasReported: true })
      feedback.showNeutralToast(uiText.LISTING.ALREADY_REPORTED)
      return
    }

    feedback.showActionSheet({
      itemList: getReportReasons(this.data.locale),
      success: (res) => {
        const reason = getReportReasons(this.data.locale)[res.tapIndex]
        if (!reason) return

        if (reason === getOtherReasonLabel(this.data.locale)) {
          feedback.showModal({
            title: uiText.LISTING.REPORT_DETAILS_TITLE,
            editable: true,
            placeholderText: uiText.LISTING.REPORT_DETAILS_PLACEHOLDER,
            confirmText: getSendConfirmText(this.data.locale),
            success: (modalRes) => {
              if (modalRes.confirm) {
                this.submitReport(reason, modalRes.content || '')
              }
            }
          })
          return
        }

        this.submitReport(reason, '')
      }
    })
  },

  submitReport(reason, note) {
    const listing = this.data.listing || {}
    const payload = {
      targetType: 'listing',
      listingId: this.data.id,
      listingTitle: listing.title || '',
      reason,
      note
    }

    reportsStore.submitReport(payload).then((result) => {
      if (!result) {
        feedback.showNeutralToast(uiText.LISTING.LISTING_UNAVAILABLE)
        return
      }

      this.setData({ hasReported: true })
      feedback.showSuccessToast(uiText.LISTING.REPORT_SENT)
    }).catch(() => {
      feedback.showNeutralToast(uiText.LISTING.LISTING_UNAVAILABLE)
    })
  },

  onShareAppMessage() {
    const listing = this.data.listing || {}

    return {
      title: listing.title || getShareFallbackTitle(this.data.locale),
      path: `/pages/listing/listing?id=${this.data.id}`,
      imageUrl: listing.image || ''
    }
  },

  goBackAfterHide() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }
    })
  },

  goToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})
