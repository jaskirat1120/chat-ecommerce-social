// constants imported
const RESPONSE_MESSAGES = require('../../../config/constants').responseMessages;
const APP_CONSTANTS = require('../../../config').constants.appDefaults;

// local modules
const Dao = require('../../../dao').queries;
const Models = require('../../../models');
const TokenManager = require('../../../lib/token-manager');
const HelperCommonFunction = require('../../helper-functions/common');
const EmailHandler = require('../../email-helpers/emailHandler');
const UniversalFunctions = require('../../../utils/universal-functions');
const AdminHelperFunction = require('../../helper-functions/admin');
const moment = require('moment');
const {trendingHashAndPost} = require('../../user/explore/controller');

const adminLogin = async (payload) => {
    try {
        // check admin exist
        let issuedAt = +new Date();
        let criteria = {
            email: payload.email
        };

        let otp = await UniversalFunctions.generateRandomOTP();
        // let otp = "123456"

        let adminData = await Dao.findOne(Models.admin, criteria, {}, {lean: true});
        if (!!adminData && adminData._id) {
            if (await UniversalFunctions.compareCryptData(payload.password, adminData.password)) {
                // generating token
                let tokenData = {
                    _id: adminData._id,
                    scope: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
                    issuedAt: issuedAt,
                    superAdmin: adminData.superAdmin,
                    permissions: adminData.permissions ? adminData.permissions : ""
                };

                adminData.accessToken = TokenManager.generateToken(tokenData, APP_CONSTANTS.AUTH_STRATEGIES.ADMIN);
                await Dao.findAndUpdate(Models.admin, criteria, {
                    issuedAt: issuedAt,
                    OTP: otp,
                    OTPExpiry: +moment().add(5, 'minutes')
                }, {lean: true})

                await EmailHandler.sendEmailLoginOTP(payload, otp);
                // removing unwanted fields
                delete adminData.password;
                delete adminData.OTP;
                delete adminData.OTPExpiry;
                delete adminData.__v;

                return {};
            } else {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_PASSWORD;
            }
        } else {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_EMAIL;
        }
    } catch (err) {
        throw err;
    }
};


let resendOTP = async (payload) => {
    let criteria = {};
    criteria = {
        email: payload.email
    };
    let data = await Dao.findOne(Models.admin, criteria, {}, {lean: true});
    if (data) {
        let otp = await UniversalFunctions.generateRandomOTP();
        // let otp = "123456";
        let dataToUpdate = {
            OTP: otp
        };
        await EmailHandler.sendEmailLoginOTP(payload, otp);
        await Dao.findAndUpdate(Models.admin, criteria, dataToUpdate, {lean: true, new: true});
        return {};
    } else {
        throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.NOT_REGISTERED;
    }
};


let saveSettings = async (payload, userData) => {
    payload.updatedBy = userData._id;
    payload.updatedDate = +new Date();

    let findSettings = await Dao.findOne(Models.appDefaults, {}, {}, {lean: true});
    if (findSettings) {
        return await Dao.findAndUpdate(Models.appDefaults, {}, payload, {lean: true, new: true});
    } else {
        return await Dao.saveData(Models.appDefaults, payload);
    }

};
let getSettings = async (userData) => {
    return await Dao.findOne(Models.appDefaults, {}, {}, {lean: true});
};

let verifyAccount = async (payload, userData) => {
    try {
        let criteria = {
            email: payload.email
        };
        let get = await Dao.getData(Models.admin, criteria, {
            isVerified: 1,
            OTP: 1,
            OTPExpiry: 1,
            permissions: 1,
            superAdmin: 1
        }, {lean: true});
        if (get.length) {
            if (/*payload.OTP !== '123456' && */ get[0].OTP !== payload.OTP) {
                return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_OTP);
            } else if (get[0].OTPExpiry < +new Date()) {
                return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_OTP);
            } else {
                let issuedAt = +new Date();
                let dataToUpdate = {isVerified: true, OTP: '', issuedAt: issuedAt};
                let tokenData = {
                    _id: get[0]._id,
                    scope: APP_CONSTANTS.AUTH_STRATEGIES.ADMIN,
                    issuedAt: issuedAt,
                    superAdmin: get[0].superAdmin,
                    permissions: get[0].permissions ? get[0].permissions : ""
                };

                let updatedData = await Dao.findAndUpdate(Models.admin, criteria, dataToUpdate, {
                    lean: true,
                    new: true
                });
                updatedData.accessToken = await TokenManager.generateToken(tokenData, APP_CONSTANTS.AUTH_STRATEGIES.ADMIN);
                delete updatedData.password;
                return updatedData;
            }
        } else {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID;
        }
    } catch (e) {
        console.log(e);
        throw e;
    }
};


let updatePress = async (payload, userData) => {
    payload.updatedBy = userData._id;
    payload.updatedDate = +new Date();

    let findSettings = await Dao.findOne(Models.press, {}, {}, {lean: true});
    if (findSettings) {
        return await Dao.findAndUpdate(Models.press, {}, payload, {lean: true, new: true});
    } else {
        return await Dao.saveData(Models.press, payload);
    }

};
let getPress = async (userData) => {
    return await Dao.findOne(Models.press, {}, {}, {lean: true});
};


let uploadFile = async (payload, userData) => {
    try {
        console.log("payload.file", payload.file)
        if (payload.file && payload.file.hapi.filename) {
            let url = await HelperCommonFunction.fileUpload(payload.file, "FILE",);
            url.type = payload.type;
            //
            return url;
        } else throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.NO_FILE;
    } catch (err) {
        throw err;
    }
};


let forgotPassword = async (payload) => {
    try {
        let criteria = {}, dataToUpdate = {};
        if (validator.validate(payload.email)) {
            criteria.email = payload.email;
            let getData = await Dao.findOne(Models.admin, criteria, {}, {lean: true});
            if (getData) {
                if (getData.status === APP_CONSTANTS.STATUS_ENUM.BLOCKED) return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.BLOCKED);
                // else if (getData.isVerified === false) return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.VERIFY_ACCOUNT_FORGOT);
                else {
                    dataToUpdate.resetPasswordExpiry = +moment().add(24, 'hours');
                    let url = `${process.env.RESET_PASSWORD_ADMIN}/${getData._id}/${dataToUpdate.resetPasswordExpiry}`;
                    await EmailHandler.sendEmailForgotPassword(getData, url);
                    await Dao.findAndUpdate(Models.admin, criteria, dataToUpdate, {lean: true, new: true});
                    return {}
                }
            } else {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.NOT_REGISTERED
            }
        }
    } catch (e) {
        console.log(e);
        throw e
    }
};


const changePassword = async (payload, userData) => {
    try {
        return HelperCommonFunction.changePassword(payload, userData, Models.admin)
    } catch (err) {
        throw err
    }

};


let resetPassword = async (payload) => {
    try {
        return await AdminHelperFunction.resetPassword(payload, Models.admin);
    } catch (e) {
        console.log(e);
        throw e
    }
};

const dashboardData = async (payload) => {
    try {
        let dataToReturn = {};
        let current = +new Date();
        let object = {};
        let seven = current - 604800000;
        let sevenDays = {$gte: seven, $lte: current};
        let dataToSend = {};
        let endDateTime1 = +moment(payload.endDate).endOf('day')._d;
        let startDateTime1 = +moment(payload.startDate).startOf('day')._d;
        object = {$gte: startDateTime1, $lte: endDateTime1};
        let appDefaults = await Dao.findOne(Models.appDefaults, {}, {
            duePaymentDays: 1
        }, {sort: {_id: -1}, limit: 1})

        let activeUsers = async () => {
            let criteria = {
                status: APP_CONSTANTS.STATUS_ENUM.ACTIVE
            };
            if (payload.startDate && payload.endDate) criteria.createdDate = object;
            return Dao.countDocuments(Models.user, criteria);
        };
        let totalUsers = async () => {
            let criteria = {
                status: {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED}
            };
            if (payload.startDate && payload.endDate) criteria.createdDate = object;
            return Dao.countDocuments(Models.user, criteria);
        };
        let blockedUsers = async () => {
            let criteria = {
                status: APP_CONSTANTS.STATUS_ENUM.BLOCKED
            };
            if (payload.startDate && payload.endDate) criteria.createdDate = object;
            return Dao.countDocuments(Models.user, criteria);
        };

        let onAirVendors = async () => {
            let criteria = {
                status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
                isAdminVerified: true,
            };
            if (payload.startDate && payload.endDate) criteria.createdDate = object;
            return Dao.countDocuments(Models.vendors, criteria);
        };
        let unAuthorizedVendors = async () => {
            let criteria = {
                status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
                isAdminVerified: false,
            };
            if (payload.startDate && payload.endDate) criteria.createdDate = object;
            return Dao.countDocuments(Models.vendors, criteria);
        };
        let initialRegistrationVendors = async () => {
            let criteria = {
                status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
                profileStatus: APP_CONSTANTS.PROFILE_ENUM.PENDING,
            };
            if (payload.startDate && payload.endDate) criteria.createdDate = object;
            return Dao.countDocuments(Models.vendors, criteria);
        };
        let totalVendors = async () => {
            let criteria = {
                status: {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED}
            };
            if (payload.startDate && payload.endDate) criteria.createdDate = object;
            return Dao.countDocuments(Models.vendors, criteria);
        };
        let blockedVendors = async () => {
            let criteria = {
                status: APP_CONSTANTS.STATUS_ENUM.BLOCKED
            };
            if (payload.startDate && payload.endDate) criteria.createdDate = object;
            return Dao.countDocuments(Models.vendors, criteria);
        };

        let approvedProducts = async () => {
            let criteria = {
                status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
                isAdminVerified: true,
            };
            if (payload.startDate && payload.endDate) criteria.createdDate = object;
            return Dao.countDocuments(Models.products, criteria);
        };
        let unApprovedProducts = async () => {
            let criteria = {
                status: {$in: [APP_CONSTANTS.STATUS_ENUM.ACTIVE, APP_CONSTANTS.STATUS_ENUM.PENDING]},
                isAdminVerified: false,
            };
            if (payload.startDate && payload.endDate) criteria.createdDate = object;
            return Dao.countDocuments(Models.products, criteria);
        };
        let totalProducts = async () => {
            let criteria = {
                status: {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED}
            };
            if (payload.startDate && payload.endDate) criteria.createdDate = object;
            return Dao.countDocuments(Models.products, criteria);
        };
        let soldOutProducts = async () => {
            let criteria = {
                status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
                availableForSale: false
            };
            if (payload.startDate && payload.endDate) criteria.createdDate = object;
            return Dao.countDocuments(Models.products, criteria);
        };
        let activeProducts = async () => {
            let criteria = {
                status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
                availableForSale: true
            };
            if (payload.startDate && payload.endDate) criteria.createdDate = object;
            return Dao.countDocuments(Models.products, criteria);
        };
        let blockedProducts = async () => {
            let criteria = {
                status: APP_CONSTANTS.STATUS_ENUM.BLOCKED
            };
            if (payload.startDate && payload.endDate) criteria.createdDate = object;
            return Dao.countDocuments(Models.products, criteria);
        };
        let totalOrders = async () => {
            let criteria = {
                orderId: {
                    $exists: true
                }
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let aggregatePipeline = [
                {
                    $match: criteria,
                },
                {
                    $group: {
                        _id: "$orderId",
                        data: {
                            $first: "$$ROOT"
                        }
                    }
                }];
            let data = await Dao.aggregateData(Models.orders, aggregatePipeline)
            return data.length
        };
        let activeOrders = async () => {
            let criteria = {
                status: {
                    $in: [APP_CONSTANTS.ORDER_STATUS_ENUM.PLACED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.IN_TRANSIT,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.DISPATCHED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.ACCEPTED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_PENDING,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_FAILED]
                }
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let aggregatePipeline = [
                {
                    $match: criteria,
                },
                {
                    $group: {
                        _id: "$orderId",
                        data: {
                            $first: "$$ROOT"
                        }
                    }
                }];
            let data = await Dao.aggregateData(Models.orders, aggregatePipeline)
            return data.length
        };
        let pastOrders = async () => {
            let criteria = {
                status: {
                    $in: [APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED, APP_CONSTANTS.ORDER_STATUS_ENUM.REJECTED, APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED, APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_COMPLETED]
                }
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let aggregatePipeline = [
                {
                    $match: criteria,
                },
                {
                    $group: {
                        _id: "$orderId",
                        data: {
                            $first: "$$ROOT"
                        }
                    }
                }];
            let data = await Dao.aggregateData(Models.orders, aggregatePipeline)
            return data.length
        };

        let closedOrders = async () => {
            let criteria = {
                status: {
                    $in: [APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.REJECTED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_REJECTED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_COMPLETED]
                }
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let aggregatePipeline = [
                {
                    $match: criteria,
                },
                {
                    $group: {
                        _id: "$orderId",
                        data: {
                            $first: "$$ROOT"
                        }
                    }
                }];
            let data = await Dao.aggregateData(Models.orders, aggregatePipeline)
            return data.length
        };

        let openRefundOrders = async () => {
            let criteria = {
                status: {
                    $in: [APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_REQUESTED, APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_INITIATED]
                }
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let aggregatePipeline = [
                {
                    $match: criteria,
                },
                {
                    $group: {
                        _id: "$orderId",
                        data: {
                            $first: "$$ROOT"
                        }
                    }
                }];
            let data = await Dao.aggregateData(Models.orders, aggregatePipeline)
            return data.length
        };
        let cancelledByVendorOrders = async () => {
            let criteria = {
                status: {
                    $in: [APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED_VENDOR]
                }
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let aggregatePipeline = [
                {
                    $match: criteria,
                },
                {
                    $group: {
                        _id: "$orderId",
                        data: {
                            $first: "$$ROOT"
                        }
                    }
                }];
            let data = await Dao.aggregateData(Models.orders, aggregatePipeline)
            return data.length
        };

        let cancelledOrders = async () => {
            let criteria = {
                status: {
                    $in: [APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED]
                }
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let aggregatePipeline = [
                {
                    $match: criteria,
                },
                {
                    $group: {
                        _id: "$orderId",
                        data: {
                            $first: "$$ROOT"
                        }
                    }
                }];
            let data = await Dao.aggregateData(Models.orders, aggregatePipeline)
            return data.length
        };
        let paymentFailedOrders = async () => {
            let criteria = {
                status: {
                    $in: [APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_FAILED]
                }
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let aggregatePipeline = [
                {
                    $match: criteria,
                },
                {
                    $group: {
                        _id: "$orderId",
                        data: {
                            $first: "$$ROOT"
                        }
                    }
                }];
            let data = await Dao.aggregateData(Models.orders, aggregatePipeline)
            return data.length
        };
        let paymentPendingOrders = async () => {
            let criteria = {
                status: {
                    $in: [APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_PENDING]
                },
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let aggregatePipeline = [
                {
                    $match: criteria,
                },
                {
                    $group: {
                        _id: "$orderId",
                        data: {
                            $first: "$$ROOT"
                        }
                    }
                }];
            let data = await Dao.aggregateData(Models.orders, aggregatePipeline);
            return data.length
        };

        let paymentPendingCODOrders = async () => {
            let criteria = {
                paymentStatus: {
                    $in: [APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING]
                },
                paymentMethod: {$in: [APP_CONSTANTS.PAYMENT_METHOD_ENUM.CASH_ON_DELIVERY]}
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let aggregatePipeline = [
                {
                    $match: criteria,
                },
                {
                    $group: {
                        _id: "$orderId",
                        data: {
                            $first: "$$ROOT"
                        }
                    }
                }];
            let data = await Dao.aggregateData(Models.orders, aggregatePipeline);
            return data.length
        };
        let paymentCompletedOrders = async () => {
            let criteria = {
                paymentStatus: {
                    $in: [APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED]
                }
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let aggregatePipeline = [
                {
                    $match: criteria,
                },
                {
                    $group: {
                        _id: "$orderId",
                        data: {
                            $first: "$$ROOT"
                        }
                    }
                }];
            let data = await Dao.aggregateData(Models.orders, aggregatePipeline);
            return data.length
        };

        let numberOfPosts = async () => {
            let criteria = {
                status: {$in: [APP_CONSTANTS.STATUS_ENUM.ACTIVE, APP_CONSTANTS.STATUS_ENUM.EDITED]}
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let data = await Dao.countDocuments(Models.feeds, criteria)
            return data
        };


        let numberOfPublicPostShared = async () => {
            let criteria = {
                status: {$in: [APP_CONSTANTS.STATUS_ENUM.ACTIVE, APP_CONSTANTS.STATUS_ENUM.EDITED]},
                type: {$in: [APP_CONSTANTS.FEED_TYPE.SHARE_POST, APP_CONSTANTS.FEED_TYPE.SHARE_PRODUCT, APP_CONSTANTS.FEED_TYPE.SHARE_VENDOR]},
                privacyType: APP_CONSTANTS.PRIVACY_TYPE.PUBLIC
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let data = await Dao.countDocuments(Models.feeds, criteria)
            return data
        };


        let numberOfPrivatePostShared = async () => {
            let criteria = {
                status: {$in: [APP_CONSTANTS.STATUS_ENUM.ACTIVE, APP_CONSTANTS.STATUS_ENUM.EDITED]},
                type: {$in: [APP_CONSTANTS.FEED_TYPE.SHARE_POST, APP_CONSTANTS.FEED_TYPE.SHARE_PRODUCT, APP_CONSTANTS.FEED_TYPE.SHARE_VENDOR]},
                privacyType: {$in: [APP_CONSTANTS.PRIVACY_TYPE.SELECTIVE, APP_CONSTANTS.PRIVACY_TYPE.PRIVATE]}
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let data = await Dao.countDocuments(Models.feeds, criteria)
            return data
        };


        let noOfLikesOnFeeds = async () => {
            let criteria = {
                status: APP_CONSTANTS.STATUS_ENUM.LIKE,
                reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.POST_LIKE
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let data = await Dao.countDocuments(Models.reactions, criteria)
            return data
        };

        let noOfCommentsOnFeeds = async () => {
            let criteria = {
                status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let data = await Dao.countDocuments(Models.comments, criteria)
            return data
        };

        let noOfReportsOnFeeds = async () => {
            let criteria = {
                status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
                type: APP_CONSTANTS.REPORT_TYPE.FEED
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let data = await Dao.countDocuments(Models.commonReports, criteria)
            return data
        };


        let topFeeds = async () => {
            let trendingFeedCriteria = {
                status: {$in: [APP_CONSTANTS.STATUS_ENUM.ACTIVE, APP_CONSTANTS.STATUS_ENUM.EDITED]}
            };

            let aggregateDataForFeeds = [];
            trendingFeedCriteria.$and = [];
            let orCriteria = [{
                privacyType: APP_CONSTANTS.PRIVACY_TYPE.PUBLIC,
                user: {$exists: true}
            }];
            trendingFeedCriteria.$and.push({
                $or: orCriteria
            });

            let aggregatePipeline = [
                {$match: trendingFeedCriteria},
                {
                    $sort: {
                        likes: -1,
                        comments: -1
                    }
                },
                {
                    $limit: 5
                }
            ];
            return await Dao.aggregateDataWithPopulate(Models.feeds, aggregatePipeline, [{
                path: 'user',
                select: 'firstName lastName profilePic'
            }])

        };

        let subscriptionData = async () => {
            let trendingHashCriteria = {
                type: APP_CONSTANTS.PLAN_TYPE.NORMAL
            }

            let aggregatePipelineHashTag = [
                {
                    $match: trendingHashCriteria
                },
                {
                    $project: {
                        plan: 1
                    }
                },
                {
                    $group: {
                        _id: "$plan",
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        count: -1
                    }
                }
            ]

            return await Dao.aggregateDataWithPopulate(Models.subscriptionLogs, aggregatePipelineHashTag, [{
                path: '_id',
                select: 'name description',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.PLANS
            }])
        };

        let trendingHashTags = async () => {
            let trendingHashCriteria = {
                taggedVendors: {$ne: []},
                hashTag: {$ne: []}
            }

            let aggregatePipelineHashTag = [
                {
                    $match: trendingHashCriteria
                },
                {
                    $project: {
                        hashTag: 1,
                        taggedVendors: 1
                    }
                },
                {
                    $unwind: {
                        path: "$hashTag",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: "$hashTag",
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        count: -1
                    }
                },
                {
                    $limit: 5
                }
            ]

            return await Dao.aggregateDataWithPopulate(Models.feeds, aggregatePipelineHashTag, [{
                path: 'user',
                select: 'firstName lastName profilePic'
            }])
        };

        let refundItemsForVendor = async () => {
            let orderCriteria = {
                status: {
                    $in: [
                        APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_COMPLETED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_INITIATED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_ACCEPTED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_REQUESTED
                    ]
                }
            }

            let aggregatePipelineHashTag = [
                {
                    $match: orderCriteria
                },
                {
                    $project: {
                        quantity: 1,
                        products: 1,
                        refundQuantity: 1
                    }
                },
                {
                    $group: {
                        _id: null,
                        count: {
                            $sum: "$refundQuantity"
                        }
                    }
                },
                {
                    $sort: {
                        count: -1
                    }
                }
            ]

            return await Dao.aggregateDataWithPopulate(Models.orders, aggregatePipelineHashTag, [{
                path: 'user',
                select: 'firstName lastName profilePic'
            }])
        };


        let paymentsDueToOwners = async () => {
            let criteria = {
                status: {
                    $in: [APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED]
                },
                refundStatus: {$in: [APP_CONSTANTS.REFUND_STATUS.NOT_REQUESTED, APP_CONSTANTS.REFUND_STATUS.REJECTED]}
            };
            criteria.transferred = false;
            criteria.$and = [{
                createdDate: {
                    $lt: +moment().subtract(appDefaults.duePaymentDays ? appDefaults.duePaymentDays : 15, "days")
                }
            }, {
                createdDate: {
                    $lt: +moment().day(1 + 7)
                }
            }]
            // if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let aggregateArray = [
                {
                    $match: criteria,
                }, {
                    $project: {
                        transactionId: 1,
                        createdDate: 1,
                        transferred: 1,
                        order: 1,
                        amountWithTax: 1,
                        amount: 1,
                        transactionType: 1,
                        productPaymentMethodChargeTotal: 1,
                        productShippingChargeTotal: 1
                    }
                },
                {
                    $addFields: {
                        amountFinal: {
                            $cond: {
                                if: {$eq: ["$transactionType", APP_CONSTANTS.TRANSACTION_TYPES.ORDER]},
                                then: "$amountWithTax",
                                else: {$multiply: ["$amountWithTax", -1]}
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        amount: {
                            $sum: "$amountWithTax"
                        }
                    }
                }];
            return await Dao.aggregateData(Models.transactions, aggregateArray);
        };

        let paymentsPendingTotal = async () => {
            let criteria = {
                status: {
                    $in: [APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING]
                },
                paymentMethod: {$in: [APP_CONSTANTS.PAYMENT_METHOD_ENUM.CREDIT_CARD, APP_CONSTANTS.PAYMENT_METHOD_ENUM.DEBIT_CARD, APP_CONSTANTS.PAYMENT_METHOD_ENUM.CASH_ON_DELIVERY]}
            };
            // if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let aggregateArray = [
                {
                    $match: criteria,
                }, {
                    $project: {
                        transactionId: 1,
                        createdDate: 1,
                        transferred: 1,
                        order: 1,
                        amountWithTax: 1,
                        amount: 1,
                        transactionType: 1,
                        productPaymentMethodChargeTotal: 1,
                        productShippingChargeTotal: 1
                    }
                },
                {
                    $addFields: {
                        amountFinal: {
                            $cond: {
                                if: {$eq: ["$transactionType", APP_CONSTANTS.TRANSACTION_TYPES.ORDER]},
                                then: "$amountWithTax",
                                else: {$multiply: ["$amountWithTax", -1]}
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        amount: {
                            $sum: "$amountWithTax"
                        }
                    }
                }];
            return await Dao.aggregateData(Models.transactions, aggregateArray);
        };


        let paymentsPendingCOD = async () => {
            let criteria = {
                status: {
                    $in: [APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING]
                },
                paymentMethod: {$in: [APP_CONSTANTS.PAYMENT_METHOD_ENUM.CASH_ON_DELIVERY]}
            };
            let aggregateArray = [
                {
                    $match: criteria,
                }, {
                    $project: {
                        transactionId: 1,
                        createdDate: 1,
                        transferred: 1,
                        order: 1,
                        amountWithTax: 1,
                        amount: 1,
                        transactionType: 1,
                        productPaymentMethodChargeTotal: 1,
                        productShippingChargeTotal: 1
                    }
                },
                {
                    $addFields: {
                        amountFinal: {
                            $cond: {
                                if: {$eq: ["$transactionType", APP_CONSTANTS.TRANSACTION_TYPES.ORDER]},
                                then: "$amountWithTax",
                                else: {$multiply: ["$amountWithTax", -1]}
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        amount: {
                            $sum: "$amountWithTax"
                        }
                    }
                }];
            return await Dao.aggregateData(Models.transactions, aggregateArray);
        };



        let paymentsPendingOnline = async () => {
            let criteria = {
                status: {
                    $in: [APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING]
                },
                paymentMethod: {$in: [APP_CONSTANTS.PAYMENT_METHOD_ENUM.CREDIT_CARD, APP_CONSTANTS.PAYMENT_METHOD_ENUM.DEBIT_CARD]}
            };
            let aggregateArray = [
                {
                    $match: criteria,
                }, {
                    $project: {
                        transactionId: 1,
                        createdDate: 1,
                        transferred: 1,
                        order: 1,
                        amountWithTax: 1,
                        amount: 1,
                        transactionType: 1,
                        productPaymentMethodChargeTotal: 1,
                        productShippingChargeTotal: 1
                    }
                },
                {
                    $addFields: {
                        amountFinal: {
                            $cond: {
                                if: {$eq: ["$transactionType", APP_CONSTANTS.TRANSACTION_TYPES.ORDER]},
                                then: "$amountWithTax",
                                else: {$multiply: ["$amountWithTax", -1]}
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        amount: {
                            $sum: "$amountWithTax"
                        }
                    }
                }];
            return await Dao.aggregateData(Models.transactions, aggregateArray);
        };

        let transactionPlatformWeb = async () => {
            let criteria = {
                status: {
                    $in: [
                        APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING,
                        APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED,
                        APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
                        APP_CONSTANTS.PAYMENT_STATUS_ENUM.CANCELLED,
                    ],
                },
                deviceType: APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let aggregateArray = [
                {
                    $match: criteria,
                },
                {
                    $group: {
                        _id: null,
                        count: {
                            $sum: 1
                        }
                    }
                }];
            // if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.MONTHLY) {
            //     aggregateArray.push({
            //             $group: {
            //                 _id: {
            //                     month: "$_id.month",
            //                 },
            //                 count: {
            //                     $sum: "$count"
            //                 },
            //                 createdAt: {
            //                     $first: "$createdAt"
            //                 }
            //             }
            //         }, endProject, endSort
            //     )
            // } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.YEARLY) {
            //     aggregateArray.push({
            //         $group: {
            //             _id: {
            //                 year: "$_id.year",
            //             },
            //             count: {
            //                 $sum: "$count"
            //             },
            //             createdAt: {
            //                 $first: "$createdAt"
            //             }
            //         }
            //     }, endProject, endSort)
            // } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.WEEKLY) {
            //     aggregateArray.push({
            //         $group: {
            //             _id: {
            //                 day: "$_id.day",
            //             },
            //             count: {
            //                 $sum: "$count"
            //             },
            //             createdAt: {
            //                 $first: "$createdAt"
            //             }
            //         }
            //     }, endProject, endSort)
            // } else {
            //     aggregateArray.push({
            //         $group: {
            //             _id: {
            //                 date: "$_id.date",
            //             },
            //             count: {
            //                 $sum: "$count"
            //             },
            //             createdAt: {
            //                 $first: "$createdAt"
            //             }
            //         }
            //     }, endProject, endSort)
            // }
            return await Dao.aggregateData(Models.transactions, aggregateArray);
        };

        let transactionPlatformApp = async () => {
            let criteria = {
                status: {
                    $in: [
                        APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING,
                        APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED,
                        APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
                        APP_CONSTANTS.PAYMENT_STATUS_ENUM.CANCELLED,
                    ],
                },
                deviceType: {$in: [APP_CONSTANTS.DEVICE_TYPE_ENUM.IOS, APP_CONSTANTS.DEVICE_TYPE_ENUM.ANDROID]}
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let aggregateArray = [
                {
                    $match: criteria,
                },
                {
                    $group: {
                        _id: null,
                        count: {
                            $sum: 1
                        }
                    }
                }];
            // if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.MONTHLY) {
            //     aggregateArray.push({
            //             $group: {
            //                 _id: {
            //                     month: "$_id.month",
            //                 },
            //                 count: {
            //                     $sum: "$count"
            //                 },
            //                 createdAt: {
            //                     $first: "$createdAt"
            //                 }
            //             }
            //         }, endProject, endSort
            //     )
            // } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.YEARLY) {
            //     aggregateArray.push({
            //         $group: {
            //             _id: {
            //                 year: "$_id.year",
            //             },
            //             count: {
            //                 $sum: "$count"
            //             },
            //             createdAt: {
            //                 $first: "$createdAt"
            //             }
            //         }
            //     }, endProject, endSort)
            // } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.WEEKLY) {
            //     aggregateArray.push({
            //         $group: {
            //             _id: {
            //                 day: "$_id.day",
            //             },
            //             count: {
            //                 $sum: "$count"
            //             },
            //             createdAt: {
            //                 $first: "$createdAt"
            //             }
            //         }
            //     }, endProject, endSort)
            // } else {
            //     aggregateArray.push({
            //         $group: {
            //             _id: {
            //                 date: "$_id.date",
            //             },
            //             count: {
            //                 $sum: "$count"
            //             },
            //             createdAt: {
            //                 $first: "$createdAt"
            //             }
            //         }
            //     }, endProject, endSort)
            // }
            return await Dao.aggregateData(Models.transactions, aggregateArray);
        };


        let vendorReviews = async () => {
            let criteria = {
                type: APP_CONSTANTS.RATING_TYPE.VENDOR_RATING
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;

            return await Dao.countDocuments(Models.ratings, criteria);
        };

        let productReviews = async () => {
            let criteria = {
                type: APP_CONSTANTS.RATING_TYPE.PRODUCT_RATING
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;

            return await Dao.countDocuments(Models.ratings, criteria);
        };

        let [activeUser, totalUser, blockedUser,
            onAirVendor, unAuthorizedVendor, totalVendor, blockedVendor, initialRegistrationVendor,
            approvedProduct, unApprovedProduct, activeProduct, soldOutProduct, blockedProduct, totalProduct,
            totalOrder, activeOrder, pastOrder, closedOrder, cancelledOrder, paymentFailedOrder, paymentPendingOrder, paymentCompletedOrder, paymentPendingCODOrder, openRefundOrder, cancelledByVendorOrder,
            numberOfPost, numberOfPublicPostsShared, numberOfPrivatePostsShared, noOfLikesOnFeed, noOfCommentsOnFeed, noOfReportsOnFeed, topFeed, trendingHashTag, subscription, refundItems, paymentsDueToOwner,
            transactionPlatformsWeb, transactionPlatformsApp, paymentPendingTotal, paymentPendingCOD, paymentPendingOnline, vendorReview, productReview
        ] =
            await Promise.all([activeUsers(),
                totalUsers(), blockedUsers(),
                onAirVendors(), unAuthorizedVendors(), totalVendors(), blockedVendors(), initialRegistrationVendors(),
                approvedProducts(), unApprovedProducts(), activeProducts(), soldOutProducts(), blockedProducts(), totalProducts(),
                totalOrders(), activeOrders(), pastOrders(), closedOrders(), cancelledOrders(), paymentFailedOrders(), paymentPendingOrders(), paymentCompletedOrders(), paymentPendingCODOrders(), openRefundOrders(), cancelledByVendorOrders(),
                numberOfPosts(), numberOfPublicPostShared(), numberOfPrivatePostShared(), noOfLikesOnFeeds(), noOfCommentsOnFeeds(), noOfReportsOnFeeds(), topFeeds(), trendingHashTags(), subscriptionData(), refundItemsForVendor(), paymentsDueToOwners(),
                transactionPlatformWeb(), transactionPlatformApp(), paymentsPendingTotal(), paymentsPendingCOD(), paymentsPendingOnline(), vendorReviews(), productReviews()
            ]);
        dataToReturn.activeUser = activeUser;
        dataToReturn.totalUser = totalUser;
        dataToReturn.blockedUser = blockedUser;
        dataToReturn.onAirVendor = onAirVendor;
        dataToReturn.totalVendor = totalVendor;
        dataToReturn.unAuthorizedVendor = unAuthorizedVendor;
        dataToReturn.blockedVendor = blockedVendor;
        dataToReturn.initialRegistrationVendor = initialRegistrationVendor;
        dataToReturn.approvedProduct = approvedProduct;
        dataToReturn.unApprovedProduct = unApprovedProduct;
        dataToReturn.activeProduct = activeProduct;
        dataToReturn.soldOutProduct = soldOutProduct;
        dataToReturn.blockedProduct = blockedProduct;
        dataToReturn.totalProduct = totalProduct;
        dataToReturn.totalOrder = totalOrder;
        dataToReturn.activeOrder = activeOrder;
        dataToReturn.pastOrder = pastOrder;
        dataToReturn.closedOrder = closedOrder;
        dataToReturn.cancelledOrder = cancelledOrder;
        dataToReturn.paymentFailedOrder = paymentFailedOrder;
        dataToReturn.paymentPendingOrder = paymentPendingOrder;
        dataToReturn.paymentCompletedOrder = paymentCompletedOrder;
        dataToReturn.paymentPendingCODOrder = paymentPendingCODOrder;
        dataToReturn.numberOfPost = numberOfPost;
        dataToReturn.numberOfPublicPostsShared = numberOfPublicPostsShared;
        dataToReturn.numberOfPrivatePostsShared = numberOfPrivatePostsShared;
        dataToReturn.noOfLikesOnFeed = noOfLikesOnFeed;
        dataToReturn.noOfCommentsOnFeed = noOfCommentsOnFeed;
        dataToReturn.noOfReportsOnFeed = noOfReportsOnFeed;
        dataToReturn.topFeed = topFeed;
        dataToReturn.trendingHashTag = trendingHashTag;
        dataToReturn.subscription = subscription;
        dataToReturn.refundItems = refundItems[0].count;
        dataToReturn.openRefundOrder = openRefundOrder
        dataToReturn.cancelledByVendorOrder = cancelledByVendorOrder
        dataToReturn.vendorReview = vendorReview
        dataToReturn.productReview = productReview
        dataToReturn.paymentsDueToOwner = paymentsDueToOwner[0].amount;
        dataToReturn.transactionPlatformsWeb = transactionPlatformsWeb[0]? transactionPlatformsWeb[0].count:0
        dataToReturn.transactionPlatformsApp = transactionPlatformsApp[0]? transactionPlatformsApp[0].count:0
        dataToReturn.paymentPendingTotal = paymentPendingTotal[0]? paymentPendingTotal[0].amount:0
        dataToReturn.paymentPendingCOD = paymentPendingCOD[0]? paymentPendingCOD[0].amount:0
        dataToReturn.paymentPendingOnline = paymentPendingOnline[0]? paymentPendingOnline[0].amount:0
        dataToReturn.paymentPendingCODPercentage = (dataToReturn.paymentPendingCOD/dataToReturn.paymentPendingTotal)*100
        dataToReturn.paymentPendingOnlinePercentage = (dataToReturn.paymentPendingOnline/dataToReturn.paymentPendingTotal)*100
        return dataToReturn
    } catch
        (err) {
        throw err;
    }
};


const earningDashboardAnalytics = async (payload) => {
    try {
        let dataToReturn = {};
        let object = {};
        let endDateTime1 = +moment(payload.endDate).endOf('day')._d;
        let startDateTime1 = +moment(payload.startDate).startOf('day')._d;
        object = {$gte: startDateTime1, $lte: endDateTime1};

        let dateProject =
            {
                $project: {
                    year: {
                        $year: "$createdAt"
                    },
                    month: {
                        $month: "$createdAt"
                    },
                    week: {
                        $week: "$createdAt"
                    },
                    day: {
                        $dayOfWeek: "$createdAt"
                    },
                    date: {
                        $dayOfMonth: '$createdAt'
                    },
                    _id: 1,
                    createdAt: 1,
                    amountWithTax: 1,
                    amount: 1
                }
            };

        let dateGroup = {
            $group: {
                _id: {
                    year: "$year",
                    month: "$month",
                    week: "$week",
                    day: "$day",
                    date: "$date",
                },
                count: {
                    $sum: "$amountWithTax"
                },
                createdAt: {
                    $first: "$createdAt"
                }
            }
        };

        let endProject = {
            $project: {
                sortId: "$_id.date",
                id: {
                    $dateToString: {
                        format: "%Y-%m-%d", date: "$createdAt"
                    }
                },
                amount: "$count"
            }
        };
        let endSort = {
            $sort: {
                "id": 1
            }
        }

        let paymentsPendingOnline = async () => {
            let criteria = {
                status: {
                    $in: [APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING]
                },
                paymentMethod: {$in: [APP_CONSTANTS.PAYMENT_METHOD_ENUM.CREDIT_CARD, APP_CONSTANTS.PAYMENT_METHOD_ENUM.DEBIT_CARD, APP_CONSTANTS.PAYMENT_METHOD_ENUM.WALLET]}
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let aggregateArray = [
                {
                    $match: criteria,
                }, dateProject, dateGroup];
            if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.MONTHLY) {
                aggregateArray.push({
                        $group: {
                            _id: {
                                month: "$_id.month",
                            },
                            count: {
                                $sum: "$count"
                            },
                            createdAt: {
                                $first: "$createdAt"
                            }
                        }
                    }, endProject, endSort
                )
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.YEARLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            year: "$_id.year",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.WEEKLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            day: "$_id.day",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else {
                aggregateArray.push({
                    $group: {
                        _id: {
                            date: "$_id.date",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            }
            return await Dao.aggregateData(Models.transactions, aggregateArray);
        };

        let paymentsPendingCOD = async () => {
            let criteria = {
                status: {
                    $in: [APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING]
                },
                paymentMethod: {$in: [APP_CONSTANTS.PAYMENT_METHOD_ENUM.CASH_ON_DELIVERY]}
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let aggregateArray = [
                {
                    $match: criteria,
                }, dateProject,
                dateGroup
            ];
            if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.MONTHLY) {
                aggregateArray.push({
                        $group: {
                            _id: {
                                month: "$_id.month",
                            },
                            count: {
                                $sum: "$count"
                            },
                            createdAt: {
                                $first: "$createdAt"
                            }
                        }
                    }, endProject, endSort
                )
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.YEARLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            year: "$_id.year",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.WEEKLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            day: "$_id.day",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else {
                aggregateArray.push({
                    $group: {
                        _id: {
                            date: "$_id.date",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            }
            return await Dao.aggregateData(Models.transactions, aggregateArray);
        };
        let paymentsCompleted = async () => {
            let criteria = {
                status: {
                    $in: [APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED]
                }
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let aggregateArray = [
                {
                    $match: criteria,
                }, dateProject, dateGroup];
            if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.MONTHLY) {
                aggregateArray.push({
                        $group: {
                            _id: {
                                month: "$_id.month",
                            },
                            count: {
                                $sum: "$count"
                            },
                            createdAt: {
                                $first: "$createdAt"
                            }
                        }
                    }, endProject, endSort
                )
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.YEARLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            year: "$_id.year",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.WEEKLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            day: "$_id.day",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else {
                aggregateArray.push({
                    $group: {
                        _id: {
                            date: "$_id.date",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            }
            return await Dao.aggregateData(Models.transactions, aggregateArray);
        };

        let paymentsDeclined = async () => {
            let criteria = {
                status: {
                    $in: [APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED]
                }
            };
            if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let aggregateArray = [
                {
                    $match: criteria,
                }, dateProject, dateGroup];
            if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.MONTHLY) {
                aggregateArray.push({
                        $group: {
                            _id: {
                                month: "$_id.month",
                            },
                            count: {
                                $sum: "$count"
                            },
                            createdAt: {
                                $first: "$createdAt"
                            }
                        }
                    }, endProject, endSort
                )
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.YEARLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            year: "$_id.year",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.WEEKLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            day: "$_id.day",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else {
                aggregateArray.push({
                    $group: {
                        _id: {
                            date: "$_id.date",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            }
            return await Dao.aggregateData(Models.transactions, aggregateArray);
        };
        let appDefaults = await Dao.findOne(Models.appDefaults, {}, {
            duePaymentDays: 1
        }, {sort: {_id: -1}, limit: 1})

        let paymentsDueToOwners = async () => {
            let criteria = {
                status: {
                    $in: [APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED]
                },
                refundStatus: {$in: [APP_CONSTANTS.REFUND_STATUS.NOT_REQUESTED, APP_CONSTANTS.REFUND_STATUS.REJECTED]}
            };
            criteria.transferred = false;
            criteria.$and = [{
                createdDate: {
                    $lt: +moment().subtract(appDefaults.duePaymentDays ? appDefaults.duePaymentDays : 15, "days")
                }
            }, {
                createdDate: {
                    $lt: +moment().day(1 + 7)
                }
            }]
            // if (payload.startDate && criteria.endDate) criteria.createdDate = object;
            let aggregateArray = [
                {
                    $match: criteria,
                }, {
                    $project: {
                        transactionId: 1,
                        createdDate: 1,
                        transferred: 1,
                        order: 1,
                        amountWithTax: 1,
                        amount: 1,
                        transactionType: 1,
                        productPaymentMethodChargeTotal: 1,
                        productShippingChargeTotal: 1
                    }
                },
                {
                    $addFields: {
                        amountFinal: {
                            $cond: {
                                if: {$eq: ["$transactionType", APP_CONSTANTS.TRANSACTION_TYPES.ORDER]},
                                then: "$amountWithTax",
                                else: {$multiply: ["$amountWithTax", -1]}
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        amount: {
                            $sum: "$amountWithTax"
                        }
                    }
                }];
            // if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.MONTHLY) {
            //     aggregateArray.push({
            //             $group: {
            //                 _id: {
            //                     month: "$_id.month",
            //                 },
            //                 count: {
            //                     $sum: "$count"
            //                 },
            //                 createdAt: {
            //                     $first: "$createdAt"
            //                 }
            //             }
            //         }, endProject, endSort
            //     )
            // } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.YEARLY) {
            //     aggregateArray.push({
            //         $group: {
            //             _id: {
            //                 year: "$_id.year",
            //             },
            //             count: {
            //                 $sum: "$count"
            //             },
            //             createdAt: {
            //                 $first: "$createdAt"
            //             }
            //         }
            //     }, endProject, endSort)
            // } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.WEEKLY) {
            //     aggregateArray.push({
            //         $group: {
            //             _id: {
            //                 day: "$_id.day",
            //             },
            //             count: {
            //                 $sum: "$count"
            //             },
            //             createdAt: {
            //                 $first: "$createdAt"
            //             }
            //         }
            //     }, endProject, endSort)
            // } else {
            //     aggregateArray.push({
            //         $group: {
            //             _id: {
            //                 date: "$_id.date",
            //             },
            //             count: {
            //                 $sum: "$count"
            //             },
            //             createdAt: {
            //                 $first: "$createdAt"
            //             }
            //         }
            //     }, endProject, endSort)
            // }
            return await Dao.aggregateData(Models.transactions, aggregateArray);
        };


        let [paymentPendingOnline, paymentPendingCOD, paymentCompleted, paymentDeclined, paymentDueToOwners] =
            await Promise.all([
                paymentsPendingOnline(), paymentsPendingCOD(), paymentsCompleted(), paymentsDeclined(), paymentsDueToOwners()
            ]);
        dataToReturn.paymentPendingOnline = paymentPendingOnline;
        dataToReturn.paymentPendingCOD = paymentPendingCOD;
        dataToReturn.paymentCompleted = paymentCompleted;
        dataToReturn.paymentDeclined = paymentDeclined;
        dataToReturn.paymentDueToOwners = paymentDueToOwners;
        return dataToReturn
    } catch
        (err) {
        throw err;
    }
};

const dailyAnalytics = async (payload, adminData) => {
    try {
        let dateProject =
            {
                $project: {
                    year: {
                        $year: "$createdAt"
                    },
                    month: {
                        $month: "$createdAt"
                    },
                    week: {
                        $week: "$createdAt"
                    },
                    day: {
                        $dayOfWeek: "$createdAt"
                    },
                    date: {
                        $dayOfMonth: '$createdAt'
                    },
                    _id: 1,
                    createdAt: 1,
                    orderId: 1,
                    visitor: 1
                }
            };

        let dateGroup = {
            $group: {
                _id: {
                    year: "$year",
                    month: "$month",
                    week: "$week",
                    day: "$day",
                    date: "$date",
                },
                count: {
                    $sum: 1
                },
                createdAt: {
                    $first: "$createdAt"
                }
            }
        };
        let dateGroupVisitor = {
            $group: {
                _id: {
                    year: "$year",
                    month: "$month",
                    week: "$week",
                    day: "$day",
                    date: "$date",
                },
                count: {
                    $sum: "$visitor"
                },
                createdAt: {
                    $first: "$createdAt"
                }
            }
        };

        let endProject = {
            $project: {
                sortId: "$_id.date",
                id: {
                    $dateToString: {
                        format: "%Y-%m-%d", date: "$createdAt"
                    }
                },
                count: "$count"
            }
        };
        let endSort = {
            $sort: {
                "id": 1
            }
        };

        let endDateTime1 = +moment(payload.endDate).endOf('day')._d;
        let startDateTime1 = +moment(payload.startDate).startOf('day')._d;
        let object = {$gte: startDateTime1, $lte: endDateTime1};

        let graphUsers = async () => {
            let criteria = {
                status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
                createdDate: object
            };

            let aggregateArray = [
                {
                    $match: criteria
                },
                dateProject,
                dateGroup
            ];

            if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.MONTHLY) {
                aggregateArray.push({
                        $group: {
                            _id: {
                                month: "$_id.month",
                            },
                            count: {
                                $sum: "$count"
                            },
                            createdAt: {
                                $first: "$createdAt"
                            }
                        }
                    }, endProject, endSort
                )
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.YEARLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            year: "$_id.year",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.WEEKLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            day: "$_id.day",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else {
                aggregateArray.push({
                    $group: {
                        _id: {
                            date: "$_id.date",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            }

            return await Dao.aggregateData(Models.user, aggregateArray);
        };
        let graphVendors = async () => {
            let criteria = {
                status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
                createdDate: object
            };
            let aggregateArray = [
                {
                    $match: criteria
                },
                dateProject,
                dateGroup
            ];

            if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.MONTHLY) {
                aggregateArray.push({
                        $group: {
                            _id: {
                                month: "$_id.month",
                            },
                            count: {
                                $sum: "$count"
                            },
                            createdAt: {
                                $first: "$createdAt"
                            }
                        }
                    }, endProject, endSort
                )
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.YEARLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            year: "$_id.year",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.WEEKLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            day: "$_id.day",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else {
                aggregateArray.push({
                    $group: {
                        _id: {
                            date: "$_id.date",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            }

            return await Dao.aggregateData(Models.vendors, aggregateArray);
        };
        let graphProducts = async () => {
            let criteria = {
                status: {$in: [APP_CONSTANTS.STATUS_ENUM.ACTIVE, APP_CONSTANTS.STATUS_ENUM.PENDING]},
                createdDate: object
            };
            let aggregateArray = [
                {
                    $match: criteria
                },
                dateProject,
                dateGroup
            ];

            if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.MONTHLY) {
                aggregateArray.push({
                        $group: {
                            _id: {
                                month: "$_id.month",
                            },
                            count: {
                                $sum: "$count"
                            },
                            createdAt: {
                                $first: "$createdAt"
                            }
                        }
                    }, endProject, endSort
                )
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.YEARLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            year: "$_id.year",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.WEEKLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            day: "$_id.day",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else {
                aggregateArray.push({
                    $group: {
                        _id: {
                            date: "$_id.date",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            }

            return await Dao.aggregateData(Models.products, aggregateArray);
        };
        let graphVisitors = async () => {
            let criteria = {
                type: APP_CONSTANTS.COMMON_LOGS.WEBSITE_VISIT
            };
            let aggregateArray = [
                {
                    $match: criteria
                },
                dateProject,
                dateGroupVisitor
            ];

            if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.MONTHLY) {
                aggregateArray.push({
                        $group: {
                            _id: {
                                month: "$_id.month",
                            },
                            count: {
                                $sum: "$count"
                            },
                            createdAt: {
                                $first: "$createdAt"
                            }
                        }
                    }, endProject, endSort
                )
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.YEARLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            year: "$_id.year",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.WEEKLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            day: "$_id.day",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else {
                aggregateArray.push({
                    $group: {
                        _id: {
                            date: "$_id.date",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            }

            return await Dao.aggregateData(Models.commonLogs, aggregateArray);
        };

        let [dailyUser, dailyProducts, dailyVendors, dailyVisitors] = await Promise.all([graphUsers(), graphProducts(), graphVendors(), graphVisitors()]);

        return {
            dailyUser,
            dailyProducts,
            dailyVendors,
            dailyVisitors
        }

    } catch (e) {
        throw e
    }
};

const feedAnalytics = async (payload, userData) => {
    try {
        let dateProject =
            {
                $project: {
                    year: {
                        $year: "$createdAt"
                    },
                    month: {
                        $month: "$createdAt"
                    },
                    week: {
                        $week: "$createdAt"
                    },
                    day: {
                        $dayOfWeek: "$createdAt"
                    },
                    date: {
                        $dayOfMonth: '$createdAt'
                    },
                    _id: 1,
                    createdAt: 1,
                    orderId: 1
                }
            };

        let dateGroup = {
            $group: {
                _id: {
                    year: "$year",
                    month: "$month",
                    week: "$week",
                    day: "$day",
                    date: "$date",
                },
                count: {
                    $sum: 1
                },
                createdAt: {
                    $first: "$createdAt"
                }
            }
        };

        let endProject = {
            $project: {
                sortId: "$_id.date",
                id: {
                    $dateToString: {
                        format: "%Y-%m-%d", date: "$createdAt"
                    }
                },
                count: "$count"
            }
        };
        let endSort = {
            $sort: {
                "id": 1
            }
        };

        let endDateTime1 = +moment(payload.endDate).endOf('day')._d;
        let startDateTime1 = +moment(payload.startDate).startOf('day')._d;
        let object = {$gte: startDateTime1, $lte: endDateTime1};

        let noOfFeedsDaily = async () => {
            let criteria = {
                status: {$in: [APP_CONSTANTS.STATUS_ENUM.ACTIVE, APP_CONSTANTS.STATUS_ENUM.EDITED]},
                createdDate: object
            };
            let aggregateArray = [
                {
                    $match: criteria
                },
                dateProject,
                dateGroup
            ];

            if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.MONTHLY) {
                aggregateArray.push({
                        $group: {
                            _id: {
                                month: "$_id.month",
                            },
                            count: {
                                $sum: "$count"
                            },
                            createdAt: {
                                $first: "$createdAt"
                            }
                        }
                    }, endProject, endSort
                )
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.YEARLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            year: "$_id.year",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.WEEKLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            day: "$_id.day",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else {
                aggregateArray.push({
                    $group: {
                        _id: {
                            date: "$_id.date",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            }

            return await Dao.aggregateData(Models.feeds, aggregateArray);
        };


        let noOfLikesDaily = async () => {
            let criteria = {
                status: {$in: [APP_CONSTANTS.STATUS_ENUM.LIKE]},
                reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.POST_LIKE,
                createdDate: object
            };
            let aggregateArray = [
                {
                    $match: criteria
                },
                dateProject,
                dateGroup
            ];

            if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.MONTHLY) {
                aggregateArray.push({
                        $group: {
                            _id: {
                                month: "$_id.month",
                            },
                            count: {
                                $sum: "$count"
                            },
                            createdAt: {
                                $first: "$createdAt"
                            }
                        }
                    }, endProject, endSort
                )
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.YEARLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            year: "$_id.year",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.WEEKLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            day: "$_id.day",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else {
                aggregateArray.push({
                    $group: {
                        _id: {
                            date: "$_id.date",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            }

            return await Dao.aggregateData(Models.reactions, aggregateArray);
        };


        let noOfCommentsDaily = async () => {
            let criteria = {
                status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
                createdDate: object
            };
            let aggregateArray = [
                {
                    $match: criteria
                },
                dateProject,
                dateGroup
            ];

            if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.MONTHLY) {
                aggregateArray.push({
                        $group: {
                            _id: {
                                month: "$_id.month",
                            },
                            count: {
                                $sum: "$count"
                            },
                            createdAt: {
                                $first: "$createdAt"
                            }
                        }
                    }, endProject, endSort
                )
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.YEARLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            year: "$_id.year",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.WEEKLY) {
                aggregateArray.push({
                    $group: {
                        _id: {
                            day: "$_id.day",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            } else {
                aggregateArray.push({
                    $group: {
                        _id: {
                            date: "$_id.date",
                        },
                        count: {
                            $sum: "$count"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort)
            }

            return await Dao.aggregateData(Models.comments, aggregateArray);
        };

        let [dailyFeeds, dailyLikes, dailyComments] = await Promise.all([noOfFeedsDaily(), noOfLikesDaily(), noOfCommentsDaily()]);
        return {dailyFeeds, dailyLikes, dailyComments}
    } catch (e) {
        throw e
    }
}

const orderAnalytics = async (payload, userDara) => {
    try {
        let dateProject =
            {
                $project: {
                    year: {
                        $year: "$createdAt"
                    },
                    month: {
                        $month: "$createdAt"
                    },
                    week: {
                        $week: "$createdAt"
                    },
                    day: {
                        $dayOfWeek: "$createdAt"
                    },
                    date: {
                        $dayOfMonth: '$createdAt'
                    },
                    _id: 1,
                    createdAt: 1,
                    orderId: 1
                }
            };

        let dateGroup = {
            $group: {
                _id: {
                    year: "$year",
                    month: "$month",
                    week: "$week",
                    day: "$day",
                    date: "$date",
                },
                count: {
                    $sum: 1
                },
                createdAt: {
                    $first: "$createdAt"
                }
            }
        };

        let endProject = {
            $project: {
                sortId: "$_id.date",
                id: {
                    $dateToString: {
                        format: "%Y-%m-%d", date: "$createdAt"
                    }
                },
                count: "$count"
            }
        };
        let endSort = {
            $sort: {
                "id": 1
            }
        };

        let endDateTime1 = +moment(payload.endDate).endOf('day')._d;
        let startDateTime1 = +moment(payload.startDate).startOf('day')._d;
        let object = {$gte: startDateTime1, $lte: endDateTime1};

        let criteria = {
            ...(payload.status && {status: payload.status}),
            createdDate: object
        };
        dateGroup.$group._id.orderId = "$orderId"
        dateGroup.$group.data = {
            $addToSet: "$orderId"
        };
        let aggregateArray = [
            {
                $match: criteria
            },
            dateProject,
            dateGroup
        ];

        if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.MONTHLY) {
            aggregateArray.push({
                    $group: {
                        _id: {
                            month: "$_id.month",
                        },
                        // count: {
                        //     $sum: "$count"
                        // },
                        count: {
                            $sum: 1
                        },
                        data: {
                            $first: "$data"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        }
                    }
                }, endProject, endSort
            )
        } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.YEARLY) {
            aggregateArray.push({
                $group: {
                    _id: {
                        year: "$_id.year",
                    },
                    // count: {
                    //     $sum: "$count"
                    // },
                    count: {
                        $sum: 1
                    },
                    data: {
                        $first: "$data"
                    },
                    createdAt: {
                        $first: "$createdAt"
                    }
                }
            }, endProject, endSort)
        } else if (payload.graphType === APP_CONSTANTS.GRAPH_TYPE.WEEKLY) {
            aggregateArray.push({
                $group: {
                    _id: {
                        day: "$_id.day",
                    },
                    // count: {
                    //     $sum: "$count"
                    // },
                    count: {
                        $sum: 1
                    },
                    data: {
                        $first: "$data"
                    },
                    createdAt: {
                        $first: "$createdAt"
                    }
                }
            }, endProject, endSort)
        } else {
            aggregateArray.push({
                $group: {
                    _id: {
                        date: "$_id.date",
                    },
                    // count: {
                    //     $sum: "$count"
                    // },
                    count: {
                        $sum: 1
                    },
                    data: {
                        $first: "$data"
                    },
                    createdAt: {
                        $first: "$createdAt"
                    }
                }
            }, endProject, endSort)
        }


        let totalOrder = await Dao.aggregateData(Models.orders, aggregateArray);

        criteria = {
            createdDate: object,
            status: {
                $in: [APP_CONSTANTS.ORDER_STATUS_ENUM.PLACED, APP_CONSTANTS.ORDER_STATUS_ENUM.IN_TRANSIT, APP_CONSTANTS.ORDER_STATUS_ENUM.DISPATCHED, APP_CONSTANTS.ORDER_STATUS_ENUM.ACCEPTED, APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_FAILED, APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_PENDING]
            }
        };
        aggregateArray[0].$match = criteria
        console.log("aggregateArray", JSON.stringify(aggregateArray))
        let activeOrder = await Dao.aggregateData(Models.orders, aggregateArray);

        criteria = {
            createdDate: object,
            status: {
                $in: [APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED, APP_CONSTANTS.ORDER_STATUS_ENUM.REJECTED, APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED]
            }
        };
        aggregateArray[0].$match = criteria;
        console.log("aggregateArray", JSON.stringify(aggregateArray));

        let pastOrder = await Dao.aggregateData(Models.orders, aggregateArray);

        criteria = {
            createdDate: object,
            status: {
                $in: [APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED, APP_CONSTANTS.ORDER_STATUS_ENUM.REJECTED]
            }
        };
        aggregateArray[0].$match = criteria;
        console.log("aggregateArray", JSON.stringify(aggregateArray));

        let closedOrder = await Dao.aggregateData(Models.orders, aggregateArray);
        criteria = {
            createdDate: object,
            status: {
                $in: [APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED]
            }
        };
        aggregateArray[0].$match = criteria;
        console.log("aggregateArray", JSON.stringify(aggregateArray));

        let cancelledOrder = await Dao.aggregateData(Models.orders, aggregateArray);

        criteria = {
            createdDate: object,
            status: {
                $in: [APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_FAILED]
            }
        };
        aggregateArray[0].$match = criteria;
        console.log("aggregateArray", JSON.stringify(aggregateArray));

        let paymentFailedOrder = await Dao.aggregateData(Models.orders, aggregateArray);
        criteria = {
            createdDate: object,
            status: {
                $in: [APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_PENDING]
            },

        };
        aggregateArray[0].$match = criteria;
        console.log("aggregateArray", JSON.stringify(aggregateArray));

        let paymentPendingOrder = await Dao.aggregateData(Models.orders, aggregateArray);
        criteria = {
            createdDate: object,
            paymentStatus: {
                $in: [APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED]
            }

        };
        aggregateArray[0].$match = criteria;
        console.log("aggregateArray", JSON.stringify(aggregateArray));

        let paymentCompletedOrder = await Dao.aggregateData(Models.orders, aggregateArray);
        criteria = {
            createdDate: object,
            paymentStatus: {
                $in: [APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING]
            },
            paymentMethod: {
                $in: [APP_CONSTANTS.PAYMENT_METHOD_ENUM.CASH_ON_DELIVERY]
            }

        };
        aggregateArray[0].$match = criteria;
        console.log("aggregateArray", JSON.stringify(aggregateArray));

        let paymentPendingCODOrder = await Dao.aggregateData(Models.orders, aggregateArray);
        return {
            totalOrder,
            activeOrder,
            pastOrder,
            closedOrder,
            cancelledOrder,
            paymentFailedOrder,
            paymentPendingOrder,
            paymentCompletedOrder,
            paymentPendingCODOrder
        }
    } catch (e) {
        throw e
    }
}

const deviceTokenUpdate = async (payload, userData) => {
    try {
        return await HelperCommonFunction.updateDeviceToken(payload, userData);
    } catch (e) {
        throw e;
    }
};

const notificationListing = async (payload, userData) => {
    try {
        let criteria = {
            receiver: mongoose.Types.ObjectId(userData._id),
            "status": {$nin: [APP_CONSTANTS.DATABASE.NOTIFICATION_STATUS.CLEAR, APP_CONSTANTS.STATUS_ENUM.DELETED]}
        };
        let populate = [
            {
                path: 'order',
                select: 'orderId orderNumber subOrderNumber',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.ORDERS
            },
            {
                path: 'followId',
                select: '_id',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.FOLLOWS
            },
            {
                path: 'user',
                select: 'firstName lastName email profilePic',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
            },
            {
                path: 'vendor',
                select: 'firstName name lastName email profilePic ownerPicture banner hashTag vendorRegisterName',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
            },
            {
                path: 'product',
                select: 'title description vendor images',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS,
                populate: [{
                    path: 'vendor',
                    select: 'firstName lastName name vendorRegisterName ownerPicture banner vendorRegisterName',
                    model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
                }]
            },
            {
                path: 'postId',
                select: 'media mediaType user vendor caption',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.FEEDS,
                populate: [
                    {
                        path: 'vendor',
                        select: 'firstName name lastName email profilePic ownerPicture banner hashTag vendorRegisterName',
                        model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
                    },
                    {
                        path: 'user',
                        select: 'firstName lastName profilePic',
                        model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
                    }
                ]
            },
            {
                path: 'collectionId',
                select: 'name media description',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.CATEGORIES
            },
            {
                path: 'feed',
                select: 'caption media mediaType hashTag',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.FEEDS,
                populate: [
                    {
                        path: 'user',
                        select: 'firstName lastName email profilePic',
                        model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
                    },
                    {
                        path: 'vendor',
                        select: 'firstName name lastName email profilePic ownerPicture banner hashTag vendorRegisterName',
                        model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
                    },
                    {
                        path: 'collectionId',
                        select: 'name media description',
                        model: APP_CONSTANTS.DATABASE.MODELS_NAME.CATEGORIES
                    }
                ]
            }
        ];

        if (payload.search) {
            criteria.$or = []
            for (let key in APP_CONSTANTS.DATABASE.LANGUAGES) {
                console.log("APP_CONSTANTS.LANGUAGES", APP_CONSTANTS.DATABASE.LANGUAGES);
                criteria.$or.push({[`message.${APP_CONSTANTS.DATABASE.LANGUAGES[key]}`]: new RegExp(payload.search, 'i')})
            }
        }
        if (payload.startDate && payload.endDate) {
            criteria['createdDate'] = {
                $gte: payload.startDate,
                $lte: payload.endDate
            }
        }
        let pipeline = [
            {
                $match: criteria
            },
            {
                $lookup: {
                    localField: "order",
                    from: 'orders',
                    foreignField: '_id',
                    as: "orderData"
                }
            },
            {
                $unwind: {
                    path: '$orderData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    localField: 'orderData.vendor',
                    from: 'vendors',
                    foreignField: '_id',
                    as: "vendorData"
                }
            },
            {
                $unwind: {
                    path: '$vendorData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $sort: {
                    _id: -1
                }
            }
        ];
        let and = []
        let match = {}
        if (payload.vendorName) {
            let or = []
            or.push({
                    'vendorData.vendorRegisterName': new RegExp(payload.vendorName, 'i')
                },
                {
                    'vendorData.firstName': new RegExp(payload.vendorName, 'i')
                },
                {
                    'vendorData.lastName': new RegExp(payload.vendorName, 'i')
                })
            and.push({'$or': or})
            match['$and'] = and;
        }
        if (payload.orderNumber) {
            let or = [];
            or.push({
                'orderData.orderNumber': new RegExp(payload.orderNumber, 'i')
            })
            and.push({'$or': or});
            match['$and'] = and
        }

        if (match !== {} && Object.keys(match).length !== 0) {
            pipeline.push({'$match': match})
        }
        pipeline.push({
            $project: {
                'vendorData': 0,
                'orderData': 0
            }
        })
        console.log("pipeline", JSON.stringify(pipeline))

        let count = await Dao.aggregateData(Models.notifications, pipeline);

        if (payload.skip) {
            pipeline.push({
                $skip: parseInt(payload.skip)
            })
        }
        if (payload.limit) {
            pipeline.push({
                $limit: parseInt(payload.limit)
            })
        }

        let [data] = await Promise.all([
            Dao.aggregateDataWithPopulate(Models.notifications, pipeline, populate),
            Dao.updateMany(Models.notifications, {
                receiver: userData._id,
                status: APP_CONSTANTS.DATABASE.NOTIFICATION_STATUS.UNREAD
            }, {status: APP_CONSTANTS.DATABASE.NOTIFICATION_STATUS.READ})
        ]);
        return {data, count: count.length}
    } catch (e) {
        throw e
    }
}

const addOrEditSubAdmin = async (payload, userData) => {
    try {
        if (payload.adminId) {
            if (payload.password) payload.password = await UniversalFunctions.bCryptData(payload.password)
            let dataToUpdate = {
                ...payload,
                updatedDate: +new Date()
            }
            let save = await Dao.findAndUpdate(Models.admin, {_id: payload.adminId}, dataToUpdate, {
                lean: true,
                new: true
            })
            delete save.password;
            return save
        } else {
            if (payload.password) payload.password = await UniversalFunctions.bCryptData(payload.password)
            let dataToSave = {
                ...payload,
                superAdmin: false,
                password: await UniversalFunctions.bCryptData("qwerty"),
            }
            let save = Dao.saveData(Models.admin, dataToSave)
            delete save.password
            return save;
        }
    } catch (e) {
        throw e
    }
}

const blockUnblockSubAdmin = async (payload, userData) => {
    try {
        let criteria = {
            _id: payload._id
        };
        let getUserData = await Dao.findOne(Models.admin, criteria, {}, {lean: true});
        if (getUserData) {
            if (payload.action === true && getUserData.status === APP_CONSTANTS.STATUS_ENUM.BLOCKED) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.ALREADY_BLOCKED
            } else if (payload.action === false && getUserData.status === APP_CONSTANTS.STATUS_ENUM.ACTIVE) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.ALREADY_UNBLOCKED
            } else {
                let dataToUpdate = {};
                dataToUpdate.updatedDate = +new Date();
                dataToUpdate.updatedBy = userData._id;
                payload.action === true ? dataToUpdate.status = APP_CONSTANTS.STATUS_ENUM.BLOCKED : dataToUpdate.status = APP_CONSTANTS.STATUS_ENUM.ACTIVE;
                return await Dao.findAndUpdate(Models.admin, criteria, dataToUpdate, {lean: true, new: true});
            }
        } else return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID)
    } catch (e) {
        throw e
    }
}

const listSubAdmin = async (payload, userData) => {
    try {
        let criteria = {
            status: {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED},
            ...(payload._id && {_id: payload._id}),
            superAdmin: false
        }
        let option = {
            ...(payload.skip && {skip: payload.skip}),
            ...(payload.limit && {limit: payload.limit}),
            sort: {
                _id: -1
            },
            lean: true
        }
        let [data, count] = await Promise.all([
            Dao.getData(Models.admin, criteria, {password: 0}, option, {lean: true}),
            Dao.countDocuments(Models.admin, criteria)
        ])
        return {
            data, count
        }
    } catch (e) {
        throw e
    }
}

const dashboardPCV = async (payload, userData) => {
    try {
        let dataToReturn = {};
        let current = +new Date();
        let object = {};
        let seven = current - 604800000;
        let sevenDays = {$gte: seven, $lte: current};
        let dataToSend = {};
        let endDateTime1 = +moment(payload.endDate).endOf('day')._d;
        let startDateTime1 = +moment(payload.startDate).startOf('day')._d;
        object = {$gte: startDateTime1, $lte: endDateTime1};
        let appDefaults = await Dao.findOne(Models.appDefaults, {}, {
            duePaymentDays: 1
        }, {sort: {_id: -1}, limit: 1})

        let topSellingProducts = async () => {
            let criteria = {
                status: {
                    $nin: [
                        APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED_VENDOR,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_PENDING,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_FAILED
                    ]
                }
            };

            let aggregatePipeline = [
                {$match: criteria},
                {
                    $group: {
                        _id: "$products.product",
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $limit: 5
                }
            ];
            return await Dao.aggregateDataWithPopulate(Models.orders, aggregatePipeline, [{
                path: '_id',
                select: 'title description',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS
            }])

        };


        let topSellingCollection = async () => {
            let criteria = {
                status: {
                    $nin: [
                        APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED_VENDOR,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_PENDING,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_FAILED
                    ]
                }
            };

            let aggregatePipeline = [
                {$match: criteria},
                {
                    $lookup: {
                        from: 'products',
                        as: 'products',
                        foreignField: "_id",
                        localField: "products.product"
                    }
                },
                {
                    $unwind: {
                        path: '$products',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: "$products.category",
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $limit: 5
                }
            ];
            return await Dao.aggregateDataWithPopulate(Models.orders, aggregatePipeline, [{
                path: '_id',
                select: 'name description',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.CATEGORIES
            }])
        };


        let topSellingVendors = async () => {
            let criteria = {
                status: {
                    $nin: [
                        APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED_VENDOR,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_PENDING,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_FAILED
                    ]
                }
            };

            let aggregatePipeline = [
                {$match: criteria},
                {
                    $group: {
                        _id: "$vendor",
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $limit: 5
                }
            ];
            return await Dao.aggregateDataWithPopulate(Models.orders, aggregatePipeline, [{
                path: '_id',
                select: 'vendorRegisterName firstName lastName',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
            }])

        };


        let trafficCountryBased = async () => {
            let criteria = {
                status: {
                    $nin: [
                        APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED_VENDOR,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_PENDING,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_FAILED
                    ]
                }
            };

            let aggregatePipeline = [
                {$match: criteria},
                {
                    $group: {
                        _id: "$products.product",
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $limit: 5
                }
            ];
            return await Dao.aggregateDataWithPopulate(Models.orders, aggregatePipeline, [{
                path: '_id',
                select: 'title description'
            }])

        };

        let [topSellingCollections, topSellingProduct, topSellingVendor,
            trafficCountriesBased,
        ] = await Promise.all([topSellingCollection(),
            topSellingProducts(), topSellingVendors(),
            trafficCountryBased()
        ]);
        dataToReturn.topSellingCollections = topSellingCollections;
        dataToReturn.topSellingProduct = topSellingProduct;
        dataToReturn.topSellingVendor = topSellingVendor;
        dataToReturn.trafficCountriesBased = [];
        return dataToReturn
    } catch (e) {
        throw e
    }
}

module.exports = {
    adminLogin: adminLogin,
    uploadFile: uploadFile,
    saveSettings: saveSettings,
    forgotPassword: forgotPassword,
    changePassword: changePassword,
    resetPassword: resetPassword,
    dashboardData: dashboardData,
    dailyAnalytics: dailyAnalytics,
    deviceTokenUpdate: deviceTokenUpdate,
    orderAnalytics: orderAnalytics,
    getSettings: getSettings,
    feedAnalytics: feedAnalytics,
    notificationListing: notificationListing,
    earningDashboardAnalytics: earningDashboardAnalytics,
    getPress: getPress,
    updatePress: updatePress,
    addOrEditSubAdmin: addOrEditSubAdmin,
    blockUnblockSubAdmin: blockUnblockSubAdmin,
    listSubAdmin: listSubAdmin,
    verifyAccount: verifyAccount,
    resendOTP: resendOTP,
    dashboardPCV: dashboardPCV
}
