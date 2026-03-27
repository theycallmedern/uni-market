const localeStore = require('../utils/locale')
const universitiesStore = require('../utils/universities')

const COPY = {
  en: {
    common: {
      allLocations: 'All locations',
      allUniversities: 'All universities',
      allCategories: 'All categories',
      sortOptions: ['Newest', 'Price low to high', 'Price high to low'],
      current: 'Current',
      switch: 'Switch',
      open: 'Open',
      enter: 'Enter',
      active: 'Active',
      locked: 'Locked',
      remove: 'Remove',
      clear: 'Clear',
      delete: 'Delete',
      request: 'Request',
      connect: 'Connect',
      later: 'Later',
      saved: 'Saved',
      removed: 'Removed'
    },
    tabBar: {
      search: 'Search',
      saved: 'Saved',
      post: 'Post',
      listings: 'Listings',
      profile: 'Profile'
    },
    market: {
      categories: {
        all: 'All',
        items: 'Items',
        electronics: 'Electronics',
        transport: 'Transport',
        study: 'Study',
        services: 'Services',
        other: 'Other',
        housing: 'Housing'
      },
      conditions: {
        Used: 'Used',
        'Like new': 'Like new',
        New: 'New',
        Refurbished: 'Refurbished',
        'For parts': 'For parts'
      },
      badges: {
        'Seller Pro': 'Seller Pro',
        'Verified student': 'Verified student',
        'Student seller': 'Student seller',
        'Community member': 'Community member',
        'Founder, UniMarket': 'Founder, UniMarket'
      },
      cities: {
        Hangzhou: 'Hangzhou'
      },
      subcategories: {
        'Other (type your own)': 'Other (type your own)',
        General: 'General',
        'Private room': 'Private room',
        'Shared room': 'Shared room',
        'Shared flat': 'Shared flat',
        Studio: 'Studio',
        'Full apartment': 'Full apartment',
        'Short-term sublet': 'Short-term sublet',
        'Dorm takeover': 'Dorm takeover',
        Phones: 'Phones',
        Laptops: 'Laptops',
        Tablets: 'Tablets',
        Audio: 'Audio',
        Cameras: 'Cameras',
        'Gaming gear': 'Gaming gear',
        Accessories: 'Accessories',
        Bikes: 'Bikes',
        'E-bikes': 'E-bikes',
        Scooters: 'Scooters',
        'Ride-sharing': 'Ride-sharing',
        Rentals: 'Rentals',
        'Parts & repair': 'Parts & repair',
        'Dorm essentials': 'Dorm essentials',
        Kitchenware: 'Kitchenware',
        Clothing: 'Clothing',
        'Bags & luggage': 'Bags & luggage',
        'Home decor': 'Home decor',
        'Small appliances': 'Small appliances',
        Bundles: 'Bundles',
        'Translation & paperwork': 'Translation & paperwork',
        'Airport pickup': 'Airport pickup',
        'Moving help': 'Moving help',
        'Photo shoots': 'Photo shoots',
        'Tech setup': 'Tech setup',
        'Errands & delivery': 'Errands & delivery',
        'Cleaning help': 'Cleaning help',
        Tutoring: 'Tutoring',
        Textbooks: 'Textbooks',
        'Study notes': 'Study notes',
        'Language exchange': 'Language exchange',
        'HSK / IELTS prep': 'HSK / IELTS prep',
        Stationery: 'Stationery',
        'Study groups': 'Study groups',
        'Other items': 'Other items',
        'Free stuff': 'Free stuff',
        Collectibles: 'Collectibles',
        'Hobby gear': 'Hobby gear',
        'Sports gear': 'Sports gear',
        'Beauty & care': 'Beauty & care',
        'Pet supplies': 'Pet supplies'
      }
    },
    create: {
      cardPhotos: 'Photos',
      photoHintTemplate: 'Up to {count} · first is cover',
      photoSubhint: 'Tap a photo to preview. Use arrows to reorder.',
      addPhoto: 'Add photo',
      cover: 'Cover',
      cardBasics: 'Basics',
      cardBasicsHint: 'What are you offering?',
      titleLabel: 'Title',
      titlePlaceholder: 'Room near campus, iPhone 14, bike...',
      priceLabel: 'Price',
      locationLabel: 'Location',
      addressLabel: 'Address',
      addressPlaceholder: 'Xixi Campus, Yuhangtang Rd 866, Building 3',
      categoryLabel: 'Category',
      subcategoryLabel: 'Subcategory',
      customSubcategoryLabel: 'Custom subcategory',
      customSubcategoryPlaceholder: 'Type your own subcategory',
      conditionLabel: 'Condition',
      cardContact: 'Contact',
      cardContactHint: 'How should buyers find you?',
      universityLabel: 'University',
      wechatLabel: 'WeChat ID',
      wechatPlaceholder: 'wechatid (6-20 chars)',
      wechatLockedHint: 'Synced from your profile. Change it on the profile page only.',
      cardDescription: 'Description',
      cardDescriptionHint: 'Add condition, timing, pickup notes, or extras',
      descriptionPlaceholder: 'Describe the item, service, or room in a way another student can trust quickly.',
      closeSheet: 'Cancel',
      restore: 'Restore',
      discard: 'Discard',
      ok: 'OK',
      yes: 'Yes',
      no: 'No',
      newNavTitle: 'New Listing',
      editNavTitle: 'Edit Listing',
      newHeroTitle: 'Post a new listing',
      newHeroCopy: 'Share something useful with students around Hangzhou and publish it straight into the MVP.',
      newHeroChip: 'Live preview flow',
      editHeroTitle: 'Edit your listing',
      editHeroCopy: 'Update the title, price, category, and details so your listing stays clear and current in the marketplace.',
      editHeroChip: 'Edit mode',
      publishLabel: 'Publish listing',
      saveChangesLabel: 'Save changes'
    },
    settings: {
      headerTitle: 'Settings',
      heroEyebrow: 'Settings',
      heroTitle: 'Manage language, theme, and admin access in one clean place',
      heroCopy: 'Choose the language you want to browse in, then adjust appearance and moderation access.',
      languageSectionTitle: 'Language',
      languageSectionSubtitle: 'Pick the interface language used across the main app surfaces.',
      currentLanguageLabel: 'Current language',
      languageSavedCopy: 'Saved on this device and applied across the tab bar, main tabs, toasts, and modal copy.',
      appearanceSectionTitle: 'Appearance',
      appearanceSectionSubtitle: 'Choose how Profile and Settings should look right now.',
      currentThemeLabel: 'Current theme',
      currentThemeCopy: 'Saved on this device and already applied to Profile, Settings, the header, and the profile tab bar.',
      lightThemeTitle: 'Light mode',
      lightThemeCopy: 'Keep the bright neutral palette that the app already uses today.',
      darkThemeTitle: 'Dark mode',
      darkThemeCopy: 'Use deeper surfaces and lighter text for a lower-glare interface at night.',
      themeLight: 'Light',
      themeDark: 'Dark',
      adminSectionTitle: 'Admin',
      adminAccessTitle: 'Admin access',
      adminAccessCopy: 'Use admin mode to open the moderation panel and manage marketplace reports and Seller Pro requests.',
      adminActiveSubtitle: 'Admin mode is active on this device.',
      adminLockedSubtitle: 'Admin mode is currently locked on this device.',
      adminOpenTitle: 'Open admin panel',
      adminOpenCopy: 'Go to moderation tools for reports, listings, and Seller Pro requests.',
      adminExitTitle: 'Exit admin',
      adminExitCopy: 'Turn off admin mode on this device and hide moderation access.',
      adminExitMeta: 'Disable',
      adminUnlockTitle: 'Unlock admin access',
      adminUnlockCopy: 'Enter the admin code to unlock moderation tools on this device.'
    },
    home: {
      headerTitle: 'UniMarket',
      heroTitle: 'Find what student life needs.',
      heroSubtitle: 'Browse housing, transport, services, and campus essentials in one place.',
      heroChip: 'Hangzhou',
      searchPlaceholder: 'Search listings',
      sectionTitle: 'Latest Listings',
      sectionSubtitle: 'Fresh posts from the student community',
      emptyTitle: 'No results found',
      emptyCopy: 'Try another category or adjust your search.',
      filterTitle: 'Quick filters',
      filterReset: 'Reset',
      locationLabel: 'Location',
      universityLabel: 'University',
      sortLabel: 'Sort',
      promotedBadge: '✦ Promoted',
      sellerProBadge: 'Seller Pro'
    },
    favorites: {
      headerTitle: 'Saved',
      pageTitle: 'Saved',
      pageCopy: 'Your favorite listings stay here for quick access.',
      sortTitle: 'Sort',
      categoryTitle: 'Category',
      removeUnavailableTitle: 'Remove unavailable',
      clearSavedTitle: 'Clear saved',
      clearSavedCopy: 'Remove all favorites from this device',
      noMatchesTitle: 'No matches for these filters',
      noMatchesCopy: 'Try another category or change the sort.',
      emptyTitle: 'Nothing saved yet',
      emptyCopy: 'Tap the heart on a listing to keep it here.',
      promotedBadge: '✦ Promoted'
    },
    userProfile: {
      navSellerProfile: 'Seller profile',
      navMyProfile: 'My profile',
      navSellerHidden: 'Seller hidden',
      navProfileUnavailable: 'Profile unavailable',
      wechatLabel: 'WeChat',
      statsNew: 'New',
      statsRating: 'Rating',
      statsListings: 'Listings',
      statsSold: 'Sold',
      analyticsTitle: 'Seller Pro insights',
      analyticsSubtitle: 'See how many students open your profile and save your listings',
      analyticsProfileViews: 'Profile views',
      analyticsListingSaves: 'Listing saves',
      thisWeekSuffix: 'this week',
      editProfileButton: 'Edit profile',
      contactSellerButton: 'Write in WeChat',
      reviewedButton: 'Reviewed',
      leaveReviewButton: 'Leave review',
      editSectionTitle: 'Edit profile',
      editSectionSubtitle: 'Update the public info other students can see',
      changePhotoButton: 'Change photo',
      removePhotoButton: 'Remove',
      nameLabel: 'Name',
      nameHint: 'Synced from your account identity to keep your profile and Seller Pro stable.',
      universityLabel: 'University',
      wechatFieldLabel: 'WeChat ID',
      wechatPlaceholder: 'wechatid (6-20 chars)',
      bioLabel: 'Bio',
      cancelButton: 'Cancel',
      saveChangesButton: 'Save changes',
      yourRatingTitle: 'Your rating',
      sellerRatingTitle: 'Seller rating',
      noWrittenNote: 'No written note',
      noReviewsTitle: 'No reviews yet',
      noReviewsCopy: 'Ask buyers to leave a review after they contact you in WeChat.',
      yourListingsTitle: 'Your listings',
      listingsByPrefix: 'Listings by ',
      activeSuffix: 'active',
      promotedBadge: '✦ Promoted',
      noActiveListingsTitle: 'No active listings',
      noActiveListingsCopy: 'This seller does not have any visible listings right now.',
      myProfileOptionsTitle: 'My profile options',
      myProfileOptionsSubtitle: 'Share your profile or jump into edit mode.',
      profileOptionsTitle: 'Profile options',
      profileOptionsSubtitle: 'Share this seller profile or send a report to moderation.',
      shareProfileTitle: 'Share profile',
      shareOwnProfileMeta: 'Send your profile in WeChat',
      shareSellerProfileMeta: 'Send this seller profile in WeChat',
      copyLinkTitle: 'Copy link',
      copyLinkMeta: 'Copy the profile path to clipboard',
      editProfileMenuTitle: 'Edit profile',
      editProfileMenuMeta: 'Update your avatar, name, university, WeChat, and bio',
      writeInWechatTitle: 'Write in WeChat',
      writeInWechatMeta: 'Copy the seller ID and continue in WeChat search',
      blockUserTitle: 'Block user',
      blockUserMeta: 'Hide all listings from this seller on this device',
      reportSentTitle: 'Report already sent',
      reportSentMeta: 'Moderation already has your report',
      reportProfileTitle: 'Report profile',
      reportProfileMeta: 'Fake identity, spam, scam, or harmful behavior',
      menuCancel: 'Cancel',
      universitySheetTitle: 'University',
      universitySheetClose: 'Close',
      sellerHiddenTitle: 'Seller hidden',
      sellerHiddenCopy: 'You blocked this seller on this device, so their profile and listings are no longer visible here.',
      profileUnavailableTitle: 'Profile unavailable',
      profileUnavailableCopy: 'We could not find this seller profile anymore.',
      reviewerFallback: 'UniMarket user'
    },
    listing: {
      navListing: 'Listing',
      navListingHidden: 'Listing hidden',
      navListingUnavailable: 'Listing unavailable',
      navSellerHidden: 'Seller hidden',
      soldBadge: 'Sold',
      archivedStatus: 'Archived',
      hiddenBadge: 'Hidden',
      promotedBadge: '✦ Promoted',
      locationLabel: 'Location',
      universityLabel: 'University',
      addressLabel: 'Address',
      copyAddress: 'Copy address',
      analyticsTitle: 'Seller Pro insights',
      analyticsSubtitle: 'Only you can see how this listing performs',
      analyticsViews: 'Views',
      analyticsSaved: 'Saved',
      thisWeekSuffix: 'this week',
      noReviewsYet: 'No reviews yet',
      savedButton: 'Saved',
      saveButton: 'Save',
      writeInWechatButton: 'Write in WeChat',
      listingOptionsTitle: 'Listing options',
      listingOptionsSubtitle: 'Share this listing or send a report to moderation.',
      shareListingTitle: 'Share listing',
      shareListingMeta: 'Send the link in WeChat',
      copyLinkTitle: 'Copy link',
      copyLinkMeta: 'Copy the listing path to clipboard',
      writeInWechatTitle: 'Write in WeChat',
      writeInWechatMeta: 'Copy the seller ID and continue in WeChat search',
      hideListingTitle: 'Hide listing',
      hideListingMeta: 'Remove it from your feed on this device',
      blockUserTitle: 'Block user',
      blockUserMeta: 'Hide all listings from this seller on this device',
      reportSentTitle: 'Report already sent',
      reportSentMeta: 'Moderation already has your report',
      reportListingTitle: 'Report listing',
      reportListingMeta: 'Scams, wrong category, or prohibited items',
      menuCancel: 'Cancel',
      emptyHiddenTitle: 'Listing hidden',
      emptyHiddenCopy: 'You hid this listing on this device, so it no longer appears in your marketplace feed.',
      emptySellerHiddenTitle: 'Seller hidden',
      emptySellerHiddenCopy: 'You blocked this seller on this device, so their listings are no longer visible here.',
      emptyUnavailableTitle: 'Listing unavailable',
      emptyUnavailableCopy: 'This listing was hidden after moderation review.',
      emptyNotFoundTitle: 'Listing not found',
      emptyNotFoundCopy: 'This listing is no longer available or the link is outdated.',
      backToListings: 'Back to listings',
      newSeller: 'New seller',
      seller: 'Seller',
      proSeller: 'Pro seller'
    },
    categoryPage: {
      navTitle: 'Categories',
      openDetailedFilters: 'Open detailed filters',
      allOption: 'All',
      selectOption: 'Select option',
      noListingsFound: 'No listings found',
      showOneListing: 'Show 1 listing',
      showManyListingsPrefix: 'Show ',
      showManyListingsSuffix: ' listings',
      panelExplorePrefix: 'Explore ',
      panelSeeAll: 'See all →',
      featuredTitle: 'Recommended',
      featuredBadge: 'New',
      sheetCancel: 'Cancel',
      regions: {
        allDistricts: 'All districts',
        allCampuses: 'All campuses',
        hangzhou: 'Hangzhou'
      },
      primaryFilters: {
        type: 'Type',
        campus: 'Campus',
        university: 'University',
        service: 'Service',
        format: 'Format'
      },
      secondaryFilters: {
        price: 'Price',
        sort: 'Sort'
      },
      quickPresets: {
        budget: 'Budget',
        under500: 'Under 500 RMB',
        under300: 'Under 300 RMB',
        airportPickup: 'Airport pickup',
        hsk: 'HSK / IELTS prep',
        freeStuff: 'Free stuff'
      },
      priceRanges: {
        any: 'Any price',
        upTo2500: 'Up to 2500 RMB',
        from2500to4000: '2500-4000 RMB',
        above4000: '4000+ RMB',
        upTo1000: 'Up to 1000 RMB',
        from1000to3000: '1000-3000 RMB',
        above3000: '3000+ RMB',
        upTo500: 'Up to 500 RMB',
        from500to1500: '500-1500 RMB',
        above1500: '1500+ RMB',
        upTo300: 'Up to 300 RMB',
        from300to1000: '300-1000 RMB',
        upTo150: 'Up to 150 RMB',
        from150to300: '150-300 RMB',
        above300: '300+ RMB',
        upTo100: 'Up to 100 RMB',
        from100to300: '100-300 RMB'
      },
      featuredCards: {
        housing: [
          { title: 'Private rooms', caption: 'Best for quiet solo living' },
          { title: 'Shared flats', caption: 'Lower monthly budget with roommates' },
          { title: 'Short-term sublets', caption: 'Good for move-ins and semester transitions' }
        ],
        electronics: [
          { title: 'Phones', caption: 'Daily-use upgrades without retail prices' },
          { title: 'Laptops', caption: 'For classes, coding, and project work' },
          { title: 'Audio', caption: 'Study-friendly headphones, speakers, and sound gear' }
        ],
        transport: [
          { title: 'Bikes', caption: 'Reliable campus commute' },
          { title: 'E-bikes', caption: 'Better for longer Hangzhou routes' },
          { title: 'Ride-sharing', caption: 'Flexible transport without owning a vehicle' }
        ],
        items: [
          { title: 'Dorm essentials', caption: 'Move in faster with the basics covered' },
          { title: 'Kitchenware', caption: 'Useful sets for student apartments' },
          { title: 'Small appliances', caption: 'Everyday extras for easier living' }
        ],
        services: [
          { title: 'Translation & paperwork', caption: 'Banks, forms, hospital visits' },
          { title: 'Airport pickup', caption: 'Easy arrival support for new students' },
          { title: 'Tech setup', caption: 'Devices, apps, and everyday account setup help' }
        ],
        study: [
          { title: 'Tutoring', caption: 'Language and subject support' },
          { title: 'Textbooks', caption: 'Find used study materials fast' },
          { title: 'Study notes', caption: 'Shared materials for classes and revision' }
        ],
        other: [
          { title: 'Other items', caption: 'Items that do not fit standard categories' },
          { title: 'Free stuff', caption: 'Useful giveaways from students' },
          { title: 'Collectibles', caption: 'Unique hobby and collectible finds' }
        ]
      }
    },
    results: {
      navTitle: 'Results',
      searchPlaceholderPrefix: 'Search within ',
      listingsSuffix: ' listings',
      sortTitle: 'Sort',
      locationTitle: 'Location',
      universityTitle: 'University',
      reset: 'Reset',
      priceFrom: 'Price from',
      priceTo: 'Price to',
      promotedBadge: '✦ Promoted',
      sellerProBadge: 'Seller Pro',
      emptyTitle: 'No matching listings',
      emptyCopy: 'Try a wider price range, another campus, or clear the filters.'
    },
    profile: {
      headerTitle: 'Profile',
      heroEyebrow: 'Account hub',
      proActive: 'Pro active',
      heroNote: 'Open your public profile to preview exactly what buyers see, then edit it there.',
      previewHint: 'Tap avatar to open your public profile',
      statsListings: 'Listings',
      statsSaved: 'Saved',
      statsSold: 'Sold',
      publicProfileTitle: 'Public profile',
      publicProfileSubtitle: 'Open the exact version buyers see, then edit it from there',
      openPublicProfileTitle: 'Open my public profile',
      openPublicProfileCopy: 'Preview your profile exactly as other students see it and edit it there.',
      openListingsTitle: 'Open my listings',
      openListingsCopy: 'Check what is currently live under your seller profile.',
      settingsTitle: 'Settings',
      settingsCopy: 'Language, admin access, and extra account controls live on a separate page.',
      sellerProTitle: '✦ Upgrade to Seller Pro',
      sellerProLead: 'Turn your profile into a stronger storefront for serious buyers.',
      sellerProBenefitOne: 'Stand out higher in the feed with a more trusted Seller Pro presence.',
      sellerProBenefitTwo: 'See profile views and saves so you know which listings actually attract demand.',
      sellerProBenefitThree: 'Publish with up to 10 photos, a custom badge, and faster support when you need help.',
      sellerProOffer: '79 RMB / month',
      sellerProPriceLabel: '79 RMB / month',
      aboutTitle: 'About UniMarket',
      aboutSubtitle: 'What this MVP is optimized for right now',
      brandNote: 'Hangzhou student marketplace',
      brandStatus: 'Student-first',
      aboutCardTitle: 'Built for student housing, resales, transport, and quick local help',
      aboutCardCopy: 'UniMarket keeps the flow simple inside WeChat so students can browse faster, post quicker, and connect with more trust inside one familiar campus marketplace.',
      highlightOne: 'WeChat Mini Program',
      highlightTwo: 'Hangzhou MVP',
      highlightThree: 'Production API live'
    },
    messages: {
      headerTitle: 'My Listings',
      heroTitle: 'My Listings',
      heroNote: 'Track everything you have posted and keep your active marketplace inventory in one place.',
      sectionTitle: 'Your listings',
      sectionSubtitle: 'Open, mark as sold, edit, or remove any listing you created.',
      newButton: 'New',
      noActiveTitle: 'No active listings',
      noActiveCopy: 'Post your first room, item, or service with the New button above.',
      archiveTitle: 'Archive',
      openButton: 'Open',
      soldStatus: 'Sold',
      archivedStatus: 'Archived',
      hiddenStatus: 'Hidden',
      liveStatus: 'Live',
      listAgainButton: 'List again',
      restoreButton: 'Restore',
      markSoldButton: 'Mark sold',
      featuredButton: 'Featured',
      requestedButton: 'Requested',
      promoteButton: 'Promote',
      editButton: 'Edit',
      deleteButton: 'Delete',
      promotedBadge: '✦ Promoted',
      promotionPendingBadge: 'Promotion request pending',
      soldOnUniMarketOption: 'Sold on UniMarket',
      soldElsewhereOption: 'Sold somewhere else',
      saleSourceUniMarket: 'Sale source: UniMarket',
      saleSourceOutside: 'Sale source: outside UniMarket'
    },
    languages: {
      en: {
        title: 'English',
        description: 'Use the app interface in English.'
      },
      zh: {
        title: '简体中文',
        description: 'Use the app interface in Simplified Chinese.'
      },
      ru: {
        title: 'Русский',
        description: 'Use the app interface in Russian.'
      }
    }
  },
  zh: {
    common: {
      allLocations: '全部地点',
      allUniversities: '全部大学',
      allCategories: '全部分类',
      sortOptions: ['最新发布', '价格从低到高', '价格从高到低'],
      current: '当前',
      switch: '切换',
      open: '打开',
      enter: '输入',
      active: '已开启',
      locked: '已锁定',
      remove: '移除',
      clear: '清空',
      delete: '删除',
      request: '申请',
      connect: '联系',
      later: '稍后',
      saved: '已收藏',
      removed: '已移除'
    },
    tabBar: {
      search: '搜索',
      saved: '收藏',
      post: '发布',
      listings: '我的发布',
      profile: '我的'
    },
    market: {
      categories: {
        all: '全部',
        items: '日用品',
        electronics: '电子产品',
        transport: '出行',
        study: '学习',
        services: '服务',
        other: '其他',
        housing: '住房'
      },
      conditions: {
        Used: '已使用',
        'Like new': '几乎全新',
        New: '全新',
        Refurbished: '翻新',
        'For parts': '零件机'
      },
      badges: {
        'Seller Pro': 'Seller Pro',
        'Verified student': '已认证学生',
        'Student seller': '学生卖家',
        'Community member': '社区成员',
        'Founder, UniMarket': 'UniMarket 创始人'
      },
      cities: {
        Hangzhou: '杭州'
      },
      subcategories: {
        'Other (type your own)': '其他（自定义）',
        General: '通用',
        'Private room': '独立房间',
        'Shared room': '合住房间',
        'Shared flat': '合租公寓',
        Studio: '单间公寓',
        'Full apartment': '整租公寓',
        'Short-term sublet': '短租转租',
        'Dorm takeover': '宿舍接手',
        Phones: '手机',
        Laptops: '笔记本电脑',
        Tablets: '平板',
        Audio: '音频设备',
        Cameras: '相机',
        'Gaming gear': '游戏设备',
        Accessories: '配件',
        Bikes: '自行车',
        'E-bikes': '电动车',
        Scooters: '滑板车',
        'Ride-sharing': '拼车',
        Rentals: '租赁',
        'Parts & repair': '配件与维修',
        'Dorm essentials': '宿舍必需品',
        Kitchenware: '厨具',
        Clothing: '服饰',
        'Bags & luggage': '箱包',
        'Home decor': '家居装饰',
        'Small appliances': '小家电',
        Bundles: '组合出售',
        'Translation & paperwork': '翻译与手续',
        'Airport pickup': '机场接送',
        'Moving help': '搬家帮助',
        'Photo shoots': '拍摄服务',
        'Tech setup': '设备安装',
        'Errands & delivery': '跑腿与配送',
        'Cleaning help': '清洁帮助',
        Tutoring: '辅导',
        Textbooks: '教材',
        'Study notes': '学习笔记',
        'Language exchange': '语言交换',
        'HSK / IELTS prep': 'HSK / IELTS 备考',
        Stationery: '文具',
        'Study groups': '学习小组',
        'Other items': '其他物品',
        'Free stuff': '免费物品',
        Collectibles: '收藏品',
        'Hobby gear': '兴趣装备',
        'Sports gear': '运动装备',
        'Beauty & care': '美妆护理',
        'Pet supplies': '宠物用品'
      }
    },
    create: {
      cardPhotos: '照片',
      photoHintTemplate: '最多 {count} 张 · 第一张为封面',
      photoSubhint: '点击照片可预览，使用箭头调整顺序。',
      addPhoto: '添加照片',
      cover: '封面',
      cardBasics: '基础信息',
      cardBasicsHint: '你要发布什么？',
      titleLabel: '标题',
      titlePlaceholder: '校区附近房间、iPhone 14、自行车……',
      priceLabel: '价格',
      locationLabel: '地点',
      addressLabel: '地址',
      addressPlaceholder: '西溪校区，余杭塘路 866 号，3 号楼',
      categoryLabel: '分类',
      subcategoryLabel: '子分类',
      customSubcategoryLabel: '自定义子分类',
      customSubcategoryPlaceholder: '输入你自己的子分类',
      conditionLabel: '成色',
      cardContact: '联系方式',
      cardContactHint: '买家应该怎样联系你？',
      universityLabel: '学校',
      wechatLabel: '微信号',
      wechatPlaceholder: 'wechatid（6-20 个字符）',
      wechatLockedHint: '该字段会与个人主页同步，只能在个人主页里修改。',
      cardDescription: '描述',
      cardDescriptionHint: '补充成色、时间、取货说明或其他细节',
      descriptionPlaceholder: '用能让其他学生快速信任的信息来描述这个商品、服务或房间。',
      closeSheet: '取消',
      restore: '恢复',
      discard: '丢弃',
      ok: '确定',
      yes: '是',
      no: '否',
      newNavTitle: '新建发布',
      editNavTitle: '编辑发布',
      newHeroTitle: '发布新的内容',
      newHeroCopy: '把对杭州学生有用的东西分享出来，直接发布到这个 MVP 里。',
      newHeroChip: '实时预览流程',
      editHeroTitle: '编辑你的发布',
      editHeroCopy: '更新标题、价格、分类和细节，让你的发布在市场里始终清晰、及时。',
      editHeroChip: '编辑模式',
      publishLabel: '发布',
      saveChangesLabel: '保存修改'
    },
    settings: {
      headerTitle: '设置',
      heroEyebrow: '设置',
      heroTitle: '在一个页面里管理语言、主题和管理员权限',
      heroCopy: '先选择你想使用的界面语言，再调整外观和审核权限。',
      languageSectionTitle: '语言',
      languageSectionSubtitle: '选择主界面使用的语言。',
      currentLanguageLabel: '当前语言',
      languageSavedCopy: '已保存在当前设备上，并会应用到标签栏、主要页面、提示和弹窗文案。',
      appearanceSectionTitle: '外观',
      appearanceSectionSubtitle: '选择 Profile 和 Settings 页面当前的显示方式。',
      currentThemeLabel: '当前主题',
      currentThemeCopy: '已保存在当前设备上，并已应用到 Profile、Settings、页头和个人页标签栏。',
      lightThemeTitle: '浅色模式',
      lightThemeCopy: '保持应用当前明亮、简洁的中性色风格。',
      darkThemeTitle: '深色模式',
      darkThemeCopy: '使用更深的背景和更亮的文字，减少夜间使用时的眩光。',
      themeLight: '浅色',
      themeDark: '深色',
      adminSectionTitle: '管理员',
      adminAccessTitle: '管理员权限',
      adminAccessCopy: '开启管理员模式后，可以进入审核面板并处理举报和 Seller Pro 请求。',
      adminActiveSubtitle: '此设备上的管理员模式已开启。',
      adminLockedSubtitle: '此设备上的管理员模式当前已锁定。',
      adminOpenTitle: '打开管理面板',
      adminOpenCopy: '进入审核工具，处理举报、商品和 Seller Pro 请求。',
      adminExitTitle: '退出管理员模式',
      adminExitCopy: '关闭此设备上的管理员模式，并隐藏审核入口。',
      adminExitMeta: '关闭',
      adminUnlockTitle: '解锁管理员权限',
      adminUnlockCopy: '输入管理员代码以解锁此设备上的审核工具。'
    },
    home: {
      headerTitle: 'UniMarket',
      heroTitle: '找到学生生活真正需要的东西。',
      heroSubtitle: '在一个地方浏览住房、出行、服务和校园日常用品。',
      heroChip: '杭州',
      searchPlaceholder: '搜索商品',
      sectionTitle: '最新发布',
      sectionSubtitle: '来自学生社区的新鲜帖子',
      emptyTitle: '没有找到结果',
      emptyCopy: '试试其他分类，或调整搜索条件。',
      filterTitle: '快捷筛选',
      filterReset: '重置',
      locationLabel: '地点',
      universityLabel: '学校',
      sortLabel: '排序',
      promotedBadge: '✦ 推广中',
      sellerProBadge: 'Seller Pro'
    },
    favorites: {
      headerTitle: '收藏',
      pageTitle: '收藏',
      pageCopy: '你收藏的商品会保存在这里，方便快速查看。',
      sortTitle: '排序',
      categoryTitle: '分类',
      removeUnavailableTitle: '移除失效内容',
      clearSavedTitle: '清空收藏',
      clearSavedCopy: '从此设备移除全部收藏',
      noMatchesTitle: '当前筛选下没有结果',
      noMatchesCopy: '试试其他分类或更换排序方式。',
      emptyTitle: '还没有收藏',
      emptyCopy: '点击商品上的爱心，就能把它保存在这里。',
      promotedBadge: '✦ 推广中'
    },
    userProfile: {
      navSellerProfile: '卖家主页',
      navMyProfile: '我的主页',
      navSellerHidden: '卖家已隐藏',
      navProfileUnavailable: '主页不可用',
      wechatLabel: '微信',
      statsNew: '新用户',
      statsRating: '评分',
      statsListings: '发布',
      statsSold: '已售',
      analyticsTitle: 'Seller Pro 数据',
      analyticsSubtitle: '查看有多少学生打开你的主页并收藏你的发布',
      analyticsProfileViews: '主页浏览',
      analyticsListingSaves: '发布收藏',
      thisWeekSuffix: '本周',
      editProfileButton: '编辑主页',
      contactSellerButton: '去微信联系',
      reviewedButton: '已评价',
      leaveReviewButton: '留下评价',
      editSectionTitle: '编辑主页',
      editSectionSubtitle: '更新其他学生能看到的公开信息',
      changePhotoButton: '更换照片',
      removePhotoButton: '移除',
      nameLabel: '昵称',
      nameHint: '名称会和你的账户身份保持同步，方便维持主页和 Seller Pro 状态。',
      universityLabel: '学校',
      wechatFieldLabel: '微信号',
      wechatPlaceholder: 'wechatid（6-20 个字符）',
      bioLabel: '简介',
      cancelButton: '取消',
      saveChangesButton: '保存修改',
      yourRatingTitle: '你的评分',
      sellerRatingTitle: '卖家评分',
      noWrittenNote: '没有文字评价',
      noReviewsTitle: '还没有评价',
      noReviewsCopy: '买家在微信联系你后，可以邀请他们留下评价。',
      yourListingsTitle: '你的发布',
      listingsByPrefix: '来自 ',
      activeSuffix: '个展示中',
      promotedBadge: '✦ 推广中',
      noActiveListingsTitle: '暂无展示中的发布',
      noActiveListingsCopy: '这位卖家目前没有可见的发布。',
      myProfileOptionsTitle: '我的主页选项',
      myProfileOptionsSubtitle: '分享你的主页，或直接进入编辑模式。',
      profileOptionsTitle: '主页选项',
      profileOptionsSubtitle: '分享这个卖家主页，或向审核团队发送举报。',
      shareProfileTitle: '分享主页',
      shareOwnProfileMeta: '在微信里发送你的主页',
      shareSellerProfileMeta: '在微信里发送这个卖家主页',
      copyLinkTitle: '复制链接',
      copyLinkMeta: '把主页路径复制到剪贴板',
      editProfileMenuTitle: '编辑主页',
      editProfileMenuMeta: '更新头像、名称、学校、微信号和简介',
      writeInWechatTitle: '去微信联系',
      writeInWechatMeta: '复制卖家微信号，然后去微信搜索继续联系',
      blockUserTitle: '屏蔽用户',
      blockUserMeta: '在此设备上隐藏该卖家的所有发布',
      reportSentTitle: '举报已发送',
      reportSentMeta: '审核团队已经收到了你的举报',
      reportProfileTitle: '举报主页',
      reportProfileMeta: '虚假身份、垃圾信息、诈骗或有害行为',
      menuCancel: '取消',
      universitySheetTitle: '学校',
      universitySheetClose: '关闭',
      sellerHiddenTitle: '卖家已隐藏',
      sellerHiddenCopy: '你已在当前设备上屏蔽该卖家，因此这里不再显示他们的主页和发布。',
      profileUnavailableTitle: '主页不可用',
      profileUnavailableCopy: '我们已找不到这个卖家的主页。',
      reviewerFallback: 'UniMarket 用户'
    },
    listing: {
      navListing: '商品详情',
      navListingHidden: '发布已隐藏',
      navListingUnavailable: '发布不可用',
      navSellerHidden: '卖家已隐藏',
      soldBadge: '已售',
      archivedStatus: '已归档',
      hiddenBadge: '已隐藏',
      promotedBadge: '✦ 推广中',
      locationLabel: '地点',
      universityLabel: '学校',
      addressLabel: '地址',
      copyAddress: '复制地址',
      analyticsTitle: 'Seller Pro 数据',
      analyticsSubtitle: '只有你能看到这条发布的表现',
      analyticsViews: '浏览',
      analyticsSaved: '收藏',
      thisWeekSuffix: '本周',
      noReviewsYet: '还没有评价',
      savedButton: '已收藏',
      saveButton: '收藏',
      writeInWechatButton: '去微信联系',
      listingOptionsTitle: '发布选项',
      listingOptionsSubtitle: '分享这条发布，或向审核团队发送举报。',
      shareListingTitle: '分享发布',
      shareListingMeta: '在微信中发送链接',
      copyLinkTitle: '复制链接',
      copyLinkMeta: '把发布路径复制到剪贴板',
      writeInWechatTitle: '去微信联系',
      writeInWechatMeta: '复制卖家微信号，然后去微信搜索继续联系',
      hideListingTitle: '隐藏发布',
      hideListingMeta: '从你当前设备上的信息流中移除',
      blockUserTitle: '屏蔽用户',
      blockUserMeta: '在此设备上隐藏该卖家的所有发布',
      reportSentTitle: '举报已发送',
      reportSentMeta: '审核团队已经收到了你的举报',
      reportListingTitle: '举报发布',
      reportListingMeta: '诈骗、分类错误或违禁物品',
      menuCancel: '取消',
      emptyHiddenTitle: '发布已隐藏',
      emptyHiddenCopy: '你已在当前设备上隐藏这条发布，因此它不会再出现在你的市场信息流里。',
      emptySellerHiddenTitle: '卖家已隐藏',
      emptySellerHiddenCopy: '你已在当前设备上屏蔽该卖家，因此这里不再显示他们的发布。',
      emptyUnavailableTitle: '发布不可用',
      emptyUnavailableCopy: '这条发布在审核后已被隐藏。',
      emptyNotFoundTitle: '未找到该发布',
      emptyNotFoundCopy: '这条发布已不可用，或者链接已经过期。',
      backToListings: '返回列表',
      newSeller: '新卖家',
      seller: '卖家',
      proSeller: 'Pro 卖家'
    },
    categoryPage: {
      navTitle: '分类',
      openDetailedFilters: '打开详细筛选',
      allOption: '全部',
      selectOption: '选择选项',
      noListingsFound: '没有找到发布',
      showOneListing: '显示 1 条发布',
      showManyListingsPrefix: '显示 ',
      showManyListingsSuffix: ' 条发布',
      panelExplorePrefix: '探索',
      panelSeeAll: '查看全部 →',
      featuredTitle: '推荐',
      featuredBadge: '新',
      sheetCancel: '取消',
      regions: {
        allDistricts: '全部区域',
        allCampuses: '全部校区',
        hangzhou: '杭州'
      },
      primaryFilters: {
        type: '类型',
        campus: '校区',
        university: '学校',
        service: '服务',
        format: '形式'
      },
      secondaryFilters: {
        price: '价格',
        sort: '排序'
      },
      quickPresets: {
        budget: '预算友好',
        under500: '500 RMB 以下',
        under300: '300 RMB 以下',
        airportPickup: '机场接送',
        hsk: 'HSK / IELTS 备考',
        freeStuff: '免费物品'
      },
      priceRanges: {
        any: '不限价格',
        upTo2500: '2500 RMB 以下',
        from2500to4000: '2500-4000 RMB',
        above4000: '4000 RMB 以上',
        upTo1000: '1000 RMB 以下',
        from1000to3000: '1000-3000 RMB',
        above3000: '3000 RMB 以上',
        upTo500: '500 RMB 以下',
        from500to1500: '500-1500 RMB',
        above1500: '1500 RMB 以上',
        upTo300: '300 RMB 以下',
        from300to1000: '300-1000 RMB',
        upTo150: '150 RMB 以下',
        from150to300: '150-300 RMB',
        above300: '300 RMB 以上',
        upTo100: '100 RMB 以下',
        from100to300: '100-300 RMB'
      },
      featuredCards: {
        housing: [
          { title: '独立房间', caption: '适合需要安静独居空间的学生' },
          { title: '合租公寓', caption: '和室友分摊，月租更友好' },
          { title: '短租转租', caption: '适合入住过渡和学期衔接' }
        ],
        electronics: [
          { title: '手机', caption: '日常升级，不用承受零售价' },
          { title: '笔记本电脑', caption: '适合上课、编程和项目使用' },
          { title: '音频设备', caption: '适合学习的耳机、音箱和音响设备' }
        ],
        transport: [
          { title: '自行车', caption: '可靠的校园通勤选择' },
          { title: '电动车', caption: '更适合杭州的长距离路线' },
          { title: '拼车', caption: '灵活出行，无需自己拥有车辆' }
        ],
        items: [
          { title: '宿舍必需品', caption: '快速入住，把基础用品一次配齐' },
          { title: '厨具', caption: '适合学生公寓的实用套装' },
          { title: '小家电', caption: '让日常生活更方便的常用小物' }
        ],
        services: [
          { title: '翻译与手续', caption: '银行、表格、医院陪同等' },
          { title: '机场接送', caption: '给新生更轻松的到达支持' },
          { title: '设备安装', caption: '设备、应用和日常账号设置帮助' }
        ],
        study: [
          { title: '辅导', caption: '语言和学科支持' },
          { title: '教材', caption: '更快找到二手学习资料' },
          { title: '学习笔记', caption: '课程和复习共享资料' }
        ],
        other: [
          { title: '其他物品', caption: '不适合标准分类的东西都在这里' },
          { title: '免费物品', caption: '学生分享的实用赠送物品' },
          { title: '收藏品', caption: '独特的兴趣与收藏发现' }
        ]
      }
    },
    results: {
      navTitle: '结果',
      searchPlaceholderPrefix: '在以下分类中搜索：',
      listingsSuffix: ' 条发布',
      sortTitle: '排序',
      locationTitle: '地点',
      universityTitle: '学校',
      reset: '重置',
      priceFrom: '最低价格',
      priceTo: '最高价格',
      promotedBadge: '✦ 推广中',
      sellerProBadge: 'Seller Pro',
      emptyTitle: '没有匹配的发布',
      emptyCopy: '试试扩大价格范围、切换校区，或清空筛选条件。'
    },
    profile: {
      headerTitle: '我的',
      heroEyebrow: '账号中心',
      proActive: 'Pro 已开启',
      heroNote: '打开你的公开主页，预览买家看到的样子，然后在那里编辑。',
      previewHint: '点击头像打开你的公开主页',
      statsListings: '发布中',
      statsSaved: '收藏',
      statsSold: '已售',
      publicProfileTitle: '公开主页',
      publicProfileSubtitle: '打开买家看到的完整版本，然后从那里进行编辑',
      openPublicProfileTitle: '打开我的公开主页',
      openPublicProfileCopy: '预览其他学生看到的主页样子，并直接在那里编辑。',
      openListingsTitle: '查看我的发布',
      openListingsCopy: '查看当前在你的卖家主页下展示的内容。',
      settingsTitle: '设置',
      settingsCopy: '语言、管理员权限和更多账号控制都在单独的页面里。',
      sellerProTitle: '✦ 升级到 Seller Pro',
      sellerProLead: '把你的主页升级成更容易成交的专业卖家门面。',
      sellerProBenefitOne: '让你的主页更显眼、更容易被注意，也更容易获得买家信任。',
      sellerProBenefitTwo: '查看主页浏览和收藏数据，知道哪些发布真正更受欢迎。',
      sellerProBenefitThree: '享受最多 10 张照片、自定义徽章，以及更快的优先支持。',
      sellerProOffer: '79 RMB / 月',
      sellerProPriceLabel: '79 RMB / 月',
      aboutTitle: '关于 UniMarket',
      aboutSubtitle: '这个 MVP 当前重点优化的方向',
      brandNote: '杭州学生二手与服务市场',
      brandStatus: '以学生为先',
      aboutCardTitle: '为学生租房、二手转卖、出行和本地互助而打造',
      aboutCardCopy: 'UniMarket 在微信里保持简洁流程，让学生更快浏览、更快发布，并在熟悉的校园市场中更安心地联系彼此。',
      highlightOne: '微信小程序',
      highlightTwo: '杭州 MVP',
      highlightThree: '生产 API 已上线'
    },
    messages: {
      headerTitle: '我的发布',
      heroTitle: '我的发布',
      heroNote: '把你发布过的内容统一管理，随时查看当前正在市场里展示的库存。',
      sectionTitle: '你的发布',
      sectionSubtitle: '打开、标记已售、编辑或删除你创建的任何发布。',
      newButton: '新建',
      noActiveTitle: '暂无正在展示的发布',
      noActiveCopy: '点击上方“新建”，发布你的第一个房源、商品或服务。',
      archiveTitle: '归档',
      openButton: '打开',
      soldStatus: '已售',
      archivedStatus: '已归档',
      hiddenStatus: '已隐藏',
      liveStatus: '展示中',
      listAgainButton: '重新上架',
      restoreButton: '恢复发布',
      markSoldButton: '标记已售',
      featuredButton: '已推广',
      requestedButton: '已申请',
      promoteButton: '推广',
      editButton: '编辑',
      deleteButton: '删除',
      promotedBadge: '✦ 推广中',
      promotionPendingBadge: '推广申请审核中',
      soldOnUniMarketOption: '在 UniMarket 售出',
      soldElsewhereOption: '在其他地方售出',
      saleSourceUniMarket: '成交来源：UniMarket',
      saleSourceOutside: '成交来源：站外'
    },
    languages: {
      en: {
        title: 'English',
        description: '将应用界面显示为英文。'
      },
      zh: {
        title: '简体中文',
        description: '将应用界面显示为简体中文。'
      },
      ru: {
        title: 'Русский',
        description: '将应用界面显示为俄文。'
      }
    }
  },
  ru: {
    common: {
      allLocations: 'Все локации',
      allUniversities: 'Все университеты',
      allCategories: 'Все категории',
      sortOptions: ['Сначала новые', 'Цена: по возрастанию', 'Цена: по убыванию'],
      current: 'Текущий',
      switch: 'Выбрать',
      open: 'Открыть',
      enter: 'Ввести',
      active: 'Активно',
      locked: 'Закрыто',
      remove: 'Убрать',
      clear: 'Очистить',
      delete: 'Удалить',
      request: 'Запрос',
      connect: 'Связаться',
      later: 'Позже',
      saved: 'Сохранено',
      removed: 'Убрано'
    },
    tabBar: {
      search: 'Поиск',
      saved: 'Избранное',
      post: 'Создать',
      listings: 'Объявления',
      profile: 'Профиль'
    },
    market: {
      categories: {
        all: 'Все',
        items: 'Товары',
        electronics: 'Электроника',
        transport: 'Транспорт',
        study: 'Учёба',
        services: 'Услуги',
        other: 'Другое',
        housing: 'Жильё'
      },
      conditions: {
        Used: 'Б/у',
        'Like new': 'Почти новый',
        New: 'Новый',
        Refurbished: 'Восстановленный',
        'For parts': 'На запчасти'
      },
      badges: {
        'Seller Pro': 'Seller Pro',
        'Verified student': 'Проверенный студент',
        'Student seller': 'Студент-продавец',
        'Community member': 'Участник сообщества',
        'Founder, UniMarket': 'Основатель UniMarket'
      },
      cities: {
        Hangzhou: 'Ханчжоу'
      },
      subcategories: {
        'Other (type your own)': 'Другое (ввести своё)',
        General: 'Общее',
        'Private room': 'Отдельная комната',
        'Shared room': 'Комната с соседом',
        'Shared flat': 'Совместная квартира',
        Studio: 'Студия',
        'Full apartment': 'Целая квартира',
        'Short-term sublet': 'Краткосрочная субаренда',
        'Dorm takeover': 'Переоформление общежития',
        Phones: 'Телефоны',
        Laptops: 'Ноутбуки',
        Tablets: 'Планшеты',
        Audio: 'Аудио',
        Cameras: 'Камеры',
        'Gaming gear': 'Игровая техника',
        Accessories: 'Аксессуары',
        Bikes: 'Велосипеды',
        'E-bikes': 'Электробайки',
        Scooters: 'Самокаты',
        'Ride-sharing': 'Совместные поездки',
        Rentals: 'Аренда',
        'Parts & repair': 'Запчасти и ремонт',
        'Dorm essentials': 'Для общежития',
        Kitchenware: 'Кухонные принадлежности',
        Clothing: 'Одежда',
        'Bags & luggage': 'Сумки и багаж',
        'Home decor': 'Декор для дома',
        'Small appliances': 'Мелкая техника',
        Bundles: 'Наборы',
        'Translation & paperwork': 'Перевод и документы',
        'Airport pickup': 'Встреча в аэропорту',
        'Moving help': 'Помощь с переездом',
        'Photo shoots': 'Фотосъёмка',
        'Tech setup': 'Настройка техники',
        'Errands & delivery': 'Поручения и доставка',
        'Cleaning help': 'Помощь с уборкой',
        Tutoring: 'Репетиторство',
        Textbooks: 'Учебники',
        'Study notes': 'Конспекты',
        'Language exchange': 'Языковой обмен',
        'HSK / IELTS prep': 'Подготовка к HSK / IELTS',
        Stationery: 'Канцтовары',
        'Study groups': 'Учебные группы',
        'Other items': 'Другие вещи',
        'Free stuff': 'Бесплатно',
        Collectibles: 'Коллекции',
        'Hobby gear': 'Товары для хобби',
        'Sports gear': 'Спорттовары',
        'Beauty & care': 'Красота и уход',
        'Pet supplies': 'Товары для питомцев'
      }
    },
    create: {
      cardPhotos: 'Фотографии',
      photoHintTemplate: 'До {count} фото · первое будет обложкой',
      photoSubhint: 'Нажмите на фото для предпросмотра. Используйте стрелки, чтобы поменять порядок.',
      addPhoto: 'Добавить фото',
      cover: 'Обложка',
      cardBasics: 'Основное',
      cardBasicsHint: 'Что вы предлагаете?',
      titleLabel: 'Заголовок',
      titlePlaceholder: 'Комната рядом с кампусом, iPhone 14, велосипед...',
      priceLabel: 'Цена',
      locationLabel: 'Локация',
      addressLabel: 'Адрес',
      addressPlaceholder: 'Кампус Сиси, Yuhangtang Rd 866, корпус 3',
      categoryLabel: 'Категория',
      subcategoryLabel: 'Подкатегория',
      customSubcategoryLabel: 'Своя подкатегория',
      customSubcategoryPlaceholder: 'Введите свою подкатегорию',
      conditionLabel: 'Состояние',
      cardContact: 'Контакт',
      cardContactHint: 'Как покупателям вас найти?',
      universityLabel: 'Университет',
      wechatLabel: 'WeChat ID',
      wechatPlaceholder: 'wechatid (6-20 символов)',
      wechatLockedHint: 'Поле синхронизируется с профилем. Менять его можно только на странице профиля.',
      cardDescription: 'Описание',
      cardDescriptionHint: 'Добавьте состояние, время, детали самовывоза и другие нюансы',
      descriptionPlaceholder: 'Опишите товар, услугу или комнату так, чтобы другой студент быстро понял, что вам можно доверять.',
      closeSheet: 'Отмена',
      restore: 'Восстановить',
      discard: 'Не восстанавливать',
      ok: 'ОК',
      yes: 'Да',
      no: 'Нет',
      newNavTitle: 'Новое объявление',
      editNavTitle: 'Редактировать объявление',
      newHeroTitle: 'Создать новое объявление',
      newHeroCopy: 'Поделитесь чем-то полезным для студентов в Ханчжоу и сразу опубликуйте это в MVP.',
      newHeroChip: 'Поток с живым предпросмотром',
      editHeroTitle: 'Редактировать объявление',
      editHeroCopy: 'Обновите заголовок, цену, категорию и детали, чтобы объявление оставалось понятным и актуальным.',
      editHeroChip: 'Режим редактирования',
      publishLabel: 'Опубликовать объявление',
      saveChangesLabel: 'Сохранить изменения'
    },
    settings: {
      headerTitle: 'Настройки',
      heroEyebrow: 'Настройки',
      heroTitle: 'Управляйте языком, темой и доступом администратора в одном месте',
      heroCopy: 'Выберите язык интерфейса, а затем настройте внешний вид и доступ к модерации.',
      languageSectionTitle: 'Язык',
      languageSectionSubtitle: 'Выберите язык интерфейса для основных разделов приложения.',
      currentLanguageLabel: 'Текущий язык',
      languageSavedCopy: 'Сохраняется на этом устройстве и применяется к таббару, основным вкладкам, тостам и текстам модалок.',
      appearanceSectionTitle: 'Внешний вид',
      appearanceSectionSubtitle: 'Выберите, как сейчас должны выглядеть Profile и Settings.',
      currentThemeLabel: 'Текущая тема',
      currentThemeCopy: 'Сохраняется на этом устройстве и уже применяется к Profile, Settings, хедеру и вкладке профиля.',
      lightThemeTitle: 'Светлая тема',
      lightThemeCopy: 'Оставить светлую нейтральную палитру, которую приложение использует сейчас.',
      darkThemeTitle: 'Тёмная тема',
      darkThemeCopy: 'Использовать более тёмные поверхности и более светлый текст для меньшей нагрузки на глаза ночью.',
      themeLight: 'Светлая',
      themeDark: 'Тёмная',
      adminSectionTitle: 'Админ',
      adminAccessTitle: 'Доступ администратора',
      adminAccessCopy: 'Режим администратора открывает панель модерации и управление жалобами и запросами Seller Pro.',
      adminActiveSubtitle: 'Режим администратора активен на этом устройстве.',
      adminLockedSubtitle: 'Режим администратора сейчас заблокирован на этом устройстве.',
      adminOpenTitle: 'Открыть админ-панель',
      adminOpenCopy: 'Перейти к инструментам модерации для жалоб, объявлений и запросов Seller Pro.',
      adminExitTitle: 'Выйти из режима администратора',
      adminExitCopy: 'Выключить режим администратора на этом устройстве и скрыть доступ к модерации.',
      adminExitMeta: 'Выключить',
      adminUnlockTitle: 'Разблокировать админ-доступ',
      adminUnlockCopy: 'Введите код администратора, чтобы открыть инструменты модерации на этом устройстве.'
    },
    home: {
      headerTitle: 'UniMarket',
      heroTitle: 'Находите то, что нужно студентам.',
      heroSubtitle: 'Смотрите жильё, транспорт, услуги и полезные вещи для кампуса в одном месте.',
      heroChip: 'Ханчжоу',
      searchPlaceholder: 'Искать объявления',
      sectionTitle: 'Свежие объявления',
      sectionSubtitle: 'Новые публикации от студенческого сообщества',
      emptyTitle: 'Ничего не найдено',
      emptyCopy: 'Попробуйте другую категорию или скорректируйте поиск.',
      filterTitle: 'Быстрые фильтры',
      filterReset: 'Сбросить',
      locationLabel: 'Локация',
      universityLabel: 'Университет',
      sortLabel: 'Сортировка',
      promotedBadge: '✦ Продвигается',
      sellerProBadge: 'Seller Pro'
    },
    favorites: {
      headerTitle: 'Избранное',
      pageTitle: 'Избранное',
      pageCopy: 'Ваши любимые объявления остаются здесь для быстрого доступа.',
      sortTitle: 'Сортировка',
      categoryTitle: 'Категория',
      removeUnavailableTitle: 'Удалить недоступные',
      clearSavedTitle: 'Очистить избранное',
      clearSavedCopy: 'Удалить все сохранённые объявления с этого устройства',
      noMatchesTitle: 'Для этих фильтров ничего не найдено',
      noMatchesCopy: 'Попробуйте другую категорию или измените сортировку.',
      emptyTitle: 'Пока ничего не сохранено',
      emptyCopy: 'Нажмите на сердечко в объявлении, чтобы сохранить его здесь.',
      promotedBadge: '✦ Продвигается'
    },
    userProfile: {
      navSellerProfile: 'Профиль продавца',
      navMyProfile: 'Мой профиль',
      navSellerHidden: 'Продавец скрыт',
      navProfileUnavailable: 'Профиль недоступен',
      wechatLabel: 'WeChat',
      statsNew: 'Новый',
      statsRating: 'Рейтинг',
      statsListings: 'Объявления',
      statsSold: 'Продано',
      analyticsTitle: 'Аналитика Seller Pro',
      analyticsSubtitle: 'Смотрите, сколько студентов открывают ваш профиль и сохраняют объявления',
      analyticsProfileViews: 'Просмотры профиля',
      analyticsListingSaves: 'Сохранения объявлений',
      thisWeekSuffix: 'за эту неделю',
      editProfileButton: 'Редактировать профиль',
      contactSellerButton: 'Написать в WeChat',
      reviewedButton: 'Отзыв оставлен',
      leaveReviewButton: 'Оставить отзыв',
      editSectionTitle: 'Редактирование профиля',
      editSectionSubtitle: 'Обновите публичную информацию, которую видят другие студенты',
      changePhotoButton: 'Сменить фото',
      removePhotoButton: 'Убрать',
      nameLabel: 'Имя',
      nameHint: 'Имя синхронизируется с вашей учётной записью, чтобы профиль и Seller Pro оставались стабильными.',
      universityLabel: 'Университет',
      wechatFieldLabel: 'WeChat ID',
      wechatPlaceholder: 'wechatid (6-20 символов)',
      bioLabel: 'О себе',
      cancelButton: 'Отмена',
      saveChangesButton: 'Сохранить изменения',
      yourRatingTitle: 'Ваш рейтинг',
      sellerRatingTitle: 'Рейтинг продавца',
      noWrittenNote: 'Без текста',
      noReviewsTitle: 'Пока нет отзывов',
      noReviewsCopy: 'Попросите покупателей оставить отзыв после общения с вами в WeChat.',
      yourListingsTitle: 'Ваши объявления',
      listingsByPrefix: 'Объявления от ',
      activeSuffix: 'активных',
      promotedBadge: '✦ Продвигается',
      noActiveListingsTitle: 'Нет активных объявлений',
      noActiveListingsCopy: 'Сейчас у этого продавца нет видимых объявлений.',
      myProfileOptionsTitle: 'Опции моего профиля',
      myProfileOptionsSubtitle: 'Поделитесь профилем или сразу перейдите к редактированию.',
      profileOptionsTitle: 'Опции профиля',
      profileOptionsSubtitle: 'Поделитесь профилем продавца или отправьте жалобу на модерацию.',
      shareProfileTitle: 'Поделиться профилем',
      shareOwnProfileMeta: 'Отправить свой профиль в WeChat',
      shareSellerProfileMeta: 'Отправить профиль этого продавца в WeChat',
      copyLinkTitle: 'Скопировать ссылку',
      copyLinkMeta: 'Скопировать путь к профилю в буфер обмена',
      editProfileMenuTitle: 'Редактировать профиль',
      editProfileMenuMeta: 'Обновить фото, имя, университет, WeChat и описание',
      writeInWechatTitle: 'Написать в WeChat',
      writeInWechatMeta: 'Скопировать ID продавца и продолжить в поиске WeChat',
      blockUserTitle: 'Заблокировать пользователя',
      blockUserMeta: 'Скрыть все объявления этого продавца на этом устройстве',
      reportSentTitle: 'Жалоба уже отправлена',
      reportSentMeta: 'У модерации уже есть ваша жалоба',
      reportProfileTitle: 'Пожаловаться на профиль',
      reportProfileMeta: 'Поддельная личность, спам, мошенничество или вредное поведение',
      menuCancel: 'Отмена',
      universitySheetTitle: 'Университет',
      universitySheetClose: 'Закрыть',
      sellerHiddenTitle: 'Продавец скрыт',
      sellerHiddenCopy: 'Вы заблокировали этого продавца на этом устройстве, поэтому его профиль и объявления здесь больше не видны.',
      profileUnavailableTitle: 'Профиль недоступен',
      profileUnavailableCopy: 'Нам больше не удаётся найти этот профиль продавца.',
      reviewerFallback: 'Пользователь UniMarket'
    },
    listing: {
      navListing: 'Объявление',
      navListingHidden: 'Объявление скрыто',
      navListingUnavailable: 'Объявление недоступно',
      navSellerHidden: 'Продавец скрыт',
      soldBadge: 'Продано',
      archivedStatus: 'В архиве',
      hiddenBadge: 'Скрыто',
      promotedBadge: '✦ Продвигается',
      locationLabel: 'Локация',
      universityLabel: 'Университет',
      addressLabel: 'Адрес',
      copyAddress: 'Скопировать адрес',
      analyticsTitle: 'Аналитика Seller Pro',
      analyticsSubtitle: 'Только вы видите, как работает это объявление',
      analyticsViews: 'Просмотры',
      analyticsSaved: 'Сохранения',
      thisWeekSuffix: 'за эту неделю',
      noReviewsYet: 'Пока нет отзывов',
      savedButton: 'Сохранено',
      saveButton: 'Сохранить',
      writeInWechatButton: 'Написать в WeChat',
      listingOptionsTitle: 'Опции объявления',
      listingOptionsSubtitle: 'Поделитесь объявлением или отправьте жалобу модерации.',
      shareListingTitle: 'Поделиться объявлением',
      shareListingMeta: 'Отправить ссылку в WeChat',
      copyLinkTitle: 'Скопировать ссылку',
      copyLinkMeta: 'Скопировать путь к объявлению в буфер обмена',
      writeInWechatTitle: 'Написать в WeChat',
      writeInWechatMeta: 'Скопировать ID продавца и продолжить в поиске WeChat',
      hideListingTitle: 'Скрыть объявление',
      hideListingMeta: 'Убрать его из вашей ленты на этом устройстве',
      blockUserTitle: 'Заблокировать пользователя',
      blockUserMeta: 'Скрыть все объявления этого продавца на этом устройстве',
      reportSentTitle: 'Жалоба уже отправлена',
      reportSentMeta: 'У модерации уже есть ваша жалоба',
      reportListingTitle: 'Пожаловаться на объявление',
      reportListingMeta: 'Мошенничество, неверная категория или запрещённые товары',
      menuCancel: 'Отмена',
      emptyHiddenTitle: 'Объявление скрыто',
      emptyHiddenCopy: 'Вы скрыли это объявление на этом устройстве, поэтому оно больше не появляется в вашей ленте.',
      emptySellerHiddenTitle: 'Продавец скрыт',
      emptySellerHiddenCopy: 'Вы заблокировали этого продавца на этом устройстве, поэтому его объявления здесь больше не видны.',
      emptyUnavailableTitle: 'Объявление недоступно',
      emptyUnavailableCopy: 'Это объявление было скрыто после модерации.',
      emptyNotFoundTitle: 'Объявление не найдено',
      emptyNotFoundCopy: 'Объявление больше недоступно или ссылка устарела.',
      backToListings: 'Назад к объявлениям',
      newSeller: 'Новый продавец',
      seller: 'Продавец',
      proSeller: 'Pro продавец'
    },
    categoryPage: {
      navTitle: 'Категории',
      openDetailedFilters: 'Открыть подробные фильтры',
      allOption: 'Все',
      selectOption: 'Выберите вариант',
      noListingsFound: 'Объявлений не найдено',
      showOneListing: 'Показать 1 объявление',
      showManyListingsPrefix: 'Показать ',
      showManyListingsSuffix: ' объявлений',
      panelExplorePrefix: 'Изучить ',
      panelSeeAll: 'Смотреть все →',
      featuredTitle: 'Рекомендуем',
      featuredBadge: 'Новое',
      sheetCancel: 'Отмена',
      regions: {
        allDistricts: 'Все районы',
        allCampuses: 'Все кампусы',
        hangzhou: 'Ханчжоу'
      },
      primaryFilters: {
        type: 'Тип',
        campus: 'Кампус',
        university: 'Университет',
        service: 'Услуга',
        format: 'Формат'
      },
      secondaryFilters: {
        price: 'Цена',
        sort: 'Сортировка'
      },
      quickPresets: {
        budget: 'Бюджетно',
        under500: 'До 500 RMB',
        under300: 'До 300 RMB',
        airportPickup: 'Встреча в аэропорту',
        hsk: 'Подготовка к HSK / IELTS',
        freeStuff: 'Бесплатно'
      },
      priceRanges: {
        any: 'Любая цена',
        upTo2500: 'До 2500 RMB',
        from2500to4000: '2500-4000 RMB',
        above4000: '4000+ RMB',
        upTo1000: 'До 1000 RMB',
        from1000to3000: '1000-3000 RMB',
        above3000: '3000+ RMB',
        upTo500: 'До 500 RMB',
        from500to1500: '500-1500 RMB',
        above1500: '1500+ RMB',
        upTo300: 'До 300 RMB',
        from300to1000: '300-1000 RMB',
        upTo150: 'До 150 RMB',
        from150to300: '150-300 RMB',
        above300: '300+ RMB',
        upTo100: 'До 100 RMB',
        from100to300: '100-300 RMB'
      },
      featuredCards: {
        housing: [
          { title: 'Отдельные комнаты', caption: 'Лучше всего для спокойной жизни одному' },
          { title: 'Совместные квартиры', caption: 'Меньше месячный бюджет с соседями' },
          { title: 'Краткосрочная субаренда', caption: 'Удобно для заезда и переходов между семестрами' }
        ],
        electronics: [
          { title: 'Телефоны', caption: 'Повседневные обновления без магазинных цен' },
          { title: 'Ноутбуки', caption: 'Для учёбы, кода и проектов' },
          { title: 'Аудио', caption: 'Наушники, колонки и другая техника для учёбы и отдыха' }
        ],
        transport: [
          { title: 'Велосипеды', caption: 'Надёжный вариант для кампусных поездок' },
          { title: 'Электробайки', caption: 'Лучше подходят для длинных маршрутов по Ханчжоу' },
          { title: 'Совместные поездки', caption: 'Гибкий транспорт без владения своим средством' }
        ],
        items: [
          { title: 'Для общежития', caption: 'Быстрее въезжайте, когда база уже собрана' },
          { title: 'Кухонные принадлежности', caption: 'Полезные наборы для студенческих квартир' },
          { title: 'Мелкая техника', caption: 'Повседневные вещи, которые делают жизнь проще' }
        ],
        services: [
          { title: 'Перевод и документы', caption: 'Банки, формы, поездки в больницу и другое' },
          { title: 'Встреча в аэропорту', caption: 'Простой старт для новых студентов' },
          { title: 'Настройка техники', caption: 'Помощь с устройствами, приложениями и аккаунтами' }
        ],
        study: [
          { title: 'Репетиторство', caption: 'Языковая и предметная поддержка' },
          { title: 'Учебники', caption: 'Быстро находите б/у материалы для учёбы' },
          { title: 'Конспекты', caption: 'Материалы для занятий и подготовки к экзаменам' }
        ],
        other: [
          { title: 'Другие вещи', caption: 'То, что не подходит под стандартные категории' },
          { title: 'Бесплатно', caption: 'Полезные вещи, которыми делятся студенты' },
          { title: 'Коллекции', caption: 'Уникальные находки для хобби и коллекций' }
        ]
      }
    },
    results: {
      navTitle: 'Результаты',
      searchPlaceholderPrefix: 'Искать внутри ',
      listingsSuffix: ' объявлений',
      sortTitle: 'Сортировка',
      locationTitle: 'Локация',
      universityTitle: 'Университет',
      reset: 'Сбросить',
      priceFrom: 'Цена от',
      priceTo: 'Цена до',
      promotedBadge: '✦ Продвигается',
      sellerProBadge: 'Seller Pro',
      emptyTitle: 'Нет подходящих объявлений',
      emptyCopy: 'Попробуйте расширить диапазон цен, выбрать другой кампус или сбросить фильтры.'
    },
    profile: {
      headerTitle: 'Профиль',
      heroEyebrow: 'Центр аккаунта',
      proActive: 'Pro активен',
      heroNote: 'Откройте публичный профиль, чтобы увидеть ровно то, что видят покупатели, и там же его отредактировать.',
      previewHint: 'Нажмите на аватар, чтобы открыть публичный профиль',
      statsListings: 'Объявления',
      statsSaved: 'Сохранено',
      statsSold: 'Продано',
      publicProfileTitle: 'Публичный профиль',
      publicProfileSubtitle: 'Откройте версию, которую видят покупатели, и редактируйте её прямо там',
      openPublicProfileTitle: 'Открыть мой публичный профиль',
      openPublicProfileCopy: 'Посмотрите на профиль глазами других студентов и редактируйте его там же.',
      openListingsTitle: 'Открыть мои объявления',
      openListingsCopy: 'Проверьте, что сейчас видно в вашем профиле продавца.',
      settingsTitle: 'Настройки',
      settingsCopy: 'Язык, админ-доступ и дополнительные элементы управления аккаунтом находятся на отдельной странице.',
      sellerProTitle: '✦ Перейти на Seller Pro',
      sellerProLead: 'Сделайте свой профиль более сильной витриной для серьёзных покупателей.',
      sellerProBenefitOne: 'Выделяйтесь выше в ленте и вызывайте больше доверия благодаря статусу Seller Pro.',
      sellerProBenefitTwo: 'Смотрите просмотры профиля и сохранения, чтобы понимать, какие объявления реально цепляют спрос.',
      sellerProBenefitThree: 'Публикуйте до 10 фото, используйте свой бейдж и получайте более быструю поддержку.',
      sellerProOffer: '79 RMB / месяц',
      sellerProPriceLabel: '79 RMB / месяц',
      aboutTitle: 'О UniMarket',
      aboutSubtitle: 'На что этот MVP сейчас заточен в первую очередь',
      brandNote: 'Маркетплейс для студентов Ханчжоу',
      brandStatus: 'Сначала студенты',
      aboutCardTitle: 'Сделано для студенческого жилья, перепродажи, транспорта и локальной помощи',
      aboutCardCopy: 'UniMarket оставляет процесс внутри WeChat простым, чтобы студенты быстрее искали, быстрее публиковали и общались с большим доверием внутри знакомого кампусного маркетплейса.',
      highlightOne: 'Мини-приложение WeChat',
      highlightTwo: 'MVP для Ханчжоу',
      highlightThree: 'Продакшен API подключен'
    },
    messages: {
      headerTitle: 'Мои объявления',
      heroTitle: 'Мои объявления',
      heroNote: 'Следите за всем, что вы опубликовали, и держите активный инвентарь в одном месте.',
      sectionTitle: 'Ваши объявления',
      sectionSubtitle: 'Открывайте, отмечайте как проданное, редактируйте или удаляйте любое своё объявление.',
      newButton: 'Новое',
      noActiveTitle: 'Нет активных объявлений',
      noActiveCopy: 'Опубликуйте первую комнату, вещь или услугу кнопкой New выше.',
      archiveTitle: 'Архив',
      openButton: 'Открыть',
      soldStatus: 'Продано',
      archivedStatus: 'В архиве',
      hiddenStatus: 'Скрыто',
      liveStatus: 'Активно',
      listAgainButton: 'Опубликовать снова',
      restoreButton: 'Восстановить',
      markSoldButton: 'Отметить как проданное',
      featuredButton: 'Featured',
      requestedButton: 'Запрошено',
      promoteButton: 'Продвинуть',
      editButton: 'Редактировать',
      deleteButton: 'Удалить',
      promotedBadge: '✦ Продвигается',
      promotionPendingBadge: 'Запрос на продвижение ожидает проверки',
      soldOnUniMarketOption: 'Продано на UniMarket',
      soldElsewhereOption: 'Продано в другом месте',
      saleSourceUniMarket: 'Источник продажи: UniMarket',
      saleSourceOutside: 'Источник продажи: вне UniMarket'
    },
    languages: {
      en: {
        title: 'English',
        description: 'Показывать интерфейс приложения на английском.'
      },
      zh: {
        title: '简体中文',
        description: 'Показывать интерфейс приложения на упрощённом китайском.'
      },
      ru: {
        title: 'Русский',
        description: 'Показывать интерфейс приложения на русском.'
      }
    }
  }
}

function getLocaleCopy(locale) {
  const normalized = localeStore.normalizeLocale(locale)
  return COPY[normalized] || COPY[localeStore.DEFAULT_LOCALE]
}

function getCommonCopy(locale) {
  return getLocaleCopy(locale).common
}

function getPageCopy(pageKey, locale) {
  return getLocaleCopy(locale)[pageKey] || {}
}

function getCategoryLabel(categoryId, locale) {
  return getLocaleCopy(locale).market.categories[categoryId] || categoryId
}

function translateCondition(condition, locale) {
  return getLocaleCopy(locale).market.conditions[condition] || condition
}

function translateBadge(badge, locale) {
  return getLocaleCopy(locale).market.badges[badge] || badge
}

function translateCity(city, locale) {
  return getLocaleCopy(locale).market.cities[city] || city
}

function translateUniversity(university, locale) {
  const normalized = String(university || '')
  const commonLabels = {
    None: {
      en: 'None',
      zh: '未填写',
      ru: 'Не указано'
    },
    Other: {
      en: 'Other',
      zh: '其他',
      ru: 'Другое'
    }
  }
  const localeKey = localeStore.normalizeLocale(locale)

  return commonLabels[normalized] && commonLabels[normalized][localeKey]
    ? commonLabels[normalized][localeKey]
    : normalized
}

function translateSubcategory(subcategory, locale) {
  return getLocaleCopy(locale).market.subcategories[subcategory] || subcategory
}

function mapCategories(categories = [], locale) {
  return categories.map((category) => ({
    ...category,
    name: getCategoryLabel(category.id, locale)
  }))
}

function getLanguageOptions(locale) {
  const languageCopy = getLocaleCopy(locale).languages
  return localeStore.SUPPORTED_LOCALES.map((code) => ({
    code,
    title: languageCopy[code].title,
    description: languageCopy[code].description
  }))
}

function getTabBarCopy(locale) {
  return getLocaleCopy(locale).tabBar
}

function getTabBarItems(locale) {
  const tabBar = getTabBarCopy(locale)

  return [
    {
      pagePath: '/pages/index/index',
      text: tabBar.search,
      iconPath: '../assets/tabbar/search-normal.png',
      selectedIconPath: '../assets/tabbar/search-active.png'
    },
    {
      pagePath: '/pages/favorites/favorites',
      text: tabBar.saved,
      iconPath: '../assets/tabbar/saved-normal.png',
      selectedIconPath: '../assets/tabbar/saved-active.png'
    },
    {
      pagePath: '/pages/create/create',
      text: tabBar.post,
      iconPath: '../assets/tabbar/post-normal.png',
      selectedIconPath: '../assets/tabbar/post-active.png',
      isPrimary: true
    },
    {
      pagePath: '/pages/messages/messages',
      text: tabBar.listings,
      iconPath: '../assets/tabbar/listings-normal.png',
      selectedIconPath: '../assets/tabbar/listings-active.png'
    },
    {
      pagePath: '/pages/profile/profile',
      text: tabBar.profile,
      iconPath: '../assets/tabbar/profile-normal.png',
      selectedIconPath: '../assets/tabbar/profile-active.png'
    }
  ]
}

function getUniversityFilterOptions(locale) {
  return [getCommonCopy(locale).allUniversities].concat(
    universitiesStore.getPublicUniversityOptions().map((item) => translateUniversity(item, locale))
  )
}

function getUniversityOptionLabels(options = [], locale) {
  return options.map((item) => translateUniversity(item, locale))
}

function getTranslatedSubcategoryOptions(values = [], locale) {
  return values.map((value) => translateSubcategory(value, locale))
}

function getTranslatedConditionOptions(values = [], locale) {
  return values.map((value) => translateCondition(value, locale))
}

function getCreatePhotoHint(photoLimit, locale) {
  return getPageCopy('create', locale).photoHintTemplate.replace('{count}', String(photoLimit || 0))
}

function getCreateModeState(mode, locale) {
  const copy = getPageCopy('create', locale)
  const isEdit = mode === 'edit'

  return {
    navTitle: isEdit ? copy.editNavTitle : copy.newNavTitle,
    heroTitle: isEdit ? copy.editHeroTitle : copy.newHeroTitle,
    heroCopy: isEdit ? copy.editHeroCopy : copy.newHeroCopy,
    heroChip: isEdit ? copy.editHeroChip : copy.newHeroChip,
    submitLabel: isEdit ? copy.saveChangesLabel : copy.publishLabel
  }
}

function isChineseLocale(locale) {
  return localeStore.normalizeLocale(locale) === 'zh'
}

function isRussianLocale(locale) {
  return localeStore.normalizeLocale(locale) === 'ru'
}

function getIntlLocale(locale) {
  if (isChineseLocale(locale)) {
    return 'zh-CN'
  }

  if (isRussianLocale(locale)) {
    return 'ru-RU'
  }

  return 'en-US'
}

function getRussianPlural(count, one, few, many) {
  const normalizedCount = Math.abs(Number(count || 0))
  const mod10 = normalizedCount % 10
  const mod100 = normalizedCount % 100

  if (mod10 === 1 && mod100 !== 11) {
    return one
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return few
  }

  return many
}

function getThisWeekTrend(count, locale) {
  const normalizedCount = Number(count || 0)

  if (isChineseLocale(locale)) {
    return `+${normalizedCount} ${getPageCopy('listing', locale).thisWeekSuffix}`
  }

  return `+${normalizedCount} ${getPageCopy('listing', locale).thisWeekSuffix}`
}

function getReviewCountLabel(count, locale) {
  const normalizedCount = Number(count || 0)

  if (isChineseLocale(locale)) {
    return `${normalizedCount} 条评价`
  }

  if (isRussianLocale(locale)) {
    return `${normalizedCount} ${getRussianPlural(normalizedCount, 'отзыв', 'отзыва', 'отзывов')}`
  }

  return normalizedCount === 1 ? '1 review' : `${normalizedCount} reviews`
}

function getReviewAverageLabel(average, count, locale) {
  if (!count) {
    return getPageCopy('userProfile', locale).statsNew
  }

  return Number(average || 0).toFixed(1)
}

function getMemberSinceChipLabel(joinedAt, locale) {
  const normalized = String(joinedAt || '').trim()

  if (!normalized) {
    return ''
  }

  const date = new Date(normalized.length === 10 ? `${normalized}T00:00:00` : normalized)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  try {
    const formatted = new Intl.DateTimeFormat(getIntlLocale(locale), {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)

    if (isChineseLocale(locale)) {
      return `自 ${formatted} 起`
    }

    if (isRussianLocale(locale)) {
      return `С ${formatted}`
    }

    return `Since ${formatted}`
  } catch (error) {
    const fallback = String(normalized).slice(0, 10)
    if (isChineseLocale(locale)) {
      return `自 ${fallback} 起`
    }

    if (isRussianLocale(locale)) {
      return `С ${fallback}`
    }

    return `Since ${fallback}`
  }
}

function getListingPublishedLabel(value, locale) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  try {
    const formatted = new Intl.DateTimeFormat(getIntlLocale(locale), {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)

    if (isChineseLocale(locale)) {
      return `发布于 ${formatted}`
    }

    if (isRussianLocale(locale)) {
      return `Опубликовано ${formatted}`
    }

    return `Published on ${formatted}`
  } catch (error) {
    const fallback = String(value).slice(0, 10)
    if (isChineseLocale(locale)) {
      return `发布于 ${fallback}`
    }

    if (isRussianLocale(locale)) {
      return `Опубликовано ${fallback}`
    }

    return `Published on ${fallback}`
  }
}

function hasBeenOnUniMarketForAtLeastDays(joinedAt, days) {
  const normalizedDays = Number(days || 0)
  if (!normalizedDays) {
    return false
  }

  const normalizedJoinedAt = String(joinedAt || '').trim()
  if (!normalizedJoinedAt) {
    return false
  }

  const joinedDate = new Date(`${normalizedJoinedAt}T00:00:00`)
  if (Number.isNaN(joinedDate.getTime())) {
    return false
  }

  const today = new Date()
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diffMs = todayDate.getTime() - joinedDate.getTime()
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))

  return diffDays >= normalizedDays
}

function getSellerTrustLabel(soldCount, listingsCount, joinedAt, locale) {
  const safeSoldCount = Number(soldCount || 0)
  const safeListingsCount = Number(listingsCount || 0)

  if (safeSoldCount > 0) {
    if (isChineseLocale(locale)) {
      return `已在 UniMarket 售出 ${safeSoldCount} 件`
    }

    if (isRussianLocale(locale)) {
      return `Продано на UniMarket: ${safeSoldCount}`
    }

    return `Sold ${safeSoldCount} item${safeSoldCount === 1 ? '' : 's'} on UniMarket`
  }

  if (safeListingsCount >= 3) {
    if (isChineseLocale(locale)) {
      return 'UniMarket 活跃卖家'
    }

    if (isRussianLocale(locale)) {
      return 'Активный продавец на UniMarket'
    }

    return 'Active seller on UniMarket'
  }

  if (hasBeenOnUniMarketForAtLeastDays(joinedAt, 14)) {
    return ''
  }

  if (isChineseLocale(locale)) {
    return '刚加入 UniMarket'
  }

  if (isRussianLocale(locale)) {
    return 'Недавно на UniMarket'
  }

  return 'New to UniMarket'
}

function getSellerStatusLabel(status, locale) {
  const copy = getPageCopy('listing', locale)

  if (status === 'pro') return copy.proSeller
  if (status === 'seller') return copy.seller
  return copy.newSeller
}

function getActiveListingsSubtitle(count, locale) {
  const normalizedCount = Number(count || 0)

  if (isChineseLocale(locale)) {
    return `${normalizedCount} 个展示中`
  }

  if (isRussianLocale(locale)) {
    return `${normalizedCount} ${getRussianPlural(normalizedCount, 'активное объявление', 'активных объявления', 'активных объявлений')}`
  }

  return `${normalizedCount} active`
}

function getListingsSectionTitle(isOwnProfile, sellerName, locale) {
  const copy = getPageCopy('userProfile', locale)
  return isOwnProfile ? copy.yourListingsTitle : `${copy.listingsByPrefix}${sellerName || ''}`
}

function getCategoryRegionLabel(regionKey, locale) {
  const map = {
    'All districts': 'allDistricts',
    'All campuses': 'allCampuses',
    Hangzhou: 'hangzhou'
  }
  const key = map[regionKey]
  return (key && getPageCopy('categoryPage', locale).regions[key]) || regionKey
}

function getCategoryPrimaryFilterLabel(label, locale) {
  const map = {
    Type: 'type',
    Campus: 'campus',
    University: 'university',
    Service: 'service',
    Format: 'format'
  }
  const key = map[label]
  return (key && getPageCopy('categoryPage', locale).primaryFilters[key]) || label
}

function getCategorySecondaryFilterLabel(label, locale) {
  const map = {
    Price: 'price',
    Sort: 'sort'
  }
  const key = map[label]
  return (key && getPageCopy('categoryPage', locale).secondaryFilters[key]) || label
}

function getCategoryQuickPresetLabel(label, locale) {
  const map = {
    All: 'allOption',
    Budget: 'budget',
    'Under 500 RMB': 'under500',
    'Under 300 RMB': 'under300',
    'Airport pickup': 'airportPickup',
    'HSK / IELTS prep': 'hsk',
    'Free stuff': 'freeStuff'
  }
  const key = map[label]
  if (!key) return label
  if (key === 'allOption') return getPageCopy('categoryPage', locale).allOption
  return getPageCopy('categoryPage', locale).quickPresets[key] || label
}

function getCategoryPriceRangeLabel(label, locale) {
  const map = {
    'Any price': 'any',
    'Up to 2500 RMB': 'upTo2500',
    '2500-4000 RMB': 'from2500to4000',
    '4000+ RMB': 'above4000',
    'Up to 1000 RMB': 'upTo1000',
    '1000-3000 RMB': 'from1000to3000',
    '3000+ RMB': 'above3000',
    'Up to 500 RMB': 'upTo500',
    '500-1500 RMB': 'from500to1500',
    '1500+ RMB': 'above1500',
    'Up to 300 RMB': 'upTo300',
    '300-1000 RMB': 'from300to1000',
    'Up to 150 RMB': 'upTo150',
    '150-300 RMB': 'from150to300',
    '300+ RMB': 'above300',
    'Up to 100 RMB': 'upTo100',
    '100-300 RMB': 'from100to300'
  }
  const key = map[label]
  return (key && getPageCopy('categoryPage', locale).priceRanges[key]) || label
}

function getCategoryShowResultsLabel(count, locale) {
  const copy = getPageCopy('categoryPage', locale)
  if (!count) return copy.noListingsFound
  if (isRussianLocale(locale)) {
    return count === 1
      ? 'Показать 1 объявление'
      : `Показать ${count} ${getRussianPlural(count, 'объявление', 'объявления', 'объявлений')}`
  }
  if (count === 1) return copy.showOneListing
  return `${copy.showManyListingsPrefix}${count}${copy.showManyListingsSuffix}`
}

function getLocalizedFeaturedCards(categoryId, locale) {
  return getPageCopy('categoryPage', locale).featuredCards[categoryId] || []
}

function getHomeApplyLabel(count, locale) {
  const normalizedCount = Number(count || 0)

  if (isChineseLocale(locale)) {
    return `显示 ${normalizedCount} 条发布`
  }

  if (isRussianLocale(locale)) {
    return normalizedCount === 1
      ? 'Показать 1 объявление'
      : `Показать ${normalizedCount} ${getRussianPlural(normalizedCount, 'объявление', 'объявления', 'объявлений')}`
  }

  return normalizedCount === 1 ? 'Show 1 listing' : `Show ${normalizedCount} listings`
}

function getFavoritesEmptyState(hasSavedItems, locale) {
  const copy = getPageCopy('favorites', locale)

  if (hasSavedItems) {
    return {
      title: copy.noMatchesTitle,
      copy: copy.noMatchesCopy
    }
  }

  return {
    title: copy.emptyTitle,
    copy: copy.emptyCopy
  }
}

function getMessagesHeroMeta(activeCount, soldCount, savedCount, locale) {
  if (isChineseLocale(locale)) {
    return `${activeCount} 个展示中 · ${soldCount} 个在 UniMarket 售出 · ${savedCount} 个收藏`
  }

  if (isRussianLocale(locale)) {
    return `${activeCount} ${getRussianPlural(activeCount, 'активное объявление', 'активных объявления', 'активных объявлений')} · ${soldCount} продано на UniMarket · ${savedCount} в избранном`
  }

  return `${activeCount} active · ${soldCount} sold on UniMarket · ${savedCount} saved`
}

function getArchiveSubtitle(count, locale) {
  const normalizedCount = Number(count || 0)

  if (isChineseLocale(locale)) {
    return `${normalizedCount} 个已归档发布已移出活跃列表`
  }

  if (isRussianLocale(locale)) {
    return `В архиве ${normalizedCount} ${getRussianPlural(normalizedCount, 'объявление', 'объявления', 'объявлений')}`
  }

  return `${normalizedCount} archived listing${normalizedCount === 1 ? '' : 's'} moved out of active feed`
}

function getUnavailableMeta(count, locale) {
  const normalizedCount = Number(count || 0)

  if (isChineseLocale(locale)) {
    return `${normalizedCount} 个已隐藏或已删除`
  }

  if (isRussianLocale(locale)) {
    return `${normalizedCount} ${getRussianPlural(normalizedCount, 'скрытое или удалённое объявление', 'скрытых или удалённых объявления', 'скрытых или удалённых объявлений')}`
  }

  return `${normalizedCount} hidden or deleted`
}

module.exports = {
  getCommonCopy,
  getPageCopy,
  getCategoryLabel,
  translateCondition,
  translateBadge,
  translateCity,
  translateUniversity,
  translateSubcategory,
  mapCategories,
  getLanguageOptions,
  getTabBarCopy,
  getTabBarItems,
  getUniversityFilterOptions,
  getUniversityOptionLabels,
  getTranslatedSubcategoryOptions,
  getTranslatedConditionOptions,
  getCreatePhotoHint,
  getCreateModeState,
  getThisWeekTrend,
  getReviewCountLabel,
  getReviewAverageLabel,
  getMemberSinceChipLabel,
  getListingPublishedLabel,
  getSellerTrustLabel,
  getSellerStatusLabel,
  getActiveListingsSubtitle,
  getListingsSectionTitle,
  getCategoryRegionLabel,
  getCategoryPrimaryFilterLabel,
  getCategorySecondaryFilterLabel,
  getCategoryQuickPresetLabel,
  getCategoryPriceRangeLabel,
  getCategoryShowResultsLabel,
  getLocalizedFeaturedCards,
  getHomeApplyLabel,
  getFavoritesEmptyState,
  getMessagesHeroMeta,
  getArchiveSubtitle,
  getUnavailableMeta
}
