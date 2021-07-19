// constants imported
const RESPONSE_MESSAGES = require('../../../config/constants').responseMessages;
const APP_CONSTANTS = require('../../../config').constants.appDefaults;
const CONSTANTS = require('../../../config').storageConf;

// local modules
const Dao = require('../../../dao').queries;
const Models = require('../../../models');
const NotificationManager = require('../../../lib/notification-manager');
const AuthHelper = require('./helper');
const UniversalFunctions = require('../../../utils/universal-functions')

const addOrEditFeed = async (payload, userData) => {
    try {
        if (payload.feedId) {
            return await editFeed(payload, userData);
        } else {
            return await addFeed(payload, userData);
        }
    } catch (e) {
        throw e;
    }
};

let addFeed = async (payload, userData) => {
    try {
        let dataToSave = {
            user: userData._id,
            media: payload.media,
            type: payload.type,
            feedBy: APP_CONSTANTS.USER_TYPE.USER,
            ...(payload.selectedId && {selectedId: payload.selectedId}),
            ...(payload.postId && {postId: payload.postId}),
            ...(payload.vendorId && {vendorId: payload.vendorId}),
            ...(payload.productId && {productId: payload.productId}),
            ...(payload.type && {type: payload.type}),
            ...(payload.taggedVendors && {taggedVendors: payload.taggedVendors}),
            privacyType: payload.privacyType
        };
        if (payload.caption || payload.caption === '') dataToSave.caption = payload.caption;
        if (payload.hashTag || (payload.hashTag && payload.hashTag.length === 0)) {
            dataToSave.hashTag = payload.hashTag;
            dataToSave.hashTagText = payload.hashTag.join(' ')
        }
        if(payload.type === APP_CONSTANTS.FEED_TYPE.SHARE_VENDOR ){
            let vendor = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {banner: 1}, {lean: true});
            if(vendor && vendor.banner){
                dataToSave.media = vendor.banner;
            }
        }
        if(payload.type === APP_CONSTANTS.FEED_TYPE.SHARE_POST ){
            let post = await Dao.findOne(Models.feeds, {_id: payload.postId}, {media: 1}, {lean: true});
            if(post && post.media){
                dataToSave.media = post.media;
            }
        }
        
        if(payload.type === APP_CONSTANTS.FEED_TYPE.SHARE_PRODUCT ){
            let post = await Dao.findOne(Models.products, {_id: payload.productId}, {images: 1}, {lean: true});
            if(post && post.images && post.images[0]){
                dataToSave.media = post.images[0];
            }
        }
        let savedFeed = await Dao.saveData(Models.feeds, dataToSave);
        if(payload.type && (payload.type === APP_CONSTANTS.FEED_TYPE.SHARE_VENDOR || payload.type === APP_CONSTANTS.FEED_TYPE.SHARE_POST || payload.type === APP_CONSTANTS.FEED_TYPE.SHARE_PRODUCT) ){
            let notificationMessage = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE[payload.type], {
                userName: `${userData.firstName} ${userData.lastName}`,
            });
            let dataToSaveNotification = {
                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE[payload.type],
                message: notificationMessage,
                user: userData._id,
                feed: savedFeed._id,
                ...(payload.postId && {postId: payload.postId}),
                ...(payload.vendorId && {vendor: payload.vendorId}),
                ...(payload.productId && {product: payload.productId}),
                privacyType: payload.privacyType,
                ...(payload.selectedId && {selectedId: payload.selectedId}),
                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE[payload.type]
            };
            await Dao.saveData(Models.notifications, dataToSaveNotification)
        }
        let dataToReturn = await Dao.populateData(Models.feeds, {_id: savedFeed._id}, {}, {lean: true}, [{
            path: 'user',
            select: 'firstName lastName profilePic'
        },{
            path: 'selectedId',
            select: 'firstName lastName profilePic',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
        },{
            path: 'taggedVendors',
            select: 'firstName lastName profilePic banner ownerPicture vendorRegisterName',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
        }])
        return dataToReturn[0]
    } catch (e) {
        throw e
    }
};

let editFeed = async (payload, userData) => {
    try {
        let criteria = {
            _id: payload.feedId
        };
        let option = {
            lean: true,
            new: true
        };
        let dataToSave = {
            user: userData._id,
            type: payload.type,
            ...(payload.postId && {postId: payload.postId}),
            ...(payload.vendorId && {vendorId: payload.vendorId}),
            ...(payload.productId && {productId: payload.productId}),
            ...(payload.type && {type: payload.type}),
            ...(payload.selectedId && {selectedId: payload.selectedId}),
            ...(payload.taggedVendors && {taggedVendors: payload.taggedVendors}),
        };
        if (payload.media) dataToSave.media = payload.media;
        if (payload.privacyType) dataToSave.privacyType = payload.privacyType;
        if (payload.caption || payload.caption === '') dataToSave.caption = payload.caption;
        if (payload.hashTag || (payload.hashTag && payload.hashTag.length === 0)) {
            dataToSave.hashTag = payload.hashTag;
            dataToSave.hashTagText = payload.hashTag.join(' ')
        }
        return await Dao.findAndUpdateWithPopulate(Models.feeds, criteria, dataToSave, option, [{
            path: 'user',
            select: 'firstName lastName profilePic'
        },
        {
            path: 'selectedId',
            select: 'firstName lastName profilePic',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
        },
        {
            path: 'taggedVendors',
            select: 'firstName lastName profilePic banner ownerPicture hashTag name vendorRegisterName',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
        }]);
    } catch (e) {
        throw e
    }
};

let listFeed = async (payload, userData) => {
    try {
        let following = [];
        if (userData) {
            let getFollowings = await Dao.getData(Models.follow, {
                sender: userData._id,
                status: APP_CONSTANTS.STATUS_ENUM.FOLLOW
            });
            following = getFollowings.map(items => {
                return mongoose.Types.ObjectId(items.receiver)
            })
        }
        let data = await AuthHelper.getFeedListing(payload, userData, following);
        return {data: data.data, count: data.count}
    } catch (err) {
        throw err;
    }
};


let feedDetail = async (payload, userData) => {
    try {
        let following = [];
        let data = await AuthHelper.feedDetails(payload, userData);
        return {data: data.data, count: data.count}
    } catch (err) {
        throw err;
    }
};

let likeUnlikeFeed = async (payload, userData) => {
    try {
        let criteria = {
            user: userData._id,
            feed: payload.feed,
            reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.POST_LIKE
        };
        let findFeed = await Dao.populateData(Models.feeds, {_id: payload.feed}, {}, {lean: true}, [{
            path: 'vendor',
            select: 'deviceToken deviceType name vendorRegisterName language'
        }, {
            path: 'user',
            select: 'deviceToken deviceType firstName lastName language'
        }])

        console.log("findFeedfindFeed",findFeed)
        if (findFeed && findFeed.length === 0) {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID
        }
        let findReaction = await Dao.findOne(Models.reactions, criteria, {_id: 1, status: 1, user: 1}, {lean: true})
        if (!findReaction) {
            let dataToSave = {
                user: userData._id,
                feed: payload.feed,
                status: payload.status,
                reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.POST_LIKE,
                logs: [{
                    status: APP_CONSTANTS.STATUS_ENUM.LIKE,
                    createdDate: +new Date(),
                    reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.POST_LIKE,
                    actionBy: userData._id,
                }]
            };

            let mediaCriteria = {
                _id: payload.feed
            };

            let updateData = {
                $inc: {likes: 1, dailyLikes: 1}
            };

            let promise = await Promise.all([Dao.saveData(Models.reactions, dataToSave),
                Dao.findAndUpdate(Models.feeds, mediaCriteria, updateData, {lean: true})
            ])
            let likePostMessage = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.LIKED_POST, {
                userName: `${userData.firstName} ${userData.lastName}`
            })
            if (payload.status === APP_CONSTANTS.STATUS_ENUM.LIKE) {
                if ((findFeed[0].user && findFeed[0].user._id.toString() !== userData._id.toString()) || (findFeed[0].vendor)) {
                    let notificationData = {
                        savePushData: {
                            title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.LIKED_POST,
                            message: likePostMessage,
                            user: userData._id,
                            feed: findFeed[0]._id,
                            createdDate: +new Date(),
                            receiver: findFeed[0].user ? findFeed[0].user._id : findFeed[0].vendor._id,
                            receiverModel: findFeed[0].user ? APP_CONSTANTS.DATABASE.MODELS_NAME.USER : APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
                            userType: findFeed[0].user ? APP_CONSTANTS.USER_TYPE.USER : APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                            notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.LIKED_POST
                            // notificationType: payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR ? APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.STARTED_FOLLOWING : APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.FOLLOW_REQUEST
                        },
                        type: findFeed[0].user ? APP_CONSTANTS.USER_TYPE.USER : APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                        deviceType: findFeed[0].user ? findFeed[0].user.deviceType : findFeed[0].vendor.deviceType,
                        sendPushData: {},
                        deviceToken: findFeed[0].user ? findFeed[0].user.deviceToken : findFeed[0].vendor ? findFeed[0].vendor.deviceToken : ""
                    };

                    if (findFeed[0].user) {
                        notificationData.sendPushData = {
                            title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.LIKED_POST[findFeed[0].user && findFeed[0].user.language ? findFeed[0].user.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                            message: likePostMessage[findFeed[0].user && findFeed[0].user.language ? findFeed[0].user.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                            notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.LIKED_POST
                        }
                    } else {
                        notificationData.sendPushData = {
                            title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.LIKED_POST[findFeed[0].user && findFeed[0].user.language ? findFeed[0].user.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                            message: likePostMessage[findFeed[0].vendor && findFeed[0].vendor.language ? findFeed[0].vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                            notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.LIKED_POST
                        }
                    }

                    await NotificationManager.sendNotifications(notificationData, true);

                }
            }

            return promise[0]
        } else {
            let dataToUpdate = {
                status: payload.status,
                updatedAt: +new Date(),
                $push: {
                    logs: {
                        status: payload.status,
                        createdDate: +new Date(),
                        reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.POST_LIKE,
                        actionBy: userData._id,
                    }
                }
            };
            let query = {
                _id: findReaction._id
            };

            let mediaCriteria = {
                _id: payload.feed
            };

            let updateData = {};
            if (payload.status !== findReaction.status) {
                dataToUpdate.$push = {
                    logs: {
                        status: payload.status,
                        createdDate: +new Date(),
                        reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.POST_LIKE,
                        actionBy: userData._id,
                    }
                };
                updateData = {
                    $inc: {likes: payload.status === APP_CONSTANTS.STATUS_ENUM.LIKE ? 1 : -1 , dailyLikes: payload.status === APP_CONSTANTS.STATUS_ENUM.LIKE ? 1 : -1}
                };
                if (payload.status === APP_CONSTANTS.STATUS_ENUM.LIKE) {
                    let likePostMessage = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.LIKED_POST, {
                        userName: `${userData.firstName} ${userData.lastName}`
                    })
                    if ((findFeed[0].user && findFeed[0].user._id.toString() !== userData._id.toString()) || (findFeed[0].vendor)) {
                        let notificationData = {
                            savePushData: {
                                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.LIKED_POST,
                                message: likePostMessage,
                                user: userData._id,
                                feed: findFeed[0]._id,
                                createdDate: +new Date(),
                                receiver: findFeed[0].user ? findFeed[0].user._id : findFeed[0].vendor._id,
                                receiverModel: findFeed[0].user ? APP_CONSTANTS.DATABASE.MODELS_NAME.USER : APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
                                userType: findFeed[0].user ? APP_CONSTANTS.USER_TYPE.USER : APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.LIKED_POST
                                // notificationType: payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR ? APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.STARTED_FOLLOWING : APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.FOLLOW_REQUEST
                            },
                            type: findFeed[0].user ? APP_CONSTANTS.USER_TYPE.USER : APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                            deviceType: findFeed[0].user ? findFeed[0].user.deviceType : findFeed[0].vendor.deviceType,
                            sendPushData: {},
                            deviceToken: findFeed[0].user ? findFeed[0].user.deviceToken : findFeed[0].vendor ? findFeed[0].vendor.deviceToken : ""
                        };

                        if (findFeed[0].user) {
                            notificationData.sendPushData = {
                                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.LIKED_POST[findFeed[0].user && findFeed[0].user.language ? findFeed[0].user.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                                message: likePostMessage[findFeed[0].user && findFeed[0].user.language ? findFeed[0].user.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.LIKED_POST
                            }
                        } else {
                            notificationData.sendPushData = {
                                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.LIKED_POST[findFeed[0].user && findFeed[0].user.language ? findFeed[0].user.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                                message: likePostMessage[findFeed[0].vendor && findFeed[0].vendor.language ? findFeed[0].vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.LIKED_POST
                            }
                        }

                        await NotificationManager.sendNotifications(notificationData, true);

                    }

                }
            }
            let promise = await Promise.all([Dao.findAndUpdate(Models.reactions, query, dataToUpdate, {
                lean: true,
                new: true
            }),
                Dao.findAndUpdate(Models.feeds, mediaCriteria, updateData, {lean: true})
            ])

            return promise[0];
        }
    } catch (e) {
        throw e
    }
};

const addOrEditComment = async (payload, userData) => {
    try {
        let data
        if (payload.commentId) {
            data = await editCommentFeed(payload, userData)
        } else {
            data = await addCommentFeed(payload, userData)
        }
        let dataToReturn = await Dao.populateData(Models.comments, {_id: data._id}, {}, {lean: true}, [{
            path: 'user',
            select: 'firstName lastName profilePic'
        }])
        return dataToReturn[0]
    } catch (e) {
        throw e
    }
};

let addCommentFeed = async (payload, userData) => {
    try {
        let findFeed = await Dao.populateData(Models.feeds, {_id: payload.feed}, {}, {lean: true}, [{
            path: 'vendor',
            select: 'deviceToken deviceType name vendorRegisterName language'
        }, {
            path: 'user',
            select: 'deviceToken deviceType firstName lastName language'
        }])
        if (findFeed && findFeed.length === 0) {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID
        }
        let dataToSave = {
            user: userData._id,
            feed: payload.feed,
            text: payload.text,
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            logs: [{
                status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
                createdDate: +new Date(),
                text: payload.text,
                actionBy: userData._id,
            }]
        };

        let mediaCriteria = {
            _id: payload.feed
        };

        let updateData = {
            $inc: {comments: 1, dailyComments: 1}
        };

        let promise = await Promise.all([Dao.saveData(Models.comments, dataToSave),
            Dao.findAndUpdate(Models.feeds, mediaCriteria, updateData, {lean: true})
        ])


        let commentPostMessage = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.COMMENTED_POST, {
            userName: `${userData.firstName} ${userData.lastName}`
        })

        if ((findFeed[0].user && findFeed[0].user._id.toString() !== userData._id.toString()) || (findFeed[0].vendor)) {
            let notificationData = {
                savePushData: {
                    title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.COMMENTED_POST,
                    message: commentPostMessage,
                    user: userData._id,
                    feed: findFeed[0]._id,
                    createdDate: +new Date(),
                    receiver: findFeed[0].user ? findFeed[0].user._id : findFeed[0].vendor._id,
                    receiverModel: findFeed[0].user ? APP_CONSTANTS.DATABASE.MODELS_NAME.USER : APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
                    userType: findFeed[0].user ? APP_CONSTANTS.USER_TYPE.USER : APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                    notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.COMMENTED_POST
                    // notificationType: payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR ? APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.STARTED_FOLLOWING : APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.FOLLOW_REQUEST
                },
                type: findFeed[0].user ? APP_CONSTANTS.USER_TYPE.USER : APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                deviceType: findFeed[0].user ? findFeed[0].user.deviceType : findFeed[0].vendor.deviceType,
                sendPushData: {},
                deviceToken: findFeed[0].user ? findFeed[0].user.deviceToken : findFeed[0].vendor ? findFeed[0].vendor.deviceToken : ""
            };

            if (findFeed[0].user) {
                notificationData.sendPushData = {
                    title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.COMMENTED_POST[findFeed[0].user && findFeed[0].user.language ? findFeed[0].user.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                    message: commentPostMessage[findFeed[0].user && findFeed[0].user.language ? findFeed[0].user.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                    notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.COMMENTED_POST
                }
            } else {
                notificationData.sendPushData = {
                    title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.COMMENTED_POST[findFeed[0].user && findFeed[0].user.language ? findFeed[0].user.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                    message: commentPostMessage[findFeed[0].vendor && findFeed[0].vendor.language ? findFeed[0].vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                    notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.COMMENTED_POST
                }
            }

            await NotificationManager.sendNotifications(notificationData, true);

        }

        return promise[0];
    } catch (e) {
        throw e
    }
};

let editCommentFeed = async (payload, userData) => {
    try {
        let criteria = {
            _id: payload.commentId,
        };

        let dataToUpdate = {
            text: payload.text,
            status: APP_CONSTANTS.STATUS_ENUM.EDITED,
            updatedAt: +new Date(),
            $push: {
                logs: {
                    text: payload.text,
                    status: APP_CONSTANTS.STATUS_ENUM.EDITED,
                    createdDate: +new Date(),
                    actionBy: userData._id,
                }
            }
        };
        return await Dao.findAndUpdate(Models.comments, criteria, dataToUpdate, {lean: true, new: true})
    } catch (e) {
        throw e
    }
};

let deleteCommentFeed = async (payload, userData) => {
    try {
        let criteria = {
            _id: payload.commentId,
        };

        let dataToUpdate = {
            status: APP_CONSTANTS.STATUS_ENUM.DELETED,
            $push: {
                logs: {
                    status: APP_CONSTANTS.STATUS_ENUM.DELETED,
                    createdDate: +new Date(),
                    actionBy: userData._id,
                }
            }
        };

        let mediaCriteria = {
            _id: payload.feed
        };

        let updateData = {
            $inc: {comments: -1}
        };

        let promise = await Promise.all([Dao.findAndUpdate(Models.comments, criteria, dataToUpdate, {
            lean: true,
            new: true
        }),
            Dao.findAndUpdate(Models.feeds, mediaCriteria, updateData, {lean: true})
        ]);

        return promise[0];
    } catch (e) {
        throw e
    }
};
//
// let favouriteUnFavouriteFeed = async (payload, userData) => {
//     try {
//         let criteria = {
//             user: userData._id,
//             feed: payload.feed,
//             reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.POST_FAVOURITE
//         };
//
//         let findReaction = await Dao.findOne(Models.reactions, criteria, {_id: 1}, {lean: true})
//         if (!findReaction) {
//             let dataToSave = {
//                 user: userData._id,
//                 feed: payload.feed,
//                 status: payload.status,
//                 reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.POST_FAVOURITE,
//                 logs: [{
//                     status: payload.status,
//                     createdDate: +new Date(),
//                     reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.POST_FAVOURITE,
//                     actionBy: userData._id,
//                 }]
//             };
//
//
//             let mediaCriteria = {
//                 _id: payload.feed
//             };
//
//             let updateData = {
//                 $inc: {favourites: 1}
//             };
//
//             let promise = await Promise.all([Dao.saveData(Models.reactions, dataToSave),
//                 Dao.findAndUpdate(Models.feed, mediaCriteria, updateData, {lean: true})
//             ]);
//             return promise[0];
//         } else {
//             let dataToUpdate = {
//                 status: payload.status,
//                 updatedAt: +new Date(),
//                 $push: {
//                     logs: {
//                         status: payload.status,
//                         createdDate: +new Date(),
//                         reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.POST_FAVOURITE,
//                         actionBy: userData._id,
//                     }
//                 }
//             };
//             let query = {
//                 _id: findReaction._id
//             };
//
//
//             let mediaCriteria = {
//                 _id: payload.feed
//             };
//
//             let updateData = {
//
//             };
//             if (payload.status !== findReaction.status) {
//                 dataToUpdate.$push = {
//                     logs: {
//                         status: payload.status,
//                         createdDate: +new Date(),
//                         reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.POST_FAVOURITE,
//                         actionBy: userData._id,
//                     }
//                 }
//                 updateData = {
//                     $inc: {likes: payload.status === APP_CONSTANTS.STATUS_ENUM.FAVOURITE ? 1 : -1}
//                 };
//             }
//
//             let promise = await Promise.all([Dao.findAndUpdate(Models.reactions, query, dataToUpdate, {
//                 lean: true,
//                 new: true
//             }),
//                 Dao.findAndUpdate(Models.feed, mediaCriteria, updateData, {lean: true})
//             ]);
//             return promise[0];
//         }
//     } catch (e) {
//         throw e
//     }
// };
//
// let shareFeed = async (payload, userData) => {
//     try {
//         let dataToSave = {
//             user: userData._id,
//             feed: payload.feed,
//             status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
//             reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.POST_SHARE,
//             logs: [{
//                 status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
//                 createdDate: +new Date(),
//                 reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.POST_SHARE,
//                 actionBy: userData._id,
//             }]
//         };
//
//         let mediaCriteria = {
//             _id: payload.feed
//         };
//
//         let updateData = {
//             $inc: {share: 1}
//         };
//
//         let promise = await Promise.all([Dao.saveData(Models.reactions, dataToSave),
//             Dao.findAndUpdate(Models.feed, mediaCriteria, updateData, {lean: true})
//         ]);
//
//         return promise[0];
//     } catch (e) {
//         throw e
//     }
// };

let listLikes = async (payload, userData) => {
    try {
        let criteria = {
            status: APP_CONSTANTS.STATUS_ENUM.LIKE,
            feed: mongoose.Types.ObjectId(payload.feed),
            reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.POST_LIKE
        };
        let projection = {
            logs: 0,
            createdDate: 0,
            reactionType: 0,
        };
        let populate = [
            {
                path: 'user',
                select: 'firstName lastName _id profilePic'
            },
            {
                path: 'feed',
                select: 'media'
            }
        ];

        let aggregatePipeline = [{
            $match: criteria
        }, {
            $project: projection
        }];

        if (payload.skip) {
            aggregatePipeline.push({
                $skip: parseInt(payload.skip)
            })
        }

        if (payload.limit) {
            aggregatePipeline.push({
                $limit: parseInt(payload.limit)
            })
        }

        if (userData) {
            aggregatePipeline.push({
                $lookup: {
                    from: "follows",
                    let: {
                        "userId": "$user"
                    },
                    pipeline: [
                        {
                            $match:
                                {
                                    $expr:
                                        {
                                            $and:
                                                [
                                                    {$eq: ["$receiver", "$$userId"]},
                                                    {$eq: ["$sender", mongoose.Types.ObjectId(userData._id)]},
                                                    {$eq: ["$status", APP_CONSTANTS.STATUS_ENUM.FOLLOW]},
                                                ]
                                        }
                                }
                        },
                        {$project: {_id: 1}}
                    ],
                    as: "follows"
                }
            }, {
                $addFields: {
                    followByUser: {$size: '$follows'}
                }
            }, {
                $addFields: {
                    followDone: {
                        $cond: {
                            if: {$gt: ['$followByUser', 0]},
                            then: true,
                            else: false
                        }
                    }
                }
            })
        } else {
            aggregatePipeline.push({
                $addFields: {
                    followDone: false
                }
            })
        }
        let promise = [Dao.aggregateDataWithPopulate(Models.reactions, aggregatePipeline, populate),
            Dao.countDocuments(Models.reactions, criteria)
        ];

        let [data, count] = await Promise.all(promise)

        return {data, count}

    } catch (e) {
        throw e
    }
};
//
// let listFavourites = async (payload, userData) => {
//     try {
//         let criteria = {
//             status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
//             feed: payload.feed,
//             reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.POST_FAVOURITE
//         };
//         let projection = {
//             logs: 0,
//             createdDate: 0,
//             reactionType: 0,
//             status: 0
//         };
//         let option = {
//             lean: true,
//             skip: parseInt(payload.skip),
//             limit: parseInt(payload.limit)
//         };
//         let populate = [
//             {
//                 path: 'user',
//                 select: 'name email _id'
//             },
//             {
//                 path: 'feed',
//                 select: 'media'
//             }
//         ];
//         let promise = [Dao.populateData(Models.reactions, criteria, projection, option, populate),
//             Dao.countDocuments(Models.reactions, criteria)
//         ];
//
//         let [data, count] = await Promise.all(promise)
//
//         return {data, count}
//
//     } catch (e) {
//         throw e
//     }
// };

let listComments = async (payload, userData) => {
    try {
        let criteria = {
            status: {$in: [APP_CONSTANTS.STATUS_ENUM.ACTIVE, APP_CONSTANTS.STATUS_ENUM.EDITED]},
            feed: payload.feed,
        };
        let projection = {
            logs: 0,
            createdDate: 0
        };
        let option = {
            lean: true,
            skip: parseInt(payload.skip),
            limit: parseInt(payload.limit)
        };
        let populate = [
            {
                path: 'user',
                select: 'firstName lastName _id profilePic'
            },
            {
                path: 'feed',
                select: 'media'
            }
        ];
        let promise = [Dao.populateData(Models.comments, criteria, projection, option, populate),
            Dao.countDocuments(Models.comments, criteria)
        ];

        let [data, count] = await Promise.all(promise)
        return {data, count}

    } catch (e) {
        throw e
    }
};

const deleteFeed = async (payload, userData) => {
    try {
        let criteria = {
            _id: payload.feed
        }, dataToUpdate = {
            status: APP_CONSTANTS.STATUS_ENUM.DELETED
        }, criteriaLikesAndComments = {
            feed: payload.feed
        };

        let checkFeed = await Dao.findOne(Models.feeds, {
            _id: payload.feed,
            user: userData._id
        }, {_id: 1}, {lean: true});
        if (!checkFeed) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.FEED_NOT_BELONG

        let updateFeedStatus = await Dao.findAndUpdate(Models.feeds, criteria, dataToUpdate, {lean: true, new: true});
        await Dao.updateMany(Models.reactions, criteriaLikesAndComments, dataToUpdate, {multi: true});
        await Dao.updateMany(Models.comments, criteriaLikesAndComments, dataToUpdate, {multi: true});
        return updateFeedStatus
    } catch (e) {
        throw e
    }
}

const reportFeed = async (payload, userData) => {
    try {
        let criteria = {
            _id: payload.feed
        };
        let dataToUpdate = {
            $push: {
                reportBy: {
                    id: userData._id,
                    by: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
                }
            }
        };
        let updateFeed = await Dao.findAndUpdate(Models.feeds, criteria, dataToUpdate, {new: true})
        await Dao.saveData(Models.commonReports, {
            reportBy: userData._id,
            ...(payload.reason && {reason: payload.reason}),
            feed: payload.feed,
            reportByModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
        })
        return updateFeed
    } catch (e) {
        throw e
    }
}

const hideFeed = async (payload, userData) => {
    try {
        let criteria = {
            _id: payload.feed
        };
        let dataToUpdate = {};
        if (payload.status === APP_CONSTANTS.STATUS_ENUM.HIDE) {
            dataToUpdate = {
                $push: {
                    hiddenFor: {
                        id: userData._id,
                        by: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
                    }
                }
            }
        } else {
            dataToUpdate = {
                $pull: {
                    hiddenFor: {
                        id: userData._id
                    }
                }
            }
        }
        let updateFeed = await Dao.findAndUpdate(Models.feeds, criteria, dataToUpdate, {new: true})

        return updateFeed
    } catch (e) {
        throw e
    }
}
module.exports = {
    addOrEditFeed: addOrEditFeed,
    listFeed: listFeed,
    likeUnlikeFeed: likeUnlikeFeed,
    // favouriteUnFavouriteFeed: favouriteUnFavouriteFeed,
    // shareFeed: shareFeed,
    deleteCommentFeed: deleteCommentFeed,
    addOrEditComment: addOrEditComment,
    listLikes: listLikes,
    // listFavourites: listFavourites,
    listComments: listComments,
    deleteFeed: deleteFeed,
    reportFeed: reportFeed,
    hideFeed: hideFeed,
    feedDetail: feedDetail
};
