const {
  API_TIMEOUT_MS,
  getApiBaseUrl
} = require('./config')
const {
  getSessionToken,
  setSessionToken,
  clearSessionToken
} = require('./session-token')

let bootstrapPromise = null

function canUseWxRequest() {
  return typeof wx !== 'undefined'
    && wx
    && typeof wx.request === 'function'
}

function canUseWxLogin() {
  return typeof wx !== 'undefined'
    && wx
    && typeof wx.login === 'function'
}

function exchangeWechatCode(code) {
  const baseUrl = getApiBaseUrl()
  if (!baseUrl) {
    return Promise.resolve(null)
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${baseUrl}/auth/wechat/login`,
      method: 'POST',
      timeout: API_TIMEOUT_MS,
      header: {
        'content-type': 'application/json'
      },
      data: {
        code: String(code || '')
      },
      success: (response) => {
        const statusCode = Number(response && response.statusCode)
        const responseData = response ? response.data : null

        if (statusCode >= 200 && statusCode < 300) {
          resolve(responseData)
          return
        }

        const error = new Error(
          responseData && responseData.error
            ? String(responseData.error)
            : `Auth request failed with status ${statusCode || 0}`
        )
        error.statusCode = statusCode
        error.data = responseData
        reject(error)
      },
      fail: (error) => {
        reject(error instanceof Error ? error : new Error('WeChat auth request failed'))
      }
    })
  })
}

function runWechatLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (result) => {
        if (result && result.code) {
          resolve(String(result.code))
          return
        }

        reject(new Error('WeChat login did not return a code'))
      },
      fail: (error) => {
        reject(error instanceof Error ? error : new Error('WeChat login failed'))
      }
    })
  })
}

async function bootstrapBackendSession(options = {}) {
  const forceRefresh = Boolean(options && options.forceRefresh)
  const existingToken = !forceRefresh ? getSessionToken() : ''

  if (existingToken) {
    return {
      ok: true,
      token: existingToken,
      restored: true
    }
  }

  if (!canUseWxLogin() || !canUseWxRequest() || !getApiBaseUrl()) {
    return {
      ok: false,
      token: '',
      skipped: true
    }
  }

  const code = await runWechatLogin()
  const response = await exchangeWechatCode(code)
  const token = response && response.token ? setSessionToken(response.token) : ''

  return {
    ...(response || {}),
    ok: Boolean(response && response.ok !== false),
    token
  }
}

async function ensureBackendSession(options = {}) {
  const forceRefresh = Boolean(options && options.forceRefresh)
  const existingToken = !forceRefresh ? getSessionToken() : ''

  if (existingToken) {
    return existingToken
  }

  if (!bootstrapPromise || forceRefresh) {
    bootstrapPromise = bootstrapBackendSession(options)
      .then((result) => String(result && result.token ? result.token : ''))
      .catch(() => '')
      .finally(() => {
        bootstrapPromise = null
      })
  }

  return bootstrapPromise
}

function clearBackendSession() {
  clearSessionToken()
}

module.exports = {
  bootstrapBackendSession,
  ensureBackendSession,
  clearBackendSession
}
