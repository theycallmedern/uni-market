const reportsStore = require('../utils/reports')
const visibilityStore = require('../utils/visibility')
const profileStore = require('../utils/profile')

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
    subcategories: ['Private room', 'Shared room', 'Shared flat', 'Studio', 'Full apartment', 'Short-term sublet', 'Dorm takeover'],
    primaryFilters: ['Type', 'Campus'],
    quickFilters: ['All', 'Budget', 'ZJU'],
    secondaryFilters: ['Price', 'Sort'],
    cta: 'Show 120+ listings'
  },
  electronics: {
    title: 'Electronics',
    region: 'All campuses',
    heroTone: 'green',
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
  jobs: {
    title: 'Jobs',
    region: 'Hangzhou',
    heroTone: 'sage',
    subcategories: ['Part-time jobs', 'Internships', 'Freelance gigs', 'Remote jobs', 'Tutoring jobs', 'Event staff', 'Campus ambassador'],
    primaryFilters: ['Role', 'University'],
    quickFilters: ['All', 'Remote jobs', 'Tutoring jobs'],
    secondaryFilters: ['Pay', 'Sort'],
    cta: 'Show 25+ listings'
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
  jobs: [
    { title: 'Part-time jobs', caption: 'Flexible work around classes' },
    { title: 'Internships', caption: 'Gain experience while studying' },
    { title: 'Remote jobs', caption: 'Flexible work you can do around your schedule' }
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

const subcategoryFallbackImages = {
  'Private room': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  'Shared room': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
  'Shared flat': 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
  Studio: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
  'Full apartment': 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1200&q=80',
  'Short-term sublet': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  'Dorm takeover': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
  Phones: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80',
  Laptops: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80',
  Tablets: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=80',
  Audio: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
  Cameras: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
  'Gaming gear': 'https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?auto=format&fit=crop&w=1200&q=80',
  Accessories: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=80',
  Bikes: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1200&q=80',
  'E-bikes': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80',
  Scooters: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=1200&q=80',
  'Ride-sharing': 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?auto=format&fit=crop&w=1200&q=80',
  Rentals: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80',
  'Parts & repair': 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1200&q=80',
  'Dorm essentials': 'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1200&q=80',
  Kitchenware: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=1200&q=80',
  Clothing: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
  'Bags & luggage': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
  'Home decor': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
  'Small appliances': 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=1200&q=80',
  Bundles: 'https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?auto=format&fit=crop&w=1200&q=80',
  'Translation & paperwork': 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80',
  'Airport pickup': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
  'Moving help': 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=1200&q=80',
  'Photo shoots': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  'Tech setup': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  Tutoring: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
  'Errands & delivery': 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=1200&q=80',
  'Cleaning help': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
  Textbooks: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
  'Study notes': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
  'Language exchange': 'https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1200&q=80',
  'HSK / IELTS prep': 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=1200&q=80',
  Stationery: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80',
  'Study groups': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
  'Part-time jobs': 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
  Internships: 'https://images.unsplash.com/photo-1522202222206-b75035e1f3c0?auto=format&fit=crop&w=1200&q=80',
  'Freelance gigs': 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
  'Remote jobs': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  'Tutoring jobs': 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80',
  'Event staff': 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
  'Campus ambassador': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80'
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

function toLookupKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
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
      note: rawListing.seller && rawListing.seller.note ? rawListing.seller.note : 'Recently published',
      avatarUrl: rawListing.seller && rawListing.seller.avatarUrl ? rawListing.seller.avatarUrl : '',
      bio: rawListing.seller && rawListing.seller.bio ? rawListing.seller.bio : '',
      campus: rawListing.seller && rawListing.seller.campus ? rawListing.seller.campus : rawListing.university || '',
      city: rawListing.seller && rawListing.seller.city ? rawListing.seller.city : rawListing.location || 'Hangzhou',
      joinedAt: rawListing.seller && rawListing.seller.joinedAt ? String(rawListing.seller.joinedAt).slice(0, 10) : ''
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
  const { includeResolved = true, includeHiddenByUser = false } = options
  let listings = reportsStore.decorateListingsWithModeration([...getCustomListings(), ...baseListings])

  if (!includeHiddenByUser) {
    listings = visibilityStore.filterVisibleListings(listings)
  }

  if (includeResolved) {
    return listings
  }

  return listings.filter((listing) => !listing.isHiddenByModeration)
}

function getListingById(id, options = {}) {
  return getAllListings({ includeResolved: true, ...options }).find((listing) => String(listing.id) === String(id)) || null
}

function getFeedListings() {
  return getAllListings({ includeResolved: false })
}

function getListingsByCategory(categoryId, options = {}) {
  const { includeResolved = true, includeHiddenByUser = false } = options
  return getAllListings({ includeResolved, includeHiddenByUser }).filter((listing) => listing.categoryId === categoryId)
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

function getSellerProfileByListingId(listingId, options = {}) {
  const { includeHiddenByUser = false } = options
  const listing = getListingById(listingId, { includeHiddenByUser })

  if (!listing) {
    return null
  }

  const sellerKey = getSellerKey(listing)
  const listings = getListingsBySellerKey(sellerKey, { includeResolved: false, includeHiddenByUser })
    .sort((a, b) => Number(b.id) - Number(a.id))

  const seller = listing.seller || {}
  const fallbackJoinedAt = listings
    .map((item) => item && item.createdAt ? String(item.createdAt).slice(0, 10) : '')
    .filter(Boolean)
    .sort()[0] || '2025-08-26'

  return {
    sellerKey,
    name: seller.name || 'Student seller',
    badge: seller.badge || 'Community member',
    wechat: seller.wechat || '',
    note: seller.note || '',
    avatarUrl: seller.avatarUrl || '',
    bio: seller.bio || '',
    campus: seller.campus || listing.university || '',
    city: seller.city || listing.location || 'Hangzhou',
    joinedAt: seller.joinedAt || fallbackJoinedAt,
    listings
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
  const listings = getMyListings().sort((a, b) => Number(b.id) - Number(a.id))
  const sellerKey = getProfileSellerKey(profile, listings)

  return {
    sellerKey,
    name: profile.name || 'You',
    badge: 'Verified student',
    wechat: profile.wechat || '',
    note: listings.length ? 'Active on UniMarket' : 'Build your profile before your first listing',
    avatarUrl: profile.avatarUrl || '',
    bio: profile.bio || '',
    campus: profile.campus || '',
    city: profile.city || 'Hangzhou',
    joinedAt: profile.joinedAt || '',
    listings
  }
}

function getSubcategoryCards(categoryId) {
  const category = categoryConfigs[categoryId]

  if (!category) {
    return []
  }

  const listings = getListingsByCategory(categoryId, { includeResolved: false })

  return category.subcategories.map((name, index) => {
    const matchedListing = listings.find((listing) => listing.subcategory === name && listing.image)

    return {
      id: `${categoryId}-${index}`,
      name,
      image: matchedListing ? matchedListing.image : subcategoryFallbackImages[name] || getFallbackImage(categoryId)
    }
  })
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
  getSellerKey,
  getListingsBySellerKey,
  getSellerProfileByListingId,
  getOwnSellerProfile,
  getSubcategoryCards,
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
