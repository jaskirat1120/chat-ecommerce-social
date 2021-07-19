// constants imported
const RESPONSE_MESSAGES = require('../../../config/constants').responseMessages;
const APP_CONSTANTS = require('../../../config').constants.appDefaults;
const CONSTANTS = require('../../../config').storageConf;

// local modules
const Dao = require('../../../dao').queries;
const Models = require('../../../models');
const mongoose = require('mongoose');
const NotificationManager = require('../../../lib/notification-manager');
const UniversalFunctions = require('../../../utils/universal-functions');
const followUnFollow = async (payload, userData) => {
    try {
        let model, followData;
        if (payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_USER) model = Models.user;
        if (payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR) model = Models.vendors;
        let checkId = await Dao.findOne(model, {_id: payload.receiver}, {
            _id: 1,
            deviceToken: 1,
            deviceType: 1,
            language: 1
        }, {lean: true});
        if (checkId) {
            if (payload.action === APP_CONSTANTS.DATABASE.FOLLOW_STATUSES.FOLLOW) {
                let criteria = {sender: userData._id, receiver: payload.receiver},
                    dataToSave = {
                        sender: userData._id,
                        senderModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                        receiver: payload.receiver,
                        receiverModel: payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR ? APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS : APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                        followType: payload.followType,
                        status: payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR ? APP_CONSTANTS.STATUS_ENUM.FOLLOW : APP_CONSTANTS.STATUS_ENUM.FOLLOW_REQUEST,
                        // status: APP_CONSTANTS.STATUS_ENUM.FOLLOW,
                        logs: [{
                            // status: APP_CONSTANTS.STATUS_ENUM.FOLLOW,
                            status: payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR ? APP_CONSTANTS.STATUS_ENUM.FOLLOW : APP_CONSTANTS.STATUS_ENUM.FOLLOW_REQUEST,
                            createdDate: +new Date(),
                            actionBy: userData._id,
                            actionModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
                        }]
                    },
                    dataToUpdate = {
                        sender: userData._id,
                        senderModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                        receiver: payload.receiver,
                        receiverModel: payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR ? APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS : APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                        updatedDate: +new Date(),
                        status: payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR ? APP_CONSTANTS.STATUS_ENUM.FOLLOW : APP_CONSTANTS.STATUS_ENUM.FOLLOW_REQUEST,
                        // status: APP_CONSTANTS.STATUS_ENUM.FOLLOW,
                        $push: {
                            logs: {
                                status: payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR ? APP_CONSTANTS.STATUS_ENUM.FOLLOW : APP_CONSTANTS.STATUS_ENUM.FOLLOW_REQUEST,
                                // status: APP_CONSTANTS.STATUS_ENUM.FOLLOW,
                                createdDate: +new Date(),
                                actionBy: userData._id,
                                actionModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
                            }
                        }
                    };

                let userFollowData = await Dao.findOne(Models.follow, criteria, {}, {lean: true});
            
                if (!userFollowData) {
                    dataToSave.createdDate = +new Date();
                    dataToSave.updatedDate = +new Date();
                    [followData] = await Promise.all([
                        Dao.saveData(Models.follow, dataToSave),
                        Dao.findAndUpdate(Models.follow, {
                            receiver: payload.receiver,
                            user: userData._id,
                            notificationType: {$in: [APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.FOLLOW_REQUEST, APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.FOLLOW_REQUEST_ACCEPTED, APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.STARTED_FOLLOWING]}
                        }, {
                            status: APP_CONSTANTS.STATUS_ENUM.DELETED
                        }, {lean: true})
                    ]);
                } else {
                    if (userFollowData.status === APP_CONSTANTS.DATABASE.FOLLOW_STATUSES.FOLLOW) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.ALREADY_FOLLOWED;
                    else {
                        [followData] = await Promise.all([
                            Dao.findAndUpdate(Models.follow, {_id: userFollowData._id}, dataToUpdate, {
                                lean: true,
                                new: true
                            }), 
                            Dao.findAndUpdate(Models.follow, {
                                receiver: payload.receiver,
                                followId: userFollowData._id,
                                notificationType: {$in: [APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.FOLLOW_REQUEST, APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.FOLLOW_REQUEST_ACCEPTED, APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.STARTED_FOLLOWING]}
                            }, {
                                status: APP_CONSTANTS.STATUS_ENUM.DELETED
                            }, {lean: true})
                        ]);
                    }
                }
                await Promise.all([
                    Dao.findAndUpdate(Models.user, {_id: userData._id}, {following: {$inc: 1}}, {lean: true}),
                    Dao.findAndUpdate(model, {_id: payload.receiver}, {follower: {$inc: 1}}, {lean: true})
                ]);

                let notificationMessageReceiver = await UniversalFunctions.renderMessageAccordingToLanguage(payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR ? APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.STARTED_FOLLOWING : APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.FOLLOW_REQUEST, {
                // let notificationMessageReceiver = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.STARTED_FOLLOWING, {
                    userName: `${userData.firstName} ${userData.lastName}`
                });

                let notificationData = {
                    savePushData: {
                        title: payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR ? APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.STARTED_FOLLOWING : APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.FOLLOW_REQUEST,
                        // title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.STARTED_FOLLOWING,
                        message: notificationMessageReceiver,
                        receiver: checkId._id,
                        user: userData._id,
                        followId: followData._id,
                        createdDate: +new Date(),
                        receiverModel: payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR ? APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS : APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                        userType: payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR ? APP_CONSTANTS.USER_TYPE.VENDOR_OWNER : APP_CONSTANTS.USER_TYPE.USER,
                        // notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.STARTED_FOLLOWING
                        notificationType: payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR ? APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.STARTED_FOLLOWING : APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.FOLLOW_REQUEST
                    },
                    type: payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR ? APP_CONSTANTS.USER_TYPE.VENDOR_OWNER : APP_CONSTANTS.USER_TYPE.USER,
                    deviceType: checkId.deviceType ? checkId.deviceType : APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                    sendPushData: {
                        title: payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR ? APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.STARTED_FOLLOWING[checkId.language ? checkId.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN] : APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.FOLLOW_REQUEST[checkId.language ? checkId.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        // title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.STARTED_FOLLOWING[checkId.language ? checkId.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        message: notificationMessageReceiver[checkId.language ? checkId.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        notificationType: payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR ? APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.STARTED_FOLLOWING : APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.FOLLOW_REQUEST
                        // notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.STARTED_FOLLOWING
                    },
                    deviceToken: checkId.deviceToken
                };

                await NotificationManager.sendNotifications(notificationData, true);

            } else {
                let criteria = {sender: userData._id, receiver: payload.receiver},
                otherCriteria ={receiver: userData._id, sender: payload.receiver},
                    dataToUpdate = {
                        sender: userData._id,
                        senderModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                        receiver: payload.receiver,
                        receiverModel: payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR ? APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS : APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                        updatedDate: +new Date(),
                        status: APP_CONSTANTS.STATUS_ENUM.UNFOLLOW,
                        $push: {
                            logs: {
                                status: APP_CONSTANTS.STATUS_ENUM.UNFOLLOW,
                                createdDate: +new Date(),
                                actionBy: userData._id
                            }
                        }
                    },
                    dataToUpdateOther = {
                        sender: payload.receiver,
                        senderModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                        receiver: userData._id,
                        receiverModel: payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR ? APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS : APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                        updatedDate: +new Date(),
                        status: APP_CONSTANTS.STATUS_ENUM.UNFOLLOW,
                        $push: {
                            logs: {
                                status: APP_CONSTANTS.STATUS_ENUM.UNFOLLOW,
                                createdDate: +new Date(),
                                actionBy: userData._id
                            }
                        }
                    };

                let userFollowData = await Dao.findOne(Models.follow, criteria, {}, {lean: true});
                let userFollowDataOther = await Dao.findOne(Models.follow, otherCriteria, {}, {lean: true});


                if (!userFollowData) {
                    throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID
                } else {
                    if (userFollowData.status === APP_CONSTANTS.DATABASE.FOLLOW_STATUSES.UNFOLLOW) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.ALREADY_UNFOLLOWED;
                    else {
                        await Promise.all([
                            Dao.findAndUpdate(Models.follow, {_id: userFollowData._id}, dataToUpdate, {
                                lean: true,
                                new: true
                            })
                        ]);
                        if(userFollowDataOther){
                            await Dao.findAndUpdate(Models.follow, {_id: userFollowDataOther._id}, dataToUpdateOther, {
                                lean: true,
                                new: true
                            }) 
                        }
                    }
                }
                payload.otherPerson = payload.receiver;
                await Promise.all([
                    Dao.findAndUpdate(Models.user, {_id: userData._id}, {following: {$inc: -1}}, {lean: true}),
                    Dao.findAndUpdate(model, {_id: payload.receiver}, {follower: {$inc: -1}}, {lean: true}),
                    deleteChat(payload, userData)
                ])
            }
            return {}
        } else throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID;
    } catch (e) {
        throw e
    }
};


let acceptRejectFollowRequest = async (payload, userData) => {
    try {
        let data = await Dao.findOne(Models.follow, {_id: payload._id}, {}, {lean: true});
        if (data) {
            if (data.status === APP_CONSTANTS.STATUS_ENUM.FOLLOW) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.ALREADY_ACCEPTED_RECEIVER;
            else if (data.status === APP_CONSTANTS.STATUS_ENUM.REJECTED) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.ALREADY_REJECTED_RECEIVER;
            else {
                let dataToUpdate = {};
                let otherFollowData = {}
                if (payload.action === APP_CONSTANTS.FOLLOW_ACTION.ACCEPT) {
                    dataToUpdate.status = APP_CONSTANTS.STATUS_ENUM.FOLLOW;
                    dataToUpdate.$push = {
                        logs: {
                            status: APP_CONSTANTS.STATUS_ENUM.ACCEPTED,
                            createdAt: +new Date(),
                            actionBy: userData._id,
                            actionModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
                        }
                    };
                    otherFollowData = {
                        status : APP_CONSTANTS.STATUS_ENUM.FOLLOW,
                        sender: userData._id,
                        senderModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                        receiver: data.sender,
                        receiverModel:APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                        followType: APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_USER,
                        logs: [{
                            status: APP_CONSTANTS.STATUS_ENUM.FOLLOW,
                            createdAt: +new Date(),
                            actionBy: data.sender,
                            actionModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
                        }]
                    },
                    otherFollowDataUpdate = {
                        sender:  userData._id,
                        senderModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                        receiver: data.sender,
                        receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                        updatedDate: +new Date(),
                        status: APP_CONSTANTS.STATUS_ENUM.FOLLOW,
                        $push: {
                            logs: {
                                status: APP_CONSTANTS.STATUS_ENUM.FOLLOW,
                                createdDate: +new Date(),
                                actionBy: data.sender,
                                actionModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
                            }
                        }
                    }
                    let result = await Promise.all([
                        Dao.findAndUpdateWithPopulate(Models.follow, {_id: payload._id}, dataToUpdate, {
                            new: true,
                            lean: true
                        }, [{
                            path: 'sender',
                            select: 'firstName lastName deviceType deviceToken language',
                            model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
                        }]),
                    ]);
                    let followCriteria = {sender: userData._id, receiver: data.sender}
                    let userFollowData = await Dao.findOne(Models.follow, followCriteria, {}, {lean: true});
                    console.log({userFollowData, otherFollowData, otherFollowDataUpdate})
                    if(!userFollowData){
                        await Dao.saveData(Models.follow, otherFollowData)
                    }
                    else{
                        await Dao.findAndUpdate(Models.follow, {_id: userFollowData._id}, otherFollowDataUpdate, {lean: true, new: true})

                    }

                    let notificationMessage = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.FOLLOW_REQUEST_ACCEPTED, {
                        userName: `${userData.firstName} ${userData.lastName}`
                    })

                    

                    await Dao.updateMany(Models.notifications, {
                        receiver: result[0].sender,
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.FOLLOW_REQUEST_ACCEPTED,
                        followId: data._id,
                    }, {status: APP_CONSTANTS.STATUS_ENUM.DELETED}, {new: true});

                    let notificationDataSender = {
                        savePushData: {
                            title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.FOLLOW_REQUEST_ACCEPTED,
                            message: notificationMessage,
                            receiver: result[0].sender,
                            followId: data._id,
                            user: userData._id,
                            createdDate: +new Date(),
                            receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                            userType: APP_CONSTANTS.USER_TYPE.USER,
                            notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.FOLLOW_REQUEST_ACCEPTED
                        },
                        type: APP_CONSTANTS.USER_TYPE.USER,
                        deviceType: result[0].sender.deviceType ? result[0].deviceType : APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                        sendPushData: {
                            title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.FOLLOW_REQUEST_ACCEPTED[result[0].sender.language ? result[0].sender.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                            message: notificationMessage[result[0].sender.language ? result[0].sender.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                            notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.FOLLOW_REQUEST_ACCEPTED
                        },
                        deviceToken: result[0].deviceToken
                    };

                    await NotificationManager.sendNotifications(notificationDataSender, true);

                    let notificationMessageReceiver = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.STARTED_FOLLOWING, {
                        userName: `${result[0].sender.firstName} ${result[0].sender.lastName}`
                    });

                    let notificationDataReciever = {
                        savePushData: {
                            title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.STARTED_FOLLOWING,
                            message: notificationMessageReceiver,
                            receiver: userData._id,
                            user: result[0].sender,
                            followId: data._id,
                            receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                            userType: APP_CONSTANTS.USER_TYPE.USER,
                            notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.STARTED_FOLLOWING
                        },
                        type: APP_CONSTANTS.USER_TYPE.USER,
                        deviceType: userData.deviceType ? userData.deviceType : APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                        sendPushData: {
                            title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.STARTED_FOLLOWING[userData.language ? userData.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                            message: notificationMessageReceiver[userData.language ? userData.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                            notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.STARTED_FOLLOWING
                        },
                        deviceToken: userData.deviceToken
                    };

                    await NotificationManager.sendNotifications(notificationDataReciever, true);


                    await Dao.updateMany(Models.notifications, {
                        receiver: data.receiver,
                        followId: data._id,
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.FOLLOW_REQUEST
                    }, {status: APP_CONSTANTS.STATUS_ENUM.DELETED}, {new: true});

                    return {}
                } else {
                    dataToUpdate.status = APP_CONSTANTS.STATUS_ENUM.REJECTED;
                    dataToUpdate.$push = {
                        logs: {
                            status: APP_CONSTANTS.STATUS_ENUM.REJECTED,
                            createdAt: +new Date(),
                            actionBy: userData._id,
                            actionModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
                        }
                    };
                    await Promise.all([
                        Dao.findAndUpdate(Models.follow, {_id: payload._id}, dataToUpdate, {new: true, lean: true})
                    ]);
                    await Dao.updateMany(Models.notifications, {
                        receiver: data.receiver,
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.FOLLOW_REQUEST
                    }, {status: APP_CONSTANTS.STATUS_ENUM.DELETED}, {new: true});
                    return {}
                }
            }
        } else throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID

    } catch (e) {
        console.log(e)
        throw e
    }
};


const listFollowers = async (payload, userData) => {
    try {
        if (!payload.receiver) {
            payload.receiver = userData._id;
        }

        let criteria = {
            receiver: mongoose.Types.ObjectId(payload.receiver),
            status: APP_CONSTANTS.STATUS_ENUM.FOLLOW
        }, populate = [{
            path: 'sender',
            select: 'firstName lastName _id email profilePic email',
        }];

        let pipeline = [
            {$match: criteria},
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "sender",
                    as: "senderData"
                }
            },
            {
                $unwind: {
                    path: '$senderData',
                    preserveNullAndEmptyArrays: true
                }
            }
        ];

        if (payload.search) {
            pipeline.push({
                $match: {
                    $or: [{
                        "senderData.firstName": new RegExp(payload.search, 'i')
                    }, {
                        "senderData.lastName": new RegExp(payload.search, 'i')
                    }]
                }
            })
        }
        let count = await Dao.aggregateData(Models.follow, pipeline);

        pipeline.push({
            $lookup: {
                from: "follows",
                let: {
                    "senderId": "$sender"
                },
                pipeline: [
                    {
                        $match:
                            {
                                $expr:
                                    {
                                        $and:
                                            [
                                                {$eq: ["$receiver", "$$senderId"]},
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
        });

        if (payload.skip || payload.skip === 0 && payload.limit) {
            pipeline.push({$skip: parseInt(payload.skip)},
                {$limit: parseInt(payload.limit)})
        }

        pipeline.push({
            $project: {
                // sender: "$sender",
                sender: {
                    _id: "$senderData._id",
                    firstName: "$senderData.firstName",
                    lastName: "$senderData.lastName",
                    profilePic: "$senderData.profilePic",
                },
                receiver: "$receiver",
                createdDate: "$createdDate",
                updatedDate: "$updatedDate",
                followers: "$followers",
                followDone: "$followDone"
            }
        });

        let promise = [
            Dao.aggregateDataWithPopulate(Models.follow, pipeline, populate),
        ];
        let [data] = await Promise.all(promise);
        return {data, count: count.length}
    } catch (e) {
        throw e
    }
};

const listFollowersAndFollowings = async (payload, userData) => {
    try {
        let criteria = {
            $or: [{
                receiver: mongoose.Types.ObjectId(userData._id),
                followType: APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_USER
            }, {
                sender: mongoose.Types.ObjectId(userData._id),
                followType: APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_USER
            }],
            status: APP_CONSTANTS.STATUS_ENUM.FOLLOW
        }, populate = [{
            path: 'sender',
            select: 'firstName lastName _id email profilePic email',
        }, {
            path: 'receiver',
            select: 'firstName lastName _id email profilePic email',
        }, {
            path: 'otherPerson',
            select: 'firstName lastName _id email profilePic email',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
        }];

        let pipeline = [
            {$match: criteria},
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "sender",
                    as: "senderData"
                }
            },
            {
                $unwind: {
                    path: '$senderData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "receiver",
                    as: "receiverData"
                }
            },
            {
                $unwind: {
                    path: '$receiverData',
                    preserveNullAndEmptyArrays: true
                }
            },

        ];


        if (payload.search) {
            pipeline.push({
                $match: {
                    $or: [
                        {
                            "senderData.firstName": new RegExp(payload.search, 'i'),
                            "senderData._id": {$ne: mongoose.Types.ObjectId(userData._id)}
                        },
                        {
                            "senderData.lastName": new RegExp(payload.search, 'i'),
                            "senderData._id": {$ne: mongoose.Types.ObjectId(userData._id)}
                        },
                        {
                            "receiverData.firstName": new RegExp(payload.search, 'i'),
                            "receiverData._id": {$ne: mongoose.Types.ObjectId(userData._id)}
                        },
                        {
                            "receiverData.lastName": new RegExp(payload.search, 'i'),
                            "receiverData._id": {$ne: mongoose.Types.ObjectId(userData._id)}
                        }]
                }
            })
        }


        // pipeline.push(
        //     {
        //         $project: {
        //             receiver: "$receiverData._id",
        //             sender: "$senderData._id",
        //             "otherPerson": {
        //                 firstName: {$cond: [{$eq: ["$senderData._id", userData._id]}, "$receiverData.firstName", "$senderData.firstName"]},
        //                 lastName: {$cond: [{$eq: ["$senderData._id", userData._id]}, "$receiverData.lastName", "$senderData.lastName"]},
        //                 name: {$cond: [{$eq: ["$senderData.name", userData._id]}, "$receiverData.name", "$senderData.name"]},
        //                 vendorRegisterName: {$cond: [{$eq: ["$senderData._id", userData._id]}, "$receiverData.vendorRegisterName", "$senderData.vendorRegisterName"]},
        //                 email: {$cond: [{$eq: ["$senderData._id", userData._id]}, "$receiverData.email", "$senderData.email"]},
        //                 createdDate: "$createdDate",
        //                 updatedDate: "$updatedDate",
        //                 followers: "$followers",
        //                 followDone: "$followDone"
        //             }
        //         }
        //     }
        // );


        pipeline.push(
            {
                $project: {
                    receiver: "$receiverData._id",
                    sender: "$senderData._id",
                    "otherPerson": {
                        _id: {$cond: [{$eq: ["$senderData._id", userData._id]}, "$receiverData._id", "$senderData._id"]},
                        firstName: {$cond: [{$eq: ["$senderData._id", userData._id]}, "$receiverData.firstName", "$senderData.firstName"]},
                        lastName: {$cond: [{$eq: ["$senderData._id", userData._id]}, "$receiverData.lastName", "$senderData.lastName"]},
                        name: {$cond: [{$eq: ["$senderData.name", userData._id]}, "$receiverData.name", "$senderData.name"]},
                        vendorRegisterName: {$cond: [{$eq: ["$senderData._id", userData._id]}, "$receiverData.vendorRegisterName", "$senderData.vendorRegisterName"]},
                        email: {$cond: [{$eq: ["$senderData._id", userData._id]}, "$receiverData.email", "$senderData.email"]},
                    },
                    createdDate: "$createdDate",
                    updatedDate: "$updatedDate",
                    followers: "$followers",
                    followDone: "$followDone"
                }
            }
        );

        pipeline.push({
            $group: {
                _id: "$otherPerson._id",
                otherPerson: {
                    $first: "$otherPerson._id"
                },
                createdDate: {
                    $first: "$createdDate"
                },
                updatedDate: {
                    $first: "$updatedDate"
                },
                followers: {
                    $first: "$followers"
                },
                followDone: {
                    $first: "$followDone"
                },
                receiver: {
                    $first: "$receiver"
                },
                sender: {
                    $first: "$sender"
                },
            }
        });

        let count = await Dao.aggregateData(Models.follow, pipeline);

        if (payload.skip || payload.skip === 0 && payload.limit) {
            pipeline.push({$skip: parseInt(payload.skip)},
                {$limit: parseInt(payload.limit)})
        }

        console.log("Critrieen", pipeline)
        let promise = [
            Dao.aggregateDataWithPopulate(Models.follow, pipeline, populate),
        ];
        let [data] = await Promise.all(promise);
        return {data, count: count.length}
    } catch (e) {
        throw e
    }
};

const listFollowings = async (payload, userData) => {
    try {
        let criteria = {
            sender: mongoose.Types.ObjectId(userData._id),
            status: APP_CONSTANTS.STATUS_ENUM.FOLLOW
        }, option = {
            lean: true,
            ...(payload.skip && {skip: parseInt(payload.skip)}),
            ...(payload.limit && {limit: parseInt(payload.limit)}),
        }, projection = {
            logs: 0
        }, populate = [{
            path: 'sender',
            select: 'firstName lastName _id email vendorRegisterName name'
        }, {
            path: 'receiver',
            select: 'name firstName lastName _id vendorRegisterName hashTag'
        }];

        if (payload.type) {
            if (payload.type === APP_CONSTANTS.FEED_LIST_TYPE.VENDOR) {
                criteria.followType = APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR
            } else {
                criteria.followType = APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_USER
            }
        }

        let aggregatePipeline = [
            {
                $match: criteria
            },
            {
                $project: {
                    logs: 0
                }
            }];

        if (payload.searchHashTag) {
            aggregatePipeline.push({
                    $lookup: {
                        from: 'vendors',
                        localField: 'receiver',
                        foreignField: '_id',
                        as: 'vendorData'
                    }
                },
                {
                    $match: {
                        'vendorData.hashTag': new RegExp(payload.searchHashTag, 'i')
                    }
                },{
                    $project:{
                        vendorData:0
                    }
                })
        }

        let count = await Dao.aggregateData(Models.follow, aggregatePipeline)
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


        if (payload.type) {
            if (payload.type === APP_CONSTANTS.FEED_LIST_TYPE.VENDOR) {
                aggregatePipeline.push({
                    $lookup: {
                        from: "products",
                        let: {
                            "vendorId": "$receiver"
                        },
                        pipeline: [
                            {
                                $match:
                                    {
                                        $expr:
                                            {
                                                $and:
                                                    [
                                                        {$eq: ["$vendor", "$$vendorId"]},
                                                        {$eq: ["$status", APP_CONSTANTS.STATUS_ENUM.ACTIVE]},
                                                    ]
                                            }
                                    }
                            },
                            {$project: {_id: 1}}
                        ],
                        as: "products"
                    }
                }, {
                    $addFields: {
                        productCount: {$size: '$products'}
                    }
                }, {
                    $lookup: {
                        from: "categories",
                        let: {
                            "vendorId": "$receiver"
                        },
                        pipeline: [
                            {
                                $match:
                                    {
                                        $expr:
                                            {
                                                $and:
                                                    [
                                                        {$eq: ["$addedByVendor", "$$vendorId"]},
                                                        {$eq: ["$status", APP_CONSTANTS.STATUS_ENUM.ACTIVE]},
                                                    ]
                                            }
                                    }
                            },
                            {$project: {_id: 1, media: 1}}
                        ],
                        as: "collections"
                    }
                })
            }

        }

        let promise = [
            // Dao.populateData(Models.follow, criteria, projection, option, populate),
            Dao.aggregateDataWithPopulate(Models.follow, aggregatePipeline, populate)
        ];
        let [data] = await Promise.all(promise);
        return {data, count: count.length}
    } catch (e) {
        throw e
    }
};

const deleteChat = async (payload, userData) => {
    try {
        let c1 = {
            sender: userData._id,
            receiver: payload.otherPerson
        };
        let c2 = {
            receiver: userData._id,
            sender: payload.otherPerson
        };
        let criteria = {
            $or: [c1, c2]
        };
        let dataToUpdate = {
            $addToSet: {
                deletedFor: [{
                    id: userData._id,
                    by: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
                }, {
                    id: payload.otherPerson,
                    by: payload.followType === APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_USER ? APP_CONSTANTS.DATABASE.MODELS_NAME.USER : APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
                }]
            }
        };
        let updateChat = await Dao.updateMany(Models.chat, criteria, dataToUpdate, {multi: true});
        return {}
    } catch (e) {
        throw e
    }
}

module.exports = {
    followUnFollow: followUnFollow,
    listFollowings: listFollowings,
    listFollowers: listFollowers,
    acceptRejectFollowRequest: acceptRejectFollowRequest,
    listFollowersAndFollowings: listFollowersAndFollowings
}
