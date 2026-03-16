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
    subcategories: ['Apartment', 'Room', 'Shared flat', 'Studio', 'Near campus', 'Long-term stay'],
    primaryFilters: ['Type', 'Rent mode'],
    quickFilters: ['All', 'Budget', 'Near ZJU'],
    secondaryFilters: ['Move-in date', 'Price'],
    cta: 'Show 120+ listings'
  },
  electronics: {
    title: 'Electronics',
    region: 'All campuses',
    heroTone: 'green',
    subcategories: ['Phones', 'Audio & video', 'Computer parts', 'Gaming', 'Laptops', 'Cameras'],
    primaryFilters: ['Condition', 'Brand'],
    quickFilters: ['All', 'Popular', 'Student deals'],
    secondaryFilters: ['Price', 'Campus'],
    cta: 'Show 90+ listings'
  },
  transport: {
    title: 'Transport',
    region: 'All districts',
    heroTone: 'peach',
    subcategories: ['Bicycles', 'Scooters', 'E-bikes', 'Rentals', 'Accessories', 'Repairs'],
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

const featuredCards: Record<string, { title: string; caption: string }[]> = {
  housing: [
    { title: 'Student rooms', caption: 'Near campus' },
    { title: 'Shared flats', caption: 'Trusted roommates' },
    { title: 'Studios', caption: 'Private living' }
  ],
  electronics: [
    { title: 'Phones', caption: 'Used & like new' },
    { title: 'Laptops', caption: 'For study & work' },
    { title: 'Accessories', caption: 'Chargers, stands, more' }
  ],
  transport: [
    { title: 'Campus bikes', caption: 'Quick daily commute' },
    { title: 'Scooters', caption: 'Fast city rides' },
    { title: 'Repair gear', caption: 'Parts and tools' }
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
