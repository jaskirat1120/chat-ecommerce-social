// constants imported
const RESPONSE_MESSAGES = require('../../config/constants').responseMessages;
const APP_CONSTANTS = require('../../config').constants.appDefaults;
const CONSTANTS = require('../../config').storageConf;

// local modules
const Dao = require('../../dao').queries;
const Models = require('../../models');
const mongoose = require('mongoose');


async function messageListingAggregate(payload, userData) {
    let c1 = {
        sender: mongoose.Types.ObjectId(payload.otherPerson),
        receiver: mongoose.Types.ObjectId(userData._id)
    };
    let c2 = {
        sender: mongoose.Types.ObjectId(userData._id),
        receiver: mongoose.Types.ObjectId(payload.otherPerson)
    };
    // let criteria = {
    //     $or: [c1, c2],
    // };

    let criteria = {
        $and: [{
            $or: [
                {
                    // deletedFor: {
                    //     $elemMatch: {
                    //         id: {
                    //             $ne: mongoose.Types.ObjectId(userData._id)
                    //         }
                    //     }
                    // }
                    "deletedFor.id": {
                        $ne: mongoose.Types.ObjectId(userData._id)
                    }
                },
                {
                    deletedFor: []
                }
            ]
        }, {$or: [c1, c2]}]
    }

    if (payload.lastId) {
        criteria._id = {
            $lt: mongoose.Types.ObjectId(payload.lastId)
        }
    }

    let populate = [
        {
            path: 'sender',
            select: 'firstName lastName profilePic name vendorRegisterName ownerPicture',
        },
        {
            path: 'receiver',
            select: 'firstName lastName profilePic name vendorRegisterName ownerPicture',
        }
    ];
    let pipeline = [
        {
            $match: criteria
        },
        {
            $sort: {"createdAt": -1}
        },
        {
            $lookup: {
                from: 'users',
                foreignField: '_id',
                localField: 'sender',
                as: 'senderUserData'
            }
        }, {
            $lookup: {
                from: 'users',
                foreignField: '_id',
                localField: 'receiver',
                as: 'receiverUserData'
            }
        },
        {
            $lookup: {
                from: 'vendors',
                foreignField: '_id',
                localField: 'sender',
                as: 'senderVendorData'
            }
        },
        {
            $lookup: {
                from: 'vendors',
                foreignField: '_id',
                localField: 'receiver',
                as: 'receiverVendorData'
            }
        },
        {
            $unwind: {
                path: "$receiverVendorData",
                preserveNullAndEmptyArrays: true
            },
        },
        {
            $unwind: {
                path: "$senderVendorData",
                preserveNullAndEmptyArrays: true
            },
        },
        {
            $unwind: {
                path: "$senderUserData",
                preserveNullAndEmptyArrays: true
            },
        },
        {
            $unwind: {
                path: "$receiverUserData",
                preserveNullAndEmptyArrays: true
            },
        }
    ];


    if (payload.skip) {
        pipeline.push({$skip: parseInt(payload.skip)});
    }


    if (payload.limit) {
        pipeline.push({$limit: payload.limit});
    }

    pipeline.push({
        $project: {
            year: {
                $year: "$createdAt"
            },
            month: {
                $month: "$createdAt"
            },
            day: {
                $dayOfWeek: "$createdAt"
            },
            date: {
                $dayOfMonth: '$createdAt'
            },
            id: {
                $dateToString: {
                    format: "%Y-%m-%d", date: "$createdAt"
                }
            },
            _id: 1,
            createdAt: 1,
            createdDate: 1,
            sender: {$ifNull: ['$senderVendorData', '$senderUserData']},
            receiver: {$ifNull: ['$receiverVendorData', '$receiverUserData']},
            message: 1,
            chatWith: 1,
            fileUrl: 1,
            messageType: 1,
            conversationId: 1
        }
    })

    pipeline.push({
        $group: {
            _id: {
                date: "$date",
                month: "$month",
                year: "$year",
                day: "$day",
                id: "$id"
            },
            chat: {
                $push: {
                    _id: "$_id",
                    // createdAt: "$createdAt",
                    createdDate: "$createdDate",
                    sender: {
                        _id: "$sender._id",
                        firstName: "$sender.firstName",
                        lastName: "$sender.lastName",
                        name: "$sender.name",
                        vendorRegisterName: "$sender.vendorRegisterName",
                        profilePic: "$sender.profilePic",
                        ownerPicture: "$sender.ownerPicture",
                    },
                    receiver: {
                        _id: "$receiver._id",
                        firstName: "$receiver.firstName",
                        lastName: "$receiver.lastName",
                        name: "$receiver.name",
                        vendorRegisterName: "$receiver.vendorRegisterName",
                        profilePic: "$receiver.profilePic",
                        ownerPicture: "$receiver.ownerPicture",
                    },
                    message: "$message",
                    fileUrl: "$fileUrl",
                    chatWith: "$chatWith",
                    messageType: "$messageType",
                    conversationId: "$conversationId"
                }
            }
        }

    }, {
        $sort: {
            '_id.id': -1
        }
    })


    let countCriteria = JSON.parse(JSON.stringify(criteria))
    if (payload.lastId) {
        delete countCriteria._id
    }
    let count = await Dao.countDocuments(Models.chat, countCriteria);

    console.log({pipeline: JSON.stringify(pipeline)})
    let data = await Dao.aggregateDataWithPopulate(Models.chat, pipeline, populate);
    let readMessages = await Dao.updateMany(Models.chat, criteria, {
        $addToSet: {
            readBy: {
                id: userData._id,
                by: userData.userType === APP_CONSTANTS.USER_TYPE.USER? APP_CONSTANTS.DATABASE.MODELS_NAME.USER: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
            }
        }
    }, {
        multi: true
    });

    let loadMore = false;
    if (data.length) {
        let dataLength = data.length
        console.log({dataLength})
        if (data[dataLength - 1].chat.length) {
            let chatLength = data[dataLength - 1].chat.length
            console.log({chatLength})
            console.log(data[dataLength - 1].chat[chatLength - 1])
            let id = data[dataLength - 1].chat[chatLength - 1]._id
            console.log({id})
            // let query = {
            //     _id: {$lt: id},
            //     $or: [c1, c2],
            // }

            let query = {
                _id: {$lt: id},
                $and: [{
                    $or: [
                        {
                            // deletedFor: {
                            //     $elemMatch: {
                            //         id: {
                            //             $ne: mongoose.Types.ObjectId(userData._id)
                            //         }
                            //     }
                            // }
                            "deletedFor.id": {
                                $ne: mongoose.Types.ObjectId(userData._id)
                            }
                        },
                        {
                            deletedFor: []
                        }
                    ]
                }, {$or: [c1, c2]}]
            }
            let findNextData = await Dao.findOne(Models.chat, query, {_id: 1}, {lean: true})
            if (findNextData) loadMore = true
        }
    }

    return {data: data, count: count, loadMore}

}

const chatListing = async (payload, userData) => {
    try {
        let c1 = {receiver: mongoose.Types.ObjectId(userData._id)};
        let c2 = {sender: mongoose.Types.ObjectId(userData._id)};
        // let criteria = {
        //     $or: [c1, c2],
        // };

        let criteria = {
            $and: [{
                $or: [
                    {
                        // deletedFor: {
                        //     $elemMatch: {
                        //         id: {
                        //             $ne: mongoose.Types.ObjectId(userData._id)
                        //         }
                        //     }
                        // }
                        "deletedFor.id": {
                            $ne: mongoose.Types.ObjectId(userData._id)
                        }
                    },
                    {
                        deletedFor: []
                    }
                ]
            }, {$or: [c1, c2]}]
        }

        if (payload.chatWith) criteria.chatWith = payload.chatWith;

        let aggregatePipeline = [
            {
                $match: criteria
            },
            {
                $sort: {
                    "createdAt": -1
                }
            },
            {
                $lookup: {
                    from: 'users',
                    foreignField: '_id',
                    localField: 'sender',
                    as: 'senderUserData'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    foreignField: '_id',
                    localField: 'receiver',
                    as: 'receiverUserData'
                }
            },
            {
                $lookup: {
                    from: 'vendors',
                    foreignField: '_id',
                    localField: 'sender',
                    as: 'senderVendorData'
                }
            },
            {
                $lookup: {
                    from: 'vendors',
                    foreignField: '_id',
                    localField: 'receiver',
                    as: 'receiverVendorData'
                }
            },
            {
                $unwind: {
                    path: "$receiverVendorData",
                    preserveNullAndEmptyArrays: true
                },
            },
            {
                $unwind: {
                    path: "$senderVendorData",
                    preserveNullAndEmptyArrays: true
                },
            },
            {
                $unwind: {
                    path: "$senderUserData",
                    preserveNullAndEmptyArrays: true
                },
            },
            {
                $unwind: {
                    path: "$receiverUserData",
                    preserveNullAndEmptyArrays: true
                },
            },
            {
                $group: {
                    _id: "$conversationId",
                    chat: {
                        $first: "$$ROOT"
                    },
                    receiver: {
                        $first: "$receiver"
                    },
                    receiverModel: {
                        $first: "$receiverModel"
                    },
                    sender: {
                        $first: "$sender"
                    },
                    senderModel: {
                        $first: "$senderModel"
                    },
                    receiverVendorData: {
                        $first: "$receiverVendorData"
                    },
                    senderUserData: {
                        $first: "$senderUserData"
                    },
                    receiverUserData: {
                        $first: "$receiverUserData"
                    },
                    senderVendorData: {
                        $first: "$senderVendorData"
                    }
                }
            },
            {
                $project: {
                    chat: 1,
                    // "otherPerson": {$cond: [{$eq: ["$sender", userData._id]}, "$receiver", "$sender"]},
                    // receiver: 1,
                    // sender: 1,
                    sender: {$ifNull: ['$senderVendorData', '$senderUserData']},
                    receiver: {$ifNull: ['$receiverVendorData', '$receiverUserData']},
                    receiverModel: 1,
                    senderModel: 1
                }
            }, {
                $project: {
                    chat: 1,
                    "otherPerson": {$cond: [{$eq: ["$sender._id", userData._id]}, "$receiver._id", "$sender._id"]},
                    "other": {
                        firstName: {$cond: [{$eq: ["$sender._id", userData._id]}, "$receiver.firstName", "$sender.firstName"]},
                        lastName: {$cond: [{$eq: ["$sender._id", userData._id]}, "$receiver.lastName", "$sender.lastName"]},
                        name: {$cond: [{$eq: ["$sender.name", userData._id]}, "$receiver.name", "$sender.name"]},
                        vendorRegisterName: {$cond: [{$eq: ["$sender._id", userData._id]}, "$receiver.vendorRegisterName", "$sender.vendorRegisterName"]}
                    },
                    receiver: 1,
                    sender: 1,
                    // sender: {$ifNull: ['$senderVendorData', '$senderUserData']},
                    // receiver: {$ifNull: ['$receiverVendorData', '$receiverUserData']},
                    receiverModel: 1,
                    senderModel: 1
                }
            }]

        if (payload.search) {
            aggregatePipeline.push({
                $match: {
                    $or: [{
                        "other.name": new RegExp(payload.search, 'i'),
                    }, {
                        "other.firstName": new RegExp(payload.search, 'i'),
                    }, {
                        "other.lastName": new RegExp(payload.search, 'i'),
                    }, {
                        "other.vendorRegisterName": new RegExp(payload.search, 'i'),
                    }]
                }
            })
        }

        aggregatePipeline.push({
            $project: {
                chat: 1,
                otherPerson: 1,
                sender: {
                    _id: "$sender._id",
                    firstName: "$sender.firstName",
                    lastName: "$sender.lastName",
                    name: "$sender.name",
                    vendorRegisterName: "$sender.vendorRegisterName",
                    profilePic: "$sender.profilePic",
                    ownerPicture: "$sender.ownerPicture",
                },
                receiver: {
                    _id: "$receiver._id",
                    firstName: "$receiver.firstName",
                    lastName: "$receiver.lastName",
                    name: "$receiver.name",
                    vendorRegisterName: "$receiver.vendorRegisterName",
                    profilePic: "$receiver.profilePic",
                    ownerPicture: "$receiver.ownerPicture",
                },
            }
        })

        let count = await Dao.aggregateData(Models.chat, aggregatePipeline)

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

        let populate = [
            {
                path: 'sender1',
                select: 'firstName lastName profilePic name vendorRegisterName ownerPicture',
            },
            {
                path: 'receiver1',
                select: 'firstName lastName profilePic name vendorRegisterName ownerPicture',
            }
        ];

        if (payload.chatWith) {
            populate.push({
                path: 'otherPerson',
                select: 'firstName lastName profilePic name vendorRegisterName ownerPicture',
                model: payload.chatWith === APP_CONSTANTS.FEED_LIST_TYPE.USER ? APP_CONSTANTS.DATABASE.MODELS_NAME.USER : APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
            })
        }
        else{
            populate.push({
                path: 'otherPerson',
                select: 'firstName lastName profilePic name vendorRegisterName ownerPicture',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
            })
        }
        let chatData = await Dao.aggregateDataWithPopulate(Models.chat, aggregatePipeline, populate)

        return {count: count.length, chatData}
    } catch (e) {
        throw e
    }
}

const deleteChat = async (payload, userData) => {
    try {
        let c1 = {
            sender: userData._id,
            receiver: payload.otherPerson
        }
        let c2 = {
            receiver: userData._id,
            sender: payload.otherPerson
        }
        let criteria = {
            $or: [c1, c2]
        };
        let dataToUpdate = {
            $addToSet: {
                deletedFor: {
                    id: userData._id,
                    by: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
                }
            }
        };
        let updateChat = await Dao.updateMany(Models.chat, criteria, dataToUpdate, {multi: true})
        return {}
    } catch (e) {
        throw e
    }
}

const muteChat = async (payload, userData) => {
    try {
        let c1 = {
            sender: userData._id,
            receiver: payload.otherPerson
        }
        let c2 = {
            receiver: userData._id,
            sender: payload.otherPerson
        }
        let criteria = {
            $or: [c1, c2]
        };
        let dataToUpdate = {}
        if (payload.status === APP_CONSTANTS.STATUS_ENUM.MUTE) {
            dataToUpdate = {
                $addToSet: {
                    muteBy: {
                        id: userData._id,
                        by: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
                    }
                }
            };
        } else {
            dataToUpdate = {
                $pull: {
                    muteBy: {
                        id: userData._id
                    }
                }
            };
        }
        let updateChat = await Dao.updateMany(Models.chat, criteria, dataToUpdate, {multi: true})
        return {}
    } catch (e) {
        throw e
    }
}

async function messageListingAggregateApp(payload, userData) {
    let c1 = {
        sender: mongoose.Types.ObjectId(payload.otherPerson),
        receiver: mongoose.Types.ObjectId(userData._id)
    };
    let c2 = {
        sender: mongoose.Types.ObjectId(userData._id),
        receiver: mongoose.Types.ObjectId(payload.otherPerson)
    };
    let criteria = {
        $and: [{
            $or: [
                {
                    "deletedFor.id": {
                        $ne: mongoose.Types.ObjectId(userData._id)
                    }
                },
                {
                    deletedFor: []
                }
            ]
        }, {$or: [c1, c2]}]
    }

    if (payload.lastId) {
        criteria._id = {
            $lt: mongoose.Types.ObjectId(payload.lastId)
        }
    }

    let populate = [
        {
            path: 'sender',
            select: 'firstName lastName profilePic name vendorRegisterName ownerPicture',
        },
        {
            path: 'receiver',
            select: 'firstName lastName profilePic name vendorRegisterName ownerPicture',
        }
    ];
    let pipeline = [
        {
            $match: criteria
        },
        {
            $sort: {"createdAt": -1}
        },
        {
            $lookup: {
                from: 'users',
                foreignField: '_id',
                localField: 'sender',
                as: 'senderUserData'
            }
        }, {
            $lookup: {
                from: 'users',
                foreignField: '_id',
                localField: 'receiver',
                as: 'receiverUserData'
            }
        },
        {
            $lookup: {
                from: 'vendors',
                foreignField: '_id',
                localField: 'sender',
                as: 'senderVendorData'
            }
        },
        {
            $lookup: {
                from: 'vendors',
                foreignField: '_id',
                localField: 'receiver',
                as: 'receiverVendorData'
            }
        },
        {
            $unwind: {
                path: "$receiverVendorData",
                preserveNullAndEmptyArrays: true
            },
        },
        {
            $unwind: {
                path: "$senderVendorData",
                preserveNullAndEmptyArrays: true
            },
        },
        {
            $unwind: {
                path: "$senderUserData",
                preserveNullAndEmptyArrays: true
            },
        },
        {
            $unwind: {
                path: "$receiverUserData",
                preserveNullAndEmptyArrays: true
            },
        }
    ];


    if (payload.skip) {
        pipeline.push({$skip: parseInt(payload.skip)});
    }


    if (payload.limit) {
        pipeline.push({$limit: payload.limit});
    }

    pipeline.push({
        $project: {
            _id: 1,
            createdAt: 1,
            createdDate: 1,
            sender: {$ifNull: ['$senderVendorData', '$senderUserData']},
            receiver: {$ifNull: ['$receiverVendorData', '$receiverUserData']},
            message: 1,
            chatWith: 1,
            fileUrl: 1,
            messageType: 1,
            conversationId: 1
        }
    })

    let countCriteria = JSON.parse(JSON.stringify(criteria))
    if (payload.lastId) {
        delete countCriteria._id
    }
    let count = await Dao.countDocuments(Models.chat, countCriteria);

    console.log({pipeline: JSON.stringify(pipeline)})
    let data = await Dao.aggregateDataWithPopulate(Models.chat, pipeline, populate);

    let readMessages = await Dao.updateMany(Models.chat, criteria, {
        $addToSet: {
            readBy: {
                id: userData._id,
                by: userData.userType === APP_CONSTANTS.USER_TYPE.USER? APP_CONSTANTS.DATABASE.MODELS_NAME.USER: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
            }
        }
    }, {
        multi: true
    });



    return {data: data, count: count, /*loadMore*/}

}

module.exports = {
    messageListingAggregate: messageListingAggregate,
    messageListingAggregateApp: messageListingAggregateApp,
    chatListing: chatListing,
    deleteChat: deleteChat,
    muteChat: muteChat
};
