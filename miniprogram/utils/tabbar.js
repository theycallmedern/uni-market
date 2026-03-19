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
    themeMode: extraData.themeMode || 'light'
  })
}

module.exports = {
  syncTabBar
}
