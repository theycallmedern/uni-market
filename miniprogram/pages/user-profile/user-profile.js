const api = require('../../services/api')
const listingsRuntime = require('../../services/api/runtime-listings')
const accountApi = require('../../services/api/runtime-account')
const sellersRuntime = require('../../services/api/runtime-sellers')
const universitiesStore = require('../../utils/universities')
const profileStore = require('../../utils/profile')
const reportsStore = require('../../services/api/reports')
const visibilityStore = require('../../services/api/visibility')
const reviewsStore = require('../../services/api/reviews')
const storage = require('../../utils/storage')
const localeStore = require('../../utils/locale')
const feedback = require('../../utils/ui-feedback')
const uiText = require('../../constants/messages')
const copyStore = require('../../constants/copy')
const INITIAL_THEME = storage.getThemeData()
const INITIAL_LOCALE = localeStore.getLocale()
const sellersApi = api.sellers
const FOUNDER_PROFILE_KEYS = new Set([
  'seller-mn45iqst-8ug7z6',
  'miskathaa'
])
const FOUNDER_INSTAGRAM_HANDLE = 'miskathaa'
const FOUNDER_STARTED_AT = '2026-03-16'

function getProfileReportReasons(locale) {
  if (locale === 'zh') {
    return ['诈骗或欺诈', '虚假身份', '不当行为', '垃圾信息', '其他']
  }

  if (locale === 'ru') {
    return ['Мошенничество', 'Поддельная личность', 'Неприемлемое поведение', 'Спам', 'Другое']
  }

  return ['Scam or fraud', 'Fake identity', 'Inappropriate behavior', 'Spam', 'Other']
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

function getReviewRatingOptions(locale) {
  if (locale === 'zh') {
    return [
      { label: '5 星 - 非常好', value: 5 },
      { label: '4 星 - 不错', value: 4 },
      { label: '3 星 - 一般', value: 3 },
      { label: '2 星 - 较差', value: 2 },
      { label: '1 星 - 很差', value: 1 }
    ]
  }

  if (locale === 'ru') {
    return [
      { label: '5 звёзд - Отлично', value: 5 },
      { label: '4 звезды - Хорошо', value: 4 },
      { label: '3 звезды - Нормально', value: 3 },
      { label: '2 звезды - Плохо', value: 2 },
      { label: '1 звезда - Очень плохо', value: 1 }
    ]
  }

  return [
    { label: '5 stars - Excellent', value: 5 },
    { label: '4 stars - Good', value: 4 },
    { label: '3 stars - Okay', value: 3 },
    { label: '2 stars - Poor', value: 2 },
    { label: '1 star - Bad', value: 1 }
  ]
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

function getShareProfileTitle(sellerName, locale) {
  if (sellerName) {
    if (locale === 'zh') {
      return `${sellerName} 的 UniMarket 主页`
    }

    if (locale === 'ru') {
      return `${sellerName} в UniMarket`
    }

    return `${sellerName} on UniMarket`
  }

  if (locale === 'zh') {
    return 'UniMarket 主页'
  }

  if (locale === 'ru') {
    return 'Профиль UniMarket'
  }

  return 'UniMarket profile'
}

function createEmptyReviewSummary(locale) {
  return {
    average: 0,
    averageLabel: copyStore.getReviewAverageLabel(0, 0, locale),
    count: 0,
    countLabel: copyStore.getReviewCountLabel(0, locale),
    recentReviews: []
  }
}

function formatReviewDate(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  } catch (error) {
    return String(value || '').slice(0, 10)
  }
}

function localizeReviewSummary(summary, locale) {
  const safeSummary = summary || createEmptyReviewSummary(locale)

  return {
    ...safeSummary,
    averageLabel: copyStore.getReviewAverageLabel(safeSummary.average, safeSummary.count, locale),
    countLabel: copyStore.getReviewCountLabel(safeSummary.count, locale),
    recentReviews: Array.isArray(safeSummary.recentReviews)
      ? safeSummary.recentReviews.map((review) => ({
          ...review,
          dateLabel: review.dateLabel || formatReviewDate(review.createdAt)
        }))
      : []
  }
}

function localizeSeller(seller, locale) {
  if (!seller) {
    return null
  }

  const founderBadge = isFounderProfile(seller) ? 'Founder, UniMarket' : ''

  return {
    ...seller,
    joinedAt: founderBadge ? FOUNDER_STARTED_AT : (seller.joinedAt || ''),
    displayBadge: copyStore.translateBadge(seller.badge, locale),
    displayCity: copyStore.translateCity(seller.city, locale),
    founderBadge,
    displayFounderBadge: founderBadge ? copyStore.translateBadge(founderBadge, locale) : '',
    founderInstagram: founderBadge ? FOUNDER_INSTAGRAM_HANDLE : '',
    founderInstagramLabel: founderBadge ? `@${FOUNDER_INSTAGRAM_HANDLE}` : ''
  }
}

function isFounderProfile(seller) {
  const sellerId = String(seller && seller.id ? seller.id : '').trim().toLowerCase()
  const sellerKey = String(seller && seller.sellerKey ? seller.sellerKey : '').trim().toLowerCase()
  const sellerWechat = String(seller && seller.wechat ? seller.wechat : '').trim().toLowerCase()

  return FOUNDER_PROFILE_KEYS.has(sellerId)
    || FOUNDER_PROFILE_KEYS.has(sellerKey)
    || FOUNDER_PROFILE_KEYS.has(sellerWechat)
}

function localizeListings(listings = [], locale) {
  const copy = copyStore.getPageCopy('userProfile', locale)

  return listings.map((listing) => ({
    ...listing,
    displayLocation: copyStore.translateCity(listing.location, locale),
    displayPromotedBadge: copy.promotedBadge
  }))
}

function buildOwnSellerProfileFromBackend(profile, listings = [], isSellerPro = false, analytics = null) {
  const safeProfile = profile || profileStore.getProfile()
  const safeListings = Array.isArray(listings) ? listings : []
  const activeListings = safeListings.filter((listing) => listing && !listing.isSold)
  const soldCount = safeListings.filter((listing) => Boolean(listing && listing.isSold && listing.soldOnUniMarket)).length
  const sellerKey = String(safeProfile.id || safeProfile.wechat || safeProfile.name || '').trim().toLowerCase()

  return {
    sellerKey,
    id: safeProfile.id || '',
    name: safeProfile.name || 'You',
    badge: isSellerPro ? 'Seller Pro' : 'Verified student',
    avatarUrl: safeProfile.avatarUrl || '',
    campus: safeProfile.campus || '',
    city: safeProfile.city || 'Hangzhou',
    bio: safeProfile.bio || '',
    joinedAt: safeProfile.joinedAt || '',
    wechat: safeProfile.wechat || '',
    isSellerPro: Boolean(isSellerPro),
    soldCount,
    listings: activeListings,
    analytics
  }
}

function getCurrentReviewerKey() {
  return profileStore.getProfileIdentityKey(profileStore.getProfile())
}

function buildUnavailableState(locale, { navTitle, blockedSeller = false, notFound = false } = {}) {
  return {
    navTitle,
    isOwnProfile: false,
    seller: null,
    listings: [],
    listingsSectionTitle: '',
    activeListingsSubtitle: copyStore.getActiveListingsSubtitle(0, locale),
    soldCount: 0,
    avatarInitial: 'U',
    memberSinceChipLabel: '',
    isEditingProfile: false,
    reviewSummary: createEmptyReviewSummary(locale),
    canLeaveReview: false,
    hasReviewedCurrentListing: false,
    hasReported: false,
    isUniversityPublic: false,
    trackedProfileViewKey: '',
    notFound,
    blockedSeller
  }
}

Page({
  data: {
    locale: INITIAL_LOCALE,
    copy: copyStore.getPageCopy('userProfile', INITIAL_LOCALE),
    themeMode: INITIAL_THEME.themeMode,
    themeClass: INITIAL_THEME.themeClass,
    isDarkTheme: INITIAL_THEME.isDarkTheme,
    navTitle: copyStore.getPageCopy('userProfile', INITIAL_LOCALE).navSellerProfile,
    isOwnProfile: false,
    isEditingProfile: false,
    listingId: '',
    seller: null,
    listings: [],
    listingsSectionTitle: '',
    activeListingsSubtitle: copyStore.getActiveListingsSubtitle(0, INITIAL_LOCALE),
    soldCount: 0,
    avatarInitial: 'U',
    memberSinceChipLabel: '',
    profileDraft: profileStore.getProfile(),
    universityValues: universitiesStore.HANGZHOU_UNIVERSITIES,
    universityOptions: copyStore.getUniversityOptionLabels(universitiesStore.HANGZHOU_UNIVERSITIES, INITIAL_LOCALE),
    universityIndex: universitiesStore.getUniversityIndex(profileStore.getProfile().campus, universitiesStore.HANGZHOU_UNIVERSITIES),
    universitySheetOpen: false,
    reviewSummary: createEmptyReviewSummary(INITIAL_LOCALE),
    canLeaveReview: false,
    hasReviewedCurrentListing: false,
    hasReported: false,
    menuOpen: false,
    viewerVisible: false,
    viewerImages: [],
    viewerIndex: 0,
    isUniversityPublic: false,
    trackedProfileViewKey: '',
    notFound: false,
    blockedSeller: false
  },

  onLoad(query) {
    const listingId = String(query.listingId || '')
    const isOwnProfile = String(query.self || '') === '1'

    this.setData({ listingId, isOwnProfile }, () => {
      this.refreshPage()
    })
  },

  onShow() {
    this.refreshLocale(() => {
      this.refreshTheme(() => {
        if (this.data.listingId || this.data.isOwnProfile) {
          this.refreshPage()
        }
      })
    })
  },

  refreshTheme(callback) {
    this.setData(storage.getThemeData(), callback)
  },

  refreshLocale(callback) {
    const locale = localeStore.getLocale()

    this.setData({
      locale,
      copy: copyStore.getPageCopy('userProfile', locale),
      universityOptions: copyStore.getUniversityOptionLabels(this.data.universityValues || universitiesStore.HANGZHOU_UNIVERSITIES, locale)
    }, callback)
  },

  refreshPage() {
    if (this.data.isOwnProfile) {
      this.refreshOwnProfile()
      return
    }

    this.refreshSellerProfile()
  },

  async refreshOwnProfile() {
    const locale = this.data.locale
    let profile = profileStore.getProfile()
    let me = null
    let myListings = []

    try {
      me = await accountApi.getMe()
    } catch (error) {
      me = null
    }

    try {
      myListings = await listingsRuntime.getMy()
    } catch (error) {
      myListings = sellersRuntime.enabled ? [] : sellersApi.getOwnProfile().listings || []
    }

    if (me && me.profile) {
      profile = profileStore.saveProfile(me.profile)
    }

    let sellerProfile = buildOwnSellerProfileFromBackend(
      profile,
      myListings,
      Boolean(me && me.isSellerPro),
      me && me.analytics ? me.analytics : null
    )

    if (!sellerProfile || !sellerProfile.sellerKey) {
      sellerProfile = sellersRuntime.getOwnProfile()
    }

    const localizedSellerProfile = localizeSeller(sellerProfile, locale)
    const currentProfile = profileStore.getProfile()
    const reviewSummary = localizeReviewSummary(
      await reviewsStore.getSummary({
        sellerUserId: localizedSellerProfile && localizedSellerProfile.id ? localizedSellerProfile.id : '',
        sellerKey: localizedSellerProfile.sellerKey,
        reviewerUserId: currentProfile && currentProfile.id ? currentProfile.id : ''
      }),
      locale
    )
    const localizedListings = localizeListings(sellerProfile.listings || [], locale)
    const nextState = {
      navTitle: this.data.copy.navMyProfile,
      seller: localizedSellerProfile,
      listings: localizedListings,
      listingsSectionTitle: copyStore.getListingsSectionTitle(true, localizedSellerProfile.name, locale),
      activeListingsSubtitle: copyStore.getActiveListingsSubtitle(localizedListings.length, locale),
      soldCount: Number(localizedSellerProfile.soldCount || 0),
      avatarInitial: profileStore.getProfileInitial(profile),
      memberSinceChipLabel: copyStore.getMemberSinceChipLabel(localizedSellerProfile.joinedAt, locale),
      reviewSummary,
      canLeaveReview: false,
      hasReviewedCurrentListing: false,
      hasReported: false,
      isUniversityPublic: !universitiesStore.isUniversityPrivateValue(localizedSellerProfile.campus || ''),
      trackedProfileViewKey: '',
      notFound: false,
      blockedSeller: false,
      universityIndex: universitiesStore.getUniversityIndex(profile.campus, this.data.universityValues)
    }

    if (!this.data.isEditingProfile) {
      nextState.profileDraft = { ...profile }
    }

    this.setData(nextState)
  },

  async refreshSellerProfile() {
    if (visibilityStore.enabled) {
      await visibilityStore.syncPreferences()
    }
    const sellerProfile = sellersRuntime.enabled
      ? await sellersRuntime.getProfileByListingId(this.data.listingId)
      : sellersApi.getProfileByListingId(this.data.listingId)
    const rawSellerProfile = sellersRuntime.enabled
      ? sellerProfile
      : sellersApi.getProfileByListingId(this.data.listingId, { includeHiddenByUser: true })
    const ownSellerProfile = sellersRuntime.getOwnProfile()

    if (sellerProfile && ownSellerProfile.sellerKey && sellerProfile.sellerKey === ownSellerProfile.sellerKey) {
      this.setData({
        isOwnProfile: true
      })
      this.refreshOwnProfile()
      return
    }

    if (!sellerProfile && rawSellerProfile && visibilityStore.isSellerBlocked(rawSellerProfile.sellerKey)) {
      this.setData(buildUnavailableState(this.data.locale, {
        navTitle: this.data.copy.navSellerHidden,
        blockedSeller: true
      }))
      return
    }

    if (!sellerProfile) {
      this.setData(buildUnavailableState(this.data.locale, {
        navTitle: this.data.copy.navProfileUnavailable,
        notFound: true
      }))
      return
    }

    const locale = this.data.locale
    const localizedSellerProfile = localizeSeller(sellerProfile, locale)
    const localizedListings = localizeListings(localizedSellerProfile.listings || [], locale)
    const profile = profileStore.getProfile()
    const reviewSummarySource = await reviewsStore.getSummary({
      sellerUserId: localizedSellerProfile && localizedSellerProfile.id ? localizedSellerProfile.id : '',
      sellerKey: localizedSellerProfile.sellerKey,
      listingId: this.data.listingId,
      reviewerUserId: profile && profile.id ? profile.id : '',
      reviewerKey: getCurrentReviewerKey()
    })
    const reviewSummary = localizeReviewSummary(reviewSummarySource, locale)
    const hasReviewedCurrentListing = Boolean(reviewSummarySource && reviewSummarySource.hasReviewedCurrentListing)

    this.setData({
      navTitle: localizedSellerProfile.name || this.data.copy.navSellerProfile,
      isOwnProfile: false,
      seller: localizedSellerProfile,
      listings: localizedListings,
      listingsSectionTitle: copyStore.getListingsSectionTitle(false, localizedSellerProfile.name, locale),
      activeListingsSubtitle: copyStore.getActiveListingsSubtitle(localizedListings.length, locale),
      soldCount: Number(localizedSellerProfile.soldCount || 0),
      avatarInitial: String(localizedSellerProfile.name || 'U').slice(0, 1).toUpperCase(),
      memberSinceChipLabel: copyStore.getMemberSinceChipLabel(localizedSellerProfile.joinedAt, locale),
      reviewSummary,
      canLeaveReview: reviewsStore.canReviewListing(this.data.listingId),
      hasReviewedCurrentListing,
      hasReported: reportsStore.hasReportedProfile(localizedSellerProfile.sellerKey),
      isUniversityPublic: !universitiesStore.isUniversityPrivateValue(localizedSellerProfile.campus || ''),
      notFound: false,
      blockedSeller: false
    }, () => {
      const trackedProfileViewKey = String(this.data.trackedProfileViewKey || '')
      const sellerKey = String(localizedSellerProfile.sellerKey || '')

      if (sellerKey && trackedProfileViewKey !== sellerKey) {
        sellersRuntime.recordProfileView(sellerKey)
        this.setData({
          trackedProfileViewKey: sellerKey
        })
      }
    })
  },

  openListing(e) {
    const { id } = e.currentTarget.dataset

    wx.navigateTo({
      url: `/pages/listing/listing?id=${id}`
    })
  },

  previewAvatar() {
    const seller = this.data.seller || {}
    const avatarUrl = seller.avatarUrl || ''

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

  contactSeller() {
    if (this.data.isOwnProfile) {
      return
    }

    const seller = this.data.seller || {}

    if (!seller.wechat) {
      return
    }

    wx.setClipboardData({
      data: seller.wechat,
      success: () => {
        if (this.data.listingId) {
          reviewsStore.unlockReviewForListing(this.data.listingId)
        }

        this.setData({
          canLeaveReview: Boolean(this.data.listingId)
        })

        feedback.showInfoModal({
          title: uiText.COMMON.WRITE_IN_WECHAT_TITLE,
          content: uiText.COMMON.WRITE_IN_WECHAT_CONTENT
        })
      }
    })
  },

  copyFounderInstagram() {
    const seller = this.data.seller || {}
    const founderInstagram = String(seller.founderInstagram || '').trim()

    if (!founderInstagram) {
      return
    }

    wx.setClipboardData({
      data: founderInstagram,
      success: () => {
        feedback.showSuccessToast(uiText.USER_PROFILE.INSTAGRAM_COPIED)
      }
    })
  },

  copyProfileLink() {
    this.closeMenu()

    const path = this.data.isOwnProfile
      ? '/pages/user-profile/user-profile?self=1'
      : `/pages/user-profile/user-profile?listingId=${this.data.listingId}`

    wx.setClipboardData({
      data: path,
      success: () => {
        feedback.showSuccessToast(uiText.USER_PROFILE.LINK_COPIED)
      }
    })
  },

  copySellerWechat() {
    this.closeMenu()
    this.contactSeller()
  },

  startEditProfile() {
    const profile = profileStore.getProfile()
    this.closeMenu()

    this.setData({
      isEditingProfile: true,
      profileDraft: { ...profile },
      universityIndex: universitiesStore.getUniversityIndex(profile.campus, this.data.universityValues),
      universitySheetOpen: false
    })
  },

  cancelEditProfile() {
    this.setData({
      isEditingProfile: false,
      profileDraft: { ...profileStore.getProfile() },
      universitySheetOpen: false
    })
  },

  onProfileFieldInput(e) {
    const { field } = e.currentTarget.dataset
    const rawValue = e.detail.value
    let value = rawValue

    if (field === 'name') {
      return
    } else if (field === 'bio') {
      value = profileStore.sanitizeProfileBioDraft(rawValue)
    }

    const nextDraft = {
      ...(this.data.profileDraft || {})
    }
    nextDraft[field] = value

    this.setData({
      profileDraft: nextDraft
    })
  },

  openUniversitySheet() {
    this.setData({
      universitySheetOpen: true
    })
  },

  closeUniversitySheet() {
    this.setData({
      universitySheetOpen: false
    })
  },

  stopUniversitySheetTap() {},

  onUniversityChange(e) {
    const universityIndex = Number(
      e && e.detail && typeof e.detail.value !== 'undefined'
        ? e.detail.value
        : e && e.currentTarget && e.currentTarget.dataset
          ? e.currentTarget.dataset.index
          : 0
    )
    const universityValues = this.data.universityValues || []
    const campus = universityValues[universityIndex] || universityValues[0] || ''

    this.setData({
      universityIndex,
      universitySheetOpen: false,
      'profileDraft.campus': campus
    })
  },

  persistAvatar(tempFilePath, onDone) {
    if (!tempFilePath) {
      onDone('')
      return
    }

    if (!wx.saveFile) {
      onDone(tempFilePath)
      return
    }

    wx.saveFile({
      tempFilePath,
      success: (res) => {
        onDone(res.savedFilePath || tempFilePath)
      },
      fail: () => {
        onDone(tempFilePath)
      }
    })
  },

  changeProfilePhoto() {
    const applyPickedPhoto = (tempFilePath) => {
      this.persistAvatar(tempFilePath, (avatarUrl) => {
        this.setData({
          'profileDraft.avatarUrl': avatarUrl
        })
      })
    }

    if (wx.chooseMedia) {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const file = (res.tempFiles || [])[0]
          applyPickedPhoto(file && file.tempFilePath ? file.tempFilePath : '')
        }
      })
      return
    }

    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        applyPickedPhoto((res.tempFilePaths || [])[0] || '')
      }
    })
  },

  removeProfilePhoto() {
    this.setData({
      'profileDraft.avatarUrl': ''
    })
  },

  async saveProfile() {
    const previousProfile = profileStore.getProfile()
    const universityValues = this.data.universityValues || []
    const selectedCampus = universityValues[this.data.universityIndex] || universityValues[0] || ''
    const normalizedProfile = profileStore.normalizeProfile({
      ...(this.data.profileDraft || {}),
      campus: selectedCampus
    })

    if (!normalizedProfile.campus) {
      feedback.showNeutralToast(uiText.USER_PROFILE.UNIVERSITY_REQUIRED)
      return
    }

    const savedProfile = profileStore.saveProfile(normalizedProfile)
    try {
      await accountApi.updateMyProfile(savedProfile)
    } catch (error) {
      sellersApi.syncCurrentProfileIntoListings(previousProfile, savedProfile)
      sellersApi.preserveCurrentProfileSellerPro(previousProfile, savedProfile)
      sellersApi.preserveCurrentProfileIdentityData(previousProfile, savedProfile)
    }
    this.setData({
      isEditingProfile: false,
      universitySheetOpen: false
    })
    this.refreshOwnProfile()

    feedback.showSuccessToast(uiText.USER_PROFILE.PROFILE_SAVED)
  },

  leaveReview() {
    const seller = this.data.seller || {}

    if (!seller.sellerKey || !this.data.listingId) {
      return
    }

    if (this.data.hasReviewedCurrentListing) {
      feedback.showNeutralToast(uiText.USER_PROFILE.REVIEW_ALREADY_ADDED)
      return
    }

    if (!this.data.canLeaveReview) {
      feedback.showNeutralToast(uiText.USER_PROFILE.REVIEW_UNLOCK_REQUIRED)
      return
    }

    const reviewRatingOptions = getReviewRatingOptions(this.data.locale)

    feedback.showActionSheet({
      itemList: reviewRatingOptions.map((item) => item.label),
      success: (res) => {
        const choice = reviewRatingOptions[res.tapIndex]

        if (!choice) {
          return
        }

        feedback.showModal({
          title: uiText.USER_PROFILE.REVIEW_MODAL_TITLE,
          editable: true,
          placeholderText: uiText.USER_PROFILE.REVIEW_MODAL_PLACEHOLDER,
          confirmText: uiText.USER_PROFILE.REVIEW_MODAL_CONFIRM,
          success: (modalRes) => {
            if (!modalRes.confirm) {
              return
            }

            const reviewer = profileStore.getProfile()

            reviewsStore.submitReview({
              sellerUserId: seller.id,
              sellerKey: seller.sellerKey,
              listingId: this.data.listingId,
              rating: choice.value,
              comment: modalRes.content || '',
              reviewerKey: profileStore.getProfileIdentityKey(reviewer),
              reviewerName: reviewer.name || this.data.copy.reviewerFallback
            }).then((review) => {
              if (!review || review.alreadyExists) {
                feedback.showNeutralToast(uiText.USER_PROFILE.REVIEW_ALREADY_EXISTS)
                return
              }

              this.refreshSellerProfile()
              feedback.showSuccessToast(uiText.USER_PROFILE.REVIEW_POSTED)
            }).catch(() => {
              feedback.showNeutralToast(uiText.USER_PROFILE.REVIEW_ALREADY_EXISTS)
            })
          }
        })
      }
    })
  },

  blockSeller() {
    if (this.data.isOwnProfile) {
      return
    }

    const seller = this.data.seller || {}

    if (!seller.sellerKey) {
      return
    }

    this.closeMenu()

    feedback.showModal({
      title: uiText.USER_PROFILE.BLOCK_TITLE,
      content: uiText.USER_PROFILE.blockContent(seller.name),
      confirmText: getBlockConfirmText(this.data.locale),
      confirmColor: '#ba2d2d',
      success: (res) => {
        if (!res.confirm) return

        visibilityStore.blockSeller(seller.sellerKey)
        feedback.showSuccessToast(uiText.USER_PROFILE.BLOCKED_SUCCESS)

        setTimeout(() => {
          wx.navigateBack({
            fail: () => {
              wx.switchTab({
                url: '/pages/index/index'
              })
            }
          })
        }, 350)
      }
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

  reportProfile() {
    if (this.data.isOwnProfile) {
      return
    }

    const seller = this.data.seller || {}

    this.closeMenu()

    if (!seller.sellerKey) {
      return
    }

    if (reportsStore.hasReportedProfile(seller.sellerKey)) {
      this.setData({ hasReported: true })
      feedback.showNeutralToast(uiText.USER_PROFILE.ALREADY_REPORTED)
      return
    }

    feedback.showActionSheet({
      itemList: getProfileReportReasons(this.data.locale),
      success: (res) => {
        const reason = getProfileReportReasons(this.data.locale)[res.tapIndex]
        if (!reason) return

        if (reason === getOtherReasonLabel(this.data.locale)) {
          feedback.showModal({
            title: uiText.USER_PROFILE.REPORT_PROFILE_TITLE,
            editable: true,
            placeholderText: uiText.USER_PROFILE.REPORT_PROFILE_PLACEHOLDER,
            confirmText: uiText.USER_PROFILE.REPORT_PROFILE_CONFIRM,
            success: (modalRes) => {
              if (modalRes.confirm) {
                this.submitProfileReport(reason, modalRes.content || '')
              }
            }
          })
          return
        }

        this.submitProfileReport(reason, '')
      }
    })
  },

  submitProfileReport(reason, note) {
    const seller = this.data.seller || {}
    const payload = {
      targetType: 'profile',
      profileUserId: seller.id || seller.sellerKey,
      profileKey: seller.sellerKey,
      profileName: seller.name || '',
      sourceListingId: this.data.listingId,
      reason,
      note
    }

    reportsStore.submitProfileReport(payload).then((result) => {
      if (!result) {
        feedback.showNeutralToast(uiText.USER_PROFILE.REPORT_SENT)
        return
      }

      this.setData({
        hasReported: true
      })

      feedback.showSuccessToast(uiText.USER_PROFILE.REPORT_SENT)
    }).catch(() => {
      feedback.showNeutralToast(uiText.USER_PROFILE.REPORT_SENT)
    })
  },

  onShareAppMessage() {
    const seller = this.data.seller || {}
    const listings = this.data.listings || []
    const coverListing = listings[0] || {}
    const path = this.data.isOwnProfile
      ? '/pages/user-profile/user-profile?self=1'
      : `/pages/user-profile/user-profile?listingId=${this.data.listingId}`

    return {
      title: getShareProfileTitle(seller.name, this.data.locale),
      path,
      imageUrl: coverListing.image || ''
    }
  }
})
