const savedStore = require('../../services/api/saved')
const listingsApi = require('../../services/api/runtime-listings')
const accountApi = require('../../services/api/runtime-account')
const profileStore = require('../../utils/profile')
const storage = require('../../utils/storage')
const localeStore = require('../../utils/locale')
const tabbarStore = require('../../utils/tabbar')
const feedback = require('../../utils/ui-feedback')
const uiText = require('../../constants/messages')
const copyStore = require('../../constants/copy')

const INITIAL_PROFILE = profileStore.getProfile()
const INITIAL_THEME = storage.getThemeData()
const INITIAL_LOCALE = localeStore.getLocale()

Page({
  data: {
    locale: INITIAL_LOCALE,
    copy: copyStore.getPageCopy('profile', INITIAL_LOCALE),
    commonCopy: copyStore.getCommonCopy(INITIAL_LOCALE),
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
    this.refreshLocale(() => {
      this.refreshTheme(() => {
        tabbarStore.syncTabBar(this, 4, {
          themeMode: this.data.themeMode,
          locale: this.data.locale
        })
      })
      this.refreshProfile()
    })
  },

  refreshTheme(callback) {
    this.setData(storage.getThemeData(), callback)
  },

  refreshLocale(callback) {
    const locale = localeStore.getLocale()

    this.setData({
      locale,
      copy: copyStore.getPageCopy('profile', locale),
      commonCopy: copyStore.getCommonCopy(locale)
    }, callback)
  },

  async refreshProfile() {
    if (savedStore.enabled) {
      await savedStore.hydrateSavedListingIds()
    }
    const savedCount = savedStore.getSavedListingIds().length
    let profile = profileStore.getProfile()

    let myListings = []
    try {
      myListings = await listingsApi.getMy()
    } catch (error) {
      myListings = listingsApi.getMy()
    }

    let me = null
    try {
      me = await accountApi.getMe()
    } catch (error) {
      me = null
    }

    if (me && me.profile) {
      profile = profileStore.saveProfile(me.profile)
    }

    const safeListings = Array.isArray(myListings) ? myListings : []
    const activeCount = safeListings.filter((listing) => !listing.isSold).length
    const soldCount = safeListings.filter((listing) => Boolean(listing && listing.isSold && listing.soldOnUniMarket)).length

    this.setData({
      profile,
      avatarInitial: profileStore.getProfileInitial(profile),
      myListingsCount: activeCount,
      soldCount,
      savedCount,
      isSellerPro: Boolean(me && me.isSellerPro)
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
    const priceLabel = this.data.copy.sellerProPriceLabel
    const supportWechat = uiText.CREATE && uiText.CREATE.PROMOTION_CONTACT_WECHAT
      ? uiText.CREATE.PROMOTION_CONTACT_WECHAT
      : 'miskathaa'

    feedback.showModal({
      title: uiText.PROFILE.SELLER_PRO_TITLE,
      content: uiText.PROFILE.sellerProOfferContent(priceLabel),
      confirmText: this.data.commonCopy.connect,
      cancelText: this.data.commonCopy.later,
      success: async (res) => {
        if (!res.confirm) {
          return
        }

        try {
          const result = await accountApi.requestSellerPro()
          const status = result && result.status ? String(result.status) : 'pending'
          const alreadyExists = Boolean(result && result.alreadyExists)

          if (alreadyExists || status === 'active') {
            feedback.showSuccessToast(uiText.PROFILE.SELLER_PRO_ALREADY_REQUESTED)
            this.refreshProfile()
          } else if (result) {
            feedback.showSuccessToast(uiText.PROFILE.SELLER_PRO_REQUEST_SENT)
          }
        } catch (error) {}

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
