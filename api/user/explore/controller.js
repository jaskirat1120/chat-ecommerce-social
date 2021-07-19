// constants imported
const APP_CONSTANTS = require('../../../config').constants.appDefaults;

// local modules
const CategoryHelpers = require('../../helper-functions/categories');
const ProductHelpers = require('../../helper-functions/products');
const UniversalFunctions = require('../../../utils/universal-functions');
const mongoose = require('mongoose');
const moment = require('moment');
const dao = require('../../../dao');
const Models = require('../../../models');
const {populateData, aggregateData, aggregateDataWithPopulate} = require('../../../dao/queries');

let homeApi = async (payload, userData, ipInfo) => {
    try {
        let promises = [];
        /////////     Category Listing    //////////

        let criteriaForCategories = {
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            $or: [{parentId: null}, {parentId: []}],
            type: APP_CONSTANTS.CATEGORY_TYPE.CATEGORIES
        };
        promises.push(Dao.getData(Models.categories, criteriaForCategories, {}, {
            lean: true,
            limit: 4,
            sort: {dailyVisits: -1}
        }));

        promises.push(Dao.countDocuments(Models.categories, criteriaForCategories));
        /////////     Category Listing    //////////

        //////////   Trending Social posts //////////
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
        if (userData) {
            trendingFeedCriteria.$and.push(
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
            trendingFeedCriteria.$and.push(
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
        }

        let aggregatePipeline = [
            {$match: trendingFeedCriteria},
            {
                $sort: {
                    likes: -1,
                    comments: -1
                }
            },
            {
                $limit: payload.trendingSocialPostsLimit
            }
        ];

        if (userData) {
            aggregatePipeline.push({
                $lookup: {
                    from: 'follows',
                    let: {receiverId: '$user'},
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
            });

            aggregatePipeline.push(
                {
                    $addFields: {
                        followByUser: {$size: "$follows"}
                    }
                },
                {
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
            aggregatePipeline.push(
                {
                    $addFields: {
                        followDone: false
                    }
                })
        }

        promises.push(Dao.aggregateDataWithPopulate(Models.feeds, aggregatePipeline, [{
            path: 'user',
            select: 'firstName lastName profilePic'
        }]));
        promises.push(Dao.countDocuments(Models.feeds, trendingFeedCriteria));

        ////////////////////////////////////////////


        //////////// Discount Offers ///////////

        let offerCriteria = {
            status: {$in: [APP_CONSTANTS.STATUS_ENUM.ACTIVE]},
            type: APP_CONSTANTS.COMMON_SERVICES_TYPE.DISCOUNT_OFFER
        };

        promises.push(Dao.getData(Models.commonServices, offerCriteria, {}, {
            lean: true,
            limit: 4
        }));
        promises.push(Dao.countDocuments(Models.commonServices, offerCriteria));

        ///////////////    Admin Ads   /////////////////////////
        let adminAdCriteria = {
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            type: APP_CONSTANTS.COMMON_SERVICES_TYPE.VENDOR_ADMIN_AD
        };

        promises.push(Dao.getData(Models.commonServices, adminAdCriteria, {
            name: 1,
            media: 1,
            mediaType: 1,
            description: 1,
            duration: 1,
            fontTypeName: 1,
            fontSizeName: 1,
            fontColorName: 1,
            fontLocationName: 1,
            fontTypeDescription: 1,
            fontSizeDescription: 1,
            fontColorDescription: 1,
            fontLocationDescription: 1,
        }, {
            lean: true,
            limit: 4
        }));

        promises.push(Dao.countDocuments(Models.commonServices, adminAdCriteria));

        ///////////////    //////////////////////

        let vendorAd = {
            startDate: {$lte: +new Date()},
            endDate: {$gte: +new Date()},
            type: APP_CONSTANTS.PLAN_TYPE.ELITE_AD,
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            isAdminApproved: true
            // createdDate: {$gte: +moment(), $lte: +moment().add(24, 'hours')}
        };
        let aggregateArray = [{
            $match: vendorAd
        }];
        if (payload.vendorAdLimit) {
            aggregateArray.push({
                $limit: payload.vendorAdLimit
            })
        }


        aggregateArray.push({
            $lookup: {
                from: 'vendors',
                localField: 'vendor',
                foreignField: '_id',
                as: 'vendor'
            }
        }, {
            $unwind: {
                path: '$vendor',
                preserveNullAndEmptyArrays: true
            }
        }, {
            $match: {
                'vendor.goLive': true,
                'vendor.isAdminVerified': true
            }
        });

        aggregateArray.push({
            $project: {
                vendor: {
                    _id: '$vendor._id',
                    vendorRegisterName: '$vendor.vendorRegisterName',
                    name: '$vendor.name',
                    firstName: '$vendor.firstName',
                    lastName: '$vendor.lastName',
                    hashTag: '$vendor.hashTag',
                },
                plan: 1,
                name: 1,
                description: 1,
                mediaType: 1,
                media: 1,
                textNameSize: 1,
                textDescriptionSize: 1,
                textColor: 1
            }
        });

        promises.push(Dao.aggregateData(Models.subscriptionLogs, aggregateArray));
        promises.push(Dao.countDocuments(Models.subscriptionLogs, vendorAd));

        ////////////////////////////////

        let [popularCategories, categoryCount, /*trendingVendors, vendorCount,*/ trendingSocialPosts, postCount, discountOffers, offerCount, adminAds, adminAdCount, vendorAds, vendorAdCount] = await Promise.all(promises);


        let findLog = await Dao.findOne(Models.commonLogs, {
            date: moment().format('LL'),
            ip: ipInfo.remoteAddress,
            type: APP_CONSTANTS.COMMON_LOGS.WEBSITE_VISIT,
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE
        }, {
            _id: 1
        }, {lean: true});
        if (findLog) {
            let update = {
                visitor: 1
            };
            if (findLog.visitor < 5) {
                update.restrictedVisit = 1
            }
            await Dao.findAndUpdate(Models.commonLogs, {
                _id: findLog._id,
            }, {$inc: update}, {lean: true})
        } else {
            await Dao.saveData(Models.commonLogs, {
                visitor: 1,
                ip: ipInfo.remoteAddress,
                type: APP_CONSTANTS.COMMON_LOGS.WEBSITE_VISIT,
                date: moment().format('LL')
            }, {lean: true})
        }

        return {
            popularCategories,
            categoryCount,
            trendingSocialPosts,
            postCount,
            discountOffers,
            offerCount,
            adminAds,
            adminAdCount,
            vendorAds,
            vendorAdCount
        }
    } catch (e) {
        throw e
    }
};

let listVendors = async (payload, userData, ipInfo) => {
    try {

        let criteriaForVendor = {
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            ...(payload.vendor && {hashTag: payload.vendor}),
            goLive: true,
            isAdminVerified: true
        };
        if (payload.vendor) {
            delete criteriaForVendor.isAdminVerified;
            delete criteriaForVendor.goLive
        }

        if (payload.category) {
            let findVendors = await Dao.getData(Models.products, {category: payload.category}, {vendor: 1}, {lean: true});
            let vendorIds = findVendors.map(items => {
                return mongoose.Types.ObjectId(items.vendor)
            });

            criteriaForVendor._id = {$in: vendorIds}
        }

        if (payload.subCategory) {
            let findVendors = await Dao.getData(Models.products, {subCategory: payload.subCategory}, {vendor: 1}, {lean: true});
            let vendorIds = findVendors.map(items => {
                return mongoose.Types.ObjectId(items.vendor)
            });
            criteriaForVendor._id = {$in: vendorIds}
        }

        let aggregateArray = [
            {
                $match: criteriaForVendor
            },
            {
                $project: {
                    name: 1,
                    vendorRegisterName: 1,
                    // email: 1,
                    phoneNumber: 1,
                    latLong: 1,
                    lat: 1,
                    long: 1,
                    vendorPurpose: 1,
                    banner: 1,
                    vendorSize: 1,
                    ownerBio: 1,
                    inheritPolicy: 1,
                    likes: 1,
                    themeType: 1,
                    hashTag: 1,
                    ownerPicture: 1,
                    marketingVideo: 1,
                    socialLinks: 1,
                    vendorStory: 1,
                    vendorAdImage: 1,
                    vendorAdVideo: 1,
                    vendorPolicy: 1,
                    vendorAd: 1,
                    saleContact: 1,
                    businessDescription: 1,
                    createdDate: 1,
                    address: 1,
                    subscription: 1,
                    profileStatus: 1,
                    rating: 1,
                    noOfRating: 1,
                    avgRating: {
                        $cond: {
                            if: {$eq: [0, "$noOfRating"]},
                            then: 0,
                            else: {
                                $divide: ["$rating", "$noOfRating"]
                            }
                        }
                    }
                }
            }, {
                $sort: {
                    avgRating: -1
                }
            }];
        if (payload.skip) {
            aggregateArray.push({
                $skip: parseInt(payload.skip)
            })
        }
        if (payload.limit) {
            aggregateArray.push({
                $limit: parseInt(payload.limit)
            })
        }
        if (userData) {
            aggregateArray.push({
                    $lookup: {
                        from: "follows",
                        let: {
                            "vendorId": "$_id"
                        },
                        pipeline: [
                            {
                                $match:
                                    {
                                        $expr:
                                            {
                                                $and:
                                                    [
                                                        {$eq: ["$receiver", "$$vendorId"]},
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
                },
                {
                    $lookup: {
                        from: "reactions",
                        let: {
                            "vendorId": "$_id"
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
                                                        {$eq: ["$user", mongoose.Types.ObjectId(userData._id)]},
                                                        {$eq: ["$status", APP_CONSTANTS.STATUS_ENUM.LIKE]},
                                                    ]
                                            }
                                    }
                            },
                            {$project: {_id: 1}}
                        ],
                        as: "like"
                    }
                },
                {
                    $addFields: {
                        followByUser: {$size: '$follows'}
                    }
                },
                {
                    $addFields: {
                        followDone: {
                            $cond: {
                                if: {$gt: ['$followByUser', 0]},
                                then: true,
                                else: false
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        likeByUser: {$size: '$like'}
                    }
                },
                {
                    $addFields: {
                        likeDone: {
                            $cond: {
                                if: {$gt: ['$likeByUser', 0]},
                                then: true,
                                else: false
                            }
                        }
                    }
                })
        } else {
            aggregateArray.push({
                $addFields: {
                    followDone: false
                },
                $addFields: {
                    likeDone: false
                }
            })
        }

        aggregateArray.push(
            {
                $lookup: {
                    from: "vendorcategories",
                    localField: "_id",
                    foreignField: "vendor",
                    as: "vendorCategories"
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "vendorCategories.category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "vendorCategories.subCategory",
                    foreignField: "_id",
                    as: "subCategory"
                }
            },
            {
                $lookup: {
                    from: 'vendortemplates',
                    localField: '_id',
                    foreignField: 'vendor',
                    as: 'vendorTemplate'
                }
            },
            {
                $unwind: {
                    path: '$vendorTemplate',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    vendorCategories: 0
                }
            });

        let promise = [Dao.aggregateDataWithPopulate(Models.vendors, aggregateArray, [{
            path: 'subscription.plan',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.PLANS
        }]),
            Dao.countDocuments(Models.vendors, criteriaForVendor)
        ];


        let [vendorData, count] = await Promise.all(promise);

        if (payload.vendor && vendorData.length) {
            payload.addedByVendor = vendorData[0]._id;
            payload.vendorId = payload.vendor;
            let status = {$nin: [APP_CONSTANTS.STATUS_ENUM.DELETED, APP_CONSTANTS.STATUS_ENUM.BLOCKED]};
            let options = {
                lean: true,
                ...(payload.skip && {skip: parseInt(payload.skip)}),
                ...(payload.limit && {limit: parseInt(payload.limit)})
            };
            let categories = await CategoryHelpers.categoryListingCollection(payload, APP_CONSTANTS.CATEGORY_TYPE.COLLECTIONS, status, options, userData);

            let findLog = await Dao.findOne(Models.commonLogs, {
                vendor: vendorData[0]._id,
                ip: ipInfo.remoteAddress,
                date: moment().format('LL'),
                type: APP_CONSTANTS.COMMON_LOGS.VENDOR_VISIT,
                status: APP_CONSTANTS.STATUS_ENUM.ACTIVE
            }, {
                _id: 1,
                visitor: 1
            }, {lean: true});
            if (findLog) {
                let update = {
                    visitor: 1
                };
                if (findLog.visitor < 5) {
                    update.restrictedVisit = 1;
                    await Dao.update(Models.vendors, {_id: vendorData[0]._id}, {
                        $inc: {
                            visits: 1,
                            dailyVisits: 1,
                        }
                    }, {})
                }
                await Dao.findAndUpdate(Models.commonLogs, {
                    _id: findLog._id,
                }, {$inc: update}, {lean: true})
            } else {
                await Dao.saveData(Models.commonLogs, {
                    visitor: 1,
                    type: APP_CONSTANTS.COMMON_LOGS.VENDOR_VISIT,
                    ip: ipInfo.remoteAddress,
                    vendor: vendorData[0]._id,
                    date: moment().format('LL')
                }, {lean: true});
                await Dao.update(Models.vendors, {_id: vendorData[0]._id}, {
                    $inc: {
                        visits: 1,
                        dailyVisits: 1,
                    }
                }, {})
            }

            return {
                vendorData,
                count,
                categoryData: categories.data,
                categoryCount: categories.count
            }
        } else {
            return {vendorData, count}
        }
    } catch (e) {
        throw e
    }
};

const listVendorMayLike = async (payload, userData) => {
    try {

        if (payload.type === APP_CONSTANTS.FEED_LIST_TYPE.VENDOR) {
            let followings = [];
            if (userData) {
                let findFollowings = await Dao.getData(Models.follow, {
                    sender: userData._id,
                    status: APP_CONSTANTS.STATUS_ENUM.FOLLOW,
                    followType: APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_VENDOR
                });
                followings = findFollowings.map(items => {
                    return mongoose.Types.ObjectId(items.receiver)
                })
            }

            let criteriaForVendor = {
                status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
                isAdminVerified: true,
                goLive: true,
            };

            if (followings.length) {
                criteriaForVendor._id = {
                    $nin: followings
                }
            }

            let aggregateArray = [
                {
                    $match: criteriaForVendor
                }];

            if (payload.skip) {
                aggregateArray.push({
                    $skip: parseInt(payload.skip)

                })
            }
            if (payload.limit) {
                aggregateArray.push({
                    $limit: parseInt(payload.limit)

                })
            }

            aggregateArray.push({
                $lookup: {
                    from: "products",
                    let: {
                        "vendorId": "$_id"
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
                $project: {
                    name: 1,
                    vendorRegisterName: 1,
                    ownerPicture: 1,
                    hashTag: 1,
                    banner: 1,
                    createdDate: 1,
                    rating: 1,
                    productCount: 1,
                    noOfRating: 1,
                    avgRating: {
                        $cond: {
                            if: {$eq: [0, "$noOfRatings"]},
                            then: 0,
                            else: {
                                $divide: ["$rating", "$noOfRatings"]
                            }
                        }
                    }
                }
            }, {
                $sort: {
                    avgRating: -1
                }
            }, {
                $lookup: {
                    from: "categories",
                    let: {
                        "vendorId": "$_id"
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
            });

            if (userData) {
                aggregateArray.push({
                    $lookup: {
                        from: "follows",
                        let: {
                            "vendorId": "$_id"
                        },
                        pipeline: [
                            {
                                $match:
                                    {
                                        $expr:
                                            {
                                                $and:
                                                    [
                                                        {$eq: ["$receiver", "$$vendorId"]},
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
                aggregateArray.push({
                    $addFields: {
                        followDone: false
                    }
                })
            }

            let promise = [Dao.aggregateData(Models.vendors, aggregateArray),
                Dao.countDocuments(Models.vendors, criteriaForVendor)
            ];
            let [vendorData, count] = await Promise.all(promise);
            return {data: vendorData, count}
        } else {
            let followings = [];
            if (userData) {
                let findFollowings = await Dao.getData(Models.follow, {
                    sender: userData._id,
                    status: {$in: [APP_CONSTANTS.STATUS_ENUM.FOLLOW, APP_CONSTANTS.STATUS_ENUM.FOLLOW_REQUEST]},
                    followType: APP_CONSTANTS.FOLLOW_TYPE.FOLLOW_USER
                });
                followings = findFollowings.map(items => {
                    return mongoose.Types.ObjectId(items.receiver)
                });
                followings.push(userData._id)
            }


            let criteriaForUser = {
                status: APP_CONSTANTS.STATUS_ENUM.ACTIVE
            };
            if (userData && userData.interests && userData.interests.length) {
                criteriaForUser.interests = {$in: userData.interests}
            }

            if (followings.length) {
                criteriaForUser._id = {
                    $nin: followings
                }
            }

            let aggregateArray = [
                {
                    $match: criteriaForUser
                },
                {
                    $project: {
                        firstName: 1,
                        lastName: 1,
                        profilePic: 1,
                        createdDate: 1,
                    }
                }, {
                    $sort: {
                        _id: -1
                    }
                }];
            if (payload.skip) {
                aggregateArray.push({
                    $skip: parseInt(payload.skip)

                })
            }
            if (payload.limit) {
                aggregateArray.push({
                    $limit: parseInt(payload.limit)

                })
            }
            if (userData) {
                aggregateArray.push({
                    $lookup: {
                        from: "follows",
                        let: {
                            "userId": "$_id"
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
                aggregateArray.push({
                    $addFields: {
                        followDone: false
                    }
                })
            }
            let promise = [Dao.aggregateData(Models.user, aggregateArray),
                Dao.countDocuments(Models.user, criteriaForUser)
            ];
            let [userDataResponse, count] = await Promise.all(promise);
            return {data: userDataResponse, count}
        }


    } catch (e) {
        throw e
    }
};

let listProducts = async (payload, userData, sort, ipInfo) => {
    try {
        payload.availableForSale = true;
        payload.status = APP_CONSTANTS.STATUS_ENUM.ACTIVE;
        let products = await ProductHelpers.listProductsAggregateVariants(payload, userData, sort);
        if (payload.productId && products.data.length === 0) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID;
        if (payload.productId) {
            payload.similarProducts = true;
            payload.vendor = products && products.data[0] && products.data[0].vendor ? products.data[0].vendor.hashTag : "";
            payload.category = products && products.data[0] && products.data[0].category && products.data[0].category._id ? products.data[0].category._id : '';
            payload.subCategory = products && products.data[0] && products.data[0].subCategory && products.data[0].subCategory._id ? products.data[0].subCategory._id : '';
            sort = {
                avgRating: -1
            };
            let findLog = await Dao.findOne(Models.commonLogs, {
                product: payload.productId,
                ip: ipInfo.remoteAddress,
                date: moment().format('LL'),
                type: APP_CONSTANTS.COMMON_LOGS.PRODUCT_VISIT,
                status: APP_CONSTANTS.STATUS_ENUM.ACTIVE
            }, {
                _id: 1
            }, {lean: true});
            if (findLog) {

                let update = {
                    visitor: 1
                };
                if (findLog.visitor < 5) {
                    update.restrictedVisit = 1;
                    await Dao.update(Models.products, {_id: payload.productId}, {
                        $inc: {
                            visits: 1,
                            dailyVisits: 1,
                        }
                    }, {})
                }
                await Dao.findAndUpdate(Models.commonLogs, {
                    _id: findLog._id,
                }, {$inc: update}, {lean: true})
            } else {
                await Dao.saveData(Models.commonLogs, {
                    visitor: 1,
                    ip: ipInfo.remoteAddress,
                    type: APP_CONSTANTS.COMMON_LOGS.PRODUCT_VISIT,
                    product: payload.productId,
                    date: moment().format('LL')
                }, {lean: true});
                await Dao.findAndUpdate(Models.products, {_id: payload.productId}, {
                    $inc: {
                        visits: 1,
                        dailyVisits: 1
                    }
                }, {lean: true})
            }

            products.similarProducts = await ProductHelpers.listProductsAggregate(payload, userData, sort)
        }
        return products
    } catch (e) {
        throw e
    }
};

const trendingVendors = async (payload, userData) => {
    try {
        let criteriaForVendor = {
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            userType: {$in: [APP_CONSTANTS.USER_TYPE.VENDOR_OWNER, APP_CONSTANTS.USER_TYPE.SUB_VENDOR]},
            goLive: true,
            isAdminVerified: true
        };

        if (payload.commonServiceId) {
            let commonService = await Dao.findOne(Models.commonServices, {_id: payload.commonServiceId}, {vendor: 1}, {lean: true});
            if (commonService && commonService.vendor && commonService.vendor.length) {
                let vendor = commonService.vendor.map(item => {
                    return mongoose.Types.ObjectId(item)
                });
                criteriaForVendor._id = {$in: vendor}
            }
        }

        if (payload.search) {
            payload.search = payload.search.split(" ");
            if (payload.search.length) {
                let or = []
                for (let key of payload.search) {
                    or.push({
                            "vendorRegisterName": new RegExp(key, 'i')
                        },
                        {
                            "firstName": new RegExp(key, 'i')
                        },
                        {
                            "lastName": new RegExp(key, 'i')
                        })
                }

                if (or.length) {
                    criteriaForVendor.$or = or
                }
            }
        }

        let aggregateArray = [{
            $match: criteriaForVendor
        }, {
            $project: {
                name: 1,
                vendorRegisterName: 1,
                // email: 1,
                phoneNumber: 1,
                hashTag: 1,
                latLong: 1,
                lat: 1,
                long: 1,
                banner: 1,
                vendorPurpose: 1,
                vendorSize: 1,
                plusCardPlan: 1,
                ownerBio: 1,
                businessDescription: 1,
                address: 1,
                profileStatus: 1,
                dailyVisits: 1,
                visits: 1,
                rating: 1,
                noOfRating: 1,
                avgRating: {
                    $cond: {
                        if: {$eq: [0, "$noOfRating"]},
                        then: 0,
                        else: {
                            $divide: ["$rating", "$noOfRating"]
                        }
                    }
                }
            }
        }];

        aggregateArray.push({
            $addFields: {
                plusCardAvailable: {
                    $cond: {
                        if: {
                            $and: [
                                {
                                    $ne: ["$plusCardPlan", null]
                                },
                                {
                                    $lte: ["$plusCardPlan.startDate", +moment()]
                                },
                                {
                                    $gte: ["$plusCardPlan.endDate", +moment()]
                                }
                            ]
                        },
                        then: 1,
                        else: 0
                    }
                }
            }
        }, {
            $sort: {
                plusCardAvailable: -1,
                dailyVisits: -1
            }
        });

        if (payload.skip) {
            aggregateArray.push({
                $skip: parseInt(payload.skip)
            })
        }
        if (payload.limit) {
            aggregateArray.push({
                $limit: parseInt(payload.limit)
            })
        }
        let promises = [];

        promises.push(Dao.aggregateData(Models.vendors, aggregateArray));
        promises.push(Dao.countDocuments(Models.vendors, criteriaForVendor));
        if (payload.commonServiceId) promises.push(Dao.findOne(Models.commonServices, {_id: payload.commonServiceId}, {}, {}));

        let [data, count, commonService] = await Promise.all(promises);

        return {data, count, commonService}
    } catch (e) {
        throw e
    }
};

const listVendorsForTagging = async (payload, userData) => {
    try {
        let criteria = {
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            goLive: true,
            isAdminVerified: true,
            userType: {$in: [APP_CONSTANTS.USER_TYPE.VENDOR_OWNER, APP_CONSTANTS.USER_TYPE.SUB_VENDOR]}
        };

        if (payload.searchHashTag) {
            criteria.hashTag = new RegExp(payload.searchHashTag, 'i')
        }

        let projection = {
            name: 1, firstName: 1, lastName: 1, _id: 1, vendorRegisterName: 1, hashTag: 1
        }
        let option = {
            lean: true,
            new: true,
            ...(payload.skip && {skip: payload.skip}),
            ...(payload.limit && {limit: payload.limit})
        }

        let [data, count] = await Promise.all([
            Dao.getData(Models.vendors, criteria, projection, option),
            Dao.countDocuments(Models.vendors, criteria)
        ])
        return {data, count}

    } catch (e) {
        throw e;
    }
}

const listOfferVendors = async (payload, userData) => {
    try {
        let criteriaForVendor = {
            startDate: {$lte: +new Date()},
            endDate: {$gte: +new Date()},
            discountOffer: mongoose.Types.ObjectId(payload.commonServiceId),
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            type: APP_CONSTANTS.PLAN_TYPE.DISCOUNT_OFFER,
            // goLive: true,
            isAdminApproved: true
        };


        let aggregateArray = [{
            $match: criteriaForVendor
        }];

        if (payload.skip) {
            aggregateArray.push({
                $skip: parseInt(payload.skip)
            })
        }
        if (payload.limit) {
            aggregateArray.push({
                $limit: parseInt(payload.limit)
            })
        }

        aggregateArray.push({
            $lookup: {
                from: 'vendors',
                localField: 'vendor',
                foreignField: '_id',
                as: 'vendor'
            }
        }, {
            $unwind: {
                path: '$vendor',
                preserveNullAndEmptyArrays: true
            }
        }, {
            $match: {
                'vendor.goLive': true,
                'vendor.isAdminVerified': true
            }
        });

        aggregateArray.push({
            $project: {
                vendor: {
                    _id: '$vendor._id',
                    vendorRegisterName: '$vendor.vendorRegisterName',
                    name: '$vendor.name',
                    firstName: '$vendor.firstName',
                    lastName: '$vendor.lastName',
                    ownerPicture: '$vendor.ownerPicture',
                    ownerBio: '$vendor.ownerBio',
                    businessDescription: '$vendor.businessDescription',
                    noOfRating: '$vendor.noOfRating',
                    rating: '$vendor.rating',
                    hashTag: '$vendor.hashTag',
                    banner: '$vendor.banner',
                    avgRating: {
                        $cond: {
                            if: {$eq: [0, "$vendor.noOfRating"]},
                            then: 0,
                            else: {
                                $divide: ["$vendor.rating", "$vendor.noOfRating"]
                            }
                        }
                    }
                },
                plan: 1,
                name: 1,
                description: 1,
                mediaType: 1,
                media: 1
            }
        });
        let promises = [];
        promises.push(Dao.aggregateData(Models.subscriptionLogs, aggregateArray));
        promises.push(Dao.countDocuments(Models.subscriptionLogs, criteriaForVendor));
        if (payload.commonServiceId) promises.push(Dao.findOne(Models.commonServices, {_id: payload.commonServiceId}, {}, {}));

        let [data, count, commonService] = await Promise.all(promises);

        return {data, count, commonService}
    } catch (e) {
        throw e
    }
};

const listOffers = async (payload, userData) => {
    try {

        let offerCriteria = {
            status: {$in: [APP_CONSTANTS.STATUS_ENUM.ACTIVE]},
            type: APP_CONSTANTS.COMMON_SERVICES_TYPE.DISCOUNT_OFFER
        };
        let promises = [];

        let options = {
            lean: true,
            ...(payload.skip && {skip: payload.skip}),
            ...(payload.limit && {limit: payload.limit})
        }
        promises.push(Dao.getData(Models.commonServices, offerCriteria, {}, options));
        promises.push(Dao.countDocuments(Models.commonServices, offerCriteria));
        let [data, count] = await Promise.all(promises);

        return {data, count}
    } catch (e) {
        throw e
    }
};

const listPopularCollections = async (payload, userData) => {
    try {
        let promises = [];
        /////////     Category Listing    //////////

        let criteriaForCategories = {
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            $or: [{parentId: null}, {parentId: []}],
            type: APP_CONSTANTS.CATEGORY_TYPE.CATEGORIES
        };
        promises.push(Dao.getData(Models.categories, criteriaForCategories, {}, {
            lean: true,
            ...(payload.limit && {limit: payload.limit}),
            ...(payload.skip && {skip: payload.skip}),
            sort: {dailyVisits: -1}
        }));

        promises.push(Dao.countDocuments(Models.categories, criteriaForCategories));

        let [data, count] = await Promise.all(promises);
        return {data, count}
    } catch (e) {
        throw e
    }
};

const recommendedProducts = async (payload, userData) => {
    try {
        let criteria = {
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            isAdminVerified: true,
        };
        let options = {
            sort: {
                visits: -1
            },
            lean: true,
            ...(payload.skip && {skip: payload.skip}),
            ...(payload.limit && {limit: payload.limit}),
        };
        let projection = {
            visits: 1,
            category: 1,
            subCategory: 1,
            title: 1,
            description: 1,
            images: 1,
            price: 1,
            currency: 1,
            vendor: 1,
            productVariants: 1,
            productTag: 1,
            variantsAvailable: 1
        };
        let productFilter = [];
        let categoryFilter = [];
        let subCategoryFilter = [];
        if (userData) {
            let likeShareFavouriteData = await Dao.populateData(Models.reactions, {
                status: {$in: [APP_CONSTANTS.STATUS_ENUM.LIKE, APP_CONSTANTS.STATUS_ENUM.ACTIVE, APP_CONSTANTS.STATUS_ENUM.FAVOURITE]},
                reactionType: {$in: [APP_CONSTANTS.REACTION_TYPE_ENUM.PRODUCT_FAVOURITE, APP_CONSTANTS.REACTION_TYPE_ENUM.PRODUCT_LIKE, APP_CONSTANTS.REACTION_TYPE_ENUM.PRODUCT_SHARE]}
            }, {product: 1}, {lean: true}, [{
                path: 'product',
                select: 'category subCategory',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS
            }]);
            if (likeShareFavouriteData && likeShareFavouriteData.length) {
                for (let key of likeShareFavouriteData) {
                    if (key.product) {
                        productFilter.push(key.product._id);
                        if (key.product.category) {
                            categoryFilter.push(key.product.category)
                        }
                        if (key.product.subCategory) {
                            subCategoryFilter.push(key.product.subCategory)
                        }
                    }
                }
            }
        }
        let or = [];
        if (productFilter.length) {
            or.push({_id: {$in: productFilter}});
        }
        if (categoryFilter.length) {
            or.push({category: {$in: categoryFilter}});
        }
        if (subCategoryFilter.length) {
            or.push({subCategory: {$in: subCategoryFilter}});
        }
        if (or.length) {
            criteria.$or = or
        }
        let [data, count] = await Promise.all([
            Dao.populateData(Models.products, criteria, projection, options, [{
                path: 'productVariants',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCT_VARIANTS
            }, {
                path: 'vendor',
                select: 'vendorRegisterName firstName lastName hashTag',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
            }]),
            Dao.countDocuments(Models.products, criteria)
        ]);
        return {data, count}
    } catch (e) {
        throw e
    }
}

const reviewListVendor = async (payload, userData) => {
    try {
        let criteria = {
            status: {$in: [APP_CONSTANTS.STATUS_ENUM.ACTIVE, APP_CONSTANTS.STATUS_ENUM.EDITED]},
            vendor: payload.vendor,
            type: APP_CONSTANTS.RATING_TYPE.VENDOR_RATING
        };
        let projection = {
            logs: 0,
            createdDate: 0
        };
        let option = {
            lean: true,
            ...(payload.skip && {skip: parseInt(payload.skip)}),
            ...(payload.limit && {limit: parseInt(payload.limit)}),
        };
        let populate = [
            {
                path: 'ratingBy',
                select: 'firstName lastName email _id profilePic',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
            }
        ];
        let promise = [Dao.populateData(Models.ratings, criteria, projection, option, populate),
            Dao.countDocuments(Models.ratings, criteria)
        ];

        let [data, count] = await Promise.all(promise)
        return {data, count}

    } catch (e) {
        throw e
    }
}

const trendingHashAndPost = async (payload, userData) => {
    try {
        let promises = []
        let trendingFeedCriteria = {
            status: {$in: [APP_CONSTANTS.STATUS_ENUM.ACTIVE, APP_CONSTANTS.STATUS_ENUM.EDITED]}
        };

        trendingFeedCriteria.$and = [];
        let orCriteria = [{
            privacyType: APP_CONSTANTS.PRIVACY_TYPE.PUBLIC,
            user: {$exists: true}
        }];
        trendingFeedCriteria.$and.push({
            $or: orCriteria
        });
        if (userData) {
            trendingFeedCriteria.$and.push(
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
            trendingFeedCriteria.$and.push(
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
        }

        let aggregatePipeline = [
            {$match: trendingFeedCriteria},
            {
                $project: {
                    media: 1,
                    likes: 1,
                    comment: 1,
                    caption: 1,
                    user: 1
                }
            },
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

        promises.push(Dao.aggregateDataWithPopulate(Models.feeds, aggregatePipeline, [{
            path: 'user',
            select: 'firstName lastName profilePic'
        }]));
        promises.push(Dao.countDocuments(Models.feeds, trendingFeedCriteria));

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

        promises.push(Dao.aggregateDataWithPopulate(Models.feeds, aggregatePipelineHashTag, [{
            path: 'user',
            select: 'firstName lastName profilePic'
        }]))

        promises.push(Dao.countDocuments(Models.feeds, trendingHashCriteria));


        let [trendingFeeds, feedCount, trendingHashTag, hashTagCount] = await Promise.all(promises)

        return {
            trendingFeeds, feedCount, trendingHashTag, hashTagCount
        }

    } catch (e) {
        throw e
    }
}


const editorPicks = async (payload, userData) => {
    try {
        let products = await populateData(Models.products, {
            availableForSale: true,
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            isAdminVerified: true
        }, {
            title: 1, name: 1, description: 1,
            images: 1,
            externalUrl: 1,
            vendor: 1,
            colors: 1,
            quantityAvailable: 1,
            sizes: 1,
            sizesArray: 1,
            discount: 1,
            productType: 1,
            price: 1,
            variantsAvailable: 1,
            productVariants: 1,
            currency: 1,
        }, {
            sort: {
                dailyLikes: -1
            }, limit: 10
        }, [{
            path: 'vendor',
            select: 'firstName lastName name vendorRegisterName',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
        }, {
            path: 'productVariants',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCT_VARIANTS
        }]);

        let pipeline = [{
            $match: {
                status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
                goLive: true,
                isAdminVerified: true
            },
        },
            {
                $lookup: {
                    from: 'feeds',
                    foreignField: 'taggedVendors',
                    localField: '_id',
                    as: 'feeds'
                }
            },
            {
                $unwind: {
                    path: '$feeds',
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $group: {
                    _id: "$_id",
                    data: {
                        $first: {
                            _id: "$_id",
                            vendorRegisterName: '$vendorRegisterName',
                            name: '$name',
                            firstName: '$firstName',
                            lastName: '$lastName',
                            hashTag: '$hashTag',
                            banner: '$banner',
                            ownerPicture: '$ownerPicture'
                        }
                    },
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
                $limit: 10
            },
            {
                $project: {
                    data: 1
                }
            }
        ]

        console.log({pipeline: JSON.stringify(pipeline)})
        let vendors = await aggregateData(Models.vendors, pipeline)
        console.log({vendors})
        return {products, vendors}

    } catch (e) {
        throw e
    }
}

const redirectionCharges = async (payload, userData) => {
    try {
        let getProductDetail = await Dao.findOne(Models.products, {_id: payload.product}, {}, {lean: true});
        let findLog = await Dao.findOne(Models.commonLogs, {
            vendor: getProductDetail.vendor,
            product: getProductDetail._id,
            type: APP_CONSTANTS.COMMON_LOGS.REDIRECTION,
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            date: moment().format('LL'),
        }, {}, {lean: true})
        if (findLog) {
            await Dao.findAndUpdate(Models.commonLogs, {_id: findLog._id}, {
                $inc: {visitor: 1}
            })
        } else {
            await Dao.saveData(Models.commonLogs, {
                vendor: getProductDetail.vendor,
                product: getProductDetail._id,
                type: APP_CONSTANTS.COMMON_LOGS.REDIRECTION,
                date: moment().format('LL'),
                visitor: 1
            })
        }
        return getProductDetail.externalUrl;
    } catch (e) {
        throw e;
    }
}

const currencyListing = async () => {
    try {
        let currencies = []
        let getCurrencies = await Dao.getData(Models.currencies, {status: {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED}}, {}, {});
        if (getCurrencies.length) {
            for (let key of getCurrencies) {
                let findFrom = currencies.find(items => {
                    return items === key.from
                })
                let findTo = currencies.find(items => {
                    return items === key.to
                })
                if (!findFrom) {
                    currencies.push(key.from)
                }
                if (!findTo) {
                    currencies.push(key.to)
                }
            }
        }
        return currencies
    } catch (e) {
        throw e
    }
}

const currencyConversion = async (payload) => {
    try {
        let currency = await Dao.findOne(Models.currencies, { $or: [{ "from": "AED", "to": payload.currency },
                { "to": "AED", "from": payload.currency }] }, {} ,{lean: true});

        let currencyToReturn = 1;
        if(currency && payload.currency !== "AED"){
            if (currency.from === "AED") {
                currencyToReturn = currency.conversion;
            }
            else if (currency.to === "AED") {
                currencyToReturn =  currency.reverseConversion;
            }
        }
        else{
            currencyToReturn = 1
        }
        return currencyToReturn
    } catch (e) {
        throw e
    }
}


const listSubVendor = async (payload, userData) => {
    try {
        let getVendorData = await Dao.findOne(Models.vendors, {
            hashTag: payload.vendor,
            status: {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED}
        }, {password: 0}, {lean: true});
        let criteria = {
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            parentId: getVendorData._id,
            userType: APP_CONSTANTS.USER_TYPE.SUB_VENDOR
        }
        let options = {
            lean: true,
            sort: {_id: -1},
            ...(payload.skip && {skip: payload.skip}),
            ...(payload.limit && {limit: payload.limit})
        }
        let [data, count] = await Promise.all([
            Dao.populateData(Models.vendors, criteria, {password: 0, email: 0}, options, [{
                path: 'parentId',
                select: 'vendorRegisterName firstName lastName'
            }]),
            Dao.countDocuments(Models.vendors, criteria)
        ])
        return {data, count}
    } catch (e) {
        throw e
    }
}

const homeSearch = async (payload, userData) => {
    try {
        let promises = [];
        let criteriaForVendor = {
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            ...(payload.search && {$or: [{vendorRegisterName: new RegExp(await UniversalFunctions.escapeRegex(payload.search), 'i')}, {firstName: new RegExp(await UniversalFunctions.escapeRegex(payload.search), 'i')}]}),
            goLive: true,
            isAdminVerified: true
        };
        if (payload.category) {
            let findVendors = await Dao.getData(Models.products, {category: payload.category}, {vendor: 1}, {lean: true});
            let vendorIds = findVendors.map(items => {
                return mongoose.Types.ObjectId(items.vendor)
            });

            criteriaForVendor._id = {$in: vendorIds}
        }

        let options = {
            skip: payload.skip,
            limit: payload.limit,
            sort: {
                dailyVisits: -1
            }
        }
        promises.push(Dao.getData(Models.vendors, criteriaForVendor, {
            firstName: 1,
            lastName: 1,
            vendorRegisterName: 1,
            hashTag: 1
        }, options));    // List of vendors

        let criteriaForProducts = {
            availableForSale: true,
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            isAdminVerified: true,
            ...(payload.category && {category: payload.category})
        };
        if (payload.search) {
            criteriaForProducts.$or = [];
            for (let key in APP_CONSTANTS.DATABASE.LANGUAGES) {
                console.log("APP_CONSTANTS.LANGUAGES", APP_CONSTANTS.DATABASE.LANGUAGES);
                criteriaForProducts.$or.push({[`title.${APP_CONSTANTS.DATABASE.LANGUAGES[key]}`]: new RegExp(await UniversalFunctions.escapeRegex(payload.search), 'i')})
            }
        }
        if (payload.origin) {
            criteriaForProducts["shipping.origin"] = new RegExp(payload.origin, 'i')
        }
        promises.push(Dao.getData(Models.products, criteriaForProducts, {
            title: 1,
            name: 1,
            description: 1,
        }, {...options, limit: 16}));    // List of Products
        let criteriaForCategories = {
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,

        }
        criteriaForCategories.$and = [];
        let and = [{
            $or: [{
                parentId: null,
            }, {
                parentId: []
            }]
        }]
        if (payload.search) {
            let or = []
            for (let key in APP_CONSTANTS.DATABASE.LANGUAGES) {
                console.log("APP_CONSTANTS.LANGUAGES", APP_CONSTANTS.DATABASE.LANGUAGES);
                or.push({[`name.${APP_CONSTANTS.DATABASE.LANGUAGES[key]}`]: new RegExp(await UniversalFunctions.escapeRegex(payload.search), 'i')})
            }
            if (or.length) {
                and.push({
                    $or: or
                })
            }
        }
        criteriaForCategories.$and = and;
        criteriaForCategories.type = APP_CONSTANTS.CATEGORY_TYPE.CATEGORIES;
        promises.push(Dao.getData(Models.categories, criteriaForCategories, {}, options));    // List of Categories
        let criteriaForUser = {
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            ...(payload.search && {
                $or: [{
                    firstName: new RegExp(await UniversalFunctions.escapeRegex(payload.search))
                }, {
                    lastName: new RegExp(await UniversalFunctions.escapeRegex(payload.search))
                }
                ]
            })
        }
        let pipeline = [{
            $match: criteriaForUser
        }, {
            $project: {
                firstName: 1,
                lastName: 1,
            }
        }]

        if (userData) {
            pipeline.push({
                $lookup: {
                    from: "follows",
                    let: {
                        "userId": "$_id"
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
            pipeline.push({
                $addFields: {
                    followDone: false
                }
            })
        }

        promises.push(Dao.aggregateData(Models.user, pipeline));    // List of Users

        let [vendors, products, categories, users] = await Promise.all(promises);

        return {vendors, products, categories, users}
    } catch (e) {
        throw e
    }
}


module.exports = {
    homeApi: homeApi,
    listVendors: listVendors,
    listProducts: listProducts,
    listVendorMayLike: listVendorMayLike,
    trendingVendors: trendingVendors,
    listOfferVendors: listOfferVendors,
    listOffers: listOffers,
    listPopularCollections: listPopularCollections,
    recommendedProducts: recommendedProducts,
    listVendorsForTagging: listVendorsForTagging,
    reviewListVendor: reviewListVendor,
    trendingHashAndPost: trendingHashAndPost,
    editorPicks: editorPicks,
    redirectionCharges: redirectionCharges,
    currencyListing: currencyListing,
    currencyConversion: currencyConversion,
    listSubVendor: listSubVendor,
    homeSearch: homeSearch
};
