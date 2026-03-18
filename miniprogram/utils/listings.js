function parsePriceValue(price = '') {
  const match = String(price).replace(/,/g, '').match(/(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : 0
}

function uniqueOptions(listings, field) {
  const values = (Array.isArray(listings) ? listings : [])
    .map((listing) => (listing ? listing[field] : ''))
    .filter(Boolean)

  return [...new Set(values)]
}

module.exports = {
  parsePriceValue,
  uniqueOptions
}
