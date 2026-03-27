function json(data, init = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status: init.status || 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...corsHeaders(init.origin || "*"),
      ...(init.headers || {})
    }
  });
}

function corsHeaders(origin) {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "access-control-allow-headers": "Content-Type, Authorization"
  };
}

function notFound(origin) {
  return json(
    {
      error: "Not found"
    },
    { status: 404, origin }
  );
}

function methodNotAllowed(origin) {
  return json(
    {
      error: "Method not allowed"
    },
    { status: 405, origin }
  );
}

function normalizeBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

function normalizeListing(row) {
  if (!row) {
    return null;
  }

  const expiresAt = normalizeText(row.expires_at || row.expiresAt);
  const status = normalizeText(row.status, "active");
  const isArchived = !Boolean(row.is_sold) && (
    status === "archived"
      || (expiresAt && Number.isFinite(Date.parse(expiresAt)) && Date.parse(expiresAt) <= Date.now())
  );

  return {
    id: row.id,
    title: row.title,
    priceValue: row.price_value,
    priceLabel: row.price_label,
    location: row.location,
    address: row.address,
    university: row.university,
    categoryId: row.category_id,
    subcategory: row.subcategory,
    condition: row.listing_condition,
    description: row.description,
    status,
    isSold: Boolean(row.is_sold),
    soldOnUniMarket: Boolean(row.sold_on_unimarket),
    isArchived,
    archiveReason: isArchived ? "expired" : (Boolean(row.is_sold) ? "sold" : ""),
    archivedAt: isArchived ? expiresAt : "",
    isPromoted: Boolean(row.is_promoted),
    isSellerPro: Boolean(row.is_seller_pro),
    isPromotionRequested: Boolean(row.is_promotion_requested),
    promotionPlan: row.promotion_plan || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiresAt,
    image: row.cover_image_url || "",
    seller: {
      id: row.user_id,
      name: row.display_name || "",
      wechat: row.wechat_id || "",
      city: row.city || ""
    }
  };
}

function isValidHttpUrl(value) {
  const normalized = String(value || "").trim();
  return /^https?:\/\//i.test(normalized);
}

function normalizeImageInput(value) {
  const normalized = String(value || "").trim();
  return isValidHttpUrl(normalized) ? normalized : "";
}

function normalizeText(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function isActiveSellerProStatusSql() {
  return "status = 'active' AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)";
}

function isListingArchivedRecord(record) {
  if (!record || Boolean(record.is_sold)) {
    return false;
  }

  const status = normalizeText(record.status, "active").toLowerCase();
  if (status === "archived") {
    return true;
  }

  const expiresAt = normalizeText(record.expires_at || record.expiresAt);
  if (!expiresAt) {
    return false;
  }

  const expiresAtTs = Date.parse(expiresAt);
  return Number.isFinite(expiresAtTs) && expiresAtTs <= Date.now();
}

function normalizeRating(value, fallback = 0) {
  const rating = Number(value);
  if (!Number.isFinite(rating)) {
    return fallback;
  }

  return Math.max(1, Math.min(5, Math.round(rating)));
}

function getSessionSecret(env) {
  return normalizeText(env.JWT_SECRET || env.WECHAT_APP_SECRET || "");
}

function encodeBase64Url(value) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value) {
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 ? "=".repeat(4 - (normalized.length % 4)) : "";
  return atob(`${normalized}${padding}`);
}

async function signSessionToken(env, value) {
  const secretValue = getSessionSecret(env);
  if (!secretValue) {
    throw new Error("Session signing secret is not configured");
  }

  const secret = new TextEncoder().encode(secretValue);
  const key = await crypto.subtle.importKey(
    "raw",
    secret,
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(String(value || "")));
  const bytes = new Uint8Array(signature);
  let raw = "";

  bytes.forEach((byte) => {
    raw += String.fromCharCode(byte);
  });

  return encodeBase64Url(raw);
}

async function createSessionToken(env, claims = {}) {
  const now = Math.floor(Date.now() / 1000);
  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = encodeBase64Url(JSON.stringify({
    sub: normalizeText(claims.userId),
    role: normalizeText(claims.role, "user"),
    authMode: normalizeText(claims.authMode, "fallback"),
    openid: normalizeText(claims.openid),
    iat: now,
    exp: now + (60 * 60 * 24 * 30)
  }));
  const signature = await signSessionToken(env, `${header}.${payload}`);

  return `${header}.${payload}.${signature}`;
}

async function verifySessionToken(env, token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [header, payload, signature] = parts;
  let expectedSignature = "";
  try {
    expectedSignature = await signSessionToken(env, `${header}.${payload}`);
  } catch (error) {
    return null;
  }
  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const decodedPayload = JSON.parse(decodeBase64Url(payload));
    const expiresAt = Number(decodedPayload && decodedPayload.exp);

    if (expiresAt && expiresAt < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decodedPayload;
  } catch (error) {
    return null;
  }
}

function getBearerToken(request) {
  const authorization = String(request.headers.get("authorization") || "").trim();
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? String(match[1] || "").trim() : "";
}

async function getAuthenticatedSession(request, env) {
  const token = getBearerToken(request);
  if (!token) {
    return null;
  }

  const claims = await verifySessionToken(env, token);
  if (!claims || !claims.sub) {
    return null;
  }

  return {
    userId: normalizeText(claims.sub),
    role: normalizeText(claims.role, "user"),
    authMode: normalizeText(claims.authMode, "fallback"),
    openid: normalizeText(claims.openid)
  };
}

async function getUserRecord(env, userId) {
  const normalizedUserId = normalizeText(userId);
  if (!normalizedUserId) {
    return null;
  }

  return env.UNIMARKET_DB.prepare(
    `SELECT id, role, status, wechat_openid
    FROM users
    WHERE id = ?
    LIMIT 1`
  ).bind(normalizedUserId).first();
}

async function getRequestContext(request, env, payload = null) {
  const session = await getAuthenticatedSession(request, env);
  const userId = normalizeText(session && session.userId ? session.userId : "");
  const source = session && session.userId ? "session" : "none";
  const user = userId ? await getUserRecord(env, userId) : null;
  const role = normalizeText(user && user.role, session && session.role ? session.role : "user");

  return {
    userId,
    source,
    role,
    isAdmin: role === "admin",
    isAuthenticated: Boolean(userId)
  };
}

async function ensureUserRecord(env, userId, options = {}) {
  const normalizedUserId = normalizeText(userId);
  if (!normalizedUserId) {
    return null;
  }

  await env.UNIMARKET_DB.prepare(
    `INSERT INTO users (id, wechat_openid, role, status, created_at)
    VALUES (?, NULLIF(?, ''), ?, 'active', CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      wechat_openid = COALESCE(NULLIF(excluded.wechat_openid, ''), users.wechat_openid),
      role = COALESCE(users.role, excluded.role),
      status = COALESCE(users.status, 'active')`
  ).bind(
    normalizedUserId,
    normalizeText(options.wechatOpenId),
    normalizeText(options.role, "user")
  ).run();

  return getUserRecord(env, normalizedUserId);
}

function unauthorized(origin, message = "Authentication required") {
  return json({ error: message }, { status: 401, origin });
}

function forbidden(origin, message = "Forbidden") {
  return json({ error: message }, { status: 403, origin });
}

async function requireAuthenticatedUser(request, env, origin, payload = null) {
  const context = await getRequestContext(request, env, payload);
  if (!context.userId) {
    return { context, response: unauthorized(origin) };
  }

  await ensureUserRecord(env, context.userId);
  return { context, response: null };
}

async function requireAdmin(request, env, origin, payload = null) {
  const { context, response } = await requireAuthenticatedUser(request, env, origin, payload);
  if (response) {
    return { context, response };
  }

  if (!context.isAdmin) {
    return { context, response: forbidden(origin, "Admin access required") };
  }

  return { context, response: null };
}

async function requireListingOwner(request, env, origin, listingId, payload = null) {
  const { context, response } = await requireAuthenticatedUser(request, env, origin, payload);
  if (response) {
    return { context, listing: null, response };
  }

  const listing = await env.UNIMARKET_DB.prepare(
    `SELECT id, user_id, is_sold, is_promoted
    FROM listings
    WHERE id = ?
    LIMIT 1`
  ).bind(listingId).first();

  if (!listing) {
    return { context, listing: null, response: json({ error: "Listing not found" }, { status: 404, origin }) };
  }

  if (normalizeText(listing.user_id) !== context.userId) {
    return { context, listing, response: forbidden(origin, "Only the listing owner can perform this action") };
  }

  return { context, listing, response: null };
}

function normalizeFallbackUserId(value) {
  return normalizeText(value).replace(/[^\w:-]/g, "").slice(0, 80);
}

function canUseFallbackAuth(env) {
  return normalizeText(env.ALLOW_FALLBACK_AUTH).toLowerCase() === "true";
}

function isWechatBackedUserId(userId) {
  return normalizeText(userId).toLowerCase().startsWith("wx:");
}

function getSellerIdentityDedupKey(userId, profile = null) {
  const wechatId = normalizeText(
    profile && (profile.wechat_id || profile.wechat)
  ).trim().toLowerCase();

  if (wechatId) {
    return `wechat:${wechatId}`;
  }

  return `user:${normalizeText(userId).trim().toLowerCase()}`;
}

function getSubscriptionRecencyScore(record = {}) {
  const candidates = [
    record.granted_at,
    record.expires_at,
    record.created_at,
    record.grantedAt,
    record.expiresAt,
    record.createdAt
  ];

  for (const candidate of candidates) {
    const timestamp = Date.parse(String(candidate || ""));
    if (!Number.isNaN(timestamp)) {
      return timestamp;
    }
  }

  return 0;
}

function pickPreferredIdentityRecord(currentRecord, nextRecord) {
  if (!currentRecord) {
    return nextRecord;
  }

  if (!nextRecord) {
    return currentRecord;
  }

  const currentIsWechat = isWechatBackedUserId(currentRecord.user_id || currentRecord.userId);
  const nextIsWechat = isWechatBackedUserId(nextRecord.user_id || nextRecord.userId);

  if (currentIsWechat !== nextIsWechat) {
    return nextIsWechat ? nextRecord : currentRecord;
  }

  return getSubscriptionRecencyScore(nextRecord) >= getSubscriptionRecencyScore(currentRecord)
    ? nextRecord
    : currentRecord;
}

async function exchangeWeChatCode(code, env) {
  const appId = normalizeText(env.WECHAT_APP_ID);
  const appSecret = normalizeText(env.WECHAT_APP_SECRET);

  if (!appId || !appSecret) {
    return null;
  }

  const url = new URL("https://api.weixin.qq.com/sns/jscode2session");
  url.searchParams.set("appid", appId);
  url.searchParams.set("secret", appSecret);
  url.searchParams.set("js_code", normalizeText(code));
  url.searchParams.set("grant_type", "authorization_code");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`WeChat auth request failed with status ${response.status}`);
  }

  const payload = await response.json();
  if (payload && payload.errcode) {
    throw new Error(normalizeText(payload.errmsg, `WeChat auth error ${payload.errcode}`));
  }

  return {
    openid: normalizeText(payload && payload.openid),
    sessionKey: normalizeText(payload && payload.session_key),
    unionid: normalizeText(payload && payload.unionid)
  };
}

function isAdminCodeValid(env, code) {
  const expected = normalizeText(env.ADMIN_PASSCODE || "8100703");
  return normalizeText(code) === expected;
}

function getCloudinaryConfig(env) {
  return {
    cloudName: normalizeText(env.CLOUDINARY_CLOUD_NAME),
    apiKey: normalizeText(env.CLOUDINARY_API_KEY),
    apiSecret: normalizeText(env.CLOUDINARY_API_SECRET),
    folder: normalizeText(env.CLOUDINARY_FOLDER, "unimarket/listings")
  };
}

function canUseSignedCloudinary(env) {
  const config = getCloudinaryConfig(env);
  return Boolean(config.cloudName && config.apiKey && config.apiSecret);
}

function encodeHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function signCloudinaryParams(env, params = {}) {
  const config = getCloudinaryConfig(env);
  const signatureBase = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && String(params[key]).trim() !== "")
    .sort()
    .map((key) => `${key}=${String(params[key])}`)
    .join("&");
  const digest = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(`${signatureBase}${config.apiSecret}`)
  );

  return encodeHex(digest);
}

function normalizeListingPayload(payload = {}) {
  const imageUrls = Array.isArray(payload.images)
    ? payload.images.map(normalizeImageInput).filter(Boolean).slice(0, 10)
    : [];

  const title = normalizeText(payload.title);
  const categoryId = normalizeText(payload.categoryId);
  const userId = normalizeText(
    payload.userId
      || (payload.seller && payload.seller.id)
  );

  return {
    userId,
    title,
    priceLabel: normalizeText(payload.price),
    priceValue: Number.parseFloat(String(payload.price || "").replace(/[^\d.]/g, "")) || null,
    location: normalizeText(payload.location),
    address: normalizeText(payload.address),
    university: normalizeText(payload.university),
    categoryId,
    subcategory: normalizeText(payload.subcategory),
    condition: normalizeText(payload.condition),
    description: normalizeText(payload.description),
    imageUrls,
    seller: {
      id: userId,
      name: normalizeText(payload.seller && payload.seller.name, "You"),
      wechat: normalizeText(payload.seller && payload.seller.wechat),
      city: normalizeText(payload.location)
    }
  };
}

function validateListingPayload(payload) {
  if (!payload.userId) {
    return "Authenticated user is required";
  }

  if (!payload.title) {
    return "Title is required";
  }

  if (!payload.categoryId) {
    return "Category is required";
  }

  if (!payload.description) {
    return "Description is required";
  }

  if (!payload.seller.wechat) {
    return "Seller WeChat ID is required";
  }

  if (!payload.imageUrls.length) {
    return "At least one image URL is required";
  }

  return "";
}

async function upsertProfile(env, payload) {
  await ensureUserRecord(env, payload.userId);

  await env.UNIMARKET_DB.prepare(
    `INSERT INTO profiles (
      user_id,
      display_name,
      wechat_id,
      city,
      joined_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
      display_name = excluded.display_name,
      wechat_id = excluded.wechat_id,
      city = excluded.city,
      updated_at = CURRENT_TIMESTAMP`
  ).bind(
    payload.userId,
    payload.seller.name,
    payload.seller.wechat,
    payload.seller.city
  ).run();
}

async function replaceListingImages(env, listingId, imageUrls = []) {
  await env.UNIMARKET_DB.prepare(
    `DELETE FROM listing_images WHERE listing_id = ?`
  ).bind(listingId).run();

  for (const [index, imageUrl] of imageUrls.entries()) {
    await env.UNIMARKET_DB.prepare(
      `INSERT INTO listing_images (
        id,
        listing_id,
        r2_key,
        image_url,
        storage_provider,
        sort_order,
        created_at
      )
      VALUES (?, ?, '', ?, 'external', ?, CURRENT_TIMESTAMP)`
    ).bind(
      crypto.randomUUID(),
      listingId,
      imageUrl,
      index
    ).run();
  }
}

async function loadListingWithImages(request, env, id, origin) {
  const result = await env.UNIMARKET_DB.prepare(
    `SELECT
      l.id,
      l.user_id,
      l.title,
      l.price_value,
      l.price_label,
      l.location,
      l.address,
      l.university,
      l.category_id,
      l.subcategory,
      l.listing_condition,
      l.description,
      l.status,
      l.is_sold,
      l.sold_on_unimarket,
      l.expires_at,
      l.is_promoted,
      EXISTS(
        SELECT 1
        FROM seller_pro_subscriptions sps
        WHERE sps.user_id = l.user_id
          AND ${isActiveSellerProStatusSql()}
      ) AS is_seller_pro,
      EXISTS(
        SELECT 1
        FROM promotion_requests pr
        WHERE pr.listing_id = l.id
          AND pr.status = 'pending'
      ) AS is_promotion_requested,
      (
        SELECT pr.plan_id
        FROM promotion_requests pr
        WHERE pr.listing_id = l.id
        ORDER BY pr.created_at DESC
        LIMIT 1
      ) AS promotion_plan,
      l.created_at,
      l.updated_at,
      p.display_name,
      p.wechat_id,
      p.city,
      (
        SELECT COALESCE(NULLIF(li.image_url, ''), NULLIF(li.r2_key, ''))
        FROM listing_images li
        WHERE li.listing_id = l.id
        ORDER BY li.sort_order ASC, li.created_at ASC
        LIMIT 1
      ) AS cover_image_url
    FROM listings l
    LEFT JOIN profiles p ON p.user_id = l.user_id
    WHERE l.id = ?
    LIMIT 1`
  ).bind(id).first();

  if (!result) {
    return json(
      {
        error: "Listing not found"
      },
      { status: 404, origin }
    );
  }

  if (isListingArchivedRecord(result)) {
    const context = await getRequestContext(request, env);
    const isOwner = Boolean(context.userId) && normalizeText(result.user_id) === context.userId;

    if (!isOwner && !context.isAdmin) {
      return json(
        {
          error: "Listing not found"
        },
        { status: 404, origin }
      );
    }
  }

  const imagesResult = await env.UNIMARKET_DB.prepare(
    `SELECT id, image_url, r2_key, sort_order, storage_provider
    FROM listing_images
    WHERE listing_id = ?
    ORDER BY sort_order ASC, created_at ASC`
  ).bind(id).all();

  const listing = normalizeListing(result);
  listing.images = Array.isArray(imagesResult.results)
    ? imagesResult.results
        .map((image) => image.image_url || image.r2_key || "")
        .filter(Boolean)
    : [];
  listing.image = listing.images[0] || listing.image || "";

  return json(listing, { origin });
}

async function handleHealth(env, origin) {
  const dbCheck = await env.UNIMARKET_DB.prepare("SELECT 1 AS ok").first();

  return json(
    {
      ok: true,
      app: env.APP_NAME || "unimarket",
      environment: env.APP_ENV || "unknown",
      services: {
        d1: Boolean(dbCheck && dbCheck.ok === 1),
        kv: Boolean(env.UNIMARKET_CACHE)
      },
      now: new Date().toISOString()
    },
    { origin }
  );
}

async function loadListingAnalytics(env, listingId) {
  const viewAggregate = await env.UNIMARKET_DB.prepare(
    `SELECT
      COUNT(*) AS views,
      SUM(CASE WHEN created_at >= DATETIME(CURRENT_TIMESTAMP, '-7 days') THEN 1 ELSE 0 END) AS recent_views
    FROM listing_views
    WHERE listing_id = ?`
  ).bind(listingId).first();

  const saveAggregate = await env.UNIMARKET_DB.prepare(
    `SELECT
      COUNT(*) AS saves,
      SUM(CASE WHEN created_at >= DATETIME(CURRENT_TIMESTAMP, '-7 days') THEN 1 ELSE 0 END) AS recent_saves
    FROM saved_listings
    WHERE listing_id = ?`
  ).bind(listingId).first();

  return {
    views: Number(viewAggregate && viewAggregate.views ? viewAggregate.views : 0),
    saves: Number(saveAggregate && saveAggregate.saves ? saveAggregate.saves : 0),
    recentViews: Number(viewAggregate && viewAggregate.recent_views ? viewAggregate.recent_views : 0),
    recentSaves: Number(saveAggregate && saveAggregate.recent_saves ? saveAggregate.recent_saves : 0)
  };
}

async function loadSellerAnalytics(env, sellerUserId) {
  const profileViewAggregate = await env.UNIMARKET_DB.prepare(
    `SELECT
      COUNT(*) AS profile_views,
      SUM(CASE WHEN created_at >= DATETIME(CURRENT_TIMESTAMP, '-7 days') THEN 1 ELSE 0 END) AS recent_profile_views
    FROM profile_views
    WHERE seller_user_id = ?`
  ).bind(sellerUserId).first();

  const listingSaveAggregate = await env.UNIMARKET_DB.prepare(
    `SELECT
      COUNT(*) AS listing_saves,
      SUM(CASE WHEN sl.created_at >= DATETIME(CURRENT_TIMESTAMP, '-7 days') THEN 1 ELSE 0 END) AS recent_listing_saves
    FROM saved_listings sl
    INNER JOIN listings l ON l.id = sl.listing_id
    WHERE l.user_id = ?`
  ).bind(sellerUserId).first();

  return {
    profileViews: Number(profileViewAggregate && profileViewAggregate.profile_views ? profileViewAggregate.profile_views : 0),
    recentProfileViews: Number(profileViewAggregate && profileViewAggregate.recent_profile_views ? profileViewAggregate.recent_profile_views : 0),
    listingSaves: Number(listingSaveAggregate && listingSaveAggregate.listing_saves ? listingSaveAggregate.listing_saves : 0),
    recentListingSaves: Number(listingSaveAggregate && listingSaveAggregate.recent_listing_saves ? listingSaveAggregate.recent_listing_saves : 0)
  };
}

async function handleLogin(request, env, origin) {
  const payload = await request.json().catch(() => ({}));
  const code = normalizeText(payload.code);
  const fallbackUserId = normalizeFallbackUserId(payload.fallbackUserId);
  const fallbackAllowed = canUseFallbackAuth(env);
  let userId = "";
  let authMode = "";
  let wechatOpenId = "";
  let exchangeError = "";

  if (code) {
    try {
      const session = await exchangeWeChatCode(code, env);
      if (session && session.openid) {
        wechatOpenId = session.openid;
        userId = `wx:${wechatOpenId}`;
        authMode = "wechat";
      }
    } catch (error) {
      exchangeError = error instanceof Error ? error.message : "WeChat auth failed";
    }
  }

  if (!userId && fallbackAllowed && !code && fallbackUserId) {
    userId = fallbackUserId;
    authMode = "fallback";
  }

  if (!userId) {
    return json(
      {
        error: exchangeError || "Unable to authenticate user"
      },
      { status: 401, origin }
    );
  }

  await env.UNIMARKET_DB.prepare(
    `INSERT INTO users (id, wechat_openid, role, status, created_at)
    VALUES (?, NULLIF(?, ''), 'user', 'active', CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      wechat_openid = COALESCE(NULLIF(excluded.wechat_openid, ''), users.wechat_openid),
      status = COALESCE(users.status, 'active')`
  ).bind(userId, wechatOpenId).run();

  const user = await env.UNIMARKET_DB.prepare(
    `SELECT role, status
    FROM users
    WHERE id = ?
    LIMIT 1`
  ).bind(userId).first();

  const role = normalizeText(user && user.role, "user");
  const token = await createSessionToken(env, {
    userId,
    role,
    authMode,
    openid: wechatOpenId
  });

  return json(
    {
      ok: true,
      authenticated: true,
      backendReady: true,
      token,
      userId,
      role,
      isAdmin: role === "admin",
      authMode,
      wechatBound: Boolean(wechatOpenId)
    },
    { origin }
  );
}

async function handleCreateMediaUploadSignature(request, env, origin) {
  const payload = await request.json().catch(() => ({}));
  const { context, response } = await requireAuthenticatedUser(request, env, origin, payload);
  if (response) {
    return response;
  }

  if (!canUseSignedCloudinary(env)) {
    return json(
      {
        error: "Signed media upload is not configured on the backend"
      },
      { status: 503, origin }
    );
  }

  const config = getCloudinaryConfig(env);
  const publicIdSuffix = normalizeText(payload.publicIdSuffix).replace(/[^\w-]/g, "").slice(0, 40);
  const folderSuffix = normalizeText(payload.folderSuffix).replace(/[^\w/-]/g, "").replace(/\/+/g, "/").replace(/^\/|\/$/g, "").slice(0, 80);
  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = [
    "listing",
    context.userId.replace(/[^\w-]/g, "-").slice(0, 40) || "user",
    timestamp,
    publicIdSuffix || crypto.randomUUID().replace(/-/g, "").slice(0, 12)
  ].filter(Boolean).join("-");
  const folder = [config.folder, folderSuffix].filter(Boolean).join("/");
  const signature = await signCloudinaryParams(env, {
    folder,
    public_id: publicId,
    timestamp
  });

  return json(
    {
      ok: true,
      provider: "cloudinary",
      cloudName: config.cloudName,
      uploadUrl: `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/upload`,
      formData: {
        api_key: config.apiKey,
        folder,
        public_id: publicId,
        timestamp: String(timestamp),
        signature
      }
    },
    { origin }
  );
}

async function handleListListings(request, env, origin) {
  const url = new URL(request.url);
  const categoryId = String(url.searchParams.get("categoryId") || "").trim();
  const sellerKey = String(url.searchParams.get("sellerKey") || "").trim().toLowerCase();
  const includeSold = normalizeBoolean(url.searchParams.get("includeSold"), false);
  const includeResolved = normalizeBoolean(url.searchParams.get("includeResolved"), false);
  const includeArchived = normalizeBoolean(url.searchParams.get("includeArchived"), false);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 24), 1), 100);

  const whereParts = ["1 = 1"];
  const bindings = [];

  if (categoryId) {
    whereParts.push("l.category_id = ?");
    bindings.push(categoryId);
  }

  if (sellerKey) {
    whereParts.push("LOWER(COALESCE(p.wechat_id, p.display_name, l.user_id)) = ?");
    bindings.push(sellerKey);
  }

  if (!includeSold) {
    whereParts.push("l.is_sold = 0");
  }

  if (!includeResolved) {
    whereParts.push("l.status IN ('active', 'published')");
  }

  if (!includeArchived) {
    whereParts.push("(l.expires_at IS NULL OR l.expires_at > CURRENT_TIMESTAMP)");
  }

  bindings.push(limit);

  const statement = env.UNIMARKET_DB.prepare(
    `SELECT
      l.id,
      l.user_id,
      l.title,
      l.price_value,
      l.price_label,
      l.location,
      l.address,
      l.university,
      l.category_id,
      l.subcategory,
      l.listing_condition,
      l.description,
      l.status,
      l.is_sold,
      l.sold_on_unimarket,
      l.expires_at,
      l.is_promoted,
      EXISTS(
        SELECT 1
        FROM seller_pro_subscriptions sps
        WHERE sps.user_id = l.user_id
          AND ${isActiveSellerProStatusSql()}
      ) AS is_seller_pro,
      EXISTS(
        SELECT 1
        FROM promotion_requests pr
        WHERE pr.listing_id = l.id
          AND pr.status = 'pending'
      ) AS is_promotion_requested,
      (
        SELECT pr.plan_id
        FROM promotion_requests pr
        WHERE pr.listing_id = l.id
        ORDER BY pr.created_at DESC
        LIMIT 1
      ) AS promotion_plan,
      l.created_at,
      l.updated_at,
      p.display_name,
      p.wechat_id,
      p.city,
      (
        SELECT COALESCE(NULLIF(li.image_url, ''), NULLIF(li.r2_key, ''))
        FROM listing_images li
        WHERE li.listing_id = l.id
        ORDER BY li.sort_order ASC, li.created_at ASC
        LIMIT 1
      ) AS cover_image_url
    FROM listings l
    LEFT JOIN profiles p ON p.user_id = l.user_id
    WHERE ${whereParts.join(" AND ")}
    ORDER BY l.is_promoted DESC, l.created_at DESC
    LIMIT ?`
  ).bind(...bindings);

  const result = await statement.all();
  const listings = Array.isArray(result.results)
    ? result.results.map(normalizeListing)
    : [];

  return json(
    {
      items: listings,
      total: listings.length
    },
    { origin }
  );
}

async function handleGetListing(request, id, env, origin) {
  return loadListingWithImages(request, env, id, origin);
}

async function handleGetMeProfile(request, env, origin) {
  const { context, response } = await requireAuthenticatedUser(request, env, origin);
  if (response) {
    return response;
  }
  const userId = context.userId;

  const profile = await env.UNIMARKET_DB.prepare(
    `SELECT
      p.user_id,
      p.display_name,
      p.wechat_id,
      p.campus,
      p.city,
      p.avatar_url,
      p.bio,
      p.joined_at,
      u.role,
      u.status
    FROM profiles p
    LEFT JOIN users u ON u.id = p.user_id
    WHERE p.user_id = ?
    LIMIT 1`
  ).bind(userId).first();

  const user = await env.UNIMARKET_DB.prepare(
    `SELECT role, status
    FROM users
    WHERE id = ?
    LIMIT 1`
  ).bind(userId).first();

  const activeSubscription = await env.UNIMARKET_DB.prepare(
    `SELECT id, expires_at
    FROM seller_pro_subscriptions
    WHERE user_id = ?
      AND ${isActiveSellerProStatusSql()}
    ORDER BY granted_at DESC, created_at DESC
    LIMIT 1`
  ).bind(userId).first();

  const isSellerPro = Boolean(activeSubscription);
  const photoLimit = isSellerPro ? 10 : 5;
  const analytics = isSellerPro
    ? await loadSellerAnalytics(env, userId)
    : null;
  const role = normalizeText(user && user.role, "user");
  const isAdmin = role === "admin";

  return json(
    {
      authenticated: true,
      backendReady: true,
      photoLimit,
      isSellerPro,
      role,
      isAdmin,
      analytics,
      profile: profile
        ? {
            id: profile.user_id,
            name: profile.display_name || "",
            wechat: profile.wechat_id || "",
            campus: profile.campus || "",
            city: profile.city || "",
            avatarUrl: profile.avatar_url || "",
            bio: profile.bio || "",
            joinedAt: profile.joined_at || ""
          }
        : null
    },
    { origin }
  );
}

async function handleUpdateMyProfile(request, env, origin) {
  const payload = await request.json();
  const { context, response } = await requireAuthenticatedUser(request, env, origin, payload);
  if (response) {
    return response;
  }
  const userId = context.userId;

  await env.UNIMARKET_DB.prepare(
    `INSERT INTO profiles (
      user_id,
      display_name,
      wechat_id,
      campus,
      city,
      avatar_url,
      bio,
      joined_at,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
      display_name = excluded.display_name,
      wechat_id = excluded.wechat_id,
      campus = excluded.campus,
      city = excluded.city,
      avatar_url = excluded.avatar_url,
      bio = excluded.bio,
      updated_at = CURRENT_TIMESTAMP`
  ).bind(
    userId,
    normalizeText(payload.name),
    normalizeText(payload.wechat),
    normalizeText(payload.campus),
    normalizeText(payload.city || "Hangzhou"),
    normalizeText(payload.avatarUrl),
    normalizeText(payload.bio),
    normalizeText(payload.joinedAt)
  ).run();

  return handleGetMeProfile(request, env, origin);
}

async function handleGetSavedListings(request, env, origin) {
  const { context, response } = await requireAuthenticatedUser(request, env, origin);
  if (response) {
    return response;
  }
  const userId = context.userId;

  const result = await env.UNIMARKET_DB.prepare(
    `SELECT listing_id, created_at
    FROM saved_listings
    WHERE user_id = ?
    ORDER BY created_at DESC`
  ).bind(userId).all();

  const ids = Array.isArray(result.results)
    ? result.results.map((row) => String(row.listing_id || "")).filter(Boolean)
    : [];

  return json({ items: ids, ids }, { origin });
}

async function handleGetVisibilityPreferences(request, env, origin) {
  const { context, response } = await requireAuthenticatedUser(request, env, origin);
  if (response) {
    return response;
  }
  const userId = context.userId;

  const [hiddenResult, blockedResult] = await Promise.all([
    env.UNIMARKET_DB.prepare(
      `SELECT listing_id
      FROM hidden_listings
      WHERE user_id = ?
      ORDER BY created_at DESC`
    ).bind(userId).all(),
    env.UNIMARKET_DB.prepare(
      `SELECT seller_key
      FROM blocked_sellers
      WHERE user_id = ?
      ORDER BY created_at DESC`
    ).bind(userId).all()
  ]);

  return json(
    {
      hiddenListingIds: Array.isArray(hiddenResult.results)
        ? hiddenResult.results.map((row) => String(row.listing_id || "")).filter(Boolean)
        : [],
      blockedSellerKeys: Array.isArray(blockedResult.results)
        ? blockedResult.results.map((row) => String(row.seller_key || "").trim().toLowerCase()).filter(Boolean)
        : []
    },
    { origin }
  );
}

async function handleHideListingPreference(request, env, origin) {
  const payload = await request.json();
  const { context, response } = await requireAuthenticatedUser(request, env, origin, payload);
  const listingId = normalizeText(payload.listingId);

  if (response) {
    return response;
  }
  const userId = context.userId;

  if (!listingId) {
    return json({ error: "listingId is required" }, { status: 400, origin });
  }

  await env.UNIMARKET_DB.prepare(
    `INSERT OR IGNORE INTO hidden_listings (
      user_id,
      listing_id,
      created_at
    )
    VALUES (?, ?, CURRENT_TIMESTAMP)`
  ).bind(userId, listingId).run();

  return handleGetVisibilityPreferences(request, env, origin);
}

async function handleBlockSellerPreference(request, env, origin) {
  const payload = await request.json();
  const { context, response } = await requireAuthenticatedUser(request, env, origin, payload);
  const sellerKey = normalizeText(payload.sellerKey).toLowerCase();

  if (response) {
    return response;
  }
  const userId = context.userId;

  if (!sellerKey) {
    return json({ error: "sellerKey is required" }, { status: 400, origin });
  }

  await env.UNIMARKET_DB.prepare(
    `INSERT OR IGNORE INTO blocked_sellers (
      user_id,
      seller_key,
      created_at
    )
    VALUES (?, ?, CURRENT_TIMESTAMP)`
  ).bind(userId, sellerKey).run();

  return handleGetVisibilityPreferences(request, env, origin);
}

async function handleEnableAdminAccess(request, env, origin) {
  const payload = await request.json();
  const { context, response } = await requireAuthenticatedUser(request, env, origin, payload);
  const code = normalizeText(payload.code);

  if (response) {
    return response;
  }

  if (!isAdminCodeValid(env, code)) {
    return json({ error: "Invalid admin code" }, { status: 403, origin });
  }

  await env.UNIMARKET_DB.prepare(
    `INSERT INTO users (id, role, status)
    VALUES (?, 'admin', 'active')
    ON CONFLICT(id) DO UPDATE SET role = 'admin'`
  ).bind(context.userId).run();

  return json({ ok: true, role: "admin", isAdmin: true }, { origin });
}

async function handleDisableAdminAccess(request, env, origin) {
  const payload = request.method === "DELETE" ? null : await request.json().catch(() => ({}));
  const { context, response } = await requireAuthenticatedUser(request, env, origin, payload);
  if (response) {
    return response;
  }

  await env.UNIMARKET_DB.prepare(
    `UPDATE users
    SET role = 'user'
    WHERE id = ?`
  ).bind(context.userId).run();

  return json({ ok: true, role: "user", isAdmin: false }, { origin });
}

async function handleGetMyListings(request, env, origin) {
  const url = new URL(request.url);
  const { context, response } = await requireAuthenticatedUser(request, env, origin);
  const includeSold = normalizeBoolean(url.searchParams.get("includeSold"), true);
  const includeResolved = normalizeBoolean(url.searchParams.get("includeResolved"), true);
  const includeArchived = normalizeBoolean(url.searchParams.get("includeArchived"), true);

  if (response) {
    return response;
  }
  const userId = context.userId;

  const whereParts = ["l.user_id = ?"];
  const bindings = [userId];

  if (!includeSold) {
    whereParts.push("l.is_sold = 0");
  }

  if (!includeResolved) {
    whereParts.push("l.status IN ('active', 'published')");
  }

  if (!includeArchived) {
    whereParts.push("(l.expires_at IS NULL OR l.expires_at > CURRENT_TIMESTAMP)");
  }

  const result = await env.UNIMARKET_DB.prepare(
    `SELECT
      l.id,
      l.user_id,
      l.title,
      l.price_value,
      l.price_label,
      l.location,
      l.address,
      l.university,
      l.category_id,
      l.subcategory,
      l.listing_condition,
      l.description,
      l.status,
      l.is_sold,
      l.sold_on_unimarket,
      l.expires_at,
      l.is_promoted,
      EXISTS(
        SELECT 1
        FROM seller_pro_subscriptions sps
        WHERE sps.user_id = l.user_id
          AND ${isActiveSellerProStatusSql()}
      ) AS is_seller_pro,
      EXISTS(
        SELECT 1
        FROM promotion_requests pr
        WHERE pr.listing_id = l.id
          AND pr.status = 'pending'
      ) AS is_promotion_requested,
      (
        SELECT pr.plan_id
        FROM promotion_requests pr
        WHERE pr.listing_id = l.id
        ORDER BY pr.created_at DESC
        LIMIT 1
      ) AS promotion_plan,
      l.created_at,
      l.updated_at,
      p.display_name,
      p.wechat_id,
      p.city,
      (
        SELECT COALESCE(NULLIF(li.image_url, ''), NULLIF(li.r2_key, ''))
        FROM listing_images li
        WHERE li.listing_id = l.id
        ORDER BY li.sort_order ASC, li.created_at ASC
        LIMIT 1
      ) AS cover_image_url
    FROM listings l
    LEFT JOIN profiles p ON p.user_id = l.user_id
    WHERE ${whereParts.join(" AND ")}
    ORDER BY l.updated_at DESC, l.created_at DESC`
  ).bind(...bindings).all();

  const items = Array.isArray(result.results)
    ? result.results.map(normalizeListing)
    : [];

  return json({ items, total: items.length }, { origin });
}

function getPromotionPlans() {
  return [
    { id: "featured_1d", label: "Featured for 1 day", durationDays: 1, priceLabel: "29 RMB" },
    { id: "featured_2d", label: "Featured for 2 days", durationDays: 2, priceLabel: "49 RMB" },
    { id: "featured_3d", label: "Featured for 3 days", durationDays: 3, priceLabel: "69 RMB" },
    { id: "featured_7d", label: "Featured for 7 days", durationDays: 7, priceLabel: "129 RMB" }
  ];
}

function getPromotionPlanById(planId) {
  return getPromotionPlans().find((item) => item.id === planId) || null;
}

async function handleGetPromotionPlans(origin) {
  return json(getPromotionPlans(), { origin });
}

async function handleCreatePromotionRequest(request, env, origin) {
  const payload = await request.json();
  const listingId = normalizeText(payload.listingId);
  const planId = normalizeText(payload.planId, "featured_1d");
  const { context, response } = await requireAuthenticatedUser(request, env, origin, payload);

  if (response) {
    return response;
  }

  if (!listingId) {
    return json({ error: "listingId is required" }, { status: 400, origin });
  }

  const plan = getPromotionPlanById(planId);
  if (!plan) {
    return json({ error: "Invalid promotion plan" }, { status: 400, origin });
  }

  const listing = await env.UNIMARKET_DB.prepare(
    `SELECT id, user_id, is_sold, is_promoted
    FROM listings
    WHERE id = ?
    LIMIT 1`
  ).bind(listingId).first();

  if (!listing) {
    return json({ error: "Listing not found" }, { status: 404, origin });
  }

  if (Boolean(listing.is_sold)) {
    return json({ error: "Cannot promote sold listing" }, { status: 400, origin });
  }

  if (Boolean(listing.is_promoted)) {
    return json({ error: "Listing is already promoted" }, { status: 400, origin });
  }

  if (normalizeText(listing.user_id) !== context.userId) {
    return forbidden(origin, "Only the listing owner can request promotion");
  }

  const existingPending = await env.UNIMARKET_DB.prepare(
    `SELECT id, status
    FROM promotion_requests
    WHERE listing_id = ?
      AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 1`
  ).bind(listingId).first();

  if (existingPending) {
    return json(
      {
        ok: true,
        id: existingPending.id,
        listingId,
        planId,
        status: existingPending.status,
        alreadyExists: true
      },
      { origin }
    );
  }

  const insertResult = await env.UNIMARKET_DB.prepare(
    `INSERT OR IGNORE INTO promotion_requests (
      id,
      listing_id,
      user_id,
      plan_id,
      status,
      created_at
    )
    VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)`
  ).bind(
    crypto.randomUUID(),
    listingId,
    context.userId,
    planId
  ).run();

  const promotionRequestChanges = insertResult && insertResult.meta && typeof insertResult.meta.changes === "number"
    ? insertResult.meta.changes
    : 0;

  if (promotionRequestChanges === 0) {
    const currentPending = await env.UNIMARKET_DB.prepare(
      `SELECT id, plan_id, status
      FROM promotion_requests
      WHERE listing_id = ?
        AND status = 'pending'
      ORDER BY created_at DESC
      LIMIT 1`
    ).bind(listingId).first();

    return json(
      {
        ok: true,
        id: currentPending && currentPending.id ? currentPending.id : "",
        listingId,
        planId: currentPending && currentPending.plan_id ? currentPending.plan_id : planId,
        status: currentPending && currentPending.status ? currentPending.status : "pending",
        alreadyExists: true
      },
      { origin }
    );
  }

  return json(
    {
      ok: true,
      listingId,
      planId,
      status: "pending"
    },
    { origin }
  );
}

async function handleGetProfileByListingId(listingId, env, origin) {
  const listing = await env.UNIMARKET_DB.prepare(
    `SELECT
      l.id,
      l.user_id,
      p.display_name,
      p.wechat_id,
      p.campus,
      p.city,
      p.avatar_url,
      p.bio,
      p.joined_at,
      EXISTS(
        SELECT 1
        FROM seller_pro_subscriptions sps
        WHERE sps.user_id = l.user_id
          AND ${isActiveSellerProStatusSql()}
      ) AS is_seller_pro
    FROM listings l
    LEFT JOIN profiles p ON p.user_id = l.user_id
    WHERE l.id = ?
    LIMIT 1`
  ).bind(listingId).first();

  if (!listing) {
    return json({ error: "Seller profile not found" }, { status: 404, origin });
  }

  const listingsResult = await env.UNIMARKET_DB.prepare(
    `SELECT
      l.id,
      l.user_id,
      l.title,
      l.price_value,
      l.price_label,
      l.location,
      l.address,
      l.university,
      l.category_id,
      l.subcategory,
      l.listing_condition,
      l.description,
      l.status,
      l.is_sold,
      l.sold_on_unimarket,
      l.expires_at,
      l.is_promoted,
      EXISTS(
        SELECT 1
        FROM seller_pro_subscriptions sps
        WHERE sps.user_id = l.user_id
          AND ${isActiveSellerProStatusSql()}
      ) AS is_seller_pro,
      EXISTS(
        SELECT 1
        FROM promotion_requests pr
        WHERE pr.listing_id = l.id
          AND pr.status = 'pending'
      ) AS is_promotion_requested,
      (
        SELECT pr.plan_id
        FROM promotion_requests pr
        WHERE pr.listing_id = l.id
        ORDER BY pr.created_at DESC
        LIMIT 1
      ) AS promotion_plan,
      l.created_at,
      l.updated_at,
      p.display_name,
      p.wechat_id,
      p.city,
      (
        SELECT COALESCE(NULLIF(li.image_url, ''), NULLIF(li.r2_key, ''))
        FROM listing_images li
        WHERE li.listing_id = l.id
        ORDER BY li.sort_order ASC, li.created_at ASC
        LIMIT 1
      ) AS cover_image_url
    FROM listings l
    LEFT JOIN profiles p ON p.user_id = l.user_id
    WHERE l.user_id = ?
    ORDER BY l.updated_at DESC, l.created_at DESC`
  ).bind(listing.user_id).all();

  const allListings = Array.isArray(listingsResult.results)
    ? listingsResult.results.map(normalizeListing)
    : [];
  const activeListings = allListings.filter((item) => !item.isSold && !item.isArchived);
  const soldCount = allListings.filter((item) => Boolean(item && item.isSold && item.soldOnUniMarket)).length;
  const analytics = listing.is_seller_pro
    ? await loadSellerAnalytics(env, listing.user_id)
    : null;

  return json(
    {
      sellerKey: String(listing.user_id || "").trim().toLowerCase(),
      id: listing.user_id,
      name: listing.display_name || "Student seller",
      badge: listing.is_seller_pro ? "Seller Pro" : "Community member",
      wechat: listing.wechat_id || "",
      note: activeListings.length ? "Active on UniMarket" : "",
      avatarUrl: listing.avatar_url || "",
      bio: listing.bio || "",
      campus: listing.campus || "",
      city: listing.city || "Hangzhou",
      joinedAt: listing.joined_at || "",
      listings: activeListings,
      soldCount,
      isSellerPro: Boolean(listing.is_seller_pro),
      analytics
    },
    { origin }
  );
}

async function handleCreateReport(request, env, origin) {
  const payload = await request.json();
  const { context, response } = await requireAuthenticatedUser(request, env, origin, payload);
  const targetType = normalizeText(payload.targetType || "listing");
  const listingId = normalizeText(payload.listingId);
  const profileUserId = normalizeText(payload.profileUserId || payload.profileKey);
  const reason = normalizeText(payload.reason, "Other");
  const note = normalizeText(payload.note);

  if (response) {
    return response;
  }

  if (!["listing", "profile"].includes(targetType)) {
    return json({ error: "Invalid targetType" }, { status: 400, origin });
  }

  const existing = await env.UNIMARKET_DB.prepare(
    `SELECT id, status
    FROM reports
    WHERE reporter_user_id = ?
      AND target_type = ?
      AND COALESCE(listing_id, '') = ?
      AND COALESCE(profile_user_id, '') = ?
      AND status IN ('pending', 'reviewing', 'open')
    ORDER BY created_at DESC
    LIMIT 1`
  ).bind(
    context.userId,
    targetType,
    listingId || "",
    profileUserId || ""
  ).first();

  if (existing) {
    return json(
      {
        ok: true,
        id: existing.id,
        status: existing.status,
        alreadyExists: true
      },
      { origin }
    );
  }

  const id = crypto.randomUUID();
  await env.UNIMARKET_DB.prepare(
    `INSERT INTO reports (
      id,
      reporter_user_id,
      target_type,
      listing_id,
      profile_user_id,
      reason,
      note,
      status,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)`
  ).bind(
    id,
    context.userId,
    targetType,
    listingId || null,
    profileUserId || null,
    reason,
    note
  ).run();

  return json({ ok: true, id, status: "pending" }, { origin });
}

async function handleGetReviewSummary(request, env, origin) {
  const url = new URL(request.url);
  const sellerUserId = normalizeText(url.searchParams.get("sellerUserId"));
  const listingId = normalizeText(url.searchParams.get("listingId"));
  const reviewerUserId = normalizeText(url.searchParams.get("reviewerUserId"));

  if (!sellerUserId) {
    return json(
      {
        average: 0,
        count: 0,
        recentReviews: [],
        hasReviewedCurrentListing: false
      },
      { origin }
    );
  }

  const aggregate = await env.UNIMARKET_DB.prepare(
    `SELECT
      COUNT(*) AS review_count,
      COALESCE(AVG(rating), 0) AS average_rating
    FROM reviews
    WHERE seller_user_id = ?`
  ).bind(sellerUserId).first();

  const recentResult = await env.UNIMARKET_DB.prepare(
    `SELECT
      r.id,
      r.listing_id,
      r.rating,
      r.comment,
      r.created_at,
      rp.display_name AS reviewer_name
    FROM reviews r
    LEFT JOIN profiles rp ON rp.user_id = r.reviewer_user_id
    WHERE r.seller_user_id = ?
    ORDER BY r.created_at DESC
    LIMIT 3`
  ).bind(sellerUserId).all();

  let hasReviewedCurrentListing = false;
  if (listingId && reviewerUserId) {
    const existing = await env.UNIMARKET_DB.prepare(
      `SELECT id
      FROM reviews
      WHERE listing_id = ?
        AND reviewer_user_id = ?
      LIMIT 1`
    ).bind(listingId, reviewerUserId).first();

    hasReviewedCurrentListing = Boolean(existing);
  }

  return json(
    {
      average: Number(aggregate && aggregate.average_rating ? aggregate.average_rating : 0),
      count: Number(aggregate && aggregate.review_count ? aggregate.review_count : 0),
      recentReviews: Array.isArray(recentResult.results)
        ? recentResult.results.map((row) => ({
            id: row.id,
            listingId: row.listing_id,
            rating: Number(row.rating || 0),
            comment: row.comment || "",
            reviewerName: row.reviewer_name || "UniMarket user",
            createdAt: row.created_at || ""
          }))
        : [],
      hasReviewedCurrentListing
    },
    { origin }
  );
}

async function handleCreateReview(request, env, origin) {
  const payload = await request.json();
  const listingId = normalizeText(payload.listingId);
  const { context, response } = await requireAuthenticatedUser(request, env, origin, payload);
  const sellerUserId = normalizeText(payload.sellerUserId);
  const rating = normalizeRating(payload.rating);
  const comment = normalizeText(payload.comment || payload.note);

  if (response) {
    return response;
  }

  if (!listingId) {
    return json({ error: "listingId is required" }, { status: 400, origin });
  }

  if (!rating) {
    return json({ error: "rating is required" }, { status: 400, origin });
  }

  const listing = await env.UNIMARKET_DB.prepare(
    `SELECT id, user_id
    FROM listings
    WHERE id = ?
    LIMIT 1`
  ).bind(listingId).first();

  if (!listing) {
    return json({ error: "Listing not found" }, { status: 404, origin });
  }

  const effectiveSellerUserId = sellerUserId || String(listing.user_id || "");
  if (effectiveSellerUserId !== String(listing.user_id || "")) {
    return json({ error: "sellerUserId does not match listing owner" }, { status: 400, origin });
  }

  if (normalizeText(listing.user_id) === context.userId) {
    return json({ error: "You cannot review your own listing" }, { status: 400, origin });
  }

  const existing = await env.UNIMARKET_DB.prepare(
    `SELECT id
    FROM reviews
    WHERE listing_id = ?
      AND reviewer_user_id = ?
    LIMIT 1`
  ).bind(listingId, context.userId).first();

  if (existing) {
    return json(
      {
        ok: true,
        id: existing.id,
        alreadyExists: true
      },
      { origin }
    );
  }

  const id = crypto.randomUUID();
  const insertResult = await env.UNIMARKET_DB.prepare(
    `INSERT OR IGNORE INTO reviews (
      id,
      listing_id,
      seller_user_id,
      reviewer_user_id,
      rating,
      comment,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
  ).bind(
    id,
    listingId,
    effectiveSellerUserId,
    context.userId,
    rating,
    comment
  ).run();

  const reviewChanges = insertResult && insertResult.meta && typeof insertResult.meta.changes === "number"
    ? insertResult.meta.changes
    : 0;

  if (reviewChanges === 0) {
    const currentReview = await env.UNIMARKET_DB.prepare(
      `SELECT id
      FROM reviews
      WHERE listing_id = ?
        AND reviewer_user_id = ?
      LIMIT 1`
    ).bind(listingId, context.userId).first();

    return json(
      {
        ok: true,
        id: currentReview && currentReview.id ? currentReview.id : "",
        alreadyExists: true
      },
      { origin }
    );
  }

  return json({ ok: true, id }, { origin });
}

async function handleRecordListingView(request, env, origin, listingId) {
  const payload = request.method === "POST" ? await request.json().catch(() => ({})) : {};
  const context = await getRequestContext(request, env, payload);

  const listing = await env.UNIMARKET_DB.prepare(
    `SELECT id
    FROM listings
    WHERE id = ?
    LIMIT 1`
  ).bind(listingId).first();

  if (!listing) {
    return json({ error: "Listing not found" }, { status: 404, origin });
  }

  await env.UNIMARKET_DB.prepare(
    `INSERT INTO listing_views (
      id,
      listing_id,
      viewer_user_id,
      created_at
    )
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)`
  ).bind(
    crypto.randomUUID(),
    listingId,
    context.userId || ""
  ).run();

  return json({ ok: true, id: listingId }, { origin });
}

async function handleGetListingAnalytics(request, env, origin, listingId) {
  const { context, listing, response } = await requireListingOwner(request, env, origin, listingId);
  if (response) {
    return response;
  }

  if (!listing || !context.userId) {
    return forbidden(origin, "Only the listing owner can view analytics");
  }

  const existing = await env.UNIMARKET_DB.prepare(
    `SELECT id
    FROM listings
    WHERE id = ?
    LIMIT 1`
  ).bind(listingId).first();

  if (!existing) {
    return json({ error: "Listing not found" }, { status: 404, origin });
  }

  return json(await loadListingAnalytics(env, listingId), { origin });
}

async function handleRecordProfileView(request, env, origin, sellerKey) {
  const payload = request.method === "POST" ? await request.json().catch(() => ({})) : {};
  const context = await getRequestContext(request, env, payload);
  const normalizedSellerKey = normalizeText(sellerKey).toLowerCase();

  const seller = await env.UNIMARKET_DB.prepare(
    `SELECT id
    FROM users
    WHERE LOWER(id) = ?
    LIMIT 1`
  ).bind(normalizedSellerKey).first();

  if (!seller) {
    return json({ error: "Seller not found" }, { status: 404, origin });
  }

  await env.UNIMARKET_DB.prepare(
    `INSERT INTO profile_views (
      id,
      seller_user_id,
      viewer_user_id,
      created_at
    )
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)`
  ).bind(
    crypto.randomUUID(),
    seller.id,
    context.userId || ""
  ).run();

  return json({ ok: true, sellerKey: normalizedSellerKey }, { origin });
}

async function handleGetModerationReports(request, env, origin) {
  const { response } = await requireAdmin(request, env, origin);
  if (response) {
    return response;
  }

  const result = await env.UNIMARKET_DB.prepare(
    `SELECT
      r.id,
      r.target_type,
      r.listing_id,
      r.profile_user_id,
      r.reason,
      r.note,
      r.status,
      r.created_at,
      r.reviewed_at,
      r.reviewed_by,
      l.title AS listing_title,
      p.display_name AS profile_name
    FROM reports r
    LEFT JOIN listings l ON l.id = r.listing_id
    LEFT JOIN profiles p ON p.user_id = r.profile_user_id
    ORDER BY r.created_at DESC`
  ).all();

  const items = Array.isArray(result.results)
    ? result.results.map((row) => ({
        id: row.id,
        targetType: row.target_type || "listing",
        listingId: row.listing_id || "",
        listingTitle: row.listing_title || "",
        profileKey: row.profile_user_id || "",
        profileName: row.profile_name || "",
        reason: row.reason || "",
        note: row.note || "",
        status: row.status || "pending",
        createdAt: row.created_at,
        reviewedAt: row.reviewed_at,
        reviewedBy: row.reviewed_by
      }))
    : [];

  return json(items, { origin });
}

async function handleReviewModerationReport(request, env, origin, reportId) {
  const { context, response } = await requireAdmin(request, env, origin);
  if (response) {
    return response;
  }

  const payload = await request.json();
  const nextStatus = normalizeText(payload.action || payload.status).toLowerCase();

  if (!["pending", "reviewing", "resolved", "dismissed"].includes(nextStatus)) {
    return json({ error: "Invalid report status" }, { status: 400, origin });
  }

  const existing = await env.UNIMARKET_DB.prepare(
    `SELECT id FROM reports WHERE id = ? LIMIT 1`
  ).bind(reportId).first();

  if (!existing) {
    return json({ error: "Report not found" }, { status: 404, origin });
  }

  await env.UNIMARKET_DB.prepare(
    `UPDATE reports
    SET
      status = ?,
      reviewed_at = CURRENT_TIMESTAMP,
      reviewed_by = ?
    WHERE id = ?`
  ).bind(nextStatus, context.userId || "admin-panel", reportId).run();

  return json({ ok: true, id: reportId, status: nextStatus }, { origin });
}

async function handleGetModerationPromotionRequests(request, env, origin) {
  const { response } = await requireAdmin(request, env, origin);
  if (response) {
    return response;
  }

  const url = new URL(request.url);
  const status = normalizeText(url.searchParams.get("status"));
  const whereParts = ["1 = 1"];
  const bindings = [];

  if (status) {
    whereParts.push("pr.status = ?");
    bindings.push(status);
  }

  const result = await env.UNIMARKET_DB.prepare(
    `SELECT
      pr.id,
      pr.listing_id,
      pr.user_id,
      pr.plan_id,
      pr.status,
      pr.created_at,
      pr.reviewed_at,
      pr.reviewed_by,
      l.title AS listing_title,
      p.display_name AS seller_name,
      p.wechat_id AS seller_wechat,
      EXISTS(
        SELECT 1
        FROM seller_pro_subscriptions sps
        WHERE sps.user_id = pr.user_id
          AND ${isActiveSellerProStatusSql()}
      ) AS is_seller_pro
    FROM promotion_requests pr
    LEFT JOIN listings l ON l.id = pr.listing_id
    LEFT JOIN profiles p ON p.user_id = pr.user_id
    WHERE ${whereParts.join(" AND ")}
    ORDER BY pr.created_at DESC`
  ).bind(...bindings).all();

  const items = Array.isArray(result.results)
    ? result.results.map((row) => {
        const plan = getPromotionPlanById(row.plan_id);

        return {
          id: row.id,
          listingId: row.listing_id,
          userId: row.user_id,
          planId: row.plan_id,
          planLabel: plan ? plan.label : row.plan_id,
          priceLabel: plan ? plan.priceLabel : "",
          status: row.status,
          createdAt: row.created_at,
          reviewedAt: row.reviewed_at,
          reviewedBy: row.reviewed_by,
          listingTitle: row.listing_title || "",
          sellerName: row.seller_name || "",
          sellerWechat: row.seller_wechat || "",
          isSellerPro: Boolean(row.is_seller_pro)
        };
      })
    : [];

  return json(items, { origin });
}

async function handleCreateSellerProRequest(request, env, origin) {
  const payload = await request.json();
  const { context, response } = await requireAuthenticatedUser(request, env, origin, payload);

  if (response) {
    return response;
  }

  const existing = await env.UNIMARKET_DB.prepare(
    `SELECT id, status
    FROM seller_pro_subscriptions
    WHERE user_id = ?
      AND status IN ('pending', 'active')
    ORDER BY created_at DESC
    LIMIT 1`
  ).bind(context.userId).first();

  if (existing) {
    return json(
      {
        ok: true,
        id: existing.id,
        status: existing.status,
        alreadyExists: true
      },
      { origin }
    );
  }

  const id = crypto.randomUUID();
  await env.UNIMARKET_DB.prepare(
    `INSERT INTO seller_pro_subscriptions (
      id,
      user_id,
      status,
      created_at
    )
    VALUES (?, ?, 'pending', CURRENT_TIMESTAMP)`
  ).bind(id, context.userId).run();

  return json({ ok: true, id, status: "pending" }, { origin });
}

async function handleGetModerationSellerProSubscriptions(request, env, origin) {
  const { response } = await requireAdmin(request, env, origin);
  if (response) {
    return response;
  }

  const url = new URL(request.url);
  const status = normalizeText(url.searchParams.get("status"));
  const whereParts = ["1 = 1"];
  const bindings = [];

  if (status) {
    whereParts.push("status = ?");
    bindings.push(status);
  }

  const result = await env.UNIMARKET_DB.prepare(
    `SELECT
      id,
      user_id,
      status,
      granted_at,
      expires_at,
      granted_by,
      created_at
    FROM seller_pro_subscriptions
    WHERE ${whereParts.join(" AND ")}
    ORDER BY created_at DESC`
  ).bind(...bindings).all();

  const rows = Array.isArray(result.results) ? result.results : [];
  const uniqueItems = new Map();

  for (const row of rows) {
    const profile = await env.UNIMARKET_DB.prepare(
      `SELECT display_name, wechat_id
      FROM profiles
      WHERE user_id = ?
      LIMIT 1`
    ).bind(row.user_id).first();

    const item = {
      id: row.id,
      userId: row.user_id,
      sellerKey: String(row.user_id || "").trim().toLowerCase(),
      nickname: profile && profile.display_name ? profile.display_name : "",
      wechat: profile && profile.wechat_id ? profile.wechat_id : "",
      status: row.status || "inactive",
      grantedAt: row.granted_at || "",
      expiresAt: row.expires_at || "",
      grantedBy: row.granted_by || "",
      createdAt: row.created_at || ""
    };
    const dedupKey = `${item.status}:${getSellerIdentityDedupKey(row.user_id, profile)}`;
    uniqueItems.set(dedupKey, pickPreferredIdentityRecord(uniqueItems.get(dedupKey), item));
  }

  return json(Array.from(uniqueItems.values()), { origin });
}

async function handleGrantSellerProByNickname(request, env, origin) {
  const { context, response } = await requireAdmin(request, env, origin);
  if (response) {
    return response;
  }

  const payload = await request.json();
  const nickname = normalizeText(payload.nickname);
  const grantedBy = normalizeText(payload.grantedBy, context.userId || "admin-panel");

  if (!nickname) {
    return json({ error: "nickname is required" }, { status: 400, origin });
  }

  const matches = await env.UNIMARKET_DB.prepare(
    `SELECT p.user_id, p.display_name, p.wechat_id, u.wechat_openid
    FROM profiles p
    LEFT JOIN users u ON u.id = p.user_id
    WHERE LOWER(TRIM(p.display_name)) = LOWER(TRIM(?))`
  ).bind(nickname).all();

  const matchedRows = Array.isArray(matches.results) ? matches.results : [];
  const uniqueRows = new Map();

  matchedRows.forEach((row) => {
    const dedupKey = getSellerIdentityDedupKey(row.user_id, row);
    uniqueRows.set(dedupKey, pickPreferredIdentityRecord(uniqueRows.get(dedupKey), row));
  });

  const rows = Array.from(uniqueRows.values());

  if (!rows.length) {
    return json({ error: "Seller with this nickname not found" }, { status: 404, origin });
  }

  for (const row of rows) {
    const existingActive = await env.UNIMARKET_DB.prepare(
      `SELECT id
      FROM seller_pro_subscriptions
      WHERE user_id = ?
        AND status = 'active'
      ORDER BY granted_at DESC, created_at DESC
      LIMIT 1`
    ).bind(row.user_id).first();

    if (existingActive) {
      await env.UNIMARKET_DB.prepare(
        `UPDATE seller_pro_subscriptions
        SET
          status = 'active',
          granted_at = CURRENT_TIMESTAMP,
          expires_at = DATETIME(CURRENT_TIMESTAMP, '+1 month'),
          granted_by = ?
        WHERE id = ?`
      ).bind(grantedBy, existingActive.id).run();
      continue;
    }

    const pending = await env.UNIMARKET_DB.prepare(
      `SELECT id
      FROM seller_pro_subscriptions
      WHERE user_id = ?
        AND status = 'pending'
      ORDER BY created_at DESC
      LIMIT 1`
    ).bind(row.user_id).first();

    if (pending) {
      await env.UNIMARKET_DB.prepare(
        `UPDATE seller_pro_subscriptions
        SET
          status = 'active',
          granted_at = CURRENT_TIMESTAMP,
          expires_at = DATETIME(CURRENT_TIMESTAMP, '+1 month'),
          granted_by = ?
        WHERE id = ?`
      ).bind(grantedBy, pending.id).run();
      continue;
    }

    await env.UNIMARKET_DB.prepare(
      `INSERT INTO seller_pro_subscriptions (
        id,
        user_id,
        status,
        granted_at,
        expires_at,
        granted_by,
        created_at
      )
      VALUES (?, ?, 'active', CURRENT_TIMESTAMP, DATETIME(CURRENT_TIMESTAMP, '+1 month'), ?, CURRENT_TIMESTAMP)`
    ).bind(crypto.randomUUID(), row.user_id, grantedBy).run();
  }

  return json({ ok: true, grantedCount: rows.length }, { origin });
}

async function handleReviewModerationSellerProSubscription(request, env, origin, subscriptionId) {
  const { context, response } = await requireAdmin(request, env, origin);
  if (response) {
    return response;
  }

  const payload = await request.json();
  const action = normalizeText(payload.action).toLowerCase();

  if (!["approve", "reject"].includes(action)) {
    return json({ error: "Invalid moderation action" }, { status: 400, origin });
  }

  const existing = await env.UNIMARKET_DB.prepare(
    `SELECT id, status
    FROM seller_pro_subscriptions
    WHERE id = ?
    LIMIT 1`
  ).bind(subscriptionId).first();

  if (!existing) {
    return json({ error: "Seller Pro request not found" }, { status: 404, origin });
  }

  const nextStatus = action === "approve" ? "active" : "rejected";

  await env.UNIMARKET_DB.prepare(
    `UPDATE seller_pro_subscriptions
    SET
      status = ?,
      granted_at = CASE WHEN ? = 'active' THEN CURRENT_TIMESTAMP ELSE granted_at END,
      expires_at = CASE WHEN ? = 'active' THEN DATETIME(CURRENT_TIMESTAMP, '+1 month') ELSE expires_at END,
      granted_by = CASE WHEN ? = 'active' THEN ? ELSE granted_by END
    WHERE id = ?`
  ).bind(nextStatus, nextStatus, nextStatus, nextStatus, context.userId || "admin-panel", subscriptionId).run();

  return json({ ok: true, id: subscriptionId, status: nextStatus }, { origin });
}

async function handleRevokeSellerProSubscription(request, env, origin, subscriptionId) {
  const { response } = await requireAdmin(request, env, origin);
  if (response) {
    return response;
  }

  const existing = await env.UNIMARKET_DB.prepare(
    `SELECT id, user_id
    FROM seller_pro_subscriptions
    WHERE id = ?
    LIMIT 1`
  ).bind(subscriptionId).first();

  if (!existing) {
    return json({ error: "Seller Pro subscription not found" }, { status: 404, origin });
  }

  const profile = await env.UNIMARKET_DB.prepare(
    `SELECT wechat_id
    FROM profiles
    WHERE user_id = ?
    LIMIT 1`
  ).bind(existing.user_id).first();

  const normalizedWechatId = normalizeText(profile && profile.wechat_id).trim().toLowerCase();

  if (normalizedWechatId) {
    await env.UNIMARKET_DB.prepare(
      `UPDATE seller_pro_subscriptions
      SET
        status = 'inactive',
        expires_at = CURRENT_TIMESTAMP
      WHERE user_id IN (
        SELECT p.user_id
        FROM profiles p
        WHERE LOWER(TRIM(COALESCE(p.wechat_id, ''))) = ?
      )
        AND status = 'active'`
    ).bind(normalizedWechatId).run();
  } else {
    await env.UNIMARKET_DB.prepare(
      `UPDATE seller_pro_subscriptions
      SET
        status = 'inactive',
        expires_at = CURRENT_TIMESTAMP
      WHERE id = ?`
    ).bind(subscriptionId).run();
  }

  return json({ ok: true, id: subscriptionId, status: "inactive" }, { origin });
}

async function handleReviewModerationPromotionRequest(request, env, origin, requestId) {
  const { context, response } = await requireAdmin(request, env, origin);
  if (response) {
    return response;
  }

  const payload = await request.json();
  const action = normalizeText(payload.action).toLowerCase();

  if (!["approve", "reject"].includes(action)) {
    return json({ error: "Invalid moderation action" }, { status: 400, origin });
  }

  const existing = await env.UNIMARKET_DB.prepare(
    `SELECT id, listing_id
    FROM promotion_requests
    WHERE id = ?
    LIMIT 1`
  ).bind(requestId).first();

  if (!existing) {
    return json({ error: "Promotion request not found" }, { status: 404, origin });
  }

  const nextStatus = action === "approve" ? "approved" : "rejected";

  await env.UNIMARKET_DB.prepare(
    `UPDATE promotion_requests
    SET
      status = ?,
      reviewed_at = CURRENT_TIMESTAMP,
      reviewed_by = ?
    WHERE id = ?`
  ).bind(nextStatus, context.userId || "admin-panel", requestId).run();

  if (action === "approve") {
    await env.UNIMARKET_DB.prepare(
      `UPDATE listings
      SET
        is_promoted = 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`
    ).bind(existing.listing_id).run();
  }

  return json(
    {
      ok: true,
      id: requestId,
      status: nextStatus
    },
    { origin }
  );
}

async function handleSaveListing(request, env, origin, listingId) {
  const payload = request.method === "POST" ? await request.json().catch(() => ({})) : null;
  const { context, response } = await requireAuthenticatedUser(request, env, origin, payload);

  if (response) {
    return response;
  }

  const existingListing = await env.UNIMARKET_DB.prepare(
    `SELECT id FROM listings WHERE id = ? LIMIT 1`
  ).bind(listingId).first();

  if (!existingListing) {
    return json({ error: "Listing not found" }, { status: 404, origin });
  }

  if (request.method === "POST") {
    await env.UNIMARKET_DB.prepare(
      `INSERT INTO saved_listings (user_id, listing_id, created_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, listing_id) DO NOTHING`
    ).bind(context.userId, listingId).run();
  } else {
    await env.UNIMARKET_DB.prepare(
      `DELETE FROM saved_listings
      WHERE user_id = ? AND listing_id = ?`
    ).bind(context.userId, listingId).run();
  }

  return handleGetSavedListings(
    request,
    env,
    origin
  );
}

async function handleCreateListing(request, env, origin) {
  const rawPayload = await request.json();
  const { context, response } = await requireAuthenticatedUser(request, env, origin, rawPayload);
  if (response) {
    return response;
  }

  const payload = normalizeListingPayload({
    ...rawPayload,
    userId: context.userId,
    seller: {
      ...(rawPayload && rawPayload.seller ? rawPayload.seller : {}),
      id: context.userId
    }
  });
  const validationError = validateListingPayload(payload);

  if (validationError) {
    return json(
      {
        error: validationError
      },
      { status: 400, origin }
    );
  }

  const listingId = crypto.randomUUID();
  await upsertProfile(env, payload);

  await env.UNIMARKET_DB.prepare(
    `INSERT INTO listings (
      id,
      user_id,
      title,
      price_value,
      price_label,
      location,
      address,
      university,
      category_id,
      subcategory,
      listing_condition,
      description,
      status,
      is_sold,
      sold_on_unimarket,
      is_promoted,
      expires_at,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 0, 1, 0, DATETIME(CURRENT_TIMESTAMP, '+30 days'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
  ).bind(
    listingId,
    payload.userId,
    payload.title,
    payload.priceValue,
    payload.priceLabel,
    payload.location,
    payload.address,
    payload.university,
    payload.categoryId,
    payload.subcategory,
    payload.condition,
    payload.description
  ).run();

  await replaceListingImages(env, listingId, payload.imageUrls);

  return loadListingWithImages(request, env, listingId, origin);
}

async function handleUpdateListing(request, env, origin, id) {
  const rawPayload = await request.json();
  const { listing, response } = await requireListingOwner(request, env, origin, id, rawPayload);
  if (response) {
    return response;
  }

  const payload = normalizeListingPayload({
    ...rawPayload,
    userId: listing.user_id,
    seller: {
      ...(rawPayload && rawPayload.seller ? rawPayload.seller : {}),
      id: listing.user_id
    }
  });
  const validationError = validateListingPayload(payload);

  if (validationError) {
    return json({ error: validationError }, { status: 400, origin });
  }

  await upsertProfile(env, payload);

  await env.UNIMARKET_DB.prepare(
    `UPDATE listings
    SET
      user_id = ?,
      title = ?,
      price_value = ?,
      price_label = ?,
      location = ?,
      address = ?,
      university = ?,
      category_id = ?,
      subcategory = ?,
      listing_condition = ?,
      description = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`
  ).bind(
    payload.userId,
    payload.title,
    payload.priceValue,
    payload.priceLabel,
    payload.location,
    payload.address,
    payload.university,
    payload.categoryId,
    payload.subcategory,
    payload.condition,
    payload.description,
    id
  ).run();

  await replaceListingImages(env, id, payload.imageUrls);

  return loadListingWithImages(request, env, id, origin);
}

async function handleDeleteListing(request, env, origin, id) {
  const { response } = await requireListingOwner(request, env, origin, id);
  if (response) {
    return response;
  }

  await env.UNIMARKET_DB.prepare(
    `DELETE FROM listing_images WHERE listing_id = ?`
  ).bind(id).run();

  await env.UNIMARKET_DB.prepare(
    `DELETE FROM saved_listings WHERE listing_id = ?`
  ).bind(id).run();

  await env.UNIMARKET_DB.prepare(
    `DELETE FROM promotion_requests WHERE listing_id = ?`
  ).bind(id).run();

  await env.UNIMARKET_DB.prepare(
    `DELETE FROM reviews WHERE listing_id = ?`
  ).bind(id).run();

  await env.UNIMARKET_DB.prepare(
    `DELETE FROM reports WHERE listing_id = ?`
  ).bind(id).run();

  await env.UNIMARKET_DB.prepare(
    `DELETE FROM listings WHERE id = ?`
  ).bind(id).run();

  return json({ ok: true, id }, { origin });
}

async function handleMarkSold(request, env, origin, id) {
  const payload = await request.json();
  const { response } = await requireListingOwner(request, env, origin, id, payload);
  if (response) {
    return response;
  }
  const isSold = Boolean(payload && payload.isSold);
  const soldOnUniMarket = payload && Object.prototype.hasOwnProperty.call(payload, "soldOnUniMarket")
    ? Boolean(payload.soldOnUniMarket)
    : true;

  await env.UNIMARKET_DB.prepare(
    `UPDATE listings
    SET
      is_sold = ?,
      sold_on_unimarket = ?,
      expires_at = CASE
        WHEN ? = 1 THEN expires_at
        ELSE DATETIME(CURRENT_TIMESTAMP, '+30 days')
      END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`
  ).bind(isSold ? 1 : 0, soldOnUniMarket ? 1 : 0, isSold ? 1 : 0, id).run();

  return loadListingWithImages(request, env, id, origin);
}

async function handleRestoreListing(request, env, origin, id) {
  const { listing, response } = await requireListingOwner(request, env, origin, id);
  if (response) {
    return response;
  }

  if (Boolean(listing && listing.is_sold)) {
    return json({ error: "Use list again for sold listings" }, { status: 400, origin });
  }

  await env.UNIMARKET_DB.prepare(
    `UPDATE listings
    SET
      status = 'active',
      expires_at = DATETIME(CURRENT_TIMESTAMP, '+30 days'),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`
  ).bind(id).run();

  return loadListingWithImages(request, env, id, origin);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = env.CORS_ORIGIN || "*";

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin)
      });
    }

    if (url.pathname === "/" || url.pathname === "/health") {
      if (request.method !== "GET") {
        return methodNotAllowed(origin);
      }

      return handleHealth(env, origin);
    }

    if (url.pathname === "/auth/wechat/login") {
      if (request.method !== "POST") {
        return methodNotAllowed(origin);
      }

      return handleLogin(request, env, origin);
    }

    if (url.pathname === "/me") {
      if (request.method === "GET") {
        return handleGetMeProfile(request, env, origin);
      }

      if (request.method === "PUT") {
        return handleUpdateMyProfile(request, env, origin);
      }

      return methodNotAllowed(origin);
    }

    if (url.pathname === "/me/profile") {
      if (request.method !== "PUT") {
        return methodNotAllowed(origin);
      }

      return handleUpdateMyProfile(request, env, origin);
    }

    if (url.pathname === "/me/saved") {
      if (request.method !== "GET") {
        return methodNotAllowed(origin);
      }

      return handleGetSavedListings(request, env, origin);
    }

    if (url.pathname === "/me/visibility") {
      if (request.method !== "GET") {
        return methodNotAllowed(origin);
      }

      return handleGetVisibilityPreferences(request, env, origin);
    }

    if (url.pathname === "/me/visibility/hide-listing") {
      if (request.method !== "POST") {
        return methodNotAllowed(origin);
      }

      return handleHideListingPreference(request, env, origin);
    }

    if (url.pathname === "/me/visibility/block-seller") {
      if (request.method !== "POST") {
        return methodNotAllowed(origin);
      }

      return handleBlockSellerPreference(request, env, origin);
    }

    if (url.pathname === "/admin/access") {
      if (request.method === "POST") {
        return handleEnableAdminAccess(request, env, origin);
      }

      if (request.method === "DELETE") {
        return handleDisableAdminAccess(request, env, origin);
      }

      return methodNotAllowed(origin);
    }

    if (url.pathname === "/me/listings") {
      if (request.method !== "GET") {
        return methodNotAllowed(origin);
      }

      return handleGetMyListings(request, env, origin);
    }

    if (url.pathname === "/media/uploads/sign") {
      if (request.method !== "POST") {
        return methodNotAllowed(origin);
      }

      return handleCreateMediaUploadSignature(request, env, origin);
    }

    if (url.pathname === "/promotions/plans") {
      if (request.method !== "GET") {
        return methodNotAllowed(origin);
      }

      return handleGetPromotionPlans(origin);
    }

    if (url.pathname === "/promotions/requests") {
      if (request.method !== "POST") {
        return methodNotAllowed(origin);
      }

      return handleCreatePromotionRequest(request, env, origin);
    }

    if (url.pathname === "/seller-pro/requests") {
      if (request.method !== "POST") {
        return methodNotAllowed(origin);
      }

      return handleCreateSellerProRequest(request, env, origin);
    }

    if (url.pathname === "/moderation/promotion-requests") {
      if (request.method !== "GET") {
        return methodNotAllowed(origin);
      }

      return handleGetModerationPromotionRequests(request, env, origin);
    }

    if (url.pathname.startsWith("/moderation/promotion-requests/")) {
      if (request.method !== "PATCH") {
        return methodNotAllowed(origin);
      }

      const requestId = decodeURIComponent(url.pathname.replace("/moderation/promotion-requests/", "").trim());
      if (!requestId) {
        return notFound(origin);
      }

      return handleReviewModerationPromotionRequest(request, env, origin, requestId);
    }

    if (url.pathname === "/moderation/seller-pro-subscriptions") {
      if (request.method === "GET") {
        return handleGetModerationSellerProSubscriptions(request, env, origin);
      }

      if (request.method === "POST") {
        return handleGrantSellerProByNickname(request, env, origin);
      }

      return methodNotAllowed(origin);
    }

    if (url.pathname.startsWith("/moderation/seller-pro-subscriptions/")) {
      const subscriptionId = decodeURIComponent(url.pathname.replace("/moderation/seller-pro-subscriptions/", "").trim());
      if (!subscriptionId) {
        return notFound(origin);
      }

      if (request.method === "PATCH") {
        return handleReviewModerationSellerProSubscription(request, env, origin, subscriptionId);
      }

      if (request.method === "DELETE") {
        return handleRevokeSellerProSubscription(request, env, origin, subscriptionId);
      }

      return methodNotAllowed(origin);
    }

    if (url.pathname === "/reports") {
      if (request.method !== "POST") {
        return methodNotAllowed(origin);
      }

      return handleCreateReport(request, env, origin);
    }

    if (url.pathname === "/reviews") {
      if (request.method === "GET") {
        return handleGetReviewSummary(request, env, origin);
      }

      if (request.method === "POST") {
        return handleCreateReview(request, env, origin);
      }

      return methodNotAllowed(origin);
    }

    if (url.pathname === "/moderation/reports") {
      if (request.method !== "GET") {
        return methodNotAllowed(origin);
      }

      return handleGetModerationReports(request, env, origin);
    }

    if (url.pathname.startsWith("/moderation/reports/")) {
      if (request.method !== "PATCH") {
        return methodNotAllowed(origin);
      }

      const reportId = decodeURIComponent(url.pathname.replace("/moderation/reports/", "").trim());
      if (!reportId) {
        return notFound(origin);
      }

      return handleReviewModerationReport(request, env, origin, reportId);
    }

    if (url.pathname.startsWith("/profiles/by-listing/")) {
      if (request.method !== "GET") {
        return methodNotAllowed(origin);
      }

      const listingId = decodeURIComponent(url.pathname.replace("/profiles/by-listing/", "").trim());
      if (!listingId) {
        return notFound(origin);
      }

      return handleGetProfileByListingId(listingId, env, origin);
    }

    if (url.pathname.startsWith("/profiles/") && url.pathname.endsWith("/view")) {
      if (request.method !== "POST") {
        return methodNotAllowed(origin);
      }

      const sellerKey = decodeURIComponent(url.pathname.replace(/^\/profiles\//, "").replace(/\/view$/, "").trim());
      if (!sellerKey) {
        return notFound(origin);
      }

      return handleRecordProfileView(request, env, origin, sellerKey);
    }

    if (url.pathname === "/listings") {
      if (request.method === "GET") {
        return handleListListings(request, env, origin);
      }

      if (request.method === "POST") {
        return handleCreateListing(request, env, origin);
      }

      if (request.method !== "GET" && request.method !== "POST") {
        return methodNotAllowed(origin);
      }
    }

    if (url.pathname.startsWith("/listings/")) {
      const listingPath = decodeURIComponent(url.pathname.replace("/listings/", "").trim());
      const isMarkSoldPath = listingPath.endsWith("/mark-sold");
      const isRestorePath = listingPath.endsWith("/restore");
      const isAnalyticsPath = listingPath.endsWith("/analytics");
      const isViewPath = listingPath.endsWith("/view");
      const listingId = isMarkSoldPath
        ? listingPath.replace(/\/mark-sold$/, "").trim()
        : isRestorePath
          ? listingPath.replace(/\/restore$/, "").trim()
        : isAnalyticsPath
          ? listingPath.replace(/\/analytics$/, "").trim()
          : isViewPath
            ? listingPath.replace(/\/view$/, "").trim()
            : listingPath;

      if (!listingId) {
        return notFound(origin);
      }

      if (isMarkSoldPath) {
        if (request.method !== "POST") {
          return methodNotAllowed(origin);
        }

        return handleMarkSold(request, env, origin, listingId);
      }

      if (isRestorePath) {
        if (request.method !== "POST") {
          return methodNotAllowed(origin);
        }

        return handleRestoreListing(request, env, origin, listingId);
      }

      if (isAnalyticsPath) {
        if (request.method !== "GET") {
          return methodNotAllowed(origin);
        }

        return handleGetListingAnalytics(request, env, origin, listingId);
      }

      if (isViewPath) {
        if (request.method !== "POST") {
          return methodNotAllowed(origin);
        }

        return handleRecordListingView(request, env, origin, listingId);
      }

      const isSavePath = listingPath.endsWith("/save");
      if (isSavePath) {
        const saveListingId = listingPath.replace(/\/save$/, "").trim();
        if (!saveListingId) {
          return notFound(origin);
        }

        if (request.method !== "POST" && request.method !== "DELETE") {
          return methodNotAllowed(origin);
        }

        return handleSaveListing(request, env, origin, saveListingId);
      }

      if (request.method === "GET") {
        return handleGetListing(request, listingId, env, origin);
      }

      if (request.method === "PATCH") {
        return handleUpdateListing(request, env, origin, listingId);
      }

      if (request.method === "DELETE") {
        return handleDeleteListing(request, env, origin, listingId);
      }

      return methodNotAllowed(origin);
    }

    return notFound(origin);
  }
};
