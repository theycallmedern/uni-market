const mediaServices = require('../../services/media/index')
const api = require('../../services/api')
const listingsApi = require('../../services/api/runtime-listings')
const accountApi = require('../../services/api/runtime-account')
const profileStore = require('../../utils/profile')
const universitiesStore = require('../../utils/universities')
const tabbarStore = require('../../utils/tabbar')
const storage = require('../../utils/storage')
const localeStore = require('../../utils/locale')
const validation = require('../../utils/validation')
const feedback = require('../../utils/ui-feedback')
const uiText = require('../../constants/messages')
const copyStore = require('../../constants/copy')
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
const INITIAL_THEME = storage.getThemeData()
const INITIAL_LOCALE = localeStore.getLocale()
const catalogApi = api.catalog
const mediaUploader = mediaServices.uploader

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

function canPublishToBackend() {
  return Boolean(listingsApi.writesEnabled && mediaUploader.isReady())
}

function canUseBackendWrites() {
  return Boolean(listingsApi.writesEnabled)
}

function isBackendMediaReady() {
  return Boolean(mediaUploader.isReady())
}

Page({
  data: {
    locale: INITIAL_LOCALE,
    copy: copyStore.getPageCopy('create', INITIAL_LOCALE),
    themeMode: INITIAL_THEME.themeMode,
    themeClass: INITIAL_THEME.themeClass,
    isDarkTheme: INITIAL_THEME.isDarkTheme,
    navTitle: copyStore.getCreateModeState('create', INITIAL_LOCALE).navTitle,
    categories: [],
    universityOptions: copyStore.getUniversityOptionLabels(UNIVERSITY_OPTIONS, INITIAL_LOCALE),
    universityIndex: 0,
    categoryIndex: 0,
    subcategoryValues: [],
    subcategoryOptions: [],
    subcategoryIndex: 0,
    conditionValues: CONDITION_OPTIONS,
    conditionOptions: copyStore.getTranslatedConditionOptions(CONDITION_OPTIONS, INITIAL_LOCALE),
    conditionIndex: 0,
    createSheetOpen: false,
    createSheetField: '',
    createSheetTitle: '',
    createSheetOptions: [],
    createSheetValue: 0,
    requiresCondition: false,
    isCustomSubcategory: false,
    customSubcategory: '',
    mode: 'create',
    editingId: '',
    heroTitle: copyStore.getCreateModeState('create', INITIAL_LOCALE).heroTitle,
    heroCopy: copyStore.getCreateModeState('create', INITIAL_LOCALE).heroCopy,
    heroChip: copyStore.getCreateModeState('create', INITIAL_LOCALE).heroChip,
    submitLabel: copyStore.getCreateModeState('create', INITIAL_LOCALE).submitLabel,
    cityLabel: copyStore.translateCity(FIXED_CITY, INITIAL_LOCALE),
    createScrollTop: 0,
    photoLimit: listingsApi.getCurrentPhotoLimit(),
    photoHintText: copyStore.getCreatePhotoHint(listingsApi.getCurrentPhotoLimit(), INITIAL_LOCALE),
    submitting: false,
    draftChecked: false,
    titleHintVisible: false,
    titleHintText: '',
    descriptionHintVisible: false,
    descriptionHintText: '',
    addressHintVisible: false,
    addressHintText: uiText.CREATE.ADDRESS_HINT,
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
    const categories = copyStore.mapCategories(catalogApi.getPublishCategories(), this.data.locale)
    const initialCategory = categories[0] || { id: 'housing' }
    const subcategoryValues = this.getSubcategoryValues(initialCategory.id)
    const subcategoryOptions = copyStore.getTranslatedSubcategoryOptions(subcategoryValues, this.data.locale)
    const defaultSubcategory = subcategoryValues[0] || ''
    const isCustomSubcategory = defaultSubcategory === OTHER_SUBCATEGORY_OPTION
    const requiresCondition = this.requiresCondition(initialCategory.id)
    const profileDefaults = this.getProfileDefaults()
    const universityIndex = universitiesStore.getUniversityIndex(profileDefaults.university, UNIVERSITY_OPTIONS)
    const photoLimit = listingsApi.getCurrentPhotoLimit()

    this.setData({
      categories,
      photoLimit,
      photoHintText: copyStore.getCreatePhotoHint(photoLimit, this.data.locale),
      subcategoryValues,
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
    this.refreshPhotoLimit()
  },

  onShow() {
    this.refreshLocale(() => {
      this.refreshTheme(() => {
        tabbarStore.syncTabBar(this, 2, {
          themeMode: this.data.themeMode,
          locale: this.data.locale
        })
      })
      this.setData({
        photoHintText: copyStore.getCreatePhotoHint(this.data.photoLimit, this.data.locale)
      })
      this.refreshPhotoLimit()
      this.syncProfileWechat()
      const queuedMode = listingsApi.consumeCreateMode()

      if (!queuedMode) {
        if (this.data.mode === 'create' && !this.data.draftChecked) {
          this.queueDraftRestorePrompt()
        }
        return
      }

      if (queuedMode.type === 'edit' && queuedMode.id) {
        this.loadListingForEdit(queuedMode.id)
        return
      }

      this.resetForm()
      this.queueDraftRestorePrompt()
    })
  },

  onHide() {
    this.clearDraftPromptTimer()
    this.flushDraftSave()
  },

  onUnload() {
    this.clearDraftPromptTimer()
    this.flushDraftSave()
  },

  onTabItemTap() {
    if (this.data.mode === 'edit') {
      this.resetForm()
      this.queueDraftRestorePrompt()
    }
  },

  refreshTheme(callback) {
    this.setData(storage.getThemeData(), callback)
  },

  refreshLocale(callback) {
    const locale = localeStore.getLocale()
    const categories = copyStore.mapCategories(catalogApi.getPublishCategories(), locale)
    const activeCategoryId = this.data.form && this.data.form.categoryId
      ? this.data.form.categoryId
      : ((categories[0] && categories[0].id) || 'housing')
    const subcategoryValues = this.data.subcategoryValues && this.data.subcategoryValues.length
      ? this.data.subcategoryValues
      : this.getSubcategoryValues(activeCategoryId)
    const modeState = copyStore.getCreateModeState(this.data.mode, locale)

    this.setData({
      locale,
      copy: copyStore.getPageCopy('create', locale),
      categories,
      universityOptions: copyStore.getUniversityOptionLabels(UNIVERSITY_OPTIONS, locale),
      subcategoryValues,
      subcategoryOptions: copyStore.getTranslatedSubcategoryOptions(subcategoryValues, locale),
      conditionOptions: copyStore.getTranslatedConditionOptions(CONDITION_OPTIONS, locale),
      cityLabel: copyStore.translateCity(FIXED_CITY, locale),
      photoHintText: copyStore.getCreatePhotoHint(this.data.photoLimit, locale),
      navTitle: modeState.navTitle,
      heroTitle: modeState.heroTitle,
      heroCopy: modeState.heroCopy,
      heroChip: modeState.heroChip,
      submitLabel: modeState.submitLabel
    }, callback)
  },

  async refreshPhotoLimit() {
    let photoLimit = listingsApi.getCurrentPhotoLimit()

    try {
      const me = await accountApi.getMe()
      photoLimit = Number(me && me.photoLimit) || photoLimit
    } catch (error) {}

    this.setData({
      photoLimit,
      photoHintText: copyStore.getCreatePhotoHint(photoLimit, this.data.locale)
    })
  },

  getSubcategoryValues(categoryId) {
    const category = catalogApi.categoryConfigs[categoryId]
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

  syncProfileWechat(callback) {
    const profileDefaults = this.getProfileDefaults()
    const wechat = validation.sanitizeWeChatId(profileDefaults.wechat)

    if ((this.data.form && this.data.form.wechat) === wechat) {
      if (typeof callback === 'function') {
        callback()
      }
      return
    }

    this.setData({
      'form.wechat': wechat
    }, callback)
  },

  getFieldLanguageValidationMessage(field, value) {
    const normalized = String(value || '')

    if (!normalized.trim() || validation.isSupportedListingText(normalized)) {
      return ''
    }

    if (field === 'title') {
      return uiText.CREATE.VALIDATION.TITLE_LANGUAGE
    }

    if (field === 'address') {
      return uiText.CREATE.VALIDATION.ADDRESS_LANGUAGE
    }

    if (field === 'description') {
      return uiText.CREATE.VALIDATION.DESCRIPTION_LANGUAGE
    }

    return ''
  },

  getAddressValidationMessage(address) {
    const normalized = validation.sanitizeAddress(address, ADDRESS_MAX_LENGTH)
    const languageMessage = this.getFieldLanguageValidationMessage('address', normalized)

    if (!normalized) {
      return ''
    }

    if (languageMessage) {
      return languageMessage
    }

    if (normalized.length < ADDRESS_MIN_LENGTH) {
      return uiText.CREATE.VALIDATION.ADDRESS
    }

    if (!validation.hasMeaningfulAddress(normalized)) {
      return uiText.CREATE.VALIDATION.ADDRESS_MEANINGFUL
    }

    return ''
  },

  updateAddressHint(address, options = {}) {
    const { showForEmpty = false } = options
    const normalized = validation.sanitizeAddress(address, ADDRESS_MAX_LENGTH)
    const validationMessage = this.getAddressValidationMessage(normalized)
    const nextHintText = validationMessage || uiText.CREATE.ADDRESS_HINT
    const shouldShow = Boolean(validationMessage && (showForEmpty || normalized))

    if (this.data.addressHintVisible === shouldShow && this.data.addressHintText === nextHintText) {
      return
    }

    this.setData({
      addressHintVisible: shouldShow,
      addressHintText: nextHintText
    })
  },

  updateLanguageHint(field, value) {
    const message = this.getFieldLanguageValidationMessage(field, value)
    const shouldShow = Boolean(message)

    if (field === 'title') {
      if (this.data.titleHintVisible === shouldShow && this.data.titleHintText === message) {
        return
      }

      this.setData({
        titleHintVisible: shouldShow,
        titleHintText: message
      })
      return
    }

    if (field === 'description') {
      if (this.data.descriptionHintVisible === shouldShow && this.data.descriptionHintText === message) {
        return
      }

      this.setData({
        descriptionHintVisible: shouldShow,
        descriptionHintText: message
      })
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
    const profileDefaults = this.getProfileDefaults()
    const photoLimit = Number(this.data.photoLimit) || 5
    const draftForm = {
      title: String(currentForm.title || ''),
      price: validation.extractPriceDigits(currentForm.price || ''),
      location: FIXED_CITY,
      address: validation.sanitizeAddress(currentForm.address || '', ADDRESS_MAX_LENGTH),
      university: String(currentForm.university || ''),
      wechat: validation.sanitizeWeChatId(profileDefaults.wechat),
      description: String(currentForm.description || ''),
      categoryId: String(currentForm.categoryId || ''),
      subcategory: String(currentForm.subcategory || ''),
      condition: String(currentForm.condition || ''),
      images: Array.isArray(currentForm.images) ? currentForm.images.filter(Boolean).slice(0, photoLimit) : []
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

  clearDraftPromptTimer() {
    if (this.draftPromptTimer) {
      clearTimeout(this.draftPromptTimer)
      this.draftPromptTimer = null
    }
  },

  queueDraftRestorePrompt() {
    this.clearDraftPromptTimer()

    this.draftPromptTimer = setTimeout(() => {
      this.draftPromptTimer = null
      this.tryRestoreDraft()
    }, 80)
  },

  scrollCreateToTop() {
    this.setData({
      createScrollTop: 1
    }, () => {
      this.setData({
        createScrollTop: 0
      })
    })
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
    const subcategoryValues = this.getSubcategoryValues(categoryId)
    const subcategoryOptions = copyStore.getTranslatedSubcategoryOptions(subcategoryValues, this.data.locale)
    const normalizedSubcategory = normalizeSubcategory(draftForm.subcategory)
    const listedSubcategoryIndex = subcategoryValues.indexOf(normalizedSubcategory)
    const isCustomSubcategory = Boolean(normalizedSubcategory) && listedSubcategoryIndex === -1
    const subcategoryIndex = isCustomSubcategory
      ? this.getOtherSubcategoryIndex(subcategoryValues)
      : Math.max(listedSubcategoryIndex, 0)
    const requiresCondition = this.requiresCondition(categoryId)
    const conditionIndex = this.getConditionIndex(draftForm.condition)
    const universityValue = String(draftForm.university || profileDefaults.university || '')
    const universityIndex = universitiesStore.getUniversityIndex(universityValue, UNIVERSITY_OPTIONS)
    const photoLimit = Number(this.data.photoLimit) || 5
    const images = Array.isArray(draftForm.images) ? draftForm.images.filter(Boolean).slice(0, photoLimit) : []

    this.setData({
      draftChecked: true,
      createSheetOpen: false,
      titleHintVisible: false,
      titleHintText: '',
      descriptionHintVisible: false,
      descriptionHintText: '',
      addressHintVisible: false,
      categoryIndex,
      universityIndex,
      subcategoryValues,
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
        address: validation.sanitizeAddress(draftForm.address || '', ADDRESS_MAX_LENGTH),
        university: UNIVERSITY_OPTIONS[universityIndex] || UNIVERSITY_OPTIONS[0] || '',
        wechat: validation.sanitizeWeChatId(profileDefaults.wechat),
        description: String(draftForm.description || ''),
        categoryId,
        subcategory: isCustomSubcategory
          ? normalizedSubcategory.slice(0, MAX_CUSTOM_SUBCATEGORY_LENGTH)
          : (subcategoryValues[subcategoryIndex] || ''),
        condition: requiresCondition ? (CONDITION_OPTIONS[conditionIndex] || DEFAULT_CONDITION) : '',
        images
      }
    }, () => {
      this.updateLanguageHint('title', String(draftForm.title || ''))
      this.updateLanguageHint('description', String(draftForm.description || ''))
      this.updateAddressHint(validation.sanitizeAddress(draftForm.address || '', ADDRESS_MAX_LENGTH))
    })
  },

  openDraftInCreateFlow(draft) {
    this.resetForm()
    this.restoreDraftForm(draft)
    this.scrollCreateToTop()
  },

  tryRestoreDraft() {
    if (this.data.mode !== 'create') {
      return
    }

    const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
    const currentPage = pages && pages.length ? pages[pages.length - 1] : null
    if (!currentPage || currentPage.route !== 'pages/create/create') {
      this.queueDraftRestorePrompt()
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
      confirmText: this.data.copy.restore,
      cancelText: this.data.copy.discard,
      success: (res) => {
        if (res.confirm) {
          this.openDraftInCreateFlow(draft)
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
      createSheetOpen: false,
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

    const subcategoryValues = this.getSubcategoryValues(category.id)
    const subcategoryOptions = copyStore.getTranslatedSubcategoryOptions(subcategoryValues, this.data.locale)
    const defaultSubcategory = subcategoryValues[0] || ''
    const requiresCondition = this.requiresCondition(category.id)
    const currentCondition = normalizeCondition(this.data.form.condition)
    const conditionIndex = this.getConditionIndex(currentCondition)
    const nextCondition = requiresCondition
      ? (CONDITION_OPTIONS[conditionIndex] || DEFAULT_CONDITION)
      : ''

    this.setData({
      createSheetOpen: false,
      categoryIndex,
      subcategoryValues,
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
      createSheetOpen: false,
      conditionIndex,
      'form.condition': condition
    }, () => {
      this.scheduleDraftSave()
    })
  },

  onSubcategoryChange(e) {
    const subcategoryIndex = Number(e.detail.value)
    const pickedSubcategory = this.data.subcategoryValues[subcategoryIndex] || ''
    const isCustomSubcategory = pickedSubcategory === OTHER_SUBCATEGORY_OPTION
    const normalizedCustomSubcategory = normalizeSubcategory(this.data.customSubcategory).slice(0, MAX_CUSTOM_SUBCATEGORY_LENGTH)

    this.setData({
      createSheetOpen: false,
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

  openCreateSheet(e) {
    const { field } = e.currentTarget.dataset
    let title = ''
    let options = []
    let value = 0

    if (field === 'category') {
      title = this.data.copy.categoryLabel
      options = (this.data.categories || []).map((item) => item.name)
      value = Number(this.data.categoryIndex) || 0
    } else if (field === 'subcategory') {
      title = this.data.copy.subcategoryLabel
      options = this.data.subcategoryOptions || []
      value = Number(this.data.subcategoryIndex) || 0
    } else if (field === 'condition') {
      title = this.data.copy.conditionLabel
      options = this.data.conditionOptions || []
      value = Number(this.data.conditionIndex) || 0
    } else if (field === 'university') {
      title = this.data.copy.universityLabel
      options = this.data.universityOptions || []
      value = Number(this.data.universityIndex) || 0
    }

    if (!options.length) {
      return
    }

    this.setData({
      createSheetOpen: true,
      createSheetField: field || '',
      createSheetTitle: title,
      createSheetOptions: options,
      createSheetValue: value
    })
  },

  closeCreateSheet() {
    this.setData({
      createSheetOpen: false
    })
  },

  stopCreateSheetTap() {},

  onCreateSheetOptionTap(e) {
    const value = Number(e.currentTarget.dataset.index)
    const field = this.data.createSheetField
    const event = {
      detail: {
        value
      }
    }

    if (field === 'category') {
      this.onCategoryChange(event)
      return
    }

    if (field === 'subcategory') {
      this.onSubcategoryChange(event)
      return
    }

    if (field === 'condition') {
      this.onConditionChange(event)
      return
    }

    if (field === 'university') {
      this.onUniversityChange(event)
      return
    }

    this.closeCreateSheet()
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
      value = validation.sanitizeAddressDraft(rawValue, ADDRESS_MAX_LENGTH)
    } else if (field === 'wechat') {
      value = validation.sanitizeWeChatId(rawValue)
    } else if (field === 'description') {
      value = String(rawValue || '')
        .replace(/\r\n/g, '\n')
        .slice(0, DESCRIPTION_MAX_LENGTH)
    }

    this.setData({
      [`form.${field}`]: value
    }, () => {
      if (field === 'title' || field === 'description') {
        this.updateLanguageHint(field, value)
      }
      if (field === 'address') {
        this.updateAddressHint(value)
      }
      this.scheduleDraftSave()
    })
  },

  onTextFieldBlur(e) {
    const { field } = e.currentTarget.dataset
    let value = ''

    if (field === 'title') {
      value = validation.sanitizeSingleLine(e.detail && e.detail.value, TITLE_MAX_LENGTH)
    } else if (field === 'description') {
      value = validation.sanitizeMultiline(e.detail && e.detail.value, DESCRIPTION_MAX_LENGTH)
    } else {
      return
    }

    this.setData({
      [`form.${field}`]: value
    }, () => {
      this.updateLanguageHint(field, value)
      this.scheduleDraftSave()
    })
  },

  onAddressBlur(e) {
    const normalized = validation.sanitizeAddress(e.detail && e.detail.value, ADDRESS_MAX_LENGTH)
    const languageMessage = this.getFieldLanguageValidationMessage('address', normalized)

    if (normalized !== this.data.form.address) {
      this.setData({
        'form.address': normalized
      }, () => {
        this.updateAddressHint(normalized)
        if (languageMessage) {
          this.showValidation(languageMessage)
        }
        this.scheduleDraftSave()
      })
      return
    }

    this.updateAddressHint(normalized)
    if (languageMessage) {
      this.showValidation(languageMessage)
    }
  },

  async getPromotionPlans() {
    return listingsApi.getPromotionPlans()
  },

  async pickPromotionPlan(onPicked) {
    const plans = await this.getPromotionPlans()
    if (!plans.length) {
      if (typeof onPicked === 'function') {
        onPicked(null)
      }
      return
    }

    feedback.showActionSheet({
      itemList: plans.map((plan) => `${plan.durationDays}d · ${plan.priceLabel}`),
      success: (res) => {
        const picked = plans[Number(res.tapIndex)] || null
        if (typeof onPicked === 'function') {
          onPicked(picked)
        }
      },
      fail: () => {
        if (typeof onPicked === 'function') {
          onPicked(null)
        }
      }
    })
  },

  copyPromotionWechat(plan, onDone) {
    const wechatId = uiText.CREATE.PROMOTION_CONTACT_WECHAT
    const finalize = () => {
      if (typeof onDone === 'function') {
        onDone()
      }
    }

    wx.setClipboardData({
      data: wechatId,
      success: () => {
        feedback.showSuccessToast(uiText.CREATE.PROMOTION_CONTACT_COPIED)
        feedback.showModal({
          title: uiText.COMMON.WRITE_IN_WECHAT_TITLE,
          content: uiText.CREATE.promotionContactModalContent(wechatId, plan.label, plan.priceLabel),
          showCancel: false,
          confirmText: this.data.copy.ok,
          success: finalize
        })
      },
      fail: finalize
    })
  },

  async offerPromotionAfterPublish(listing, onDone) {
    const plans = await this.getPromotionPlans()
    const plansText = plans
      .map((plan) => `${plan.durationDays}d — ${plan.priceLabel}`)
      .join('\n')

    feedback.showModal({
      title: uiText.CREATE.PROMOTION_OFFER_TITLE,
      content: uiText.CREATE.promotionOfferContent(plansText),
      confirmText: this.data.copy.yes,
      cancelText: this.data.copy.no,
      success: (res) => {
        if (!res.confirm) {
          if (typeof onDone === 'function') {
            onDone()
          }
          return
        }

        this.pickPromotionPlan(async (plan) => {
          if (!plan) {
            if (typeof onDone === 'function') {
              onDone()
            }
            return
          }

          await listingsApi.requestPromotion(listing.id, plan.id, {
            source: 'post_publish'
          })

          feedback.showSuccessToast(uiText.CREATE.PROMOTION_REQUEST_SENT)
          this.copyPromotionWechat(plan, onDone)
        })
      }
    })
  },

  async getExistingListingsForDuplicateCheck() {
    if (canUseBackendWrites()) {
      const profile = this.getProfileDefaults().profile || {}
      const sellerKey = validation.sanitizeWeChatId(profile.wechat || '')

      if (sellerKey) {
        return listingsApi.getBySellerKey(sellerKey, {
          includeResolved: true,
          includeSold: true
        })
      }
    }

    return listingsApi.getMy()
  },

  applyPageMode(mode, editingId = '') {
    const modeState = copyStore.getCreateModeState(mode, this.data.locale)

    wx.setNavigationBarTitle({
      title: modeState.navTitle
    })

    this.setData({
      navTitle: modeState.navTitle,
      mode,
      editingId: String(editingId || ''),
      heroTitle: modeState.heroTitle,
      heroCopy: modeState.heroCopy,
      heroChip: modeState.heroChip,
      submitLabel: modeState.submitLabel
    })
  },

  async loadListingForEdit(id) {
    const listing = listingsApi.enabled
      ? await listingsApi.getById(id, {
        includeResolved: true,
        includeSold: true,
        includeHiddenByUser: true
      })
      : listingsApi.getById(id)
    const categories = this.data.categories || []
    const profileDefaults = this.getProfileDefaults()

    if (!listing) {
      feedback.showNeutralToast(uiText.CREATE.LISTING_NOT_FOUND)
      this.resetForm()
      return
    }

    const categoryIndex = Math.max(
      categories.findIndex((category) => category.id === listing.categoryId),
      0
    )
    const universityIndex = universitiesStore.getUniversityIndex(listing.university, UNIVERSITY_OPTIONS)
    const subcategoryValues = this.getSubcategoryValues(listing.categoryId)
    const subcategoryOptions = copyStore.getTranslatedSubcategoryOptions(subcategoryValues, this.data.locale)
    const listingSubcategory = listing.subcategory || ''
    const listedSubcategoryIndex = subcategoryValues.indexOf(listingSubcategory)
    const isCustomSubcategory = listedSubcategoryIndex === -1
    const subcategoryIndex = isCustomSubcategory
      ? this.getOtherSubcategoryIndex(subcategoryValues)
      : Math.max(listedSubcategoryIndex, 0)
    const customSubcategory = isCustomSubcategory
      ? normalizeSubcategory(listingSubcategory).slice(0, MAX_CUSTOM_SUBCATEGORY_LENGTH)
      : ''
    const requiresCondition = this.requiresCondition(listing.categoryId)
    const conditionIndex = this.getConditionIndex(listing.condition)

    this.setData({
      createSheetOpen: false,
      titleHintVisible: false,
      titleHintText: '',
      descriptionHintVisible: false,
      descriptionHintText: '',
      addressHintVisible: false,
      categoryIndex,
      universityIndex,
      subcategoryValues,
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
        address: validation.sanitizeAddress(listing.address || '', ADDRESS_MAX_LENGTH),
        university: UNIVERSITY_OPTIONS[universityIndex] || UNIVERSITY_OPTIONS[0] || '',
        wechat: validation.sanitizeWeChatId(profileDefaults.wechat),
        description: listing.description || '',
        categoryId: listing.categoryId,
        subcategory: isCustomSubcategory
          ? customSubcategory
          : listing.subcategory || subcategoryValues[0] || '',
        condition: requiresCondition ? (CONDITION_OPTIONS[conditionIndex] || DEFAULT_CONDITION) : '',
        images: listing.images || []
      }
    }, () => {
      this.updateLanguageHint('title', listing.title || '')
      this.updateLanguageHint('description', listing.description || '')
      this.updateAddressHint(validation.sanitizeAddress(listing.address || '', ADDRESS_MAX_LENGTH))
    })

    this.applyPageMode('edit', id)
  },

  choosePhotos() {
    const currentImages = this.data.form.images || []
    const photoLimit = Number(this.data.photoLimit) || 5
    const remainingCount = photoLimit - currentImages.length
    const pickerCount = Math.min(remainingCount, 9)

    if (remainingCount <= 0) {
      feedback.showNeutralToast(copyStore.getCreatePhotoHint(photoLimit, this.data.locale))
      return
    }

    const onSuccess = (res) => {
      const files = res.tempFiles || []
      const nextImages = currentImages.concat(files.map((file) => file.tempFilePath)).slice(0, photoLimit)
      this.setData({
        'form.images': nextImages
      }, () => {
        this.scheduleDraftSave()
      })
    }

    if (wx.chooseMedia) {
      wx.chooseMedia({
        count: pickerCount,
        mediaType: ['image'],
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: onSuccess
      })
      return
    }

    wx.chooseImage({
      count: pickerCount,
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

  async submitListing() {
    if (this.data.submitting) {
      return
    }

    const form = this.data.form
    const profileDefaults = this.getProfileDefaults()
    const isEdit = this.data.mode === 'edit' && this.data.editingId
    const title = validation.sanitizeSingleLine(form.title, TITLE_MAX_LENGTH)
    const rawPrice = validation.extractPriceDigits(form.price)
    const price = validation.ensurePriceCurrency(rawPrice)
    const location = FIXED_CITY
    const address = validation.sanitizeAddress(form.address, ADDRESS_MAX_LENGTH)
    const selectedUniversity = UNIVERSITY_OPTIONS[this.data.universityIndex] || UNIVERSITY_OPTIONS[0] || ''
    const isUniversityPrivate = universitiesStore.isUniversityPrivateValue(selectedUniversity)
    const university = isUniversityPrivate ? '' : selectedUniversity
    const wechat = validation.sanitizeWeChatId(profileDefaults.wechat)
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

    if (this.getFieldLanguageValidationMessage('title', title)) {
      this.showValidation(uiText.CREATE.VALIDATION.TITLE_LANGUAGE)
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

    if (this.getFieldLanguageValidationMessage('address', address)) {
      this.updateAddressHint(address, { showForEmpty: true })
      this.showValidation(uiText.CREATE.VALIDATION.ADDRESS_LANGUAGE)
      return
    }

    this.updateAddressHint(address, { showForEmpty: true })

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

    if (this.getFieldLanguageValidationMessage('description', description)) {
      this.showValidation(uiText.CREATE.VALIDATION.DESCRIPTION_LANGUAGE)
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

      const existingListings = await this.getExistingListingsForDuplicateCheck()
      const hasDuplicateActiveListing = existingListings.some((listing) => {
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

    const shouldUseBackendPublish = canUseBackendWrites()
    const backendMediaReady = isBackendMediaReady()
    let preparedImages = form.images

    if (shouldUseBackendPublish) {
      if (!backendMediaReady) {
        this.setData({ submitting: false })
        this.showValidation(mediaUploader.getUnavailableReason() || uiText.CREATE.BACKEND_MEDIA_REQUIRED)
        return
      }

      try {
        preparedImages = await mediaUploader.prepareListingImages(form.images)
      } catch (error) {
        this.setData({ submitting: false })
        this.showValidation(error && error.message ? error.message : uiText.CREATE.SAVE_FAILED)
        return
      }
    }

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
      images: preparedImages,
      image: preparedImages[0] || catalogApi.getFallbackImage(categoryId),
      seller: {
        id: profileDefaults.profile && profileDefaults.profile.id
          ? profileDefaults.profile.id
          : wechat,
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

    let listing = null

    try {
      listing = shouldUseBackendPublish
        ? isEdit
          ? await listingsApi.update(this.data.editingId, payload)
          : await listingsApi.create(payload)
        : isEdit
          ? listingsApi.update(this.data.editingId, payload)
          : listingsApi.create(payload)
    } catch (error) {
      listing = null
    }

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

    const finishSubmitFlow = () => {
      this.resetForm()

      setTimeout(() => {
        this.setData({ submitting: false })
        wx.navigateTo({
          url: `/pages/listing/listing?id=${listing.id}`
        })
      }, 280)
    }

    if (!isEdit) {
      this.offerPromotionAfterPublish(listing, finishSubmitFlow)
      return
    }

    finishSubmitFlow()
  },

  showValidation(title) {
    feedback.showNeutralToast(title)
  },

  resetForm() {
    const categories = this.data.categories
    const initialCategory = categories[0] || { id: 'housing' }
    const subcategoryValues = this.getSubcategoryValues(initialCategory.id)
    const subcategoryOptions = copyStore.getTranslatedSubcategoryOptions(subcategoryValues, this.data.locale)
    const defaultSubcategory = subcategoryValues[0] || ''
    const isCustomSubcategory = defaultSubcategory === OTHER_SUBCATEGORY_OPTION
    const requiresCondition = this.requiresCondition(initialCategory.id)
    const profileDefaults = this.getProfileDefaults()

    this.setData({
      draftChecked: false,
      createSheetOpen: false,
      titleHintVisible: false,
      titleHintText: '',
      descriptionHintVisible: false,
      descriptionHintText: '',
      addressHintVisible: false,
      categoryIndex: 0,
      subcategoryValues,
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
