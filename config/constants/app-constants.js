require('dotenv').config();

const APP_CONSTANT = require('./app-defaults')

module.exports = {
    EMAIL_CONTENT:{
        RESET_PASSWORD:{
            en:`Please use the following otp to reset password for `,
        },
        THANK_YOU:{
            en:`Thank you for using My Vendor!`,
        },
        THANK_YOU_1:{
            en:`thank you for signing-up with MyVendors`,
        },
        THANK_YOU_2:{
            en:`thank you again`,
        },
        THANK_YOU_3:{
            en:`thank you`,
        },
        VENDOR_SIGN_UP_1:{
            en:`We are thrilled to welcome you to vendor owner family and hope you will enjoy the experience in selling, listing your products and start growing your business in the right way!`,
        },
        VENDOR_SIGN_UP_2:{
            en:`Our platform designed for you to list your products, start trading and connect you with your clients in brilliant way.`,
        },
        VENDOR_SIGN_UP_3:{
            en:`We will take care of processing your payment, fulfilment with shipping services and do magnificent marketing through our platform, push notifications to your follows with new products and new announcements that you do have… we do even much more!`,
        },
        VENDOR_SIGN_UP_4:{
            en:`Start customizing your vendor and select the right plan to go live and please don’t forget, if you need any support please reach out to us and it will be our pleasure to support you.`,
        },
        USER_SIGN_UP_1:{
            en:`We are thrilled to welcome you to Users family and hope you will enjoy the experience in exploring and buying unique products through our platform.`,
        },
        USER_SIGN_UP_2:{
            en:`MyVendors allows you and your friends to connect, share and create your own posts and getting up to date feeds about our passionate vendor owners & products as well.`,
        },
        USER_SIGN_UP_3:{
            en:`Explore MyVendors and introduce yourself to the creative products made by our entrepreneurs across the globe for you to get and enjoy`,
        },
        USER_SIGN_UP_4:{
            en:`Lastly, don’t forget if you are a small business owner, entrepreneur and passionate to sell and show your own products; MyVendors is the right place to start your business with.`,
        },
        OTP_MESSAGE:{
            en:`OTP`,
        },
        OTP_EMAIL_MESSAGE:{
            en:`Please use the following otp to verify you account in MyVendors for`,
        },
        ORDER_CONFIRMATION_TEXT:{
            en : `This email confirms that we have received your order placed on {{date}}. Please do us a huge favor, and simply check the below, as we’re going to get it sent to you soon. Order status will be shared with you frequently`
        },
        ORDER_EXPERIENCE_TEXT:{
            en : `thank you, we hope it was enjoyable experience`
        },
        SIGNUP_EXPERIENCE_TEXT:{
            en : `Enjoy the experience!`
        },
        DAY_STRING:{
            en : `Your Subscription with MyVendors for the selected plan will be expired in {{day}} days! We will need your support in re-new your subscription through login to your vendor page “{{vendorRegisterName}}” and complete the payment under plans. If you have already paid, please ignore this email and thank you in advance.`
        },
        AUTO_DAY_STRING:{
            en : `Your Subscription with MyVendors for the selected plan will be automatically renew in {{day}} days! There’s nothing more you need to do.`
        },
        BOUGHT_SUBSCRIPTION:{
            en : `Your Subscription with MyVendors for the selected plan has been bought.`
        },
        EXPLORE_STRING:{
            en : `Now may be a good time to explore & upgrade to MyVendor Platinum (if you are not already) and expanding your business and customize your vendor the way you prefer. You can enjoy awesome features such as:`
        },
        SHARE_GIFT_INSTRUCTIONS:{
            en : `Use this gift card to redeem amount in wallet, go to wallet enter code - {{code}} in Enter Voucher field and click on redeem voucher. Enjoy ordering anything using amount in wallet from gift.`
        },
        SHARE_GIFT_INSTRUCTIONS_EMAIL:{
            en : `Use this gift card to redeem amount in wallet, If not registered then go to `
        },
        SHARE_GIFT_INSTRUCTIONS_PART_2:{
            // en : `register yourself and go to wallet, enter code - {{code}} in Enter Voucher field and click on redeem voucher. Enjoy ordering anything using amount in wallet from gift.`
            en : `For redeem your gift, please go to your profile, click vWallet and insert this code “{{code}}” under redeem gift card voucher and click redeem voucher and simply you will get your gift amount within MyVendors wallet for you to get your favorite products through the website.`
        },
        USER_NAME:{
            // en : `{{firstName}}{{lastName}} shared a gift card with you.`
            en : `We are thrilled to let you know that “{{firstName}} {{lastName}}” shared with you a gift card to celebrate with you in your special occasion. If you not already a member with MyVendors, please join us now through visiting `
        },
        EXPERIENCE_GIFT:{
            // en : `{{firstName}}{{lastName}} shared a gift card with you.`
            en : `Hope you will enjoy the experience in exploring and buying unique products through our platform. `
        },
        EXCITING_TEXT:{
            // en : `{{firstName}}{{lastName}} shared a gift card with you.`
            en : `excited news !!! you just received a gift card`
        },
        UNSUBSCRIBE_EMAIL_TEXT:{
            en : `Email unsubscribed successfully`
        }
    },
    DEFAULT_WORKING_DAYS:[
        {
            days:1,
            openingTime: 64800,
            closingTime: 32400,
            status: APP_CONSTANT.STATUS_ENUM.ACTIVE,
            createdAt: +new Date()
        },
        {
            days:2,
            openingTime: 64800,
            closingTime: 32400,
            status: APP_CONSTANT.STATUS_ENUM.ACTIVE,
            createdAt: +new Date()
        },
        {
            days:3,
            openingTime: 64800,
            closingTime: 32400,
            status: APP_CONSTANT.STATUS_ENUM.ACTIVE,
            createdAt: +new Date()
        },
        {
            days:4,
            openingTime: 64800,
            closingTime: 32400,
            status: APP_CONSTANT.STATUS_ENUM.ACTIVE,
            createdAt: +new Date()
        },
        {
            days:5,
            openingTime: 64800,
            closingTime: 32400,
            status: APP_CONSTANT.STATUS_ENUM.ACTIVE,
            createdAt: +new Date()
        },
        {
            days:6,
            openingTime: 64800,
            closingTime: 32400,
            status: APP_CONSTANT.STATUS_ENUM.ACTIVE,
            createdAt: +new Date()
        },
        {
            days:0,
            openingTime: 64800,
            closingTime: 32400,
            status: APP_CONSTANT.STATUS_ENUM.HOLIDAY,
            createdAt: +new Date()
        },
    ]
};
