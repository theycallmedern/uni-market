const market = require('../../data/market')
const universitiesStore = require('../../utils/universities')
const profileStore = require('../../utils/profile')
const reportsStore = require('../../utils/reports')
const visibilityStore = require('../../utils/visibility')
const reviewsStore = require('../../utils/reviews')

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

Page({
  data: {
    navTitle: 'Seller profile',
    isOwnProfile: false,
    isEditingProfile: false,
    listingId: '',
    seller: null,
    listings: [],
    avatarInitial: 'U',
    memberSinceLabel: '',
    profileDraft: profileStore.getProfile(),
    universityOptions: universitiesStore.HANGZHOU_UNIVERSITIES,
    universityIndex: universitiesStore.getUniversityIndex(profileStore.getProfile().campus, universitiesStore.HANGZHOU_UNIVERSITIES),
    reviewSummary: {
      average: 0,
      averageLabel: 'New',
      count: 0,
      countLabel: '0 reviews',
      recentReviews: []
    },
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
      this.setData({
        navTitle: 'Seller hidden',
        isOwnProfile: false,
        seller: null,
        listings: [],
        avatarInitial: 'U',
        memberSinceLabel: '',
        isEditingProfile: false,
        reviewSummary: {
          average: 0,
          averageLabel: 'New',
          count: 0,
          countLabel: '0 reviews',
          recentReviews: []
        },
        canLeaveReview: false,
        hasReviewedCurrentListing: false,
        hasReported: false,
        isUniversityPublic: false,
        notFound: false,
        blockedSeller: true
      })
      return
    }

    if (!sellerProfile) {
      this.setData({
        navTitle: 'Profile unavailable',
        isOwnProfile: false,
        seller: null,
        listings: [],
        avatarInitial: 'U',
        memberSinceLabel: '',
        isEditingProfile: false,
        reviewSummary: {
          average: 0,
          averageLabel: 'New',
          count: 0,
          countLabel: '0 reviews',
          recentReviews: []
        },
        canLeaveReview: false,
        hasReviewedCurrentListing: false,
        hasReported: false,
        isUniversityPublic: false,
        notFound: true,
        blockedSeller: false
      })
      return
    }

    this.setData({
      navTitle: sellerProfile.name || 'Seller profile',
      isOwnProfile: false,
      seller: sellerProfile,
      listings: sellerProfile.listings || [],
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

        wx.showModal({
          title: 'Write in WeChat',
          content: 'WeChat copied the seller ID. Open WeChat search and paste it to continue, because Mini Programs cannot jump directly into a personal chat/profile.',
          showCancel: false,
          confirmText: 'OK'
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
        wx.showToast({
          title: 'Link copied',
          icon: 'success'
        })
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

    this.setData({
      [`profileDraft.${field}`]: e.detail.value
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
      wx.showToast({
        title: 'Name: at least 2 chars',
        icon: 'none'
      })
      return
    }

    if (!normalizedProfile.campus) {
      wx.showToast({
        title: 'Add your university',
        icon: 'none'
      })
      return
    }

    profileStore.saveProfile(normalizedProfile)
    this.setData({
      isEditingProfile: false
    })
    this.refreshOwnProfile()

    wx.showToast({
      title: 'Profile saved',
      icon: 'success'
    })
  },

  leaveReview() {
    const seller = this.data.seller || {}

    if (!seller.sellerKey || !this.data.listingId) {
      return
    }

    if (this.data.hasReviewedCurrentListing) {
      wx.showToast({
        title: 'Review already added',
        icon: 'none'
      })
      return
    }

    if (!this.data.canLeaveReview) {
      wx.showToast({
        title: 'Write in WeChat first',
        icon: 'none'
      })
      return
    }

    wx.showActionSheet({
      itemList: REVIEW_RATING_OPTIONS.map((item) => item.label),
      success: (res) => {
        const choice = REVIEW_RATING_OPTIONS[res.tapIndex]

        if (!choice) {
          return
        }

        wx.showModal({
          title: 'Leave a review',
          editable: true,
          placeholderText: 'Optional note about the seller',
          confirmText: 'Post',
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
              wx.showToast({
                title: 'Review already exists',
                icon: 'none'
              })
              return
            }

            this.refreshSellerProfile()

            wx.showToast({
              title: 'Review posted',
              icon: 'success'
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

    wx.showModal({
      title: 'Block this user?',
      content: `All listings from ${seller.name || 'this seller'} will be hidden on this device.`,
      confirmText: 'Block',
      confirmColor: '#ba2d2d',
      success: (res) => {
        if (!res.confirm) return

        visibilityStore.blockSeller(seller.sellerKey)
        wx.showToast({
          title: 'User blocked',
          icon: 'success'
        })

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
      wx.showToast({
        title: 'Already reported',
        icon: 'none'
      })
      return
    }

    wx.showActionSheet({
      itemList: PROFILE_REPORT_REASONS,
      success: (res) => {
        const reason = PROFILE_REPORT_REASONS[res.tapIndex]
        if (!reason) return

        if (reason === 'Other') {
          wx.showModal({
            title: 'Report profile',
            editable: true,
            placeholderText: 'Tell us what is wrong',
            confirmText: 'Send',
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

    wx.showToast({
      title: 'Report sent',
      icon: 'success'
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
      title: seller.name ? `${seller.name} on UniMarket` : 'UniMarket profile',
      path,
      imageUrl: coverListing.image || ''
    }
  }
})
