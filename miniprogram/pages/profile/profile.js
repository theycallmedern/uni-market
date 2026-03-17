const market = require('../../data/market')
const savedStore = require('../../utils/saved')
const adminStore = require('../../utils/admin')
const profileStore = require('../../utils/profile')
const universitiesStore = require('../../utils/universities')
const tabbarStore = require('../../utils/tabbar')
const reviewsStore = require('../../utils/reviews')

const INITIAL_PROFILE = profileStore.getProfile()
const UNIVERSITY_OPTIONS = universitiesStore.HANGZHOU_UNIVERSITIES

function getProfileSellerKey(profile, myListings) {
  const listings = Array.isArray(myListings) ? myListings : []

  if (listings.length) {
    return market.getSellerKey(listings[0])
  }

  const seller = profile || {}
  return String(seller.wechat || `${seller.name || ''} ${seller.campus || ''} ${seller.city || ''}`)
    .trim()
    .toLowerCase()
}

Page({
  data: {
    profile: { ...INITIAL_PROFILE },
    profileDraft: { ...INITIAL_PROFILE },
    avatarInitial: profileStore.getProfileInitial(INITIAL_PROFILE),
    memberSinceLabel: profileStore.formatMemberSince(INITIAL_PROFILE.joinedAt),
    isUniversityPublic: !universitiesStore.isUniversityPrivateValue(INITIAL_PROFILE.campus),
    universityOptions: UNIVERSITY_OPTIONS,
    universityIndex: universitiesStore.getUniversityIndex(INITIAL_PROFILE.campus, UNIVERSITY_OPTIONS),
    isEditingProfile: false,
    myListingsCount: 0,
    savedCount: 0,
    isAdmin: false,
    reviewSummary: {
      average: 0,
      averageLabel: 'New',
      count: 0,
      countLabel: '0 reviews'
    }
  },

  onShow() {
    tabbarStore.syncTabBar(this, 4)
    this.refreshProfile()
  },

  refreshProfile() {
    const savedCount = savedStore.getSavedListingIds().length
    const profile = profileStore.getProfile()
    const myListings = market.getMyListings()
    const sellerKey = getProfileSellerKey(profile, myListings)
    const nextState = {
      profile,
      avatarInitial: profileStore.getProfileInitial(profile),
      memberSinceLabel: profileStore.formatMemberSince(profile.joinedAt),
      isUniversityPublic: !universitiesStore.isUniversityPrivateValue(profile.campus),
      universityIndex: universitiesStore.getUniversityIndex(profile.campus, UNIVERSITY_OPTIONS),
      myListingsCount: myListings.length,
      savedCount,
      isAdmin: adminStore.isAdmin(),
      reviewSummary: reviewsStore.getSellerReviewSummary(sellerKey)
    }

    if (!this.data.isEditingProfile) {
      nextState.profileDraft = { ...profile }
    }

    this.setData(nextState)
  },

  startEditProfile() {
    const universityIndex = universitiesStore.getUniversityIndex(this.data.profile.campus, UNIVERSITY_OPTIONS)
    const campus = UNIVERSITY_OPTIONS[universityIndex] || UNIVERSITY_OPTIONS[0] || ''

    this.setData({
      isEditingProfile: true,
      profileDraft: {
        ...this.data.profile,
        campus
      },
      universityIndex
    })
  },

  cancelEditProfile() {
    this.setData({
      isEditingProfile: false,
      profileDraft: { ...this.data.profile }
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
    const campus = UNIVERSITY_OPTIONS[universityIndex] || UNIVERSITY_OPTIONS[0] || ''

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
    const selectedCampus = UNIVERSITY_OPTIONS[this.data.universityIndex] || UNIVERSITY_OPTIONS[0] || ''
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

    const profile = profileStore.saveProfile(normalizedProfile)

    this.setData({
      profile,
      profileDraft: { ...profile },
      avatarInitial: profileStore.getProfileInitial(profile),
      memberSinceLabel: profileStore.formatMemberSince(profile.joinedAt),
      isUniversityPublic: !universitiesStore.isUniversityPrivateValue(profile.campus),
      universityIndex: universitiesStore.getUniversityIndex(profile.campus, UNIVERSITY_OPTIONS),
      isEditingProfile: false
    })

    wx.showToast({
      title: 'Profile saved',
      icon: 'success'
    })
  },

  goToPost() {
    market.queueCreateMode({ type: 'create' })
    wx.switchTab({
      url: '/pages/create/create'
    })
  },

  goToSaved() {
    wx.switchTab({
      url: '/pages/favorites/favorites'
    })
  },

  goToListings() {
    wx.switchTab({
      url: '/pages/messages/messages'
    })
  },

  openOwnPublicProfile() {
    wx.navigateTo({
      url: '/pages/user-profile/user-profile?self=1'
    })
  },

  goToModeration() {
    if (!adminStore.isAdmin()) {
      wx.showToast({
        title: 'Admin access required',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: '/pages/moderation/moderation'
    })
  },

  openAdminGate() {
    wx.showModal({
      title: 'Admin access',
      editable: true,
      placeholderText: 'Enter admin code',
      confirmText: 'Unlock',
      success: (res) => {
        if (!res.confirm) return

        const success = adminStore.enableAdmin(res.content || '')
        if (success) {
          wx.showToast({
            title: 'Admin unlocked',
            icon: 'success'
          })
          this.refreshProfile()
          return
        }

        wx.showToast({
          title: 'Wrong code',
          icon: 'none'
        })
      }
    })
  },

  disableAdmin() {
    adminStore.disableAdmin()
    this.refreshProfile()
    wx.showToast({
      title: 'Admin disabled',
      icon: 'none'
    })
  }
})
