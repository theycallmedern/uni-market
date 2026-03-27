const localeStore = require('./locale')

function syncTabBar(page, selected, extraData = {}) {
  if (!page || typeof page.getTabBar !== 'function') {
    return
  }

  const tabBar = page.getTabBar()
  if (!tabBar || typeof tabBar.setData !== 'function') {
    return
  }

  tabBar.setData({
    selected,
    themeMode: extraData.themeMode || 'light',
    locale: extraData.locale || localeStore.getLocale()
  })
}

module.exports = {
  syncTabBar
}
