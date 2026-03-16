const reportsStore = require('../utils/reports')

const categories = [
  { id: 'all', name: 'All', emoji: '✨', theme: 'cream' },
  { id: 'housing', name: 'Housing', emoji: '🏠', theme: 'rose' },
  { id: 'items', name: 'Items', emoji: '📦', theme: 'mint' },
  { id: 'electronics', name: 'Electronics', emoji: '📱', theme: 'sky' },
  { id: 'services', name: 'Services', emoji: '🛠', theme: 'lilac' },
  { id: 'transport', name: 'Transport', emoji: '🚗', theme: 'peach' },
  { id: 'study', name: 'Study', emoji: '📚', theme: 'butter' },
  { id: 'jobs', name: 'Jobs', emoji: '💼', theme: 'sage' }
]

const categoryTitles = {
  housing: 'Housing',
  electronics: 'Electronics',
  transport: 'Transport',
  items: 'Items',
  services: 'Services',
  study: 'Study',
  jobs: 'Jobs'
}

const categoryConfigs = {
  housing: {
    title: 'Housing',
    region: 'All districts',
    heroTone: 'blue',
    subcategories: ['Private room', 'Shared flat', 'Studio', 'Apartment', 'Near campus', 'Short-term stay'],
    primaryFilters: ['Type', 'Rent mode'],
    quickFilters: ['All', 'Budget', 'Near ZJU'],
    secondaryFilters: ['Move-in date', 'Price'],
    cta: 'Show 120+ listings'
  },
  electronics: {
    title: 'Electronics',
    region: 'All campuses',
    heroTone: 'green',
    subcategories: ['Phones', 'Laptops', 'Tablets', 'Audio', 'Cameras', 'Accessories'],
    primaryFilters: ['Condition', 'Brand'],
    quickFilters: ['All', 'Popular', 'Student deals'],
    secondaryFilters: ['Price', 'Campus'],
    cta: 'Show 90+ listings'
  },
  transport: {
    title: 'Transport',
    region: 'All districts',
    heroTone: 'peach',
    subcategories: ['Bicycles', 'E-bikes', 'Scooters', 'Motorbikes', 'Rentals', 'Parts & repair'],
    primaryFilters: ['Vehicle type', 'Use case'],
    quickFilters: ['All', 'Under 500 RMB', 'Near campus'],
    secondaryFilters: ['Condition', 'Price'],
    cta: 'Show 60+ listings'
  },
  items: {
    title: 'Items',
    region: 'All campuses',
    heroTone: 'mint',
    subcategories: ['Dorm setup', 'Kitchen', 'Clothing', 'Bags', 'Decor', 'Bundles'],
    primaryFilters: ['Item type', 'Condition'],
    quickFilters: ['All', 'Bundles', 'Ready to pick up'],
    secondaryFilters: ['Price', 'Campus'],
    cta: 'Show 75+ listings'
  },
  services: {
    title: 'Services',
    region: 'Hangzhou',
    heroTone: 'violet',
    subcategories: ['Translation', 'Document help', 'Photography', 'Tutoring', 'Airport pickup', 'Errands'],
    primaryFilters: ['Service type', 'Availability'],
    quickFilters: ['All', 'Trusted', 'English-friendly'],
    secondaryFilters: ['Price', 'Area'],
    cta: 'Show 40+ listings'
  },
  study: {
    title: 'Study',
    region: 'All campuses',
    heroTone: 'yellow',
    subcategories: ['Tutoring', 'Textbooks', 'Language exchange', 'Exam prep', 'Stationery', 'Study groups'],
    primaryFilters: ['Subject', 'Format'],
    quickFilters: ['All', 'Beginner', 'HSK prep'],
    secondaryFilters: ['Price', 'Campus'],
    cta: 'Show 35+ listings'
  },
  jobs: {
    title: 'Jobs',
    region: 'Hangzhou',
    heroTone: 'sage',
    subcategories: ['Part-time', 'Internships', 'Campus jobs', 'Remote', 'Freelance', 'Weekend'],
    primaryFilters: ['Role type', 'Schedule'],
    quickFilters: ['All', 'Remote', 'Student-friendly'],
    secondaryFilters: ['Pay', 'Area'],
    cta: 'Show 25+ listings'
  }
}

const featuredCards = {
  housing: [
    { title: 'Private rooms', caption: 'Closer to the main gates' },
    { title: 'Shared flats', caption: 'Split rent with roommates' },
    { title: 'Studios', caption: 'Quiet and fully private' }
  ],
  electronics: [
    { title: 'Phones', caption: 'Popular student upgrades' },
    { title: 'Laptops', caption: 'For classes and side projects' },
    { title: 'Audio', caption: 'Headphones and speakers' }
  ],
  transport: [
    { title: 'Bicycles', caption: 'Reliable campus commute' },
    { title: 'Scooters', caption: 'Faster rides across town' },
    { title: 'E-bikes', caption: 'Longer daily distances' }
  ],
  items: [
    { title: 'Dorm essentials', caption: 'Move-in faster' },
    { title: 'Kitchen bundles', caption: 'Save time and money' },
    { title: 'Bags & storage', caption: 'Small-space friendly' }
  ],
  services: [
    { title: 'Translation help', caption: 'Banks, hospitals, forms' },
    { title: 'Tutoring', caption: 'Language and subject help' },
    { title: 'Errand support', caption: 'Pickup, delivery, setup' }
  ],
  study: [
    { title: 'Exam prep', caption: 'HSK and coursework' },
    { title: 'Books', caption: 'Find used study materials' },
    { title: 'Study groups', caption: 'Meet people from campus' }
  ],
  jobs: [
    { title: 'Part-time jobs', caption: 'Flexible student work' },
    { title: 'Internships', caption: 'Build experience' },
    { title: 'Freelance tasks', caption: 'Short projects' }
  ]
}

const CUSTOM_LISTINGS_STORAGE_KEY = 'marketCustomListings'
const CREATE_MODE_STORAGE_KEY = 'marketCreateMode'

const categoryFallbackImages = {
  housing: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  electronics: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80',
  transport: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1200&q=80',
  items: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1200&q=80',
  services: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80',
  study: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
  jobs: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80'
}

const baseListings = [
  {
    id: 1,
    title: 'Room near the ZJU campus',
    price: '3200 RMB / month',
    location: 'Hangzhou',
    university: 'Zhejiang University',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    categoryId: 'housing',
    subcategory: 'Private room',
    description:
      'Bright private room in a shared apartment, around 12 minutes from the ZJU gate. Comes with bed, desk, air conditioning, and washing machine access. Best for one student looking for a quiet place and easy commute.',
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'
    ],
    seller: {
      name: 'Misha',
      badge: 'Verified student',
      wechat: 'misha-hz-room',
      note: 'Usually replies within 15 minutes'
    }
  },
  {
    id: 2,
    title: 'Shared flat with two international students',
    price: '2100 RMB / month',
    location: 'Hangzhou',
    university: 'Zhejiang University',
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    categoryId: 'housing',
    subcategory: 'Shared flat',
    description:
      'Comfortable shared flat with two international roommates, fast Wi-Fi, and a common kitchen. Great option if you want a lower budget and a social living setup near university routes.',
    images: [
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'
    ],
    seller: {
      name: 'Aliya',
      badge: 'Community member',
      wechat: 'aliya-flat-share',
      note: 'Flexible move-in date'
    }
  },
  {
    id: 3,
    title: 'Studio apartment for one person',
    price: '3900 RMB / month',
    location: 'Hangzhou',
    university: 'ZJU City College',
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80',
    categoryId: 'housing',
    subcategory: 'Studio',
    description:
      'Private studio with kitchen corner and modern bathroom. Better for students who want independence and no roommates.',
    images: [
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'
    ],
    seller: {
      name: 'Lina',
      badge: 'Trusted landlord contact',
      wechat: 'lina-studio-hz',
      note: 'Can arrange viewing this weekend'
    }
  },
  {
    id: 4,
    title: 'iPhone 14 in great condition',
    price: '2800 RMB',
    location: 'Hangzhou',
    university: 'ZJU City College',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=900&q=80',
    categoryId: 'electronics',
    subcategory: 'Phones',
    description:
      'Unlocked iPhone 14 with healthy battery and clean body. Includes case, cable, and original box. Good option for a student upgrade without paying full retail price.',
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=1200&q=80'
    ],
    seller: {
      name: 'Artem',
      badge: 'Trusted seller',
      wechat: 'artem-tech-cn',
      note: 'Meetup near campus available'
    }
  },
  {
    id: 5,
    title: 'MacBook Air M1 for classes',
    price: '4200 RMB',
    location: 'Hangzhou',
    university: 'Zhejiang University',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
    categoryId: 'electronics',
    subcategory: 'Laptops',
    description:
      'Lightweight MacBook Air M1 with charger and sleeve included. Perfect for lectures, documents, coding, and daily student work.',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80'
    ],
    seller: {
      name: 'Nastya',
      badge: 'Student seller',
      wechat: 'nastya-macbook',
      note: 'Battery health above 90%'
    }
  },
  {
    id: 6,
    title: 'Sony headphones with case',
    price: '680 RMB',
    location: 'Hangzhou',
    university: 'China Jiliang University',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    categoryId: 'electronics',
    subcategory: 'Audio',
    description:
      'Over-ear headphones with good sound isolation, charging cable, and travel case included.',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80'
    ],
    seller: {
      name: 'Timur',
      badge: 'Audio gear fan',
      wechat: 'timur-audio',
      note: 'Can test before buying'
    }
  },
  {
    id: 7,
    title: 'Translation help and bank support',
    price: '150 RMB',
    location: 'Hangzhou',
    university: 'Zhejiang University',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=80',
    categoryId: 'services',
    subcategory: 'Translation',
    description:
      'Help with simple translations, appointments, and basic paperwork for international students.',
    images: [
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80'
    ],
    seller: {
      name: 'Diana',
      badge: 'Helpful local contact',
      wechat: 'diana-help-hz',
      note: 'Available evenings'
    }
  },
  {
    id: 8,
    title: 'Campus bicycle',
    price: '450 RMB',
    location: 'Hangzhou',
    university: 'ZAFU',
    image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=900&q=80',
    categoryId: 'transport',
    subcategory: 'Bicycles',
    description:
      'Reliable bike for daily classes, delivery runs, and quick city trips. Recently serviced with new brakes and a storage basket included.',
    images: [
      'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511994298241-608e28f14fde?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80'
    ],
    seller: {
      name: 'Nurlan',
      badge: 'Campus seller',
      wechat: 'nurlan-bike',
      note: 'Pickup this week preferred'
    }
  },
  {
    id: 9,
    title: 'Ninebot electric scooter',
    price: '1800 RMB',
    location: 'Hangzhou',
    university: 'Zhejiang University',
    image: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=900&q=80',
    categoryId: 'transport',
    subcategory: 'Scooters',
    description:
      'Compact electric scooter with charger. Ideal for faster rides between dorms and classes.',
    images: [
      'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=1200&q=80'
    ],
    seller: {
      name: 'Vlad',
      badge: 'Verified student',
      wechat: 'vlad-scooter',
      note: 'Small negotiation possible'
    }
  },
  {
    id: 10,
    title: 'Used e-bike with charger',
    price: '2400 RMB',
    location: 'Hangzhou',
    university: 'ZAFU',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80',
    categoryId: 'transport',
    subcategory: 'E-bikes',
    description:
      'Great for longer daily commutes around Hangzhou. Includes charger and lock.',
    images: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80'
    ],
    seller: {
      name: 'Aida',
      badge: 'Community member',
      wechat: 'aida-ebike',
      note: 'Battery still performs well'
    }
  },
  {
    id: 11,
    title: 'Chinese tutoring for beginners',
    price: '120 RMB / hour',
    location: 'Hangzhou',
    university: 'Zhejiang University',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
    categoryId: 'study',
    subcategory: 'Tutoring',
    description:
      'Beginner-friendly Chinese tutoring focused on practical speaking and daily life phrases.',
    images: [
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80'
    ],
    seller: {
      name: 'Yulia',
      badge: 'Tutor',
      wechat: 'yulia-hsk',
      note: 'Online and offline sessions'
    }
  },
  {
    id: 12,
    title: 'Desk lamp and dorm setup bundle',
    price: '180 RMB',
    location: 'Hangzhou',
    university: 'China Jiliang University',
    image: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=900&q=80',
    categoryId: 'items',
    subcategory: 'Dorm setup',
    description:
      'Useful starter kit for a new dorm room: lamp, power strip, organizer, and small extras.',
    images: [
      'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1200&q=80'
    ],
    seller: {
      name: 'Kamila',
      badge: 'Dorm seller',
      wechat: 'kamila-dorm',
      note: 'Bundle only'
    }
  }
]

function safeGetStorage(key, fallback = []) {
  if (typeof wx === 'undefined' || !wx.getStorageSync) {
    return fallback
  }

  try {
    const value = wx.getStorageSync(key)
    return value === '' || typeof value === 'undefined' ? fallback : value
  } catch (error) {
    return fallback
  }
}

function safeSetStorage(key, value) {
  if (typeof wx === 'undefined' || !wx.setStorageSync) {
    return
  }

  try {
    wx.setStorageSync(key, value)
  } catch (error) {}
}

function getFallbackImage(categoryId) {
  return categoryFallbackImages[categoryId] || categoryFallbackImages.items
}

function normalizeCustomListing(rawListing) {
  const categoryId = rawListing.categoryId || 'items'
  const images = Array.isArray(rawListing.images) ? rawListing.images.filter(Boolean) : []
  const image = images[0] || rawListing.image || getFallbackImage(categoryId)

  return {
    id: Number(rawListing.id),
    title: rawListing.title || 'Untitled listing',
    price: rawListing.price || 'Price on request',
    location: rawListing.location || 'Hangzhou',
    university: rawListing.university || 'Student listing',
    image,
    categoryId,
    subcategory: rawListing.subcategory || '',
    description: rawListing.description || 'No description yet.',
    images: images.length ? images : [image],
    createdAt: rawListing.createdAt || new Date().toISOString(),
    isCustom: true,
    seller: {
      name: rawListing.seller && rawListing.seller.name ? rawListing.seller.name : 'You',
      badge: rawListing.seller && rawListing.seller.badge ? rawListing.seller.badge : 'Student seller',
      wechat: rawListing.seller && rawListing.seller.wechat ? rawListing.seller.wechat : '',
      note: rawListing.seller && rawListing.seller.note ? rawListing.seller.note : 'Recently published'
    }
  }
}

function safeRemoveStorage(key) {
  if (typeof wx === 'undefined' || !wx.removeStorageSync) {
    return
  }

  try {
    wx.removeStorageSync(key)
  } catch (error) {}
}

function getCustomListings() {
  const storedListings = safeGetStorage(CUSTOM_LISTINGS_STORAGE_KEY, [])

  return storedListings
    .map((listing) => normalizeCustomListing(listing))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function getAllListings(options = {}) {
  const { includeResolved = true } = options
  const listings = reportsStore.decorateListingsWithModeration([...getCustomListings(), ...baseListings])

  if (includeResolved) {
    return listings
  }

  return listings.filter((listing) => !listing.isHiddenByModeration)
}

function getListingById(id) {
  return getAllListings({ includeResolved: true }).find((listing) => String(listing.id) === String(id)) || null
}

function getFeedListings() {
  return getAllListings({ includeResolved: false })
}

function getListingsByCategory(categoryId, options = {}) {
  const { includeResolved = true } = options
  return getAllListings({ includeResolved }).filter((listing) => listing.categoryId === categoryId)
}

function getFeedListingsByCategory(categoryId) {
  return getListingsByCategory(categoryId, { includeResolved: false })
}

function createListing(payload) {
  const customListings = safeGetStorage(CUSTOM_LISTINGS_STORAGE_KEY, [])
  const listing = normalizeCustomListing({
    ...payload,
    id: Date.now(),
    createdAt: new Date().toISOString()
  })

  safeSetStorage(CUSTOM_LISTINGS_STORAGE_KEY, [listing, ...customListings])

  return listing
}

function getPublishCategories() {
  return categories.filter((category) => category.id !== 'all')
}

function getMyListings() {
  return reportsStore.decorateListingsWithModeration(getCustomListings())
}

function deleteListing(id) {
  const targetId = String(id)
  const nextListings = safeGetStorage(CUSTOM_LISTINGS_STORAGE_KEY, []).filter(
    (listing) => String(listing.id) !== targetId
  )

  safeSetStorage(CUSTOM_LISTINGS_STORAGE_KEY, nextListings)
}

function updateListing(id, payload) {
  const targetId = String(id)
  const customListings = safeGetStorage(CUSTOM_LISTINGS_STORAGE_KEY, [])
  const currentListing = customListings.find((listing) => String(listing.id) === targetId)

  if (!currentListing) {
    return null
  }

  const updatedListing = normalizeCustomListing({
    ...currentListing,
    ...payload,
    id: currentListing.id,
    createdAt: currentListing.createdAt,
    updatedAt: new Date().toISOString()
  })

  const nextListings = customListings.map((listing) =>
    String(listing.id) === targetId ? updatedListing : listing
  )

  safeSetStorage(CUSTOM_LISTINGS_STORAGE_KEY, nextListings)

  return updatedListing
}

function queueCreateMode(mode) {
  safeSetStorage(CREATE_MODE_STORAGE_KEY, mode)
}

function consumeCreateMode() {
  const mode = safeGetStorage(CREATE_MODE_STORAGE_KEY, null)
  safeRemoveStorage(CREATE_MODE_STORAGE_KEY)
  return mode
}

module.exports = {
  categories,
  categoryTitles,
  categoryConfigs,
  featuredCards,
  listings: baseListings,
  getAllListings,
  getFeedListings,
  getListingById,
  getListingsByCategory,
  getFeedListingsByCategory,
  createListing,
  getMyListings,
  deleteListing,
  updateListing,
  queueCreateMode,
  consumeCreateMode,
  getPublishCategories,
  getFallbackImage
}
