// constants imported
const RESPONSE_MESSAGES = require('../../../config/constants').responseMessages;
const APP_CONSTANTS = require('../../../config').constants.appDefaults;
const CONSTANTS = require('../../../config').storageConf;

// local modules
const Dao = require('../../../dao').queries;
const Models = require('../../../models');
const UniversalFunctions = require("../../../utils/universal-functions")
const NotificationManager = require("../../../lib/notification-manager")

let likeUnlikeProduct = async (payload, userData) => {
    try {
        let criteria = {
            user: userData._id,
            product: payload.product,
            reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.PRODUCT_LIKE
        };

        let findReaction = await Dao.findOne(Models.reactions, criteria, {_id: 1, status: 1}, {lean: true})
        if (!findReaction) {
            let dataToSave = {
                user: userData._id,
                product: payload.product,
                status: payload.status,
                reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.PRODUCT_LIKE,
                logs: [{
                    status: payload.status,
                    createdDate: +new Date(),
                    reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.PRODUCT_LIKE,
                    actionBy: userData._id,
                }]
            };

            let mediaCriteria = {
                _id: payload.product
            };

            let updateData = {
                $inc: {likes: 1, dailyLikes: 1}
            };

            let promise = await Promise.all([Dao.saveData(Models.reactions, dataToSave),
                Dao.findAndUpdate(Models.products, mediaCriteria, updateData, {lean: true})
            ])

            let likePostMessage = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.LIKED_PRODUCT, {
                userName: `${userData.firstName} ${userData.lastName}`
            })
            if (payload.status === APP_CONSTANTS.STATUS_ENUM.LIKE) {
                let notificationData = {
                    savePushData: {
                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.LIKED_PRODUCT,
                        message: likePostMessage,
                        user: userData._id,
                        receiver: promise[1].vendor._id,
                        product: payload.product,
                        receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
                        userType: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.LIKED_PRODUCT
                        // notificationType: payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR ? APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.STARTED_FOLLOWING : APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.FOLLOW_REQUEST
                    },
                    type: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                    deviceType: APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                    sendPushData: {
                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.LIKED_PRODUCT[promise[1].vendor.language ? promise[1].vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        message: likePostMessage[promise[1].vendor.language ? promise[1].vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.LIKED_PRODUCT
                    },
                    deviceToken: promise[1].vendor.deviceToken || ""
                };

                await NotificationManager.sendNotifications(notificationData, true);
            }


            return promise[0]
        } else {
            let dataToUpdate = {
                status: payload.status,
                updatedAt: +new Date(),
            };
            let query = {
                _id: findReaction._id
            };

            let mediaCriteria = {
                _id: payload.product
            };

            let updateData = {}

            if (payload.status !== findReaction.status) {
                dataToUpdate.$push = {
                    logs: {
                        status: payload.status,
                        createdDate: +new Date(),
                        reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.PRODUCT_LIKE,
                        actionBy: userData._id,
                    }
                };
                updateData = {
                    $inc: {likes: payload.status === APP_CONSTANTS.STATUS_ENUM.LIKE ? 1 : -1, dailyLikes: payload.status === APP_CONSTANTS.STATUS_ENUM.LIKE ? 1 : -1}
                };
            }


            let promise = await Promise.all([Dao.findAndUpdate(Models.reactions, query, dataToUpdate, {
                lean: true,
                new: true
            }),
                Dao.findAndUpdateWithPopulate(Models.products, mediaCriteria, updateData, {lean: true}, [{
                    path: 'vendor',
                    select: 'deviceType deviceToken language'
                }])
            ])

            let likePostMessage = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.LIKED_PRODUCT, {
                userName: `${userData.firstName} ${userData.lastName}`
            })
            if (payload.status === APP_CONSTANTS.STATUS_ENUM.LIKE) {
                let notificationData = {
                    savePushData: {
                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.LIKED_PRODUCT,
                        message: likePostMessage,
                        user: userData._id,
                        receiver: promise[1].vendor._id,
                        product: payload.product,
                        receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
                        userType: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.LIKED_PRODUCT
                        // notificationType: payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR ? APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.STARTED_FOLLOWING : APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.FOLLOW_REQUEST
                    },
                    type: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                    deviceType: APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                    sendPushData: {
                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.LIKED_PRODUCT[promise[1].vendor.language ? promise[1].vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        message: likePostMessage[promise[1].vendor.language ? promise[1].vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.LIKED_PRODUCT
                    },
                    deviceToken: promise[1].vendor.deviceToken || ""
                };

                await NotificationManager.sendNotifications(notificationData, true);
            }

            return promise[0];
        }
    } catch (e) {
        throw e
    }
};



let likeUnlikeVendor = async (payload, userData) => {
    try {
        let criteria = {
            user: userData._id,
            vendor: payload.vendor,
            reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.VENDOR_LIKE
        };

        let findReaction = await Dao.findOne(Models.reactions, criteria, {_id: 1, status: 1}, {lean: true})
        if (!findReaction) {
            let dataToSave = {
                user: userData._id,
                vendor: payload.vendor,
                status: payload.status,
                reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.VENDOR_LIKE,
                logs: [{
                    status: payload.status,
                    createdDate: +new Date(),
                    reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.VENDOR_LIKE,
                    actionBy: userData._id,
                }]
            };

            let mediaCriteria = {
                _id: payload.vendor
            };

            let updateData = {
                $inc: {likes: 1, dailyLikes: 1}
            };

            let promise = await Promise.all([Dao.saveData(Models.reactions, dataToSave),
                Dao.findAndUpdate(Models.vendors, mediaCriteria, updateData, {lean: true})
            ])
            console.log("promisepromise",promise)
            let likePostMessage = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.LIKED_VENDOR, {
                userName: `${userData.firstName} ${userData.lastName}`
            })
            if (payload.status === APP_CONSTANTS.STATUS_ENUM.LIKE) {
                let notificationData = {
                    savePushData: {
                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.LIKED_VENDOR,
                        message: likePostMessage,
                        user: userData._id,
                        receiver: payload.vendor,
                        receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
                        userType: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.LIKED_VENDOR
                        // notificationType: payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR ? APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.STARTED_FOLLOWING : APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.FOLLOW_REQUEST
                    },
                    type: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                    deviceType: APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                    sendPushData: {
                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.LIKED_VENDOR[promise[1].language ? promise[1].language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        message: likePostMessage[promise[1].language ? promise[1].language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.LIKED_VENDOR
                    },
                    deviceToken: promise[1].deviceToken || ""
                };

                await NotificationManager.sendNotifications(notificationData, true);
            }

            return promise[0]
        } else {
            let dataToUpdate = {
                status: payload.status,
                updatedAt: +new Date(),
            };
            let query = {
                _id: findReaction._id
            };

            let mediaCriteria = {
                _id: payload.vendor
            };

            let updateData = {}

            if (payload.status !== findReaction.status) {
                dataToUpdate.$push = {
                    logs: {
                        status: payload.status,
                        createdDate: +new Date(),
                        reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.VENDOR_LIKE,
                        actionBy: userData._id,
                    }
                };
                updateData = {
                    $inc: {likes: payload.status === APP_CONSTANTS.STATUS_ENUM.LIKE ? 1 : -1, dailyLikes: payload.status === APP_CONSTANTS.STATUS_ENUM.LIKE ? 1 : -1}
                };
            }


            let promise = await Promise.all([Dao.findAndUpdate(Models.reactions, query, dataToUpdate, {
                lean: true,
                new: true
            }),
                Dao.findAndUpdate(Models.vendors, mediaCriteria, updateData, {lean: true})
            ])

            console.log("promisepromise",promise)
            let likePostMessage = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.LIKED_VENDOR, {
                userName: `${userData.firstName} ${userData.lastName}`
            })
            if (payload.status === APP_CONSTANTS.STATUS_ENUM.LIKE) {
                let notificationData = {
                    savePushData: {
                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.LIKED_VENDOR,
                        message: likePostMessage,
                        user: userData._id,
                        receiver: payload.vendor,
                        receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
                        userType: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.LIKED_VENDOR
                        // notificationType: payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR ? APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.STARTED_FOLLOWING : APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.FOLLOW_REQUEST
                    },
                    type: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                    deviceType: APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                    sendPushData: {
                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.LIKED_VENDOR[promise[1].language ? promise[1].language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        message: likePostMessage[promise[1].language ? promise[1].language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.LIKED_VENDOR
                    },
                    deviceToken: promise[1].deviceToken || ""
                };

                await NotificationManager.sendNotifications(notificationData, true);
            }
            return promise[0];
        }
    } catch (e) {
        throw e
    }
};

let favouriteUnFavouriteProduct = async (payload, userData) => {
    try {
        let criteria = {
            user: userData._id,
            product: payload.product,
            reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.PRODUCT_FAVOURITE
        };

        let findReaction = await Dao.findOne(Models.reactions, criteria, {_id: 1, status: 1}, {lean: true})
        if (!findReaction) {
            let dataToSave = {
                user: userData._id,
                product: payload.product,
                status: payload.status,
                reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.PRODUCT_FAVOURITE,
                logs: [{
                    status: payload.status,
                    createdDate: +new Date(),
                    reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.PRODUCT_FAVOURITE,
                    actionBy: userData._id,
                }]
            };


            let mediaCriteria = {
                _id: payload.product
            };

            let updateData = {
                $inc: {favourites: 1}
            };

            let promise = await Promise.all([Dao.saveData(Models.reactions, dataToSave),
                Dao.findAndUpdate(Models.products, mediaCriteria, updateData, {lean: true})
            ]);
            return promise[0];
        } else {
            let dataToUpdate = {
                status: payload.status,
                updatedAt: +new Date(),
            };
            let query = {
                _id: findReaction._id
            };


            let mediaCriteria = {
                _id: payload.product
            };

            let updateData = {}
            if (payload.status !== findReaction.status) {
                dataToUpdate.$push = {
                    logs: {
                        status: payload.status,
                        createdDate: +new Date(),
                        reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.PRODUCT_FAVOURITE,
                        actionBy: userData._id,
                    }
                }
                updateData = {
                    $inc: {likes: payload.status === APP_CONSTANTS.STATUS_ENUM.FAVOURITE ? 1 : -1}
                };
            }
            let promise = await Promise.all([Dao.findAndUpdate(Models.reactions, query, dataToUpdate, {
                lean: true,
                new: true
            }),
                Dao.findAndUpdate(Models.products, mediaCriteria, updateData, {lean: true})
            ]);
            return promise[0];
        }
    } catch (e) {
        throw e
    }
};

let shareProduct = async (payload, userData) => {
    try {
        let dataToSave = {
            user: userData._id,
            product: payload.product,
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.PRODUCT_SHARE,
            logs: [{
                status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
                createdDate: +new Date(),
                reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.PRODUCT_SHARE,
                actionBy: userData._id,
            }]
        };

        let mediaCriteria = {
            _id: payload.product
        };

        let updateData = {
            $inc: {share: 1}
        };

        let promise = await Promise.all([Dao.saveData(Models.reactions, dataToSave),
            Dao.findAndUpdate(Models.products, mediaCriteria, updateData, {lean: true})
        ]);

        return promise[0];
    } catch (e) {
        throw e
    }
};


let listFavouriteProducts = async (payload, userData) => {
    try {
        let criteria = {
            status: APP_CONSTANTS.STATUS_ENUM.FAVOURITE,
            reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.PRODUCT_FAVOURITE,
            user: userData._id
        };
        let projection = {
            logs: 0,
            createdDate: 0,
            reactionType: 0,
            // status: 0
        };
        let option = {
            lean: true,
            ...(payload.skip && {skip: parseInt(payload.skip)}),
            ...(payload.limit && {limit: parseInt(payload.limit)}),
        };
        let populate = [
            {
                path: 'user',
                select: 'name email _id'
            },
            {
                path: 'product',
                select: 'title description images vendor',
                populate: [{
                    path: 'vendor',
                    select: 'name vendorRegisterName'
                }]
            }
        ];
        let promise = [Dao.populateData(Models.reactions, criteria, projection, option, populate),
            Dao.countDocuments(Models.reactions, criteria)
        ];

        let [data, count] = await Promise.all(promise)

        return {data, count}

    } catch (e) {
        throw e
    }
};

module.exports = {
    likeUnlikeProduct: likeUnlikeProduct,
    listFavouriteProducts: listFavouriteProducts,
    favouriteUnFavouriteProduct: favouriteUnFavouriteProduct,
    shareProduct: shareProduct,
    likeUnlikeVendor: likeUnlikeVendor
};
