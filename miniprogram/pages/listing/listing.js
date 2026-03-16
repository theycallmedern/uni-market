const market = require('../../data/market')
const savedStore = require('../../utils/saved')
const reportsStore = require('../../utils/reports')
const adminStore = require('../../utils/admin')

const REPORT_REASONS = [
  'Scam or fraud',
  'Prohibited item',
  'Wrong category',
  'Inappropriate content',
  'Other'
]

Page({
  data: {
    id: '',
    listing: null,
    isSaved: false,
    currentImage: 1,
    feedbackVisible: false,
    feedbackText: '',
    feedbackIcon: '',
    hasReported: false,
    blockedByModeration: false,
    notFound: false,
    hiddenNotice: ''
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

    if (!listing) {
      wx.setNavigationBarTitle({
        title: 'Listing unavailable'
      })

      this.setData({
        listing: null,
        blockedByModeration: false,
        notFound: true,
        hiddenNotice: ''
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
        listing: null,
        blockedByModeration: true,
        notFound: false,
        hiddenNotice: ''
      })
      return
    }

    wx.setNavigationBarTitle({
      title: listing.title || 'Listing'
    })

    this.setData({
      listing,
      isSaved: savedStore.isListingSaved(id),
      sellerInitial: listing.seller && listing.seller.name ? listing.seller.name.slice(0, 1) : 'U',
      currentImage: 1,
      hasReported: reportsStore.hasReportedListing(id),
      blockedByModeration: false,
      notFound: false,
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
      data: wechat
    })
  },

  reportListing() {
    if (!this.data.listing) return

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

  goToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})
