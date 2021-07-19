// constants imported
const APP_CONSTANTS = require('../../../config').constants.appDefaults;
const RESPONSE_MESSAGES = require('../../../config').constants.responseMessages;

// local modules

const mongoose = require('mongoose');
const moment = require('moment');
const NotificationManager = require('../../../lib/notification-manager');
const CourierManager = require('../../../lib/courier-manager');
const PaytabsManager = require('../../../lib/paytab-manager');
const EmailHandler = require('../../email-helpers/emailHandler');
const CommonHelperFunction = require('../../helper-functions/common');
const UniversalFunctions = require('../../../utils/universal-functions');
const Json2csvParser = require("json2csv").Parser;

const listOrders = async (payload, userData) => {
    try {
        if (payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        let criteria = {
            vendor: mongoose.Types.ObjectId(userData._id),
            ...(payload.orderId && {orderId: mongoose.Types.ObjectId(payload.orderId)}),
            ...(payload.orderNumber && {subOrderNumber: payload.orderNumber}),
            ...(payload._id && {_id: mongoose.Types.ObjectId(payload._id)}),
        }
        if (payload.startDate && payload.endDate) {
            criteria.createdDate = {
                $gte: payload.startDate, $lte: payload.endDate
            }
        }
        if (payload.startPrice && payload.endPrice) {
            criteria.finalTotal = {
                $gte: payload.startPrice, $lte: payload.endPrice
            }
        }
        switch (payload.status) {
            case APP_CONSTANTS.LIST_ORDER_STATUS.ACTIVE:
                criteria.status = {
                    $in: [
                        APP_CONSTANTS.ORDER_STATUS_ENUM.ACCEPTED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.DISPATCHED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.IN_TRANSIT,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.PACKED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.OUT_FOR_DELIVERY,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.ON_HOLD,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.ATTEMPTED_DELIVERY,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.UNABLE_TO_LOCATE,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.SHIPMENT_RETURNED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.ON_HOLD_DAMAGED,
                    ]
                }
                break;
            case APP_CONSTANTS.LIST_ORDER_STATUS.PAST:
                criteria.status = {
                    $in: [
                        APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.REJECTED,
                    ]
                }
                break;
            case APP_CONSTANTS.LIST_ORDER_STATUS.IN_PROCESSING:
                criteria.status = {
                    $in: [
                        APP_CONSTANTS.ORDER_STATUS_ENUM.ACCEPTED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.PACKED,
                    ]
                }
                break;
            case APP_CONSTANTS.LIST_ORDER_STATUS.DISPATCHED:
                criteria.status = {
                    $in: [
                        APP_CONSTANTS.ORDER_STATUS_ENUM.DISPATCHED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.IN_TRANSIT,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.OUT_FOR_DELIVERY,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.ON_HOLD,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.ATTEMPTED_DELIVERY,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.UNABLE_TO_LOCATE,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.SHIPMENT_RETURNED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.ON_HOLD_DAMAGED,
                    ]
                }
                break;
            case APP_CONSTANTS.LIST_ORDER_STATUS.RECEIVED:
                criteria.status = {
                    $in: [
                        APP_CONSTANTS.ORDER_STATUS_ENUM.PLACED,
                    ]
                }
                break;
            case APP_CONSTANTS.LIST_ORDER_STATUS.RETURNED:
                criteria.status = {
                    $in: [
                        APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_ACCEPTED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_INITIATED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_COMPLETED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_CANCELLED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_REQUESTED,
                    ]
                }
                break;
            case APP_CONSTANTS.LIST_ORDER_STATUS.CANCELLED:
                criteria.status = {
                    $in: [
                        APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED_VENDOR,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.REJECTED,
                    ]
                }
                break;
            default:
                break;
        }

        if(payload.orderStatus){
            criteria.status = payload.orderStatus
        }

        let aggregatePipeline = [
            {
                $match: criteria
            },
            {
                $addFields: {
                    showButton: {
                        $switch: {
                            branches: [
                                {case: {$lte: ["$createdDate", +moment().subtract(7, "days")]}, then: true}
                            ],
                            default: false
                        }
                    }
                }
            }
        ];

        if(payload.productName){
            aggregatePipeline.push({
                $lookup:{
                    foreignField: "_id",
                    localField: "products.product",
                    from: 'products',
                    as: 'productData'
                }
            }, {
                $match: {
                    'productData.title.en': new RegExp(await UniversalFunctions.escapeRegex(payload.productName), 'i')
                }
            }, {
                $project: {
                    productData: 0
                }
            })
        }
        if(payload.colorName){
            aggregatePipeline.push({
                $lookup:{
                    foreignField: "_id",
                    localField: "products.color",
                    from: 'commonservices',
                    as: 'colorData'
                }
            }, {
                $match: {
                    'colorData.name.en': new RegExp(await UniversalFunctions.escapeRegex(payload.colorName), 'i')
                }
            }, {
                $project: {
                    colorData: 0
                }
            })
        }

        aggregatePipeline.push(
            {
                $group: {
                    _id: {
                        orderId: "$orderId",
                        orderNumber: "$orderNumber",
                        vendorOrderId: "$vendorOrderId",
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


        let aggregatePipelineCount = [
            {
                $match: criteria
            },
            {
                $group: {
                    _id: {
                        orderId: "$orderId",
                        orderNumber: "$orderNumber",
                        vendorOrderId: "$vendorOrderId",
                        createdDate: "$createdDate"
                    },
                    order: {
                        $push: {
                            _id: "$_id"
                        }
                    }
                }
            }
        ];

        let populate = [
            {
                path: '_id.user',
                select: 'firstName lastName phoneNumber email',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
            },
            {
                path: 'order.user',
                select: 'firstName lastName phoneNumber email',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
            },
            {
                path: 'order.vendor',
                select: 'name vendorRegisterName phoneNumber email firstName lastName ownerId',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
            },
            {
                path: 'order.courierType',
                select: 'name courierServiceUrl',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
            }, {
                path: 'order.products.product',
                select: 'title description images weight',
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
        if(payload.isCSV){
            return await createCSVOrder(order)
        }
        else{
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
                invoiceObject["Product Total Price"] = `${totalPrice}`;
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



const changeOrderStatus = async (payload, userData) => {
    try {
        let findOrders = await Dao.findOne(Models.orders, {
            _id: payload._id
        }, {
            status: 1
        }, {
            lean: true
        })
        if (findOrders) {
            if (payload.status === findOrders.status) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR[payload.status]
            }
            if (payload.status === APP_CONSTANTS.ORDER_STATUS_ENUM.ACCEPTED) {
                if (findOrders.status === APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED) {
                    throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.CANCELLED_BY_USER
                }
            }

            let dataToUpdate = {
                status: payload.status,
                ...(payload.trackingId && {trackingId: payload.trackingId}),
                ...(payload.trackingUrl && {trackingUrl: payload.trackingUrl}),
                ...(payload.courierType && {courierType: payload.courierType}),
                ...(payload.goodDescription && {goodDescription: payload.goodDescription}),
                ...(payload.deliveryInstructions && {deliveryInstructions: payload.deliveryInstructions}),
                ...(payload.labelURL && {labelURL: payload.labelURL}),
                ...(payload.pickupDetails && {pickupDetails: payload.pickupDetails}),
                updatedDate: +new Date(),
                $push: {
                    logs: {
                        status: payload.status,
                        createdDate: +new Date(),
                        actionBy: userData._id,
                        actionByModel: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
                        userType: userData.userType
                    }
                }
            };
            let readyTime = moment().add(1, 'days').format("YYYY/MM/DD") + "09:00:00";
            let closeTime = moment().add(2, 'days').format("YYYY/MM/DD") + "19:00:00";
            if (!payload.pickupDetails) {
                payload.pickupDetails = {
                    ReadyTime: readyTime,
                    CloseTime: closeTime
                }
            }
            let deliveredDate = +new Date()
            if (payload.status === APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED) {
                dataToUpdate.paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED
                dataToUpdate.deliveredDate = deliveredDate;
            }
            if (payload.noDelivery || payload.noDelivery === false) {
                dataToUpdate.noDelivery = payload.noDelivery
            }
            let orderData = await Dao.findAndUpdateWithPopulate(Models.orders, {
                _id: payload._id
            }, dataToUpdate, {new: true}, [{
                path: 'user',
                select: 'firstName lastName email deviceToken deviceType language phoneNumber',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
            }, {
                path: 'products.product',
                select: 'title images weight unit description images',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS
            }, {
                path: 'products.color',
                select: 'name',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
            }, {
                path: 'products.size',
                select: 'name',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
            }, {
                path: 'products.productVariant',
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
            }, {
                path: 'vendor',
                select: 'vendorRegisterName',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
            }]);
            let transactions = await Dao.findOne(Models.transactions, {order: payload._id}, {}, {multi: true});
            if (payload.status === APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED) {
                await Dao.updateMany(Models.transactions, {order: payload._id}, {
                    status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
                    deliveredDate: deliveredDate
                }, {multi: true});
                // await Dao.updateMany(Models.vendorPayments, {order: payload._id}, {status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED}, {multi: true})
            }
            if (payload.status === APP_CONSTANTS.ORDER_STATUS_ENUM.DISPATCHED) {

                if (orderData.processingTill && orderData.processingTill < +new Date()) {
                    let orderPromises = [];
                    let saveCancellationPenalty = {
                        user: orderData.user._id,
                        transactionType: APP_CONSTANTS.TRANSACTION_TYPES.PROCESSING_PENALTY,
                        orderId: orderData.orderId,
                        orderNumber: orderData.orderNumber,
                        paymentMethodCharge: 0,
                        paymentMethodChargePercentage: 0,
                        amount: (transactions.productPrice * transactions.quantity) * 12 / 100,
                        amountWithTax: (transactions.productPrice * transactions.quantity) * 12 / 100,
                        currency: transactions.currency,
                        paymentId: +new Date(),
                        status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
                        transactionId: await UniversalFunctions.generateRandomOTP(),
                        paymentMethod: transactions.paymentMethod,
                        order: orderData._id,
                        vendor: userData._id,
                        vendorOrderId: orderData.vendorOrderId,
                        quantity: transactions.quantity,
                        createdDate: +new Date()
                    };
                    orderPromises.push(Dao.saveData(Models.transactions, saveCancellationPenalty));
                    await Promise.all(orderPromises)
                }

                let transaction = await Dao.findOne(Models.transactions, {order: payload._id}, {}, {lean: true})
                if (!payload.noDelivery || payload.noDelivery === false) {
                    let result = await CourierManager.postShippingShipment(orderData, userData, transaction)
                    if (result [0] && result[0].ShipmentNumber && result[0].ShipmentNumber !== "") {
                        let updateData = {
                            trackingId: result[0].ShipmentNumber,
                            labelURL: result[0].LabelURL,
                            courierCompany: APP_CONSTANTS.COURIER_SERVICE_TYPE.SKYNET
                        }
                        await Dao.findAndUpdate(Models.orders, {_id: payload._id}, updateData, {lean: true})
                    }
                }
            }
            setTimeout(async () => {
                await sendNotificationChangeStatus(payload.status, orderData, userData)
            }, 1000)

            setTimeout(async () => {
                await sendEmailChangeStatus(payload.status, orderData, userData, transactions)
            }, 1000)

            return orderData
        } else {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID
        }
    } catch (e) {
        throw e
    }
}

let sendEmailChangeStatus = async (status, orderData, userData, transactions) => {
    try {
        let orderStatus;
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED)
            orderStatus = `Cancelled`;
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED)
            orderStatus = `Delivered`;
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.PLACED)
            orderStatus = `Placed`;
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.DISPATCHED)
            orderStatus = `Dispatched`;
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.IN_TRANSIT)
            orderStatus = `In Transit`;
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.PACKED)
            orderStatus = `Packed`;
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.ACCEPTED)
            orderStatus = `Confirmed`;

        let subTotal = transactions.productPrice * transactions.quantity;
        let tax = transactions.productTotalTax;
        let promoAmount = orderData.products.promoCharges;
        let shippingCharges = orderData.products.shippingChargesAfterDiscount * orderData.products.quantity;
        let finalTotal = subTotal + tax + shippingCharges - promoAmount;
        let paymentMethods = "Online";
        if(orderData.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.CASH_ON_DELIVERY){
            paymentMethods = "Cash";
        }
        if(orderData.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.WALLET){
            paymentMethods = "Wallet";
        }
        let emailData = {
            status: orderStatus,
            productImage: orderData.products.product.images[0].original,
            websiteUrl: process.env.websiteUrl,
            logoUrl: process.env.logoUrl,
            orderNumber: orderData.orderNumber,
            subOrderNumber: orderData.subOrderNumber,
            createdDate: moment(orderData.createdDate).format('LL'),
            vendorRegisterName: orderData.vendor.vendorRegisterName,
            productName: orderData.products.product.title.en,
            productDescription: orderData.products.product.description.en,
            conversion: orderData.conversion?orderData.conversion:1,
            currency: orderData.currencySelected?orderData.currencySelected:orderData.products.currency,
            productPrice: `${orderData.products.price}`,
            productPriceConverted: `${parseFloat(orderData.products.price * orderData.conversion).toFixed(2)}`,
            subTotal: subTotal,
            paymentMethod: paymentMethods,
            quantity:`${orderData.products.quantity}`,
            promoAmount: promoAmount,
            subTotalBeforeTax: `${subTotal + shippingCharges}`,
            subTotalWithTax: `${subTotal + shippingCharges + tax}`,
            shippingCharges: shippingCharges,
            tax: tax,
            finalTotal: finalTotal,
            name: orderData.deliveryAddress && orderData.deliveryAddress.name ? orderData.deliveryAddress.name : "",
            street: orderData.deliveryAddress && orderData.deliveryAddress.street ? orderData.deliveryAddress.street : "",
            building: orderData.deliveryAddress && orderData.deliveryAddress.building ? orderData.deliveryAddress.building : "",
            country: orderData.deliveryAddress && orderData.deliveryAddress.country ? orderData.deliveryAddress.country : "",
            city: orderData.deliveryAddress && orderData.deliveryAddress.city ? orderData.deliveryAddress.city : "",
            state: orderData.deliveryAddress && orderData.deliveryAddress.state ? orderData.deliveryAddress.state : "",
            countryCode: orderData.deliveryAddress && orderData.deliveryAddress.contactDetails && orderData.deliveryAddress.contactDetails.countryCode ? orderData.deliveryAddress.contactDetails.countryCode : "",
            phoneNo: orderData.deliveryAddress && orderData.deliveryAddress.contactDetails && orderData.deliveryAddress.contactDetails.phoneNo ? orderData.deliveryAddress.contactDetails.phoneNo : ""
        };

        // emailData.productPrice = parseFloat(emailData.productPrice).toFixed(2)
        emailData.subTotal = parseFloat((emailData.subTotal) * (emailData.conversion)).toFixed(2)
        emailData.finalTotal = parseFloat((emailData.finalTotal) * (emailData.conversion)).toFixed(2)
        emailData.promoAmount = parseFloat((emailData.promoAmount) * (emailData.conversion)).toFixed(2)
        emailData.tax = parseFloat((emailData.tax) * (emailData.conversion)).toFixed(2)
        emailData.subTotalBeforeTax = parseFloat((emailData.subTotalBeforeTax) * (emailData.conversion)).toFixed(2)
        emailData.subTotalWithTax = parseFloat((emailData.subTotalWithTax) * (emailData.conversion)).toFixed(2)
        emailData.shippingCharges = parseFloat((emailData.shippingCharges) * (emailData.conversion)).toFixed(2)

        if (orderData.products.color) {
            emailData.color = orderData.products.color.name.en
        }
        if (orderData.products.size) {
            emailData.size = orderData.products.size.name.en
        }
        if (orderData.products.productVariant) {
            if (orderData.products.productVariant.colors) {
                emailData.color = orderData.products.productVariant.colors.name.en
            }
            if (orderData.products.productVariant.sizes) {
                emailData.size = orderData.products.productVariant.sizes.name.en
            }
        }

        let email = orderData.user.email
        let orderId = orderData.orderNumber
        await EmailHandler.sendEmailOrderStatus(emailData, email, orderId)
        return {}
    } catch (e) {
        throw e
    }
}

let sendNotificationChangeStatus = async (status, orderData, userData) => {
    try {

        let userNotificationMessage = await UniversalFunctions.renderMessageAccordingToLanguage(
            APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE[status], {
                orderNumber: orderData.orderNumber,
                subOrderNumber: orderData.subOrderNumber
            }
        )

        let notificationDataUser = {
            savePushData: {
                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE[status],
                message: userNotificationMessage,
                orderId: orderData.orderId,
                order: orderData._id,
                receiver: orderData.user._id,
                createdDate: +new Date(),
                receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                userType: APP_CONSTANTS.USER_TYPE.USER,
                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE[status]
            },
            type: APP_CONSTANTS.USER_TYPE.USER,
            deviceType: orderData.user.deviceType ? orderData.user.deviceType : APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
            sendPushData: {
                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE[status][orderData.user.language ? orderData.user.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                message: userNotificationMessage[orderData.user.language ? orderData.user.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                orderId: orderData.orderId,
                order: orderData._id,
                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE[status]
            },
            deviceToken: orderData.user.deviceToken
        };

        await NotificationManager.sendNotifications(notificationDataUser, true);


        //////////////////////////// admin notifications //////////////////////////

        let findAdmins = await Dao.getData(Models.admin, {status: APP_CONSTANTS.STATUS_ENUM.ACTIVE}, {}, {lean: true});

        let adminNotificationMessage = await UniversalFunctions.renderMessageAccordingToLanguage(
            APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.ADMIN_ORDER_UPDATES[status],
            {
                orderNumber: orderData.orderNumber,
                subOrderNumber: orderData.subOrderNumber
            }
        )

        if (findAdmins.length) {
            for (let key of findAdmins) {

                let notificationDataAdmin = {
                    savePushData: {
                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.ADMIN_ORDER_UPDATES[status],
                        message: adminNotificationMessage,
                        orderId: orderData.orderId,
                        order: orderData._id,
                        vendor: userData._id,
                        receiver: key._id,
                        createdDate: +new Date(),
                        receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.ADMIN,
                        userType: APP_CONSTANTS.USER_TYPE.ADMIN,
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ADMIN_ORDER_UPDATES[status],
                        type: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER
                    },
                    type: APP_CONSTANTS.USER_TYPE.ADMIN,
                    deviceType: userData.deviceType ? userData.deviceType : APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                    sendPushData: {
                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.ADMIN_ORDER_UPDATES[status][key.language ? key.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        message: adminNotificationMessage[key.language ? key.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        orderId: orderData.orderId,
                        order: orderData._id,
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ADMIN_ORDER_UPDATES[status],
                        type: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER
                    },
                    deviceToken: key.deviceToken
                };

                await NotificationManager.sendNotifications(notificationDataAdmin, true);
            }
        }
        return {}

    } catch (e) {
        throw e
    }
}

const addOrEditDiscount = async (payload, userData) => {
    try {
        if (payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        if (payload.discountId) {
            payload.updatedDate = +new Date();
            let findCode = await Dao.findOne(Models.offerAndPromo, {
                code: payload.code,
                _id: {$ne: payload.discountId},
                status: {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED},
                expiryDate: {$gte: +new Date()}
            }, {_id: 1}, {lean: true});
            if (findCode) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.DISCOUNT_IN_USE
            } else {
                return await Dao.findAndUpdate(Models.offerAndPromo, {_id: payload.discountId}, payload, {
                    lean: true,
                    new: true
                })
            }
        } else {
            payload.type = APP_CONSTANTS.PROMO_TYPE.PROMO
            payload.vendor = userData._id;
            let findCode = await Dao.findOne(Models.offerAndPromo, {
                code: payload.code,
                expiryDate: {$gte: +new Date()},
                status: {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED},
            }, {_id: 1}, {lean: true});
            if (findCode) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.DISCOUNT_IN_USE
            }
            return await Dao.saveData(Models.offerAndPromo, payload)
        }
    } catch (e) {

    }
}

const blockUnblockDiscount = async () => {
    try {
        if (payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true})
        }
        let criteria = {
            _id: payload.discountId
        };
        let getUserData = await Dao.findOne(Models.offerAndPromo, criteria, {}, {lean: true});
        if (getUserData) {
            if (payload.action === true && getUserData.status === APP_CONSTANTS.STATUS_ENUM.BLOCKED) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.ALREADY_BLOCKED
            } else if (payload.action === false && getUserData.status === APP_CONSTANTS.STATUS_ENUM.ACTIVE) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.ALREADY_UNBLOCKED
            } else {
                let dataToUpdate = {};
                dataToUpdate.updatedDate = +new Date();
                dataToUpdate.updatedBy = userData._id;
                payload.action === true ? dataToUpdate.status = APP_CONSTANTS.STATUS_ENUM.BLOCKED : dataToUpdate.status = APP_CONSTANTS.STATUS_ENUM.ACTIVE;
                return await Dao.findAndUpdate(Models.offerAndPromo, criteria, dataToUpdate, {lean: true, new: true});
            }
        } else return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID)
    } catch (e) {

    }
}


const deleteDiscount = async (payload, userData) => {
    try {
        if (payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true})
        }
        let findVendor = await Dao.findOne(Models.offerAndPromo, {_id: payload.discountId}, {_id: 1}, {lean: true});
        if (!findVendor) {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID
        }
        let dataToUpdate = {
            status: APP_CONSTANTS.STATUS_ENUM.DELETED,
            updatedDate: +new Date()
        }
        return await Dao.findAndUpdate(Models.offerAndPromo, {_id: payload.discountId}, dataToUpdate, {
            lean: true,
            new: true
        })
    } catch (e) {
        throw e
    }
}

const checkRefundRequest = async (payload, userData) => {
    try {
        if (payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true})
        }
        let getRequestData = await Dao.populateData(Models.refundRequest, {order: payload.order}, {}, {lean: true}, [{
            path: "selectedReason",
            select: 'name'
        }]);
        if (getRequestData[0]) {
            return {
                data: getRequestData[0]
            }
        } else {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.REFUND_REQUEST_DOES_NOT_EXIST
        }
    } catch (e) {
        throw e;
    }
}

const approveRefundRequest = async (payload, userData) => {
    try {
        let parentData = JSON.parse(JSON.stringify(userData))
        if (payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true})
        }
        let getRequestData = await Dao.findOne(Models.refundRequest, {_id: payload.requestId}, {}, {lean: true});
        if (getRequestData) {
            if (getRequestData.status === APP_CONSTANTS.REFUND_STATUS.INITIATED) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.REFUND_ACCEPTED
            } else if (getRequestData.status === APP_CONSTANTS.REFUND_STATUS.REJECTED) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.REFUND_REJECTED
            } else {
                let [orderDetail, transactionDetail, shippingTransaction] = await Promise.all([
                    Dao.findOne(Models.orders, {_id: getRequestData.order}, {}, {}),
                    Dao.findOne(Models.transactions, {
                        order: getRequestData.order,
                        transactionType: APP_CONSTANTS.TRANSACTION_TYPES.ORDER
                    }, {}, {}),
                    Dao.findOne(Models.transactions, {
                        order: getRequestData.order,
                        transactionType: APP_CONSTANTS.TRANSACTION_TYPES.SHIPPING_CHARGES
                    }, {}, {}),
                ])
                let updateOrderData = {
                        status: payload.status,
                        refundStatus: payload.status,
                        returnStatus: payload.status,
                        rejectReason: payload.rejectReason,
                        $push: {
                            logs: {
                                status: payload.status,
                                createdDate: +new Date(),
                                actionBy: userData._id,
                                actionByModel: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
                                userType: userData.userType
                            }
                        }
                    },
                    transactionUpdate = {
                        // status: payload.status,
                        refundStatus: payload.status,
                        rejectReason: payload.rejectReason
                    }, updateRequestRefund = {
                        status: payload.status,
                        rejectReason: payload.rejectReason
                    }

                if (payload.status === APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_INITIATED) {
                    updateOrderData.productRefundAmount = transactionDetail.productPrice - transactionDetail.productPromoCharges;
                    updateOrderData.refundAmount = (transactionDetail.productPrice * getRequestData.refundQuantity) - (transactionDetail.productPromoCharges * getRequestData.refundQuantity);
                    transactionUpdate.productRefundAmount = transactionDetail.productPrice - transactionDetail.productPromoCharges;
                    transactionUpdate.refundAmount = (transactionDetail.productPrice * getRequestData.refundQuantity) - (transactionDetail.productPromoCharges * getRequestData.refundQuantity);
                    updateRequestRefund.productRefundAmount = transactionDetail.productPrice - transactionDetail.productPromoCharges;
                    updateRequestRefund.refundAmount = (transactionDetail.productPrice * getRequestData.refundQuantity) - (transactionDetail.productPromoCharges * getRequestData.refundQuantity);
                }
                let [refundRequest, order, transaction] = await Promise.all([
                    Dao.findAndUpdate(Models.refundRequest, {_id: payload.requestId}, {
                        status: payload.status,
                        rejectReason: payload.rejectReason
                    }),
                    Dao.findAndUpdateWithPopulate(Models.orders, {_id: getRequestData.order}, updateOrderData, {lean: true, new: true}, [{
                        path: 'user',
                        select: {
                            firstName: 1,
                            lastName: 1,
                            phoneNumber: 1,
                            email: 1,
                            deviceType: 1,
                            deviceToken: 1,
                            userType: 1,
                            language: 1
                        }
                    },
                        {
                            path: 'products.product',
                            select: {
                                length: 1,
                                breadth: 1,
                                height: 1,
                                weight: 1
                            },
                            model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS
                        }]),
                    Dao.updateMany(Models.transactions, {
                        order: getRequestData.order,
                        transactionType: APP_CONSTANTS.TRANSACTION_TYPES.ORDER
                    }, transactionUpdate, {multi: true})
                ])
                let readyTime = moment().add(1, 'days').format("YYYY/MM/DD") + " 09:00:00";
                let closeTime = moment().add(2, 'days').format("YYYY/MM/DD") + " 19:00:00";
                if ((!order.noDelivery || order.noDelivery === false) && payload.status === APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_INITIATED) {
                    let senderDetails = {
                            "SenderName": `${order.deliveryAddress.name}`,
                            "SenderCompanyName": ``,
                            "SenderCountryCode": "AE"/*`${order.deliveryAddress.contactDetails.ISO}`*/,
                            "SenderAdd1": `${order.deliveryAddress.street}`,
                            "SenderAdd2": `${order.deliveryAddress.building}`,
                            "SenderAdd3": "",
                            "SenderAddCity": `${order.deliveryAddress.city}`,
                            "SenderAddState": `${order.deliveryAddress.state}`,
                            "SenderAddPostcode": "",
                            "SenderPhone": `${order.deliveryAddress.contactDetails.countryCode}${order.deliveryAddress.contactDetails.phoneNo}`,
                            "SenderEmail": `${order.user.email}`,
                            "SenderFax": "",
                            "SenderKycType": "",
                            "SenderKycNumber": "",
                            "SenderReceivingCountryTaxID": ""
                        },
                        receiverDetails = {
                            "ReceiverName": `${userData.firstName} ${userData.lastName}`,
                            "ReceiverCompanyName": `${userData.vendorRegisterName}`,
                            "ReceiverCountryCode": `${userData.phoneNumber.ISO}`,
                            "ReceiverAdd1": `${userData.address}`,
                            "ReceiverAdd2": ``,
                            "ReceiverAdd3": "",
                            "ReceiverAddCity": ``,
                            "ReceiverAddState": ``,
                            "ReceiverAddPostcode": "",
                            "ReceiverMobile": `${userData.phoneNumber.countryCode}${userData.phoneNumber.phoneNo}`,
                            "ReceiverPhone": "",
                            "ReceiverEmail": `${userData.email}`,
                            "ReceiverAddResidential": "",
                            "ReceiverFax": "",
                            "ReceiverKycType": "",
                            "ReceiverKycNumber": ""
                        },
                        pickupDetails = {
                            ReadyTime: readyTime,
                            CloseTime: closeTime
                        }

                    if (userData.userType === APP_CONSTANTS.USER_TYPE.SUB_VENDOR) {
                        receiverDetails = {
                            "ReceiverName": `${parentData.firstName} ${parentData.lastName}`,
                            "ReceiverCompanyName": `${parentData.vendorRegisterName}`,
                            "ReceiverCountryCode": `${parentData.phoneNumber.ISO}`,
                            "ReceiverAdd1": `${parentData.address}`,
                            "ReceiverAdd2": ``,
                            "ReceiverAdd3": "",
                            "ReceiverAddCity": ``,
                            "ReceiverAddState": ``,
                            "ReceiverAddPostcode": "",
                            "ReceiverMobile": `${parentData.phoneNumber.countryCode}${parentData.phoneNumber.phoneNo}`,
                            "ReceiverPhone": "",
                            "ReceiverEmail": `${parentData.email}`,
                            "ReceiverAddResidential": "",
                            "ReceiverFax": "",
                            "ReceiverKycType": "",
                            "ReceiverKycNumber": ""
                        }
                    }
                    let result = await CourierManager.postShippingShipment(order, parentData, "", senderDetails, receiverDetails, pickupDetails);

                    if (result[0] && result[0].ShipmentNumber && result[0].ShipmentNumber !== "") {
                        console.log("getRequestData.order",getRequestData.order)
                        let updateData = {
                            trackingIdReturn: result[0].ShipmentNumber,
                            labelURLReturn: result[0].LabelURL,
                            courierCompany: APP_CONSTANTS.COURIER_SERVICE_TYPE.SKYNET
                        };
                        await Dao.findAndUpdate(Models.orders, {_id: getRequestData.order}, updateData, {lean: true})
                    }
                }
                if (shippingTransaction) {
                    let orderPromises = [];
                    let saveCancellationPenalty = {
                        user: order.user._id,
                        transactionType: APP_CONSTANTS.TRANSACTION_TYPES.RETURN_SHIPPING_CHARGES,
                        orderId: order.orderId,
                        orderNumber: order.orderNumber,
                        paymentMethodCharge: 0,
                        paymentMethodChargePercentage: 0,
                        amount: shippingTransaction.amount,
                        amountWithTax: shippingTransaction.amountWithTax,
                        currency: shippingTransaction.currency,
                        paymentId: +new Date(),
                        status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
                        transactionId: await UniversalFunctions.generateRandomOTP(),
                        paymentMethod: shippingTransaction.paymentMethod,
                        order: order._id,
                        vendor: userData._id,
                        vendorOrderId: order.vendorOrderId,
                        quantity: shippingTransaction.quantity,
                        createdDate: +new Date()
                    };
                    orderPromises.push(Dao.saveData(Models.transactions, saveCancellationPenalty));
                    await Promise.all(orderPromises)

                }

                setTimeout(async () => {
                    await sendNotificationRefundRequest(refundRequest, order, userData, payload)
                }, 1000)
                return {}
            }
        } else {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID
        }
    } catch (e) {
        throw e;
    }
}

const listDiscount = async (payload, userData) => {
    try {
        if (payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true})
        }
        let criteria = {
            status: {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED},
            vendor: userData._id,
            type: APP_CONSTANTS.PROMO_TYPE.PROMO,
        }
        if (payload.status) {
            if (payload.status === APP_CONSTANTS.DISCOUNT_STATUS.ACTIVE) {
                criteria.expiryDate = {
                    $gte: +new Date()
                }
            } else if (payload.status === APP_CONSTANTS.DISCOUNT_STATUS.EXPIRED) {
                criteria.expiryDate = {
                    $lt: +new Date()
                }
            }
        }
        let options = {
            ...(payload.skip && {skip: payload.skip}),
            ...(payload.limit && {limit: payload.limit}),
            sort: {
                _id: 1
            },
            lean: true
        }
        let [data, count] = await Promise.all([
            Dao.getData(Models.offerAndPromo, criteria, {}, options),
            Dao.countDocuments(Models.offerAndPromo, criteria)
        ])
        return {data, count}
    } catch (e) {
        throw e;
    }
}

const shareDiscount = async (payload, userData) => {
    try {
        if (payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true})
        }
        let discountDetail = await  Dao.findOne(Models.offerAndPromo, {_id: payload.discount}, {}, {})
        console.log(payload.selectedId)
        if (payload.selectedId && payload.selectedId.length) {

            if(payload.type === APP_CONSTANTS.FEED_TYPE.SHARE_DISCOUNT_NOTIFICATION){
                setTimeout(async ()=>{
                    for (let key of payload.selectedId) {
                        let findUserData = await Dao.findOne(Models.user, {_id: key}, {
                            deviceToken: 1,
                            deviceType: 1,
                            userType: 1,
                            language: 1
                        });

                        if(findUserData){
                            let notificationMessage = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.SHARE_DISCOUNT, {
                                vendorRegisterName: `${userData.vendorRegisterName}`,
                                discountCode: `${discountDetail.code}`
                            });
                            let notificationData = {
                                savePushData: {
                                    title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.SHARE_DISCOUNT,
                                    message: notificationMessage,
                                    receiver: findUserData._id,
                                    // user: findUserData._id,
                                    vendor: userData._id,
                                    discount: payload.discount,
                                    createdDate: +new Date(),
                                    privacyType: payload.privacyType,
                                    ...(payload.selectedId && {selectedId: payload.selectedId}),
                                    notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.SHARE_DISCOUNT
                                },
                                type: APP_CONSTANTS.USER_TYPE.USER,
                                deviceType: findUserData.deviceType ? findUserData.deviceType : APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                                sendPushData: {
                                    title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.SHARE_DISCOUNT,
                                    message: notificationMessage[findUserData.language ? findUserData.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                                    notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.SHARE_DISCOUNT
                                },
                                deviceToken: findUserData.deviceToken
                            };

                            await NotificationManager.sendNotifications(notificationData, true);

                        }

                    }
                }, 1000)

            }
            else{
                await addFeed(payload, userData)
            }
        }
    } catch (e) {
        throw e
    }
}

const listFollowers = async (payload, userData) => {
    try {
        if (payload.vendorId) {
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true})
        }
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

        if (payload.skip || payload.skip === 0 && payload.limit) {
            pipeline.push({$skip: parseInt(payload.skip)},
                {$limit: parseInt(payload.limit)})
        }

        pipeline.push({
            $project: {
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
            }
        });

        let promise = [
            Dao.aggregateDataWithPopulate(Models.follow, pipeline, populate),
        ];
        let [data] = await Promise.all(promise);
        return {data, count: count.length}
    } catch (e) {

    }
}


let sendNotificationRefundRequest = async (refundRequest, orderData, userData, payload) => {
    try {

        let userNotificationMessage = await UniversalFunctions.renderMessageAccordingToLanguage(
            APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE[payload.status], {
                orderNumber: orderData.orderNumber,
                subOrderNumber: orderData.subOrderNumber,
                reason: payload.rejectReason ? `, due to reason: ${payload.rejectReason}` : ""
            }
        )

        let notificationDataUser = {
            savePushData: {
                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE[payload.status],
                message: userNotificationMessage,
                orderId: orderData.orderId,
                order: orderData._id,
                receiver: orderData.user._id,
                createdDate: +new Date(),
                rejectReason: payload.rejectReason ? payload.rejectReason : "",
                receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                userType: APP_CONSTANTS.USER_TYPE.USER,
                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE[payload.status]
            },
            type: APP_CONSTANTS.USER_TYPE.USER,
            deviceType: userData.deviceType ? userData.deviceType : APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
            sendPushData: {
                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE[payload.status][userData.language ? userData.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                message: userNotificationMessage[userData.language ? userData.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                orderId: orderData.orderId,
                order: orderData._id,
                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE[payload.status]
            },
            deviceToken: orderData.user.deviceToken
        };

        await NotificationManager.sendNotifications(notificationDataUser, true);


        //////////////////////////// admin notifications //////////////////////////

        let findAdmins = await Dao.getData(Models.admin, {status: APP_CONSTANTS.STATUS_ENUM.ACTIVE}, {}, {lean: true});

        let adminNotificationMessage = await UniversalFunctions.renderMessageAccordingToLanguage(
            APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.ADMIN_ORDER_UPDATES[payload.status],
            {
                orderNumber: orderData.orderNumber,
                subOrderNumber: orderData.subOrderNumber
            }
        )

        if (findAdmins.length) {
            for (let key of findAdmins) {

                let notificationDataAdmin = {
                    savePushData: {
                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.ADMIN_ORDER_UPDATES[payload.status],
                        message: adminNotificationMessage,
                        orderId: orderData.orderId,
                        order: orderData._id,
                        vendor: userData._id,
                        createdDate: +new Date(),
                        rejectReason: payload.rejectReason ? payload.rejectReason : "",
                        receiver: key._id,
                        receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.ADMIN,
                        userType: APP_CONSTANTS.USER_TYPE.ADMIN,
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ADMIN_ORDER_UPDATES[payload.status],
                        type: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER
                    },
                    type: APP_CONSTANTS.USER_TYPE.ADMIN,
                    deviceType: userData.deviceType ? userData.deviceType : APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                    sendPushData: {
                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.ADMIN_ORDER_UPDATES[payload.status][key.language ? key.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        message: adminNotificationMessage[key.language ? key.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        orderId: orderData.orderId,
                        order: orderData._id,
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ADMIN_ORDER_UPDATES[payload.status],
                        type: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER
                    },
                    deviceToken: key.deviceToken
                };

                await NotificationManager.sendNotifications(notificationDataAdmin, true);
            }
        }
        return {}

    } catch (e) {
        throw e
    }
}

const cancelOrder = async (payload, userData) => {
    try {
        let findOrder = await Dao.findOne(Models.orders, {_id: payload.order}, {}, {lean: true});
        if (findOrder) {
            if (findOrder.status === APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.CANCELLED
            }
            if (findOrder.status === APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED_VENDOR) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.CANCELLED
            }
            delete payload._id;
            payload.status = APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED_VENDOR
            payload.$push = {
                logs: {
                    status: payload.status,
                    createdDate: +new Date(),
                    actionBy: userData._id,
                    actionByModel: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
                    userType: userData.userType
                }
            }
            if (findOrder.products.productVariant) {
                let updateProductVariantQuantity = await Dao.findAndUpdate(Models.productVariants, {
                    _id: findOrder.products.productVariant,
                    quantityAvailable: {$ne: null}
                }, {
                    $inc: {
                        quantityAvailable: (parseInt(findOrder.products.quantity))
                    }
                }, {
                    new: true
                })
            } else {
                let updateProductQuantity = await Dao.findAndUpdate(Models.products, {
                    _id: findOrder.products.product,
                    quantityAvailable: {$ne: null}
                }, {
                    $inc: {
                        quantityAvailable: (parseInt(findOrder.products.quantity))
                    }
                }, {
                    new: true
                })
            }
            let orderData = await Dao.findAndUpdateWithPopulate(Models.orders, {_id: findOrder._id}, payload, {
                lean: true,
                new: true
            }, [{
                'path': 'vendor',
                'select': 'deviceType deviceToken language vendorRegisterName',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
            }, {
                path: 'user',
                select: 'firstName lastName email deviceToken deviceType language',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
            }, {
                path: 'products.product',
                select: 'title images',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS
            }, {
                path: 'products.color',
                select: 'name',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
            }, {
                path: 'products.size',
                select: 'name',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
            }, {
                path: 'products.productVariant',
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
            }]);

            let updateTransaction = await Dao.findAndUpdate(Models.transactions, {order: findOrder._id}, {status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.CANCELLED}, {lean: true})
            // let updatePayment = await Dao.findAndUpdate(Models.vendorPayments, {order: findOrder._id}, {status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.CANCELLED}, {lean: true})
            if (updateTransaction && (updateTransaction.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.CREDIT_CARD || updateTransaction.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.DEBIT_CARD)) {
                let refundAmount = await refundOrder(findOrder, updateTransaction, userData)
            }
            if (updateTransaction && (updateTransaction.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.WALLET /*|| updateTransaction.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.CASH_ON_DELIVERY*/)) {
                let refundAmountWallet = await refundOrderWallet(findOrder, updateTransaction, userData)
            }
            let orderPromises = [];
            let saveCancellationPenalty = {
                user: orderData.user._id,
                transactionType: APP_CONSTANTS.TRANSACTION_TYPES.CANCELLATION_PENALTY,
                orderId: orderData.orderId,
                orderNumber: orderData.orderNumber,
                paymentMethodCharge: 0,
                paymentMethodChargePercentage: 0,
                amount: (updateTransaction.productPrice * updateTransaction.quantity) * 12 / 100,
                amountWithTax: (updateTransaction.productPrice * updateTransaction.quantity) * 12 / 100,
                currency: updateTransaction.currency,
                paymentId: +new Date(),
                status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
                transactionId: await UniversalFunctions.generateRandomOTP(),
                paymentMethod: updateTransaction.paymentMethod,
                order: orderData._id,
                vendor: userData._id,
                vendorOrderId: orderData.vendorOrderId,
                quantity: updateTransaction.quantity,
                createdDate: +new Date()
            };
            orderPromises.push(Dao.saveData(Models.transactions, saveCancellationPenalty));
            await Promise.all(orderPromises)
            setTimeout(async () => {
                await sendNotificationCancelOrder(orderData, orderData.user, payload)
            }, 1000)

            setTimeout(async () => {
                await sendEmailCancel(orderData.status, orderData, orderData.user, updateTransaction)
            }, 1000)

            return orderData
        } else {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID
        }
    } catch (e) {
        throw e
    }
}

const refundOrder = async (order, transaction, userData) => {
    try {
        let data = {
            transaction_id: transaction.transactionId,
            refund_amount: transaction.amountWithTax,
            refund_reason: `Order cancelled by ${userData.firstName} ${userData.lastName}`
        }
        let result = await PaytabsManager.refund(data);
        return {}
    } catch (e) {
        throw e
    }
}


let refundOrderWallet = async (order, transaction, userData) => {
    try {
        let dataToSave = {
            user: order.user._id,
            status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
            type: APP_CONSTANTS.CREDIT_TYPE.CREDIT,
            amount: transaction.amount,
            amountWithTax: transaction.amountWithTax
        };

        let save = await Dao.saveData(Models.creditManagement, dataToSave);
        let transactionId = await UniversalFunctions.generateRandomOTP();
        let transactionDataToSave = {
            creditId: save._id,
            user: order.user._id,
            transactionType: APP_CONSTANTS.TRANSACTION_TYPES.WALLET_RETURN,
            tax: 0,
            transactionId: transactionId,
            amount: transaction.amount,
            amountWithTax: transaction.amountWithTax,
            type: APP_CONSTANTS.CREDIT_TYPE.CREDIT,
            currency: APP_CONSTANTS.APP.DEFAULT_CURRENCY,
            status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
            createdDate: +new Date(),
            updatedDate: +new Date(),
        };
        let transaction = await Dao.saveData(Models.transactions, transactionDataToSave);

        await Dao.findAndUpdate(Models.user, {_id: order.user._id}, {
            $inc: {walletMoney: transaction.amountWithTax}
        }, {})
        return {}
    } catch (e) {
        throw e
    }
}

let sendEmailCancel = async (status, orderData, userData, transactions) => {
    try {

        let orderStatus;
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED)
            orderStatus = `Cancelled`
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED)
            orderStatus = `Delivered`
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.PLACED)
            orderStatus = `Placed`
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.DISPATCHED)
            orderStatus = `Dispatched`
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.IN_TRANSIT)
            orderStatus = `In Transit`
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.PACKED)
            orderStatus = `Packed`
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.ACCEPTED)
            orderStatus = `Confirmed`
        if (status === APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED_VENDOR)
            orderStatus = `Cancelled by vendor`

        let subTotal = transactions.productPrice * transactions.quantity;
        let tax = transactions.productTotalTax;
        let promoAmount = orderData.products.promoCharges
        let shippingCharges = orderData.products.shippingChargesAfterDiscount * orderData.products.quantity;
        let finalTotal = subTotal + tax + shippingCharges - promoAmount;
        let emailData = {
            status: orderStatus,
            productImage: orderData.products.product.images[0].original,
            websiteUrl: process.env.websiteUrl,
            logoUrl: process.env.logoUrl,
            subOrderNumber: orderData.subOrderNumber,
            createdDate: moment(orderData.createdDate).format('LL'),
            vendorRegisterName: orderData.vendor.vendorRegisterName,
            productName: orderData.products.product.title.en,
            currency: orderData.currencySelected?orderData.currencySelected:orderData.products.currency,
            conversion: orderData.conversion?orderData.conversion:1,
            productPrice: `${orderData.products.price}`,
            subTotal: subTotal,
            promoAmount: promoAmount,
            subTotalBeforeTax: `${parseFloat(subTotal) + parseFloat(shippingCharges)}`,
            subTotalWithTax: `${parseFloat(subTotal) + parseFloat(shippingCharges) + parseFloat(tax)}`,
            shippingCharges: shippingCharges,
            tax: tax,
            finalTotal: finalTotal,
            name: orderData.deliveryAddress && orderData.deliveryAddress.name ? orderData.deliveryAddress.name : "",
            street: orderData.deliveryAddress && orderData.deliveryAddress.street ? orderData.deliveryAddress.street : "",
            building: orderData.deliveryAddress && orderData.deliveryAddress.building ? orderData.deliveryAddress.building : "",
            country: orderData.deliveryAddress && orderData.deliveryAddress.country ? orderData.deliveryAddress.country : "",
            city: orderData.deliveryAddress && orderData.deliveryAddress.city ? orderData.deliveryAddress.city : "",
            state: orderData.deliveryAddress && orderData.deliveryAddress.state ? orderData.deliveryAddress.state : "",
            countryCode: orderData.deliveryAddress && orderData.deliveryAddress.contactDetails && orderData.deliveryAddress.contactDetails.countryCode ? orderData.deliveryAddress.contactDetails.countryCode : "",
            phoneNo: orderData.deliveryAddress && orderData.deliveryAddress.contactDetails && orderData.deliveryAddress.contactDetails.phoneNo ? orderData.deliveryAddress.contactDetails.phoneNo : ""
        }

        emailData.productPrice = parseFloat((emailData.productPrice) * (emailData.conversion)).toFixed(2)
        emailData.subTotal = parseFloat((emailData.subTotal) * (emailData.conversion)).toFixed(2)
        emailData.finalTotal = parseFloat((emailData.finalTotal) * (emailData.conversion)).toFixed(2)
        emailData.promoAmount = parseFloat((emailData.promoAmount) * (emailData.conversion)).toFixed(2)
        emailData.tax = parseFloat((emailData.tax) * (emailData.conversion)).toFixed(2)
        emailData.subTotalBeforeTax = parseFloat((emailData.subTotalBeforeTax) * (emailData.conversion)).toFixed(2)
        emailData.subTotalWithTax = parseFloat((emailData.subTotalWithTax) * (emailData.conversion)).toFixed(2)
        emailData.shippingCharges = parseFloat((emailData.shippingCharges) * (emailData.conversion)).toFixed(2)

        if (orderData.products.color) {
            emailData.color = orderData.products.color.name.en
        }
        if (orderData.products.size) {
            emailData.size = orderData.products.size.name.en
        }
        if (orderData.products.productVariant) {
            if (orderData.products.productVariant.colors) {
                emailData.color = orderData.products.productVariant.colors.name.en
            }
            if (orderData.products.productVariant.sizes) {
                emailData.size = orderData.products.productVariant.sizes.name.en
            }
        }

        let email = userData.email
        let orderId = orderData.orderNumber
        await EmailHandler.sendEmailCancel(emailData, email, orderId)
        return {}

    } catch (e) {
        throw e
    }
}

let sendNotificationCancelOrder = async (data, userData, payload) => {
    try {

        let userNotificationManagerMessage = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.CANCELLED_VENDOR, {
            orderNumber: data.orderNumber,
            subOrderNumber: data.subOrderNumber,
            reason: payload.cancellationReason ? `, due to reason: ${payload.cancellationReason}` : ""
        });

        let notificationDataUser = {
            savePushData: {
                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.CANCELLED_VENDOR,
                message: userNotificationManagerMessage,
                orderId: data.orderId,
                order: data._id,
                receiver: userData._id,
                createdDate: +new Date(),
                cancellationReason: payload.cancellationReason ? payload.cancellationReason : "",
                receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                userType: APP_CONSTANTS.USER_TYPE.USER,
                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.CANCELLED_VENDOR
            },
            type: APP_CONSTANTS.USER_TYPE.USER,
            deviceType: userData.deviceType ? userData.deviceType : APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
            sendPushData: {
                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.CANCELLED_VENDOR[userData.language ? userData.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                message: userNotificationManagerMessage[userData.language ? userData.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                orderId: data.orderId,
                order: data._id,
                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.CANCELLED_VENDOR
            },
            deviceToken: userData.deviceToken
        };

        await NotificationManager.sendNotifications(notificationDataUser, true);


        ////////////////////////////////////// Vendor Notification //////////////////////////

        let vendorNotificationManagerMessage = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.ORDER_CANCELLED_BY_VENDOR, {
            orderNumber: data.orderNumber,
            subOrderNumber: data.subOrderNumber,
            reason: payload.cancellationReason ? `, due to reason: ${payload.cancellationReason}` : ""
        });

        let notificationDataVendor = {
            savePushData: {
                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.ORDER_CANCELLED_BY_VENDOR,
                message: vendorNotificationManagerMessage,
                // message: APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.ORDER_PLACED_VENDOR,
                orderId: data.orderId,
                order: data._id,
                createdDate: +new Date(),
                cancellationReason: payload.cancellationReason ? payload.cancellationReason : "",
                receiver: data.vendor._id,
                receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
                userType: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER_CANCELLED_BY_VENDOR
            },
            type: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
            deviceType: data.vendor.deviceType ? data.vendor.deviceType : APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
            sendPushData: {
                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.ORDER_CANCELLED_BY_VENDOR[data.vendor.language ? data.vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                // message: APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.ORDER_PLACED_VENDOR[vendorDetails.language ? vendorDetails.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                message: vendorNotificationManagerMessage[data.vendor.language ? data.vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                orderId: data.orderId,
                order: data._id,
                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER_CANCELLED_BY_VENDOR
            },
            deviceToken: data.vendor.deviceToken
        };

        await NotificationManager.sendNotifications(notificationDataVendor, true);

        ///////////////////////////////////// Admin Notification //////////////////////////////

        let getAdminData = await Dao.getData(Models.admin, {status: APP_CONSTANTS.STATUS_ENUM.ACTIVE}, {
            _id: 1,
            deviceToken: 1,
            language: 1,
            deviceType: 1
        })

        let adminMessage = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.ORDER_CANCELLED_BY_VENDOR, {
            orderNumber: data.orderNumber,
            subOrderNumber: data.subOrderNumber
        });


        if (getAdminData.length) {
            for (var key of getAdminData) {
                let notificationDataAdmin = {
                    savePushData: {
                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.ORDER_CANCELLED_BY_VENDOR,
                        message: adminMessage,
                        orderId: data.orderId,
                        order: data._id,
                        createdDate: +new Date(),
                        cancellationReason: payload.cancellationReason ? payload.cancellationReason : "",
                        receiver: key._id,
                        receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.ADMIN,
                        userType: APP_CONSTANTS.USER_TYPE.ADMIN,
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER_CANCELLED_BY_VENDOR,
                        type: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER
                    },
                    type: APP_CONSTANTS.USER_TYPE.ADMIN,
                    deviceType: key.deviceType ? key.deviceType : APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                    sendPushData: {
                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.ORDER_CANCELLED_BY_VENDOR[key.language ? key.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        message: adminMessage[key.language ? key.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        orderId: data.orderId,
                        order: data._id,
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER_CANCELLED_BY_VENDOR,
                        type: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER,
                    },
                    deviceToken: key.deviceToken ? key.deviceToken : ""
                };
                await NotificationManager.sendNotifications(notificationDataAdmin, true);
            }
        }
    } catch (e) {
        throw e
    }
}

let addFeed = async (payload, userData) => {
    try {
        let dataToSave = {
            vendor: userData._id,
            media: payload.media,
            feedBy: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
            ...(payload.selectedId && {selectedId: payload.selectedId}),
            ...(payload.discount && {discount: payload.discount}),
            ...(payload.type && {type: payload.type}),
            privacyType: payload.privacyType
        };
        if (payload.caption || payload.caption === '') dataToSave.caption = payload.caption;
        let savedFeed = await Dao.saveData(Models.feeds, dataToSave);
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


const downloadInvoice = async (payload, userData)=>{
    try{
        return await CommonHelperFunction.invoicePdf(payload, userData, APP_CONSTANTS.APP.DEFAULT_CURRENCY, 1)
    }catch(e){
        throw e;
    }
}


module.exports = {
    listOrders: listOrders,
    changeOrderStatus: changeOrderStatus,
    addOrEditDiscount: addOrEditDiscount,
    blockUnblockDiscount: blockUnblockDiscount,
    deleteDiscount: deleteDiscount,
    checkRefundRequest: checkRefundRequest,
    approveRefundRequest: approveRefundRequest,
    listDiscount: listDiscount,
    listFollowers: listFollowers,
    shareDiscount: shareDiscount,
    cancelOrder: cancelOrder,
    downloadInvoice: downloadInvoice
}
