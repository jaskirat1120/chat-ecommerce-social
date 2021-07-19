require('dotenv').config();

module.exports = {
    APP: {
        NAME: 'CHAT-ECOMMERCE-SOCIAL',
        BACKGROUND: '#000',
        HEADER_TEXT_COLOR: '#ffffff',
        HEADER_COLOR: '#6223ff',
        DEFAULT_CURRENCY: "AED"
    },
    SERVER: {
        HOST: 'localhost',
        PORT: 7010
    },
    API: {
        VERSIONS: {
            v1: 'v1',
            v2: 'v2'
        },
        ROUTES: {
            USER: 'user',
            VENDORS: 'vendors',
            ADMIN: 'admin',
            COMMON: 'common'
        }
    },
    SCHEMA_ENUMS: {
        USER: {
            SIGNUP_TYPE: {
                PHONE_NUMBER: 'PHONE_NUMBER',
                EMAIL: 'EMAIL',
                NORMAL: 'NORMAL',
                FACEBOOK: 'FACEBOOK',
                INSTAGRAM: 'INSTAGRAM',
                APPLE: 'APPLE',
                GOOGLE: 'GOOGLE'
            },
        },
        IMAGE: {
            IMAGE_TYPE: {
                IMAGE: 'IMAGE',
                VIDEO: 'VIDEO'
            },
        }
    },
    COURIER_SERVICE_TYPE:{
        SKYNET: "SKYNET",
        DHL: "DHL",
        
    },
    COUNTER_TYPE: {
        ORDER: "ORDER",
        SUB_ORDER: "SUB_ORDER",
        PRODUCT: "PRODUCT",
        PRODUCT_VARIANT: "PRODUCT_VARIANT",
        TRANSACTION: "TRANSACTION",
        INVOICE: "INVOICE"
    },
    ORDER_FROM: {
        CART: "CART",
        DIRECT: "DIRECT",
    },
    SHIPPING_CHARGES_TYPE: {
        FREE: "FREE",
        FIXED: "FIXED"
    },
    SHIPPING_TYPE: {
        LOCAL: "LOCAL",
        EVERYWHERE_ELSE: "EVERYWHERE_ELSE"
    },
    PRODUCT_TANGIBLE_TYPE: {
        TANGIBLE: "TANGIBLE",
        DIGITAL: "DIGITAL"
    },
    ORDER_TYPE: {
        ONE: "O",
        MANY: "M"
    },
    INVOICE_TYPE: {
        MV: "MV",
    },
    PROMO_TYPE: {
        PROMO: "PROMO",
        OFFER: "OFFER",
        GIFT_CARD: "GIFT_CARD"
    },
    PROMO_VALUE_TYPE: {
        PERCENTAGE: "PERCENTAGE",
        VALUE: "VALUE"
    },
    RETURN_TYPE: {
        REPLACEMENT: "REPLACEMENT",
        REFUND: "REFUND"
    },
    PLAN_TYPE: {
        NORMAL: "NORMAL",
        ELITE_AD: "ELITE_AD",
        PLUS_CARD: "PLUS_CARD",
        DISCOUNT_OFFER: "DISCOUNT_OFFER",
        REDIRECTION_BUNDLE:"REDIRECTION_BUNDLE"
    },
    PROMO_DURATION_TYPE: {
        DAY: "DAY",
        MONTH: "MONTH",
        YEAR: "YEAR"
    },
    VENDOR_STATUS: {
        ON_AIR: "ON_AIR",
        OFF_AIR: "OFF_AIR",
        CLOSED: "CLOSED"
    },
    STATUS_ENUM: {
        PENDING: "PENDING",
        REJECTED: "REJECTED",
        CLOSED: "CLOSED",
        CANCELLED: "CANCELLED",
        FOR_REVIEW: "FOR_REVIEW",
        ACTIVE: "ACTIVE",
        BLOCKED: "BLOCKED",
        DELETED: "DELETED",
        EDITED: "EDITED",
        INACTIVE: "INACTIVE",
        FOLLOW_REQUEST: "FOLLOW_REQUEST",
        FOLLOW: "FOLLOW",
        UNFOLLOW: "UNFOLLOW",
        LIKE: "LIKE",
        UNLIKE: "UNLIKE",
        FAVOURITE: "FAVOURITE",
        HOLIDAY: "HOLIDAY",
        UNFAVOURITE: "UNFAVOURITE",
        SENT: "SENT",
        ACCEPTED: "ACCEPTED",
        MUTE: "MUTE",
        UNMUTE: "UNMUTE",
        HIDE: "HIDE",
        UNHIDE: "UNHIDE"
    },
    CART_STATUS: {
        ACTIVE: "ACTIVE",
        PRODUCT_ADDED: "PRODUCT_ADDED",
        PRODUCT_UPDATED: "PRODUCT_UPDATED",
        PRODUCT_REMOVED: "PRODUCT_REMOVED",
        EMPTY: "EMPTY",
        ORDER_COMPLETE: "ORDER_COMPLETE",
    },
    DOCUMENT_TYPE: {
        LICENSE: "LICENSE",
        VEHICLE_IMAGES: "VEHICLE_IMAGES",
        DOCUMENTS: "DOCUMENTS"
    },
    IMAGE_TYPE: {
        FRONT: "FRONT",
        BACK: "BACK",
    },
    DELIVERY_CHARGES: {
        FIXED: "FIXED",
        DISTANCE_BASED: "DISTANCE_BASED"
    },
    RATING_TYPE: {
        ORDER_RATING: "ORDER_RATING",
        PRODUCT_RATING: "PRODUCT_RATING",
        VENDOR_RATING: "VENDOR_RATING"
    },
    ORDER_ASSIGNING_STATUS: {
        SINGLE: "SINGLE",
        ADMIN: "ADMIN",
        ALL: "ALL"
    },
    ORDER_STATUS_ENUM: {
        PLACED: "PLACED",
        ACCEPTED: "ACCEPTED",
        REJECTED: "REJECTED",
        DISPATCHED: "DISPATCHED",
        IN_TRANSIT: "IN_TRANSIT",
        DELIVERED: "DELIVERED",
        OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
        ON_HOLD: "ON_HOLD",
        ATTEMPTED_DELIVERY: "ATTEMPTED_DELIVERY",
        UNABLE_TO_LOCATE: "UNABLE_TO_LOCATE",
        SHIPMENT_RETURNED: "SHIPMENT_RETURNED",
        ON_HOLD_DAMAGED: "ON_HOLD_DAMAGED",
        SHIPMENT_RETURN_IN_PROGRESS: "SHIPMENT_RETURN_IN_PROGRESS",
        CANCELLED: "CANCELLED",
        CANCELLED_VENDOR: "CANCELLED_VENDOR",
        PACKED: "PACKED",
        RETURN_INITIATED: "RETURN_INITIATED",
        RETURN_ACCEPTED: "RETURN_ACCEPTED",
        PAYMENT_FAILED: "PAYMENT_FAILED",
        PAYMENT_PENDING: "PAYMENT_PENDING",
        RETURN_COMPLETED: "RETURN_COMPLETED",
        RETURN_CANCELLED: "RETURN_CANCELLED",
        RETURN_REQUESTED: "RETURN_REQUESTED",
        RETURN_REJECTED: "RETURN_REJECTED",
        REFUND_INITIATED: "REFUND_INITIATED",
        NOT_REQUESTED: "NOT_REQUESTED",
    },
    ORDER_STATUS_ENUM_MSG: {
        PLACED: "PLACED",
        ACCEPTED: "ACCEPTED",
        REJECTED: "REJECTED",
        DISPATCHED: "DISPATCHED",
        IN_TRANSIT: "IN_TRANSIT",
        DELIVERED: "DELIVERED",
        OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
        ON_HOLD: "ON_HOLD",
        ATTEMPTED_DELIVERY: "ATTEMPTED_DELIVERY",
        UNABLE_TO_LOCATE: "UNABLE_TO_LOCATE",
        SHIPMENT_RETURNED: "SHIPMENT_RETURNED",
        ON_HOLD_DAMAGED: "ON_HOLD_DAMAGED",
        SHIPMENT_RETURN_IN_PROGRESS: "SHIPMENT_RETURN_IN_PROGRESS",
        CANCELLED: "CANCELLED",
        CANCELLED_VENDOR: "CANCELLED_VENDOR",
        PACKED: "PACKED",
        RETURN_INITIATED: "RETURN_INITIATED",
        RETURN_ACCEPTED: "RETURN_ACCEPTED",
        PAYMENT_FAILED: "PAYMENT_FAILED",
        PAYMENT_PENDING: "PAYMENT_PENDING",
        RETURN_COMPLETED: "RETURN_COMPLETED",
        RETURN_CANCELLED: "RETURN_CANCELLED",
        RETURN_REQUESTED: "RETURN_REQUESTED",
        RETURN_REJECTED: "RETURN_REJECTED",
        REFUND_INITIATED: "REFUND_INITIATED",
        NOT_REQUESTED: "NOT_REQUESTED",
    },
    CREDIT_TYPE: {
        CREDIT: "CREDIT",
        DEBIT: "DEBIT",
        POINTS: "POINTS",
        LIMIT_CHANGE: "LIMIT_CHANGE",
        PROCESSING: "PROCESSING",
        FAILED: "FAILED",
    },
    PAYMENT_STATUS_ENUM: {
        PENDING: "PENDING",
        PRE_AUTHORIZED: "PRE_AUTHORIZED",
        REJECTED: "REJECTED",
        COMPLETED: "COMPLETED",
        CANCELLED: "CANCELLED",
    },
    PAYMENT_METHOD_ENUM: {
        CREDIT_CARD: "CREDIT_CARD",
        DEBIT_CARD: "DEBIT_CARD",
        WALLET: "WALLET",
        CASH_ON_DELIVERY: "CASH_ON_DELIVERY",
    },
    DISCOUNT_STATUS: {
        EXPIRED: "EXPIRED",
        ACTIVE: "ACTIVE",
        ALL: "ALL"
    },
    SOCKET_NAME_EMIT: {
        CHAT_REQUEST: "CHAT_REQUEST",
        REQUEST_ACCEPTED: "REQUEST_ACCEPTED",
        CHAT_EVENT: "CHAT_EVENT",
        ORDER_EVENT: "ORDER_EVENT",
        REQUEST_ACCEPTED_OTHER: "REQUEST_ACCEPTED_OTHER",
        PAYMENT_FAILED: "PAYMENT_FAILED",
        PAYMENT_SUCCESS: "PAYMENT_SUCCESS",
        RECEIVE_MESSAGE: "RECEIVE_MESSAGE",
        ACTIVE: "ACTIVE",
        INACTIVE: "INACTIVE",
        CONNECTED: "connected",
        SOCKET_ERROR: "socketError",
    },

    SOCKET_TYPE: {
        END_CHAT: "END_CHAT",
        END_AND_PACK: "END_AND_PACK",
        CHAT_TIMEOUT: "CHAT_TIMEOUT",
        CHAT_CANCELLED: "CHAT_CANCELLED",
        ORDER_TIMEOUT: "ORDER_TIMEOUT",
        PACKAGING_CONFIRMED: "PACKAGING_CONFIRMED",
        PACKAGING_NEED_CHANGES: "PACKAGING_NEED_CHANGES",
        PACKAGING_REJECTED: "PACKAGING_REJECTED",
        UPDATE_LOCATION: "UPDATE_LOCATION",
        DRIVER_LOCATION: "DRIVER_LOCATION",
        ORDER_REQUEST: "ORDER_REQUEST",
        REACHED_STORE: "REACHED_STORE",
        REACHED_CUSTOMER: "REACHED_CUSTOMER",
        ORDER_ACCEPTED: "ORDER_ACCEPTED",
        ORDER_STARTED: "ORDER_STARTED",
        ORDER_ACCEPTED_BY_OTHER: "ORDER_ACCEPTED_BY_OTHER"
    },
    SOCKET_NAME_LISTEN: {
        SEND_MESSAGE: "SEND_MESSAGE",
        ORDER_EVENT: "ORDER_EVENT",
        COMMON_EVENT: "COMMON_EVENT",
        READ_MESSAGE: "READ_MESSAGE",
        DISCONNECT: "disconnect",
        ERROR: "error",
    },
    MESSAGE_STATUS_ENUM: {
        SENT: "SENT",
        DELIVERED: "DELIVERED",
        DELETED: "DELETED",
        READ: "READ",
    },
    PRODUCT_TYPE: {
        TRADING: "TRADING",
        NON_TRADING: "NON_TRADING",
    },
    PRODUCT_FILTER: {
        NEW_PRODUCTS: "NEW_PRODUCTS",
        POPULAR_PRODUCTS: "POPULAR_PRODUCTS",
        LOWEST_PRICE: "LOWEST_PRICE",
        FREE_SHIPPING: "FREE_SHIPPING",
        EDITOR_PICKS: "EDITOR_PICKS",
        ON_SALE: "ON_SALE"
    },
    SUBSCRIPTION_TYPE: {
        DEFAULT: "DEFAULT",
        RENEWAL: "RENEWAL"
    },
    SUBSCRIPTION_LOGS: {
        BOUGHT: "BOUGHT",
        DEFAULT: "DEFAULT",
        EXPIRED: "EXPIRED",
        RENEWAL: "RENEWAL"
    },
    TRANSACTION_TYPES: {
        BOUGHT_SUBSCRIPTION: "BOUGHT_SUBSCRIPTION",
        ORDER: "ORDER",
        WALLET: "WALLET",
        REDEEM_VOUCHER: "REDEEM_VOUCHER",
        WALLET_RETURN: "WALLET_RETURN",
        SHIPPING_CHARGES: "SHIPPING_CHARGES",
        RETURN_SHIPPING_CHARGES: "RETURN_SHIPPING_CHARGES",
        PAYMENT_METHOD_CHARGES: "PAYMENT_METHOD_CHARGES",
        TAX_DEDUCTION: "TAX_DEDUCTION",
        CANCELLATION_PENALTY: "CANCELLATION_PENALTY",
        PROCESSING_PENALTY: "PROCESSING_PENALTY",
        REDIRECTION_CHARGES: "REDIRECTION_CHARGES"
    },
    TRANSACTION_LISTING: {
        ALL: "ALL",
        RECEIVED: "RECEIVED",
        DEDUCTED: "DEDUCTED",
        DUE_PAYMENT: "DUE_PAYMENT",
        ORDER: "ORDER",
        WALLET_BALANCE: "WALLET_BALANCE"
    },
    NOTIFICATION_LOGS: {
        EMAIL_EXPIRED: "EMAIL_EXPIRED",
        NOTIFICATION_EXPIRED: "NOTIFICATION_EXPIRED",
        EMAIL_ABOUT_TO_EXPIRE: "EMAIL_ABOUT_TO_EXPIRE",
        NOTIFICATION_ABOUT_TO_EXPIRE: "NOTIFICATION_ABOUT_TO_EXPIRE",
        "80_PERCENT": "80_PERCENT",
        "90_PERCENT": "90_PERCENT",
    },
    REFUND_STATUS: {
        REQUESTED: "RETURN_REQUESTED",
        INITIATED: "RETURN_INITIATED",
        COMPLETED: "RETURN_COMPLETED",
        NOT_REQUESTED: "NOT_REQUESTED",
        REJECTED: "RETURN_REJECTED",
        CANCELLED: "RETURN_CANCELLED"
    },
    REPORT_TYPE: {
        FEED: "FEED",
        ISSUE: "ISSUE",
        CONTACT_US: "CONTACT_US"
    },
    FOLLOW_TYPE: {
        FOLLOW_VENDOR: "FOLLOW_VENDOR",
        FOLLOW_USER: "FOLLOW_USER"
    },
    REQUEST_REASONS: {
        INACTIVITY: "INACTIVITY",
        TIMEOUT: "TIMEOUT"
    },
    CATEGORY_TYPE: {
        CATEGORIES: "CATEGORIES",
        COLLECTIONS: "COLLECTIONS",
    },
    GRAPH_TYPE: {
        YEARLY: "YEARLY",
        DAILY: "DAILY",
        WEEKLY: "WEEKLY",
        MONTHLY: "MONTHLY",
    },
    ANALYTICS_TYPE: {
        EARNING: "EARNING",
        PRODUCTS: "PRODUCTS",
        ORDERS: "ORDERS",
        DASHBOARD: "DASHBOARD",
        DASHBOARD_PRODUCT:"DASHBOARD_PRODUCT"
    },
    COMMON_LOGS: {
        CATEGORY_VISIT: "CATEGORY_VISIT",
        WEBSITE_VISIT: "WEBSITE_VISIT",
        PRODUCT_VISIT: "PRODUCT_VISIT",
        VENDOR_VISIT: "VENDOR_VISIT",
        REDIRECTION: "REDIRECTION"
    },
    LIST_ORDER_STATUS: {
        ALL: "ALL",
        OPEN: "OPEN",
        BUY_AGAIN: "BUY_AGAIN",
        CLOSED: "CLOSED",
        CANCELLED: "CANCELLED",
        PAST: "PAST",
        ACTIVE: "ACTIVE",
        RECEIVED: "RECEIVED",
        IN_PROCESSING: "IN_PROCESSING",
        DISPATCHED: "DISPATCHED",
        RETURNS: "RETURNS",
        DELIVERED: "DELIVERED",
        RETURNED: "RETURNED"
    },
    COMMON_SERVICES_TYPE: {
        VENDOR_SIZE: "VENDOR_SIZE",
        COURIER_SERVICE: "COURIER_SERVICE",
        COVERAGE_AREA: "COVERAGE_AREA",
        COLORS: "COLORS",
        SIZES: "SIZES",
        COUNTRY: "COUNTRY",
        INTERESTS: "INTERESTS",
        VENDOR_ADMIN_AD: "VENDOR_ADMIN_AD",
        VENDOR_PAID_AD: "VENDOR_PAID_AD",
        DISCOUNT_OFFER: "DISCOUNT_OFFER",
        TEAMS: "TEAMS",
        NEWS: "NEWS",
        UPDATES: "UPDATES",
        CAREER: "CAREER",
        CONTACT_US_REASON: "CONTACT_US_REASON",
        SKILLS: "SKILLS",
        LOCATIONS: "LOCATIONS",
        WHATS_NEW: "WHATS_NEW",
        CAREER_AREA: "CAREER_AREA",
        PROCESSING_TIME: "PROCESSING_TIME",
        RETURN_REASON: "RETURN_REASON"
    },
    NOTIFICATION_SELECTION:{
        NOTIFICATION: "NOTIFICATION",
        EMAIL: "EMAIL",
        SMS: "SMS",
    },
    VENDOR_PURPOSE: {
        TRADING: 'TRADING',
        GALLERY: 'GALLERY',
        EXPANSION: 'EXPANSION'
    },
    SECTION: {
        PROFILE: "PROFILE",
        HOME: "HOME"
    },
    MEDIA_TYPE_ENUM: {
        IMAGE: "IMAGE",
        VIDEO: "VIDEO",
        AUDIO: "AUDIO"
    },
    REACTION_TYPE_ENUM: {
        POST_LIKE: "POST_LIKE",
        PRODUCT_LIKE: "PRODUCT_LIKE",
        POST_FAVOURITE: "POST_FAVOURITE",
        PRODUCT_FAVOURITE: "PRODUCT_FAVOURITE",
        VENDOR_FAVOURITE: "VENDOR_FAVOURITE",
        VENDOR_LIKE: "VENDOR_LIKE",
        POST_SHARE: "POST_SHARE",
        PRODUCT_SHARE: "PRODUCT_SHARE",
        VENDOR_SHARE: "VENDOR_SHARE"
    },
    DEVICE_TYPE_ENUM: {
        IOS: "IOS",
        WEB: "WEB",
        ANDROID: "ANDROID"
    },
    PROFILE_ENUM: {
        PENDING: "PENDING",
        ADDED: "ADDED",
        SKIPPED: "SKIPPED"
    },
    PRIVACY_TYPE: {
        PRIVATE: "PRIVATE",
        PUBLIC: "PUBLIC",
        SELECTIVE: "SELECTIVE",
    },
    JWT_SECRET: {
        USER: process.env.JWT_SECRET_USER,
        VENDOR: process.env.JWT_SECRET_VENDOR,
        ADMIN: process.env.JWT_SECRET_ADMIN
    },
    BUCKET: {
        FOLDER: {
            "imageOriginal": "imageOriginal",
            "imageThumb": "imageThumb",
            "imageProcessed": "imageProcessed",
            "imageThumbnailMed": "imageThumbnailMed",
            "videoOriginal": "videoOriginal",
            "audioOriginal": "audioOriginal",
            "videoThumb": "videoThumb",
            "documentOriginal": "documentOriginal",
        }
    },
    AUTH_STRATEGIES: {
        USER: 'USER',
        VENDOR: 'VENDOR',
        ADMIN: 'ADMIN',
    },
    USER_TYPE: {
        USER: 'USER',
        VENDOR_OWNER: 'VENDOR_OWNER',
        VENDOR_MANAGING_ACCOUNT: 'VENDOR_MANAGING_ACCOUNT',
        VENDOR_MEMBER: 'VENDOR_MEMBER',
        SUB_VENDOR: 'SUB_VENDOR',
        ADMIN: 'ADMIN',
    },
    STORE_TYPE: {
        VIP: 'VIP',
        NORMAL: 'NORMAL',
    },
    VERIFICATION_TYPE: {
        EMAIL: 1,
        PHONE: 2,
    },
    ONLINE_STATUS: {
        ONLINE: "ONLINE",
        OFFLINE: "OFFLINE"
    },
    NOTIFICATION_LISTING_TYPE: {
        ORDER: "ORDER",
        SOCIAL: "SOCIAL"
    },
    FEED_LIST_TYPE: {
        USER: "USER",
        VENDOR: "VENDOR"
    },
    FEED_TYPE: {
        SHARE_POST: "SHARE_POST",
        SHARE_VENDOR: "SHARE_VENDOR",
        SHARE_PRODUCT: "SHARE_PRODUCT",
        SHARE_DISCOUNT_FEED: "SHARE_DISCOUNT_FEED",
        SHARE_DISCOUNT_NOTIFICATION: "SHARE_DISCOUNT_NOTIFICATION"
    },
    SHARE_VIA: {
        EMAIL: "EMAIL",
        MESSAGE: "MESSAGE"
    },
    PRIORITY: {
        HIGH: "HIGH",
        LOW: "LOW",
        MEDIUM: "MEDIUM",
        HIGHEST: "HIGHEST"
    },
    FOLLOW_ACTION: {
        ACCEPT: "ACCEPT",
        REJECT: "REJECT"
    },
    DATABASE: {
        DOC_STATUSES: {
            BLOCKED: 'BLOCKED',
            DELETED: 'DELETED',
            UNBLOCKED: 'UNBLOCKED'
        },
        FOLLOW_STATUSES: {
            FOLLOW: 'FOLLOW',
            UNFOLLOW: 'UNFOLLOW'
        },
        REQ_ACTIONS: {
            ACCEPT: 'ACCEPT',
            REJECT: 'REJECT'
        },
        MODELS_NAME: {
            ADMIN: 'admins',
            APP_DEFAULTS: 'appDefaults',
            PRESS: 'press',
            APP_VERSIONS: 'appVersions',
            BANNERS: 'banners',
            BRANDS: 'brands',
            CATEGORIES: 'categories',
            TEMPLATE_CATEGORIES: 'templateCategories',
            VENDOR_TEMPLATES: 'vendorTemplates',
            COMMON_SERVICES: 'commonServices',
            CHATS: 'chats',
            CART: 'carts',
            ORDERS: 'orders',
            CART_LOGS: 'cartLogs',
            LOGS: 'logs',
            NOTIFICATIONS: 'notifications',
            RATINGS: 'ratings',
            REACTIONS: 'reactions',
            SETTINGS: 'settings',
            VENDORS: 'vendors',
            STORES: 'stores',
            VENDOR_CATEGORIES: 'vendorCategories',
            COLLECTION_PRODUCTS: 'collectionProducts',
            PRODUCTS: 'products',
            PRODUCT_VARIANTS: 'productVariants',
            USER: 'users',
            PLANS: 'plans',
            OFFER_PROMO: 'offersAndPromos',
            PLAN_DOWNGRADE_REQUEST: 'planDowngradeRequests',
            REFUND_REQUEST: 'refundRequests',
            TRANSFER_REQUEST: 'transferRequests',
            USER_ADDRESSES: 'userAddresses',
            VENDOR_BANKS: 'vendorBanks',
            FOLLOWS: 'follows',
            NEWS_LETTERS: 'newsLetters',
            FEEDS: 'feeds',
            COMMON_REPORTS: 'commonReports',
            COMMENTS: 'comments',
            COMMON_LOGS: 'commonLogs',
            SUBSCRIPTION_LOGS: 'subscriptionLogs',
            TRANSACTIONS: 'transactions',
            ORDER_COUNTER: 'counters',
            CURRENCIES: 'currencies',
            VENDOR_PAYMENTS: 'vendorPayments',
            CREDIT_MANAGEMENT: 'creditManagement',
            WISH_LIST: "wishLists"
        },
        NOTIFICATION_TYPE: {
            ORDER: 'ORDER',
            USER: 'USER',
            VENDOR: 'VENDOR',
            SENT_MESSAGE: 'SENT_MESSAGE',
            ORDER_PLACED_USER: 'ORDER_PLACED_USER',
            ORDER_PLACED_VENDOR: 'ORDER_PLACED_VENDOR',
            ORDER_PLACED_ADMIN: 'ORDER_PLACED_ADMIN',
            ORDER_PLACED: 'ORDER_PLACED',
            ORDER_CANCELLED_BY_VENDOR: "ORDER_CANCELLED_BY_VENDOR",
            PLACED: "PLACED",
            ACCEPTED: "ACCEPTED",
            REJECTED: "REJECTED",
            DISPATCHED: "DISPATCHED",
            IN_TRANSIT: "IN_TRANSIT",
            DELIVERED: "DELIVERED",
            CANCELLED: "CANCELLED",
            PACKED: "PACKED",
            CANCELLED_VENDOR: "CANCELLED_VENDOR",
            RETURN_INITIATED: "RETURN_INITIATED",
            RETURN_ACCEPTED: "RETURN_ACCEPTED",
            RETURN_COMPLETED: "RETURN_COMPLETED",
            RETURN_REQUESTED: "RETURN_REQUESTED",
            RETURN_REJECTED: "RETURN_REJECTED",
            ORDER_CANCELLED_VENDOR: "ORDER_CANCELLED_VENDOR",

            FOLLOW_REQUEST: "FOLLOW_REQUEST",
            FOLLOW_REQUEST_ACCEPTED: "FOLLOW_REQUEST_ACCEPTED",
            SHARE_POST: "SHARE_POST",
            SHARE_PRODUCT: "SHARE_PRODUCT",
            SHARE_VENDOR: "SHARE_VENDOR",
            SHARE_DISCOUNT: "SHARE_DISCOUNT",
            SHARE_GIFT: "SHARE_GIFT",
            ADDED_COLLECTION: "ADDED_COLLECTION",
            STARTED_FOLLOWING: "STARTED_FOLLOWING",
            LIKED_POST: "LIKED_POST",
            LIKED_VENDOR: "LIKED_VENDOR",
            LIKED_PRODUCT: "LIKED_PRODUCT",
            COMMENTED_POST: "COMMENTED_POST",
            PRODUCT_REVIEW: "PRODUCT_REVIEW",
            VENDOR_REVIEW: "VENDOR_REVIEW",
            ORDER_REVIEW: "ORDER_REVIEW",
            PLAN_UPDATE: "PLAN_UPDATE",
            PLAN_EXPIRY: "PLAN_EXPIRY",
            OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
            ON_HOLD: "ON_HOLD",
            ATTEMPTED_DELIVERY: "ATTEMPTED_DELIVERY",
            UNABLE_TO_LOCATE: "UNABLE_TO_LOCATE",
            SHIPMENT_RETURNED: "SHIPMENT_RETURNED",
            ON_HOLD_DAMAGED: "ON_HOLD_DAMAGED",
            SHIPMENT_RETURN_IN_PROGRESS: "SHIPMENT_RETURN_IN_PROGRESS",
            SUBSCRIPTION_ABOUT_TO_EXPIRE: "SUBSCRIPTION_ABOUT_TO_EXPIRE",
            SUBSCRIPTION_EXPIRED: "SUBSCRIPTION_EXPIRED",
            REDIRECTION_80_PERCENT: "REDIRECTION_80_PERCENT",
            REDIRECTION_90_PERCENT: "REDIRECTION_90_PERCENT",
            REDIRECTION_CONSUMED: "REDIRECTION_CONSUMED",
            ADMIN_ORDER_UPDATES: {
                PLACED: "PLACED",
                ACCEPTED: "ACCEPTED",
                REJECTED: "REJECTED",
                DISPATCHED: "DISPATCHED",
                IN_TRANSIT: "IN_TRANSIT",
                DELIVERED: "DELIVERED",
                CANCELLED: "CANCELLED",
                PACKED: "PACKED",
                RETURN_INITIATED: "RETURN_INITIATED",
                RETURN_ACCEPTED: "RETURN_ACCEPTED",
                RETURN_COMPLETED: "RETURN_COMPLETED",
                RETURN_REQUESTED: "RETURN_REQUESTED",
                RETURN_REJECTED: "RETURN_REJECTED",
            }
        },
        NOTIFICATION_STATUS: {
            READ: 'READ',
            UNREAD: 'UNREAD',
            CLEAR: 'CLEAR'
        },
        NOTIFICATION_TITLE: {
            NEW_MESSAGE: {
                en: "New Message"
            },
            ORDER_PLACED_USER: {
                en: "Order placed"
            },
            FOLLOW_REQUEST: {
                en: "Follow request"
            },
            SUBSCRIPTION_ABOUT_TO_EXPIRE: {
                en: "Subscription update"
            },
            SUBSCRIPTION_EXPIRED: {
                en: "Subscription update"
            },
            REDIRECTION_80_PERCENT: {
                en: "80% redirection clicks consumed"
            },
            REDIRECTION_90_PERCENT: {
                en: "90% redirection clicks consumed"
            },
            SHARE_DISCOUNT: {
                en: "Shared Discount"
            },
            SHARE_GIFT: {
                en: "Shared Gift"
            },
            REDIRECTION_CONSUMED: {
                en: "Redirection clicks consumed"
            },
            STARTED_FOLLOWING: {
                en: "Following"
            },
            LIKED_POST: {
                en: "Liked post"
            },
            LIKED_VENDOR: {
                en: "Liked vendor"
            },
            LIKED_PRODUCT: {
                en: "Liked vendor"
            },
            COMMENTED_POST: {
                en: "Commented on post"
            },
            CANCELLED_VENDOR: {
                en: "Cancelled order"
            },
            FOLLOW_REQUEST_ACCEPTED: {
                en: "Accepted follow request"
            },
            ADDED_COLLECTION: {
                en: "Added new collection"
            },
            SHARE_PRODUCT: {
                en: "Shared a product"
            },
            SHARE_POST: {
                en: "Shared a post"
            },
            SHARE_VENDOR: {
                en: "Shared a vendor"
            },
            OUT_FOR_DELIVERY: {
                en: "Out for delivery"
            },
            ON_HOLD:{
                en: "On hold"
            },
            ATTEMPTED_DELIVERY: {
                en: "Attempted delivery"
            },
            UNABLE_TO_LOCATE: {
                en: "Unable to locate"
            },
            SHIPMENT_RETURNED:{
                en: "Shipment returned"
            },
            ON_HOLD_DAMAGED:{
                en: "On hold - Damaged"
            },
            SHIPMENT_RETURN_IN_PROGRESS:{
                en: "Shipment return in progress"
            },
            ORDER_PLACED_VENDOR: {
                en: "New order"
            },
            PLACED: {
                en: "New order"
            },
            PRODUCT_REVIEW: {
                en: "Product review"
            },
            VENDOR_REVIEW: {
                en: "Vendor review"
            },
            ORDER_REVIEW: {
                en: "Order review"
            },
            PLAN_UPDATE: {
                en: "Plan updated"
            },
            PLAN_EXPIRY: {
                en: "Plan expired"
            },
            ACCEPTED: {
                en: "Order accepted"
            },
            REJECTED: {
                en: "Order rejected"
            },
            DISPATCHED: {
                en: "Order dispatched"
            },
            IN_TRANSIT: {
                en: "Order is in transit"
            },
            DELIVERED: {
                en: "Order delivered"
            },
            CANCELLED: {
                en: "Order cancelled"
            },
            PACKED: {
                en: "Order packed"
            },
            RETURN_INITIATED: {
                en: "Return initiated"
            },
            RETURN_REQUESTED: {
                en: "Return requested"
            },
            RETURN_ACCEPTED: {
                en: "Return accepted"
            },
            RETURN_REJECTED: {
                en: "Return rejected"
            },
            RETURN_COMPLETED: {
                en: "Return completed"
            },
            ORDER_CANCELLED_VENDOR: {
                en: "Order cancelled"
            },
            ORDER_CANCELLED_BY_VENDOR: {
                en: "Order cancelled"
            },
            ADMIN_ORDER_UPDATES: {
                PLACED: {
                    en: "New order"
                },
                ACCEPTED: {
                    en: "Order accepted"
                },
                REJECTED: {
                    en: "Order rejected"
                },
                DISPATCHED: {
                    en: "Order dispatched"
                },
                IN_TRANSIT: {
                    en: "Order is in transit"
                },
                DELIVERED: {
                    en: "Order delivered"
                },
                CANCELLED: {
                    en: "Order cancelled"
                },
                PACKED: {
                    en: "Order packed"
                },
                RETURN_INITIATED: {
                    en: "Return initiated"
                },
                RETURN_REQUESTED: {
                    en: "Return requested"
                },
                RETURN_ACCEPTED: {
                    en: "Return accepted"
                },
                RETURN_REJECTED: {
                    en: "Return rejected"
                },
                RETURN_COMPLETED: {
                    en: "Return completed"
                },
            }

        },
        NOTIFICATION_MESSAGE: {
            NEW_MESSAGE: {
                en: "{{userName}} sent you a message"
            },
            ORDER_PLACED_USER: {
                en: "Order placed successfully, order number - {{orderNumber}}"
            },
            ORDER_PLACED_VENDOR: {
                // en: "You have new order from {{userName}}, order number - {{orderNumber}}"
                en: "You have new order, order number - {{orderNumber}}"
            },
            
            ORDER_PLACED_ADMIN: {
                // en: "You have new order from {{userName}}, order number - {{orderNumber}}"
                en: "There was a new order placed, order number - {{orderNumber}}"
            },
            FOLLOW_REQUEST: {
                en: "You have a follow request from {{userName}}"
            },
            STARTED_FOLLOWING: {
                en: "{{userName}} started following you"
            },
            OUT_FOR_DELIVERY: {
                en: "Order out for delivery, order number - {{orderNumber}}"
            },
            SHARE_DISCOUNT: {
                en: "{{vendorRegisterName}} Shared a discount voucher with you {{discountCode}}"
            },
            SHARE_GIFT: {
                en: "Shared Gift"
            },
            ON_HOLD:{
                en: "Order on hold at shipment, order number - {{orderNumber}}"
            },
            ATTEMPTED_DELIVERY: {
                en: "Attempted delivery for order number - {{orderNumber}}"
            },
            UNABLE_TO_LOCATE: {
                en: "Unable to locate delivery address for order number - {{orderNumber}}"
            },
            SHIPMENT_RETURNED:{
                en: "Shipment for order number - {{orderNumber}} returned to vendor"
            },
            ON_HOLD_DAMAGED:{
                en: "Shipment on hold due to damage, order number - {{orderNumber}}"
            },
            SHIPMENT_RETURN_IN_PROGRESS:{
                en: "Shipment is returning to vendor for order number - {{orderNumber}}"
            },
            SUBSCRIPTION_ABOUT_TO_EXPIRE: {
                en: "Subscription update"
            },
            SUBSCRIPTION_EXPIRED: {
                en: "Subscription update"
            },
            REDIRECTION_80_PERCENT: {
                en: "80% redirection clicks consumed"
            },
            REDIRECTION_90_PERCENT: {
                en: "90% redirection clicks consumed"
            },
            REDIRECTION_CONSUMED: {
                en: "Redirection clicks consumed"
            },
            PRODUCT_REVIEW: {
                en: "{{userName}} reviewed your product"
            },
            VENDOR_REVIEW: {
                en: "{{userName}} reviewed your vendor"
            },
            ORDER_REVIEW: {
                en: "{{userName}} reviewed order"
            },
            PLAN_UPDATE: {
                en: "Your plan has been updated"
            },
            PLAN_EXPIRY: {
                en: "Your plan has been epired"
            },
            FOLLOW_REQUEST_ACCEPTED: {
                en: "{{userName}} accepted your follow request"
            },
            LIKED_POST: {
                en: "{{userName}} liked your post"
            },
            LIKED_VENDOR: {
                en: "{{userName}} liked your vendor"
            },
            LIKED_PRODUCT: {
                en: "{{userName}} liked your product"
            },
            COMMENTED_POST: {
                en: "{{userName}} commented on your post"
            },
            PLACED: {
                en: "New order placed"
            },
            ACCEPTED: {
                en: "Your order - {{orderNumber}} item - {{subOrderNumber}} is in process"
            },
            REJECTED: {
                en: "Unfortunately we could not process your order - {{orderNumber}} item - {{subOrderNumber}}"
            },
            DISPATCHED: {
                en: "Your order - {{orderNumber}} item - {{subOrderNumber}} is dispatched"
            },
            IN_TRANSIT: {
                en: "Your order - {{orderNumber}} item - {{subOrderNumber}} is in transit"
            },
            DELIVERED: {
                en: "Your order - {{orderNumber}} item - {{subOrderNumber}} is delivered"
            },
            CANCELLED: {
                en: "Your order - {{orderNumber}} item - {{subOrderNumber}} is cancelled"
            },
            CANCELLED_VENDOR: {
                en: "Your order - {{orderNumber}} item - {{subOrderNumber}} was cancelled by vendor {{reason}}"
            },
            RETURN_REQUESTED: {
                en: "Your return request for order - {{orderNumber}} item - {{subOrderNumber}} has been sent"
            },
            RETURN_REQUESTED_VENDOR: {
                en: "You have a return request for order - {{orderNumber}} item - {{subOrderNumber}}"
            },
            RETURN_REQUESTED_ADMIN: {
                en: "Return request for order - {{orderNumber}} item - {{subOrderNumber}} was sent"
            },
            
            RETURN_INITIATED: {
                en: "Return for order - {{orderNumber}} item - {{subOrderNumber}} has been initiated"
            },
            RETURN_INITIATED_VENDOR: {
                en: "You have a initiated return request for order - {{orderNumber}} item - {{subOrderNumber}}"
            },
            RETURN_INITIATED_ADMIN: {
                en: "Return request for order - {{orderNumber}} item - {{subOrderNumber}} was initiated"
            },
            RETURN_REJECTED: {
                en: "Return for order - {{orderNumber}} item - {{subOrderNumber}} has been rejected"
            },
            RETURN_REJECTED_VENDOR: {
                en: "You have a rejected return request for order - {{orderNumber}} item - {{subOrderNumber}}"
            },
            RETURN_REJECTED_ADMIN: {
                en: "Return request for order - {{orderNumber}} item - {{subOrderNumber}} was rejected"
            },
            PACKED: {
                en: "Your order - {{orderNumber}} item - {{subOrderNumber}} is packed"
            },
            ORDER_CANCELLED_VENDOR: {
                en: "Order - {{orderNumber}} item - {{subOrderNumber}} has been cancelled {{reason}}"
            },
            ORDER_CANCELLED_BY_VENDOR: {
                en: "Order - {{orderNumber}} item - {{subOrderNumber}} has been cancelled {{reason}}"
            },
            ADDED_COLLECTION: {
                en: "{{vendorName}} added new collection"
            },
            SHARE_PRODUCT: {
                en: "{{userName}} shared a product"
            },
            SHARE_POST: {
                en: "{{userName}} shared a post"
            },
            SHARE_VENDOR: {
                en: "{{userName}} shared a vendor"
            },
            ADMIN_ORDER_UPDATES: {
                PLACED: {
                    en: "New order placed"
                },
                ACCEPTED: {
                    en: "Order - {{orderNumber}} item - {{subOrderNumber}} is in process"
                },
                REJECTED: {
                    en: "Unfortunately we could not process order - {{orderNumber}} item - {{subOrderNumber}}"
                },
                DISPATCHED: {
                    en: "Order - {{orderNumber}} item - {{subOrderNumber}} is dispatched"
                },
                IN_TRANSIT: {
                    en: "Order - {{orderNumber}} item - {{subOrderNumber}} is in transit"
                },
                DELIVERED: {
                    en: "Order - {{orderNumber}} item - {{subOrderNumber}} is delivered"
                },
                CANCELLED: {
                    en: "Order - {{orderNumber}} item - {{subOrderNumber}} is cancelled"
                },
                PACKED: {
                    en: "Order - {{orderNumber}} item - {{subOrderNumber}} is packed"
                },
                RETURN_INITIATED: {
                    en: "Return request for order - {{orderNumber}} item - {{subOrderNumber}} was initiated"
                },
                RETURN_ACCEPTED: {
                    en: "Return accepted for order - {{orderNumber}} item - {{subOrderNumber}}"
                },
                RETURN_COMPLETED: {
                    en: "Return completed for order - {{orderNumber}} item - {{subOrderNumber}}"
                },
                RETURN_REQUESTED: {
                    en: "Return request for order - {{orderNumber}} item - {{subOrderNumber}} was sent"
                },
                RETURN_REJECTED: {
                    en: "Return request for order - {{orderNumber}} item - {{subOrderNumber}} was rejected"
                },
            }
        },
        TRANSACTION_STATUS: {
            FAILED: 'FAILED',
            SUCCESSFUL: 'SUCCESSFUL',
            PENDING: 'PENDING',
        },
        MESSAGE_TYPE: {
            TEXT: 'TEXT',
            IMAGE: 'IMAGE',
            AUDIO: 'AUDIO',
            VIDEO: 'VIDEO',
            PRODUCTS: 'PRODUCTS',
        },
        VIEW_TYPE: {
            SINGLE: 'SINGLE',
            TWICE: 'TWICE',
            ALWAYS: 'ALWAYS',
            MULTIPLE: 'MULTIPLE',
        },
        GRAPH_TYPE: {
            WEEKLY: 'WEEKLY',
            MONTHLY: 'MONTHLY',
            YEARLY: 'YEARLY',
        },
        REPORT_TYPE: {
            USERS: 'USERS',
            PACKAGE_DOWNLOAD: 'PACKAGE_DOWNLOAD',
            OBJECT_DOWNLOAD: 'OBJECT_DOWNLOAD',
            CONTENT_POSTED: 'CONTENT_POSTED',
            BUSINESS: 'BUSINESS',
            REVENUE: 'REVENUE'
        },
        CONTENT_TYPE: {
            GALLERY: 'GALLERY',
            OBJECTS: 'OBJECTS',
            PACKAGES: 'PACKAGES',
            FILTER: 'FILTER',
            LENSE: 'LENSE',
        },
        DEVICE_TYPES: {
            ANDROID: 'ANDROID',
            IOS: 'IOS',
            WEB: 'WEB'
        },
        LANGUAGES: {
            EN: 'en',
            AR: 'ar'
        },
        FILE_PREFIX: {
            ORIGINAL: 'original_',
            OBJECT: 'object_',
            THUMB: 'thumb_',
            VIDEO: 'video_',
            PACKAGE: 'package_',
            FILTER: 'filter_',
            LENSE: 'lense_',
            LOGO: 'logo_',
            BACKGROUND: 'background_',
            OBJECT_ORIGINAL: 'triggerImage_',
            PROFILE: 'profile_',
            CHAT: 'chat_',
        },
        LOGO_PREFIX: {
            ORIGINAL: 'logo_',
            THUMB: 'logoThumb_'
        },
        FILE_TYPES: {
            LOGO: 'LOGO',
            DOCUMENT: 'DOCUMENT',
            OTHERS: 'OTHERS',
            IMAGE: 'IMAGE',
            VIDEO: 'VIDEO',
            OBJECT: 'OBJECT',
            OTHER_FILE: 'OTHER_FILE',
        },
        UPLOAD_TYPES: {
            GALLERY: 'GALLERY',
            LOGO: 'LOGO',
            BACKGROUND: 'BACKGROUND',
            PACKAGE: 'PACKAGE',
            FILTER: 'FILTER',
            LENSE: 'LENSE',
            PROFILE: 'PROFILE',
            CHAT: 'CHAT'
        },
        DOCUMENT_PREFIX: 'document_'
    },
    DB_LOGGER_TYPES: {
        ERROR: {
            CLIENT: 'CLIENT',
            SERVER: 'SERVER',
            THIRD_PARTY: 'THIRD PARTY'
        },
        LOGGER: {
            REQUEST: 'REQUEST',
            RESPONSE: 'RESPONSE',
            CRON: 'CRON',
            BACKEND_PROCESS: 'BACKEND PROCESS'
        }
    }
};
