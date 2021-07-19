// constants imported
const RESPONSE_MESSAGES = require('../../../config/constants').responseMessages;
const APP_CONSTANTS = require('../../../config').constants.appDefaults;
const CONSTANTS = require('../../../config').storageConf;

// local modules
const Dao = require('../../../dao').queries;
const Models = require('../../../models');
const mongoose = require('mongoose');

let getFeedListing = async (payload, userData, following) => {
    let criteria = {
        status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
    };

    if (userData) {
        if (payload.type) {
            if (payload.type === APP_CONSTANTS.FEED_LIST_TYPE.USER) {
                criteria.$and = [];
                let orCriteria = [{
                    privacyType: APP_CONSTANTS.PRIVACY_TYPE.PUBLIC,
                    user: {$exists: true}
                }];
                orCriteria.push(
                    {
                        privacyType: APP_CONSTANTS.PRIVACY_TYPE.PRIVATE,
                        user: {$in: following}
                    },
                    {
                        privacyType: APP_CONSTANTS.PRIVACY_TYPE.SELECTIVE,
                        $or: [{selectedId: mongoose.Types.ObjectId(userData._id)}, {user: mongoose.Types.ObjectId(userData._id)}],
                        user: {$exists: true}
                    },
                    {
                        privacyType: APP_CONSTANTS.PRIVACY_TYPE.PRIVATE,
                        user: {$in: [userData._id]}
                    },
                );
                criteria.$and.push({
                    $or: orCriteria
                });
                criteria.$and.push(
                    {
                        $or: [
                            {
                                hiddenFor: {
                                    $elemMatch: {
                                        id: {
                                            $ne: mongoose.Types.ObjectId(userData._id)
                                        }
                                    }
                                }
                            },
                            {
                                hiddenFor: []
                            },
                            {
                                hiddenFor: {
                                    $exists: false
                                }
                            }
                        ]
                    }
                );
                criteria.$and.push(
                    {
                        $or: [
                            {
                                reportBy: {
                                    $elemMatch: {
                                        id: {
                                            $ne: mongoose.Types.ObjectId(userData._id)
                                        }
                                    }
                                }
                            },
                            {
                                reportBy: []
                            },
                            {
                                reportBy: {
                                    $exists: false
                                }
                            }
                        ]
                    }
                )
            } else if (payload.type === APP_CONSTANTS.FEED_LIST_TYPE.VENDOR) {
                criteria.$and = [];
                let orCriteria = [{
                    privacyType: APP_CONSTANTS.PRIVACY_TYPE.PUBLIC,
                    vendor: {$exists: true}
                }];
                orCriteria.push(
                    {
                        privacyType: APP_CONSTANTS.PRIVACY_TYPE.PRIVATE,
                        vendor: {$in: following}
                    },
                    {
                        privacyType: APP_CONSTANTS.PRIVACY_TYPE.SELECTIVE,
                        $or: [{selectedId: mongoose.Types.ObjectId(userData._id)}, {user: mongoose.Types.ObjectId(userData._id)}],
                        vendor: {$exists: true}
                    }
                );

                criteria.$and.push({
                    $or: orCriteria
                });
                criteria.$and.push({
                    $or: [
                        {
                            hiddenFor: {
                                $elemMatch: {
                                    id: {
                                        $ne: mongoose.Types.ObjectId(userData._id)
                                    }
                                }
                            }
                        },
                        {
                            hiddenFor: []
                        },
                        {
                            hiddenFor: {
                                $exists: false
                            }
                        }]
                });
                criteria.$and.push({
                    $or: [
                        {
                            reportBy: {
                                $elemMatch: {
                                    id: {
                                        $ne: mongoose.Types.ObjectId(userData._id)
                                    }
                                }
                            }
                        },
                        {
                            reportBy: []
                        },
                        {
                            reportBy: {
                                $exists: false
                            }
                        }]
                })
            }
        } else {
            let orCriteria = [];
            criteria.$and = [];
            orCriteria.push({
                privacyType: APP_CONSTANTS.PRIVACY_TYPE.PRIVATE,
                vendor: {$in: following}
            });
            orCriteria.push({
                privacyType: APP_CONSTANTS.PRIVACY_TYPE.PRIVATE,
                user: {$in: following}
            });

            criteria.$and.push(
                {
                    $or: orCriteria
                },
                {
                    $or: [
                        {
                            hiddenFor: {
                                $elemMatch: {
                                    id: {
                                        $ne: mongoose.Types.ObjectId(userData._id)
                                    }
                                }
                            }
                        },
                        {
                            hiddenFor: []
                        },
                        {
                            hiddenFor: {
                                $exists: false
                            }
                        }]
                },
                {
                    $or: [
                        {
                            reportBy: {
                                $elemMatch: {
                                    id: {
                                        $ne: mongoose.Types.ObjectId(userData._id)
                                    }
                                }
                            }
                        },
                        {
                            reportBy: []
                        },
                        {
                            reportBy: {
                                $exists: false
                            }
                        }]
                }
            )
        }
    } else {
        if (payload.type) {
            if (payload.type === APP_CONSTANTS.FEED_LIST_TYPE.USER) {
                let orCriteria = [{
                    privacyType: APP_CONSTANTS.PRIVACY_TYPE.PUBLIC,
                    user: {$exists: true}
                }];
                criteria.$and = [{
                    $or: orCriteria
                }]
            } else if (payload.type === APP_CONSTANTS.FEED_LIST_TYPE.VENDOR) {
                let orCriteria = [{
                    privacyType: APP_CONSTANTS.PRIVACY_TYPE.PUBLIC,
                    vendor: {$exists: true}
                }];
                criteria.$and = [{
                    $or: orCriteria
                }]
            }
        }
    }

    if (payload.section && payload.section === APP_CONSTANTS.SECTION.PROFILE)
        criteria.user = mongoose.Types.ObjectId(userData._id);

    if (payload.user) {
        delete criteria.$or;
        delete criteria.$and;
        criteria.user = mongoose.Types.ObjectId(payload.user);
    }
    if (payload.hashTag) criteria.hashTag = {$in: payload.hashTag};

    let skip = {
        $skip: parseInt(payload.skip)
    }, limit = {
        $limit: parseInt(payload.limit)
    };

    let aggregatePipeline = [
        {$match: criteria},
        {
            $sort: {
                _id: -1
            }
        }
    ];


    if (payload.skip) {
        aggregatePipeline.push(skip)
    }

    if (payload.limit) {
        aggregatePipeline.push(limit)
    }


    if (userData) {
        aggregatePipeline.push({
            $lookup: {
                from: 'reactions',
                let: {feedId: '$_id'},
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [
                                {$eq: ["$feed", "$$feedId"]},
                                {$eq: ["$user", mongoose.Types.ObjectId(userData._id)]},
                                {$eq: ["$status", APP_CONSTANTS.STATUS_ENUM.LIKE]},
                            ]

                        }
                    }
                }, {
                    $project: {
                        _id: 1
                    }
                }],
                as: "postLike"
            }
        });
        if (payload.type || payload.user) {
            let pipelineLet = {};
            if ((payload.type && payload.type === APP_CONSTANTS.FEED_LIST_TYPE.VENDOR)) {
                pipelineLet = {
                    receiverId: '$vendor'
                };
            } else if ((payload.type && payload.type === APP_CONSTANTS.FEED_LIST_TYPE.USER) || payload.user) {
                pipelineLet = {
                    receiverId: '$user'
                };
            }
            aggregatePipeline.push({
                $lookup: {
                    from: 'follows',
                    let: pipelineLet,
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    {$eq: ["$receiver", "$$receiverId"]},
                                    {$eq: ["$sender", mongoose.Types.ObjectId(userData._id)]},
                                    {$or: [{$eq: ["$status", APP_CONSTANTS.STATUS_ENUM.FOLLOW]}, {$eq: ["$status", APP_CONSTANTS.STATUS_ENUM.FOLLOW_REQUEST]}]},
                                ]
                            }
                        }
                    }, {
                        $project: {
                            _id: 1
                        }
                    }],
                    as: "follows"
                }
            })
        }

        aggregatePipeline.push({
            $addFields: {
                likedByUser: {$size: "$postLike"}
            }
        }, {
            $addFields: {
                followByUser: {$size: "$follows"}
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
        }, {
            $addFields: {
                likeDone: {
                    $cond: {
                        if: {$gt: ['$likedByUser', 0]},
                        then: true,
                        else: false
                    }
                }
            }
        })
    } else {
        aggregatePipeline.push({
            $addFields: {
                likeDone: false
            }
        }, {
            $addFields: {
                followDone: false
            }
        })
    }


    let populate = [
        {
            path: 'user',
            select: 'firstName lastName profilePic',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
        },
        {
            path: 'selectedId',
            select: 'firstName lastName profilePic email',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
        },
        {
            path: 'vendor',
            select: 'firstName lastName name vendorRegisterName ownerPicture',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
        },
        {
            path: 'vendorId',
            select: 'firstName lastName name vendorRegisterName ownerPicture banner hashTag',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
        },
        {
            path: 'discount',
            select: 'code name description value expiryDate',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.OFFER_PROMO
        },
        {
            path: 'productId',
            select: 'title description vendor images',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS,
            populate: [{
                path: 'vendor',
                select: 'firstName lastName name vendorRegisterName ownerPicture banner',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
            }]
        },
        {
            path: 'taggedVendors',
            select: 'firstName lastName name profilePic email banner ownerPicture hashTag vendorRegisterName',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
        },
        {
            path: 'postId',
            select: 'media mediaType user vendor caption',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.FEEDS,
            populate: [
                {
                    path: 'vendor',
                    select: 'firstName lastName name vendorRegisterName ownerPicture banner',
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
        }];

    console.log("aggregatePipelineaggregatePipelineaggregatePipeline", JSON.stringify(aggregatePipeline))
    let promise = await Dao.aggregateDataWithPopulate(Models.feeds, aggregatePipeline, populate);
    let count = await Dao.countDocuments(Models.feeds, criteria);

    return {data: promise, count: count}
};


const feedDetails = async (payload, userData)=>{
    try{
        let criteria = {
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            _id: mongoose.Types.ObjectId(payload.feedId)
        };

        let skip = {
            $skip: parseInt(payload.skip)
        }, limit = {
            $limit: parseInt(payload.limit)
        };
    
        let aggregatePipeline = [
            {$match: criteria},
            {
                $sort: {
                    _id: -1
                }
            }
        ];
    
    
        if (payload.skip) {
            aggregatePipeline.push(skip)
        }
    
        if (payload.limit) {
            aggregatePipeline.push(limit)
        }
    
    
        if (userData) {
            aggregatePipeline.push({
                $lookup: {
                    from: 'reactions',
                    let: {feedId: '$_id'},
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    {$eq: ["$feed", "$$feedId"]},
                                    {$eq: ["$user", mongoose.Types.ObjectId(userData._id)]},
                                    {$eq: ["$status", APP_CONSTANTS.STATUS_ENUM.LIKE]},
                                ]
    
                            }
                        }
                    }, {
                        $project: {
                            _id: 1
                        }
                    }],
                    as: "postLike"
                }
            });
            if (payload.type || payload.user || payload.feedId) {
                let pipelineLet = {
                    receiverId: '$user'
                };
                if ((payload.type && payload.type === APP_CONSTANTS.FEED_LIST_TYPE.VENDOR)) {
                    pipelineLet = {
                        receiverId: '$vendor'
                    };
                } else if ((payload.type && payload.type === APP_CONSTANTS.FEED_LIST_TYPE.USER) || payload.user) {
                    pipelineLet = {
                        receiverId: '$user'
                    };
                }
                aggregatePipeline.push({
                    $lookup: {
                        from: 'follows',
                        let: pipelineLet,
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        {$eq: ["$receiver", "$$receiverId"]},
                                        {$eq: ["$sender", mongoose.Types.ObjectId(userData._id)]},
                                        {$or: [{$eq: ["$status", APP_CONSTANTS.STATUS_ENUM.FOLLOW]}, {$eq: ["$status", APP_CONSTANTS.STATUS_ENUM.FOLLOW_REQUEST]}]},
                                    ]
                                }
                            }
                        }, {
                            $project: {
                                _id: 1
                            }
                        }],
                        as: "follows"
                    }
                })
            }
    
            aggregatePipeline.push({
                $addFields: {
                    likedByUser: {$size: "$postLike"}
                }
            }, {
                $addFields: {
                    followByUser: {$size: "$follows"}
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
            }, {
                $addFields: {
                    likeDone: {
                        $cond: {
                            if: {$gt: ['$likedByUser', 0]},
                            then: true,
                            else: false
                        }
                    }
                }
            })
        } else {
            aggregatePipeline.push({
                $addFields: {
                    likeDone: false
                }
            }, {
                $addFields: {
                    followDone: false
                }
            })
        }
    
    
        let populate = [
            {
                path: 'user',
                select: 'firstName lastName profilePic',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
            },
            {
                path: 'selectedId',
                select: 'firstName lastName profilePic email',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
            },
            {
                path: 'vendor',
                select: 'firstName lastName name vendorRegisterName ownerPicture',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
            },
            {
                path: 'vendorId',
                select: 'firstName lastName name vendorRegisterName ownerPicture banner hashTag',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
            },
            {
                path: 'productId',
                select: 'title description vendor images',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS,
                populate: [{
                    path: 'vendor',
                    select: 'firstName lastName name vendorRegisterName ownerPicture banner',
                    model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
                }]
            },
            {
                path: 'taggedVendors',
                select: 'firstName lastName name profilePic email banner ownerPicture hashTag vendorRegisterName',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
            },
            {
                path: 'postId',
                select: 'media mediaType user vendor caption',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.FEEDS,
                populate: [
                    {
                        path: 'vendor',
                        select: 'firstName lastName name vendorRegisterName ownerPicture banner',
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
            }];
    
        console.log("aggregatePipelineaggregatePipelineaggregatePipeline", JSON.stringify(aggregatePipeline))
        let promise = await Dao.aggregateDataWithPopulate(Models.feeds, aggregatePipeline, populate);
        let count = await Dao.countDocuments(Models.feeds, criteria);
    
        return {data: promise[0]?promise[0]:null, count: count}
    }
    catch(e){
        throw e
    }
}


module.exports = {
    getFeedListing: getFeedListing,
    feedDetails: feedDetails
}
