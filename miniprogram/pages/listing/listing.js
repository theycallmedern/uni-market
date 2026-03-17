const market = require('../../data/market')
const savedStore = require('../../utils/saved')
const reportsStore = require('../../utils/reports')
const adminStore = require('../../utils/admin')
const visibilityStore = require('../../utils/visibility')
const reviewsStore = require('../../utils/reviews')

const REPORT_REASONS = [
  'Scam or fraud',
  'Prohibited item',
  'Wrong category',
  'Inappropriate content',
  'Other'
]

Page({
  data: {
    navTitle: 'Listing',
    id: '',
    listing: null,
    isSaved: false,
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
    hiddenByUser: false,
    blockedSeller: false,
    reviewSummary: {
      average: 0,
      averageLabel: 'New',
      count: 0,
      countLabel: '0 reviews'
    }
  },

  onLoad(query) {
    const id = String(query.id || '')
    this.setData({
      id,
      isSaved: savedStore.isListingSaved(id)
    }, () => {
      this.refreshListing()
    })
  },

  onShow() {
    this.refreshListing()
  },

  refreshListing() {
    const id = this.data.id
    const listing = market.getListingById(id)
    const rawListing = market.getListingById(id, { includeHiddenByUser: true })

    if (!listing && rawListing) {
      const sellerKey = market.getSellerKey(rawListing)
      const hiddenByUser = visibilityStore.isListingHidden(id)
      const blockedSeller = visibilityStore.isSellerBlocked(sellerKey)

      wx.setNavigationBarTitle({
        title: blockedSeller ? 'Seller hidden' : 'Listing hidden'
      })

      this.setData({
        navTitle: blockedSeller ? 'Seller hidden' : 'Listing hidden',
        listing: null,
        blockedByModeration: false,
        notFound: false,
        hiddenNotice: '',
        hiddenByUser,
        blockedSeller,
        reviewSummary: {
          average: 0,
          averageLabel: 'New',
          count: 0,
          countLabel: '0 reviews'
        }
      })
      return
    }

    if (!listing) {
      wx.setNavigationBarTitle({
        title: 'Listing unavailable'
      })

      this.setData({
        navTitle: 'Listing unavailable',
        listing: null,
        blockedByModeration: false,
        notFound: true,
        hiddenNotice: '',
        hiddenByUser: false,
        blockedSeller: false,
        reviewSummary: {
          average: 0,
          averageLabel: 'New',
          count: 0,
          countLabel: '0 reviews'
        }
      })
      return
    }

    const isAdmin = adminStore.isAdmin()
    const canViewHiddenListing = isAdmin || Boolean(listing.isCustom)

    if (listing.isHiddenByModeration && !canViewHiddenListing) {
      wx.setNavigationBarTitle({
        title: 'Listing unavailable'
      })

      this.setData({
        navTitle: 'Listing unavailable',
        listing: null,
        blockedByModeration: true,
        notFound: false,
        hiddenNotice: '',
        hiddenByUser: false,
        blockedSeller: false,
        reviewSummary: {
          average: 0,
          averageLabel: 'New',
          count: 0,
          countLabel: '0 reviews'
        }
      })
      return
    }

    wx.setNavigationBarTitle({
      title: listing.title || 'Listing'
    })

    this.setData({
      navTitle: listing.title || 'Listing',
      listing,
      isSaved: savedStore.isListingSaved(id),
      sellerInitial: listing.seller && listing.seller.name ? listing.seller.name.slice(0, 1) : 'U',
      currentImage: 1,
      hasReported: reportsStore.hasReportedListing(id),
      blockedByModeration: false,
      notFound: false,
      hiddenByUser: false,
      blockedSeller: false,
      reviewSummary: reviewsStore.getSellerReviewSummary(market.getSellerKey(listing)),
      hiddenNotice: listing.isHiddenByModeration
        ? listing.isCustom
          ? 'Hidden by moderation. Only you and admins can open this listing.'
          : 'Hidden by moderation.'
        : ''
    })
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

  toggleSave() {
    if (!this.data.listing) return

    const result = savedStore.toggleSavedListing(this.data.id)
    this.setData({
      isSaved: result.isSaved
    })
    this.playSaveFeedback(result.isSaved)
  },

  playSaveFeedback(isSaved) {
    this.setData({
      feedbackVisible: true,
      feedbackText: isSaved ? 'Saved' : 'Removed',
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
    const seller = listing.seller || {}
    const wechat = seller.wechat || ''
    if (!wechat) return

    wx.setClipboardData({
      data: wechat,
      success: () => {
        reviewsStore.unlockReviewForListing(this.data.id)
        this.setData({
          reviewSummary: reviewsStore.getSellerReviewSummary(market.getSellerKey(listing))
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

  copyListingLink() {
    if (!this.data.id) {
      return
    }

    this.closeMenu()

    wx.setClipboardData({
      data: `/pages/listing/listing?id=${this.data.id}`,
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

  hideListing() {
    const listing = this.data.listing || {}

    if (!listing.id) {
      return
    }

    this.closeMenu()

    wx.showModal({
      title: 'Hide this listing?',
      content: 'This listing will disappear from your feed, search, and saved results on this device.',
      confirmText: 'Hide',
      confirmColor: '#111111',
      success: (res) => {
        if (!res.confirm) return

        visibilityStore.hideListing(listing.id)
        wx.showToast({
          title: 'Listing hidden',
          icon: 'success'
        })

        setTimeout(() => {
          this.goBackAfterHide()
        }, 350)
      }
    })
  },

  blockSeller() {
    const listing = this.data.listing || {}
    const sellerKey = market.getSellerKey(listing)
    const sellerName = listing.seller && listing.seller.name ? listing.seller.name : 'this seller'

    if (!sellerKey) {
      return
    }

    this.closeMenu()

    wx.showModal({
      title: 'Block this user?',
      content: `All listings from ${sellerName} will be hidden on this device.`,
      confirmText: 'Block',
      confirmColor: '#ba2d2d',
      success: (res) => {
        if (!res.confirm) return

        visibilityStore.blockSeller(sellerKey)
        wx.showToast({
          title: 'User blocked',
          icon: 'success'
        })

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
      wx.showToast({
        title: 'Already reported',
        icon: 'none'
      })
      return
    }

    wx.showActionSheet({
      itemList: REPORT_REASONS,
      success: (res) => {
        const reason = REPORT_REASONS[res.tapIndex]
        if (!reason) return

        if (reason === 'Other') {
          wx.showModal({
            title: 'Report details',
            editable: true,
            placeholderText: 'Tell us what is wrong',
            confirmText: 'Send',
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

    reportsStore.createReport({
      listingId: this.data.id,
      listingTitle: listing.title || '',
      reason,
      note
    })

    this.setData({ hasReported: true })

    wx.showToast({
      title: 'Report sent',
      icon: 'success'
    })
  },

  onShareAppMessage() {
    const listing = this.data.listing || {}

    return {
      title: listing.title || 'UniMarket listing',
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
