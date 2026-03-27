const { request } = require('../api/request')

function canUseWxUploadFile() {
  return typeof wx !== 'undefined'
    && wx
    && typeof wx.uploadFile === 'function'
  }

function isRemoteUrl(value) {
  return /^https?:\/\//i.test(String(value || '').trim())
}

function normalizeImageList(images = []) {
  return Array.isArray(images)
    ? images.map((image) => String(image || '').trim()).filter(Boolean)
    : []
}

function isCloudinaryConfigured() {
  return true
}

async function createSignedUpload(index = 0) {
  return request({
    path: '/media/uploads/sign',
    method: 'POST',
    data: {
      publicIdSuffix: `image-${index + 1}`
    }
  })
}

function uploadFileToCloudinary(filePath, signedUpload) {
  if (!canUseWxUploadFile()) {
    return Promise.reject(new Error('wx.uploadFile is unavailable in the current runtime'))
  }

  const uploadUrl = signedUpload && signedUpload.uploadUrl
    ? String(signedUpload.uploadUrl)
    : ''
  const formData = signedUpload && signedUpload.formData && typeof signedUpload.formData === 'object'
    ? signedUpload.formData
    : null

  if (!uploadUrl || !formData) {
    return Promise.reject(new Error('Signed Cloudinary upload is not available'))
  }

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: uploadUrl,
      filePath,
      name: 'file',
      formData,
      success: (response) => {
        const statusCode = Number(response && response.statusCode)
        let data = response ? response.data : null

        if (typeof data === 'string') {
          try {
            data = JSON.parse(data)
          } catch (error) {
            data = null
          }
        }

        if (statusCode >= 200 && statusCode < 300 && data && data.secure_url) {
          resolve(String(data.secure_url))
          return
        }

        const errorMessage = data && (data.error && data.error.message)
          ? String(data.error.message)
          : `Cloudinary upload failed with status ${statusCode || 0}`
        reject(new Error(errorMessage))
      },
      fail: (error) => {
        reject(error instanceof Error ? error : new Error('Cloudinary upload failed'))
      }
    })
  })
}

async function prepareListingImages(images = []) {
  const normalizedImages = normalizeImageList(images)
  const remoteImages = []

  for (const [index, image] of normalizedImages.entries()) {
    if (isRemoteUrl(image)) {
      remoteImages.push(image)
      continue
    }

    const signedUpload = await createSignedUpload(index)
    const uploadedUrl = await uploadFileToCloudinary(image, signedUpload)
    remoteImages.push(uploadedUrl)
  }

  return remoteImages
}

module.exports = {
  isCloudinaryConfigured,
  isRemoteUrl,
  prepareListingImages
}
