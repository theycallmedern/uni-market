const assert = require('node:assert/strict')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

const ROOT = path.resolve(__dirname, '..')

class MockStatement {
  constructor(db, sql) {
    this.db = db
    this.sql = String(sql || '').replace(/\s+/g, ' ').trim()
    this.args = []
  }

  bind(...args) {
    this.args = args
    return this
  }

  async first() {
    const result = this.db.execute(this.sql, this.args, 'first')
    return result || null
  }

  async all() {
    const results = this.db.execute(this.sql, this.args, 'all')
    return {
      results: Array.isArray(results) ? results : []
    }
  }

  async run() {
    this.db.execute(this.sql, this.args, 'run')
    return { success: true }
  }
}

class MockD1 {
  constructor() {
    this.users = new Map()
    this.profiles = new Map()
    this.savedListings = new Map()
    this.hiddenListings = new Map()
    this.blockedSellers = new Map()
    this.sellerProSubscriptions = []
    this.listings = new Map([
      ['listing-1', {
        id: 'listing-1',
        user_id: 'seller-1',
        title: 'Mock listing',
        price_value: 120,
        price_label: '120 RMB',
        location: 'Hangzhou',
        address: 'Xihu District',
        university: 'Zhejiang University',
        category_id: 'items',
        subcategory: 'Dorm essentials',
        listing_condition: 'Used',
        description: 'Mock listing for worker smoke tests.',
        status: 'active',
        is_sold: 0,
        sold_on_unimarket: 1,
        is_promoted: 0,
        created_at: '2026-03-25T00:00:00.000Z',
        updated_at: '2026-03-25T00:00:00.000Z',
        display_name: 'Seller One',
        wechat_id: 'seller_one',
        city: 'Hangzhou',
        cover_image_url: 'https://example.com/mock.jpg'
      }]
    ])
  }

  prepare(sql) {
    return new MockStatement(this, sql)
  }

  execute(sql, args, mode) {
    if (sql.includes('INSERT INTO users (id, wechat_openid, role, status, created_at) VALUES (?, NULLIF(?, \'\'), \'user\', \'active\', CURRENT_TIMESTAMP)')) {
      const [userId, wechatOpenId] = args
      const existing = this.users.get(userId) || { id: userId, role: 'user', status: 'active', wechat_openid: '' }
      this.users.set(userId, {
        ...existing,
        id: userId,
        wechat_openid: wechatOpenId || existing.wechat_openid || '',
        status: existing.status || 'active'
      })
      return mode === 'run' ? { success: true } : null
    }

    if (sql.includes('INSERT INTO users (id, wechat_openid, role, status, created_at) VALUES (?, NULLIF(?, \'\'), ?, \'active\', CURRENT_TIMESTAMP)')) {
      const [userId, wechatOpenId, role] = args
      const existing = this.users.get(userId) || { id: userId, role: role || 'user', status: 'active', wechat_openid: '' }
      this.users.set(userId, {
        ...existing,
        id: userId,
        role: existing.role || role || 'user',
        status: existing.status || 'active',
        wechat_openid: wechatOpenId || existing.wechat_openid || ''
      })
      return mode === 'run' ? { success: true } : null
    }

    if (sql.includes('INSERT INTO users (id, role, status) VALUES (?, \'admin\', \'active\')')) {
      const [userId] = args
      const existing = this.users.get(userId) || { id: userId, role: 'user', status: 'active', wechat_openid: '' }
      this.users.set(userId, {
        ...existing,
        role: 'admin',
        status: 'active'
      })
      return mode === 'run' ? { success: true } : null
    }

    if (sql.includes('UPDATE users SET role = \'user\' WHERE id = ?')) {
      const [userId] = args
      const existing = this.users.get(userId)
      if (existing) {
        this.users.set(userId, { ...existing, role: 'user' })
      }
      return mode === 'run' ? { success: true } : null
    }

    if (sql.includes('SELECT id, role, status, wechat_openid FROM users WHERE id = ? LIMIT 1')) {
      const [userId] = args
      return this.users.get(userId) || null
    }

    if (sql.includes('SELECT role, status FROM users WHERE id = ? LIMIT 1')) {
      const [userId] = args
      const user = this.users.get(userId)
      return user
        ? { role: user.role || 'user', status: user.status || 'active' }
        : null
    }

    if (sql.includes('FROM profiles p LEFT JOIN users u ON u.id = p.user_id WHERE p.user_id = ? LIMIT 1')) {
      const [userId] = args
      const profile = this.profiles.get(userId)
      const user = this.users.get(userId)
      if (!profile) {
        return null
      }

      return {
        user_id: userId,
        display_name: profile.display_name || '',
        wechat_id: profile.wechat_id || '',
        campus: profile.campus || '',
        city: profile.city || '',
        avatar_url: profile.avatar_url || '',
        bio: profile.bio || '',
        joined_at: profile.joined_at || '',
        role: user && user.role ? user.role : 'user',
        status: user && user.status ? user.status : 'active'
      }
    }

    if (sql.includes('INSERT INTO profiles ( user_id, display_name, wechat_id, campus, city, avatar_url, bio, joined_at, created_at, updated_at )')) {
      const [userId, displayName, wechatId, campus, city, avatarUrl, bio, joinedAt] = args
      this.profiles.set(userId, {
        user_id: userId,
        display_name: displayName || '',
        wechat_id: wechatId || '',
        campus: campus || '',
        city: city || '',
        avatar_url: avatarUrl || '',
        bio: bio || '',
        joined_at: joinedAt || ''
      })
      return mode === 'run' ? { success: true } : null
    }

    if (sql.includes('SELECT display_name, wechat_id FROM profiles WHERE user_id = ? LIMIT 1')) {
      const [userId] = args
      const profile = this.profiles.get(userId)
      return profile
        ? {
            display_name: profile.display_name || '',
            wechat_id: profile.wechat_id || ''
          }
        : null
    }

    if (sql.includes('SELECT wechat_id FROM profiles WHERE user_id = ? LIMIT 1')) {
      const [userId] = args
      const profile = this.profiles.get(userId)
      return profile
        ? {
            wechat_id: profile.wechat_id || ''
          }
        : null
    }

    if (sql.includes('SELECT p.user_id, p.display_name, p.wechat_id, u.wechat_openid FROM profiles p LEFT JOIN users u ON u.id = p.user_id WHERE LOWER(TRIM(p.display_name)) = LOWER(TRIM(?))')) {
      const [nickname] = args
      const normalizedNickname = String(nickname || '').trim().toLowerCase()
      return Array.from(this.profiles.values())
        .filter((profile) => String(profile.display_name || '').trim().toLowerCase() === normalizedNickname)
        .map((profile) => {
          const user = this.users.get(profile.user_id) || {}
          return {
            user_id: profile.user_id,
            display_name: profile.display_name || '',
            wechat_id: profile.wechat_id || '',
            wechat_openid: user.wechat_openid || ''
          }
        })
    }

    if (sql.includes('FROM seller_pro_subscriptions') && sql.includes('WHERE user_id = ?')) {
      const [userId] = args
      const active = this.sellerProSubscriptions.find((subscription) => subscription.user_id === userId && subscription.status === 'active')
      if (mode === 'all') {
        return this.sellerProSubscriptions.filter((subscription) => subscription.user_id === userId)
      }
      return active
        ? { id: active.id, expires_at: active.expires_at || '' }
        : null
    }

    if (sql.includes('SELECT id, user_id FROM seller_pro_subscriptions WHERE id = ? LIMIT 1')) {
      const [subscriptionId] = args
      const subscription = this.sellerProSubscriptions.find((item) => item.id === subscriptionId)
      return subscription
        ? {
            id: subscription.id,
            user_id: subscription.user_id
          }
        : null
    }

    if (sql.includes('FROM seller_pro_subscriptions') && sql.includes('WHERE 1 = 1') && sql.includes('ORDER BY created_at DESC')) {
      const [status] = args
      const rows = this.sellerProSubscriptions
        .filter((subscription) => {
          if (!sql.includes('status = ?')) {
            return true
          }

          return String(subscription.status || '') === String(status || '')
        })
        .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))

      return rows.map((subscription) => ({
        id: subscription.id,
        user_id: subscription.user_id,
        status: subscription.status,
        granted_at: subscription.granted_at || '',
        expires_at: subscription.expires_at || '',
        granted_by: subscription.granted_by || '',
        created_at: subscription.created_at || ''
      }))
    }

    if (sql.includes("UPDATE seller_pro_subscriptions SET status = 'inactive', expires_at = CURRENT_TIMESTAMP WHERE user_id IN ( SELECT p.user_id FROM profiles p WHERE LOWER(TRIM(COALESCE(p.wechat_id, ''))) = ? ) AND status = 'active'")) {
      const [normalizedWechatId] = args
      const matchingUserIds = new Set(
        Array.from(this.profiles.values())
          .filter((profile) => String(profile.wechat_id || '').trim().toLowerCase() === String(normalizedWechatId || '').trim().toLowerCase())
          .map((profile) => profile.user_id)
      )

      this.sellerProSubscriptions = this.sellerProSubscriptions.map((subscription) => (
        matchingUserIds.has(subscription.user_id) && subscription.status === 'active'
          ? { ...subscription, status: 'inactive', expires_at: 'CURRENT_TIMESTAMP' }
          : subscription
      ))
      return mode === 'run' ? { success: true } : null
    }

    if (sql.includes("UPDATE seller_pro_subscriptions SET status = 'inactive', expires_at = CURRENT_TIMESTAMP WHERE id = ?")) {
      const [subscriptionId] = args
      this.sellerProSubscriptions = this.sellerProSubscriptions.map((subscription) => (
        subscription.id === subscriptionId
          ? { ...subscription, status: 'inactive', expires_at: 'CURRENT_TIMESTAMP' }
          : subscription
      ))
      return mode === 'run' ? { success: true } : null
    }

    if (sql.includes('SELECT listing_id, created_at FROM saved_listings WHERE user_id = ? ORDER BY created_at DESC')) {
      const [userId] = args
      const savedIds = Array.from(this.savedListings.get(userId) || [])
      return savedIds.map((listingId) => ({ listing_id: listingId, created_at: '2026-03-25T00:00:00.000Z' }))
    }

    if (sql.includes('INSERT INTO saved_listings (user_id, listing_id, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)')) {
      const [userId, listingId] = args
      const next = new Set(this.savedListings.get(userId) || [])
      next.add(String(listingId))
      this.savedListings.set(userId, next)
      return mode === 'run' ? { success: true } : null
    }

    if (sql.includes('DELETE FROM saved_listings WHERE user_id = ? AND listing_id = ?')) {
      const [userId, listingId] = args
      const next = new Set(this.savedListings.get(userId) || [])
      next.delete(String(listingId))
      this.savedListings.set(userId, next)
      return mode === 'run' ? { success: true } : null
    }

    if (sql.includes('SELECT listing_id FROM hidden_listings WHERE user_id = ? ORDER BY created_at DESC')) {
      const [userId] = args
      const ids = Array.from(this.hiddenListings.get(userId) || [])
      return ids.map((listingId) => ({ listing_id: listingId }))
    }

    if (sql.includes('SELECT seller_key FROM blocked_sellers WHERE user_id = ? ORDER BY created_at DESC')) {
      const [userId] = args
      const keys = Array.from(this.blockedSellers.get(userId) || [])
      return keys.map((sellerKey) => ({ seller_key: sellerKey }))
    }

    if (sql.includes('INSERT OR IGNORE INTO hidden_listings')) {
      const [userId, listingId] = args
      const next = new Set(this.hiddenListings.get(userId) || [])
      next.add(String(listingId))
      this.hiddenListings.set(userId, next)
      return mode === 'run' ? { success: true } : null
    }

    if (sql.includes('INSERT OR IGNORE INTO blocked_sellers')) {
      const [userId, sellerKey] = args
      const next = new Set(this.blockedSellers.get(userId) || [])
      next.add(String(sellerKey))
      this.blockedSellers.set(userId, next)
      return mode === 'run' ? { success: true } : null
    }

    if (sql.includes('SELECT id FROM listings WHERE id = ? LIMIT 1')) {
      const [listingId] = args
      const listing = this.listings.get(String(listingId))
      return listing ? { id: listing.id } : null
    }

    if (sql.includes('FROM listings l') && sql.includes('WHERE l.user_id = ?')) {
      const [userId] = args
      return Array.from(this.listings.values())
        .filter((listing) => String(listing.user_id) === String(userId))
        .map((listing) => ({ ...listing, is_seller_pro: 0, is_promotion_requested: 0, promotion_plan: '' }))
    }

    throw new Error(`Unhandled SQL in worker smoke test: ${sql}`)
  }
}

async function loadWorkerModule() {
  const moduleUrl = `${pathToFileURL(path.join(ROOT, 'worker/src/index.mjs')).href}?t=${Date.now()}`
  return import(moduleUrl)
}

async function requestJson(workerModule, env, { method = 'GET', path: targetPath, headers = {}, body } = {}) {
  const request = new Request(`https://example.com${targetPath}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  })

  const response = await workerModule.default.fetch(request, env)
  const data = await response.json()
  return {
    status: response.status,
    data
  }
}

async function run() {
  const workerModule = await loadWorkerModule()
  const env = {
    CORS_ORIGIN: '*',
    ADMIN_PASSCODE: '8100703',
    JWT_SECRET: 'worker-smoke-secret',
    CLOUDINARY_CLOUD_NAME: 'demo-cloud',
    CLOUDINARY_API_KEY: 'demo-key',
    CLOUDINARY_API_SECRET: 'demo-secret',
    CLOUDINARY_FOLDER: 'unimarket/listings',
    UNIMARKET_DB: new MockD1()
  }

  const fallbackDisabled = await requestJson(workerModule, env, {
    method: 'POST',
    path: '/auth/wechat/login',
    body: {
      fallbackUserId: 'legacy-user'
    }
  })
  assert.equal(fallbackDisabled.status, 401)

  env.ALLOW_FALLBACK_AUTH = 'true'

  const meWithoutAuth = await requestJson(workerModule, env, {
    path: '/me'
  })
  assert.equal(meWithoutAuth.status, 401)

  const meWithLegacyHeader = await requestJson(workerModule, env, {
    path: '/me',
    headers: {
      'x-unimarket-user-id': 'legacy-user'
    }
  })
  assert.equal(meWithLegacyHeader.status, 401)

  const profileWithoutAuth = await requestJson(workerModule, env, {
    method: 'PUT',
    path: '/me/profile',
    body: {
      userId: 'legacy-user',
      name: 'Legacy User',
      wechat: 'legacy__id'
    }
  })
  assert.equal(profileWithoutAuth.status, 401)

  const login = await requestJson(workerModule, env, {
    method: 'POST',
    path: '/auth/wechat/login',
    body: {
      fallbackUserId: 'legacy-user'
    }
  })
  assert.equal(login.status, 200)
  assert.equal(Boolean(login.data && login.data.token), true)
  assert.equal(login.data.authMode, 'fallback')

  const authHeaders = {
    Authorization: `Bearer ${login.data.token}`
  }

  const meBeforeProfile = await requestJson(workerModule, env, {
    path: '/me',
    headers: authHeaders
  })
  assert.equal(meBeforeProfile.status, 200)
  assert.equal(meBeforeProfile.data.authenticated, true)
  assert.equal(meBeforeProfile.data.profile, null)

  const savedWithoutAuth = await requestJson(workerModule, env, {
    path: '/me/saved'
  })
  assert.equal(savedWithoutAuth.status, 401)

  const saveWithoutAuth = await requestJson(workerModule, env, {
    method: 'POST',
    path: '/listings/listing-1/save'
  })
  assert.equal(saveWithoutAuth.status, 401)

  const visibilityWithoutAuth = await requestJson(workerModule, env, {
    path: '/me/visibility'
  })
  assert.equal(visibilityWithoutAuth.status, 401)

  const myListingsWithoutAuth = await requestJson(workerModule, env, {
    path: '/me/listings'
  })
  assert.equal(myListingsWithoutAuth.status, 401)

  const updateProfile = await requestJson(workerModule, env, {
    method: 'PUT',
    path: '/me/profile',
    headers: authHeaders,
    body: {
      name: 'Legacy User',
      wechat: 'legacy__id',
      campus: 'Zhejiang University',
      city: 'Hangzhou',
      avatarUrl: 'https://example.com/avatar.jpg',
      bio: 'Worker auth smoke test user.'
    }
  })
  assert.equal(updateProfile.status, 200)
  assert.equal(updateProfile.data.profile.id, 'legacy-user')
  assert.equal(updateProfile.data.profile.wechat, 'legacy__id')

  const saveWithAuth = await requestJson(workerModule, env, {
    method: 'POST',
    path: '/listings/listing-1/save',
    headers: authHeaders
  })
  assert.equal(saveWithAuth.status, 200)
  assert.deepEqual(saveWithAuth.data.ids, ['listing-1'])

  const savedWithAuth = await requestJson(workerModule, env, {
    path: '/me/saved',
    headers: authHeaders
  })
  assert.equal(savedWithAuth.status, 200)
  assert.deepEqual(savedWithAuth.data.ids, ['listing-1'])

  const hideListing = await requestJson(workerModule, env, {
    method: 'POST',
    path: '/me/visibility/hide-listing',
    headers: authHeaders,
    body: {
      listingId: 'listing-1'
    }
  })
  assert.equal(hideListing.status, 200)
  assert.equal(hideListing.data.hiddenListingIds.includes('listing-1'), true)

  const blockSeller = await requestJson(workerModule, env, {
    method: 'POST',
    path: '/me/visibility/block-seller',
    headers: authHeaders,
    body: {
      sellerKey: 'seller-1'
    }
  })
  assert.equal(blockSeller.status, 200)
  assert.equal(blockSeller.data.blockedSellerKeys.includes('seller-1'), true)

  const visibilityWithAuth = await requestJson(workerModule, env, {
    path: '/me/visibility',
    headers: authHeaders
  })
  assert.equal(visibilityWithAuth.status, 200)
  assert.equal(visibilityWithAuth.data.hiddenListingIds.includes('listing-1'), true)
  assert.equal(visibilityWithAuth.data.blockedSellerKeys.includes('seller-1'), true)

  const myListingsWithAuth = await requestJson(workerModule, env, {
    path: '/me/listings',
    headers: authHeaders
  })
  assert.equal(myListingsWithAuth.status, 200)
  assert.equal(Array.isArray(myListingsWithAuth.data.items), true)
  assert.equal(myListingsWithAuth.data.total, 0)

  const mediaSignWithoutAuth = await requestJson(workerModule, env, {
    method: 'POST',
    path: '/media/uploads/sign',
    body: {
      publicIdSuffix: 'image-1'
    }
  })
  assert.equal(mediaSignWithoutAuth.status, 401)

  const mediaSignWithAuth = await requestJson(workerModule, env, {
    method: 'POST',
    path: '/media/uploads/sign',
    headers: authHeaders,
    body: {
      publicIdSuffix: 'image-1'
    }
  })
  assert.equal(mediaSignWithAuth.status, 200)
  assert.equal(mediaSignWithAuth.data.provider, 'cloudinary')
  assert.match(mediaSignWithAuth.data.uploadUrl, /cloudinary\.com\/v1_1\/demo-cloud\/image\/upload/)
  assert.equal(Boolean(mediaSignWithAuth.data.formData && mediaSignWithAuth.data.formData.signature), true)
  assert.equal(Boolean(mediaSignWithAuth.data.formData && mediaSignWithAuth.data.formData.api_key), true)

  env.UNIMARKET_DB.users.set('admin-user', {
    id: 'admin-user',
    role: 'admin',
    status: 'active',
    wechat_openid: ''
  })

  const adminLogin = await requestJson(workerModule, env, {
    method: 'POST',
    path: '/auth/wechat/login',
    body: {
      fallbackUserId: 'admin-user'
    }
  })
  assert.equal(adminLogin.status, 200)

  const adminHeaders = {
    Authorization: `Bearer ${adminLogin.data.token}`
  }

  env.UNIMARKET_DB.users.set('seller-mn45iqst-8ug7z6', {
    id: 'seller-mn45iqst-8ug7z6',
    role: 'user',
    status: 'active',
    wechat_openid: ''
  })
  env.UNIMARKET_DB.users.set('wx:osm2g1zbjelmpy8u3k---ibr_zugs', {
    id: 'wx:osm2g1zbjelmpy8u3k---ibr_zugs',
    role: 'user',
    status: 'active',
    wechat_openid: 'osm2g1zbjelmpy8u3k---ibr_zugs'
  })
  env.UNIMARKET_DB.profiles.set('seller-mn45iqst-8ug7z6', {
    user_id: 'seller-mn45iqst-8ug7z6',
    display_name: 'miskathaa',
    wechat_id: 'miskathaa'
  })
  env.UNIMARKET_DB.profiles.set('wx:osm2g1zbjelmpy8u3k---ibr_zugs', {
    user_id: 'wx:osm2g1zbjelmpy8u3k---ibr_zugs',
    display_name: 'miskathaa',
    wechat_id: 'miskathaa'
  })
  env.UNIMARKET_DB.sellerProSubscriptions.push(
    {
      id: 'sub-legacy',
      user_id: 'seller-mn45iqst-8ug7z6',
      status: 'active',
      granted_at: '2026-03-26T07:38:00.000Z',
      expires_at: '2026-04-26T07:38:00.000Z',
      granted_by: 'admin-user',
      created_at: '2026-03-26T07:38:00.000Z'
    },
    {
      id: 'sub-wechat',
      user_id: 'wx:osm2g1zbjelmpy8u3k---ibr_zugs',
      status: 'active',
      granted_at: '2026-03-26T07:39:00.000Z',
      expires_at: '2026-04-26T07:39:00.000Z',
      granted_by: 'admin-user',
      created_at: '2026-03-26T07:39:00.000Z'
    }
  )

  const dedupedSubscriptions = await requestJson(workerModule, env, {
    path: '/moderation/seller-pro-subscriptions?status=active',
    headers: adminHeaders
  })
  assert.equal(dedupedSubscriptions.status, 200)
  assert.equal(dedupedSubscriptions.data.length, 1)
  assert.equal(dedupedSubscriptions.data[0].userId, 'wx:osm2g1zbjelmpy8u3k---ibr_zugs')

  const revokeDedupedSellerPro = await requestJson(workerModule, env, {
    method: 'DELETE',
    path: '/moderation/seller-pro-subscriptions/sub-wechat',
    headers: adminHeaders
  })
  assert.equal(revokeDedupedSellerPro.status, 200)
  assert.equal(env.UNIMARKET_DB.sellerProSubscriptions.filter((subscription) => subscription.status === 'active').length, 0)

  console.log('Worker smoke tests passed.')
}

run().catch((error) => {
  console.error('Worker smoke tests failed.')
  console.error(error && error.stack ? error.stack : error)
  process.exit(1)
})
