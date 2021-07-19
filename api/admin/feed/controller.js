const CommonHelperFunction = require('../../helper-functions/admin');
const mongoose = require('mongoose');


const listFeeds = async (payload, adminData) => {
    try {
        let criteria = {
            status: {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED},
        };

        if (payload.user) {
            criteria.user = mongoose.Types.ObjectId(payload.user);
        }

        if (payload._id) {
            criteria._id = mongoose.Types.ObjectId(payload._id);
        }

        if (payload.vendor) {
            criteria.vendor = mongoose.Types.ObjectId(payload.vendor);
        }

        if (payload.hashTag) criteria.hashTag = {$in: payload.hashTag};

        if(payload.likes){
            criteria.likes={$gte: payload.likes};
        }
        if(payload.comments){
            criteria.comments={$gte: payload.comments};
        }
        if(payload.reportedPost || payload.reportedPost === false){
            if(payload.reportedPost){
                criteria.reportBy = {$ne: []}
            }
            else{
                criteria.reportBy = {$eq: []}
            }
        }

        if(payload.startDate && payload.endDate){
            criteria.createdDate = {
                $gte: payload.startDate,
                $lte: payload.endDate
            }
        }
        let skip = {
            $skip: parseInt(payload.skip)
        }, limit = {
            $limit: parseInt(payload.limit)
        };

        let aggregatePipeline = [
            {$match: criteria}
        ];

        if (payload.skip) {
            aggregatePipeline.push(skip)
        }
        if (payload.limit) {
            aggregatePipeline.push(limit)
        }


        let promise = await Dao.aggregateDataWithPopulate(Models.feeds, aggregatePipeline, [{
            path: 'user',
            select: 'firstName lastName',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
        }, {
            path: 'vendor',
            select: 'vendorRegisterName',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
        }, {
            path: 'collectionId',
            select: 'name description media'
        }]);
        let count = await Dao.countDocuments(Models.feeds, criteria);
        console.log("promise", promise);

        return {data: promise, count: count}
    } catch (e) {
        throw e
    }
}


const blockUnBlockFeed = async (payload, adminData) => {
    try {
        let criteria = {
            _id: payload.id
        };
        let getUserData = await Dao.findOne(Models.feeds, criteria, {}, {lean: true});
        if (getUserData) {
            if (payload.action === true && getUserData.status === APP_CONSTANTS.STATUS_ENUM.BLOCKED) {
                return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.USER_ALREADY_BLOCKED)
            } else if (payload.action === false && getUserData.status === APP_CONSTANTS.STATUS_ENUM.ACTIVE) {
                return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.USER_ALREADY_UNBLOCKED)
            } else {
                let dataToUpdate = {
                    updatedDate: +new Date(),
                    adminUpdateId: adminData._id
                };
                payload.action === true ? dataToUpdate.status = APP_CONSTANTS.STATUS_ENUM.BLOCKED : dataToUpdate.status = APP_CONSTANTS.STATUS_ENUM.ACTIVE;
                return await Dao.findAndUpdate(Models.feeds, criteria, dataToUpdate, {lean: true, new: true});
            }
        } else return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID)
    } catch (e) {
        throw e
    }
};

const deleteFeed = async (payload, adminData) => {
    try {
        let criteria = {
            _id: payload._id
        };
        let getUserData = await Dao.findOne(Models.feeds, criteria, {}, {lean: true});
        if (getUserData) {
            let dataToUpdate = {
                updatedDate: +new Date(),
                adminUpdateId: adminData._id
            };
            dataToUpdate.status = APP_CONSTANTS.STATUS_ENUM.DELETED;
            return await Dao.findAndUpdate(Models.feeds, criteria, dataToUpdate, {lean: true, new: true});
        } else return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID)
    } catch (e) {
        throw e
    }
};

const listCommentsFeed = async (payload, adminData) => {
    try {
        let criteria = {
            status: {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED},
            feed: payload.feed,
        };
        let projection = {
            logs: 0,
            createdDate: 0
        };
        let option = {
            lean: true,
            ...(payload.skip && {skip: parseInt(payload.skip)}),
            ...(payload.limit && {limit: parseInt(payload.limit)})
        };
        let populate = [
            {
                path: 'user',
                select: 'firstName lastName email _id profilePic'
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
}

const blockComment = async (payload, adminData) => {
    try {
        let criteria = {
            _id: payload.id
        };
        let getUserData = await Dao.findOne(Models.comments, criteria, {}, {lean: true});
        if (getUserData) {
            if (payload.action === true && getUserData.status === APP_CONSTANTS.STATUS_ENUM.BLOCKED) {
                return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.USER_ALREADY_BLOCKED)
            } else if (payload.action === false && getUserData.status === APP_CONSTANTS.STATUS_ENUM.ACTIVE) {
                return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.USER_ALREADY_UNBLOCKED)
            } else {
                let dataToUpdate = {
                    updatedDate: +new Date(),
                    adminUpdateId: adminData._id
                };
                payload.action === true ? dataToUpdate.status = APP_CONSTANTS.STATUS_ENUM.BLOCKED : dataToUpdate.status = APP_CONSTANTS.STATUS_ENUM.ACTIVE;
                return await Dao.findAndUpdate(Models.comments, criteria, dataToUpdate, {lean: true, new: true});
            }
        } else return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID)
    } catch (e) {
        throw e
    }
}

const listLikesFeed = async (payload, adminData) => {
    try {
        let criteria = {
            status: APP_CONSTANTS.STATUS_ENUM.LIKE,
            feed: mongoose.Types.ObjectId(payload.feed),
            reactionType: APP_CONSTANTS.REACTION_TYPE_ENUM.POST_LIKE
        };
        let option = {
            lean: true,
            ...(payload.skip && {skip: parseInt(payload.skip)}),
            ...(payload.limit && {limit: parseInt(payload.limit)})
        };
        let projection = {
            logs: 0,
            createdDate: 0,
            reactionType: 0,
        };
        let populate = [
            {
                path: 'user',
                select: 'firstName lastName email _id profilePic'
            },
            {
                path: 'feed',
                select: 'media'
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
}

const listReports = async (payload, adminData) => {
    try {
        let [reportsData, count] = await Promise.all([
            Dao.populateData(Models.commonReports, {
                status: {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED},
                ...(payload.feed && {feed: payload.feed})
            }, {}, {
                lean: true,
                ...(payload.skip && {skip: parseInt(payload.skip)}),
                ...(payload.limit && {limit: parseInt(payload.limit)})
            }, [{
                path: 'reportBy',
                select: 'firstName lastName email'
            }, {
                path: 'feed',
                select: 'media mediaType user vendor collectionId',
                populate: [
                    {
                        path: 'user',
                        select: 'firstName lastName email'
                    },
                    {
                        path: 'vendor',
                        select: 'firstName lastName vendorRegisterName name email'
                    },
                    {
                        path: 'collectionId',
                        select: 'name'
                    }
                ]
            }]),
            Dao.countDocuments(Models.commonReports, {
                status: {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED},
                ...(payload.feed && {feed: payload.feed})
            })
        ])
        return {reportsData, count}
    } catch (e) {
        throw e
    }
}

module.exports = {
    listFeeds: listFeeds,
    blockUnBlockFeed: blockUnBlockFeed,
    deleteFeed: deleteFeed,
    blockComment: blockComment,
    listCommentsFeed: listCommentsFeed,
    listLikesFeed: listLikesFeed,
    listReports: listReports
}
