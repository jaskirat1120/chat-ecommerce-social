// constants imported
const RESPONSE_MESSAGES = require('../../../config/constants').responseMessages;
const APP_CONSTANTS = require('../../../config').constants.appDefaults;

// local modules
const Dao = require('../../../dao').queries;
const Models = require('../../../models');
const ProductHelper = require('../../helper-functions/products');
const CommonHelperFunction = require('../../helper-functions/common');
const UniversalFunctions = require('../../../utils/universal-functions');
const Json2csvParser = require("json2csv").Parser;
const moment = require("moment");


const listOrders = async (payload, userData) => {
    try {
        let criteria = {
            ...(payload.orderId && {orderId: mongoose.Types.ObjectId(payload.orderId)}),
            ...(payload._id && {_id: mongoose.Types.ObjectId(payload._id)}),
            ...(payload.paymentMethod && {paymentMethod: payload.paymentMethod})
        }
        if (payload.startDate && payload.endDate) {
            criteria.createdDate = {
                $gte: payload.startDate, $lte: payload.endDate
            }
        }

        if(payload.orderNumber){
            criteria.orderNumber = new RegExp(payload.orderNumber, 'i')
        }
        if(payload.subOrderNumber){
            criteria.subOrderNumber = new RegExp(payload.subOrderNumber, 'i')
        }

        if (payload.status) {
            if (payload.status === APP_CONSTANTS.LIST_ORDER_STATUS.ALL) {

            } else if (payload.status === APP_CONSTANTS.LIST_ORDER_STATUS.CLOSED) {
                criteria.status = {
                    $in: [APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED, APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED, APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED_VENDOR, APP_CONSTANTS.ORDER_STATUS_ENUM.REJECTED,]
                }
            } else if (payload.status === APP_CONSTANTS.LIST_ORDER_STATUS.OPEN) {
                criteria.status = {
                    $nin: [APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED,APP_CONSTANTS.ORDER_STATUS_ENUM.REJECTED, APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED, APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED_VENDOR]
                }
            }else if (payload.status === APP_CONSTANTS.LIST_ORDER_STATUS.IN_PROCESSING) {
                criteria.status = {
                    $nin: [
                        APP_CONSTANTS.ORDER_STATUS_ENUM.ACCEPTED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.PACKED,
                    ]
                }
            }
            else{
                criteria.status = payload.status
            }
        }
        if(payload.paymentStatus){
            criteria.paymentStatus = payload.paymentStatus
        }
        let aggregatePipeline = [
            {
                $match: criteria
            },
            {
                $lookup: {
                    let: {vendorId: "$vendor"},
                    from: 'vendors',
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {$eq: ["$_id", "$$vendorId"]}
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                vendorRegisterName: 1
                            }
                        }],
                    as: "vendors"
                }
            },
            {
                $lookup: {
                    let: {productId: "$products.product"},
                    from: 'products',
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {$eq: ["$_id", "$$productId"]}
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                title: 1
                            }
                        }],
                    as: "productFilter"
                }
            },
            {
                $unwind: {
                    path: "$productFilter",
                    preserveNullAndEmptyArrays: true
                }
            }
        ];

        let aggregatePipelineCount = [
            {
                $match: criteria
            },
        ];
        if (payload.vendorName) {
            let vendorMatch = {
                $match: {
                    "vendors.vendorRegisterName": new RegExp(payload.vendorName, 'i')
                }
            }
            aggregatePipeline.push(vendorMatch)
            aggregatePipelineCount.push(vendorMatch)
        }

        if (payload.productName) {
            let match = {
                $match:{}
            }
            match.$match.$or = [];
            for (let key in APP_CONSTANTS.DATABASE.LANGUAGES) {
                match.$match.$or.push({[`productFilter.title.${APP_CONSTANTS.DATABASE.LANGUAGES[key]}`]: new RegExp(payload.productName)})
            }
            aggregatePipeline.push(match)
            aggregatePipelineCount.push(match)
        }


        aggregatePipeline.push({
                $group: {
                    _id: {
                        orderId: "$orderId",
                        orderNumber: "$orderNumber",
                        user: "$user",
                        paymentMethod: "$paymentMethod",
                        subTotal: '$subTotal',
                        tax: '$tax',
                        finalTotal: '$finalTotal',
                        currency: '$currency',
                        createdDate: "$createdDate"
                    },
                    order: {
                        $push: "$$ROOT"
                    }
                }
            },
            {
                $sort: {
                    "_id.createdDate": -1
                }
            })

        if ((payload.skip || payload.skip === 0) && payload.limit) {
            aggregatePipeline.push(
                {
                    $skip: parseInt(payload.skip)
                },
                {
                    $limit: parseInt(payload.limit)
                })
        }


        aggregatePipelineCount.push({
            $group: {
                _id: {
                    orderId: "$orderId",
                    orderNumber: "$orderNumber",
                    user: "$user",
                    paymentMethod: "$paymentMethod",
                    subTotal: '$subTotal',
                    tax: '$tax',
                    finalTotal: '$finalTotal',
                    currency: '$currency',
                    createdDate: "$createdDate"
                },
                order: {
                    $push: {
                        _id: "$_id"
                    }
                }
            }
        })
        let populate = [{
            path: '_id.user',
            select: 'firstName lastName phoneNumber email',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
        }, {
            path: 'order.user',
            select: 'firstName lastName phoneNumber email',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
        }, {
            path: 'order.vendor',
            select: 'name vendorRegisterName phoneNumber email firstName lastName',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
        }, {
            path: 'order.courierType',
            select: 'name courierServiceUrl',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
        }, {
            path: 'order.products.product',
            select: 'title description',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS
        }, {
            path: 'order.products.size',
            select: 'name',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
        }, {
            path: 'order.products.color',
            select: 'name',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
        }, {
            path: 'order.products.productVariant',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCT_VARIANTS,
            populate: [{
                path: 'colors',
                select: 'name',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
            }, {
                path: 'sizes',
                select: 'name',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
            }]
        }]

        let [order, orderCount] = await Promise.all([
            Dao.aggregateDataWithPopulate(Models.orders, aggregatePipeline, populate),
            Dao.aggregateData(Models.orders, aggregatePipelineCount)
        ]);
        if(payload.isCSV) {
            return await createCSVOrder(order);
        }else{
            return {order, orderCount: orderCount.length}
        }
    } catch (e) {
        throw e
    }
};



let createCSVOrder = async (data)=>{
    try {
        data = JSON.parse(JSON.stringify(data));
        let fields = [
            "Sr. No.",
            "Order Number",
            "Sub Order Number",
            "User Name",
            "User Email",
            "Vendor Name",
            "Vendor Register Name",
            "Vendor Phone Number",
            "Product",
            "Quantity",
            "Product Price",
            "Product Tax",
            "Shipping Charges",
            "Discount",
            "Product Total Price",
            "Payment Status",
            "Order Status",
            "Refund Requested",
        ];

        let invoiceData = [];
        let invoiceObject = {};
        for (let i = 0; i < data.length; i++) {
            for(let j=0; j < data[i].order.length; j++){
                invoiceObject = {};
                invoiceObject["Sr. No."] = i + 1;
                invoiceObject["Order Number"] = `${data[i].order[j].orderNumber}`;
                invoiceObject["Sub Order Number"] = `${data[i].order[j].subOrderNumber}`;
                invoiceObject["User Name"] = `${data[i].order[j].user.firstName} ${data[i].order[j].user.lastName}`;
                invoiceObject["User Email"] = `${data[i].order[j].user.email}`;
                invoiceObject["Vendor Name"] = `${data[i].order[j].vendor.firstName} ${data[i].order[j].vendor.lastName}`;
                invoiceObject["Vendor Register Name"] = `${data[i].order[j].vendor.vendorRegisterName}`;
                invoiceObject["Vendor Phone Number"] = data[i].order[j].vendor.phoneNumber?`${data[i].order[j].vendor.phoneNumber.countryCode} ${data[i].order[j].vendor.phoneNumber.phoneNo}`:"";
                invoiceObject["Product"] = `${data[i].order[j].products.product.title['en']}`;
                invoiceObject["Quantity"] = `${data[i].order[j].products.quantity}`;
                invoiceObject["Product Price"] = `${data[i].order[j].products.price}`;
                invoiceObject["Product Tax"] = `${data[i].order[j].products.tax}%`;
                invoiceObject["Shipping Charges"] = `${data[i].order[j].products.shippingChargesAfterDiscount * data[i].order[j].products.quantity}`;
                invoiceObject["Discount"] = `${data[i].order[j].products.promoCharges}`;
                let totalPrice = data[i].order[j].products.price;
                invoiceObject["Product Total Price"] = `${data[i].order[j].products.price}`;
                invoiceObject["Payment Status"] = `${data[i].order[j].paymentStatus}`;
                invoiceObject["Order Status"] = `${data[i].order[j].status}`;
                invoiceObject["Refund Requested"] = `${data[i].order[j].refundStatus}`;

                invoiceData.push(invoiceObject);
            }
        }

        const json2csvParser = new Json2csvParser({fields});

        let csv = await json2csvParser.parse(invoiceData);
        console.log("csv",csv)
        return csv;
    } catch (err) {
        throw err;
    }
};


const listTransactions = async (payload, userData)=>{
    try{
        let criteria = {
            ...(payload.vendor && {vendor: mongoose.Types.ObjectId(payload.vendor)}),
            status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
            ...(payload.deviceType && {deviceType: payload.deviceType})
        }
        let appDefaults = await Dao.findOne(Models.appDefaults, {
                        
        }, {
            duePaymentDays: 1
        }, {sort: {_id: -1}, limit: 1})

        if(payload.transaction && payload.transaction.length){
            payload.transaction = payload.transaction.map(items=>{
                return mongoose.Types.ObjectId(items)
            })
            criteria._id= {$in: payload.transaction}
        }
        if(payload.startDate & payload.endDate){
            criteria.createdDate = {
                $lte: payload.endDate,
                $gte: payload.startDate
            }
        }
        if(payload.transactionType){
            criteria.transactionType = payload.transactionType
        }
        if (payload.type && payload.type === APP_CONSTANTS.TRANSACTION_LISTING.DUE_PAYMENT){
            criteria.transactionType = {$in: [
                APP_CONSTANTS.TRANSACTION_TYPES.ORDER
            ]};
            criteria.refundStatus = {
                $in: [
                    APP_CONSTANTS.REFUND_STATUS.NOT_REQUESTED,
                    APP_CONSTANTS.REFUND_STATUS.REJECTED
                ]
            }
            criteria.transferred = false;
            criteria.createdDate={
                $lt: +moment().subtract(appDefaults.duePaymentDays?appDefaults.duePaymentDays: 15, "days")
            }
        }

        if(payload.transferred || payload.transferred === false){
            criteria.transferred = payload.transferred
        }

        let pipeline = [
        {
            $match: criteria
        }, 
        {
            $lookup: {
                from : "vendors",
                as: 'vendorData',
                localField: 'vendor',
                foreignField: '_id'
            }
        },
        {
            $unwind: {
                path: '$vendorData',
                preserveNullAndEmptyArrays: true
            }
        },
        ]

        if(payload.vendorName){
            pipeline.push({
                $match: {
                    $or:[{
                        'vendorData.vendorRegisterName': new RegExp(payload.vendorName, 'i')
                    },{
                        'vendorData.firstName': new RegExp(payload.vendorName, 'i')
                    },{
                        'vendorData.lastName': new RegExp(payload.vendorName, 'i')
                    }]
                }
            })
        }

        pipeline.push({
            $sort: {
                _id: -1
            }
        },{
            $project: {
                transactionId: 1,
                createdDate: 1,
                transferred: 1,
                order: 1,
                amountWithTax: 1,
                productPaymentMethodChargeTotal:1,
                productShippingChargeTotal: 1,
                amount: 1,
                productPromoCharges: 1,
                transactionType: 1,
                vendor: 1,
                user: 1
            }
        })
        let count = await Dao.aggregateData(Models.transactions, pipeline)
        if(payload.skip){
            pipeline.push({
                $skip: parseInt(payload.skip)
            })
        }

        if(payload.limit){
            pipeline.push({
                $limit: parseInt(payload.limit)
            })
        }
        let data = await Dao.aggregateDataWithPopulate(Models.transactions, pipeline, [{
            path:'vendor',
            select: 'firstName lastName email vendorRegisterName',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
        },
        {
            path:'order',
            select: 'orderNumber subOrderNumber',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.ORDERS
        },
        {
            path:'user',
            select: 'firstName lastName email vendorRegisterName',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
        }]);

        return {data, count: count.length}
    }catch(e){
        throw e;
    }
}

const transferComplete = async (payload, userData) =>{
    try{
        let findRequest = await Dao.findOne(Models.transferRequest, {_id:payload.transferRequestId},{},{lean: true});
        if(!findRequest){
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID
        }
        else{
            return await Dao.findAndUpdate(Models.transferRequest, {_id: payload.transferRequestId}, {
                status: payload.status
            }, {lean: true})
        }
    }catch(e){
        throw e;
    }
}

const checkRefundRequest = async (payload, userData)=>{
    try{
        let getRequestData = await Dao.populateData(Models.refundRequest, {order: payload.order}, {}, {lean: true}, [{
            path: "selectedReason",
            select: 'name'
        }]);
        if(getRequestData[0]){
            return {
                data: getRequestData[0]
            }
        }
        else{
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.REFUND_REQUEST_DOES_NOT_EXIST
        }
    }catch(e){
        throw e;
    }
}

const listTransferRequests = async (payload, userData) =>{
    try{
        let criteria = {
            ...(payload.status && {status: payload.status})
        };
        if(payload.startDate && payload.endDate){
            criteria.requiredOnDate = {
                $gte: payload.startDate,
                $lte: payload.endDate
            }
        }
        let option = {
            ...(payload.skip && {skip: payload.skip}),
            ...(payload.limit && {limit: payload.limit}),
            lean: true,
            sort: {_id: -1}
        };
        let pipeline = [{
            $match: criteria
        }, {
            $sort: {
                _id: -1
            }
        }]
        if(payload.vendorName){
            pipeline.push({
                $lookup: {
                    localField: 'vendor',
                    foreignField: '_id',
                    as: 'vendorData',
                    from: 'vendors'
                }
            }, {
                $unwind: {
                    path: '$vendorData',
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $match: {
                    $or: [{
                        'vendor.vendorRegisterName': new RegExp(payload.vendorName, 'i')
                    },{
                        'vendor.firstName': new RegExp(payload.vendorName, 'i')
                    },{
                        'vendor.lastName': new RegExp(payload.vendorName, 'i')
                    }]
                }
            })
        }
        let count = await Dao.aggregateData(Models.transferRequest, pipeline);
        if(payload.skip){
            pipeline.push({
                $skip: parseInt(payload.skip)
            })
        }
        if(payload.limit){
            pipeline.push({
                $limit: parseInt(payload.limit)
            })
        }
        let [data] = await Promise.all([
            Dao.aggregateDataWithPopulate(Models.transferRequest, pipeline, [{
                path: 'vendor',
                select: {
                    vendorRegisterName: 1,
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    phoneNumber: 1
                }
            }, {
                path: 'transaction',
                select: {
                    transactionId: 1,
                    createdDate: 1,
                    transferred: 1,
                    order: 1,
                    amountWithTax: 1,
                    productPaymentMethodChargeTotal:1,
                    productShippingChargeTotal: 1,
                    amount: 1,
                    productPromoCharges: 1,
                    transactionType: 1,
                    vendor: 1,
                    user: 1
                }
            }])
        ])
        return {data, count: count.length}
    }catch(e){
        throw e;
    }
}

const transferTransaction = async (payload, userData) =>{
    try{
        let update = await Dao.findAndUpdate(Models.transactions, {_id: payload.transactionId}, {
            transferred: payload.transferred
        }, {lean: true, new: true});

        if(update){
            return update
        }
        else{
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID
        }
    }catch(e){
        throw e;
    }
}


const downloadInvoice = async (payload, userData)=>{
    try{
        return await CommonHelperFunction.invoicePdf(payload, userData, APP_CONSTANTS.APP.DEFAULT_CURRENCY, 1)

    }catch(e){
        throw e;
    }
}

module.exports = {
    listOrders: listOrders,
    listTransactions: listTransactions,
    transferComplete: transferComplete,
    listTransferRequests: listTransferRequests,
    transferTransaction: transferTransaction,
    checkRefundRequest: checkRefundRequest,
    downloadInvoice: downloadInvoice
}
