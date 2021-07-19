module.exports = {
    STATUS_MSG: {
        SUCCESS: {
            DEFAULT: {
                statusCode: 200,
                message: {
                    en: 'Success'
                },
                type: 'DEFAULT'
            },
            SUCCESS: {
                statusCode: 200,
                message: {
                    en: 'Success.'
                },
                type: 'SUCCESS'
            },
            CREATED: {
                statusCode: 200,
                message: {
                    en: 'Successfully created.'
                },
                type: 'CREATED'
            },
            SOCKET_CONNECTION: {
                statusCode: 200,
                message: {
                    en: 'Socket connected successfully'
                },
                type: 'SOCKET_CONNECTION'
            },
            DELETED: {
                statusCode: 200,
                message: {
                    en: 'Successfully deleted.'
                },
                type: 'DELETED'
            }
        },
        ERROR: {
            INVALID_TOKEN_TYPE: {
                statusCode: 400,
                message: {
                    en: 'Token type must be of Bearer type.'
                },
                type: 'INVALID_TOKEN_TYPE'
            },
            INVALID_TOKEN: {
                statusCode: 401,
                message: {
                    en: 'Invalid token.'
                },
                type: 'INVALID_TOKEN'
            },
            UNAUTHORIZED: {
                statusCode: 401,
                message: {
                    en: 'Sorry, your account has been logged in other device! Please login again to continue.'
                },
                type: 'UNAUTHORIZED'
            },
            SUBSCRIPTION_EXPIRED: {
                statusCode: 400,
                message: {
                    en: 'Your subscription has been expired, Please renew your subscription.'
                },
                type: 'SUBSCRIPTION_EXPIRED'
            },
            ONELOGIN_TOKEN_NOT_COMES: {
                statusCode: 500,
                message: {
                    en: 'Sorry token is not given by one login.'
                },
                type: 'ONELOGIN_TOKEN_NOT_COMES'
            },
            SOMETHING_WENT_WRONG_ONELOGIN: {
                statusCode: 500,
                message: {
                    en: 'Something went wrong on onelogin side.'
                },
                type: 'SOMETHING_WENT_WRONG_ONELOGIN'
            },
            SOMETHING_WENT_WRONG: {
                statusCode: 500,
                message: {
                    en: 'Something went wrong on server.'
                },
                type: 'SOMETHING_WENT_WRONG'
            },
            DB_ERROR: {
                statusCode: 400,
                message: {
                    en: 'DB Error : '
                },
                type: 'DB_ERROR'
            },
            DUPLICATE: {
                statusCode: 400,
                message: {
                    en: 'Duplicate Entry'
                },
                type: 'DUPLICATE'
            },
            INVALID_EMAIL: {
                statusCode: 400,
                message: {
                    en: 'Please enter valid credentials.'
                },
                type: 'INVALID_CREDENTIALS'
            },
            SOCIAL_REQUIRED: {
                statusCode: 400,
                message: {
                    en: 'socailId is required for social signup/login.'
                },
                type: 'SOCIAL_REQUIRED'
            },
            INVALID_PHONE: {
                statusCode: 400,
                message: {
                    en: 'Please enter valid credentials.'
                },
                type: 'INVALID_CREDENTIALS'
            },
            INVALID_EMAIL_FORGOT: {
                statusCode: 400,
                message: {
                    en: 'The email you entered does not exists.'
                },
                type: 'INVALID_EMAIL_FORGOT'
            },
            PHONE_VALIDATION: {
                statusCode: 400,
                message: {
                    en: 'Phone number should be in between 7-17 digits.'
                },
                type: 'PHONE_VALIDATION'
            },
            INVALID_PASSWORD: {
                statusCode: 400,
                message: {
                    en: 'Please enter valid credentials.'
                },
                type: 'INVALID_CREDENTIALS'
            },
            PAYMENT_FAILED: {
                statusCode: 400,
                message: {
                    en: 'Payment failed.'
                },
                type: 'PAYMENT_FAILED'
            },
            PAYMENT_FAILED_WALLET: {
                statusCode: 400,
                message: {
                    en: 'No enough money in wallet.'
                },
                type: 'PAYMENT_FAILED_WALLET'
            },
            REQUIRED_PASSWORD: {
                statusCode: 400,
                message: {
                    en: 'password is required.'
                },
                type: 'REQUIRED_PASSWORD'
            }, OLD_PASSWORD: {
                statusCode: 400,
                message: {
                    en: 'Please enter valid current password.'
                },
                type: 'OLD_PASSWORD'
            }, NO_FILE: {
                statusCode: 400,
                message: {
                    en: 'File is required.'
                },
                type: 'NO_FILE'
            },
            SAME_PASSWORD: {
                statusCode: 400,
                message: {
                    en: 'Current password and new password can not be same.'
                },
                type: 'SAME_PASSWORD'
            },
            INVALID_OTP: {
                statusCode: 400,
                message: {
                    en: 'Please enter valid OTP.'
                },
                type: 'INVALID_OTP'
            },
            CATEGORIES_REQUIRED: {
                statusCode: 400,
                message: {
                    en: 'Please select categories.'
                },
                type: 'CATEGORIES_REQUIRED'
            },
            ALREADY_VERIFIED: {
                statusCode: 400,
                message: {
                    en: 'Your account is already verified.'
                },
                type: 'ALREADY_VERIFIED'
            },
            ALREADY_VERIFIED_ADMIN: {
                statusCode: 400,
                message: {
                    en: 'This account is already verified.'
                },
                type: 'ALREADY_VERIFIED_ADMIN'
            },
            RETURN_ALREADY_INITIATED: {
                statusCode: 400,
                message: {
                    en: 'Return already initiated for this order.'
                },
                type: 'RETURN_ALREADY_INITIATED'
            },
            NOT_VERIFIED: {
                statusCode: 400,
                message: {
                    en: 'Your account is not verified yet.'
                },
                type: 'NOT_VERIFIED'
            },
            ALREADY_REQUESTED: {
                statusCode: 400,
                message: {
                    en: 'You have already requested this friend.'
                },
                type: 'ALREADY_REQUESTED'
            },
            ALREADY_UNFRIEND: {
                statusCode: 400,
                message: {
                    en: 'You are not friends.'
                },
                type: 'ALREADY_UNFRIEND'
            },
            ALREADY_FOLLOWED: {
                statusCode: 400,
                message: {
                    en: 'You have already followed this business.'
                },
                type: 'ALREADY_FOLLOWED'
            },
            ALREADY_UNFOLLOWED: {
                statusCode: 400,
                message: {
                    en: 'You have already unfollowed this business.'
                },
                type: 'ALREADY_UNFOLLOWED'
            },
            LINK_EXPIRED: {
                statusCode: 400,
                message: {
                    en: 'Link expired.'
                },
                type: 'LINK_EXPIRED'
            },
            
            ALREADY_CURRENCY: {
                statusCode: 400,
                message: {
                    en: 'Currency conversion already exists.'
                },
                type: 'ALREADY_CURRENCY'
            },
            OTP_EXPIRED: {
                statusCode: 400,
                message: {
                    en: 'Otp expired.'
                },
                type: 'OTP_EXPIRED'
            },
            ALREADY_ACCEPTED: {
                statusCode: 400,
                message: {
                    en: 'Your friend have already accepted this request.'
                },
                type: 'ALREADY_ACCEPTED'
            },
            ALREADY_FRIEND: {
                statusCode: 400,
                message: {
                    en: 'You are already friends.'
                },
                type: 'ALREADY_FRIEND'
            },
            ALREADY_ACCEPTED_RECEIVER: {
                statusCode: 400,
                message: {
                    en: 'You have already accepted this request.'
                },
                type: 'ALREADY_ACCEPTED_RECEIVER'
            },
            ALREADY_REJECTED_RECEIVER: {
                statusCode: 400,
                message: {
                    en: 'You have already accepted this request.'
                },
                type: 'ALREADY_REJECTED_RECEIVER'
            },
            SUBSCRIPTION_ALREADY_BLOCKED: {
                statusCode: 400,
                message: {
                    en: 'This subscription is already blocked.'
                },
                type: 'SUBSCRIPTION_ALREADY_BLOCKED'
            },
            USER_ALREADY_BLOCKED: {
                statusCode: 400,
                message: {
                    en: 'This account is already blocked.'
                },
                type: 'USER_ALREADY_BLOCKED'
            },
            STORE_ALREADY_BLOCKED: {
                statusCode: 400,
                message: {
                    en: 'This vendor manager is already blocked.'
                },
                type: 'STORE_ALREADY_BLOCKED'
            },
            ALREADY_BLOCKED: {
                statusCode: 400,
                message: {
                    en: 'Already blocked.'
                },
                type: 'ALREADY_BLOCKED'
            },
            PRODUCT_ALREADY_APPROVED: {
                statusCode: 400,
                message: {
                    en: 'This product is already approved.'
                },
                type: 'PRODUCT_ALREADY_APPROVED'
            },
            SUB_ALREADY_APPROVED: {
                statusCode: 400,
                message: {
                    en: 'This subscription is already approved.'
                },
                type: 'SUB_ALREADY_APPROVED'
            },
            PRODUCT_ALREADY_DISAPPROVED: {
                statusCode: 400,
                message: {
                    en: 'This product is already disapproved.'
                },
                type: 'PRODUCT_ALREADY_DISAPPROVED'
            },
            REQUEST_ALREADY_ACCEPTED: {
                statusCode: 400,
                message: {
                    en: 'Request already accepted by another representative'
                },
                type: 'REQUEST_ALREADY_ACCEPTED'
            },
            INVALID_REQUEST: {
                statusCode: 400,
                message: {
                    en: 'Invalid request'
                },
                type: 'INVALID_REQUEST'
            },
            INVALID_POSTAL: {
                statusCode: 400,
                message: {
                    en: 'Please enter a valid Zip Code'
                },
                type: 'INVALID_POSTAL'
            },
            STORE_ALREADY_UNBLOCKED: {
                statusCode: 400,
                message: {
                    en: 'This vendor manager is already unblocked.'
                },
                type: 'STORE_ALREADY_BLOCKED'
            },
            ALREADY_UNBLOCKED: {
                statusCode: 400,
                message: {
                    en: 'Already unblocked.'
                },
                type: 'ALREADY_UNBLOCKED'
            },
            STORE_ALREADY_VERIFIED: {
                statusCode: 400,
                message: {
                    en: 'This vendor manager is already verified.'
                },
                type: 'STORE_ALREADY_VERIFIED'
            },
            ORDER_ALREADY_ACCEPTED: {
                statusCode: 400,
                message: {
                    en: 'This order is no longer available.'
                },
                type: 'ORDER_ALREADY_ACCEPTED'
            },
            ORDER_NOT_BELONG: {
                statusCode: 400,
                message: {
                    en: 'This order is unavailable right now.'
                },
                type: 'ORDER_NOT_BELONG'
            },
            DRIVER_NOT_REACHED: {
                statusCode: 400,
                message: {
                    en: 'Driver have not reached vendor yet.'
                },
                type: 'DRIVER_NOT_REACHED'
            },
            DRIVER_NOT_PICKED: {
                statusCode: 400,
                message: {
                    en: 'Driver have not picked order yet.'
                },
                type: 'DRIVER_NOT_PICKED'
            },
            DRIVER_NOT_REACHED_CUSTOMER: {
                statusCode: 400,
                message: {
                    en: 'Driver have not reached customer yet.'
                },
                type: 'DRIVER_NOT_REACHED_CUSTOMER'
            },
            RATING_ALREADY_DONE: {
                statusCode: 400,
                message: {
                    en: 'Rating is already done.'
                },
                type: 'RATING_ALREADY_DONE'
            },
            RATING_AFTER_DELIVERY: {
                statusCode: 400,
                message: {
                    en: 'Rating can only be done after order is delivered.'
                },
                type: 'RATING_AFTER_DELIVERY'
            },
            USER_ALREADY_UNBLOCKED: {
                statusCode: 400,
                message: {
                    en: 'This account is already unblocked.'
                },
                type: 'USER_ALREADY_UNBLOCKED'
            },
            NO_REPRESENTATIVE_AVAILABLE: {
                statusCode: 400,
                message: {
                    en: 'Currently no representative is available for this vendor.'
                },
                type: 'NO_REPRESENTATIVE_AVAILABLE'
            },
            INVALID_ID: {
                statusCode: 400,
                message: {
                    en: 'Invalid id provided.'
                },
                type: 'INVALID_ID'
            },
            DISCOUNT_IN_USE: {
                statusCode: 400,
                message: {
                    en: 'Discount code already in use.'
                },
                type: 'DISCOUNT_IN_USE'
            },
            REFUND_REQUEST_DOES_NOT_EXIST: {
                statusCode: 400,
                message: {
                    en: 'There is no refund request.'
                },
                type: 'REFUND_REQUEST_DOES_NOT_EXIST'
            },
            REFUND_ACCEPTED: {
                statusCode: 400,
                message: {
                    en: 'Refund request already accepted.'
                },
                type: 'REFUND_ACCEPTED'
            },
            INVALID_DISCOUNT_COUPON: {
                statusCode: 430,
                message: {
                    en: 'Discount coupon you entered is invalid.'
                },
                type: 'INVALID_DISCOUNT_COUPON'
            },
            INVALID_VOUCHER_CODE: {
                statusCode: 400,
                message: {
                    en: 'Voucher code you entered is invalid.'
                },
                type: 'INVALID_VOUCHER_CODE'
            },
            REDEEMED_VOUCHER_CODE: {
                statusCode: 400,
                message: {
                    en: 'Voucher code already redeemed.'
                },
                type: 'REDEEMED_VOUCHER_CODE'
            },
            INVALID_DISCOUNT_COUPON_VENDOR: {
                statusCode: 430,
                message: {
                    en: 'Discount coupon is invalid for cart items.'
                },
                type: 'INVALID_DISCOUNT_COUPON_VENDOR'
            },
            DISCOUNT_COUPON_USAGE_EXCEEDED: {
                statusCode: 430,
                message: {
                    en: 'Discount coupon is exceeded its limit.'
                },
                type: 'DISCOUNT_COUPON_USAGE_EXCEEDED'
            },
            REFUND_REJECTED: {
                statusCode: 400,
                message: {
                    en: 'Refund request already rejected.'
                },
                type: 'REFUND_REJECTED'
            },
            PRODUCT_UNAVAILABLE: {
                statusCode: 400,
                message: {
                    en: 'Product is not available right now.'
                },
                type: 'PRODUCT_UNAVAILABLE'
            },
            ACCEPTED: {
                statusCode: 400,
                message: {
                    en: 'Order already accepted.'
                },
                type: 'ACCEPTED'
            },
            REJECTED: {
                statusCode: 400,
                message: {
                    en: 'Order already rejected.'
                },
                type: 'REJECTED'
            },
            DISPATCHED: {
                statusCode: 400,
                message: {
                    en: 'Order already dispatched.'
                },
                type: 'DISPATCHED'
            },
            IN_TRANSIT: {
                statusCode: 400,
                message: {
                    en: 'Order already in transit.'
                },
                type: 'IN_TRANSIT'
            },
            PACKED: {
                statusCode: 400,
                message: {
                    en: 'Order already packed.'
                },
                type: 'PACKED'
            },
            DELIVERED: {
                statusCode: 400,
                message: {
                    en: 'Order already delivered.'
                },
                type: 'DELIVERED'
            },
            NOT_YET_DELIVERED: {
                statusCode: 400,
                message: {
                    en: 'Order not yet delivered.'
                },
                type: 'NOT_YET_DELIVERED'
            },
            CANCELLED_BY_USER: {
                statusCode: 400,
                message: {
                    en: 'Order already cancelled by user.'
                },
                type: 'CANCELLED_BY_USER'
            },
            CANCELLED: {
                statusCode: 400,
                message: {
                    en: 'Order already cancelled.'
                },
                type: 'CANCELLED'
            },
            CAN_NOT_CANCEL: {
                statusCode: 400,
                message: {
                    en: 'Order can not be cancelled.'
                },
                type: 'CAN_NOT_CANCEL'
            },

            CART_EMPTY: {
                statusCode: 400,
                message: {
                    en: 'Cart is empty'
                },
                type: 'CART_EMPTY'
            },
            INVALID_FILE_TYPE: {
                statusCode: 400,
                message: {
                    en: 'Please Select valid file type.'
                },
                type: 'INVALID_FILE_TYPE'
            },
            APP_ERROR: {
                statusCode: 400,
                message: {
                    en: 'Application Error.'
                },
                type: 'APP_ERROR'
            },
            EMAIL_ALREADY_EXIST: {
                statusCode: 400,
                message: {
                    en: 'Email address you have entered is already registered with us.'
                },
                type: 'ALREADY_EXIST'
            },
            NAME_ALREADY_EXISTS: {
                statusCode: 400,
                message: {
                    en: 'Registration name you entered is already registered with us.'
                },
                type: 'NAME_ALREADY_EXISTS'
            },
            PHONE_ALREADY_EXIST: {
                statusCode: 400,
                message: {
                    en: 'Phone Number you have entered is already registered with us.'
                },
                type: 'PHONE_ALREADY_EXIST'
            },
            FEED_NOT_BELONG: {
                statusCode: 400,
                message: {
                    en: "This post does not belong to you."
                },
                type: 'FEED_NOT_BELONG'
            },
            BLOCKED: {
                statusCode: 401,
                message: {
                    en: 'This account has been blocked by admin.'
                },
                type: 'BLOCKED'
            },
            VERIFY_ACCOUNT: {
                statusCode: 400,
                message: {
                    en: 'Please verify your account to login.'
                },
                type: 'VERIFY_ACCOUNT'
            },
            ACCOUNT_DELETED: {
                statusCode: 400,
                message: {
                    en: 'This account has been deleted.'
                },
                type: 'ACCOUNT_DELETED'
            },
            ADMIN_VERIFIED: {
                statusCode: 400,
                message: {
                    en: 'Admin has not verified your account yet, Please try again after some time.'
                },
                type: 'VERIFY_ACCOUNT'
            },
            VERIFY_ACCOUNT_FORGOT: {
                statusCode: 400,
                message: {
                    en: 'Please verify your account first.'
                },
                type: 'VERIFY_ACCOUNT'
            },
            COUNTRY_CODE: {
                statusCode: 400,
                message: {
                    en: 'Country code is required.'
                },
                type: 'COUNTRY_CODE'
            },
            NOT_REGISTERED: {
                statusCode: 400,
                message: {
                    en: 'Currently, you are not registered with us.'
                },
                type: 'NOT_REGISTERED'
            },
            SOCKET_CONNECTION: {
                statusCode: 400,
                message: {
                    en: 'Error while connecting to socket'
                },
                type: 'SOCKET_CONNECTION'
            },
            SOCKET_REQUIRED_MISSING: {
                statusCode: 400,
                message: {
                    en: 'Required fields are missing'
                },
                type: 'SOCKET_REQUIRED_MISSING'
            }
        }
    }
};
