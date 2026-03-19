const reportsStore = require('../utils/reports')
const visibilityStore = require('../utils/visibility')
const profileStore = require('../utils/profile')
const listingStatsStore = require('../utils/listing-stats')
const profileStatsStore = require('../utils/profile-stats')
const storage = require('../utils/storage')
const validation = require('../utils/validation')

const categories = [
  { id: 'all', name: 'All', emoji: '✨', theme: 'cream' },
  { id: 'items', name: 'Items', emoji: '📦', theme: 'mint' },
  { id: 'electronics', name: 'Electronics', emoji: '📱', theme: 'sky' },
  { id: 'transport', name: 'Transport', emoji: '🚗', theme: 'peach' },
  { id: 'study', name: 'Study', emoji: '📚', theme: 'butter' },
  { id: 'services', name: 'Services', emoji: '🛠', theme: 'lilac' },
  { id: 'other', name: 'Other', emoji: '🧩', theme: 'sage' }
]

const categoryTitles = {
  housing: 'Housing',
  electronics: 'Electronics',
  transport: 'Transport',
  items: 'Items',
  services: 'Services',
  study: 'Study',
  other: 'Other'
}

const categoryConfigs = {
  housing: {
    title: 'Housing',
    region: 'All districts',
    heroTone: 'blue',
    subcategories: ['Private room', 'Shared room', 'Shared flat', 'Studio', 'Full apartment', 'Short-term sublet', 'Dorm takeover'],
    primaryFilters: ['Type', 'Campus'],
    quickFilters: ['All', 'Budget', 'ZJU'],
    secondaryFilters: ['Price', 'Sort'],
    cta: 'Show 120+ listings'
  },
  electronics: {
    title: 'Electronics',
    region: 'All campuses',
    heroTone: 'blue',
    subcategories: ['Phones', 'Laptops', 'Tablets', 'Audio', 'Cameras', 'Gaming gear', 'Accessories'],
    primaryFilters: ['Type', 'University'],
    quickFilters: ['All', 'Budget', 'ZJU'],
    secondaryFilters: ['Price', 'Sort'],
    cta: 'Show 90+ listings'
  },
  transport: {
    title: 'Transport',
    region: 'All districts',
    heroTone: 'peach',
    subcategories: ['Bikes', 'E-bikes', 'Scooters', 'Ride-sharing', 'Rentals', 'Parts & repair'],
    primaryFilters: ['Type', 'University'],
    quickFilters: ['All', 'Under 500 RMB', 'ZJU'],
    secondaryFilters: ['Price', 'Sort'],
    cta: 'Show 60+ listings'
  },
  items: {
    title: 'Items',
    region: 'All campuses',
    heroTone: 'mint',
    subcategories: ['Dorm essentials', 'Kitchenware', 'Clothing', 'Bags & luggage', 'Home decor', 'Small appliances', 'Bundles'],
    primaryFilters: ['Type', 'University'],
    quickFilters: ['All', 'Under 300 RMB', 'ZJU'],
    secondaryFilters: ['Price', 'Sort'],
    cta: 'Show 75+ listings'
  },
  services: {
    title: 'Services',
    region: 'Hangzhou',
    heroTone: 'violet',
    subcategories: ['Translation & paperwork', 'Airport pickup', 'Moving help', 'Photo shoots', 'Tech setup', 'Errands & delivery', 'Cleaning help'],
    primaryFilters: ['Service', 'University'],
    quickFilters: ['All', 'Airport pickup', 'ZJU'],
    secondaryFilters: ['Price', 'Sort'],
    cta: 'Show 40+ listings'
  },
  study: {
    title: 'Study',
    region: 'All campuses',
    heroTone: 'yellow',
    subcategories: ['Tutoring', 'Textbooks', 'Study notes', 'Language exchange', 'HSK / IELTS prep', 'Stationery', 'Study groups'],
    primaryFilters: ['Format', 'University'],
    quickFilters: ['All', 'HSK / IELTS prep', 'ZJU'],
    secondaryFilters: ['Price', 'Sort'],
    cta: 'Show 35+ listings'
  },
  other: {
    title: 'Other',
    region: 'All campuses',
    heroTone: 'sage',
    subcategories: ['Other items', 'Free stuff', 'Collectibles', 'Hobby gear', 'Sports gear', 'Beauty & care', 'Pet supplies'],
    primaryFilters: ['Type', 'University'],
    quickFilters: ['All', 'Free stuff', 'ZJU'],
    secondaryFilters: ['Price', 'Sort'],
    cta: 'Show 20+ listings'
  }
}

const featuredCards = {
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

const CUSTOM_LISTINGS_STORAGE_KEY = 'marketCustomListings'
const CREATE_MODE_STORAGE_KEY = 'marketCreateMode'
const PROMOTION_REQUESTS_STORAGE_KEY = 'marketPromotionRequests'
const SELLER_PRO_STORAGE_KEY = 'marketSellerProSubscriptions'
const SELLER_PRO_PHOTO_LIMIT = 10
const DEFAULT_PHOTO_LIMIT = 5
const PROMOTION_PLAN_CONFIGS = {
  featured_1d: {
    id: 'featured_1d',
    label: 'Featured for 1 day',
    durationDays: 1,
    durationHours: 24,
    priceLabel: '29 RMB'
  },
  featured_2d: {
    id: 'featured_2d',
    label: 'Featured for 2 days',
    durationDays: 2,
    durationHours: 48,
    priceLabel: '49 RMB'
  },
  featured_3d: {
    id: 'featured_3d',
    label: 'Featured for 3 days',
    durationDays: 3,
    durationHours: 72,
    priceLabel: '69 RMB'
  },
  featured_7d: {
    id: 'featured_7d',
    label: 'Featured for 7 days',
    durationDays: 7,
    durationHours: 168,
    priceLabel: '129 RMB'
  }
}

const categoryFallbackImages = {
  housing: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  electronics: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80',
  transport: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1200&q=80',
  items: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1200&q=80',
  services: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80',
  study: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
  other: '/assets/subcategories/other/other-items.png'
}

const subcategoryFallbackImages = {
  'Private room': '/assets/subcategories/housing/private-room.png',
  'Shared room': '/assets/subcategories/housing/shared-room.png',
  'Shared flat': '/assets/subcategories/housing/shared-flat.png',
  Studio: '/assets/subcategories/housing/studio.png',
  'Full apartment': '/assets/subcategories/housing/full-apartment.png',
  'Short-term sublet': '/assets/subcategories/housing/short-term-sublet.png',
  'Dorm takeover': '/assets/subcategories/housing/dorm-takeover.png',
  Phones: '/assets/subcategories/electronics/phones.png',
  Laptops: '/assets/subcategories/electronics/laptops.png',
  Tablets: '/assets/subcategories/electronics/tablets.png',
  Audio: '/assets/subcategories/electronics/audio.png',
  Cameras: '/assets/subcategories/electronics/cameras.png',
  'Gaming gear': '/assets/subcategories/electronics/accessories.png',
  Accessories: '/assets/subcategories/electronics/gaming-gear.png',
  Bikes: '/assets/subcategories/transport/bikes.png',
  'E-bikes': '/assets/subcategories/transport/e-bikes.png',
  Scooters: '/assets/subcategories/transport/scooters.png',
  'Ride-sharing': '/assets/subcategories/transport/rentals.png',
  Rentals: '/assets/subcategories/transport/parts-repair.png',
  'Parts & repair': '/assets/subcategories/transport/ride-sharing.png',
  'Dorm essentials': '/assets/subcategories/items/dorm-essentials.png',
  Kitchenware: '/assets/subcategories/items/kitchenware.png',
  Clothing: '/assets/subcategories/items/clothing.png',
  'Bags & luggage': '/assets/subcategories/items/bags-luggage.png',
  'Home decor': '/assets/subcategories/items/home-decor.png',
  'Small appliances': '/assets/subcategories/items/small-appliances.png',
  Bundles: '/assets/subcategories/items/bundles.png',
  'Translation & paperwork': '/assets/subcategories/services/translation-paperwork.png',
  'Airport pickup': '/assets/subcategories/services/airport-pickup.png',
  'Moving help': '/assets/subcategories/services/moving-help.png',
  'Photo shoots': '/assets/subcategories/services/photo-shoots.png',
  'Tech setup': '/assets/subcategories/services/tech-setup.png',
  Tutoring: '/assets/subcategories/study/tutoring.png',
  'Errands & delivery': '/assets/subcategories/services/errands-delivery.png',
  'Cleaning help': '/assets/subcategories/services/cleaning-help.png',
  Textbooks: '/assets/subcategories/study/textbooks.png',
  'Study notes': '/assets/subcategories/study/study-notes.png',
  'Language exchange': '/assets/subcategories/study/language-exchange.png',
  'HSK / IELTS prep': '/assets/subcategories/study/hsk-ielts-prep.png',
  Stationery: '/assets/subcategories/study/stationery.png',
  'Study groups': '/assets/subcategories/study/study-groups.png',
  'Other items': '/assets/subcategories/other/other-items.png',
  'Free stuff': '/assets/subcategories/other/free-stuff.png',
  Collectibles: '/assets/subcategories/other/collectibles.png',
  'Hobby gear': '/assets/subcategories/other/hobby-gear.png',
  'Sports gear': '/assets/subcategories/other/sports-gear.png',
  'Beauty & care': '/assets/subcategories/other/beauty-care.png',
  'Pet supplies': '/assets/subcategories/other/pet-supplies.png'
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
    subcategory: 'Translation & paperwork',
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
    subcategory: 'Bikes',
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
    subcategory: 'Dorm essentials',
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

function toLookupKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function getFallbackImage(categoryId) {
  return categoryFallbackImages[categoryId] || categoryFallbackImages.items
}

function addOneMonth(value) {
  const baseDate = value ? new Date(value) : new Date()
  const date = Number.isNaN(baseDate.getTime()) ? new Date() : new Date(baseDate)
  date.setMonth(date.getMonth() + 1)
  return date.toISOString()
}

function normalizeSellerProSubscription(rawSubscription = {}) {
  const nickname = String(rawSubscription.nickname || '').trim()
  const sellerKey = toLookupKey(rawSubscription.sellerKey || '')
  const nicknameKey = toLookupKey(rawSubscription.nicknameKey || nickname)
  const wechat = String(rawSubscription.wechat || '').trim()
  const wechatKey = toLookupKey(rawSubscription.wechatKey || wechat)
  const id = String(rawSubscription.id || `pro-${sellerKey || nicknameKey}`)
  const grantedAt = String(rawSubscription.grantedAt || '')
  const expiresAt = String(rawSubscription.expiresAt || addOneMonth(grantedAt))
  const expiresAtTs = Date.parse(expiresAt)
  const isExpired = Number.isFinite(expiresAtTs) && expiresAtTs <= Date.now()

  return {
    id,
    sellerKey,
    nickname,
    nicknameKey,
    wechat,
    wechatKey,
    isActive: rawSubscription.isActive !== false && !isExpired,
    grantedAt,
    expiresAt,
    grantedBy: String(rawSubscription.grantedBy || 'admin')
  }
}

function getStoredSellerProSubscriptions() {
  const stored = storage.safeGetStorage(SELLER_PRO_STORAGE_KEY, [])
  return (Array.isArray(stored) ? stored : [])
    .map((subscription) => normalizeSellerProSubscription(subscription))
    .filter((subscription) => subscription.id && (subscription.sellerKey || subscription.nicknameKey || subscription.wechatKey))
}

function saveSellerProSubscriptions(subscriptions) {
  storage.safeSetStorage(SELLER_PRO_STORAGE_KEY, subscriptions)
}

function revokeSellerProSubscription(id) {
  const targetId = String(id || '')

  if (!targetId) {
    return null
  }

  const subscriptions = getStoredSellerProSubscriptions()
  const target = subscriptions.find((subscription) => subscription.id === targetId)

  if (!target) {
    return null
  }

  const nextSubscriptions = subscriptions.map((subscription) => (
    subscription.id === targetId
      ? normalizeSellerProSubscription({
        ...subscription,
        isActive: false,
        expiresAt: subscription.expiresAt || new Date(Date.now()).toISOString()
      })
      : subscription
  ))

  saveSellerProSubscriptions(nextSubscriptions)
  return nextSubscriptions.find((subscription) => subscription.id === targetId) || null
}

function getSellerProLookup() {
  const activeSubscriptions = getStoredSellerProSubscriptions()
    .filter((subscription) => subscription.isActive)

  const sellerKeys = new Set()
  const nicknameKeys = new Set()
  const wechatKeys = new Set()

  activeSubscriptions.forEach((subscription) => {
    if (subscription.sellerKey) {
      sellerKeys.add(subscription.sellerKey)
    }
    if (subscription.nicknameKey) {
      nicknameKeys.add(subscription.nicknameKey)
    }
    if (subscription.wechatKey) {
      wechatKeys.add(subscription.wechatKey)
    }
  })

  return { sellerKeys, nicknameKeys, wechatKeys }
}

function isSellerProSeller(sellerKey, sellerName, sellerWechat = '', lookup = null) {
  const safeLookup = lookup && lookup.sellerKeys && lookup.nicknameKeys && lookup.wechatKeys
    ? lookup
    : getSellerProLookup()
  const normalizedSellerKey = toLookupKey(sellerKey)
  const normalizedSellerName = toLookupKey(sellerName)
  const normalizedSellerWechat = toLookupKey(sellerWechat)
  return safeLookup.sellerKeys.has(normalizedSellerKey) ||
    safeLookup.nicknameKeys.has(normalizedSellerName) ||
    safeLookup.wechatKeys.has(normalizedSellerWechat)
}

function decorateListingSellerPro(listing = {}, sellerProLookup = null) {
  const seller = listing.seller || {}
  const sellerKey = getSellerKey(listing)
  const isSellerPro = isSellerProSeller(sellerKey, seller.name || '', seller.wechat || '', sellerProLookup)

  if (!isSellerPro) {
    return {
      ...listing,
      isSellerPro: false
    }
  }

  return {
    ...listing,
    isSellerPro: true,
    seller: {
      ...seller,
      badge: 'Seller Pro'
    }
  }
}

function normalizeCoordinate(value) {
  const coordinate = Number(value)
  return Number.isFinite(coordinate) ? coordinate : null
}

function normalizePromotion(rawPromotion = {}) {
  const now = Date.now()
  const status = String(rawPromotion.status || 'none')
  const planId = rawPromotion.plan && PROMOTION_PLAN_CONFIGS[rawPromotion.plan]
    ? rawPromotion.plan
    : 'featured_1d'
  const requestedAt = String(rawPromotion.requestedAt || '')
  const activatedAt = String(rawPromotion.activatedAt || '')
  const activeUntil = String(rawPromotion.activeUntil || '')
  const activeUntilTs = Date.parse(activeUntil)
  const isActive = status === 'active' && Number.isFinite(activeUntilTs) && activeUntilTs > now
  const normalizedStatus = isActive
    ? 'active'
    : status === 'requested'
      ? 'requested'
      : status === 'active'
        ? 'expired'
        : status

  return {
    status: ['none', 'requested', 'active', 'expired'].includes(normalizedStatus) ? normalizedStatus : 'none',
    plan: planId,
    requestedAt,
    activatedAt,
    activeUntil,
    label: PROMOTION_PLAN_CONFIGS[planId].label,
    priceLabel: PROMOTION_PLAN_CONFIGS[planId].priceLabel
  }
}

function decorateListingPromotion(listing = {}) {
  const promotion = normalizePromotion(listing.promotion || {})

  return {
    ...listing,
    promotion,
    promotionStatus: promotion.status,
    promotionPlan: promotion.plan,
    promotionRequestedAt: promotion.requestedAt,
    promotionActiveUntil: promotion.activeUntil,
    isPromotionRequested: promotion.status === 'requested',
    isPromoted: promotion.status === 'active'
  }
}

function sortByPromotionPriority(listings = []) {
  return [...listings].sort((a, b) => {
    const promotedDiff = Number(Boolean(b && b.isPromoted)) - Number(Boolean(a && a.isPromoted))
    if (promotedDiff !== 0) {
      return promotedDiff
    }

    const sellerProDiff = Number(Boolean(b && b.isSellerPro)) - Number(Boolean(a && a.isSellerPro))
    if (sellerProDiff !== 0) {
      return sellerProDiff
    }

    return 0
  })
}

function normalizePromotionRequest(rawRequest = {}) {
  const planId = rawRequest.planId && PROMOTION_PLAN_CONFIGS[rawRequest.planId]
    ? rawRequest.planId
    : 'featured_1d'
  const plan = PROMOTION_PLAN_CONFIGS[planId]
  const status = String(rawRequest.status || 'pending')

  return {
    id: String(rawRequest.id || ''),
    listingId: String(rawRequest.listingId || ''),
    listingTitle: String(rawRequest.listingTitle || ''),
    sellerName: String(rawRequest.sellerName || ''),
    sellerWechat: String(rawRequest.sellerWechat || ''),
    planId,
    planLabel: plan.label,
    durationDays: plan.durationDays,
    priceLabel: plan.priceLabel,
    status: ['pending', 'approved', 'rejected'].includes(status) ? status : 'pending',
    note: String(rawRequest.note || ''),
    source: String(rawRequest.source || 'manual'),
    createdAt: String(rawRequest.createdAt || ''),
    reviewedAt: String(rawRequest.reviewedAt || '')
  }
}

function getStoredPromotionRequests() {
  const stored = storage.safeGetStorage(PROMOTION_REQUESTS_STORAGE_KEY, [])
  return (Array.isArray(stored) ? stored : [])
    .map((request) => normalizePromotionRequest(request))
    .filter((request) => request.id && request.listingId)
}

function savePromotionRequests(requests) {
  storage.safeSetStorage(PROMOTION_REQUESTS_STORAGE_KEY, requests)
}

function normalizeCustomListing(rawListing) {
  const categoryId = rawListing.categoryId || 'items'
  const images = Array.isArray(rawListing.images) ? rawListing.images.filter(Boolean) : []
  const image = images[0] || rawListing.image || getFallbackImage(categoryId)
  const isSold = Boolean(rawListing.isSold)
  const soldOnUniMarket = isSold ? rawListing.soldOnUniMarket !== false : false
  const promotion = normalizePromotion(rawListing.promotion || {})

  return {
    id: Number(rawListing.id),
    title: rawListing.title || 'Untitled listing',
    price: validation.ensurePriceCurrency(rawListing.price || 'Price on request'),
    location: rawListing.location || 'Hangzhou',
    address: validation.sanitizeAddress(rawListing.address || '', validation.DEFAULT_ADDRESS_MAX_LENGTH),
    lat: normalizeCoordinate(rawListing.lat || rawListing.latitude),
    lng: normalizeCoordinate(rawListing.lng || rawListing.longitude),
    university: rawListing.university || 'Student listing',
    image,
    categoryId,
    subcategory: rawListing.subcategory || '',
    condition: rawListing.condition || '',
    isSold,
    soldOnUniMarket,
    soldAt: isSold ? String(rawListing.soldAt || rawListing.updatedAt || rawListing.createdAt || '') : '',
    promotion,
    description: rawListing.description || 'No description yet.',
    images: images.length ? images : [image],
    createdAt: rawListing.createdAt || new Date().toISOString(),
    isCustom: true,
    seller: {
      name: rawListing.seller && rawListing.seller.name ? rawListing.seller.name : 'You',
      badge: rawListing.seller && rawListing.seller.badge ? rawListing.seller.badge : 'Student seller',
      wechat: rawListing.seller && rawListing.seller.wechat ? rawListing.seller.wechat : '',
      note: rawListing.seller && rawListing.seller.note ? rawListing.seller.note : 'Recently published',
      avatarUrl: rawListing.seller && rawListing.seller.avatarUrl ? rawListing.seller.avatarUrl : '',
      bio: rawListing.seller && rawListing.seller.bio ? rawListing.seller.bio : '',
      campus: rawListing.seller && rawListing.seller.campus ? rawListing.seller.campus : rawListing.university || '',
      city: rawListing.seller && rawListing.seller.city ? rawListing.seller.city : rawListing.location || 'Hangzhou',
      joinedAt: rawListing.seller && rawListing.seller.joinedAt ? String(rawListing.seller.joinedAt).slice(0, 10) : ''
    }
  }
}

function getCustomListings() {
  const storedListings = storage.safeGetStorage(CUSTOM_LISTINGS_STORAGE_KEY, [])

  return storedListings
    .map((listing) => normalizeCustomListing(listing))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function getAllListings(options = {}) {
  const { includeResolved = true, includeHiddenByUser = false, includeSold = true } = options
  let listings = reportsStore.decorateListingsWithModeration([...getCustomListings(), ...baseListings])

  if (!includeHiddenByUser) {
    listings = visibilityStore.filterVisibleListings(listings)
  }

  if (!includeSold) {
    listings = listings.filter((listing) => !listing.isSold)
  }

  const resolvedListings = includeResolved
    ? listings
    : listings.filter((listing) => !listing.isHiddenByModeration)
  const sellerProLookup = getSellerProLookup()

  return resolvedListings
    .map((listing) => decorateListingSellerPro(listing, sellerProLookup))
    .map((listing) => decorateListingPromotion(listing))
}

function getListingById(id, options = {}) {
  return getAllListings({ includeResolved: true, ...options }).find((listing) => String(listing.id) === String(id)) || null
}

function getFeedListings() {
  return sortByPromotionPriority(getAllListings({ includeResolved: false, includeSold: false }))
}

function getListingsByCategory(categoryId, options = {}) {
  const { includeResolved = true, includeHiddenByUser = false, includeSold = true } = options
  return sortByPromotionPriority(
    getAllListings({ includeResolved, includeHiddenByUser, includeSold }).filter((listing) => listing.categoryId === categoryId)
  )
}

function getSellerKey(listing) {
  if (!listing) {
    return ''
  }

  const seller = listing.seller || {}
  return toLookupKey(
    seller.wechat || `${seller.name || ''} ${listing.university || ''} ${listing.location || ''}`
  )
}

function getListingsBySellerKey(sellerKey, options = {}) {
  const normalizedKey = toLookupKey(sellerKey)

  if (!normalizedKey) {
    return []
  }

  return getAllListings(options).filter((listing) => getSellerKey(listing) === normalizedKey)
}

function buildSellerAnalytics(listings = [], soldCount = 0) {
  const aggregate = listingStatsStore.getListingsAggregateStats(listings)
  const views = Number(aggregate.views || 0)
  const saves = Number(aggregate.saves || 0)
  const conversionRate = views > 0
    ? Math.round((Number(soldCount || 0) / views) * 1000) / 10
    : 0

  return {
    views,
    saves,
    conversionRate
  }
}

function buildOwnSellerAnalytics(sellerKey, listings = []) {
  const aggregate = listingStatsStore.getListingsAggregateStats(listings)
  const profileStats = profileStatsStore.getProfileStats(sellerKey)

  return {
    profileViews: Number(profileStats.views || 0),
    recentProfileViews: Number(profileStats.recentViews || 0),
    listingSaves: Number(aggregate.saves || 0),
    recentListingSaves: Number(aggregate.recentSaves || 0)
  }
}

function getListingAnalytics(id) {
  const stats = listingStatsStore.getListingStats(id)

  return {
    views: Number(stats.views || 0),
    recentViews: Number(stats.recentViews || 0),
    saves: Number(stats.saves || 0),
    recentSaves: Number(stats.recentSaves || 0)
  }
}

function getSellerProfileByListingId(listingId, options = {}) {
  const { includeHiddenByUser = false } = options
  const listing = getListingById(listingId, { includeHiddenByUser })

  if (!listing) {
    return null
  }

  const sellerKey = getSellerKey(listing)
  const sellerListingsAllStates = getListingsBySellerKey(sellerKey, { includeResolved: true, includeHiddenByUser: true, includeSold: true })
  const listings = getListingsBySellerKey(sellerKey, { includeResolved: false, includeHiddenByUser, includeSold: false })
    .sort((a, b) => Number(b.id) - Number(a.id))
  const soldCount = sellerListingsAllStates
    .filter((item) => Boolean(item && item.isSold && item.soldOnUniMarket))
    .length
  const seller = listing.seller || {}
  const isSellerPro = isSellerProSeller(sellerKey, seller.name || '', seller.wechat || '')
  const analytics = buildSellerAnalytics(sellerListingsAllStates, soldCount)
  const fallbackJoinedAt = sellerListingsAllStates
    .map((item) => item && item.createdAt ? String(item.createdAt).slice(0, 10) : '')
    .filter(Boolean)
    .sort()[0] || '2025-08-26'

  return {
    sellerKey,
    name: seller.name || 'Student seller',
    badge: isSellerPro ? 'Seller Pro' : (seller.badge || 'Community member'),
    wechat: seller.wechat || '',
    note: seller.note || '',
    avatarUrl: seller.avatarUrl || '',
    bio: seller.bio || '',
    campus: seller.campus || listing.university || '',
    city: seller.city || listing.location || 'Hangzhou',
    joinedAt: seller.joinedAt || fallbackJoinedAt,
    listings,
    soldCount,
    isSellerPro,
    analytics
  }
}

function getProfileSellerKey(profile, listings = []) {
  const normalizedListings = Array.isArray(listings) ? listings : []

  if (normalizedListings.length) {
    return getSellerKey(normalizedListings[0])
  }

  const seller = profile || {}
  return toLookupKey(
    seller.wechat || `${seller.name || ''} ${seller.campus || ''} ${seller.city || ''}`
  )
}

function getOwnSellerProfile() {
  const profile = profileStore.getProfile()
  const allMyListings = getMyListings().sort((a, b) => Number(b.id) - Number(a.id))
  const listings = allMyListings.filter((listing) => !listing.isSold)
  const soldCount = allMyListings.filter((listing) => listing.isSold && listing.soldOnUniMarket).length
  const sellerKey = getProfileSellerKey(profile, allMyListings)
  const isSellerPro = isSellerProSeller(sellerKey, profile.name || '', profile.wechat || '')
  const analytics = buildOwnSellerAnalytics(sellerKey, allMyListings)

  return {
    sellerKey,
    name: profile.name || 'You',
    badge: isSellerPro ? 'Seller Pro' : 'Verified student',
    wechat: profile.wechat || '',
    note: listings.length
      ? 'Active on UniMarket'
      : soldCount
        ? `Sold ${soldCount} item${soldCount === 1 ? '' : 's'} on UniMarket`
        : 'Build your profile before your first listing',
    avatarUrl: profile.avatarUrl || '',
    bio: profile.bio || '',
    campus: profile.campus || '',
    city: profile.city || 'Hangzhou',
    joinedAt: profile.joinedAt || '',
    listings,
    soldCount,
    isSellerPro,
    analytics
  }
}

function getSubcategoryCards(categoryId) {
  const category = categoryConfigs[categoryId]

  if (!category) {
    return []
  }

  const listings = getListingsByCategory(categoryId, { includeResolved: false, includeSold: false })

  return category.subcategories.map((name, index) => {
    const matchedListing = listings.find((listing) => listing.subcategory === name && listing.image)
    const fallbackImage = subcategoryFallbackImages[name]

    return {
      id: `${categoryId}-${index}`,
      name,
      image: fallbackImage || (matchedListing ? matchedListing.image : '') || getFallbackImage(categoryId)
    }
  })
}

function getFeedListingsByCategory(categoryId) {
  return getListingsByCategory(categoryId, { includeResolved: false, includeSold: false })
}

function createListing(payload) {
  const customListings = storage.safeGetStorage(CUSTOM_LISTINGS_STORAGE_KEY, [])
  const profile = profileStore.getProfile()
  const isSellerPro = isSellerProSeller('', profile.name || '', profile.wechat || '')
  const nextPayload = {
    ...payload,
    seller: {
      ...(payload && payload.seller ? payload.seller : {}),
      badge: isSellerPro ? 'Seller Pro' : (payload && payload.seller && payload.seller.badge ? payload.seller.badge : 'Student seller')
    }
  }
  const listing = normalizeCustomListing({
    ...nextPayload,
    id: Date.now(),
    createdAt: new Date().toISOString()
  })

  storage.safeSetStorage(CUSTOM_LISTINGS_STORAGE_KEY, [listing, ...customListings])

  return decorateListingPromotion(decorateListingSellerPro(listing))
}

function getPublishCategories() {
  return categories.filter((category) => category.id !== 'all')
}

function getMyListings() {
  const listings = reportsStore.decorateListingsWithModeration(getCustomListings())
    .map((listing) => decorateListingSellerPro(listing))
    .map((listing) => decorateListingPromotion(listing))
  return sortByPromotionPriority(listings)
}

function deleteListing(id) {
  const targetId = String(id)
  const nextListings = storage.safeGetStorage(CUSTOM_LISTINGS_STORAGE_KEY, []).filter(
    (listing) => String(listing.id) !== targetId
  )

  storage.safeSetStorage(CUSTOM_LISTINGS_STORAGE_KEY, nextListings)
}

function updateListing(id, payload) {
  const targetId = String(id)
  const customListings = storage.safeGetStorage(CUSTOM_LISTINGS_STORAGE_KEY, [])
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

  storage.safeSetStorage(CUSTOM_LISTINGS_STORAGE_KEY, nextListings)

  return decorateListingPromotion(decorateListingSellerPro(updatedListing))
}

function setListingSoldState(id, isSold, soldOnUniMarket = true) {
  const sold = Boolean(isSold)

  return updateListing(id, {
    isSold: sold,
    soldOnUniMarket: sold ? Boolean(soldOnUniMarket) : false,
    soldAt: sold ? new Date().toISOString() : ''
  })
}

function getPromotionPlans() {
  return Object.values(PROMOTION_PLAN_CONFIGS).sort((a, b) => a.durationDays - b.durationDays)
}

function getPromotionRequests(options = {}) {
  const statusFilter = options.status ? String(options.status) : ''
  const requests = getStoredPromotionRequests()

  const filtered = statusFilter
    ? requests.filter((request) => request.status === statusFilter)
    : requests

  return filtered
    .map((request) => {
      const listing = getListingById(request.listingId, {
        includeResolved: true,
        includeHiddenByUser: true,
        includeSold: true
      })

      return {
        ...request,
        listingExists: Boolean(listing),
        listingIsSold: Boolean(listing && listing.isSold),
        listingStatusLabel: listing ? (listing.isSold ? 'Sold' : 'Active') : 'Missing',
        isSellerPro: Boolean(listing && listing.isSellerPro)
      }
    })
    .sort((a, b) => {
      const proDiff = Number(Boolean(b && b.isSellerPro)) - Number(Boolean(a && a.isSellerPro))
      if (proDiff !== 0) {
        return proDiff
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
}

function requestListingPromotion(id, planId = 'featured_1d', options = {}) {
  const listing = getListingById(id, { includeSold: true, includeResolved: true, includeHiddenByUser: true })
  if (!listing || !listing.isCustom || listing.isSold) {
    return null
  }

  const safePlanId = PROMOTION_PLAN_CONFIGS[planId] ? planId : 'featured_1d'
  const existingPending = getStoredPromotionRequests()
    .find((request) => request.listingId === String(id) && request.status === 'pending')

  if (listing.isPromoted || existingPending) {
    return listing
  }

  const nowIso = new Date(Date.now()).toISOString()
  const requestId = `promo-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  const plan = PROMOTION_PLAN_CONFIGS[safePlanId]
  const request = normalizePromotionRequest({
    id: requestId,
    listingId: String(id),
    listingTitle: listing.title || 'Untitled listing',
    sellerName: listing.seller && listing.seller.name ? listing.seller.name : 'Seller',
    sellerWechat: listing.seller && listing.seller.wechat ? listing.seller.wechat : '',
    planId: safePlanId,
    status: 'pending',
    note: options.note || '',
    source: options.source || 'manual',
    createdAt: nowIso
  })
  const nextRequests = [request, ...getStoredPromotionRequests()]
  savePromotionRequests(nextRequests)

  const updatedListing = updateListing(id, {
    promotion: {
      status: 'requested',
      plan: safePlanId,
      requestedAt: nowIso,
      activatedAt: '',
      activeUntil: ''
    }
  })

  return updatedListing || decorateListingPromotion({
    ...listing,
    promotion: {
      status: 'requested',
      plan: safePlanId,
      requestedAt: nowIso,
      activatedAt: '',
      activeUntil: ''
    },
    promotionRequestId: requestId,
    promotionPriceLabel: plan.priceLabel
  })
}

function activateListingPromotion(id, options = {}) {
  const listing = getListingById(id, { includeSold: true, includeResolved: true, includeHiddenByUser: true })
  if (!listing || !listing.isCustom || listing.isSold) {
    return null
  }

  const planId = options.planId && PROMOTION_PLAN_CONFIGS[options.planId]
    ? options.planId
    : 'featured_1d'
  const durationHoursRaw = Number(options.durationHours)
  const durationHours = Number.isFinite(durationHoursRaw) && durationHoursRaw > 0
    ? durationHoursRaw
    : PROMOTION_PLAN_CONFIGS[planId].durationHours
  const now = Date.now()
  const activeUntil = new Date(now + durationHours * 60 * 60 * 1000).toISOString()

  return updateListing(id, {
    promotion: {
      status: 'active',
      plan: planId,
      requestedAt: listing.promotionRequestedAt || new Date(now).toISOString(),
      activatedAt: new Date(now).toISOString(),
      activeUntil
    }
  })
}

function rejectListingPromotion(id) {
  const listing = getListingById(id, { includeSold: true, includeResolved: true, includeHiddenByUser: true })
  if (!listing || !listing.isCustom) {
    return null
  }

  return updateListing(id, {
    promotion: {
      status: 'none',
      plan: listing.promotionPlan || 'featured_1d',
      requestedAt: '',
      activatedAt: '',
      activeUntil: ''
    }
  })
}

function reviewPromotionRequest(requestId, action, options = {}) {
  const targetId = String(requestId || '')
  const decision = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : ''
  if (!targetId || !decision) {
    return null
  }

  const requests = getStoredPromotionRequests()
  const target = requests.find((request) => request.id === targetId)
  if (!target || target.status !== 'pending') {
    return null
  }

  let listing = null
  if (decision === 'approved') {
    listing = activateListingPromotion(target.listingId, {
      planId: target.planId,
      durationHours: target.durationDays * 24
    })
  } else {
    listing = rejectListingPromotion(target.listingId)
  }

  const reviewedAt = new Date().toISOString()
  const nextRequests = requests.map((request) => (
    request.id === targetId
      ? normalizePromotionRequest({
        ...request,
        status: decision,
        reviewedAt,
        note: options.note || request.note || ''
      })
      : request
  ))
  savePromotionRequests(nextRequests)

  return {
    request: nextRequests.find((request) => request.id === targetId) || null,
    listing
  }
}

function getSellerProSubscriptions() {
  return getStoredSellerProSubscriptions()
    .filter((subscription) => subscription.isActive)
    .sort((a, b) => new Date(b.grantedAt).getTime() - new Date(a.grantedAt).getTime())
}

function getCurrentSellerPhotoLimit() {
  const profile = profileStore.getProfile()
  const profileSellerKey = getProfileSellerKey(profile, getCustomListings())
  return isSellerProSeller(profileSellerKey, profile.name || '', profile.wechat || '')
    ? SELLER_PRO_PHOTO_LIMIT
    : DEFAULT_PHOTO_LIMIT
}

function grantSellerProByNickname(nickname, options = {}) {
  const normalizedNickname = toLookupKey(nickname)
  const trimmedNickname = String(nickname || '').trim()

  if (!normalizedNickname) {
    return null
  }

  const targets = []
  const pushTarget = (sellerKey, sellerName, sellerWechat = '') => {
    const normalizedSellerKey = toLookupKey(sellerKey)
    const normalizedSellerName = toLookupKey(sellerName)
    const normalizedSellerWechat = toLookupKey(sellerWechat)
    if (!normalizedSellerKey && !normalizedSellerName) {
      return
    }
    targets.push({
      sellerKey: normalizedSellerKey,
      nickname: String(sellerName || trimmedNickname).trim() || trimmedNickname,
      nicknameKey: normalizedSellerName || normalizedNickname,
      wechat: String(sellerWechat || '').trim(),
      wechatKey: normalizedSellerWechat
    })
  }

  ;[...getCustomListings(), ...baseListings].forEach((listing) => {
    const seller = listing && listing.seller ? listing.seller : {}
    if (toLookupKey(seller.name) === normalizedNickname) {
      pushTarget(getSellerKey(listing), seller.name || '', seller.wechat || '')
    }
  })

  const profile = profileStore.getProfile()
  if (toLookupKey(profile.name) === normalizedNickname) {
    const profileSellerKey = getProfileSellerKey(profile, getCustomListings())
    pushTarget(profileSellerKey, profile.name || trimmedNickname, profile.wechat || '')
  }

  const uniqueTargets = targets.reduce((acc, target) => {
    const key = target.sellerKey || `name:${target.nicknameKey}`
    if (!acc.some((item) => (item.sellerKey || `name:${item.nicknameKey}`) === key)) {
      acc.push(target)
    }
    return acc
  }, [])

  if (!uniqueTargets.length) {
    return null
  }

  const nowIso = new Date(Date.now()).toISOString()
  const activeSubscriptions = getStoredSellerProSubscriptions()
  const nextSubscriptions = [...activeSubscriptions]
  let grantedCount = 0

  uniqueTargets.forEach((target) => {
    const matchIndex = nextSubscriptions.findIndex((subscription) => (
      (target.sellerKey && subscription.sellerKey === target.sellerKey) ||
      subscription.nicknameKey === target.nicknameKey ||
      (target.wechatKey && subscription.wechatKey === target.wechatKey)
    ))

    const nextSubscription = normalizeSellerProSubscription({
      id: target.sellerKey ? `pro-${target.sellerKey}` : `pro-name-${target.nicknameKey}`,
      sellerKey: target.sellerKey,
      nickname: target.nickname,
      nicknameKey: target.nicknameKey,
      wechat: target.wechat,
      isActive: true,
      grantedAt: nowIso,
      expiresAt: addOneMonth(nowIso),
      grantedBy: options.grantedBy || 'admin'
    })

    if (matchIndex >= 0) {
      nextSubscriptions[matchIndex] = nextSubscription
    } else {
      nextSubscriptions.push(nextSubscription)
    }

    grantedCount += 1
  })

  saveSellerProSubscriptions(nextSubscriptions)

  return {
    nickname: trimmedNickname || uniqueTargets[0].nickname,
    grantedCount,
    subscriptions: uniqueTargets
  }
}

function syncCurrentProfileIntoListings(previousProfile = null, nextProfile = null) {
  const prevProfile = previousProfile ? profileStore.normalizeProfile(previousProfile) : null
  const currentProfile = profileStore.normalizeProfile(nextProfile || profileStore.getProfile())
  const rawListings = storage.safeGetStorage(CUSTOM_LISTINGS_STORAGE_KEY, [])

  if (!Array.isArray(rawListings) || !rawListings.length) {
    return []
  }

  const previousKeys = new Set()

  if (prevProfile) {
    previousKeys.add(toLookupKey(prevProfile.name))
    previousKeys.add(toLookupKey(prevProfile.wechat))
    previousKeys.add(getProfileSellerKey(prevProfile, rawListings.map((listing) => normalizeCustomListing(listing))))
  }

  const nextListings = rawListings.map((rawListing) => {
    const listing = normalizeCustomListing(rawListing)
    const seller = listing.seller || {}
    const shouldSync = !previousKeys.size ||
      previousKeys.has(getSellerKey(listing)) ||
      previousKeys.has(toLookupKey(seller.name)) ||
      previousKeys.has(toLookupKey(seller.wechat))

    if (!shouldSync) {
      return rawListing
    }

    return {
      ...rawListing,
      seller: {
        ...(rawListing && rawListing.seller ? rawListing.seller : {}),
        name: currentProfile.name,
        wechat: currentProfile.wechat,
        avatarUrl: currentProfile.avatarUrl,
        campus: currentProfile.campus,
        city: currentProfile.city,
        joinedAt: currentProfile.joinedAt
      }
    }
  })

  storage.safeSetStorage(CUSTOM_LISTINGS_STORAGE_KEY, nextListings)
  return nextListings
}

function preserveCurrentProfileSellerPro(previousProfile = null, nextProfile = null) {
  const prevProfile = previousProfile ? profileStore.normalizeProfile(previousProfile) : null
  const currentProfile = profileStore.normalizeProfile(nextProfile || profileStore.getProfile())

  if (!prevProfile) {
    return false
  }

  const currentListings = getCustomListings()
  const prevSellerKey = getProfileSellerKey(prevProfile, currentListings)
  const nextSellerKey = getProfileSellerKey(currentProfile, currentListings)
  const prevNameKey = toLookupKey(prevProfile.name)
  const prevWechatKey = toLookupKey(prevProfile.wechat)
  const nextSubscriptions = getStoredSellerProSubscriptions().map((subscription) => {
    const matched = (prevSellerKey && subscription.sellerKey === prevSellerKey) ||
      (prevNameKey && subscription.nicknameKey === prevNameKey) ||
      (prevWechatKey && subscription.wechatKey === prevWechatKey)

    if (!matched) {
      return subscription
    }

    return normalizeSellerProSubscription({
      ...subscription,
      id: nextSellerKey ? `pro-${nextSellerKey}` : subscription.id,
      sellerKey: nextSellerKey || subscription.sellerKey,
      nickname: currentProfile.name || subscription.nickname,
      nicknameKey: toLookupKey(currentProfile.name || subscription.nickname),
      wechat: currentProfile.wechat || subscription.wechat
    })
  })

  saveSellerProSubscriptions(nextSubscriptions)
  return true
}

function recordListingView(id) {
  return listingStatsStore.incrementViews(id)
}

function recordSellerProfileView(sellerKey) {
  return profileStatsStore.incrementViews(sellerKey)
}

function queueCreateMode(mode) {
  storage.safeSetStorage(CREATE_MODE_STORAGE_KEY, mode)
}

function consumeCreateMode() {
  const mode = storage.safeGetStorage(CREATE_MODE_STORAGE_KEY, null)
  storage.safeRemoveStorage(CREATE_MODE_STORAGE_KEY)
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
  getSellerKey,
  getListingsBySellerKey,
  getSellerProfileByListingId,
  getOwnSellerProfile,
  getListingAnalytics,
  getSubcategoryCards,
  getFeedListingsByCategory,
  createListing,
  getMyListings,
  deleteListing,
  updateListing,
  setListingSoldState,
  getPromotionPlans,
  getPromotionRequests,
  requestListingPromotion,
  activateListingPromotion,
  reviewPromotionRequest,
  getSellerProSubscriptions,
  revokeSellerProSubscription,
  grantSellerProByNickname,
  syncCurrentProfileIntoListings,
  preserveCurrentProfileSellerPro,
  getCurrentSellerPhotoLimit,
  recordListingView,
  recordSellerProfileView,
  sortByPromotionPriority,
  queueCreateMode,
  consumeCreateMode,
  getPublishCategories,
  getFallbackImage
}
