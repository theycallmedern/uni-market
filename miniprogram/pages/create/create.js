const market = require('../../data/market')
const profileStore = require('../../utils/profile')
const universitiesStore = require('../../utils/universities')
const tabbarStore = require('../../utils/tabbar')
const OTHER_SUBCATEGORY_OPTION = 'Other (type your own)'
const MAX_CUSTOM_SUBCATEGORY_LENGTH = 40
const FIXED_CITY = 'Hangzhou'
const UNIVERSITY_OPTIONS = universitiesStore.HANGZHOU_UNIVERSITIES

function normalizeSubcategory(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
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
    isCustomSubcategory: false,
    customSubcategory: '',
    mode: 'create',
    editingId: '',
    heroTitle: 'Post a new listing',
    heroCopy: 'Share something useful with students around Hangzhou and publish it straight into the MVP.',
    heroChip: 'Live preview flow',
    submitLabel: 'Publish listing',
    submitting: false,
    form: {
      title: '',
      price: '',
      location: FIXED_CITY,
      university: '',
      wechat: '',
      description: '',
      categoryId: '',
      subcategory: '',
      images: []
    }
  },

  onLoad() {
    const categories = market.getPublishCategories()
    const initialCategory = categories[0] || { id: 'housing' }
    const subcategoryOptions = this.getSubcategoryOptions(initialCategory.id)
    const defaultSubcategory = subcategoryOptions[0] || ''
    const isCustomSubcategory = defaultSubcategory === OTHER_SUBCATEGORY_OPTION
    const profileDefaults = this.getProfileDefaults()
    const universityIndex = universitiesStore.getUniversityIndex(profileDefaults.university, UNIVERSITY_OPTIONS)

    this.setData({
      categories,
      subcategoryOptions,
      categoryIndex: 0,
      universityIndex,
      subcategoryIndex: 0,
      isCustomSubcategory,
      customSubcategory: '',
      'form.categoryId': initialCategory.id,
      'form.university': profileDefaults.university,
      'form.wechat': profileDefaults.wechat,
      'form.subcategory': isCustomSubcategory ? '' : defaultSubcategory
    })

    this.applyPageMode('create')
  },

  onShow() {
    tabbarStore.syncTabBar(this, 2)
    const queuedMode = market.consumeCreateMode()

    if (!queuedMode) {
      return
    }

    if (queuedMode.type === 'edit' && queuedMode.id) {
      this.loadListingForEdit(queuedMode.id)
      return
    }

    this.resetForm()
  },

  onTabItemTap() {
    if (this.data.mode === 'edit') {
      this.resetForm()
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

  onUniversityChange(e) {
    const universityIndex = Number(e.detail.value)
    const university = UNIVERSITY_OPTIONS[universityIndex] || UNIVERSITY_OPTIONS[0] || ''

    this.setData({
      universityIndex,
      'form.university': university
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

    this.setData({
      categoryIndex,
      subcategoryOptions,
      subcategoryIndex: 0,
      isCustomSubcategory: defaultSubcategory === OTHER_SUBCATEGORY_OPTION,
      customSubcategory: '',
      'form.categoryId': category.id,
      'form.subcategory': defaultSubcategory === OTHER_SUBCATEGORY_OPTION ? '' : defaultSubcategory
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
    })
  },

  onCustomSubcategoryInput(e) {
    const customSubcategory = normalizeSubcategory(e.detail.value).slice(0, MAX_CUSTOM_SUBCATEGORY_LENGTH)

    this.setData({
      customSubcategory,
      'form.subcategory': customSubcategory
    })
  },

  onFieldInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`form.${field}`]: e.detail.value
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
      wx.showToast({
        title: 'Listing not found',
        icon: 'none'
      })
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

    this.setData({
      categoryIndex,
      universityIndex,
      subcategoryOptions,
      subcategoryIndex,
      isCustomSubcategory,
      customSubcategory,
      form: {
        title: listing.title || '',
        price: listing.price || '',
        location: FIXED_CITY,
        university: UNIVERSITY_OPTIONS[universityIndex] || UNIVERSITY_OPTIONS[0] || '',
        wechat: listing.seller && listing.seller.wechat ? listing.seller.wechat : '',
        description: listing.description || '',
        categoryId: listing.categoryId,
        subcategory: isCustomSubcategory
          ? customSubcategory
          : listing.subcategory || subcategoryOptions[0] || '',
        images: listing.images || []
      }
    })

    this.applyPageMode('edit', id)
  },

  choosePhotos() {
    const currentImages = this.data.form.images || []
    const remainingCount = 5 - currentImages.length

    if (remainingCount <= 0) {
      wx.showToast({
        title: 'Up to 5 photos',
        icon: 'none'
      })
      return
    }

    const onSuccess = (res) => {
      const files = res.tempFiles || []
      const nextImages = currentImages.concat(files.map((file) => file.tempFilePath)).slice(0, 5)
      this.setData({
        'form.images': nextImages
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
    })
  },

  submitListing() {
    if (this.data.submitting) {
      return
    }

    const form = this.data.form
    const title = form.title.trim()
    const price = form.price.trim()
    const location = FIXED_CITY
    const selectedUniversity = UNIVERSITY_OPTIONS[this.data.universityIndex] || UNIVERSITY_OPTIONS[0] || ''
    const isUniversityPrivate = universitiesStore.isUniversityPrivateValue(selectedUniversity)
    const university = isUniversityPrivate ? '' : selectedUniversity
    const wechat = form.wechat.trim()
    const description = form.description.trim()
    const categoryId = String(form.categoryId || '').trim()
    let subcategory = normalizeSubcategory(form.subcategory)

    const hasValidCategory = this.data.categories.some((category) => category.id === categoryId)
    if (!hasValidCategory) {
      this.showValidation('Choose a category')
      return
    }

    if (this.data.isCustomSubcategory) {
      const customSubcategory = normalizeSubcategory(this.data.customSubcategory).slice(0, MAX_CUSTOM_SUBCATEGORY_LENGTH)

      if (customSubcategory.length < 2) {
        this.showValidation('Custom subcategory: 2-40 chars')
        return
      }

      subcategory = customSubcategory
      this.setData({
        customSubcategory,
        'form.subcategory': customSubcategory
      })
    }

    if (!subcategory) {
      this.showValidation('Choose subcategory or type your own')
      return
    }

    if (title.length < 4) {
      this.showValidation('Add a clearer title')
      return
    }

    if (!price) {
      this.showValidation('Enter the price')
      return
    }

    if (!university && !isUniversityPrivate) {
      this.showValidation('Add your university')
      return
    }

    if (!wechat) {
      this.showValidation('Add your WeChat ID')
      return
    }

    if (description.length < 12) {
      this.showValidation('Write a bit more detail')
      return
    }

    this.setData({ submitting: true })

    const isEdit = this.data.mode === 'edit' && this.data.editingId
    const profileDefaults = this.getProfileDefaults()
    const payload = {
      title,
      price,
      location,
      university,
      categoryId,
      subcategory,
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
      this.showValidation('Could not save listing')
      return
    }

    wx.showToast({
      title: isEdit ? 'Updated' : 'Published',
      icon: 'success'
    })

    this.resetForm()

    setTimeout(() => {
      this.setData({ submitting: false })
      wx.navigateTo({
        url: `/pages/listing/listing?id=${listing.id}`
      })
    }, 280)
  },

  showValidation(title) {
    wx.showToast({
      title,
      icon: 'none'
    })
  },

  resetForm() {
    const categories = this.data.categories
    const initialCategory = categories[0] || { id: 'housing' }
    const subcategoryOptions = this.getSubcategoryOptions(initialCategory.id)
    const defaultSubcategory = subcategoryOptions[0] || ''
    const isCustomSubcategory = defaultSubcategory === OTHER_SUBCATEGORY_OPTION
    const profileDefaults = this.getProfileDefaults()

    this.setData({
      categoryIndex: 0,
      subcategoryOptions,
      subcategoryIndex: 0,
      universityIndex: universitiesStore.getUniversityIndex(profileDefaults.university, UNIVERSITY_OPTIONS),
      isCustomSubcategory,
      customSubcategory: '',
      form: {
        title: '',
        price: '',
        location: FIXED_CITY,
        university: profileDefaults.university,
        wechat: profileDefaults.wechat,
        description: '',
        categoryId: initialCategory.id,
        subcategory: isCustomSubcategory ? '' : defaultSubcategory,
        images: []
      }
    })

    this.applyPageMode('create')
  }
})
