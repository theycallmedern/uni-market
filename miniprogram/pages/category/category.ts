type CategoryConfig = {
  title: string
  region: string
  heroTone: string
  subcategories: string[]
  primaryFilters: string[]
  quickFilters: string[]
  secondaryFilters: string[]
  cta: string
}

const categoryConfigs: Record<string, CategoryConfig> = {
  housing: {
    title: 'Housing',
    region: 'All districts',
    heroTone: 'blue',
    subcategories: ['Private room', 'Shared room', 'Shared flat', 'Studio', 'Full apartment', 'Short-term sublet', 'Dorm takeover'],
    primaryFilters: ['Type', 'Rent mode'],
    quickFilters: ['All', 'Budget', 'Near ZJU'],
    secondaryFilters: ['Move-in date', 'Price'],
    cta: 'Show 120+ listings'
  },
  electronics: {
    title: 'Electronics',
    region: 'All campuses',
    heroTone: 'green',
    subcategories: ['Phones', 'Laptops', 'Tablets', 'Audio', 'Cameras', 'Gaming gear', 'Accessories'],
    primaryFilters: ['Condition', 'Brand'],
    quickFilters: ['All', 'Popular', 'Student deals'],
    secondaryFilters: ['Price', 'Campus'],
    cta: 'Show 90+ listings'
  },
  transport: {
    title: 'Transport',
    region: 'All districts',
    heroTone: 'peach',
    subcategories: ['Bikes', 'E-bikes', 'Scooters', 'Ride-sharing', 'Rentals', 'Parts & repair'],
    primaryFilters: ['Vehicle type', 'Use case'],
    quickFilters: ['All', 'Under 500 RMB', 'Near campus'],
    secondaryFilters: ['Condition', 'Price'],
    cta: 'Show 60+ listings'
  },
  items: {
    title: 'Items',
    region: 'All campuses',
    heroTone: 'mint',
    subcategories: ['Dorm essentials', 'Kitchenware', 'Clothing', 'Bags & luggage', 'Home decor', 'Small appliances', 'Bundles'],
    primaryFilters: ['Item type', 'Condition'],
    quickFilters: ['All', 'Bundles', 'Ready to pick up'],
    secondaryFilters: ['Price', 'Campus'],
    cta: 'Show 75+ listings'
  },
  services: {
    title: 'Services',
    region: 'Hangzhou',
    heroTone: 'violet',
    subcategories: ['Translation & paperwork', 'Airport pickup', 'Moving help', 'Photo shoots', 'Tech setup', 'Errands & delivery', 'Cleaning help'],
    primaryFilters: ['Service type', 'Availability'],
    quickFilters: ['All', 'Trusted', 'English-friendly'],
    secondaryFilters: ['Price', 'Sort'],
    cta: 'Show 40+ listings'
  },
  study: {
    title: 'Study',
    region: 'All campuses',
    heroTone: 'yellow',
    subcategories: ['Tutoring', 'Textbooks', 'Study notes', 'Language exchange', 'HSK / IELTS prep', 'Stationery', 'Study groups'],
    primaryFilters: ['Subject', 'Format'],
    quickFilters: ['All', 'Beginner', 'HSK prep'],
    secondaryFilters: ['Price', 'Campus'],
    cta: 'Show 35+ listings'
  },
  jobs: {
    title: 'Jobs',
    region: 'Hangzhou',
    heroTone: 'sage',
    subcategories: ['Part-time jobs', 'Internships', 'Freelance gigs', 'Remote jobs', 'Tutoring jobs', 'Event staff', 'Campus ambassador'],
    primaryFilters: ['Role type', 'Schedule'],
    quickFilters: ['All', 'Remote', 'Student-friendly'],
    secondaryFilters: ['Pay', 'Sort'],
    cta: 'Show 25+ listings'
  }
}

const featuredCards: Record<string, { title: string; caption: string }[]> = {
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
    { title: 'Dorm essentials', caption: 'Move-in faster' },
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
    { title: 'Part-time jobs', caption: 'Flexible student work' },
    { title: 'Internships', caption: 'Gain experience while studying' },
    { title: 'Remote jobs', caption: 'Flexible work you can do around your schedule' }
  ]
}

Page({
  data: {
    categoryId: '',
    category: null as CategoryConfig | null,
    featured: [] as { title: string; caption: string }[]
  },

  onLoad(query: Record<string, string>) {
    const categoryId = query.id || 'housing'
    const category = categoryConfigs[categoryId] || categoryConfigs.housing
    const featured = featuredCards[categoryId] || featuredCards.housing

    wx.setNavigationBarTitle({
      title: category.title
    })

    this.setData({
      categoryId,
      category,
      featured
    })
  },

  goBack() {
    wx.navigateBack()
  }
})
