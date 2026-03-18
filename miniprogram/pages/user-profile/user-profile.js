const market = require('../../data/market')
const universitiesStore = require('../../utils/universities')
const profileStore = require('../../utils/profile')
const reportsStore = require('../../utils/reports')
const visibilityStore = require('../../utils/visibility')
const reviewsStore = require('../../utils/reviews')
const feedback = require('../../utils/ui-feedback')
const uiText = require('../../constants/messages')

const PROFILE_REPORT_REASONS = [
  'Scam or fraud',
  'Fake identity',
  'Inappropriate behavior',
  'Spam',
  'Other'
]

const REVIEW_RATING_OPTIONS = [
  { label: '5 stars - Excellent', value: 5 },
  { label: '4 stars - Good', value: 4 },
  { label: '3 stars - Okay', value: 3 },
  { label: '2 stars - Poor', value: 2 },
  { label: '1 star - Bad', value: 1 }
]

const EMPTY_REVIEW_SUMMARY = {
  average: 0,
  averageLabel: 'New',
  count: 0,
  countLabel: '0 reviews',
  recentReviews: []
}

function buildUnavailableState({ navTitle, blockedSeller = false, notFound = false } = {}) {
  return {
    navTitle,
    isOwnProfile: false,
    seller: null,
    listings: [],
    soldCount: 0,
    avatarInitial: 'U',
    memberSinceLabel: '',
    isEditingProfile: false,
    reviewSummary: { ...EMPTY_REVIEW_SUMMARY },
    canLeaveReview: false,
    hasReviewedCurrentListing: false,
    hasReported: false,
    isUniversityPublic: false,
    notFound,
    blockedSeller
  }
}

Page({
  data: {
    navTitle: 'Seller profile',
    isOwnProfile: false,
    isEditingProfile: false,
    listingId: '',
    seller: null,
    listings: [],
    soldCount: 0,
    avatarInitial: 'U',
    memberSinceLabel: '',
    profileDraft: profileStore.getProfile(),
    universityOptions: universitiesStore.HANGZHOU_UNIVERSITIES,
    universityIndex: universitiesStore.getUniversityIndex(profileStore.getProfile().campus, universitiesStore.HANGZHOU_UNIVERSITIES),
    reviewSummary: { ...EMPTY_REVIEW_SUMMARY },
    canLeaveReview: false,
    hasReviewedCurrentListing: false,
    hasReported: false,
    menuOpen: false,
    viewerVisible: false,
    viewerImages: [],
    viewerIndex: 0,
    isUniversityPublic: false,
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
    if (this.data.listingId || this.data.isOwnProfile) {
      this.refreshPage()
    }
  },

  refreshPage() {
    if (this.data.isOwnProfile) {
      this.refreshOwnProfile()
      return
    }

    this.refreshSellerProfile()
  },

  refreshOwnProfile() {
    const sellerProfile = market.getOwnSellerProfile()
    const reviewSummary = reviewsStore.getSellerReviewSummary(sellerProfile.sellerKey)
    const profile = profileStore.getProfile()
    const nextState = {
      navTitle: 'My profile',
      seller: sellerProfile,
      listings: sellerProfile.listings || [],
      soldCount: Number(sellerProfile.soldCount || 0),
      avatarInitial: profileStore.getProfileInitial(profile),
      memberSinceLabel: profileStore.formatMemberSince(sellerProfile.joinedAt),
      reviewSummary,
      canLeaveReview: false,
      hasReviewedCurrentListing: false,
      hasReported: false,
      isUniversityPublic: !universitiesStore.isUniversityPrivateValue(sellerProfile.campus || ''),
      notFound: false,
      blockedSeller: false,
      universityIndex: universitiesStore.getUniversityIndex(profile.campus, this.data.universityOptions)
    }

    if (!this.data.isEditingProfile) {
      nextState.profileDraft = { ...profile }
    }

    this.setData(nextState)
  },

  refreshSellerProfile() {
    const sellerProfile = market.getSellerProfileByListingId(this.data.listingId)
    const rawSellerProfile = market.getSellerProfileByListingId(this.data.listingId, { includeHiddenByUser: true })
    const ownSellerProfile = market.getOwnSellerProfile()

    if (sellerProfile && ownSellerProfile.sellerKey && sellerProfile.sellerKey === ownSellerProfile.sellerKey) {
      this.setData({
        isOwnProfile: true
      })
      this.refreshOwnProfile()
      return
    }

    if (!sellerProfile && rawSellerProfile && visibilityStore.isSellerBlocked(rawSellerProfile.sellerKey)) {
      this.setData(buildUnavailableState({
        navTitle: 'Seller hidden',
        blockedSeller: true
      }))
      return
    }

    if (!sellerProfile) {
      this.setData(buildUnavailableState({
        navTitle: 'Profile unavailable',
        notFound: true
      }))
      return
    }

    this.setData({
      navTitle: sellerProfile.name || 'Seller profile',
      isOwnProfile: false,
      seller: sellerProfile,
      listings: sellerProfile.listings || [],
      soldCount: Number(sellerProfile.soldCount || 0),
      avatarInitial: String(sellerProfile.name || 'U').slice(0, 1).toUpperCase(),
      memberSinceLabel: profileStore.formatMemberSince(sellerProfile.joinedAt),
      reviewSummary: reviewsStore.getSellerReviewSummary(sellerProfile.sellerKey),
      canLeaveReview: reviewsStore.canReviewListing(this.data.listingId),
      hasReviewedCurrentListing: reviewsStore.hasReviewedListing(this.data.listingId),
      hasReported: reportsStore.hasReportedProfile(sellerProfile.sellerKey),
      isUniversityPublic: !universitiesStore.isUniversityPrivateValue(sellerProfile.campus || ''),
      notFound: false,
      blockedSeller: false
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
      universityIndex: universitiesStore.getUniversityIndex(profile.campus, this.data.universityOptions)
    })
  },

  cancelEditProfile() {
    this.setData({
      isEditingProfile: false,
      profileDraft: { ...profileStore.getProfile() }
    })
  },

  onProfileFieldInput(e) {
    const { field } = e.currentTarget.dataset
    const rawValue = e.detail.value
    let value = rawValue

    if (field === 'name') {
      value = profileStore.sanitizeProfileName(rawValue)
    } else if (field === 'wechat') {
      value = profileStore.sanitizeWechatId(rawValue)
    } else if (field === 'bio') {
      value = profileStore.sanitizeProfileBio(rawValue)
    }

    this.setData({
      [`profileDraft.${field}`]: value
    })
  },

  onUniversityChange(e) {
    const universityIndex = Number(e.detail.value)
    const universityOptions = this.data.universityOptions || []
    const campus = universityOptions[universityIndex] || universityOptions[0] || ''

    this.setData({
      universityIndex,
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

  saveProfile() {
    const universityOptions = this.data.universityOptions || []
    const selectedCampus = universityOptions[this.data.universityIndex] || universityOptions[0] || ''
    const normalizedProfile = profileStore.normalizeProfile({
      ...(this.data.profileDraft || {}),
      campus: selectedCampus
    })

    if (normalizedProfile.name.length < 2) {
      feedback.showNeutralToast(uiText.USER_PROFILE.NAME_MIN)
      return
    }

    if (!normalizedProfile.campus) {
      feedback.showNeutralToast(uiText.USER_PROFILE.UNIVERSITY_REQUIRED)
      return
    }

    if (!profileStore.isValidWechatId(normalizedProfile.wechat)) {
      feedback.showNeutralToast(uiText.USER_PROFILE.wechatInvalid(profileStore.WECHAT_MIN_LENGTH, profileStore.WECHAT_MAX_LENGTH))
      return
    }

    profileStore.saveProfile(normalizedProfile)
    this.setData({
      isEditingProfile: false
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

    wx.showActionSheet({
      itemList: REVIEW_RATING_OPTIONS.map((item) => item.label),
      success: (res) => {
        const choice = REVIEW_RATING_OPTIONS[res.tapIndex]

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
            const review = reviewsStore.createReview({
              sellerKey: seller.sellerKey,
              listingId: this.data.listingId,
              rating: choice.value,
              comment: modalRes.content || '',
              reviewerName: reviewer.name || 'UniMarket user'
            })

            if (!review) {
              feedback.showNeutralToast(uiText.USER_PROFILE.REVIEW_ALREADY_EXISTS)
              return
            }

            this.refreshSellerProfile()

            feedback.showSuccessToast(uiText.USER_PROFILE.REVIEW_POSTED)
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
      confirmText: 'Block',
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

    wx.showActionSheet({
      itemList: PROFILE_REPORT_REASONS,
      success: (res) => {
        const reason = PROFILE_REPORT_REASONS[res.tapIndex]
        if (!reason) return

        if (reason === 'Other') {
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

    reportsStore.createProfileReport({
      profileKey: seller.sellerKey,
      profileName: seller.name || '',
      sourceListingId: this.data.listingId,
      reason,
      note
    })

    this.setData({
      hasReported: true
    })

    feedback.showSuccessToast(uiText.USER_PROFILE.REPORT_SENT)
  },

  onShareAppMessage() {
    const seller = this.data.seller || {}
    const listings = this.data.listings || []
    const coverListing = listings[0] || {}
    const path = this.data.isOwnProfile
      ? '/pages/user-profile/user-profile?self=1'
      : `/pages/user-profile/user-profile?listingId=${this.data.listingId}`

    return {
      title: seller.name ? `${seller.name} on UniMarket` : 'UniMarket profile',
      path,
      imageUrl: coverListing.image || ''
    }
  }
})
