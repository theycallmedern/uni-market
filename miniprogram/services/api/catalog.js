const market = require('../../data/market')

module.exports = {
  categories: market.categories,
  categoryConfigs: market.categoryConfigs,
  getPublishCategories() {
    return market.getPublishCategories()
  },
  getFallbackImage(categoryId) {
    return market.getFallbackImage(categoryId)
  },
  getSubcategoryCards(categoryId) {
    return market.getSubcategoryCards(categoryId)
  }
}
