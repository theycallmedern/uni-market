const reportsStore = require('../../services/api/reports')
const moderationApi = require('../../services/api/moderation')
const adminStore = require('../../services/api/admin')
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
  const status = subscription && subscription.status ? subscription.status : 'inactive'

  return {
    ...subscription,
    status,
    createdLabel: formatDate(subscription.createdAt),
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
    sellerProRequests: [],
    sellerProSubscriptions: [],
    summary: {
      pending: 0,
      reviewing: 0,
      resolved: 0,
      dismissed: 0
    },
    pendingPromotionCount: 0,
    pendingSellerProCount: 0,
    sellerProCount: 0
  },

  async onShow() {
    this.refreshTheme()
    const isAdmin = await adminStore.getAdminState()
    this.setData({ isAdmin })

    if (!isAdmin) {
      return
    }

    this.refreshReports()
  },

  refreshTheme(callback) {
    this.setData(storage.getThemeData(), callback)
  },

  async refreshReports() {
    const reports = (await reportsStore.getModerationReports()).map(normalizeReport)
    const activeReports = reports.filter((report) => report.status === 'pending' || report.status === 'reviewing')
    const archivedReports = reports.filter((report) => report.status === 'resolved' || report.status === 'dismissed')
    const summary = buildSummary(reports)
    const promotionRequests = (await moderationApi.getPromotionRequests({ status: 'pending' })).map(normalizePromotionRequest)
    const sellerProRequests = (await moderationApi.getSellerProSubscriptions({ status: 'pending' })).map(normalizeSellerProSubscription)
    const sellerProSubscriptions = (await moderationApi.getSellerProSubscriptions({ status: 'active' })).map(normalizeSellerProSubscription)

    const sellerProCount = sellerProSubscriptions.length

    this.setData({
      reports,
      activeReports,
      archivedReports,
      summary,
      promotionRequests,
      sellerProRequests,
      sellerProSubscriptions,
      pendingPromotionCount: promotionRequests.length,
      pendingSellerProCount: sellerProRequests.length,
      sellerProCount
    })
  },

  openStatusSheet(e) {
    const { id } = e.currentTarget.dataset
    const itemList = STATUS_OPTIONS.map((option) => option.label)

    feedback.showActionSheet({
      itemList,
      success: (res) => {
        const next = STATUS_OPTIONS[res.tapIndex]
        if (!next) return

        reportsStore.updateModerationReportStatus(id, next.value).then(() => {
          this.refreshReports()
          feedback.showSuccessToast(uiText.MODERATION.STATUS_UPDATED)
        })
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

  async approvePromotionRequest(e) {
    const { id } = e.currentTarget.dataset
    const result = await moderationApi.reviewPromotionRequest(id, 'approve')

    if (!result) {
      feedback.showNeutralToast(uiText.LISTINGS_MANAGER.LISTING_NOT_FOUND)
      return
    }

    this.refreshReports()
    feedback.showSuccessToast(uiText.MODERATION.PROMOTION_APPROVED)
  },

  async rejectPromotionRequest(e) {
    const { id } = e.currentTarget.dataset
    const result = await moderationApi.reviewPromotionRequest(id, 'reject')

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
      success: async (res) => {
        if (!res.confirm) return

        const result = await moderationApi.grantSellerProByNickname(res.content || '', {
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

  async approveSellerProRequest(e) {
    const { id } = e.currentTarget.dataset
    const result = await moderationApi.reviewSellerProSubscription(id, 'approve')

    if (!result) {
      feedback.showNeutralToast(uiText.MODERATION.SELLER_PRO_NOT_FOUND)
      return
    }

    this.refreshReports()
    feedback.showSuccessToast(uiText.MODERATION.SELLER_PRO_APPROVED)
  },

  async rejectSellerProRequest(e) {
    const { id } = e.currentTarget.dataset
    const result = await moderationApi.reviewSellerProSubscription(id, 'reject')

    if (!result) {
      feedback.showNeutralToast(uiText.MODERATION.SELLER_PRO_NOT_FOUND)
      return
    }

    this.refreshReports()
    feedback.showSuccessToast(uiText.MODERATION.SELLER_PRO_REJECTED)
  },

  async revokeSellerPro(e) {
    const { id } = e.currentTarget.dataset

    if (!id) {
      return
    }

    const result = await moderationApi.revokeSellerProSubscription(id)

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
