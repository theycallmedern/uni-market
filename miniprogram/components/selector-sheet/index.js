Component({
  properties: {
    options: {
      type: Array,
      value: []
    },
    value: {
      type: Number,
      value: 0
    },
    title: {
      type: String,
      value: 'Select option'
    },
    rangeKey: {
      type: String,
      value: ''
    },
    themeMode: {
      type: String,
      value: 'light'
    },
    disabled: {
      type: Boolean,
      value: false
    }
  },

  data: {
    open: false,
    currentValue: 0,
    optionLabels: []
  },

  lifetimes: {
    attached() {
      this.syncState()
    }
  },

  observers: {
    'options,value,rangeKey': function () {
      this.syncState()
    }
  },

  methods: {
    syncState() {
      const options = Array.isArray(this.data.options) ? this.data.options : []
      const optionLabels = options.map((option) => this.getOptionLabel(option))
      const maxIndex = Math.max(optionLabels.length - 1, 0)
      const currentValue = Math.min(Math.max(Number(this.data.value) || 0, 0), maxIndex)

      this.setData({
        optionLabels,
        currentValue
      })
    },

    getOptionLabel(option) {
      if (option && typeof option === 'object' && this.data.rangeKey) {
        return String(option[this.data.rangeKey] || '')
      }

      return String(option || '')
    },

    openSheet() {
      if (this.data.disabled || !this.data.optionLabels.length) {
        return
      }

      this.setData({
        open: true,
        currentValue: Number(this.data.value) || 0
      })
    },

    closeSheet() {
      this.setData({
        open: false
      })
    },

    noop() {},

    onOptionTap(e) {
      const nextValue = Number(e.currentTarget.dataset.index)

      this.setData({
        open: false,
        currentValue: nextValue
      })

      this.triggerEvent('change', {
        value: nextValue
      })
    }
  }
})
