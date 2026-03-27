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

const baseListings = []

module.exports = {
  categories,
  categoryTitles,
  categoryConfigs,
  featuredCards,
  categoryFallbackImages,
  subcategoryFallbackImages,
  baseListings
}
