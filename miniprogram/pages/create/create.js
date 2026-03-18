const market = require('../../data/market')
const profileStore = require('../../utils/profile')
const universitiesStore = require('../../utils/universities')
const tabbarStore = require('../../utils/tabbar')
const storage = require('../../utils/storage')
const validation = require('../../utils/validation')
const feedback = require('../../utils/ui-feedback')
const uiText = require('../../constants/messages')
const OTHER_SUBCATEGORY_OPTION = 'Other (type your own)'
const MAX_CUSTOM_SUBCATEGORY_LENGTH = 40
const FIXED_CITY = 'Hangzhou'
const UNIVERSITY_OPTIONS = universitiesStore.HANGZHOU_UNIVERSITIES
const CONDITION_OPTIONS = ['Used', 'Like new', 'New', 'Refurbished', 'For parts']
const DEFAULT_CONDITION = CONDITION_OPTIONS[0]
const CONDITION_CATEGORY_IDS = ['items', 'electronics', 'transport', 'study', 'other']
const DRAFT_STORAGE_KEY = 'marketCreateDraftV1'
const DRAFT_SAVE_DELAY_MS = 320
const TITLE_MIN_LENGTH = 4
const TITLE_MAX_LENGTH = 70
const ADDRESS_MIN_LENGTH = 6
const ADDRESS_MAX_LENGTH = 120
const DESCRIPTION_MIN_LENGTH = 12
const DESCRIPTION_MAX_LENGTH = 600
const PUBLISH_RATE_LIMIT_MS = 15000
const LAST_PUBLISH_AT_STORAGE_KEY = 'marketCreateLastPublishAtMs'

function normalizeSubcategory(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function normalizeCondition(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function normalizeTitleForDuplicate(value) {
  return validation.sanitizeSingleLine(value, TITLE_MAX_LENGTH).toLowerCase()
}

function normalizeImageForDuplicate(value) {
  return String(value || '').trim()
}

function getDuplicateSignature({ title = '', price = '', image = '' } = {}) {
  return [
    normalizeTitleForDuplicate(title),
    validation.extractPriceDigits(price),
    normalizeImageForDuplicate(image)
  ].join('::')
}

Page({
  data: {
    navTitle: 'New Listing',
    categories: [],
    universityOptions: UNIVERSITY_OPTIONS,
    universityIndex: 0,
    categoryIndex: 0,
    subcategoryOptions: [],
    subcategoryIndex: 0,
    conditionOptions: CONDITION_OPTIONS,
    conditionIndex: 0,
    requiresCondition: false,
    isCustomSubcategory: false,
    customSubcategory: '',
    mode: 'create',
    editingId: '',
    heroTitle: 'Post a new listing',
    heroCopy: 'Share something useful with students around Hangzhou and publish it straight into the MVP.',
    heroChip: 'Live preview flow',
    submitLabel: 'Publish listing',
    submitting: false,
    draftChecked: false,
    form: {
      title: '',
      price: '',
      location: FIXED_CITY,
      address: '',
      university: '',
      wechat: '',
      description: '',
      categoryId: '',
      subcategory: '',
      condition: '',
      images: []
    }
  },

  onLoad() {
    const categories = market.getPublishCategories()
    const initialCategory = categories[0] || { id: 'housing' }
    const subcategoryOptions = this.getSubcategoryOptions(initialCategory.id)
    const defaultSubcategory = subcategoryOptions[0] || ''
    const isCustomSubcategory = defaultSubcategory === OTHER_SUBCATEGORY_OPTION
    const requiresCondition = this.requiresCondition(initialCategory.id)
    const profileDefaults = this.getProfileDefaults()
    const universityIndex = universitiesStore.getUniversityIndex(profileDefaults.university, UNIVERSITY_OPTIONS)

    this.setData({
      categories,
      subcategoryOptions,
      categoryIndex: 0,
      universityIndex,
      subcategoryIndex: 0,
      conditionIndex: 0,
      requiresCondition,
      isCustomSubcategory,
      customSubcategory: '',
      'form.categoryId': initialCategory.id,
      'form.university': profileDefaults.university,
      'form.wechat': profileDefaults.wechat,
      'form.subcategory': isCustomSubcategory ? '' : defaultSubcategory,
      'form.condition': requiresCondition ? DEFAULT_CONDITION : ''
    })

    this.applyPageMode('create')
  },

  onShow() {
    tabbarStore.syncTabBar(this, 2)
    const queuedMode = market.consumeCreateMode()

    if (!queuedMode) {
      if (this.data.mode === 'create' && !this.data.draftChecked) {
        this.tryRestoreDraft()
      }
      return
    }

    if (queuedMode.type === 'edit' && queuedMode.id) {
      this.loadListingForEdit(queuedMode.id)
      return
    }

    this.resetForm()
    this.tryRestoreDraft()
  },

  onHide() {
    this.flushDraftSave()
  },

  onUnload() {
    this.flushDraftSave()
  },

  onTabItemTap() {
    if (this.data.mode === 'edit') {
      this.resetForm()
      this.tryRestoreDraft()
    }
  },

  getSubcategoryOptions(categoryId) {
    const category = market.categoryConfigs[categoryId]
    const baseOptions = category && category.subcategories && category.subcategories.length
      ? category.subcategories
      : ['General']

    return baseOptions.includes(OTHER_SUBCATEGORY_OPTION)
      ? baseOptions
      : baseOptions.concat(OTHER_SUBCATEGORY_OPTION)
  },

  getOtherSubcategoryIndex(options) {
    const index = options.indexOf(OTHER_SUBCATEGORY_OPTION)
    return index >= 0 ? index : Math.max(options.length - 1, 0)
  },

  requiresCondition(categoryId) {
    return CONDITION_CATEGORY_IDS.includes(String(categoryId || ''))
  },

  getConditionIndex(condition) {
    const normalized = normalizeCondition(condition)
    const index = CONDITION_OPTIONS.indexOf(normalized)
    return index >= 0 ? index : 0
  },

  getProfileDefaults() {
    const profile = profileStore.getProfile()
    const universityIndex = universitiesStore.getUniversityIndex(profile.campus, UNIVERSITY_OPTIONS)
    return {
      profile,
      sellerName: profile.name || 'You',
      university: UNIVERSITY_OPTIONS[universityIndex] || UNIVERSITY_OPTIONS[0] || '',
      wechat: profile.wechat || ''
    }
  },

  getCreateDraft() {
    const draft = storage.safeGetStorage(DRAFT_STORAGE_KEY, null)
    if (!draft || typeof draft !== 'object' || !draft.form || typeof draft.form !== 'object') {
      return null
    }

    if (!this.hasDraftContent(draft.form)) {
      storage.safeRemoveStorage(DRAFT_STORAGE_KEY)
      return null
    }

    return draft
  },

  hasDraftContent(form = {}) {
    const images = Array.isArray(form.images) ? form.images.filter(Boolean) : []

    return Boolean(
      String(form.title || '').trim() ||
      String(form.price || '').trim() ||
      String(form.address || '').trim() ||
      String(form.description || '').trim() ||
      images.length
    )
  },

  saveCreateDraftNow() {
    if (this.data.mode !== 'create') {
      return
    }

    const currentForm = this.data.form || {}
    const draftForm = {
      title: String(currentForm.title || ''),
      price: validation.extractPriceDigits(currentForm.price || ''),
      location: FIXED_CITY,
      address: String(currentForm.address || ''),
      university: String(currentForm.university || ''),
      wechat: String(currentForm.wechat || ''),
      description: String(currentForm.description || ''),
      categoryId: String(currentForm.categoryId || ''),
      subcategory: String(currentForm.subcategory || ''),
      condition: String(currentForm.condition || ''),
      images: Array.isArray(currentForm.images) ? currentForm.images.filter(Boolean).slice(0, 5) : []
    }

    if (!this.hasDraftContent(draftForm)) {
      storage.safeRemoveStorage(DRAFT_STORAGE_KEY)
      return
    }

    storage.safeSetStorage(DRAFT_STORAGE_KEY, {
      savedAt: new Date().toISOString(),
      form: draftForm
    })
  },

  scheduleDraftSave() {
    if (this.data.mode !== 'create') {
      return
    }

    if (this.draftSaveTimer) {
      clearTimeout(this.draftSaveTimer)
    }

    this.draftSaveTimer = setTimeout(() => {
      this.draftSaveTimer = null
      this.saveCreateDraftNow()
    }, DRAFT_SAVE_DELAY_MS)
  },

  flushDraftSave() {
    if (this.draftSaveTimer) {
      clearTimeout(this.draftSaveTimer)
      this.draftSaveTimer = null
    }

    this.saveCreateDraftNow()
  },

  clearCreateDraft() {
    if (this.draftSaveTimer) {
      clearTimeout(this.draftSaveTimer)
      this.draftSaveTimer = null
    }

    storage.safeRemoveStorage(DRAFT_STORAGE_KEY)
  },

  restoreDraftForm(draft) {
    if (!draft || !draft.form) {
      return
    }

    const categories = this.data.categories || []
    const profileDefaults = this.getProfileDefaults()
    const draftForm = draft.form || {}
    const categoryId = categories.some((category) => category.id === draftForm.categoryId)
      ? draftForm.categoryId
      : (categories[0] && categories[0].id ? categories[0].id : 'housing')
    const categoryIndex = Math.max(categories.findIndex((category) => category.id === categoryId), 0)
    const subcategoryOptions = this.getSubcategoryOptions(categoryId)
    const normalizedSubcategory = normalizeSubcategory(draftForm.subcategory)
    const listedSubcategoryIndex = subcategoryOptions.indexOf(normalizedSubcategory)
    const isCustomSubcategory = Boolean(normalizedSubcategory) && listedSubcategoryIndex === -1
    const subcategoryIndex = isCustomSubcategory
      ? this.getOtherSubcategoryIndex(subcategoryOptions)
      : Math.max(listedSubcategoryIndex, 0)
    const requiresCondition = this.requiresCondition(categoryId)
    const conditionIndex = this.getConditionIndex(draftForm.condition)
    const universityValue = String(draftForm.university || profileDefaults.university || '')
    const universityIndex = universitiesStore.getUniversityIndex(universityValue, UNIVERSITY_OPTIONS)
    const images = Array.isArray(draftForm.images) ? draftForm.images.filter(Boolean).slice(0, 5) : []

    this.setData({
      draftChecked: true,
      categoryIndex,
      universityIndex,
      subcategoryOptions,
      subcategoryIndex,
      conditionIndex,
      requiresCondition,
      isCustomSubcategory,
      customSubcategory: isCustomSubcategory ? normalizedSubcategory.slice(0, MAX_CUSTOM_SUBCATEGORY_LENGTH) : '',
      form: {
        title: String(draftForm.title || ''),
        price: validation.extractPriceDigits(draftForm.price || ''),
        location: FIXED_CITY,
        address: String(draftForm.address || ''),
        university: UNIVERSITY_OPTIONS[universityIndex] || UNIVERSITY_OPTIONS[0] || '',
        wechat: String(draftForm.wechat || profileDefaults.wechat || ''),
        description: String(draftForm.description || ''),
        categoryId,
        subcategory: isCustomSubcategory
          ? normalizedSubcategory.slice(0, MAX_CUSTOM_SUBCATEGORY_LENGTH)
          : (subcategoryOptions[subcategoryIndex] || ''),
        condition: requiresCondition ? (CONDITION_OPTIONS[conditionIndex] || DEFAULT_CONDITION) : '',
        images
      }
    })
  },

  tryRestoreDraft() {
    if (this.data.mode !== 'create') {
      return
    }

    const draft = this.getCreateDraft()
    if (!draft) {
      this.setData({
        draftChecked: true
      })
      return
    }

    const draftSavedAt = draft.savedAt ? String(draft.savedAt).replace('T', ' ').slice(0, 16) : 'recently'

    feedback.showModal({
      title: uiText.CREATE.RESTORE_DRAFT_TITLE,
      content: uiText.CREATE.restoreDraftContent(draftSavedAt),
      confirmText: 'Restore',
      cancelText: 'Discard',
      success: (res) => {
        if (res.confirm) {
          this.restoreDraftForm(draft)
          feedback.showSuccessToast(uiText.CREATE.DRAFT_RESTORED)
          return
        }

        this.clearCreateDraft()
        this.setData({
          draftChecked: true
        })
      }
    })
  },

  onUniversityChange(e) {
    const universityIndex = Number(e.detail.value)
    const university = UNIVERSITY_OPTIONS[universityIndex] || UNIVERSITY_OPTIONS[0] || ''

    this.setData({
      universityIndex,
      'form.university': university
    }, () => {
      this.scheduleDraftSave()
    })
  },

  onCategoryChange(e) {
    const categoryIndex = Number(e.detail.value)
    const category = this.data.categories[categoryIndex]
    if (!category) {
      return
    }

    const subcategoryOptions = this.getSubcategoryOptions(category.id)
    const defaultSubcategory = subcategoryOptions[0] || ''
    const requiresCondition = this.requiresCondition(category.id)
    const currentCondition = normalizeCondition(this.data.form.condition)
    const conditionIndex = this.getConditionIndex(currentCondition)
    const nextCondition = requiresCondition
      ? (CONDITION_OPTIONS[conditionIndex] || DEFAULT_CONDITION)
      : ''

    this.setData({
      categoryIndex,
      subcategoryOptions,
      subcategoryIndex: 0,
      conditionIndex,
      requiresCondition,
      isCustomSubcategory: defaultSubcategory === OTHER_SUBCATEGORY_OPTION,
      customSubcategory: '',
      'form.categoryId': category.id,
      'form.subcategory': defaultSubcategory === OTHER_SUBCATEGORY_OPTION ? '' : defaultSubcategory,
      'form.condition': nextCondition
    }, () => {
      this.scheduleDraftSave()
    })
  },

  onConditionChange(e) {
    const conditionIndex = Number(e.detail.value)
    const condition = CONDITION_OPTIONS[conditionIndex] || DEFAULT_CONDITION

    this.setData({
      conditionIndex,
      'form.condition': condition
    }, () => {
      this.scheduleDraftSave()
    })
  },

  onSubcategoryChange(e) {
    const subcategoryIndex = Number(e.detail.value)
    const pickedSubcategory = this.data.subcategoryOptions[subcategoryIndex] || ''
    const isCustomSubcategory = pickedSubcategory === OTHER_SUBCATEGORY_OPTION
    const normalizedCustomSubcategory = normalizeSubcategory(this.data.customSubcategory).slice(0, MAX_CUSTOM_SUBCATEGORY_LENGTH)

    this.setData({
      subcategoryIndex,
      isCustomSubcategory,
      customSubcategory: isCustomSubcategory ? normalizedCustomSubcategory : '',
      'form.subcategory': isCustomSubcategory ? normalizedCustomSubcategory : pickedSubcategory
    }, () => {
      this.scheduleDraftSave()
    })
  },

  onCustomSubcategoryInput(e) {
    const customSubcategory = normalizeSubcategory(e.detail.value).slice(0, MAX_CUSTOM_SUBCATEGORY_LENGTH)

    this.setData({
      customSubcategory,
      'form.subcategory': customSubcategory
    }, () => {
      this.scheduleDraftSave()
    })
  },

  onFieldInput(e) {
    const { field } = e.currentTarget.dataset
    const rawValue = e.detail.value
    let value = rawValue

    if (field === 'price') {
      value = validation.extractPriceDigits(rawValue)
    } else if (field === 'title') {
      value = validation.sanitizeSingleLine(rawValue, TITLE_MAX_LENGTH)
    } else if (field === 'address') {
      value = validation.sanitizeSingleLine(rawValue, ADDRESS_MAX_LENGTH)
    } else if (field === 'wechat') {
      value = validation.sanitizeWeChatId(rawValue)
    } else if (field === 'description') {
      value = validation.sanitizeMultiline(rawValue, DESCRIPTION_MAX_LENGTH)
    }

    this.setData({
      [`form.${field}`]: value
    }, () => {
      this.scheduleDraftSave()
    })
  },

  applyPageMode(mode, editingId = '') {
    const isEdit = mode === 'edit'
    const title = isEdit ? 'Edit Listing' : 'New Listing'

    wx.setNavigationBarTitle({
      title
    })

    this.setData({
      navTitle: title,
      mode,
      editingId: String(editingId || ''),
      heroTitle: isEdit ? 'Edit your listing' : 'Post a new listing',
      heroCopy: isEdit
        ? 'Update the title, price, category, and details so your listing stays clear and current in the marketplace.'
        : 'Share something useful with students around Hangzhou and publish it straight into the MVP.',
      heroChip: isEdit ? 'Edit mode' : 'Live preview flow',
      submitLabel: isEdit ? 'Save changes' : 'Publish listing'
    })
  },

  loadListingForEdit(id) {
    const listing = market.getListingById(id)
    const categories = this.data.categories || []

    if (!listing || !listing.isCustom) {
      feedback.showNeutralToast(uiText.CREATE.LISTING_NOT_FOUND)
      this.resetForm()
      return
    }

    const categoryIndex = Math.max(
      categories.findIndex((category) => category.id === listing.categoryId),
      0
    )
    const universityIndex = universitiesStore.getUniversityIndex(listing.university, UNIVERSITY_OPTIONS)
    const subcategoryOptions = this.getSubcategoryOptions(listing.categoryId)
    const listingSubcategory = listing.subcategory || ''
    const listedSubcategoryIndex = subcategoryOptions.indexOf(listingSubcategory)
    const isCustomSubcategory = listedSubcategoryIndex === -1
    const subcategoryIndex = isCustomSubcategory
      ? this.getOtherSubcategoryIndex(subcategoryOptions)
      : Math.max(listedSubcategoryIndex, 0)
    const customSubcategory = isCustomSubcategory
      ? normalizeSubcategory(listingSubcategory).slice(0, MAX_CUSTOM_SUBCATEGORY_LENGTH)
      : ''
    const requiresCondition = this.requiresCondition(listing.categoryId)
    const conditionIndex = this.getConditionIndex(listing.condition)

    this.setData({
      categoryIndex,
      universityIndex,
      subcategoryOptions,
      subcategoryIndex,
      conditionIndex,
      requiresCondition,
      isCustomSubcategory,
      customSubcategory,
      form: {
        title: listing.title || '',
        price: validation.extractPriceDigits(listing.price || ''),
        location: FIXED_CITY,
        address: listing.address || '',
        university: UNIVERSITY_OPTIONS[universityIndex] || UNIVERSITY_OPTIONS[0] || '',
        wechat: listing.seller && listing.seller.wechat ? listing.seller.wechat : '',
        description: listing.description || '',
        categoryId: listing.categoryId,
        subcategory: isCustomSubcategory
          ? customSubcategory
          : listing.subcategory || subcategoryOptions[0] || '',
        condition: requiresCondition ? (CONDITION_OPTIONS[conditionIndex] || DEFAULT_CONDITION) : '',
        images: listing.images || []
      }
    })

    this.applyPageMode('edit', id)
  },

  choosePhotos() {
    const currentImages = this.data.form.images || []
    const remainingCount = 5 - currentImages.length

    if (remainingCount <= 0) {
      feedback.showNeutralToast(uiText.CREATE.UP_TO_5_PHOTOS)
      return
    }

    const onSuccess = (res) => {
      const files = res.tempFiles || []
      const nextImages = currentImages.concat(files.map((file) => file.tempFilePath)).slice(0, 5)
      this.setData({
        'form.images': nextImages
      }, () => {
        this.scheduleDraftSave()
      })
    }

    if (wx.chooseMedia) {
      wx.chooseMedia({
        count: remainingCount,
        mediaType: ['image'],
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: onSuccess
      })
      return
    }

    wx.chooseImage({
      count: remainingCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const files = (res.tempFilePaths || []).map((path) => ({ tempFilePath: path }))
        onSuccess({ tempFiles: files })
      }
    })
  },

  removePhoto(e) {
    const imageIndex = Number(e.currentTarget.dataset.index)
    const nextImages = (this.data.form.images || []).filter((_, index) => index !== imageIndex)

    this.setData({
      'form.images': nextImages
    }, () => {
      this.scheduleDraftSave()
    })
  },

  previewPhoto(e) {
    const imageIndex = Number(e.currentTarget.dataset.index)
    const images = this.data.form.images || []

    if (!images.length) {
      return
    }

    wx.previewImage({
      current: images[imageIndex],
      urls: images
    })
  },

  movePhoto(e) {
    const imageIndex = Number(e.currentTarget.dataset.index)
    const direction = e.currentTarget.dataset.direction
    const images = [...(this.data.form.images || [])]

    if (direction === 'left' && imageIndex > 0) {
      const swap = images[imageIndex - 1]
      images[imageIndex - 1] = images[imageIndex]
      images[imageIndex] = swap
    }

    if (direction === 'right' && imageIndex < images.length - 1) {
      const swap = images[imageIndex + 1]
      images[imageIndex + 1] = images[imageIndex]
      images[imageIndex] = swap
    }

    this.setData({
      'form.images': images
    }, () => {
      this.scheduleDraftSave()
    })
  },

  submitListing() {
    if (this.data.submitting) {
      return
    }

    const form = this.data.form
    const isEdit = this.data.mode === 'edit' && this.data.editingId
    const title = validation.sanitizeSingleLine(form.title, TITLE_MAX_LENGTH)
    const rawPrice = validation.extractPriceDigits(form.price)
    const price = validation.ensurePriceCurrency(rawPrice)
    const location = FIXED_CITY
    const address = validation.sanitizeSingleLine(form.address, ADDRESS_MAX_LENGTH)
    const selectedUniversity = UNIVERSITY_OPTIONS[this.data.universityIndex] || UNIVERSITY_OPTIONS[0] || ''
    const isUniversityPrivate = universitiesStore.isUniversityPrivateValue(selectedUniversity)
    const university = isUniversityPrivate ? '' : selectedUniversity
    const wechat = validation.sanitizeWeChatId(form.wechat)
    const description = validation.sanitizeMultiline(form.description, DESCRIPTION_MAX_LENGTH)
    const categoryId = String(form.categoryId || '').trim()
    let subcategory = normalizeSubcategory(form.subcategory)
    const condition = this.data.requiresCondition ? normalizeCondition(form.condition) : ''

    const hasValidCategory = this.data.categories.some((category) => category.id === categoryId)
    if (!hasValidCategory) {
      this.showValidation(uiText.CREATE.VALIDATION.CATEGORY)
      return
    }

    if (this.data.isCustomSubcategory) {
      const customSubcategory = normalizeSubcategory(this.data.customSubcategory).slice(0, MAX_CUSTOM_SUBCATEGORY_LENGTH)

      if (customSubcategory.length < 2) {
        this.showValidation(uiText.CREATE.VALIDATION.CUSTOM_SUBCATEGORY)
        return
      }

      subcategory = customSubcategory
      this.setData({
        customSubcategory,
        'form.subcategory': customSubcategory
      })
    }

    if (!subcategory) {
      this.showValidation(uiText.CREATE.VALIDATION.SUBCATEGORY)
      return
    }

    if (this.data.requiresCondition && !condition) {
      this.showValidation(uiText.CREATE.VALIDATION.CONDITION)
      return
    }

    if (title.length < TITLE_MIN_LENGTH) {
      this.showValidation(uiText.CREATE.VALIDATION.TITLE)
      return
    }

    if (!validation.hasMeaningfulText(title)) {
      this.showValidation(uiText.CREATE.VALIDATION.TITLE_MEANINGFUL)
      return
    }

    if (!rawPrice) {
      this.showValidation(uiText.CREATE.VALIDATION.PRICE_REQUIRED)
      return
    }

    if (!validation.isValidPriceDigits(rawPrice)) {
      this.showValidation(uiText.CREATE.VALIDATION.PRICE_LENGTH)
      return
    }

    if (!validation.isPriceInRange(rawPrice)) {
      this.showValidation(uiText.CREATE.VALIDATION.PRICE_RANGE)
      return
    }

    if (address.length < ADDRESS_MIN_LENGTH) {
      this.showValidation(uiText.CREATE.VALIDATION.ADDRESS)
      return
    }

    if (!university && !isUniversityPrivate) {
      this.showValidation(uiText.CREATE.VALIDATION.UNIVERSITY)
      return
    }

    if (!wechat) {
      this.showValidation(uiText.CREATE.VALIDATION.WECHAT_REQUIRED)
      return
    }

    if (!validation.isValidWeChatId(wechat)) {
      this.showValidation(uiText.CREATE.VALIDATION.wechatInvalid(validation.WECHAT_MIN_LENGTH, validation.WECHAT_MAX_LENGTH))
      return
    }

    if (description.length < DESCRIPTION_MIN_LENGTH) {
      this.showValidation(uiText.CREATE.VALIDATION.DESCRIPTION)
      return
    }

    if (!(form.images || []).length) {
      this.showValidation(uiText.CREATE.VALIDATION.PHOTOS_REQUIRED)
      return
    }

    if (!isEdit) {
      const lastPublishAt = Number(storage.safeGetStorage(LAST_PUBLISH_AT_STORAGE_KEY, 0)) || 0
      const now = Date.now()
      const elapsed = now - lastPublishAt

      if (elapsed < PUBLISH_RATE_LIMIT_MS) {
        const waitSeconds = Math.max(1, Math.ceil((PUBLISH_RATE_LIMIT_MS - elapsed) / 1000))
        this.showValidation(uiText.CREATE.VALIDATION.publishRateLimit(waitSeconds))
        return
      }

      const nextSignature = getDuplicateSignature({
        title,
        price: rawPrice,
        image: form.images[0] || ''
      })

      const hasDuplicateActiveListing = market.getMyListings().some((listing) => {
        if (!listing || listing.isSold) {
          return false
        }

        const existingSignature = getDuplicateSignature({
          title: listing.title || '',
          price: listing.price || '',
          image: (listing.images && listing.images[0]) || listing.image || ''
        })

        return existingSignature === nextSignature
      })

      if (hasDuplicateActiveListing) {
        this.showValidation(uiText.CREATE.VALIDATION.duplicateListing)
        return
      }
    }

    this.setData({ submitting: true })

    const profileDefaults = this.getProfileDefaults()
    const payload = {
      title,
      price,
      location,
      address,
      university,
      categoryId,
      subcategory,
      condition,
      description,
      images: form.images,
      image: form.images[0] || market.getFallbackImage(categoryId),
      seller: {
        name: profileDefaults.sellerName || 'You',
        badge: isEdit ? 'Updated listing' : 'New listing',
        wechat,
        note: isEdit ? 'Updated just now' : 'Published just now',
        avatarUrl: profileDefaults.profile && profileDefaults.profile.avatarUrl ? profileDefaults.profile.avatarUrl : '',
        bio: profileDefaults.profile && profileDefaults.profile.bio ? profileDefaults.profile.bio : '',
        campus: university,
        city: location,
        joinedAt: profileDefaults.profile && profileDefaults.profile.joinedAt ? profileDefaults.profile.joinedAt : ''
      }
    }

    const listing = isEdit
      ? market.updateListing(this.data.editingId, payload)
      : market.createListing(payload)

    if (!listing) {
      this.setData({ submitting: false })
      this.showValidation(uiText.CREATE.SAVE_FAILED)
      return
    }

    feedback.showSuccessToast(isEdit ? uiText.CREATE.UPDATED : uiText.CREATE.PUBLISHED)

    if (!isEdit) {
      this.clearCreateDraft()
      storage.safeSetStorage(LAST_PUBLISH_AT_STORAGE_KEY, Date.now())
    }

    this.resetForm()

    setTimeout(() => {
      this.setData({ submitting: false })
      wx.navigateTo({
        url: `/pages/listing/listing?id=${listing.id}`
      })
    }, 280)
  },

  showValidation(title) {
    feedback.showNeutralToast(title)
  },

  resetForm() {
    const categories = this.data.categories
    const initialCategory = categories[0] || { id: 'housing' }
    const subcategoryOptions = this.getSubcategoryOptions(initialCategory.id)
    const defaultSubcategory = subcategoryOptions[0] || ''
    const isCustomSubcategory = defaultSubcategory === OTHER_SUBCATEGORY_OPTION
    const requiresCondition = this.requiresCondition(initialCategory.id)
    const profileDefaults = this.getProfileDefaults()

    this.setData({
      draftChecked: false,
      categoryIndex: 0,
      subcategoryOptions,
      subcategoryIndex: 0,
      conditionIndex: 0,
      universityIndex: universitiesStore.getUniversityIndex(profileDefaults.university, UNIVERSITY_OPTIONS),
      requiresCondition,
      isCustomSubcategory,
      customSubcategory: '',
      form: {
        title: '',
        price: '',
        location: FIXED_CITY,
        address: '',
        university: profileDefaults.university,
        wechat: profileDefaults.wechat,
        description: '',
        categoryId: initialCategory.id,
        subcategory: isCustomSubcategory ? '' : defaultSubcategory,
        condition: requiresCondition ? DEFAULT_CONDITION : '',
        images: []
      }
    })

    this.applyPageMode('create')
  }
})
