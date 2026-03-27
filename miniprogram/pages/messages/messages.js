const savedStore = require('../../services/api/saved')
const listingsApi = require('../../services/api/runtime-listings')
const storage = require('../../utils/storage')
const localeStore = require('../../utils/locale')
const profileStore = require('../../utils/profile')
const tabbarStore = require('../../utils/tabbar')
const adminStore = require('../../services/api/admin')
const feedback = require('../../utils/ui-feedback')
const uiText = require('../../constants/messages')
const copyStore = require('../../constants/copy')

const INITIAL_PROFILE = profileStore.getProfile()
const INITIAL_THEME = storage.getThemeData()
const INITIAL_LOCALE = localeStore.getLocale()

function decorateActiveListing(listing, copy) {
  return {
    ...listing,
    displayStatusLabel: listing.isSold
      ? copy.soldStatus
      : (listing.isHiddenByModeration ? copy.hiddenStatus : copy.liveStatus),
    displaySoldActionLabel: listing.isSold ? copy.listAgainButton : copy.markSoldButton,
    displayPromoteActionLabel: listing.isPromoted
      ? copy.featuredButton
      : (listing.isPromotionRequested ? copy.requestedButton : copy.promoteButton),
    displayPromotionPendingLabel: copy.promotionPendingBadge,
    displayPromotedBadge: copy.promotedBadge
  }
}

function getExpiredArchiveNote(locale) {
  if (locale === 'zh') {
    return '发布满 30 天后已自动归档'
  }

  if (locale === 'ru') {
    return 'Автоматически перенесено в архив через 30 дней'
  }

  return 'Auto-archived after 30 days'
}

function decorateArchivedListing(listing, copy, locale) {
  const isExpiredArchive = Boolean(listing && listing.isArchived && !listing.isSold)

  return {
    ...listing,
    displayStatusLabel: isExpiredArchive ? copy.archivedStatus : copy.soldStatus,
    displayRestoreActionLabel: isExpiredArchive ? copy.restoreButton : copy.listAgainButton,
    displayArchiveNote: isExpiredArchive
      ? getExpiredArchiveNote(locale)
      : (listing.soldOnUniMarket ? copy.saleSourceUniMarket : copy.saleSourceOutside),
    displayPromotedBadge: copy.promotedBadge
  }
}

Page({
  data: {
    locale: INITIAL_LOCALE,
    copy: copyStore.getPageCopy('messages', INITIAL_LOCALE),
    commonCopy: copyStore.getCommonCopy(INITIAL_LOCALE),
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
    isAdmin: false,
    heroMeta: copyStore.getMessagesHeroMeta(0, 0, 0, INITIAL_LOCALE),
    archiveSubtitle: copyStore.getArchiveSubtitle(0, INITIAL_LOCALE)
  },

  onShow() {
    this.refreshLocale(() => {
      this.refreshTheme(() => {
        tabbarStore.syncTabBar(this, 3, {
          themeMode: this.data.themeMode,
          locale: this.data.locale
        })
      })
      this.refreshListings()
    })
  },

  refreshTheme(callback) {
    this.setData(storage.getThemeData(), callback)
  },

  refreshLocale(callback) {
    const locale = localeStore.getLocale()

    this.setData({
      locale,
      copy: copyStore.getPageCopy('messages', locale),
      commonCopy: copyStore.getCommonCopy(locale)
    }, callback)
  },

  async refreshListings() {
    const { locale } = this.data
    const copy = copyStore.getPageCopy('messages', locale)
    const profile = profileStore.getProfile()
    const isAdmin = await adminStore.getAdminState()

    const myListings = await listingsApi.getMy()
    const archivedListings = myListings
      .filter((listing) => Boolean(listing && (listing.isSold || listing.isArchived)))
      .map((listing) => decorateArchivedListing(listing, copy, locale))
    const activeListings = myListings
      .filter((listing) => !listing.isSold && !listing.isArchived)
      .map((listing) => decorateActiveListing(listing, copy))
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
      isAdmin,
      heroMeta: copyStore.getMessagesHeroMeta(activeListings.length, soldCount, savedStore.getSavedListingIds().length, locale),
      archiveSubtitle: copyStore.getArchiveSubtitle(archivedListings.length, locale)
    })
  },

  async requestPromotion(e) {
    const { id } = e.currentTarget.dataset
    const listing = await listingsApi.getById(id, {
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
        confirmText: this.data.commonCopy.request,
        confirmColor: '#2f7d32',
        success: async (res) => {
          if (!res.confirm) return

          const updated = await listingsApi.requestPromotion(id, plan.id, {
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
    const source = Promise.resolve(listingsApi.getPromotionPlans())

    Promise.resolve(source).then((plans) => {
      if (!plans.length) {
        return
      }

      feedback.showActionSheet({
        itemList: plans.map((plan) => `${plan.durationDays}d · ${plan.priceLabel}`),
        success: (res) => {
          const plan = plans[Number(res.tapIndex)]
          if (!plan || typeof onPicked !== 'function') {
            return
          }

          onPicked(plan)
        }
      })
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
    listingsApi.queueCreateMode({ type: 'create' })
    wx.switchTab({
      url: '/pages/create/create'
    })
  },

  editListing(e) {
    const { id } = e.currentTarget.dataset
    listingsApi.queueCreateMode({ type: 'edit', id })
    wx.switchTab({
      url: '/pages/create/create'
    })
  },

  async toggleSoldState(e) {
    const { id, sold } = e.currentTarget.dataset
    const isSold = String(sold) === '1'

    if (isSold) {
      const updatedListing = await listingsApi.setSoldState(id, false)
      if (!updatedListing) {
        feedback.showNeutralToast(uiText.LISTINGS_MANAGER.LISTING_NOT_FOUND)
        return
      }

      this.refreshListings()
      feedback.showSuccessToast(uiText.LISTINGS_MANAGER.LISTED_AGAIN)
      return
    }

    feedback.showActionSheet({
      itemList: [this.data.copy.soldOnUniMarketOption, this.data.copy.soldElsewhereOption],
      success: async (res) => {
        const soldOnUniMarket = Number(res.tapIndex) === 0
        const updatedListing = await listingsApi.setSoldState(id, true, soldOnUniMarket)

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

  async restoreArchivedListing(e) {
    const { id, sold, archived } = e.currentTarget.dataset
    const isSold = String(sold) === '1'
    const isArchived = String(archived) === '1'

    let updatedListing = null

    if (isSold) {
      updatedListing = await listingsApi.setSoldState(id, false)
    } else if (isArchived) {
      updatedListing = await listingsApi.restore(id)
    }

    if (!updatedListing) {
      feedback.showNeutralToast(uiText.LISTINGS_MANAGER.LISTING_NOT_FOUND)
      return
    }

    this.refreshListings()
    feedback.showSuccessToast(
      isSold
        ? uiText.LISTINGS_MANAGER.LISTED_AGAIN
        : uiText.LISTINGS_MANAGER.RESTORED_FROM_ARCHIVE
    )
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
      confirmText: this.data.commonCopy.delete,
      confirmColor: '#111111',
      success: async (res) => {
        if (!res.confirm) return

        await listingsApi.remove(id)
        this.refreshListings()

        feedback.showSuccessToast(uiText.LISTINGS_MANAGER.DELETED)
      }
    })
  }
})
