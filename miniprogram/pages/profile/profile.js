const market = require('../../data/market')
const savedStore = require('../../utils/saved')
const profileStore = require('../../utils/profile')
const storage = require('../../utils/storage')
const tabbarStore = require('../../utils/tabbar')
const feedback = require('../../utils/ui-feedback')
const uiText = require('../../constants/messages')

const THEME_STORAGE_KEY = 'uiThemeMode'
const LIGHT_THEME = 'light'
const DARK_THEME = 'dark'
const INITIAL_PROFILE = profileStore.getProfile()

function normalizeThemeMode(value) {
  return value === DARK_THEME ? DARK_THEME : LIGHT_THEME
}

function getThemeData() {
  const themeMode = normalizeThemeMode(storage.safeGetStorage(THEME_STORAGE_KEY, LIGHT_THEME))

  return {
    themeMode,
    themeClass: themeMode === DARK_THEME ? 'theme-dark' : 'theme-light',
    isDarkTheme: themeMode === DARK_THEME
  }
}

const INITIAL_THEME = getThemeData()

Page({
  data: {
    profile: { ...INITIAL_PROFILE },
    avatarInitial: profileStore.getProfileInitial(INITIAL_PROFILE),
    myListingsCount: 0,
    soldCount: 0,
    savedCount: 0,
    isSellerPro: false,
    themeMode: INITIAL_THEME.themeMode,
    themeClass: INITIAL_THEME.themeClass,
    isDarkTheme: INITIAL_THEME.isDarkTheme
  },

  onShow() {
    this.refreshTheme(() => {
      tabbarStore.syncTabBar(this, 4, {
        themeMode: this.data.themeMode
      })
    })
    this.refreshProfile()
  },

  refreshTheme(callback) {
    this.setData(getThemeData(), callback)
  },

  refreshProfile() {
    const savedCount = savedStore.getSavedListingIds().length
    const profile = profileStore.getProfile()
    const myListings = market.getMyListings()
    const ownSellerProfile = market.getOwnSellerProfile()
    const activeCount = myListings.filter((listing) => !listing.isSold).length
    const soldCount = myListings.filter((listing) => Boolean(listing && listing.isSold && listing.soldOnUniMarket)).length

    this.setData({
      profile,
      avatarInitial: profileStore.getProfileInitial(profile),
      myListingsCount: activeCount,
      soldCount,
      savedCount,
      isSellerPro: Boolean(ownSellerProfile && ownSellerProfile.isSellerPro)
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

  openSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  },

  openSellerProOffer() {
    const priceLabel = '79 RMB / month'
    const supportWechat = uiText.CREATE && uiText.CREATE.PROMOTION_CONTACT_WECHAT
      ? uiText.CREATE.PROMOTION_CONTACT_WECHAT
      : 'miskathaa'

    feedback.showModal({
      title: uiText.PROFILE.SELLER_PRO_TITLE,
      content: uiText.PROFILE.sellerProOfferContent(priceLabel),
      confirmText: 'Connect',
      cancelText: 'Later',
      success: (res) => {
        if (!res.confirm) {
          return
        }

        wx.setClipboardData({
          data: supportWechat,
          success: () => {
            feedback.showSuccessToast(uiText.PROFILE.SELLER_PRO_CONTACT_COPIED)
            feedback.showInfoModal({
              title: uiText.COMMON.WRITE_IN_WECHAT_TITLE,
              content: uiText.PROFILE.sellerProContactModalContent(supportWechat)
            })
          }
        })
      }
    })
  }
})
