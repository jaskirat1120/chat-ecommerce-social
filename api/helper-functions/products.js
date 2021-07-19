const mongoose = require('mongoose');
// constants imported
const APP_CONSTANTS = require('../../config').constants.appDefaults;
const Json2csvParser = require("json2csv").Parser;
const fs = require("fs");
const path = require("path");
const moment = require("moment");

const listProducts = async (payload, userData, sort) => {
    let criteria = {
        status: payload.status,
        ...(payload.vendor && {vendor: payload.vendor}),
        ...(payload.category && {category: payload.category}),
        ...(payload.collectionId && {collectionId: payload.collectionId}),
        ...(payload.subCategory && {subCategory: payload.subCategory}),
    };
    if (payload.availableForSale || payload.availableForSale === false) {
        criteria.availableForSale = payload.availableForSale
    }

    if (payload.withoutCollection) {
        criteria.$or = [{
            collectionId: null
        }, {
            collectionId: {$exists: false}
        }]

    }
    let projection = {},
        populate = [
            {
                path: "subCategory",
                select: "name media"
            },
            {
                path: "category",
                select: "name media"
            },
            {
                path: "sizes",
                select: "name media",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
            },
            {
                path: "sizesArray",
                select: "name media",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
            },
            {
                path: "colors",
                select: "name media colorCode",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
            },
            {
                path: "vendor",
                select: "name vendorRegisterName firstName lastName",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
            },
            {
                path: "productVariants",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCT_VARIANTS,
                populate: [
                    {
                        path: 'colors',
                        model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
                        select: 'name'
                    },
                    {
                        path: 'sizes',
                        model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
                        select: 'name'
                    }
                ]
            }],
        option = {
            sort: sort && (sort !== {} || sort !== "") ? sort : {_id: -1},
            lean: true,
            ...(payload.limit && {limit: parseInt(payload.limit)}),
            ...(payload.skip && {skip: parseInt(payload.skip)})
        };
    let [data, count] = await Promise.all([
        Dao.populateData(Models.products, criteria, projection, option, populate),
        Dao.countDocuments(Models.products, criteria)
    ]);
    if (payload.isCSV) {
        return await createCSVProductVendor(data)
    } else {
        return {data, count}
    }
};

let newVendorProductListing = async (payload) => {
    try {

        let criteria = {
            status: payload.status,
            ...(payload.vendor && {vendor: payload.vendor}),
            ...(payload.category && {category: payload.category}),
            ...(payload.collectionId && {collectionId: payload.collectionId}),
            ...(payload.subCategory && {subCategory: payload.subCategory}),
        };
        if (payload.availableForSale || payload.availableForSale === false) {
            criteria.availableForSale = payload.availableForSale
        }

        if (payload.withoutCollection) {
            criteria.$or = [{
                collectionId: null
            }, {
                collectionId: {$exists: false}
            }]

        }
        if (payload.productName) {
            criteria.$or = [];
            for (let key in APP_CONSTANTS.DATABASE.LANGUAGES) {
                console.log("APP_CONSTANTS.LANGUAGES", APP_CONSTANTS.DATABASE.LANGUAGES);
                criteria.$or.push({[`title.${APP_CONSTANTS.DATABASE.LANGUAGES[key]}`]: new RegExp(payload.productName, 'i')})
            }
        }

        if (payload.startDate && payload.endDate) {
            criteria.createdDate = {
                $gte: payload.startDate,
                $lte: payload.endDate
            }
        }
        if (payload.shippingCourier) {
            criteria['shipping.shippingDetail.shippingCourier'] = mongoose.Types.ObjectId(payload.shippingCourier)
        }

        if (payload.shippingChargesType) {
            criteria['shipping.shippingDetail.shippingChargesType'] = payload.shippingChargesType
        }

        let projection = {
                vendorData: 0,
                productVariantsData: 0
            },
            populate = [
                {
                    path: "subCategory",
                    select: "name media"
                },
                {
                    path: "category",
                    select: "name media"
                },
                {
                    path: "sizes",
                    select: "name media",
                    model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
                },
                {
                    path: "sizesArray",
                    select: "name media",
                    model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
                },
                {
                    path: "colors",
                    select: "name media colorCode",
                    model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
                },
                {
                    path: "vendor",
                    select: "name vendorRegisterName firstName lastName",
                    model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
                },
                // {
                //     path: "shipping.shippingDetail.shippingCourier",
                //     select: "name",
                //     model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
                // },
                {
                    path: "productVariants",
                    model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCT_VARIANTS,
                    populate: [
                        {
                            path: 'colors',
                            model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
                            select: 'name colorCode'
                        },
                        {
                            path: 'sizes',
                            model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
                            select: 'name'
                        }
                    ]
                }];


        let pipeline = [{
            $match: criteria
        }];

        if ((payload.startPrice && payload.endPrice) || (payload.startDiscount && payload.endDiscount) || (payload.startQuantity && payload.endQuantity) || payload.color || payload.size) {
            pipeline.push(
                {
                    $lookup: {
                        from: "productvariants",
                        localField: 'productVariants',
                        foreignField: '_id',
                        as: 'productVariantsData'
                    }
                });
            if ((payload.startPrice && payload.endPrice)) {
                pipeline.push(
                    {
                        $match: {
                            $or: [
                                {
                                    'productVariantsData.price': {
                                        $gte: payload.startPrice,
                                        $lte: payload.endPrice
                                    }
                                },
                                {
                                    'price': {
                                        $gte: payload.startPrice,
                                        $lte: payload.endPrice
                                    }
                                }
                            ]
                        }
                    })
            }
            if ((payload.startDiscount && payload.endDiscount)) {
                pipeline.push(
                    {
                        $match: {
                            $or: [
                                {
                                    'productVariantsData.discount': {
                                        $gte: payload.startDiscount,
                                        $lte: payload.endDiscount
                                    }
                                },
                                {
                                    'discount': {
                                        $gte: payload.startDiscount,
                                        $lte: payload.endDiscount
                                    }
                                }
                            ]
                        }
                    })
            }

            if ((payload.startQuantity && payload.endQuantity)) {
                pipeline.push(
                    {
                        $match: {
                            $or: [
                                {
                                    'productVariantsData.quantityAvailable': {
                                        $gte: payload.startQuantity,
                                        $lte: payload.endQuantity
                                    }
                                },
                                {
                                    'quantityAvailable': {
                                        $gte: payload.startQuantity,
                                        $lte: payload.endQuantity
                                    }
                                }
                            ]
                        }
                    })
            }

            if (payload.size) {
                pipeline.push(
                    {
                        $match: {
                            $or: [
                                {
                                    'productVariantsData.sizes': mongoose.ObjectId(payload.size)
                                },
                                {
                                    'sizesArray': mongoose.ObjectId(payload.size)
                                }
                            ]
                        }
                    })
            }
            if (payload.color) {
                pipeline.push(
                    {
                        $match: {
                            $or: [
                                {
                                    'productVariantsData.colors': mongoose.ObjectId(payload.color)
                                },
                                {
                                    'colors': mongoose.ObjectId(payload.color)
                                }
                            ]
                        }
                    })
            }

        }

        pipeline.push({
            $project: projection
        }, {
            $sort: {
                _id: -1
            }
        });
        let count = await Dao.aggregateData(Models.products, pipeline);
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
            // Dao.populateData(Models.products, criteria, projection, option, populate),
            Dao.aggregateDataWithPopulate(Models.products, pipeline, populate),
            // Dao.countDocuments(Models.products, criteria)
        ]);
        if (payload.isCSV) {
            return await createCSVProductVendor(data)
        } else {
            return {data, count: count.length}
        }
    } catch (e) {
        throw e
    }
}

let createCSVProductVendor = async (data) => {
    try {
        data = JSON.parse(JSON.stringify(data));
        let fields = [
            "Sr. No.",
            "Vendor Name",
            "Vendor Register Name",
            "Product English Name",
            "Product Arabic Name",
            "Product English Description",
            "Product Arabic Description",
            "Product Price",
            "Discount",
            "Tax",
            "Category",
            "Available For Sale",
            "Variants Available",
            "Shipping Origin",
            "Processing Time",
            "Approve Product",
            "Created At",
        ];

        let invoiceData = [];
        let invoiceObject = {};
        for (let i = 0; i < data.length; i++) {
            invoiceObject = {};
            invoiceObject["Sr. No."] = i + 1;
            invoiceObject["Vendor Name"] = `${data[i].vendor.firstName} ${data[i].vendor.lastName}`;
            invoiceObject["Vendor Register Name"] = `${data[i].vendor.vendorRegisterName}`;
            invoiceObject["Product English Name"] = `${data[i].title["en"]}`;
            invoiceObject["Product Arabic Name"] = `${data[i].title["ar"]}`;
            invoiceObject["Product English Description"] = `${data[i].description["en"]}`;
            invoiceObject["Product Arabic Description"] = `${data[i].description["ar"]}`;
            invoiceObject["Product Price"] = data[i].variantsAvailable ? `AED ${data[i].productVariants[0].price}` : `AED ${data[i].price}`;
            invoiceObject["Discount"] = data[i].variantsAvailable ? `${data[i].productVariants[0].discount}%` : `${data[i].discount}%`;
            invoiceObject["Tax"] = data[i].variantsAvailable ? `${data[i].productVariants[0].tax}%` : `${data[i].tax}%`;
            invoiceObject["Category"] = `${data[i].category.name["en"]}`;
            invoiceObject["Quantity Available"] = `${data[i].quantityAvailable}`;
            invoiceObject["Available For Sale"] = `${data[i].availableForSale ? 'Yes' : 'No'}`;
            invoiceObject["Variants Available"] = `${data[i].variantsAvailable ? 'Yes' : 'No'}`;
            invoiceObject["Shipping Origin"] = `${data[i].shipping.origin}`;
            invoiceObject["Processing Time"] = `${data[i].shipping.processingTime}`;
            invoiceObject["Approve Product"] = `${data[i].isAdminVerified ? 'Yes' : 'No'}`;
            invoiceObject["Created At"] = `${moment(data[i].createdDate).format("LLL")}`;

            invoiceData.push(invoiceObject);
        }

        const json2csvParser = new Json2csvParser({fields});

        let csv = await json2csvParser.parse(invoiceData);
        console.log("csv", csv)
        return csv;
    } catch (err) {
        throw err;
    }
}


const listProductsAdmin = async (payload) => {
    let criteria = {
        status: payload.status,
        ...(payload.vendor && {vendor: mongoose.Types.ObjectId(payload.vendor)}),
        ...(payload.category && {category: mongoose.Types.ObjectId(payload.category)}),
        ...(payload.collectionId && {collectionId: mongoose.Types.ObjectId(payload.collectionId)}),
        ...(payload.subCategory && {subCategory: mongoose.Types.ObjectId(payload.subCategory)}),
    };

    if (payload.productName) {
        criteria.$or = [];
        for (let key in APP_CONSTANTS.DATABASE.LANGUAGES) {
            console.log("APP_CONSTANTS.LANGUAGES", APP_CONSTANTS.DATABASE.LANGUAGES);
            criteria.$or.push({[`title.${APP_CONSTANTS.DATABASE.LANGUAGES[key]}`]: new RegExp(payload.productName, 'i')})
        }
    }

    if (payload.availableForSale || payload.availableForSale === false) {
        criteria.availableForSale = payload.availableForSale
    }

    if (payload.isAdminVerified || payload.isAdminVerified === false) {
        criteria.isAdminVerified = payload.isAdminVerified
    }

    if (payload.startDate && payload.endDate) {
        criteria.createdDate = {
            $gte: payload.startDate,
            $lte: payload.endDate
        }
    }
    if (payload.shippingCourier) {
        criteria['shipping.shippingDetail.shippingCourier'] = mongoose.Types.ObjectId(payload.shippingCourier)
    }

    if (payload.shippingChargesType) {
        criteria['shipping.shippingDetail.shippingChargesType'] = payload.shippingChargesType
    }

    let projection = {
            vendorData: 0,
            productVariantsData: 0
        },
        populate = [
            {
                path: "subCategory",
                select: "name media"
            },
            {
                path: "category",
                select: "name media"
            },
            {
                path: "sizes",
                select: "name media",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
            },
            {
                path: "sizesArray",
                select: "name media",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
            },
            {
                path: "colors",
                select: "name media colorCode",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
            },
            {
                path: "vendor",
                select: "name vendorRegisterName firstName lastName",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
            },
            {
                path: "shipping.shippingDetail.shippingCourier",
                select: "name",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
            },
            {
                path: "productVariants",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCT_VARIANTS,
                populate: [
                    {
                        path: 'colors',
                        model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
                        select: 'name'
                    },
                    {
                        path: 'sizes',
                        model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
                        select: 'name'
                    }
                ]
            }];


    let pipeline = [{
        $match: criteria
    }];
    if (payload.vendorName) {
        pipeline.push({
                $lookup: {
                    from: "vendors",
                    localField: 'vendor',
                    foreignField: '_id',
                    as: 'vendorData'
                }
            },
            {
                $match: {
                    'vendorData.vendorRegisterName': new RegExp(payload.vendorName, 'i')
                }
            })
    }
    if ((payload.startPrice && payload.endPrice) || (payload.startDiscount && payload.endDiscount)) {
        pipeline.push(
            {
                $lookup: {
                    from: "productvariants",
                    localField: 'productVariants',
                    foreignField: '_id',
                    as: 'productVariantsData'
                }
            });
        if ((payload.startPrice && payload.endPrice)) {
            pipeline.push(
                {
                    $match: {
                        $or: [
                            {
                                'productVariantsData.price': {
                                    $gte: payload.startPrice,
                                    $lte: payload.endPrice
                                }
                            },
                            {
                                'price': {
                                    $gte: payload.startPrice,
                                    $lte: payload.endPrice
                                }
                            }
                        ]
                    }
                })
        }
        if ((payload.startDiscount && payload.endDiscount)) {
            pipeline.push(
                {
                    $match: {
                        $or: [
                            {
                                'productVariantsData.discount': {
                                    $gte: payload.startDiscount,
                                    $lte: payload.endDiscount
                                }
                            },
                            {
                                'discount': {
                                    $gte: payload.startDiscount,
                                    $lte: payload.endDiscount
                                }
                            }
                        ]
                    }
                })
        }

    }
    pipeline.push({
        $project: projection
    }, {
        $sort: {
            _id: -1
        }
    });
    let count = await Dao.aggregateData(Models.products, pipeline);
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
        // Dao.populateData(Models.products, criteria, projection, option, populate),
        Dao.aggregateDataWithPopulate(Models.products, pipeline, populate),
        // Dao.countDocuments(Models.products, criteria)
    ]);
    if (payload.isCSV) {
        return await createCSV(data)
    } else {
        return {data, count: count.length}
    }
};
console.log("__dirname", path.join(__dirname, "../../", "/public/uploads/"))

let createCSV = async (data) => {
    try {
        data = JSON.parse(JSON.stringify(data))
        let fields = [
            "Sr. No.",
            "Vendor Name",
            "Vendor Register Name",
            "Product English Name",
            "Product Arabic Name",
            "Product English Description",
            "Product Arabic Description",
            "Product Price",
            "Discount",
            "Tax",
            "Category",
            "Available For Sale",
            "Variants Available",
            "Shipping Origin",
            "Processing Time",
            "Approve Product",
            "Created At",
        ];

        let invoiceData = [];
        let invoiceObject = {};
        for (let i = 0; i < data.length; i++) {
            invoiceObject = {};
            invoiceObject["Sr. No."] = i + 1;
            invoiceObject["Vendor Name"] = `${data[i].vendor.firstName} ${data[i].vendor.lastName}`;
            invoiceObject["Vendor Register Name"] = `${data[i].vendor.vendorRegisterName}`;
            invoiceObject["Product English Name"] = `${data[i].title["en"]}`;
            invoiceObject["Product Arabic Name"] = `${data[i].title["ar"]}`;
            invoiceObject["Product English Description"] = `${data[i].description["en"]}`;
            invoiceObject["Product Arabic Description"] = `${data[i].description["ar"]}`;
            invoiceObject["Product Price"] = data[i].variantsAvailable ? `AED ${data[i].productVariants[0].price}` : `AED ${data[i].price}`;
            invoiceObject["Discount"] = data[i].variantsAvailable ? `${data[i].productVariants[0].discount}%` : `${data[i].discount}%`;
            invoiceObject["Tax"] = data[i].variantsAvailable ? `${data[i].productVariants[0].tax}%` : `${data[i].tax}%`;
            invoiceObject["Category"] = `${data[i].category.name["en"]}`;
            invoiceObject["Quantity Available"] = `${data[i].quantityAvailable}`;
            invoiceObject["Available For Sale"] = `${data[i].availableForSale ? 'Yes' : 'No'}`;
            invoiceObject["Variants Available"] = `${data[i].variantsAvailable ? 'Yes' : 'No'}`;
            invoiceObject["Shipping Origin"] = `${data[i].shipping.origin}`;
            invoiceObject["Processing Time"] = `${data[i].shipping.processingTime}`;
            invoiceObject["Approve Product"] = `${data[i].isAdminVerified ? 'Yes' : 'No'}`;
            invoiceObject["Created At"] = `${moment(data[i].createdDate).format("LLL")}`;

            invoiceData.push(invoiceObject);
        }

        const json2csvParser = new Json2csvParser({fields});

        let csv = await json2csvParser.parse(invoiceData);
        console.log("csv", csv)
        return csv;
    } catch (err) {
        throw err;
    }
}


const listProductsAggregate = async (payload, userData, sort) => {
    let criteria = {
        status: payload.status,
        isAdminVerified: true,
        ...(payload.productId && {_id: mongoose.Types.ObjectId(payload.productId)}),
        ...(payload.collectionId && {collectionId: mongoose.Types.ObjectId(payload.collectionId)}),
        ...(payload.category && {category: mongoose.Types.ObjectId(payload.category)}),
        // ...(payload.subCategory && {subCategory: mongoose.Types.ObjectId(payload.subCategory)}),
    };
    if (payload.availableForSale || payload.availableForSale === false) {
        criteria.availableForSale = payload.availableForSale
    }
    if (payload.vendor) {
        let findVendorDetails = await Dao.findOne(Models.vendors, {hashTag: payload.vendor}, {_id: 1}, {lean: true})
        criteria.vendor = mongoose.Types.ObjectId(findVendorDetails._id);
    }

    if (payload.similarProducts) {
        criteria._id = {
            $ne: mongoose.Types.ObjectId(payload.productId)
        };
    }

    let projection = {
            title: 1,
            description: 1,
            externalUrl: 1,
            vendor: 1,
            colors: 1,
            quantityAvailable: 1,
            sizes: 1,
            discount: 1,
            sizesArray: 1,
            productType: 1,
            price: 1,
            currency: 1,
            status: 1,
            productVariants: 1,
            category: 1,
            subCategory: 1,
            images: 1,
            videos: 1,
            variantsAvailable: 1,
            shippingCharges: 1,
            availableForSale: 1,
            popularity: 1,
            visits: 1,
            dailyVisits: 1,
            rating: 1,
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
        },
        populate = [
            {
                path: "subCategory",
                select: "name media"
            },
            {
                path: "category",
                select: "name media"
            },
            {
                path: "sizes",
                select: "name media",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
            },
            {
                path: "sizesArray",
                select: "name media",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
            },
            {
                path: "colors",
                select: "name media colorCode",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
            },
            {
                path: "vendor",
                select: "name vendorRegisterName firstName lastName",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
            },
            {
                path: "productVariants",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCT_VARIANTS,
                populate: [
                    {
                        path: 'colors',
                        select: "name media",
                        model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
                    },
                    {
                        path: 'sizes',
                        select: "name media",
                        model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
                    }
                ]
            }
        ];
    let skip = {
        $skip: parseInt(payload.skip)
    }, limit = {
        $limit: parseInt(payload.limit)
    };

    let aggregateArray = [
        {
            $match: criteria
        },
        {
            $project: projection
        },
        {
            $sort: sort && (sort !== {} || sort !== "") ? sort : {_id: -1}
        }
    ];

    if (payload.skip) aggregateArray.push(skip);
    if (payload.limit) aggregateArray.push(limit);

    console.log("criteriacriteria", JSON.stringify(criteria))
    let [data, count] = await Promise.all([
        Dao.aggregateDataWithPopulate(Models.products, aggregateArray, populate),
        Dao.countDocuments(Models.products, criteria)
    ]);
    return {data, count}
};

const listProductsAggregateVariants = async (payload, userData, sort) => {
    let criteria = {
        status: payload.status,
        isAdminVerified: true,
        ...(payload.productId && {_id: mongoose.Types.ObjectId(payload.productId)}),
        ...(payload.collectionId && {collectionId: mongoose.Types.ObjectId(payload.collectionId)}),
        ...(payload.category && {category: mongoose.Types.ObjectId(payload.category)}),
        ...(payload.subCategory && {subCategory: mongoose.Types.ObjectId(payload.subCategory)}),
    };
    if (payload.filter) {
        // if(payload.filter === APP_CONSTANTS.PRODUCT_FILTER.NEW_PRODUCTS){
        //     criteria.createdDate = {
        //         $lte: +new Date(),
        //         $gte: +moment().subtract(24, 'hour')
        //     }
        // }
        if (payload.filter === APP_CONSTANTS.PRODUCT_FILTER.FREE_SHIPPING) {
            criteria['shipping.shippingDetail.shippingChargesType'] = APP_CONSTANTS.SHIPPING_CHARGES_TYPE.FREE
        }
    }
    if (payload.availableForSale || payload.availableForSale === false) {
        criteria.availableForSale = payload.availableForSale
    }
    if (payload.vendor) {
        let findVendorDetails = await Dao.findOne(Models.vendors, {hashTag: payload.vendor}, {_id: 1}, {lean: true})
        criteria.vendor = findVendorDetails._id;
    }

    if (payload.similarProducts) {
        criteria._id = {
            $ne: mongoose.Types.ObjectId(payload.productId)
        };
    }

    let projection = {
            _id: '$_id._id',
            title: '$_id.title',
            description: '$_id.description',
            externalUrl: '$_id.externalUrl',
            vendor: '$_id.vendor',
            colors: '$_id.colors',
            quantityAvailable: '$_id.quantityAvailable',
            sizes: '$_id.sizes',
            sizesArray: '$_id.sizesArray',
            discount: '$_id.discount',
            productType: '$_id.productType',
            price: '$_id.price',
            currency: '$_id.currency',
            status: '$_id.status',
            variantsAvailable: '$_id.variantsAvailable',
            productTangibleType: '$_id.productTangibleType',
            shipping: '$_id.shipping',
            material: '$_id.material',
            weight: '$_id.weight',
            productVariant: '$productVariant',
            category: '$_id.category',
            subCategory: '$_id.subCategory',
            images: '$_id.images',
            videos: '$_id.videos',
            shippingCharges: '$_id.shippingCharges',
            availableForSale: '$_id.availableForSale',
            popularity: '$_id.popularity',
            visits: '$_id.visits',
            dailyVisits: '$_id.visits',
            tax: '$_id.tax',
            productTag: '$_id.productTag',
            rating: '$_id.rating',
            orderCount: '$_id.orderCount',
            likes: '$_id.likes',
            noOfRating: '$_id.noOfRating',
            favouriteDone: '$_id.favouriteDone',
            likeDone: '$_id.likeDone',
            avgRating: {
                $cond: {
                    if: {$eq: [0, "$_id.noOfRating"]},
                    then: 0,
                    else: {
                        $divide: ["$_id.rating", "$_id.noOfRating"]
                    }
                }
            }
        },
        projectProductVariants = {
            "productVariant.data": 0
        },
        populate = [
            {
                path: "subCategory",
                select: "name media"
            },
            {
                path: "category",
                select: "name media"
            },
            {
                path: "sizes",
                select: "name media",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
            },
            {
                path: "sizesArray",
                select: "name media",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
            },
            {
                path: "colors",
                select: "name media colorCode",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
            },
            {
                path: "vendor",
                select: "name vendorRegisterName hashTag firstName lastName ownerPicture vendorPurpose webUrl",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
            },
            {
                path: "productVariant._id",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
                select: 'name media colorCode'
            },
            {
                path: "productVariant.variantData.colors",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
                select: 'name media colorCode'
            },
            {
                path: "productVariant.variantData.sizes",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
                select: 'name media'
            },
            {
                path: "shipping.shippingDetail.shippingCourier",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
                select: 'name'
            },
            {
                path: "productVariants",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCT_VARIANTS,
            },
            {
                path: "reviews.ratingBy",
                select: "firstName lastName profilePic",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
            }
        ];
    let skip = {
        $skip: parseInt(payload.skip)
    }, limit = {
        $limit: parseInt(payload.limit)
    };
    if (payload.search) {
        payload.search = payload.search.split(" ");
        let or = []
        for (let key of payload.search) {
            or.push({
                "vendorDatas.vendorRegisterName": new RegExp(key, 'i')
            })
            for (let key1 in APP_CONSTANTS.DATABASE.LANGUAGES) {
                console.log("APP_CONSTANTS.LANGUAGES", APP_CONSTANTS.DATABASE.LANGUAGES);
                or.push({[`title.${APP_CONSTANTS.DATABASE.LANGUAGES[key1]}`]: new RegExp(key, 'i')})
            }
        }

        if (or.length) {
            criteria.$or = or
        }
    }


    let aggregateArray = [
        {
            $match: criteria
        }
    ];
    let searchMatch = {}
    // if (payload.search) {
    //     payload.search = payload.search.split(" ");
    //     if (payload.search.length) {
    //         aggregateArray.push({
    //             $lookup: {
    //                 from: 'vendors',
    //                 as: 'vendorDatas',
    //                 foreignField: '_id',
    //                 localField: 'vendor'
    //             }
    //         }, {
    //             $unwind: {
    //                 path: '$vendorDatas',
    //                 preserveNullAndEmptyArrays: true
    //             }
    //         })
    //         let or = []
    //         for (let key of payload.search) {
    //             or.push({
    //                     "vendorDatas.vendorRegisterName": new RegExp(key, 'i')
    //                 })
    //             for (let key1 in APP_CONSTANTS.DATABASE.LANGUAGES) {
    //                 console.log("APP_CONSTANTS.LANGUAGES", APP_CONSTANTS.DATABASE.LANGUAGES);
    //                 or.push({[`title.${APP_CONSTANTS.DATABASE.LANGUAGES[key1]}`]: new RegExp(key, 'i')})
    //             }
    //         }
    //
    //         if(or.length){
    //             searchMatch.$or = or
    //         }
    //     }
    // }

    // if(searchMatch && Object.keys(searchMatch).length !==0){
    //     aggregateArray.push({$match: searchMatch}, {$project: {"vendorDatas": 0}})
    // }

    if (userData && userData._id) {
        aggregateArray.push({
                $lookup: {
                    from: "reactions",
                    let: {
                        "productId": "$_id"
                    },
                    pipeline: [
                        {
                            $match:
                                {
                                    $expr:
                                        {
                                            $and:
                                                [
                                                    {$eq: ["$product", "$$productId"]},
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
            },
            {
                $lookup: {
                    from: 'reactions',
                    let: {productId: '$_id'},
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    {$eq: ["$product", "$$productId"]},
                                    {$eq: ["$user", mongoose.Types.ObjectId(userData._id)]},
                                    {$eq: ["$status", APP_CONSTANTS.STATUS_ENUM.FAVOURITE]},
                                ]
                            }
                        }
                    },
                        {
                            $project: {
                                _id: 1
                            }
                        }
                    ],
                    as: 'favourites'
                }
            },
            {
                $addFields: {
                    favouriteByUser: {$size: '$favourites'}
                }
            },
            {
                $addFields: {
                    favouriteDone: {
                        $cond: {
                            if: {$gt: ['$favouriteByUser', 0]},
                            then: true,
                            else: false
                        }
                    }
                }
            })
    } else {
        aggregateArray.push({
                $addFields: {
                    likeDone: false
                }
            },
            {
                $addFields: {
                    favouriteDone: false
                }
            })
    }

    if (payload.productId) {
        aggregateArray.push(
            {
                $lookup: {
                    from: 'productvariants',
                    localField: 'productVariants',
                    foreignField: '_id',
                    as: 'productVariant'
                }
            },
            {
                $unwind: {
                    path: '$productVariant',
                    preserveNullAndEmptyArrays: true
                }
            },
        );
        aggregateArray.push({
                $group: {
                    _id: '$productVariant.colors',
                    variantData: {
                        $push: "$productVariant"
                    },
                    data: {
                        $first: "$$ROOT"
                    }
                }
            },
            {
                $project: {
                    "data.productVariants": 0,
                    "data.productVariant": 0
                }
            },
            {
                $group: {
                    _id: '$data',
                    productVariant: {
                        $push: '$$ROOT'
                    }
                }
            },
            {
                $project: projection
            },
            {
                $project: projectProductVariants
            },
            {
                $lookup: {
                    from: 'ratings',
                    localField: '_id',
                    foreignField: 'product',
                    as: 'reviews'
                }
            },
        )
        if (!payload.filter || (payload.filter && payload.filter !== APP_CONSTANTS.PRODUCT_FILTER.LOWEST_PRICE)) {
            aggregateArray.push({
                $sort: sort && (sort !== {} || sort !== "") ? sort : {_id: -1}
            })
        }
        if (!payload.filter || (payload.filter && payload.filter === APP_CONSTANTS.PRODUCT_FILTER.NEW_PRODUCTS)) {
            aggregateArray.push({
                $sort: sort && (sort !== {} || sort !== "") ? sort : {_id: -1}
            })
        }
        if (userData && userData._id) {
            let findOrder = await Dao.findOne(Models.orders, {
                user: userData._id,
                'products.product': payload.productId,
                status: {
                    $nin: [
                        APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_FAILED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_PENDING,
                    ]
                }
            });
            if (findOrder) {
                aggregateArray.push({
                    $addFields: {
                        orderDone: true
                    }
                })
            } else {
                aggregateArray.push({
                    $addFields: {
                        orderDone: false
                    }
                })
            }
        }
    } else if (payload.filter) {
        if (payload.filter === APP_CONSTANTS.PRODUCT_FILTER.POPULAR_PRODUCTS) {
            aggregateArray.push(
                {
                    $sort: {orderCount: -1}
                })
        } else if (payload.filter === APP_CONSTANTS.PRODUCT_FILTER.NEW_PRODUCTS) {
            aggregateArray.push({
                $sort: sort && (sort !== {} || sort !== "") ? sort : {_id: -1}
            })
        }
            // else if(payload.filter && payload.filter===APP_CONSTANTS.PRODUCT_FILTER.LOWEST_PRICE){
            //     aggregateArray.push({
            //         $sort: {price: 1}
            //     })
        // }
        else if (payload.filter === APP_CONSTANTS.PRODUCT_FILTER.LOWEST_PRICE) {
            aggregateArray.push(
                {
                    $lookup: {
                        from: 'productvariants',
                        localField: 'productVariants',
                        foreignField: '_id',
                        as: 'productVariant'
                    }
                },
                {
                    $unwind: {
                        path: '$productVariant',
                        preserveNullAndEmptyArrays: true
                    }
                },
            );
            aggregateArray.push({
                    $addFields: {
                        sortPrice: {
                            $cond: {
                                if: {$eq: ['$variantsAvailable', true]},
                                then: "$productVariant.price",
                                else: "$price"
                            }
                        }
                    }
                },
                {
                    $sort: {
                        sortPrice: 1
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        data: {
                            $first: "$$ROOT"
                        },
                        productVariants: {
                            $push: "$productVariant._id"
                        }
                    }
                },
                {
                    $project: {
                        _id: '$data._id',
                        title: '$data.title',
                        description: '$data.description',
                        externalUrl: '$data.externalUrl',
                        vendor: '$data.vendor',
                        colors: '$data.colors',
                        quantityAvailable: '$data.quantityAvailable',
                        sizes: '$data.sizes',
                        sizesArray: '$data.sizesArray',
                        discount: '$data.discount',
                        productType: '$data.productType',
                        price: '$data.price',
                        currency: '$data.currency',
                        status: '$data.status',
                        sortPrice: "$data.sortPrice",
                        variantsAvailable: '$data.variantsAvailable',
                        productTangibleType: '$data.productTangibleType',
                        shipping: '$data.shipping',
                        material: '$data.material',
                        weight: '$data.weight',
                        productVariants: '$productVariants',
                        category: '$data.category',
                        subCategory: '$data.subCategory',
                        images: '$data.images',
                        videos: '$data.videos',
                        shippingCharges: '$data.shippingCharges',
                        availableForSale: '$data.availableForSale',
                        popularity: '$data.popularity',
                        visits: '$data.visits',
                        dailyVisits: '$data.visits',
                        tax: '$data.tax',
                        productTag: '$data.productTag',
                        rating: '$data.rating',
                        likes: '$data.likes',
                        noOfRating: '$data.noOfRating',
                        favouriteDone: '$data.favouriteDone',
                        likeDone: '$data.likeDone',
                        avgRating: '$data.avgRating',
                        unit: '$data.unit',
                        productCost: '$data.productCost',
                        profit: '$data.profit',
                        profitPercentage: '$data.profitPercentage',
                        productNumber: '$data.productNumber',
                        isAdminVerified: '$data.isAdminVerified',
                        dailyLikes: '$data.dailyLikes',
                        soldOut: '$data.soldOut',
                        orderCount: '$data.orderCount',
                        createdDate: '$data.createdDate',
                        updatedDate: '$data.updatedDate',
                        updatedBy: '$data.updatedBy',
                        addedBy: '$data.addedBy',
                        createdAt: '$data.createdAt',
                        updatedAt: '$data.updatedAt',
                        collectionId: '$data.collectionId',
                    }
                }, {
                    $sort: {
                        sortPrice: 1
                    }
                },
            )
        } else {
            aggregateArray.push(
                {
                    $sort: sort && (sort !== {} || sort !== "") ? sort : {_id: -1}
                })
        }
    }


    if (payload.skip) aggregateArray.push(skip);
    if (payload.limit) aggregateArray.push(limit);

    console.log("agggrgrrgrgrg", JSON.stringify(aggregateArray))

    let [data, count] = await Promise.all([
        Dao.aggregateDataWithPopulate(Models.products, aggregateArray, populate),
        Dao.countDocuments(Models.products, criteria)
    ]);
    return {data, count}
};

let writedirAsync = (path, data) => {
    return new Promise(function (resolve, reject) {
        fs.writeFile(path, data, function (error) {
            if (error) {
                console.log("===error=========", error)
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

module.exports = {
    listProducts: listProducts,
    listProductsAdmin: listProductsAdmin,
    listProductsAggregate: listProductsAggregate,
    listProductsAggregateVariants: listProductsAggregateVariants,
    newVendorProductListing: newVendorProductListing
};
