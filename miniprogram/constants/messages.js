const COMMON = {
  WRITE_IN_WECHAT_TITLE: 'Write in WeChat',
  WRITE_IN_WECHAT_CONTENT:
    'WeChat copied the seller ID. Open WeChat search and paste it to continue, because Mini Programs cannot jump directly into a personal chat/profile.'
}

const CREATE = {
  RESTORE_DRAFT_TITLE: 'Restore draft?',
  restoreDraftContent: (savedAt) => `Found an unsent listing draft from ${savedAt}.`,
  DRAFT_RESTORED: 'Draft restored',
  LISTING_NOT_FOUND: 'Listing not found',
  UP_TO_5_PHOTOS: 'Up to 5 photos',
  UPDATED: 'Updated',
  PUBLISHED: 'Published',
  SAVE_FAILED: 'Could not save listing',
  VALIDATION: {
    CATEGORY: 'Choose a category',
    CUSTOM_SUBCATEGORY: 'Custom subcategory: 2-40 chars',
    SUBCATEGORY: 'Choose subcategory or type your own',
    CONDITION: 'Choose item condition',
    TITLE: 'Add a clearer title',
    TITLE_MEANINGFUL: 'Title should include letters or numbers',
    PRICE_REQUIRED: 'Enter the price',
    PRICE_LENGTH: 'Price: up to 6 digits',
    PRICE_RANGE: 'Price must be from 1 to 999999',
    ADDRESS: 'Add a clearer address (at least 6 chars)',
    UNIVERSITY: 'Add your university',
    WECHAT_REQUIRED: 'Add your WeChat ID',
    wechatInvalid: (min, max) => `WeChat ID: ${min}-${max} chars, start with letter`,
    DESCRIPTION: 'Write a bit more detail',
    PHOTOS_REQUIRED: 'Add at least one photo',
    duplicateListing: 'Similar active listing already exists',
    publishRateLimit: (waitSeconds) => `Please wait ${waitSeconds}s before posting again`
  }
}

const LISTINGS_MANAGER = {
  LISTING_NOT_FOUND: 'Listing not found',
  LISTED_AGAIN: 'Listed again',
  SOLD_ON_UNIMARKET: 'Sold on UniMarket',
  MOVED_TO_ARCHIVE: 'Moved to archive',
  DELETE_TITLE: 'Delete listing?',
  DELETE_CONTENT: 'This will remove the listing from your listings tab and the marketplace feed.',
  DELETED: 'Deleted'
}

const FAVORITES = {
  CLEAR_TITLE: 'Clear all saved?',
  CLEAR_CONTENT: 'This will remove all saved listings from this device.',
  CLEAR_SUCCESS: 'Saved cleared',
  NO_UNAVAILABLE: 'No unavailable items',
  REMOVE_UNAVAILABLE_TITLE: 'Remove unavailable?',
  removeUnavailableContent: (count) => `Remove ${count} unavailable saved listing${count === 1 ? '' : 's'} from this device?`,
  REMOVE_UNAVAILABLE_SUCCESS: 'Unavailable removed'
}

const LISTING = {
  ITEM_ALREADY_SOLD: 'Item already sold',
  ADDRESS_UNAVAILABLE: 'Address unavailable',
  ADDRESS_COPIED: 'Address copied',
  LINK_COPIED: 'Link copied',
  HIDE_TITLE: 'Hide this listing?',
  HIDE_CONTENT: 'This listing will disappear from your feed, search, and saved results on this device.',
  HIDDEN_SUCCESS: 'Listing hidden',
  BLOCK_TITLE: 'Block this user?',
  blockContent: (sellerName) => `All listings from ${sellerName || 'this seller'} will be hidden on this device.`,
  BLOCKED_SUCCESS: 'User blocked',
  ALREADY_REPORTED: 'Already reported',
  REPORT_DETAILS_TITLE: 'Report details',
  REPORT_DETAILS_PLACEHOLDER: 'Tell us what is wrong',
  REPORT_SENT: 'Report sent'
}

const PROFILE = {
  ADMIN_REQUIRED: 'Admin access required',
  ADMIN_TITLE: 'Admin access',
  ADMIN_PLACEHOLDER: 'Enter admin code',
  ADMIN_CONFIRM: 'Unlock',
  ADMIN_UNLOCKED: 'Admin unlocked',
  ADMIN_WRONG_CODE: 'Wrong code',
  ADMIN_DISABLED: 'Admin disabled'
}

const USER_PROFILE = {
  LINK_COPIED: 'Link copied',
  NAME_MIN: 'Name: at least 2 chars',
  UNIVERSITY_REQUIRED: 'Add your university',
  wechatInvalid: (min, max) => `WeChat ID: ${min}-${max} chars, start with letter`,
  PROFILE_SAVED: 'Profile saved',
  REVIEW_ALREADY_ADDED: 'Review already added',
  REVIEW_UNLOCK_REQUIRED: 'Write in WeChat first',
  REVIEW_MODAL_TITLE: 'Leave a review',
  REVIEW_MODAL_PLACEHOLDER: 'Optional note about the seller',
  REVIEW_MODAL_CONFIRM: 'Post',
  REVIEW_ALREADY_EXISTS: 'Review already exists',
  REVIEW_POSTED: 'Review posted',
  BLOCK_TITLE: 'Block this user?',
  blockContent: (sellerName) => `All listings from ${sellerName || 'this seller'} will be hidden on this device.`,
  BLOCKED_SUCCESS: 'User blocked',
  ALREADY_REPORTED: 'Already reported',
  REPORT_PROFILE_TITLE: 'Report profile',
  REPORT_PROFILE_PLACEHOLDER: 'Tell us what is wrong',
  REPORT_PROFILE_CONFIRM: 'Send',
  REPORT_SENT: 'Report sent'
}

const MODERATION = {
  STATUS_UPDATED: 'Status updated'
}

module.exports = {
  COMMON,
  CREATE,
  LISTINGS_MANAGER,
  FAVORITES,
  LISTING,
  PROFILE,
  USER_PROFILE,
  MODERATION
}
