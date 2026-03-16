const market = require('../../data/market')

Page({
  data: {
    categoryId: '',
    isAllCategories: false,
    category: null,
    featured: [],
    categories: []
  },

  onLoad(query) {
    const categoryId = query.id || 'all'

    if (categoryId === 'all') {
      wx.setNavigationBarTitle({
        title: 'Categories'
      })

      this.setData({
        categoryId,
        isAllCategories: true,
        categories: market.getPublishCategories()
      })
      return
    }

    const category = market.categoryConfigs[categoryId] || market.categoryConfigs.housing
    const featured = market.featuredCards[categoryId] || market.featuredCards.housing

    wx.setNavigationBarTitle({
      title: category.title
    })

    this.setData({
      categoryId,
      isAllCategories: false,
      category,
      featured
    })
  },

  goBack() {
    wx.navigateBack()
  },

  openResults() {
    wx.navigateTo({
      url: `/pages/results/results?categoryId=${this.data.categoryId}`
    })
  },

  openCategory(e) {
    const { id } = e.currentTarget.dataset
    wx.redirectTo({
      url: `/pages/category/category?id=${id}`
    })
  },

  openSubcategory(e) {
    const { name } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/results/results?categoryId=${this.data.categoryId}&subcategory=${encodeURIComponent(name)}`
    })
  }
})
