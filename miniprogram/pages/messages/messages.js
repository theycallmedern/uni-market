const market = require('../../data/market')
const savedStore = require('../../utils/saved')
const storage = require('../../utils/storage')
const profileStore = require('../../utils/profile')
const tabbarStore = require('../../utils/tabbar')
const adminStore = require('../../utils/admin')
const feedback = require('../../utils/ui-feedback')
const uiText = require('../../constants/messages')

const INITIAL_PROFILE = profileStore.getProfile()
const INITIAL_THEME = storage.getThemeData()

Page({
  data: {
    themeMode: INITIAL_THEME.themeMode,
    themeClass: INITIAL_THEME.themeClass,
    isDarkTheme: INITIAL_THEME.isDarkTheme,
    activeListings: [],
    archivedListings: [],
    activeCount: 0,
    archivedCount: 0,
    isArchiveExpanded: false,
    soldCount: 0,
    savedCount: 0,
    profile: { ...INITIAL_PROFILE },
    avatarInitial: profileStore.getProfileInitial(INITIAL_PROFILE),
    isAdmin: false
  },

  onShow() {
    this.refreshTheme(() => {
      tabbarStore.syncTabBar(this, 3, {
        themeMode: this.data.themeMode
      })
    })
    this.refreshListings()
  },

  refreshTheme(callback) {
    this.setData(storage.getThemeData(), callback)
  },

  refreshListings() {
    const profile = profileStore.getProfile()
    const myListings = market.getMyListings()
    const archivedListings = myListings.filter((listing) => Boolean(listing && listing.isSold))
    const activeListings = myListings.filter((listing) => !listing.isSold)
    const soldCount = archivedListings.filter((listing) => Boolean(listing && listing.soldOnUniMarket)).length

    this.setData({
      activeListings,
      archivedListings,
      activeCount: activeListings.length,
      archivedCount: archivedListings.length,
      soldCount,
      savedCount: savedStore.getSavedListingIds().length,
      profile,
      avatarInitial: profileStore.getProfileInitial(profile),
      isAdmin: adminStore.isAdmin()
    })
  },

  requestPromotion(e) {
    const { id } = e.currentTarget.dataset
    const listing = market.getListingById(id, {
      includeResolved: true,
      includeHiddenByUser: true,
      includeSold: true
    })

    if (!listing) {
      feedback.showNeutralToast(uiText.LISTINGS_MANAGER.LISTING_NOT_FOUND)
      return
    }

    if (listing.isSold) {
      feedback.showNeutralToast(uiText.LISTINGS_MANAGER.PROMOTE_SOLD_UNAVAILABLE)
      return
    }

    if (listing.isPromoted) {
      feedback.showNeutralToast(uiText.LISTINGS_MANAGER.PROMOTE_ALREADY_ACTIVE)
      return
    }

    if (listing.isPromotionRequested) {
      feedback.showNeutralToast(uiText.LISTINGS_MANAGER.PROMOTE_ALREADY_REQUESTED)
      return
    }

    this.pickPromotionPlan((plan) => {
      feedback.showModal({
        title: uiText.LISTINGS_MANAGER.PROMOTE_TITLE,
        content: uiText.LISTINGS_MANAGER.promoteContent(plan.label, plan.priceLabel),
        confirmText: 'Request',
        confirmColor: '#2f7d32',
        success: (res) => {
          if (!res.confirm) return

          const updated = market.requestListingPromotion(id, plan.id, {
            source: 'listings'
          })
          if (!updated) {
            feedback.showNeutralToast(uiText.LISTINGS_MANAGER.LISTING_NOT_FOUND)
            return
          }

          this.refreshListings()
          feedback.showSuccessToast(uiText.LISTINGS_MANAGER.PROMOTE_REQUESTED)
          this.copyPromotionWechat(plan)
        }
      })
    })
  },

  pickPromotionPlan(onPicked) {
    const plans = market.getPromotionPlans()
    if (!plans.length) {
      return
    }

    wx.showActionSheet({
      itemList: plans.map((plan) => `${plan.durationDays}d · ${plan.priceLabel}`),
      success: (res) => {
        const plan = plans[Number(res.tapIndex)]
        if (!plan || typeof onPicked !== 'function') {
          return
        }

        onPicked(plan)
      }
    })
  },

  copyPromotionWechat(plan) {
    const wechatId = uiText.CREATE.PROMOTION_CONTACT_WECHAT
    wx.setClipboardData({
      data: wechatId,
      success: () => {
        feedback.showSuccessToast(uiText.LISTINGS_MANAGER.PROMOTION_CONTACT_COPIED)
        feedback.showInfoModal({
          title: uiText.COMMON.WRITE_IN_WECHAT_TITLE,
          content: uiText.LISTINGS_MANAGER.promotionContactModalContent(wechatId, plan.label, plan.priceLabel)
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

  goToPost() {
    market.queueCreateMode({ type: 'create' })
    wx.switchTab({
      url: '/pages/create/create'
    })
  },

  editListing(e) {
    const { id } = e.currentTarget.dataset
    market.queueCreateMode({ type: 'edit', id })
    wx.switchTab({
      url: '/pages/create/create'
    })
  },

  toggleSoldState(e) {
    const { id, sold } = e.currentTarget.dataset
    const isSold = String(sold) === '1'

    if (isSold) {
      const updatedListing = market.setListingSoldState(id, false)
      if (!updatedListing) {
        feedback.showNeutralToast(uiText.LISTINGS_MANAGER.LISTING_NOT_FOUND)
        return
      }

      this.refreshListings()
      feedback.showSuccessToast(uiText.LISTINGS_MANAGER.LISTED_AGAIN)
      return
    }

    wx.showActionSheet({
      itemList: ['Sold on UniMarket', 'Sold somewhere else'],
      success: (res) => {
        const soldOnUniMarket = Number(res.tapIndex) === 0
        const updatedListing = market.setListingSoldState(id, true, soldOnUniMarket)

        if (!updatedListing) {
          feedback.showNeutralToast(uiText.LISTINGS_MANAGER.LISTING_NOT_FOUND)
          return
        }

        this.refreshListings()
        feedback.showSuccessToast(
          soldOnUniMarket ? uiText.LISTINGS_MANAGER.SOLD_ON_UNIMARKET : uiText.LISTINGS_MANAGER.MOVED_TO_ARCHIVE
        )
      }
    })
  },

  toggleArchive() {
    if (!this.data.archivedCount) {
      return
    }

    this.setData({
      isArchiveExpanded: !this.data.isArchiveExpanded
    })
  },

  deleteListing(e) {
    const { id } = e.currentTarget.dataset

    feedback.showModal({
      title: uiText.LISTINGS_MANAGER.DELETE_TITLE,
      content: uiText.LISTINGS_MANAGER.DELETE_CONTENT,
      confirmText: 'Delete',
      confirmColor: '#111111',
      success: (res) => {
        if (!res.confirm) return

        market.deleteListing(id)
        this.refreshListings()

        feedback.showSuccessToast(uiText.LISTINGS_MANAGER.DELETED)
      }
    })
  }
})
