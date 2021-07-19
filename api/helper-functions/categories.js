// local modules
const moment = require('moment')
const categoryListing = async (payloadData, type, status, options, userData, vendorCategory) => {
    let criteria = {
        status: status,
        type: type
    };
    if (payloadData.parentId) {
        criteria.parentId = payloadData.parentId;
    } else {
        criteria.$or = [{
            parentId: null
        }, {
            parentId: []
        }]
    }

    if (payloadData.subCategory) criteria.parentId = payloadData.subCategory;

    if (payloadData.categoryType && payloadData.categoryType === 'SUB_CATEGORY') {
        delete criteria.$or
        if (!criteria.parentId)
            criteria.parentId = {$nin: [null, []]}
    }

    if ((userData && userData.userType === APP_CONSTANTS.USER_TYPE.VENDOR_OWNER &&  type === APP_CONSTANTS.CATEGORY_TYPE.COLLECTIONS) || payloadData.addedByVendor) {
        criteria.$or =  [{
            addedByVendor: payloadData.addedByVendor ? payloadData.addedByVendor : userData._id
        }, {
            addedBy: {$ne: null}
        }]
    }

    if (payloadData.vendorId && type !== APP_CONSTANTS.CATEGORY_TYPE.COLLECTIONS && !vendorCategory) {
        let findVendorData = await Dao.findOne(Models.vendors, {hashTag: payloadData.vendorId}, {_id: 1}, {lean: true});
        // if(!userData || userData && userData.userType === APP_CONSTANTS.USER_TYPE.USER){
        let vendorCategory = await Dao.getData(Models.products, {
            vendor: findVendorData._id,
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE
        }, {
            category: 1,
            subCategory: 1
        }, {lean: true});

        let productCategories = vendorCategory.map(items => {
            return mongoose.Types.ObjectId(items.category)
        })
        if (productCategories && productCategories.length)
            criteria._id = {$in: productCategories};
        // criteria._id = {$or:[{$in: vendorCategory.category},{$in: vendorCategory.subCategory}]};
        // }
        // else{
        //     let vendorCategory = await Dao.findOne(Models.vendorCategories, {vendor: findVendorData._id}, {
        //         category: 1,
        //         subCategory: 1
        //     }, {lean: true});
        //     if (vendorCategory.category)
        //         criteria._id = {$in: vendorCategory.category};
        //     // criteria._id = {$or:[{$in: vendorCategory.category},{$in: vendorCategory.subCategory}]};
        // }
    }

    if (payloadData.search) {
        criteria.$or = [];
        for (let key in APP_CONSTANTS.DATABASE.LANGUAGES) {
            console.log("APP_CONSTANTS.LANGUAGES", APP_CONSTANTS.DATABASE.LANGUAGES);
            criteria.$or.push({[`name.${APP_CONSTANTS.DATABASE.LANGUAGES[key]}`]: new RegExp(payloadData.search)})
        }
    }

    if (payloadData.startDate && payloadData.endDate) {
        criteria.createdDate = {
            $gte: payloadData.startDate,
            $lte: payloadData.endDate
        }
    }

    if (payloadData.categoryId) {
        criteria._id = payloadData.categoryId;
        let findLog = await Dao.findOne(Models.commonLogs, {
            category: payloadData.categoryId,
            ip: payloadData.remoteAddress,
            date: moment().format('LL'),
            type: APP_CONSTANTS.COMMON_LOGS.CATEGORY_VISIT,
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE
        }, {
            _id: 1
        }, {lean: true})
        if (findLog) {

            let update = {
                visitor: 1
            }
            if (findLog.visitor < 5) {
                update.restrictedVisit = 1
                await Dao.findAndUpdate(Models.categories, {_id: payloadData.categoryId,}, {
                    $inc: {
                        visits: 1,
                        dailyVisits: 1,
                    }
                }, {});
            }
            await Dao.findAndUpdate(Models.commonLogs, {
                _id: findLog._id,
            }, {$inc: update}, {lean: true})
        } else {
            await Dao.saveData(Models.commonLogs, {
                visitor: 1,
                type: APP_CONSTANTS.COMMON_LOGS.CATEGORY_VISIT,
                category: payloadData.categoryId,
                ip: payloadData.remoteAddress,
                date: moment().format('LL')
            }, {lean: true})
            await Dao.findAndUpdate(Models.categories, {_id: payloadData.categoryId,}, {
                $inc: {
                    visits: 1,
                    dailyVisits: 1,
                }
            }, {});
        }

    }

    let populate = [
        {
            path: 'parentId',
            select: 'name'
        },
        {
            path: 'addedByVendor',
            select: 'name firstName lastName'
        }
    ];

    console.log("criteriacriteriacriteria", JSON.stringify(criteria))

    let [data, count] = await Promise.all([Dao.populateData(Models.categories, criteria, {}, options, populate),
        Dao.countDocuments(Models.categories, criteria)
    ]);

    return {data, count};
};

const categoryListingCollection = async (payloadData, type, status, options, userData, vendorCategory) => {
    let criteria = {
        status: status,
        type: type
    };
    if (payloadData.parentId) {
        criteria.parentId = payloadData.parentId;
    } else {
        criteria.$or = [{
            parentId: null
        }, {
            parentId: []
        }]
    }

    if (payloadData.subCategory) criteria.parentId = payloadData.subCategory;

    // if (payloadData.categoryType && payloadData.categoryType === 'SUB_CATEGORY') {
    //     delete criteria.$or
    //     if (!criteria.parentId)
    //         criteria.parentId = {$nin: [null, []]}
    // }

    if ((userData && userData.userType === APP_CONSTANTS.USER_TYPE.VENDOR_OWNER) || payloadData.addedByVendor) {
        criteria.$or =  [{
            addedByVendor: payloadData.addedByVendor ? payloadData.addedByVendor : userData._id
        }]
    }

    if (payloadData.vendorId && type !== APP_CONSTANTS.CATEGORY_TYPE.COLLECTIONS && !vendorCategory) {
        let findVendorData = await Dao.findOne(Models.vendors, {hashTag: payloadData.vendorId}, {_id: 1}, {lean: true});
        // if(!userData || userData && userData.userType === APP_CONSTANTS.USER_TYPE.USER){
        let vendorCategory = await Dao.getData(Models.products, {
            vendor: findVendorData._id,
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE
        }, {
            category: 1,
            subCategory: 1
        }, {lean: true});

        let productCategories = vendorCategory.map(items => {
            return mongoose.Types.ObjectId(items.category)
        })
        if (productCategories && productCategories.length)
            criteria._id = {$in: productCategories};
        // criteria._id = {$or:[{$in: vendorCategory.category},{$in: vendorCategory.subCategory}]};
        // }
        // else{
        //     let vendorCategory = await Dao.findOne(Models.vendorCategories, {vendor: findVendorData._id}, {
        //         category: 1,
        //         subCategory: 1
        //     }, {lean: true});
        //     if (vendorCategory.category)
        //         criteria._id = {$in: vendorCategory.category};
        //     // criteria._id = {$or:[{$in: vendorCategory.category},{$in: vendorCategory.subCategory}]};
        // }
    }

    if (payloadData.search) {
        criteria.$or = [];
        for (let key in APP_CONSTANTS.DATABASE.LANGUAGES) {
            console.log("APP_CONSTANTS.LANGUAGES", APP_CONSTANTS.DATABASE.LANGUAGES);
            criteria.$or.push({[`name.${APP_CONSTANTS.DATABASE.LANGUAGES[key]}`]: new RegExp(payloadData.search)})
        }
    }

    if (payloadData.startDate && payloadData.endDate) {
        criteria.createdDate = {
            $gte: payloadData.startDate,
            $lte: payloadData.endDate
        }
    }

    if (payloadData.categoryId) {
        criteria._id = payloadData.categoryId;
        let findLog = await Dao.findOne(Models.commonLogs, {
            category: payloadData.categoryId,
            ip: payloadData.remoteAddress,
            date: moment().format('LL'),
            type: APP_CONSTANTS.COMMON_LOGS.CATEGORY_VISIT,
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE
        }, {
            _id: 1
        }, {lean: true})
        if (findLog) {

            let update = {
                visitor: 1
            }
            if (findLog.visitor < 5) {
                update.restrictedVisit = 1
                await Dao.findAndUpdate(Models.categories, {_id: payloadData.categoryId,}, {
                    $inc: {
                        visits: 1,
                        dailyVisits: 1,
                    }
                }, {});
            }
            await Dao.findAndUpdate(Models.commonLogs, {
                _id: findLog._id,
            }, {$inc: update}, {lean: true})
        } else {
            await Dao.saveData(Models.commonLogs, {
                visitor: 1,
                type: APP_CONSTANTS.COMMON_LOGS.CATEGORY_VISIT,
                category: payloadData.categoryId,
                ip: payloadData.remoteAddress,
                date: moment().format('LL')
            }, {lean: true})
            await Dao.findAndUpdate(Models.categories, {_id: payloadData.categoryId,}, {
                $inc: {
                    visits: 1,
                    dailyVisits: 1,
                }
            }, {});
        }

    }

    let populate = [
        {
            path: 'parentId',
            select: 'name'
        },
        {
            path: 'addedByVendor',
            select: 'name firstName lastName'
        }
    ];

    console.log("criteriacriteriacriteria", JSON.stringify(criteria))

    let [data, count] = await Promise.all([Dao.populateData(Models.categories, criteria, {}, options, populate),
        Dao.countDocuments(Models.categories, criteria)
    ]);

    return {data, count};
};




let listCommonServices = async (payload, userData, model, project) => {
    try {
        let options = {
            lean: true,
            ...(payload.skip && {skip: parseInt(payload.skip)}),
            ...(payload.limit && {limit: parseInt(payload.limit)})
        };

        let criteria = {
            status: payload.status,
            ...(payload.type && {type: payload.type})
        };
        if(payload.search){
            criteria.$or = []
            for (let key in APP_CONSTANTS.DATABASE.LANGUAGES) {
                console.log("APP_CONSTANTS.LANGUAGES", APP_CONSTANTS.DATABASE.LANGUAGES);
                criteria.$or.push({[`name.${APP_CONSTANTS.DATABASE.LANGUAGES[key]}`]: new RegExp(payload.search)})
            }
            criteria.$or.push({[`careerArea`]: new RegExp(payload.search)});
            criteria.$or.push({[`location`]: new RegExp(payload.search)});
            criteria.$or.push({[`skill`]: new RegExp(payload.search)});
        }
        let pipeline = [{
            $match: criteria
        }];
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

        pipeline.push({
            $lookup: {
                from: 'subscriptionlogs',
                let: {
                    planId: '$_id'
                },
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [
                                {$eq: ["$plan", "$$planId"]},
                                {$gte: ["$endDate", +new Date()]}
                            ]
                        }
                    }
                }, {
                    $project: {
                        _id: 1
                    }
                }],
                as: 'subscribers'
            }
        }, {
            $addFields: {
                subscriberCount: {$size: "$subscribers"}
            }
        }, {
            $project: {
                subscribers: 0
            }
        });

        if(project && Object.keys(project).length!==0 ){
            pipeline.push({
                $project: project
            })
        }

        console.log("projectprojectproject" , JSON.stringify(pipeline) )
        let promises = [
            Dao.aggregateDataWithPopulate(model, pipeline, [{
                path: 'vendor',
                select: 'vendorRegisterName',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
            }, {
                path: 'discountOffer',
                select: 'name description',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
            }]),
            // Dao.populateData(model, criteria, {updatedBy: 0, addedBy: 0}, options, [{
            //     path: 'vendor',
            //     select: 'vendorRegisterName',
            //     model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
            // },{
            //     path: 'discountOffer',
            //     select: 'name description',
            //     model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
            // }]),
            Dao.countDocuments(model, criteria)
        ];
        let [data, count] = await Promise.all(promises);

        console.log("datadatadata",data)
        return {data, count}
    } catch (e) {
        throw e
    }
};


module.exports = {
    categoryListing: categoryListing,
    listCommonServices: listCommonServices,
    categoryListingCollection: categoryListingCollection
};
