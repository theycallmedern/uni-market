const localeStore = require('../utils/locale')

const EN_MESSAGES = {
  COMMON: {
    WRITE_IN_WECHAT_TITLE: 'Write in WeChat',
    WRITE_IN_WECHAT_CONTENT:
      'WeChat copied the seller ID. Open WeChat search and paste it to continue, because Mini Programs cannot jump directly into a personal chat/profile.'
  },
  CREATE: {
    RESTORE_DRAFT_TITLE: 'Restore draft?',
    restoreDraftContent: (savedAt) => `Found an unsent listing draft from ${savedAt}.`,
    DRAFT_RESTORED: 'Draft restored',
    LISTING_NOT_FOUND: 'Listing not found',
    UP_TO_5_PHOTOS: 'Up to 5 photos',
    UPDATED: 'Updated',
    PUBLISHED: 'Published',
    PROMOTION_CONTACT_WECHAT: 'miskathaa',
    PROMOTION_OFFER_TITLE: 'Promote this listing?',
    PROMOTION_OFFER_COPY:
      'Featured listings appear first in search and category feeds, get a visible Featured badge, and usually receive more views.',
    promotionOfferContent: (plansText) =>
      `Featured listings appear first in search and category feeds, get a visible Featured badge, and usually receive more views.\n\nPlans:\n${plansText}`,
    PROMOTION_PLAN_PICKER_TITLE: 'Choose promotion duration',
    PROMOTION_REQUEST_SENT: 'Promotion request sent',
    PROMOTION_CONTACT_COPIED: 'Support WeChat copied',
    promotionContactModalContent: (wechatId, planLabel, priceLabel) =>
      `For ${planLabel} (${priceLabel}), write in WeChat: ${wechatId}. We copied this ID for you.`,
    SAVE_FAILED: 'Could not save listing',
    BACKEND_MEDIA_REQUIRED: 'Backend publish is enabled, but photo upload is not ready yet',
    ADDRESS_HINT:
      'Use a real meetup point: area/campus + building or gate + room/number. Example: Xihu District, ZJU Yuquan Campus, Gate 3, Building 2, Room 402',
    VALIDATION: {
      CATEGORY: 'Choose a category',
      CUSTOM_SUBCATEGORY: 'Custom subcategory: 2-40 chars',
      SUBCATEGORY: 'Choose subcategory or type your own',
      CONDITION: 'Choose item condition',
      TITLE: 'Add a clearer title',
      TITLE_MEANINGFUL: 'Title should include letters or numbers',
      TITLE_LANGUAGE: 'Title can only use English or Chinese',
      PRICE_REQUIRED: 'Enter the price',
      PRICE_LENGTH: 'Price: up to 6 digits',
      PRICE_RANGE: 'Price must be from 1 to 999999',
      ADDRESS: 'Add a clearer address (at least 6 chars)',
      ADDRESS_MEANINGFUL: 'Address is too vague. Add area + details (for example: road/campus + building/gate/room)',
      ADDRESS_LANGUAGE: 'Address can only use English or Chinese',
      UNIVERSITY: 'Add your university',
      WECHAT_REQUIRED: 'Add your WeChat ID',
      wechatInvalid: (min, max) => `WeChat ID: ${min}-${max} chars, start with letter`,
      DESCRIPTION: 'Write a bit more detail',
      DESCRIPTION_LANGUAGE: 'Description can only use English or Chinese',
      PHOTOS_REQUIRED: 'Add at least one photo',
      duplicateListing: 'Similar active listing already exists',
      publishRateLimit: (waitSeconds) => `Please wait ${waitSeconds}s before posting again`
    }
  },
  LISTINGS_MANAGER: {
    LISTING_NOT_FOUND: 'Listing not found',
    LISTED_AGAIN: 'Listed again',
    RESTORED_FROM_ARCHIVE: 'Restored from archive',
    SOLD_ON_UNIMARKET: 'Sold on UniMarket',
    MOVED_TO_ARCHIVE: 'Moved to archive',
    PROMOTE_TITLE: 'Promote listing?',
    promoteContent: (planLabel, priceLabel) =>
      `${planLabel} costs ${priceLabel}. Featured listings are pinned higher in feed/results and get a Featured badge.`,
    PROMOTE_PLAN_PICKER_TITLE: 'Choose promotion duration',
    PROMOTE_REQUESTED: 'Promotion request sent',
    PROMOTE_ALREADY_ACTIVE: 'This listing is already featured',
    PROMOTE_ALREADY_REQUESTED: 'Promotion already requested',
    PROMOTE_SOLD_UNAVAILABLE: 'Only active listings can be promoted',
    PROMOTION_ACTIVATED: 'Promotion approved',
    PROMOTION_REJECTED: 'Promotion rejected',
    PROMOTION_CONTACT_COPIED: 'Support WeChat copied',
    promotionContactModalContent: (wechatId, planLabel, priceLabel) =>
      `For ${planLabel} (${priceLabel}), write in WeChat: ${wechatId}. We copied this ID for you.`,
    DELETE_TITLE: 'Delete listing?',
    DELETE_CONTENT: 'This will remove the listing from your listings tab and the marketplace feed.',
    DELETED: 'Deleted'
  },
  FAVORITES: {
    CLEAR_TITLE: 'Clear all saved?',
    CLEAR_CONTENT: 'This will remove all saved listings from this device.',
    CLEAR_SUCCESS: 'Saved cleared',
    NO_UNAVAILABLE: 'No unavailable items',
    REMOVE_UNAVAILABLE_TITLE: 'Remove unavailable?',
    removeUnavailableContent: (count) =>
      `Remove ${count} unavailable saved listing${count === 1 ? '' : 's'} from this device?`,
    REMOVE_UNAVAILABLE_SUCCESS: 'Unavailable removed'
  },
  LISTING: {
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
  },
  PROFILE: {
    ADMIN_REQUIRED: 'Admin access required',
    ADMIN_TITLE: 'Admin access',
    ADMIN_PLACEHOLDER: 'Enter admin code',
    ADMIN_CONFIRM: 'Unlock',
    ADMIN_UNLOCKED: 'Admin unlocked',
    ADMIN_WRONG_CODE: 'Wrong code',
    ADMIN_DISABLED: 'Admin disabled',
    SELLER_PRO_TITLE: 'Upgrade to Seller Pro',
    SELLER_PRO_REQUEST_SENT: 'Seller Pro request sent',
    SELLER_PRO_ALREADY_REQUESTED: 'Seller Pro request already sent',
    SELLER_PRO_CONTACT_COPIED: 'Support WeChat copied',
    sellerProOfferContent: (priceLabel) =>
      `Seller Pro (${priceLabel}) helps your profile stand out and attract more buyers.\n\nYou get:\n• Stronger visibility in feed with a premium seller look\n• Up to 10 photos per listing to present items better\n• Custom seller badge to build trust faster\n• Advanced analytics (views, saves, conversion) to learn what works and post smarter\n• Priority support and faster moderation turnaround\n\nConnect Seller Pro now?`,
    sellerProContactModalContent: (wechatId) =>
      `For Seller Pro setup, write in WeChat: ${wechatId}. We copied this ID for you.`
  },
  USER_PROFILE: {
    LINK_COPIED: 'Link copied',
    INSTAGRAM_COPIED: 'Instagram copied',
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
  },
  MODERATION: {
    STATUS_UPDATED: 'Status updated',
    PROMOTION_APPROVED: 'Promotion approved',
    PROMOTION_REJECTED: 'Promotion rejected',
    SELLER_PRO_TITLE: 'Grant Seller Pro',
    SELLER_PRO_PLACEHOLDER: 'Enter seller nickname',
    SELLER_PRO_CONFIRM: 'Grant',
    SELLER_PRO_NOT_FOUND: 'Seller with this nickname not found',
    SELLER_PRO_APPROVED: 'Seller Pro approved',
    SELLER_PRO_REJECTED: 'Seller Pro request rejected',
    SELLER_PRO_REVOKED: 'Seller Pro removed',
    sellerProGranted: (grantedCount) => `Seller Pro granted to ${grantedCount} seller${grantedCount === 1 ? '' : 's'}`
  }
}

const ZH_MESSAGES = {
  COMMON: {
    WRITE_IN_WECHAT_TITLE: '去微信联系',
    WRITE_IN_WECHAT_CONTENT:
      '卖家的微信号已复制。请打开微信搜索并粘贴继续，因为小程序不能直接跳转到个人聊天或主页。'
  },
  CREATE: {
    RESTORE_DRAFT_TITLE: '恢复草稿？',
    restoreDraftContent: (savedAt) => `发现一条保存于 ${savedAt} 的未发布草稿。`,
    DRAFT_RESTORED: '草稿已恢复',
    LISTING_NOT_FOUND: '未找到该发布',
    UP_TO_5_PHOTOS: '最多 5 张照片',
    UPDATED: '已更新',
    PUBLISHED: '已发布',
    PROMOTION_CONTACT_WECHAT: 'miskathaa',
    PROMOTION_OFFER_TITLE: '推广这条发布？',
    PROMOTION_OFFER_COPY:
      '推广后的发布会优先出现在搜索和分类信息流中，带有明显的 Featured 标识，通常能获得更多浏览。',
    promotionOfferContent: (plansText) =>
      `推广后的发布会优先出现在搜索和分类信息流中，带有明显的 Featured 标识，通常能获得更多浏览。\n\n方案：\n${plansText}`,
    PROMOTION_PLAN_PICKER_TITLE: '选择推广时长',
    PROMOTION_REQUEST_SENT: '推广申请已发送',
    PROMOTION_CONTACT_COPIED: '客服微信已复制',
    promotionContactModalContent: (wechatId, planLabel, priceLabel) =>
      `如需 ${planLabel}（${priceLabel}），请在微信联系：${wechatId}。该微信号已为你复制。`,
    SAVE_FAILED: '保存发布失败',
    BACKEND_MEDIA_REQUIRED: '已启用后端发布，但图片上传还没有准备好',
    ADDRESS_HINT:
      '请填写真实见面地点：区域/校区 + 楼栋或门口 + 房间/门牌。例如：西湖区，浙大玉泉校区 3 号门，2 号楼 402 室',
    VALIDATION: {
      CATEGORY: '请选择分类',
      CUSTOM_SUBCATEGORY: '自定义子分类需为 2-40 个字符',
      SUBCATEGORY: '请选择子分类或自行输入',
      CONDITION: '请选择成色',
      TITLE: '请填写更清晰的标题',
      TITLE_MEANINGFUL: '标题需要包含字母或数字',
      TITLE_LANGUAGE: '标题只能使用英文、俄文或中文',
      PRICE_REQUIRED: '请输入价格',
      PRICE_LENGTH: '价格最多 6 位数字',
      PRICE_RANGE: '价格必须在 1 到 999999 之间',
      ADDRESS: '请填写更清晰的地址（至少 6 个字符）',
      ADDRESS_MEANINGFUL: '地址太模糊了。请补充区域和细节（例如：道路/校区 + 楼栋/门口/房间）',
      ADDRESS_LANGUAGE: '地址只能使用英文、俄文或中文',
      UNIVERSITY: '请填写你的学校',
      WECHAT_REQUIRED: '请填写微信号',
      wechatInvalid: (min, max) => `微信号需为 ${min}-${max} 个字符，并以字母开头`,
      DESCRIPTION: '请补充更多细节',
      DESCRIPTION_LANGUAGE: '描述只能使用英文、俄文或中文',
      PHOTOS_REQUIRED: '请至少上传一张照片',
      duplicateListing: '已存在相似的在售发布',
      publishRateLimit: (waitSeconds) => `请等待 ${waitSeconds} 秒后再发布`
    }
  },
  LISTINGS_MANAGER: {
    LISTING_NOT_FOUND: '未找到该发布',
    LISTED_AGAIN: '已重新上架',
    RESTORED_FROM_ARCHIVE: '已从归档恢复',
    SOLD_ON_UNIMARKET: '已在 UniMarket 售出',
    MOVED_TO_ARCHIVE: '已移入归档',
    PROMOTE_TITLE: '推广这条发布？',
    promoteContent: (planLabel, priceLabel) =>
      `${planLabel} 价格为 ${priceLabel}。推广后的发布会在信息流和搜索结果中靠前显示，并带有 Featured 标识。`,
    PROMOTE_PLAN_PICKER_TITLE: '选择推广时长',
    PROMOTE_REQUESTED: '推广申请已发送',
    PROMOTE_ALREADY_ACTIVE: '这条发布已经在推广中',
    PROMOTE_ALREADY_REQUESTED: '推广申请已提交',
    PROMOTE_SOLD_UNAVAILABLE: '只有正在展示的发布可以推广',
    PROMOTION_ACTIVATED: '推广已通过',
    PROMOTION_REJECTED: '推广已拒绝',
    PROMOTION_CONTACT_COPIED: '客服微信已复制',
    promotionContactModalContent: (wechatId, planLabel, priceLabel) =>
      `如需 ${planLabel}（${priceLabel}），请在微信联系：${wechatId}。该微信号已为你复制。`,
    DELETE_TITLE: '删除这条发布？',
    DELETE_CONTENT: '删除后，这条发布会从你的发布列表和市场信息流中移除。',
    DELETED: '已删除'
  },
  FAVORITES: {
    CLEAR_TITLE: '清空全部收藏？',
    CLEAR_CONTENT: '这会从当前设备移除所有收藏的发布。',
    CLEAR_SUCCESS: '收藏已清空',
    NO_UNAVAILABLE: '没有失效内容',
    REMOVE_UNAVAILABLE_TITLE: '移除失效内容？',
    removeUnavailableContent: (count) => `要从当前设备移除 ${count} 条失效收藏吗？`,
    REMOVE_UNAVAILABLE_SUCCESS: '失效内容已移除'
  },
  LISTING: {
    ITEM_ALREADY_SOLD: '该商品已售出',
    ADDRESS_UNAVAILABLE: '地址不可用',
    ADDRESS_COPIED: '地址已复制',
    LINK_COPIED: '链接已复制',
    HIDE_TITLE: '隐藏这条发布？',
    HIDE_CONTENT: '这条发布将从你在当前设备上的信息流、搜索和收藏结果中消失。',
    HIDDEN_SUCCESS: '发布已隐藏',
    BLOCK_TITLE: '屏蔽这个用户？',
    blockContent: (sellerName) => `该卖家${sellerName || '此用户'}的所有发布都会在当前设备上被隐藏。`,
    BLOCKED_SUCCESS: '用户已屏蔽',
    ALREADY_REPORTED: '你已经举报过了',
    REPORT_DETAILS_TITLE: '举报详情',
    REPORT_DETAILS_PLACEHOLDER: '告诉我们哪里有问题',
    REPORT_SENT: '举报已发送'
  },
  PROFILE: {
    ADMIN_REQUIRED: '需要管理员权限',
    ADMIN_TITLE: '管理员权限',
    ADMIN_PLACEHOLDER: '输入管理员代码',
    ADMIN_CONFIRM: '解锁',
    ADMIN_UNLOCKED: '管理员已解锁',
    ADMIN_WRONG_CODE: '代码错误',
    ADMIN_DISABLED: '管理员模式已关闭',
    SELLER_PRO_TITLE: '升级到 Seller Pro',
    SELLER_PRO_REQUEST_SENT: 'Seller Pro 申请已发送',
    SELLER_PRO_ALREADY_REQUESTED: 'Seller Pro 申请已提交',
    SELLER_PRO_CONTACT_COPIED: '客服微信已复制',
    sellerProOfferContent: (priceLabel) =>
      `Seller Pro（${priceLabel}）可以让你的主页更突出，吸引更多买家。\n\n你将获得：\n• 在信息流中拥有更强曝光和更高级的卖家外观\n• 每条发布最多 10 张照片，更好展示商品\n• 自定义卖家徽章，更快建立信任\n• 高级数据分析（浏览、收藏、转化），帮助你理解效果并更聪明地发布\n• 优先支持和更快的审核速度\n\n现在联系开通 Seller Pro 吗？`,
    sellerProContactModalContent: (wechatId) =>
      `如需开通 Seller Pro，请在微信联系：${wechatId}。该微信号已为你复制。`
  },
  USER_PROFILE: {
    LINK_COPIED: '链接已复制',
    INSTAGRAM_COPIED: 'Instagram 已复制',
    NAME_MIN: '姓名至少需要 2 个字符',
    UNIVERSITY_REQUIRED: '请填写你的学校',
    wechatInvalid: (min, max) => `微信号需为 ${min}-${max} 个字符，并以字母开头`,
    PROFILE_SAVED: '资料已保存',
    REVIEW_ALREADY_ADDED: '评价已提交',
    REVIEW_UNLOCK_REQUIRED: '请先在微信联系对方',
    REVIEW_MODAL_TITLE: '留下评价',
    REVIEW_MODAL_PLACEHOLDER: '可选：给卖家写一句备注',
    REVIEW_MODAL_CONFIRM: '发布',
    REVIEW_ALREADY_EXISTS: '评价已存在',
    REVIEW_POSTED: '评价已发布',
    BLOCK_TITLE: '屏蔽这个用户？',
    blockContent: (sellerName) => `该卖家${sellerName || '此用户'}的所有发布都会在当前设备上被隐藏。`,
    BLOCKED_SUCCESS: '用户已屏蔽',
    ALREADY_REPORTED: '你已经举报过了',
    REPORT_PROFILE_TITLE: '举报主页',
    REPORT_PROFILE_PLACEHOLDER: '告诉我们哪里有问题',
    REPORT_PROFILE_CONFIRM: '发送',
    REPORT_SENT: '举报已发送'
  },
  MODERATION: {
    STATUS_UPDATED: '状态已更新',
    PROMOTION_APPROVED: '推广已通过',
    PROMOTION_REJECTED: '推广已拒绝',
    SELLER_PRO_TITLE: '授予 Seller Pro',
    SELLER_PRO_PLACEHOLDER: '输入卖家昵称',
    SELLER_PRO_CONFIRM: '授予',
    SELLER_PRO_NOT_FOUND: '未找到该昵称对应的卖家',
    SELLER_PRO_APPROVED: 'Seller Pro 已通过',
    SELLER_PRO_REJECTED: 'Seller Pro 申请已拒绝',
    SELLER_PRO_REVOKED: 'Seller Pro 已移除',
    sellerProGranted: (grantedCount) => `已向 ${grantedCount} 位卖家授予 Seller Pro`
  }
}

const RU_MESSAGES = {
  COMMON: {
    WRITE_IN_WECHAT_TITLE: 'Написать в WeChat',
    WRITE_IN_WECHAT_CONTENT:
      'Мы скопировали WeChat ID продавца. Откройте поиск в WeChat и вставьте его, потому что мини-приложение не может сразу открыть личный чат или профиль.'
  },
  CREATE: {
    RESTORE_DRAFT_TITLE: 'Восстановить черновик?',
    restoreDraftContent: (savedAt) => `Найден неопубликованный черновик объявления от ${savedAt}.`,
    DRAFT_RESTORED: 'Черновик восстановлен',
    LISTING_NOT_FOUND: 'Объявление не найдено',
    UP_TO_5_PHOTOS: 'До 5 фото',
    UPDATED: 'Обновлено',
    PUBLISHED: 'Опубликовано',
    PROMOTION_CONTACT_WECHAT: 'miskathaa',
    PROMOTION_OFFER_TITLE: 'Продвинуть это объявление?',
    PROMOTION_OFFER_COPY:
      'Продвигаемые объявления показываются выше в поиске и категориях, получают заметный бейдж Featured и обычно собирают больше просмотров.',
    promotionOfferContent: (plansText) =>
      `Продвигаемые объявления показываются выше в поиске и категориях, получают заметный бейдж Featured и обычно собирают больше просмотров.\n\nТарифы:\n${plansText}`,
    PROMOTION_PLAN_PICKER_TITLE: 'Выберите срок продвижения',
    PROMOTION_REQUEST_SENT: 'Запрос на продвижение отправлен',
    PROMOTION_CONTACT_COPIED: 'WeChat поддержки скопирован',
    promotionContactModalContent: (wechatId, planLabel, priceLabel) =>
      `Для тарифа ${planLabel} (${priceLabel}) напишите в WeChat: ${wechatId}. Мы уже скопировали этот ID.`,
    SAVE_FAILED: 'Не удалось сохранить объявление',
    BACKEND_MEDIA_REQUIRED: 'Backend-публикация включена, но загрузка фото ещё не готова',
    ADDRESS_HINT:
      'Укажите реальное место встречи: район/кампус + корпус или ворота + комната/номер. Например: район Сиху, кампус ZJU Юйцюань, ворота 3, корпус 2, комната 402',
    VALIDATION: {
      CATEGORY: 'Выберите категорию',
      CUSTOM_SUBCATEGORY: 'Своя подкатегория: 2-40 символов',
      SUBCATEGORY: 'Выберите подкатегорию или введите свою',
      CONDITION: 'Выберите состояние товара',
      TITLE: 'Добавьте более понятный заголовок',
      TITLE_MEANINGFUL: 'В заголовке должны быть буквы или цифры',
      TITLE_LANGUAGE: 'В заголовке можно использовать только английский или китайский',
      PRICE_REQUIRED: 'Укажите цену',
      PRICE_LENGTH: 'Цена: до 6 цифр',
      PRICE_RANGE: 'Цена должна быть от 1 до 999999',
      ADDRESS: 'Укажите более точный адрес (минимум 6 символов)',
      ADDRESS_MEANINGFUL: 'Адрес слишком размытый. Добавьте район и детали (например: улица/кампус + корпус/ворота/комната)',
      ADDRESS_LANGUAGE: 'В адресе можно использовать только английский или китайский',
      UNIVERSITY: 'Укажите университет',
      WECHAT_REQUIRED: 'Укажите WeChat ID',
      wechatInvalid: (min, max) => `WeChat ID: ${min}-${max} символов, начинается с буквы`,
      DESCRIPTION: 'Добавьте чуть больше деталей',
      DESCRIPTION_LANGUAGE: 'В описании можно использовать только английский или китайский',
      PHOTOS_REQUIRED: 'Добавьте хотя бы одно фото',
      duplicateListing: 'Похожее активное объявление уже существует',
      publishRateLimit: (waitSeconds) => `Подождите ${waitSeconds} сек. перед следующей публикацией`
    }
  },
  LISTINGS_MANAGER: {
    LISTING_NOT_FOUND: 'Объявление не найдено',
    LISTED_AGAIN: 'Снова опубликовано',
    RESTORED_FROM_ARCHIVE: 'Восстановлено из архива',
    SOLD_ON_UNIMARKET: 'Продано на UniMarket',
    MOVED_TO_ARCHIVE: 'Перенесено в архив',
    PROMOTE_TITLE: 'Продвинуть объявление?',
    promoteContent: (planLabel, priceLabel) =>
      `${planLabel} стоит ${priceLabel}. Продвигаемые объявления поднимаются выше в ленте и поиске и получают бейдж Featured.`,
    PROMOTE_PLAN_PICKER_TITLE: 'Выберите срок продвижения',
    PROMOTE_REQUESTED: 'Запрос на продвижение отправлен',
    PROMOTE_ALREADY_ACTIVE: 'Это объявление уже продвигается',
    PROMOTE_ALREADY_REQUESTED: 'Запрос на продвижение уже отправлен',
    PROMOTE_SOLD_UNAVAILABLE: 'Продвигать можно только активные объявления',
    PROMOTION_ACTIVATED: 'Продвижение одобрено',
    PROMOTION_REJECTED: 'Продвижение отклонено',
    PROMOTION_CONTACT_COPIED: 'WeChat поддержки скопирован',
    promotionContactModalContent: (wechatId, planLabel, priceLabel) =>
      `Для тарифа ${planLabel} (${priceLabel}) напишите в WeChat: ${wechatId}. Мы уже скопировали этот ID.`,
    DELETE_TITLE: 'Удалить объявление?',
    DELETE_CONTENT: 'Это удалит объявление из раздела ваших объявлений и из маркетплейса.',
    DELETED: 'Удалено'
  },
  FAVORITES: {
    CLEAR_TITLE: 'Очистить всё избранное?',
    CLEAR_CONTENT: 'Это удалит все сохранённые объявления с этого устройства.',
    CLEAR_SUCCESS: 'Избранное очищено',
    NO_UNAVAILABLE: 'Нет недоступных объявлений',
    REMOVE_UNAVAILABLE_TITLE: 'Удалить недоступные?',
    removeUnavailableContent: (count) => `Удалить ${count} недоступных сохранённых объявлений с этого устройства?`,
    REMOVE_UNAVAILABLE_SUCCESS: 'Недоступные объявления удалены'
  },
  LISTING: {
    ITEM_ALREADY_SOLD: 'Товар уже продан',
    ADDRESS_UNAVAILABLE: 'Адрес недоступен',
    ADDRESS_COPIED: 'Адрес скопирован',
    LINK_COPIED: 'Ссылка скопирована',
    HIDE_TITLE: 'Скрыть это объявление?',
    HIDE_CONTENT: 'Это объявление исчезнет из вашей ленты, поиска и сохранённых результатов на этом устройстве.',
    HIDDEN_SUCCESS: 'Объявление скрыто',
    BLOCK_TITLE: 'Заблокировать этого пользователя?',
    blockContent: (sellerName) => `Все объявления от ${sellerName || 'этого продавца'} будут скрыты на этом устройстве.`,
    BLOCKED_SUCCESS: 'Пользователь заблокирован',
    ALREADY_REPORTED: 'Жалоба уже отправлена',
    REPORT_DETAILS_TITLE: 'Подробности жалобы',
    REPORT_DETAILS_PLACEHOLDER: 'Опишите, что не так',
    REPORT_SENT: 'Жалоба отправлена'
  },
  PROFILE: {
    ADMIN_REQUIRED: 'Нужен доступ администратора',
    ADMIN_TITLE: 'Доступ администратора',
    ADMIN_PLACEHOLDER: 'Введите код администратора',
    ADMIN_CONFIRM: 'Разблокировать',
    ADMIN_UNLOCKED: 'Доступ администратора открыт',
    ADMIN_WRONG_CODE: 'Неверный код',
    ADMIN_DISABLED: 'Режим администратора выключен',
    SELLER_PRO_TITLE: 'Перейти на Seller Pro',
    SELLER_PRO_REQUEST_SENT: 'Заявка на Seller Pro отправлена',
    SELLER_PRO_ALREADY_REQUESTED: 'Заявка на Seller Pro уже отправлена',
    SELLER_PRO_CONTACT_COPIED: 'WeChat поддержки скопирован',
    sellerProOfferContent: (priceLabel) =>
      `Seller Pro (${priceLabel}) помогает профилю сильнее выделяться и привлекать больше покупателей.\n\nВы получаете:\n• Более заметное место в ленте и премиальный вид продавца\n• До 10 фото в каждом объявлении, чтобы лучше показать товар\n• Персональный бейдж продавца для быстрого доверия\n• Расширенную аналитику (просмотры, сохранения, конверсия), чтобы понимать, что работает лучше\n• Приоритетную поддержку и более быструю модерацию\n\nПодключить Seller Pro сейчас?`,
    sellerProContactModalContent: (wechatId) =>
      `Чтобы подключить Seller Pro, напишите в WeChat: ${wechatId}. Мы уже скопировали этот ID.`
  },
  USER_PROFILE: {
    LINK_COPIED: 'Ссылка скопирована',
    INSTAGRAM_COPIED: 'Instagram скопирован',
    NAME_MIN: 'Имя: минимум 2 символа',
    UNIVERSITY_REQUIRED: 'Укажите университет',
    wechatInvalid: (min, max) => `WeChat ID: ${min}-${max} символов, начинается с буквы`,
    PROFILE_SAVED: 'Профиль сохранён',
    REVIEW_ALREADY_ADDED: 'Отзыв уже добавлен',
    REVIEW_UNLOCK_REQUIRED: 'Сначала свяжитесь в WeChat',
    REVIEW_MODAL_TITLE: 'Оставить отзыв',
    REVIEW_MODAL_PLACEHOLDER: 'Необязательная заметка о продавце',
    REVIEW_MODAL_CONFIRM: 'Опубликовать',
    REVIEW_ALREADY_EXISTS: 'Отзыв уже существует',
    REVIEW_POSTED: 'Отзыв опубликован',
    BLOCK_TITLE: 'Заблокировать этого пользователя?',
    blockContent: (sellerName) => `Все объявления от ${sellerName || 'этого продавца'} будут скрыты на этом устройстве.`,
    BLOCKED_SUCCESS: 'Пользователь заблокирован',
    ALREADY_REPORTED: 'Жалоба уже отправлена',
    REPORT_PROFILE_TITLE: 'Пожаловаться на профиль',
    REPORT_PROFILE_PLACEHOLDER: 'Опишите, что не так',
    REPORT_PROFILE_CONFIRM: 'Отправить',
    REPORT_SENT: 'Жалоба отправлена'
  },
  MODERATION: {
    STATUS_UPDATED: 'Статус обновлён',
    PROMOTION_APPROVED: 'Продвижение одобрено',
    PROMOTION_REJECTED: 'Продвижение отклонено',
    SELLER_PRO_TITLE: 'Выдать Seller Pro',
    SELLER_PRO_PLACEHOLDER: 'Введите ник продавца',
    SELLER_PRO_CONFIRM: 'Выдать',
    SELLER_PRO_NOT_FOUND: 'Продавец с таким ником не найден',
    SELLER_PRO_APPROVED: 'Seller Pro одобрен',
    SELLER_PRO_REJECTED: 'Заявка на Seller Pro отклонена',
    SELLER_PRO_REVOKED: 'Seller Pro отключён',
    sellerProGranted: (grantedCount) => `Seller Pro выдан ${grantedCount} продавцам`
  }
}

function getMessages() {
  const locale = localeStore.getLocale()

  if (locale === 'zh') {
    return ZH_MESSAGES
  }

  if (locale === 'ru') {
    return RU_MESSAGES
  }

  return EN_MESSAGES
}

module.exports = new Proxy({}, {
  get(target, prop) {
    return getMessages()[prop]
  }
})
