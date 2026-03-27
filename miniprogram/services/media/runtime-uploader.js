const cloudinaryUploader = require('./cloudinary')
const { getApiBaseUrl } = require('../api/config')

function canUseWxUploadFile() {
  return typeof wx !== 'undefined'
    && wx
    && typeof wx.uploadFile === 'function'
}

function getStatus() {
  if (!getApiBaseUrl()) {
    return {
      ready: false,
      provider: 'cloudinary',
      reason: 'API base URL is not configured'
    }
  }

  if (!canUseWxUploadFile()) {
    return {
      ready: false,
      provider: 'cloudinary',
      reason: 'wx.uploadFile is unavailable in the current runtime'
    }
  }

  if (!cloudinaryUploader.isCloudinaryConfigured()) {
    return {
      ready: false,
      provider: 'cloudinary',
      reason: 'Signed Cloudinary upload is not configured'
    }
  }

  return {
    ready: true,
    provider: 'cloudinary',
    reason: ''
  }
}

module.exports = {
  getStatus,
  isReady() {
    return Boolean(getStatus().ready)
  },
  getUnavailableReason() {
    return String(getStatus().reason || '')
  },
  isRemoteUrl(value) {
    return cloudinaryUploader.isRemoteUrl(value)
  },
  prepareListingImages(images = []) {
    return cloudinaryUploader.prepareListingImages(images)
  }
}
