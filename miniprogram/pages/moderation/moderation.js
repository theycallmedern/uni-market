const reportsStore = require('../../utils/reports')
const adminStore = require('../../utils/admin')

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
  return {
    ...report,
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

Page({
  data: {
    isAdmin: false,
    reports: [],
    summary: {
      pending: 0,
      reviewing: 0,
      resolved: 0,
      dismissed: 0
    }
  },

  onShow() {
    const isAdmin = adminStore.isAdmin()
    this.setData({ isAdmin })

    if (!isAdmin) {
      return
    }

    this.refreshReports()
  },

  refreshReports() {
    const reports = reportsStore.getReports().map(normalizeReport)
    const summary = buildSummary(reports)
    this.setData({ reports, summary })
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

        wx.showToast({
          title: 'Status updated',
          icon: 'success'
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
  }
})
