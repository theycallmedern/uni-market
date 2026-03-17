Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    images: {
      type: Array,
      value: []
    },
    currentIndex: {
      type: Number,
      value: 0
    }
  },

  data: {
    internalIndex: 0,
    currentImage: '',
    currentScale: 1
  },

  observers: {
    'visible, images, currentIndex': function (visible, images, currentIndex) {
      const safeImages = Array.isArray(images) ? images.filter(Boolean) : []
      const maxIndex = safeImages.length ? safeImages.length - 1 : 0
      const nextIndex = Math.min(Math.max(Number(currentIndex) || 0, 0), maxIndex)

      this.setData({
        internalIndex: nextIndex,
        currentImage: safeImages[nextIndex] || safeImages[0] || '',
        currentScale: 1
      })
    }
  },

  methods: {
    handleOverlayTap() {
      this.setData({
        currentScale: 1
      })
      this.triggerEvent('close')
    },

    stopTap() {},

    handleClose() {
      this.setData({
        currentScale: 1
      })
      this.triggerEvent('close')
    },

    handleSwiperChange(e) {
      const images = Array.isArray(this.data.images) ? this.data.images.filter(Boolean) : []
      const nextIndex = Number(e.detail.current) || 0

      this.setData({
        internalIndex: nextIndex,
        currentImage: images[nextIndex] || images[0] || '',
        currentScale: 1
      })

      this.triggerEvent('change', {
        current: nextIndex
      })
    },

    handleScale(e) {
      this.setData({
        currentScale: Number(e.detail.scale || 1)
      })
    }
  }
})
