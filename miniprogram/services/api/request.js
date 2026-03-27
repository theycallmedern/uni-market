const {
  API_TIMEOUT_MS,
  getApiBaseUrl
} = require('./config')
const { ensureBackendSession } = require('./session')
const {
  getSessionToken,
  setSessionToken,
  clearSessionToken
} = require('./session-token')

function ensureWxApi(methodName) {
  if (typeof wx === 'undefined' || typeof wx[methodName] !== 'function') {
    throw new Error(`WeChat Mini Program API is unavailable: wx.${methodName}`)
  }
}

function normalizePath(path) {
  const safePath = String(path || '').trim()
  if (!safePath) {
    throw new Error('API path is required')
  }

  return safePath.startsWith('/') ? safePath : `/${safePath}`
}

function buildQueryString(query = {}) {
  const searchParams = Object.keys(query).reduce((acc, key) => {
    const value = query[key]
    if (value === undefined || value === null || value === '') {
      return acc
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== '') {
          acc.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`)
        }
      })
      return acc
    }

    acc.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    return acc
  }, [])

  return searchParams.length ? `?${searchParams.join('&')}` : ''
}

async function request({
  path,
  method = 'GET',
  query,
  data,
  headers = {},
  auth = true,
  timeout = API_TIMEOUT_MS
}) {
  ensureWxApi('request')

  const baseUrl = getApiBaseUrl()
  if (!baseUrl) {
    throw new Error('API base URL is not configured')
  }

  let sessionToken = ''
  if (auth) {
    sessionToken = getSessionToken()

    if (!sessionToken) {
      try {
        sessionToken = await ensureBackendSession()
      } catch (error) {
        sessionToken = ''
      }
    }
  }
  const requestHeaders = {
    'content-type': 'application/json',
    ...headers
  }

  if (sessionToken) {
    requestHeaders.Authorization = `Bearer ${sessionToken}`
  }

  const url = `${baseUrl}${normalizePath(path)}${buildQueryString(query)}`

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      data,
      timeout,
      header: requestHeaders,
      success: (response) => {
        const statusCode = Number(response && response.statusCode)
        const responseData = response ? response.data : null

        if (statusCode >= 200 && statusCode < 300) {
          resolve(responseData)
          return
        }

        const errorMessage = responseData && responseData.error
          ? String(responseData.error)
          : `API request failed with status ${statusCode || 0}`
        const error = new Error(errorMessage)
        error.statusCode = statusCode
        error.data = responseData

        if (statusCode === 401 && auth) {
          clearSessionToken()
        }

        reject(error)
      },
      fail: (error) => {
        reject(error instanceof Error ? error : new Error('Network request failed'))
      }
    })
  })
}

module.exports = {
  request,
  getSessionToken,
  setSessionToken,
  clearSessionToken
}
