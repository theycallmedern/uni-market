const reportsStore = require('../../utils/reports')
const market = require('../../data/market')
const adminStore = require('../../utils/admin')
const storage = require('../../utils/storage')
const feedback = require('../../utils/ui-feedback')
const uiText = require('../../constants/messages')

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' }
]

const STATUS_LABELS = STATUS_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label
  return acc
}, {})
const INITIAL_THEME = storage.getThemeData()

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const pad = (number) => String(number).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function normalizeReport(report) {
  const status = report.status || 'pending'
  const targetType = report.targetType || 'listing'

  return {
    ...report,
    targetType,
    targetTypeLabel: targetType === 'profile' ? 'Profile' : 'Listing',
    targetTitle:
      targetType === 'profile'
        ? report.profileName || 'Unnamed profile'
        : report.listingTitle || 'Untitled listing',
    status,
    statusLabel: STATUS_LABELS[status] || 'Pending',
    createdLabel: formatDate(report.createdAt)
  }
}

function buildSummary(reports) {
  return reports.reduce(
    (acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1
      return acc
    },
    { pending: 0, reviewing: 0, resolved: 0, dismissed: 0 }
  )
}

function normalizePromotionRequest(request) {
  return {
    ...request,
    createdLabel: formatDate(request.createdAt)
  }
}

function normalizeSellerProSubscription(subscription) {
  return {
    ...subscription,
    grantedLabel: formatDate(subscription.grantedAt),
    expiresLabel: formatDate(subscription.expiresAt)
  }
}

Page({
  data: {
    themeMode: INITIAL_THEME.themeMode,
    themeClass: INITIAL_THEME.themeClass,
    isDarkTheme: INITIAL_THEME.isDarkTheme,
    isAdmin: false,
    reports: [],
    activeReports: [],
    archivedReports: [],
    reportsArchiveOpen: false,
    promotionRequests: [],
    sellerProSubscriptions: [],
    summary: {
      pending: 0,
      reviewing: 0,
      resolved: 0,
      dismissed: 0
    },
    pendingPromotionCount: 0,
    sellerProCount: 0
  },

  onShow() {
    this.refreshTheme()
    const isAdmin = adminStore.isAdmin()
    this.setData({ isAdmin })

    if (!isAdmin) {
      return
    }

    this.refreshReports()
  },

  refreshTheme(callback) {
    this.setData(storage.getThemeData(), callback)
  },

  refreshReports() {
    const reports = reportsStore.getReports().map(normalizeReport)
    const activeReports = reports.filter((report) => report.status === 'pending' || report.status === 'reviewing')
    const archivedReports = reports.filter((report) => report.status === 'resolved' || report.status === 'dismissed')
    const summary = buildSummary(reports)
    const promotionRequests = market.getPromotionRequests({ status: 'pending' }).map(normalizePromotionRequest)
    const sellerProSubscriptions = market.getSellerProSubscriptions().map(normalizeSellerProSubscription)
    const sellerProCount = sellerProSubscriptions.length

    this.setData({
      reports,
      activeReports,
      archivedReports,
      summary,
      promotionRequests,
      sellerProSubscriptions,
      pendingPromotionCount: promotionRequests.length,
      sellerProCount
    })
  },

  openStatusSheet(e) {
    const { id } = e.currentTarget.dataset
    const itemList = STATUS_OPTIONS.map((option) => option.label)

    wx.showActionSheet({
      itemList,
      success: (res) => {
        const next = STATUS_OPTIONS[res.tapIndex]
        if (!next) return

        reportsStore.updateReportStatus(id, next.value)
        this.refreshReports()

        feedback.showSuccessToast(uiText.MODERATION.STATUS_UPDATED)
      }
    })
  },

  openListing(e) {
    const { id } = e.currentTarget.dataset
    if (!id) return

    wx.navigateTo({
      url: `/pages/listing/listing?id=${id}`
    })
  },

  openProfile(e) {
    const { id } = e.currentTarget.dataset
    if (!id) return

    wx.navigateTo({
      url: `/pages/user-profile/user-profile?listingId=${id}`
    })
  },

  approvePromotionRequest(e) {
    const { id } = e.currentTarget.dataset
    const result = market.reviewPromotionRequest(id, 'approve')

    if (!result) {
      feedback.showNeutralToast(uiText.LISTINGS_MANAGER.LISTING_NOT_FOUND)
      return
    }

    this.refreshReports()
    feedback.showSuccessToast(uiText.MODERATION.PROMOTION_APPROVED)
  },

  rejectPromotionRequest(e) {
    const { id } = e.currentTarget.dataset
    const result = market.reviewPromotionRequest(id, 'reject')

    if (!result) {
      feedback.showNeutralToast(uiText.LISTINGS_MANAGER.LISTING_NOT_FOUND)
      return
    }

    this.refreshReports()
    feedback.showSuccessToast(uiText.MODERATION.PROMOTION_REJECTED)
  },

  grantSellerProByNickname() {
    feedback.showModal({
      title: uiText.MODERATION.SELLER_PRO_TITLE,
      editable: true,
      placeholderText: uiText.MODERATION.SELLER_PRO_PLACEHOLDER,
      confirmText: uiText.MODERATION.SELLER_PRO_CONFIRM,
      success: (res) => {
        if (!res.confirm) return

        const result = market.grantSellerProByNickname(res.content || '', {
          grantedBy: 'admin-panel'
        })

        if (!result) {
          feedback.showNeutralToast(uiText.MODERATION.SELLER_PRO_NOT_FOUND)
          return
        }

        this.refreshReports()
        feedback.showSuccessToast(uiText.MODERATION.sellerProGranted(result.grantedCount))
      }
    })
  },

  revokeSellerPro(e) {
    const { id } = e.currentTarget.dataset

    if (!id) {
      return
    }

    const result = market.revokeSellerProSubscription(id)

    if (!result) {
      feedback.showNeutralToast(uiText.MODERATION.SELLER_PRO_NOT_FOUND)
      return
    }

    this.refreshReports()
    feedback.showSuccessToast(uiText.MODERATION.SELLER_PRO_REVOKED)
  },

  toggleReportsArchive() {
    this.setData({
      reportsArchiveOpen: !this.data.reportsArchiveOpen
    })
  }
})
