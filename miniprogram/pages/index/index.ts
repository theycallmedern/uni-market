type Category = {
  id: string
  name: string
  emoji: string
  theme: string
}

type Listing = {
  id: number
  title: string
  price: string
  location: string
  university: string
  image: string
  categoryId: string
}

const categories: Category[] = [
  { id: 'all', name: 'All', emoji: '✨', theme: 'cream' },
  { id: 'housing', name: 'Housing', emoji: '🏠', theme: 'rose' },
  { id: 'items', name: 'Items', emoji: '📦', theme: 'mint' },
  { id: 'electronics', name: 'Electronics', emoji: '📱', theme: 'sky' },
  { id: 'services', name: 'Services', emoji: '🛠', theme: 'lilac' },
  { id: 'transport', name: 'Transport', emoji: '🚗', theme: 'peach' },
  { id: 'study', name: 'Study', emoji: '📚', theme: 'butter' },
  { id: 'jobs', name: 'Jobs', emoji: '💼', theme: 'sage' }
]

const listings: Listing[] = [
  {
    id: 1,
    title: 'Room near the ZJU campus',
    price: '3200 RMB',
    location: 'Hangzhou',
    university: 'ZJU',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    categoryId: 'housing'
  },
  {
    id: 2,
    title: 'Shared flat with two international students',
    price: '2100 RMB',
    location: 'Hangzhou',
    university: 'ZJU',
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    categoryId: 'housing'
  },
  {
    id: 3,
    title: 'Studio apartment for one person',
    price: '3900 RMB',
    location: 'Hangzhou',
    university: 'ZJU City College',
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80',
    categoryId: 'housing'
  },
  {
    id: 4,
    title: 'iPhone 14 in great condition',
    price: '2800 RMB',
    location: 'Hangzhou',
    university: 'ZJU City College',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=900&q=80',
    categoryId: 'electronics'
  },
  {
    id: 5,
    title: 'MacBook Air M1 for classes',
    price: '4200 RMB',
    location: 'Hangzhou',
    university: 'ZJU',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
    categoryId: 'electronics'
  },
  {
    id: 6,
    title: 'Sony headphones with case',
    price: '680 RMB',
    location: 'Hangzhou',
    university: 'China Jiliang University',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    categoryId: 'electronics'
  },
  {
    id: 7,
    title: 'Translation help and bank support',
    price: '150 RMB',
    location: 'Hangzhou',
    university: 'ZJU',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=80',
    categoryId: 'services'
  },
  {
    id: 8,
    title: 'Campus bicycle',
    price: '450 RMB',
    location: 'Hangzhou',
    university: 'ZAFU',
    image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=900&q=80',
    categoryId: 'transport'
  },
  {
    id: 9,
    title: 'Ninebot electric scooter',
    price: '1800 RMB',
    location: 'Hangzhou',
    university: 'ZJU',
    image: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=900&q=80',
    categoryId: 'transport'
  },
  {
    id: 10,
    title: 'Used e-bike with charger',
    price: '2400 RMB',
    location: 'Hangzhou',
    university: 'ZAFU',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80',
    categoryId: 'transport'
  },
  {
    id: 11,
    title: 'Chinese tutoring for beginners',
    price: '120 RMB / hour',
    location: 'Hangzhou',
    university: 'ZJU',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
    categoryId: 'study'
  },
  {
    id: 12,
    title: 'Desk lamp and dorm setup bundle',
    price: '180 RMB',
    location: 'Hangzhou',
    university: 'China Jiliang University',
    image: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=900&q=80',
    categoryId: 'items'
  }
]

Page({
  data: {
    search: '',
    categories,
    activeCategoryId: 'all',
    allListings: listings,
    visibleListings: listings
  },

  onSearchInput(e: WechatMiniprogram.Input) {
    this.setData({ search: e.detail.value }, () => {
      this.applyFilters()
    })
  },

  onCategoryTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset
    if (id !== 'all') {
      wx.navigateTo({
        url: `/pages/category/category?id=${id}`
      })
      return
    }

    this.setData({ activeCategoryId: id }, () => {
      this.applyFilters()
    })
  },

  openListing(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/listing/listing?id=${id}`
    })
  },

  applyFilters() {
    const { search, activeCategoryId, allListings } = this.data
    const keyword = search.trim().toLowerCase()

    const visibleListings = allListings.filter((listing) => {
      const matchesCategory = activeCategoryId === 'all' || listing.categoryId === activeCategoryId
      const haystack = `${listing.title} ${listing.location} ${listing.university}`.toLowerCase()
      const matchesSearch = !keyword || haystack.includes(keyword)
      return matchesCategory && matchesSearch
    })

    this.setData({ visibleListings })
  }
})
