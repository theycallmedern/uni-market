const market = require('../../data/market')

Page({
  data: {
    categories: [],
    categoryIndex: 0,
    subcategoryOptions: [],
    subcategoryIndex: 0,
    submitting: false,
    form: {
      title: '',
      price: '',
      location: 'Hangzhou',
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

    this.setData({
      categories,
      subcategoryOptions,
      categoryIndex: 0,
      subcategoryIndex: 0,
      'form.categoryId': initialCategory.id,
      'form.subcategory': subcategoryOptions[0] || ''
    })
  },

  getSubcategoryOptions(categoryId) {
    const category = market.categoryConfigs[categoryId]
    return category && category.subcategories && category.subcategories.length
      ? category.subcategories
      : ['General']
  },

  onCategoryChange(e) {
    const categoryIndex = Number(e.detail.value)
    const category = this.data.categories[categoryIndex]
    const subcategoryOptions = this.getSubcategoryOptions(category.id)

    this.setData({
      categoryIndex,
      subcategoryOptions,
      subcategoryIndex: 0,
      'form.categoryId': category.id,
      'form.subcategory': subcategoryOptions[0] || ''
    })
  },

  onSubcategoryChange(e) {
    const subcategoryIndex = Number(e.detail.value)
    const subcategory = this.data.subcategoryOptions[subcategoryIndex] || ''

    this.setData({
      subcategoryIndex,
      'form.subcategory': subcategory
    })
  },

  onFieldInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`form.${field}`]: e.detail.value
    })
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

  submitListing() {
    if (this.data.submitting) {
      return
    }

    const form = this.data.form
    const title = form.title.trim()
    const price = form.price.trim()
    const location = form.location.trim() || 'Hangzhou'
    const university = form.university.trim()
    const wechat = form.wechat.trim()
    const description = form.description.trim()

    if (title.length < 4) {
      this.showValidation('Add a clearer title')
      return
    }

    if (!price) {
      this.showValidation('Enter the price')
      return
    }

    if (!university) {
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

    const listing = market.createListing({
      title,
      price,
      location,
      university,
      categoryId: form.categoryId,
      subcategory: form.subcategory,
      description,
      images: form.images,
      image: form.images[0] || market.getFallbackImage(form.categoryId),
      seller: {
        name: 'You',
        badge: 'New listing',
        wechat,
        note: 'Published just now'
      }
    })

    wx.showToast({
      title: 'Published',
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

    this.setData({
      categoryIndex: 0,
      subcategoryOptions,
      subcategoryIndex: 0,
      form: {
        title: '',
        price: '',
        location: 'Hangzhou',
        university: '',
        wechat: '',
        description: '',
        categoryId: initialCategory.id,
        subcategory: subcategoryOptions[0] || '',
        images: []
      }
    })
  }
})
