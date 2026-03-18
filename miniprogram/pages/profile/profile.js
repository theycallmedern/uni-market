const market = require('../../data/market')
const savedStore = require('../../utils/saved')
const adminStore = require('../../utils/admin')
const profileStore = require('../../utils/profile')
const tabbarStore = require('../../utils/tabbar')
const feedback = require('../../utils/ui-feedback')
const uiText = require('../../constants/messages')

const INITIAL_PROFILE = profileStore.getProfile()

Page({
  data: {
    profile: { ...INITIAL_PROFILE },
    avatarInitial: profileStore.getProfileInitial(INITIAL_PROFILE),
    myListingsCount: 0,
    soldCount: 0,
    savedCount: 0,
    isAdmin: false
  },

  onShow() {
    tabbarStore.syncTabBar(this, 4)
    this.refreshProfile()
  },

  refreshProfile() {
    const savedCount = savedStore.getSavedListingIds().length
    const profile = profileStore.getProfile()
    const myListings = market.getMyListings()
    const activeCount = myListings.filter((listing) => !listing.isSold).length
    const soldCount = myListings.filter((listing) => Boolean(listing && listing.isSold && listing.soldOnUniMarket)).length

    this.setData({
      profile,
      avatarInitial: profileStore.getProfileInitial(profile),
      myListingsCount: activeCount,
      soldCount,
      savedCount,
      isAdmin: adminStore.isAdmin()
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
      feedback.showNeutralToast(uiText.PROFILE.ADMIN_REQUIRED)
      return
    }

    wx.navigateTo({
      url: '/pages/moderation/moderation'
    })
  },

  openAdminGate() {
    feedback.showModal({
      title: uiText.PROFILE.ADMIN_TITLE,
      editable: true,
      placeholderText: uiText.PROFILE.ADMIN_PLACEHOLDER,
      confirmText: uiText.PROFILE.ADMIN_CONFIRM,
      success: (res) => {
        if (!res.confirm) return

        const success = adminStore.enableAdmin(res.content || '')
        if (success) {
          feedback.showSuccessToast(uiText.PROFILE.ADMIN_UNLOCKED)
          this.refreshProfile()
          return
        }

        feedback.showNeutralToast(uiText.PROFILE.ADMIN_WRONG_CODE)
      }
    })
  },

  disableAdmin() {
    adminStore.disableAdmin()
    this.refreshProfile()
    feedback.showNeutralToast(uiText.PROFILE.ADMIN_DISABLED)
  }
})
