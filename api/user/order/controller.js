// constants imported
const APP_CONSTANTS = require('../../../config').constants.appDefaults;
const APP_CONSTANTS_MESSAGE = require('../../../config').constants.appContants;

// local modules

const mongoose = require('mongoose');
const moment = require('moment');
const UniversalFunctions = require('../../../utils/universal-functions');
const NotificationManager = require('../../../lib/notification-manager');
const PayTabManager = require('../../../lib/paytab-manager');
const CourierManager = require('../../../lib/courier-manager');
const CommonHelperFunction = require('../../helper-functions/common');
const SocketManager = require('../../../lib/socket-manager');
const EmailHandler = require('../../email-helpers/emailHandler');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

var countries = require("i18n-iso-countries");

const addToCart = async (payload, userData) => {
    try {
        let checkProduct = await Dao.findOne(Models.products, {_id: payload.product}, {vendor: 1}, {lean: true});
        if (!checkProduct) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID;

        let cartCriteria = {
            user: mongoose.Types.ObjectId(userData._id),
            status: {$in: [APP_CONSTANTS.CART_STATUS.ACTIVE]},
        };
        let productCriteria = {
            'products.product': mongoose.Types.ObjectId(payload.product),
            ...(payload.productVariant && {'products.productVariant': mongoose.Types.ObjectId(payload.productVariant)}),
            ...(payload.size && {'products.size': mongoose.Types.ObjectId(payload.size)}),
            ...(payload.color && {'products.color': mongoose.Types.ObjectId(payload.color)})
        };

        let aggregateArray = [
            {
                $match: cartCriteria
            },
            {
                $unwind: {
                    path: '$products',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: productCriteria
            }];

        let [checkCart, checkIfProductExists] = await Promise.all([
            Dao.findOne(Models.cart, cartCriteria, {}, {lean: true}),
            Dao.aggregateDataWithPopulate(Models.cart, aggregateArray, [{
                path: 'products.product',
                select: 'productTangibleType _id',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS
            }]),
        ]);

        if (checkCart) {
            if (checkIfProductExists[0]) {
                let quantity = parseInt(checkIfProductExists[0].products.quantity) + parseInt(payload.quantity);
                if(checkIfProductExists[0].products && checkIfProductExists[0].products.product && checkIfProductExists[0].products.product.productTangibleType && checkIfProductExists[0].products.product.productTangibleType===APP_CONSTANTS.PRODUCT_TANGIBLE_TYPE.DIGITAL){
                    quantity = 1;
                }
                let dataToUpdate = {
                    'products.$.quantity': quantity
                };
                let updateCriteria = {
                    user: userData._id,
                    status: APP_CONSTANTS.CART_STATUS.ACTIVE,
                    products: {
                        $elemMatch: {
                            _id: checkIfProductExists[0].products._id
                        }
                    }
                };
                let updateCart = await Dao.findAndUpdate(Models.cart, updateCriteria, dataToUpdate, {
                    lean: true,
                    new: true
                });

                let dataToSaveCartLogs = {
                    'products.quantity': quantity,
                    status: APP_CONSTANTS.CART_STATUS.PRODUCT_UPDATED,
                    $push: {
                        logs: {
                            quantityChanged: payload.quantity,
                            status: APP_CONSTANTS.CART_STATUS.PRODUCT_UPDATED,
                            createdDate: +new Date(),
                            actionBy: userData._id
                        }
                    }
                };
                await Dao.findAndUpdate(Models.cartLogs, {
                    cart: updateCart._id,
                    productId: checkIfProductExists[0].products._id
                }, dataToSaveCartLogs, {});
                return updateCart
            } else {
                let dataToUpdate = {
                    $push: {
                        products: {
                            vendor: checkProduct.vendor,
                            product: payload.product,
                            ...(payload.productVariant && {productVariant: payload.productVariant}),
                            ...(payload.size && {size: payload.size}),
                            ...(payload.color && {color: payload.color}),
                            quantity: payload.quantity
                        }
                    }
                };
                let updateCart = await Dao.findAndUpdate(Models.cart, cartCriteria, dataToUpdate, {
                    lean: true,
                    new: true
                });

                let dataToSaveCartLogs = {
                    products: {
                        vendor: checkProduct.vendor,
                        product: payload.product,
                        ...(payload.productVariant && {productVariant: payload.productVariant}),
                        ...(payload.size && {size: payload.size}),
                        ...(payload.color && {color: payload.color}),
                        quantity: payload.quantity
                    },
                    productId: updateCart.products[parseInt(updateCart.products.length) - 1] && updateCart.products[parseInt(updateCart.products.length) - 1]._id ? updateCart.products[parseInt(updateCart.products.length) - 1]._id : null,
                    user: userData._id,
                    cart: updateCart._id,
                    status: APP_CONSTANTS.CART_STATUS.PRODUCT_ADDED,
                    logs: [{
                        quantityChanged: payload.quantity,
                        status: APP_CONSTANTS.CART_STATUS.PRODUCT_ADDED,
                        createdDate: +new Date(),
                        actionBy: userData._id
                    }]
                };
                await Dao.saveData(Models.cartLogs, dataToSaveCartLogs);
                return updateCart
            }
        } else {
            let dataToSave = {
                user: userData._id,
                products: [{
                    vendor: checkProduct.vendor,
                    product: payload.product,
                    ...(payload.productVariant && {productVariant: payload.productVariant}),
                    ...(payload.size && {size: payload.size}),
                    ...(payload.color && {color: payload.color}),
                    quantity: payload.quantity
                }]
            };
            let saveCart = await Dao.saveData(Models.cart, dataToSave);
            let dataToSaveCartLogs = {
                products: {
                    vendor: checkProduct.vendor,
                    product: payload.product,
                    ...(payload.productVariant && {productVariant: payload.productVariant}),
                    ...(payload.size && {size: payload.size}),
                    ...(payload.color && {color: payload.color}),
                    quantity: payload.quantity
                },
                productId: saveCart.products[0] && saveCart.products[0]._id ? saveCart.products[0]._id : null,
                user: userData._id,
                cart: saveCart._id,
                status: APP_CONSTANTS.CART_STATUS.PRODUCT_ADDED,
                logs: [{
                    quantityChanged: payload.quantity,
                    status: APP_CONSTANTS.CART_STATUS.PRODUCT_ADDED,
                    createdDate: +new Date(),
                    actionBy: userData._id
                }]
            };
            await Dao.saveData(Models.cartLogs, dataToSaveCartLogs);
            return saveCart
        }
    } catch (e) {
        throw e
    }
};

const updateCart = async (payload, userData) => {
    try {
        let dataToUpdate = {
            'products.$.quantity': payload.quantity,
            ...(payload.productVariant && {'products.$.productVariant': payload.productVariant}),
            ...(payload.size && {'products.$.size': payload.size}),
            ...(payload.color && {'products.$.color': payload.color}),
        };
        let updateCriteria = {
            _id: payload.cart,
            products: {
                $elemMatch: {
                    _id: payload.productId
                }
            }
        };
        let updatedCart = await Dao.findAndUpdate(Models.cart, updateCriteria, dataToUpdate, {
            lean: true,
            new: true
        });

        let dataToSaveCartLogs = {
            'products.quantity': payload.quantity,
            ...(payload.size && {'products.size': payload.size}),
            ...(payload.color && {'products.color': payload.color}),
            ...(payload.productVariant && {'products.productVariant': payload.productVariant}),
            status: APP_CONSTANTS.CART_STATUS.PRODUCT_UPDATED,
            $push: {
                logs: {
                    quantityChanged: payload.quantity,
                    status: APP_CONSTANTS.CART_STATUS.PRODUCT_UPDATED,
                    createdDate: +new Date(),
                    actionBy: userData._id
                }
            }
        };
        await Dao.findAndUpdate(Models.cartLogs, {
            cart: payload.cart,
            productId: payload.productId
        }, dataToSaveCartLogs, {});
        return updatedCart
    } catch (e) {
        throw e
    }
};

const viewCart = async (userData) => {
    try {
        let criteria = {
            status: APP_CONSTANTS.CART_STATUS.ACTIVE,
            user: userData._id
        };
        let option = {
            lean: true,
            sort: {
                _id: -1
            }
        };
        let projection = {
            user: 1,
            products: 1
        };
        let populate = [
            {
                path: 'user',
                select: 'name'
            },
            {
                path: 'products.product',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS,
                select: 'price currency shippingCharges availableForSale rating noOfRating title description discount images videos quantityAvailable tax productTangibleType'
            },
            {
                path: 'products.vendor',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
                select: 'name vendorRegisterName hashTag'
            },
            {
                path: 'products.size',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
                select: 'name'
            },
            {
                path: "products.color",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES,
                select: 'name'
            },
            {
                path: "products.productVariant",
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCT_VARIANTS
            }
        ];
        return await Dao.populateData(Models.cart, criteria, projection, option, populate);
    } catch (e) {
        throw e
    }
};

const removeProduct = async (payload, userData) => {
    try {
        let criteria = {
            user: userData._id,
            _id: payload.cart,
        };
        let dataToUpdate = {
            $pull: {
                products: {
                    _id: payload.productId
                }
            }
        };
        if(payload.lastProduct){
            dataToUpdate.status = APP_CONSTANTS.CART_STATUS.EMPTY
        }
        let options = {
            lean: true,
            new: true
        };
        let updatedCart = await Dao.findAndUpdate(Models.cart, criteria, dataToUpdate, options);
        let dataToSaveCartLogs = {
            status: APP_CONSTANTS.CART_STATUS.PRODUCT_REMOVED,
            $push: {
                logs: {
                    status: APP_CONSTANTS.CART_STATUS.PRODUCT_REMOVED,
                    createdDate: +new Date(),
                    actionBy: userData._id
                }
            }
        };
        await Dao.findAndUpdate(Models.cartLogs, {
            cart: payload.cart,
            productId: payload.productId
        }, dataToSaveCartLogs, {});
        return updatedCart
    } catch (e) {
        throw e
    }
};

const applyPromo = async (payload, userData) => {
    try {
        let products = [];
        let checkCode = await Dao.findOne(Models.offerAndPromo, {
            code: payload.code,
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            expiryDate: {$gt: +new Date()}
        }, {}, {lean: true});
        if(!checkCode){
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_DISCOUNT_COUPON
        }
        else{
            let getOrdersforCode = await Dao.aggregateData(Models.orders, [{
                $match: {
                    discountId: mongoose.Types.ObjectId(checkCode._id)
                }
            },
            {
                $group: {
                    _id: "$orderId",
                    data: {
                        $push: {
                            _id: "$_id"
                        }
                    }
                }
            }])
            if(getOrdersforCode.length>=checkCode.usageTime){
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.DISCOUNT_COUPON_USAGE_EXCEEDED
            }
            let findVendor = payload.products.filter(items=>{
                return items.vendor.toString() === checkCode.vendor.toString()
            })
            let findNonPromoVendor = payload.products.filter(items=>{
                return items.vendor.toString() !== checkCode.vendor.toString()
            })
            if(!findVendor.length){
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_DISCOUNT_COUPON_VENDOR
            }
            for(let prod of findVendor){
                let discountValue = checkCode.value;
                let productAmount = prod.price * prod.quantity;
                let promocharges = productAmount * discountValue / 100;
                prod.promoCharges = promocharges;
                products.push(prod)
            }
            for(let prods of findNonPromoVendor){
                prods.promoCharges = 0;
                products.push(prods)
            }
            await Dao.findAndUpdate(Models.cart, {_id: payload.cart}, {discountId: checkCode._id, discountCode: checkCode.code}, {})
            return {
                products,
                discountId: checkCode._id,
                discountCode: payload.code,
                discountValue: checkCode.value,
                discountValueType: checkCode.valueType
            }
        }
    } catch (e) {
        throw e
    }
};

const placeOrder = async (payload, userData) => {
    console.log("payload", JSON.stringify(payload));
    try {
        let paymentUrl, pId, paymentStatus, status = APP_CONSTANTS.ORDER_STATUS_ENUM.PLACED;
        if (payload.from === APP_CONSTANTS.ORDER_FROM.CART) {
            let cartCriteria = {
                _id: payload.cart
            }, cartProjection = {
                user: 1,
                products: 1,
            }, options = {
                lean: true
            };
            let findCartDetails = await Dao.findOne(Models.cart, cartCriteria, cartProjection, options);
            if (findCartDetails) {
                if (findCartDetails.products && findCartDetails.products.length && payload.products) {
                    let orderCounter = await Dao.findAndUpdate(Models.counter, {type: APP_CONSTANTS.COUNTER_TYPE.ORDER}, {$inc: {count: 1}}, {
                        new: true,
                        upsert: true
                    });
                    console.log("counter,counter", orderCounter);
                    let Id = await UniversalFunctions.completeString(orderCounter.count.toString(), 10);

                    let invoiceCounter = await Dao.findAndUpdate(Models.counter, {type: APP_CONSTANTS.COUNTER_TYPE.INVOICE}, {$inc: {count: 1}}, {
                        new: true,
                        upsert: true
                    });
                    console.log("counter,counter", invoiceCounter);
                    let invoiceId = await UniversalFunctions.completeString(invoiceCounter.count.toString(), 12);
                    invoiceId = `${APP_CONSTANTS.INVOICE_TYPE.MV}${invoiceId}`
                    let filterVendors = [];
                    if (payload.products.length) {
                        for (let data of payload.products) {
                            let vendorExists = filterVendors.some(items => {
                                return items.toString() === data.vendor.toString()
                            });
                            if (!vendorExists) filterVendors.push(data.vendor)
                        }
                    }
                    let orderIdType;
                    if (filterVendors.length <= 1) {
                        orderIdType = APP_CONSTANTS.ORDER_TYPE.ONE;
                    } else orderIdType = APP_CONSTANTS.ORDER_TYPE.MANY;

                    if (payload.paymentMethod) {
                        if (payload.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.CREDIT_CARD || payload.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.DEBIT_CARD) {
                            let paymentResult = await doPayment(payload, userData, Id, orderIdType);
                            if (paymentResult) {
                                if ((paymentResult.response_code === 4012 || paymentResult.response_code === "4012") && paymentResult.p_id && paymentResult.payment_url) {
                                    paymentUrl = paymentResult.payment_url;
                                    pId = paymentResult.p_id;
                                    paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING;
                                    status = APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_PENDING;
                                } else {
                                    paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED;
                                    status = APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_FAILED;
                                }
                            } else {
                                paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED;
                                status = APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_FAILED;
                            }
                        } else if (payload.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.WALLET) {
                            if (userData.walletMoney >= payload.finalTotal) {
                                paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED;
                                status = APP_CONSTANTS.ORDER_STATUS_ENUM.PLACED;
                            } else {
                                paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED;
                                status = APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_FAILED;
                            }
                        } else {
                            paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING;
                            status = APP_CONSTANTS.ORDER_STATUS_ENUM.PLACED;
                        }
                    }

                    return await createOrder(payload, userData, orderCounter, Id, orderIdType, filterVendors, paymentUrl, pId, paymentStatus, status, invoiceId)
                } else throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.CART_EMPTY
            } else throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID;
        } else {
            let orderCounter = await Dao.findAndUpdate(Models.counter, {type: APP_CONSTANTS.COUNTER_TYPE.ORDER}, {$inc: {count: 1}}, {
                new: true,
                upsert: true
            });
            console.log("counter,counter", orderCounter);
            let Id = await UniversalFunctions.completeString(orderCounter.count.toString(), 10);
            let invoiceCounter = await Dao.findAndUpdate(Models.counter, {type: APP_CONSTANTS.COUNTER_TYPE.INVOICE}, {$inc: {count: 1}}, {
                new: true,
                upsert: true
            });
            console.log("counter,counter", invoiceCounter);
            let invoiceId = await UniversalFunctions.completeString(invoiceCounter.count.toString(), 12);
            invoiceId = `${APP_CONSTANTS.INVOICE_TYPE.MV}${invoiceId}`
            let filterVendors = [];
            if (payload.products.length) {
                for (let data of payload.products) {
                    let vendorExists = filterVendors.some(items => {
                        return items.toString() === data.vendor.toString()
                    });
                    if (!vendorExists) filterVendors.push(data.vendor)
                }
            }
            let orderIdType;
            if (filterVendors.length <= 1) {
                orderIdType = APP_CONSTANTS.ORDER_TYPE.ONE;
            } else orderIdType = APP_CONSTANTS.ORDER_TYPE.MANY;

            if (payload.paymentMethod) {
                if (payload.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.CREDIT_CARD || payload.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.DEBIT_CARD) {
                    let paymentResult = await doPayment(payload, userData, Id, orderIdType);
                    if (paymentResult) {
                        if ((paymentResult.response_code === 4012 || paymentResult.response_code === "4012") && paymentResult.p_id && paymentResult.payment_url) {
                            paymentUrl = paymentResult.payment_url;
                            pId = paymentResult.p_id;
                            paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING;
                            status = APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_PENDING;
                        } else {
                            paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED;
                            status = APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_FAILED;
                        }
                    } else {
                        paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED;
                        status = APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_FAILED;
                    }
                } else if (payload.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.WALLET) {
                    if (userData.walletMoney >= payload.finalTotal) {
                        paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED;
                        status = APP_CONSTANTS.ORDER_STATUS_ENUM.PLACED;
                    } else {
                        paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED;
                        status = APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_FAILED;
                    }
                } else {
                    paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING;
                    status = APP_CONSTANTS.ORDER_STATUS_ENUM.PLACED;
                }
            }
            return await createOrder(payload, userData, orderCounter, Id, orderIdType, filterVendors, paymentUrl, pId, paymentStatus, status, invoiceCounter.count.toString())
        }
    } catch (e) {
        console.log("Errrrrrrrooooorrrrrrrrrrrrr in Place Order Function", e);
        throw e
    }
};

let doPayment = async (payload, userData, Id, orderIdType, orderNumber, transaction, url) => {
    try {
        let iso3;
        if (payload.deliveryAddress.contactDetails.ISO) {
            iso3 = countries.alpha2ToAlpha3(payload.deliveryAddress.contactDetails.ISO)
        }
        let amount = transaction && transaction.amountWithTax || 0;
        let data = {
            'currency': "AED",      //change this to the required currency
            'amount': amount ? amount : payload.finalTotal,      //change this to the required amount
            'site_url': process.env.site_url,       //change this to reflect your site
            'title': orderNumber ? `Order Id - ${orderNumber}` : `Order Id - ${orderIdType}${Id}`,        //Change this to reflect your order title
            'quantity': 1,      //Quantity of the product
            'unit_price': amount ? amount : payload.finalTotal,       //Quantity * price must be equal to amount
            'products_per_title': orderNumber ? `Order Id - ${orderNumber}` : `Order Id - ${orderIdType}${Id}`,      //Change this to your products
            'return_url': url?url:process.env.return_url,       //This should be your callback url
            'cc_first_name': userData.firstName?userData.firstName:"NA",        //Customer First Name
            'cc_last_name': userData.lastName?userData.lastName:"NA",      //Customer Last Name
            'cc_phone_number': payload.deliveryAddress && payload.deliveryAddress.contactDetails && payload.deliveryAddress.contactDetails.countryCode.toString().replace('+', '00') ? payload.deliveryAddress.contactDetails.countryCode : userData.phoneNumber.countryCode.toString().replace('+', '00'),        //Country code
            'phone_number': payload.deliveryAddress && payload.deliveryAddress.contactDetails && payload.deliveryAddress.contactDetails.phoneNo ? payload.deliveryAddress.contactDetails.phoneNo : userData.phoneNumber.phoneNo,      //Customer Phone
            'billing_address': `${payload.billingAddress.building}, ${payload.billingAddress.street}`,        //Billing Address
            'city': iso3 && iso3 === "USA" ? payload.billingAddress.city : "NA",          //Billing City
            'state': iso3 && iso3 === "USA" ? payload.billingAddress.state : "NA",        //Billing State
            'postal_code': "NA",     //Postal Code
            'country': iso3 ? iso3 : "UAE",        //Iso 3 country code
            'email': userData.email,        //Customer Email
            'ip_customer': 'NA',        //Pass customer IP here
            'ip_merchant': 'NA',        //Change this to your server IP
            'address_shipping': `${payload.deliveryAddress.building}, ${payload.deliveryAddress.street}`,      //Shipping Address
            'city_shipping': iso3 && iso3 === "USA" ? payload.deliveryAddress.city : "NA",        //Shipping City
            'state_shipping': iso3 && iso3 === "USA" ? payload.deliveryAddress.state : "NA",      //Shipping State
            'postal_code_shipping': "NA",
            'country_shipping': iso3 ? iso3 : "IND",
            'other_charges': 0,        //Other chargs can be here
            'reference_no': +new Date(),      //Pass the order id on your system for your reference
            'msg_lang': 'en',       //The language for the response
            'cms_with_version': 'Nodejs Lib v1',        //Feel free to change this
        };
        return await PayTabManager.createPage(data)
    } catch (e) {
        console.log("Errrrrrrrooooorrrrrrrrrrrrr in doPayment Function", e);
        throw e
    }
};

let createOrder = async (payload, userData, orderCounter, Id, orderIdType, filterVendors, paymentUrl, pId, paymentStatus, status, invoiceNumber) => {
    try {
        let createdDate = +new Date();

        let productsForEmail = [];

        // console.log("counter,counter", orderCounter);
        // let Id = await UniversalFunctions.completeString(orderCounter.count.toString(), 10);
        let orderId = mongoose.Types.ObjectId();
        let singleOrderId, shippingObj;
        let orderNumber = `${orderIdType}${Id}`;
        let paymentId = +new Date();
        let totalPaymentMethodCharge = 0;
        let totalPromoCharges = 0;
        let transactionId = await UniversalFunctions.generateRandomOTP()
        for(let prod of payload.products){
            let lastSubscription = await Dao.populateData(Models.subscriptionLogs, {
                type: APP_CONSTANTS.PLAN_TYPE.NORMAL,
                vendor: prod.vendor
            }, {
                plan: 1
            }, {sort: {_id: -1}, limit: 1}, [{
                path: 'plan',
                select: {
                    onlineCreditCardRates: 1,
                    CODRates: 1,
                    walletRates: 1,
                }
            }])

            let paymentMethodChargePercentage = 0;
            let paymentMethodCharge = 0;
            if(payload.paymentMethod && lastSubscription[0]){
                if(payload.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.CASH_ON_DELIVERY){
                    paymentMethodChargePercentage = lastSubscription[0].plan.CODRates;
                    paymentMethodCharge = prod.price * paymentMethodChargePercentage/100
                }
                else if(payload.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.WALLET){
                    paymentMethodChargePercentage = lastSubscription[0].plan.walletRates
                    paymentMethodCharge = prod.price * paymentMethodChargePercentage/100
                }
                else if(payload.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.CREDIT_CARD || payload.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.DEBIT_CARD){
                    paymentMethodChargePercentage = lastSubscription[0].plan.onlineCreditCardRates
                    console.log("paymentMethodChargePercentage", paymentMethodChargePercentage)
                    paymentMethodCharge = prod.price * paymentMethodChargePercentage/100
                    console.log("paymentMethodCharge", paymentMethodCharge)

                }
            }
            prod.paymentMethodCharge = paymentMethodCharge;
            prod.paymentMethodChargePercentage = paymentMethodChargePercentage;
            totalPaymentMethodCharge += (prod.paymentMethodCharge * prod.quantity);
            totalPromoCharges += (prod.promoCharges);
        }

        for (let key of payload.products) {
            let [getOrderForVendor, vendorDetails, productDetails] = await Promise.all([
                Dao.findOne(Models.orders, {
                    orderId: orderId,
                    vendor: key.vendor
                }, {}, {lean: true}),
                Dao.findOne(Models.vendors, {_id: key.vendor}, {
                    vendorRegisterName: 1,
                    deviceType: 1,
                    deviceToken: 1,
                    userType: 1,
                    language: 1,
                    subscription: 1,
                }, {lean: true}),
                Dao.findOne(Models.products, {_id: key.product}, {productNumber: 1, title: 1, images: 1, nonRefundable: 1, shipping: 1, description: 1, }, {lean: true})
            ])
            let processingTime = productDetails.shipping && productDetails.shipping.processingTime?parseInt(productDetails.shipping.processingTime):0
            let color, size, productVariant;
            if (key.color) {
                color = await Dao.findOne(Models.commonServices, {_id: key.color}, {name: 1}, {lean: true})
            }
            if (key.size) {
                size = await Dao.findOne(Models.commonServices, {_id: key.size}, {name: 1}, {lean: true})
            }
            if (key.productVariant) {
                productVariant = await Dao.populateData(Models.productVariants, {_id: key.productVariant}, {
                    colors: 1,
                    sizes: 1
                }, {lean: true}, [{
                    path: 'colors',
                    select: 'name',
                    model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
                }, {
                    path: 'sizes',
                    select: 'name',
                    model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
                }])
            }
            let timestamp = +new Date();
            let name = vendorDetails.vendorRegisterName.toString().replace(/\s/g, '');

            let subOrderCounter = await Dao.findAndUpdate(Models.counter, {type: APP_CONSTANTS.COUNTER_TYPE.SUB_ORDER}, {$inc: {count: 1}}, {
                new: true,
                upsert: true
            });

            // let subOrderNumber = `${name.toUpperCase().substring(0, 3)}${timestamp.toString().substring(7, 13)}`
            let subId = await UniversalFunctions.completeString(subOrderCounter.count.toString(), 6);

            let subOrderNumber = `${name.toUpperCase().substring(0, 3)}${subId}`;
            let processingTill
            if(processingTime)
            processingTill = +moment().add(processingTime, 'days')

            let dataToSave = {
                user: userData._id,
                vendor: key.vendor,
                ...(payload.cart && {cart: key.cart}),
                orderId: orderId,
                vendorOrderId: getOrderForVendor && getOrderForVendor.vendorOrderId ? getOrderForVendor.vendorOrderId : mongoose.Types.ObjectId(),
                orderNumber: orderNumber.toString(),
                subOrderNumber: subOrderNumber,
                productNumber: productDetails.productNumber,
                finalSubOrderNumber: `${subOrderNumber}.${productDetails.productNumber}`,
                products: key,
                subTotal: payload.subTotal,
                tax: payload.tax,
                invoiceNumber: invoiceNumber,
                nonRefundable: productDetails.nonRefundable,
                promoCharges: totalPromoCharges,
                ...(payload.discountCode && {discountCode: payload.discountCode}),
                ...(payload.discountValue && {discountValue: payload.discountValue}),
                ...(payload.discountValueType && {discountValueType: payload.discountValueType}),
                ...(payload.discountId && {discountId: payload.discountId}),
                ...(processingTill && {processingTill: processingTill}),
                deviceType: userData.deviceType || APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                deliveryCharges: payload.deliveryCharges,
                shippingCharges:  payload.deliveryCharges,
                shippingChargesAfterDiscount:  payload.deliveryCharges,
                shippingChargesDiscount:  payload.shippingChargesDiscount,
                paymentMethodCharge:  totalPaymentMethodCharge,
                deliveryAddress: payload.deliveryAddress,
                billingAddress: payload.billingAddress,
                finalTotal: payload.finalTotal,
                currency: payload.currency,
                currencySelected: payload.currencySelected,
                conversion: payload.conversion,
                paymentStatus: paymentStatus,
                status: status,
                paymentMethod: payload.paymentMethod,
                logs: [{
                    status: APP_CONSTANTS.ORDER_STATUS_ENUM.PLACED,
                    createdDate: +new Date(),
                    actionBy: userData._id,
                    actionByModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                    userType: userData.userType
                }],
                createdDate: createdDate
            };
            if (pId) {
                dataToSave.pId = pId
            }

            let saveOrder = await Dao.saveData(Models.orders, dataToSave);
            singleOrderId = saveOrder._id;
            console.log("saveOrder.promoChargessaveOrder.promoCharges",saveOrder.promoCharges)
            let paymentMethods = "Online"
            if(payload.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.CASH_ON_DELIVERY){
                paymentMethods = "Cash"
            }
            if(payload.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.WALLET){
                paymentMethods = "Wallet"
            }
            let obj = {
                status: saveOrder.status,
                productImage: productDetails.images[0].original,
                websiteUrl: process.env.websiteUrl,
                logoUrl: process.env.logoUrl,
                subOrderNumber: saveOrder.subOrderNumber,
                orderNumber: saveOrder.orderNumber,
                createdDate: moment(saveOrder.createdDate).format('LL'),
                vendorRegisterName: vendorDetails.vendorRegisterName,
                productName: productDetails.title.en,
                productDescription: productDetails.description.en,
                currency: saveOrder.currencySelected?saveOrder.currencySelected:saveOrder.products.currency,
                conversion: saveOrder.conversion?saveOrder.conversion:1,
                productPrice: `${saveOrder.products.price}`,
                productPriceConverted: `${parseFloat(saveOrder.products.price * saveOrder.conversion).toFixed(2)}`,
                quantity: `${saveOrder.products.quantity}`,
                subTotal: `${saveOrder.subTotal}`,
                promoAmount: `${saveOrder.promoCharges}`,
                tax: `${saveOrder.tax}`,
                paymentMethod: `${paymentMethods}`,
                invoiceNumber: `${saveOrder.invoiceNumber}`,
                deviceType: userData.deviceType || APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                shippingCharges: `${saveOrder.shippingChargesAfterDiscount}`,
                finalTotal: `${saveOrder.finalTotal}`,
                name: saveOrder.deliveryAddress && saveOrder.deliveryAddress.name ? saveOrder.deliveryAddress.name : "",
                street: saveOrder.deliveryAddress && saveOrder.deliveryAddress.street ? saveOrder.deliveryAddress.street : "",
                building: saveOrder.deliveryAddress && saveOrder.deliveryAddress.building ? saveOrder.deliveryAddress.building : "",
                country: saveOrder.deliveryAddress && saveOrder.deliveryAddress.country ? saveOrder.deliveryAddress.country : "",
                city: saveOrder.deliveryAddress && saveOrder.deliveryAddress.city ? saveOrder.deliveryAddress.city : "",
                state: saveOrder.deliveryAddress && saveOrder.deliveryAddress.state ? saveOrder.deliveryAddress.state : "",
                countryCode: saveOrder.deliveryAddress && saveOrder.deliveryAddress.contactDetails && saveOrder.deliveryAddress.contactDetails.countryCode ? saveOrder.deliveryAddress.contactDetails.countryCode : "",
                phoneNo: saveOrder.deliveryAddress && saveOrder.deliveryAddress.contactDetails && saveOrder.deliveryAddress.contactDetails.phoneNo ? saveOrder.deliveryAddress.contactDetails.phoneNo : ""
            };
            if (color) {
                obj.color = color.name.en
            }
            if (size) {
                obj.size = size.name.en
            }
            if (productVariant && productVariant.length) {
                obj.color = productVariant[0].colors.name.en
            }
            if (productVariant) {
                obj.size = productVariant[0].sizes.name.en
            }
            productsForEmail.push(obj)

            let orderPromises = []
            orderPromises.push(Dao.findAndUpdate(Models.products, {
                _id: key.product,
            }, {
                $inc: {
                    orderCount: 1
                }
            }, {
                new: true
            }))
            
            if (key.productVariant) {
                orderPromises.push(Dao.findAndUpdate(Models.productVariants, {
                    _id: key.productVariant,
                    $and: [{quantityAvailable: {$ne: null}}, {quantityAvailable: {$ne: 0}}]
                }, {
                    $inc: {
                        quantityAvailable: -(parseInt(key.quantity))
                    }
                }, {
                    new: true
                }))
            } else {
                orderPromises.push(Dao.findAndUpdate(Models.products, {
                    _id: key.product,
                    $and: [{quantityAvailable: {$ne: null}}, {quantityAvailable: {$ne: 0}}]
                }, {
                    $inc: {
                        quantityAvailable: -(parseInt(key.quantity)),
                    }
                }, {
                    new: true
                }))
            }
            if (!payload.deliveryAddress._id)
                await addOrEditAddress(payload.deliveryAddress, userData);
            if (!payload.billingAddress._id && !payload.billingAddress.sameAsDelivery)
                await addOrEditAddress(payload.billingAddress, userData);
            
            // let saveVendorPayment = {
            //     order: saveOrder._id,
            //     orderId: orderId,
            //     vendor: key.vendor,
            //     vendorOrderId: saveOrder.vendorOrderId,
            //     user: userData._id,
            //     transactionType: APP_CONSTANTS.TRANSACTION_TYPES.ORDER,
            //     orderNumber: orderNumber,
            //     subTotal: payload.subTotal,
            //     tax: payload.tax,
            //     shippingCharges:  payload.shippingCharges,
            //     shippingChargesAfterDiscount:  payload.shippingChargesAfterDiscount,
            //     shippingChargesDiscount:  payload.shippingChargesDiscount,
            //     paymentMethodCharge:  payload.paymentMethodCharge,
            //     deliveryCharges: payload.deliveryCharges,
            //     deliveryAddress: payload.deliveryAddress,
            //     billingAddress: payload.billingAddress,
            //     finalTotal: payload.finalTotal,
            //     amount: payload.finalTotal,
            //     paymentMethod: payload.paymentMethod,
            //     productTax: (key.price * key.tax) / 100,
            //     productTotalTax: (key.price * key.tax) / 100 * key.quantity,
            //     productPrice: key.price,
            //     quantity: key.quantity,
            //     status: paymentStatus,
            //     currency: payload.currency,
            //     paymentId: paymentId,
            //     createdDate: createdDate
            // };
            // if (pId) {
            //     saveVendorPayment.pId = pId
            // }
            // orderPromises.push(Dao.saveData(Models.vendorPayments, saveVendorPayment));
            console.log("key.taxkey.taxkey.tax", key.tax);
            let saveTransaction = {
                user: userData._id,
                transactionType: APP_CONSTANTS.TRANSACTION_TYPES.ORDER,
                orderId: orderId,
                orderNumber: orderNumber,
                subTotal: payload.subTotal,
                tax: payload.tax,
                transactionId: transactionId,
                invoiceNumber: invoiceNumber,
                promoCharges:  payload.promoCharges,
                shippingCharges:  payload.deliveryCharges,
                shippingChargesAfterDiscount:  payload.deliveryCharges,
                shippingChargesDiscount:  payload.shippingChargesDiscount,
                paymentMethodCharge:  totalPaymentMethodCharge,
                productPaymentMethodCharge: key.paymentMethodCharge,
                productPaymentMethodChargePercentage: key.paymentMethodChargePercentage,
                deliveryCharges: payload.deliveryCharges,
                deliveryAddress: payload.deliveryAddress,
                billingAddress: payload.billingAddress,
                finalTotal: payload.finalTotal,
                deviceType: userData.deviceType || APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                // amount: (key.price * key.quantity) + (key.shippingChargesAfterDiscount * key.quantity) + (key.paymentMethodCharge * key.quantity) - key.promoCharges,
                amount: (key.price * key.quantity) + (key.shippingChargesAfterDiscount * key.quantity) - key.promoCharges,
                // amountWithTax: (key.price * key.quantity) + ((key.price * key.tax) / 100 * key.quantity) + (key.shippingChargesAfterDiscount * key.quantity) + (key.paymentMethodCharge * key.quantity) - key.promoCharges,
                amountWithTax: (key.price * key.quantity) + ((key.price * key.tax) / 100 * key.quantity) + (key.shippingChargesAfterDiscount * key.quantity) - key.promoCharges,
                currency: payload.currency,
                currencySelected: payload.currencySelected,
                conversion: payload.conversion,
                paymentId: paymentId,
                status: paymentStatus,
                paymentMethod: payload.paymentMethod,
                order: saveOrder._id,
                vendor: key.vendor,
                vendorOrderId: saveOrder.vendorOrderId,
                productPromoCharges: key.promoCharges,
                productTax: (key.price * key.tax) / 100,
                productTotalTax: (key.price * key.tax) / 100 * key.quantity,
                productPaymentMethodChargeTotal: key.paymentMethodCharge * key.quantity,
                productShippingChargeTotal: key.shippingChargesAfterDiscount * key.quantity,
                productPrice: key.price,
                productPriceWithTax: (key.price * key.quantity) + ((key.price * key.tax) / 100 * key.quantity),
                quantity: key.quantity,
                createdDate: createdDate
            };
            if (pId) {
                saveTransaction.pId = pId
            }
            orderPromises.push(Dao.saveData(Models.transactions, saveTransaction));

            let saveShippingDeductionTransaction = {
                user: userData._id,
                transactionType: APP_CONSTANTS.TRANSACTION_TYPES.SHIPPING_CHARGES,
                orderId: orderId,
                orderNumber: orderNumber,
                shippingCharges:  key.shippingCharges,
                shippingChargesAfterDiscount:  key.shippingChargesAfterDiscount,
                shippingChargesDiscount:  key.shippingChargesDiscount,
                amount: key.shippingChargesAfterDiscount * key.quantity,
                amountWithTax: key.shippingChargesAfterDiscount * key.quantity,
                currency: payload.currency,
                currencySelected: payload.currencySelected,
                conversion: payload.conversion,
                transactionId: transactionId,
                deviceType: userData.deviceType || APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                paymentId: +new Date(),
                status: paymentStatus,
                invoiceNumber: invoiceNumber,
                paymentMethod: payload.paymentMethod,
                order: saveOrder._id,
                vendor: key.vendor,
                vendorOrderId: saveOrder.vendorOrderId,
                quantity: key.quantity,
                createdDate: createdDate
            };
            if (pId) {
                saveTransaction.pId = pId
            }

            let savePaymentMethodDeductionTransaction = {
                user: userData._id,
                transactionType: APP_CONSTANTS.TRANSACTION_TYPES.PAYMENT_METHOD_CHARGES,
                orderId: orderId,
                orderNumber: orderNumber,
                paymentMethodCharge:  key.paymentMethodCharge,
                paymentMethodChargePercentage:  key.paymentMethodChargePercentage,
                amount: key.paymentMethodCharge * key.quantity,
                amountWithTax: key.paymentMethodCharge * key.quantity,
                currency: payload.currency,
                currencySelected: payload.currencySelected,
                conversion: payload.conversion,
                paymentId: +new Date(),
                status: paymentStatus,
                transactionId: transactionId,
                deviceType: userData.deviceType || APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                paymentMethod: payload.paymentMethod,
                order: saveOrder._id,
                vendor: key.vendor,
                invoiceNumber: invoiceNumber,
                vendorOrderId: saveOrder.vendorOrderId,
                quantity: key.quantity,
                createdDate: createdDate
            };
            if (pId) {
                saveTransaction.pId = pId
            }

            
            let saveTaxDeductionTransaction = {
                user: userData._id,
                transactionType: APP_CONSTANTS.TRANSACTION_TYPES.TAX_DEDUCTION,
                orderId: orderId,
                orderNumber: orderNumber,
                paymentMethodCharge:  key.paymentMethodCharge,
                paymentMethodChargePercentage:  key.paymentMethodChargePercentage,
                amount: (key.price * key.tax) / 100 * key.quantity,
                amountWithTax: (key.price * key.tax) / 100 * key.quantity,
                currency: payload.currency,
                currencySelected: payload.currencySelected,
                conversion: payload.conversion,
                paymentId: +new Date(),
                deviceType: userData.deviceType || APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                status: paymentStatus,
                transactionId: transactionId,
                paymentMethod: payload.paymentMethod,
                order: saveOrder._id,
                vendor: key.vendor,
                invoiceNumber: invoiceNumber,
                vendorOrderId: saveOrder.vendorOrderId,
                quantity: key.quantity,
                createdDate: createdDate
            };
            if (pId) {
                saveTransaction.pId = pId
            }
            orderPromises.push(Dao.saveData(Models.transactions, saveShippingDeductionTransaction));
            orderPromises.push(Dao.saveData(Models.transactions, savePaymentMethodDeductionTransaction));
            orderPromises.push(Dao.saveData(Models.transactions, saveTaxDeductionTransaction));
            await Promise.all(orderPromises)
        }

        // let saveTransaction = {
        //     user: userData._id,
        //     transactionType: APP_CONSTANTS.TRANSACTION_TYPES.ORDER,
        //     orderId: orderId,
        //     orderNumber: orderNumber,
        //     subTotal: payload.subTotal,
        //     tax: payload.tax,
        //     deliveryCharges: payload.deliveryCharges,
        //     deliveryAddress: payload.deliveryAddress,
        //     billingAddress: payload.billingAddress,
        //     finalTotal: payload.finalTotal,
        //     amount: payload.finalTotal,
        //     currency: payload.currency,
        //     paymentId: paymentId,
        //     status: paymentStatus
        // };
        // if (pId) {
        //     saveTransaction.pId = pId
        // }
        // await Dao.saveData(Models.transactions, saveTransaction);

        let notificationData = {
            orderId: orderId,
            orderNumber: orderNumber,
            filterVendors: filterVendors
        };
        if (payload.paymentMethod !== APP_CONSTANTS.PAYMENT_METHOD_ENUM.DEBIT_CARD && payload.paymentMethod !== APP_CONSTANTS.PAYMENT_METHOD_ENUM.CREDIT_CARD) {
            setTimeout(async () => {
                await sendNotificationOrderPlaced(notificationData, userData, singleOrderId)
            }, 1000);

            setTimeout(async () => {
                await sendEmailOrderPlaced(productsForEmail, userData)
            }, 1000);

        }

        if (payload.from === APP_CONSTANTS.ORDER_FROM.CART) await Dao.findAndUpdate(Models.cart, {_id: payload.cart}, {status: APP_CONSTANTS.CART_STATUS.ORDER_COMPLETE}, {});
        if (payload.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.DEBIT_CARD || payload.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.CREDIT_CARD) {
            if (paymentUrl) {
                return {paymentUrl}
            } else if (payload.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.WALLET) {
                if (userData.walletMoney >= payload.finalTotal) {
                    let dataToSave = {
                        user: userData._id,
                        type: APP_CONSTANTS.CREDIT_TYPE.DEBIT,
                        status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
                        amount: payload.finalTotal,
                        amountWithTax: payload.finalTotal,
                        orderId: orderId
                    };
                    await Dao.saveData(Models.creditManagement, dataToSave);
                    await Dao.findAndUpdate(Models.user, {_id: userData._id}, {
                        $inc: {
                            walletMoney: -parseFloat(payload.finalTotal)
                        }
                    }, {lean: true, new: true})
                } else {
                    throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.PAYMENT_FAILED_WALLET
                }
            } else {
                return {}
            }
        } else {
            return {};
        }

    } catch (e) {
        throw e
    }
};

let sendEmailOrderPlaced = async (data, userData) => {
    try {
        console.log("datadata", JSON.stringify(data))
        if (data.length) {
            let orderId = data[0].subOrderNumber;
            let email = userData.email;
            let emailData = {
                products: data,
                status: `Placed`,
                websiteUrl: process.env.websiteUrl,
                logoUrl: process.env.logoUrl,
                subOrderNumber: data[0].subOrderNumber,
                orderNumber: data[0].orderNumber,
                createdDate: data[0].createdDate,
                currency: data[0].currency,
                paymentMethod: data[0].paymentMethod,
                subTotal: `${data[0].subTotal}`,
                subTotalBeforeTax: `${parseFloat(data[0].subTotal) + parseFloat(data[0].shippingCharges)}`,
                subTotalWithTax: `${parseFloat(data[0].subTotal) + parseFloat(data[0].shippingCharges) + parseFloat(data[0].tax)}`,
                promoAmount: `${data[0].promoAmount}`,
                tax: `${data[0].tax}`,
                shippingCharges: `${data[0].shippingCharges}`,
                finalTotal: `${data[0].finalTotal}`,
                name: data[0].name ? data[0].name : "",
                street: data[0].street ? data[0].street : "",
                building: data[0].building ? data[0].building : "",
                country: data[0].country ? data[0].country : "",
                city: data[0].city ? data[0].city : "",
                state: data[0].state ? data[0].state : "",
                countryCode: data[0].countryCode ? data[0].countryCode : "",
                phoneNo: data[0].phoneNo ? data[0].phoneNo : ""
            };

            // emailData.productPrice = parseFloat(emailData.productPrice).toFixed(2);
            emailData.subTotal = parseFloat((emailData.subTotal) * (data[0].conversion)).toFixed(2);
            emailData.finalTotal = parseFloat((emailData.finalTotal) * (data[0].conversion)).toFixed(2);
            emailData.promoAmount = parseFloat((emailData.promoAmount) * (data[0].conversion)).toFixed(2);
            emailData.tax = parseFloat((emailData.tax) * (data[0].conversion)).toFixed(2);
            emailData.shippingCharges = parseFloat((emailData.shippingCharges) * (data[0].conversion)).toFixed(2);
            emailData.subTotalBeforeTax = parseFloat((emailData.subTotalBeforeTax) * (data[0].conversion)).toFixed(2);
            emailData.subTotalWithTax = parseFloat((emailData.subTotalWithTax) * (data[0].conversion)).toFixed(2);

            await EmailHandler.sendEmailOrderPlaced(emailData, email, orderId)
        }
        return {}
    } catch (e) {
        throw e
    }
}

let sendNotificationOrderPlaced = async (data, userData, singleOrderId) => {
    try {
        let userNotificationMessage = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.ORDER_PLACED_USER, {
           orderNumber: data.orderNumber
        });

        let notificationDataUser = {
            savePushData: {
                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.ORDER_PLACED_USER,
                message: userNotificationMessage,
                orderId: data.orderId,
                order: singleOrderId,
                receiver: userData._id,
                createdDate: +new Date(),
                receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                userType: APP_CONSTANTS.USER_TYPE.USER,
                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER_PLACED_USER
            },
            type: APP_CONSTANTS.USER_TYPE.USER,
            deviceType: userData.deviceType ? userData.deviceType : APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
            sendPushData: {
                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.ORDER_PLACED_USER[userData.language ? userData.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                message: userNotificationMessage[userData.language ? userData.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                orderId: data.orderId,
                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER_PLACED_USER
            },
            deviceToken: userData.deviceToken
        };

        await NotificationManager.sendNotifications(notificationDataUser, true);


        ////////////////////////////////////// Vendor Notification //////////////////////////

        let vendorNotificationManagerMessage = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.ORDER_PLACED_VENDOR, {
            userName: `${userData.firstName} ${userData.lastName}`,
            orderNumber: data.orderNumber
        });

        
        let adminNotificationManagerMessage = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.ORDER_PLACED_ADMIN, {
            userName: `${userData.firstName} ${userData.lastName}`,
            orderNumber: data.orderNumber
        });
        if (data.filterVendors.length) {
            for (let key of data.filterVendors) {
                let vendorDetails = await Dao.findAndUpdate(Models.vendors, {_id: key}, {
                    $inc: {
                        orderCount: 1
                    }
                }, {lean: true, new: true})
                let notificationDataVendor = {
                    savePushData: {
                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.ORDER_PLACED_VENDOR,
                        message: vendorNotificationManagerMessage,
                        // message: APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.ORDER_PLACED_VENDOR,
                        orderId: data.orderId,
                        order: singleOrderId,
                        createdDate: +new Date(),
                        receiver: vendorDetails._id,
                        receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
                        userType: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER_PLACED_VENDOR
                    },
                    type: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                    deviceType: vendorDetails.deviceType ? vendorDetails.deviceType : APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                    sendPushData: {
                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.ORDER_PLACED_VENDOR[vendorDetails.language ? vendorDetails.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        // message: APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.ORDER_PLACED_VENDOR[vendorDetails.language ? vendorDetails.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        message: vendorNotificationManagerMessage[vendorDetails.language ? vendorDetails.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        orderId: data.orderId,
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER_PLACED_VENDOR
                    },
                    deviceToken: vendorDetails.deviceToken
                };

                await NotificationManager.sendNotifications(notificationDataVendor, true);

            }
        }

        ///////////////////////////////////// Admin Notification //////////////////////////////

        let getAdminData = await Dao.getData(Models.admin, {status: APP_CONSTANTS.STATUS_ENUM.ACTIVE}, {
            _id: 1,
            deviceToken: 1,
            language: 1,
            deviceType: 1
        })

        if (getAdminData.length) {
            for (let key of getAdminData) {
                let notificationDataAdmin = {
                    savePushData: {
                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.ORDER_PLACED_VENDOR,
                        message: adminNotificationManagerMessage,
                        orderId: data.orderId,
                        order: singleOrderId,
                        receiver: key._id,
                        createdDate: +new Date(),
                        receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.ADMIN,
                        userType: APP_CONSTANTS.USER_TYPE.ADMIN,
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER_PLACED_ADMIN,
                        type: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER
                    },
                    type: APP_CONSTANTS.USER_TYPE.ADMIN,
                    deviceType: key.deviceType ? key.deviceType : APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                    sendPushData: {
                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.ORDER_PLACED_VENDOR[key.language ? key.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        message: adminNotificationManagerMessage[key.language ? key.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        orderId: data.orderId,
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER_PLACED_ADMIN,
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

const listOrders = async (payload, userData) => {
    try {

        let criteria = {
            user: mongoose.Types.ObjectId(userData._id),
            ...(payload.orderId && {orderId: mongoose.Types.ObjectId(payload.orderId)}),
            ...(payload._id && {_id: mongoose.Types.ObjectId(payload._id)}),
        };
        if (payload.startDate && payload.endDate) {
            criteria.createdDate = {
                $gte: payload.startDate, $lte: payload.endDate
            }
        }
        let appDefaults = await Dao.findOne(Models.appDefaults, {
                        
                    }, {
                        defaultDeliveryLimit: 1
                    }, {sort: {_id: -1}, limit: 1})

        if ((payload.status && payload.status !== APP_CONSTANTS.LIST_ORDER_STATUS.BUY_AGAIN) || payload.orderId) {
            if (payload.status && payload.status === APP_CONSTANTS.LIST_ORDER_STATUS.ALL) {
                // criteria.orderId = {$exists: true}
            } else if (payload.status && payload.status === APP_CONSTANTS.LIST_ORDER_STATUS.CANCELLED) {
                criteria.status = {
                    $in: [APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED, APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED_VENDOR]
                }
            } else if (payload.status && payload.status === APP_CONSTANTS.LIST_ORDER_STATUS.OPEN) {
                criteria.status = {
                    $nin: [APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.SHIPMENT_RETURNED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED_VENDOR,
                        // APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_REQUESTED,
                        // APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_INITIATED, 
                        // APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_REJECTED, 
                        // APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_ACCEPTED, 
                        APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_COMPLETED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.REJECTED]
                }
            } else if (payload.status && payload.status === APP_CONSTANTS.LIST_ORDER_STATUS.RETURNED) {
                criteria.status = {
                    $in: [APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_REQUESTED,
                        APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_INITIATED, 
                        APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_ACCEPTED, 
                        APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_REJECTED, 
                        APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_CANCELLED, 
                        APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_COMPLETED
                    ]
                }
            }else if (payload.status && payload.status === APP_CONSTANTS.LIST_ORDER_STATUS.DELIVERED) {
                criteria.status = {
                    $in: [
                        APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED
                    ]
                }
            }
            let deliveryDates = appDefaults.defaultDeliveryLimit || 10;
            let deliveredCheck = 1000 * 60 * 60 * 24 * deliveryDates;  // milliseconds 15 days
            let aggregatePipeline = [
                {
                    $match: criteria
                },
                {
                    $lookup: {
                        from: "ratings",
                        let: {
                            "orderId": "$_id",
                            product: "$products.product"
                        },
                        pipeline: [
                            {
                                $match:
                                    {
                                        $expr:
                                            {
                                                $and:
                                                    [
                                                        {$eq: ["$order", "$$orderId"]},
                                                        {$eq: ["$product", "$$product"]},
                                                        {$eq: ["$ratingBy", mongoose.Types.ObjectId(userData._id)]}
                                                    ]
                                            }
                                    }
                            },
                            {$project: {_id: 1}}
                        ],
                        as: "rating"
                    }
                },
                {
                    "$addFields": {
                        "ratingByUser": {"$size": "$rating"}
                    }
                },
                {
                    "$addFields": {
                        "returnOrder": {
                            $cond: { 
                                if: { $and: [{$lte:[{ $subtract: [ +new Date(), "$deliveredDate" ]}, deliveredCheck]}, {$gte: [ "$nonRefundable", false]}, {$eq: [ "$status", APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED]}] }, then: true, else: false }
                        }
                    }
                },
                {
                    "$addFields": {
                        "statusMsg":{
                            $switch: {
                                branches: await createSwitchPipeline(),
                                default: APP_CONSTANTS.ORDER_STATUS_ENUM_MSG.PLACED
                            }
                        }
                    }
                },
                {
                    "$addFields": {
                        "ratingDone": {
                            $cond: {
                                if: {$gt: ["$ratingByUser", 0]},
                                then: true,
                                else: false
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            orderId: "$orderId",
                            orderNumber: "$orderNumber",
                            createdDate: "$createdDate"
                        },
                        order: {
                            $push: "$$ROOT"
                        }
                    }
                },
                {
                    $project: {
                        _id: "$_id",
                        order: {
                            _id: 1,
                            user: 1,
                            vendor: 1,
                            cart: 1,
                            vendorOrderId: 1,
                            orderId: 1,
                            orderNumber: 1,
                            subOrderNumber: 1,
                            productNumber: 1,
                            trackingId: 1,
                            trackingUrl: 1,
                            finalSubOrderNumber: 1,
                            products: 1,
                            subTotal: 1,
                            tax: 1,
                            deliveryCharges: 1,
                            deliveryAddress: 1,
                            billingAddress: 1,
                            courierType: 1,
                            noDelivery: 1,
                            finalTotal: 1,
                            currency: 1,
                            currencySelected: 1,
                            conversion: 1,
                            status: 1,
                            discountCode: 1,
                            returnStatus: 1,
                            externalUrl: 1,
                            paymentMethod: 1,
                            logs: 1,
                            createdDate: 1,
                            deliveredDate: 1,
                            updatedDate: 1,
                            rating: 1,
                            ratingByUser: 1,
                            ratingDone: 1,
                            statusMsg: 1,
                            returnOrder: 1,
                            refundQuantity: 1,
                            refundAmount: 1,
                            productRefundAmount: 1,
                            returnRequested: 1
                        }
                    }
                }, {
                    $sort: {
                        '_id.createdDate': -1
                    }
                }
            ];

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
                        _id: {orderId: "$orderId", orderNumber: "$orderNumber"},
                        order: {
                            $push: {
                                _id: "$_id"
                            }
                        }
                    }
                }
            ];

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
                select: 'name vendorRegisterName phoneNumber email hashTag',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
            }, {
                path: 'order.courierType',
                select: 'name courierServiceUrl',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
            }, {
                path: 'order.products.product',
                select: 'title description images discount price tax shippingCharges quantityAvailable variantsAvailable productTangibleType availableForSale soldOut material weight',
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
            }];


            let [order, orderCount] = await Promise.all([
                Dao.aggregateDataWithPopulate(Models.orders, aggregatePipeline, populate),
                Dao.aggregateData(Models.orders, aggregatePipelineCount)
            ]);

            return {order, orderCount: orderCount.length}
        } else {

        }
    } catch (e) {
        throw e
    }
};


let createSwitchPipeline = async ()=>{
    try{
        let branches = [];
        for(let key in APP_CONSTANTS.ORDER_STATUS_ENUM){
            branches.push({
                case: {$eq: ["$status", APP_CONSTANTS.ORDER_STATUS_ENUM[key]]},
                then: APP_CONSTANTS.ORDER_STATUS_ENUM_MSG[key]
            })
        }
        console.log(branches)
        return branches
    }catch (e){
        throw e
    }
}

const addOrEditAddress = async (payload, userData) => {
    try {
        if (payload._id) {
            payload.updatedDate = +new Date();
            let data = await Dao.findAndUpdateWithPopulate(Models.userAddresses, {_id: payload._id}, payload, {
                lean: true,
                new: true
            }, [{
                path: 'countryId',
                select: 'name'
            }])
            delete data['createdDate'];
            delete data['updatedDate'];
            delete data['status'];
            delete data['user'];
            delete data['createdAt'];
            delete data['updatedAt'];
            delete data['__v'];
            return data
        } else {
            payload.user = userData._id;
            let data = await Dao.saveData(Models.userAddresses, payload)
            let dataToReturn = await Dao.findAndUpdateWithPopulate(Models.userAddresses, {_id: data._id}, {}, {
                lean: true,
                new: true
            }, [{
                path: 'countryId',
                select: 'name'
            }])
            delete data['createdDate'];
            delete data['updatedDate'];
            delete data['status'];
            delete data['user'];
            delete data['createdAt'];
            delete data['updatedAt'];
            delete data['__v'];
            return dataToReturn
        }
    } catch (e) {
        throw e;
    }
}


const listAddress = async (userData) => {
    try {
        let criteria = {
            status: {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED},
            user: userData._id,
        }

        let promises = [
            Dao.populateData(Models.userAddresses, criteria, {
                status: 0,
                createdDate: 0,
                updatedDate: 0,
                createdAt: 0,
                updatedAt: 0,
                __v: 0,
                user: 0,

            }, {lean: true}, [{
                path: 'countryId',
                select: 'name'
            }]),
            Dao.countDocuments(Models.userAddresses, criteria)
        ];
        let [data, count] = await Promise.all(promises);
        return {data, count}
    } catch (e) {
        throw e;
    }
}

const deleteAddress = async (payload, userData) => {
    try {
        let criteria = {
                _id: payload.addressId
            },
            dataToUpdate = {
                status: APP_CONSTANTS.STATUS_ENUM.DELETED
            };

        return await Dao.findAndUpdate(Models.userAddresses, criteria, dataToUpdate, {lean: true, new: true});
    } catch (e) {
        throw e;
    }
}

const makeDefault = async (payload, userData) => {
    try {
        let criteria = {
                _id: payload.addressId
            },
            otherCriteria = {
                user: userData._id,
                _id: {$ne: payload.addressId}
            },
            dataToUpdate = {
                default: true
            },
            otherDataToUpdate = {
                default: false
            };

        await Dao.updateMany(Models.userAddresses, otherCriteria, otherDataToUpdate, {multi: true});
        return Dao.findAndUpdate(Models.userAddresses, criteria, dataToUpdate, {new: true});

    } catch (e) {
        throw e
    }
};

const cancelOrder = async (payload, userData) => {
    try {
        let findOrder = await Dao.findOne(Models.orders, {_id: payload._id}, {}, {lean: true});
        if (findOrder) {
            if (findOrder.status === APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.CANCELLED
            }
            if (findOrder.status === APP_CONSTANTS.ORDER_STATUS_ENUM.PLACED || findOrder.status === APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_PENDING || findOrder.status === APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_FAILED) {
                delete payload._id;
                payload.status = APP_CONSTANTS.ORDER_STATUS_ENUM.CANCELLED
                payload.$push = {
                    logs: {
                        status: payload.status,
                        createdDate: +new Date(),
                        actionBy: userData._id,
                        actionByModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
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
                if(updateTransaction && findOrder.status === APP_CONSTANTS.ORDER_STATUS_ENUM.PLACED && (updateTransaction.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.CREDIT_CARD || updateTransaction.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.DEBIT_CARD)){
                    let refundAmount = await refundOrder(findOrder, updateTransaction, userData )
                }
                if(updateTransaction && findOrder.status === APP_CONSTANTS.ORDER_STATUS_ENUM.PLACED && (updateTransaction.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.WALLET /*|| updateTransaction.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.CASH_ON_DELIVERY*/)){
                    let refundAmountWallet = await refundOrderWallet(findOrder, updateTransaction, userData)
                }
                setTimeout(async () => {
                    await sendNotificationCancelOrder(orderData, userData, payload)
                }, 1000)

                setTimeout(async () => {
                    await sendEmailCancel(orderData.status, orderData, userData, updateTransaction)
                }, 1000)

                return orderData
            } else {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.CAN_NOT_CANCEL
            }

        } else {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID
        }
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
        // let emailData = {
        //     status: orderStatus,
        //     productImage: orderData.products.product.images[0].original,
        //     websiteUrl: process.env.websiteUrl,
        //     logoUrl: process.env.logoUrl,
        //     subOrderNumber: orderData.subOrderNumber,
        //     createdDate: moment(orderData.createdDate).format('LL'),
        //     vendorRegisterName: orderData.vendor.vendorRegisterName,
        //     productName: orderData.products.product.title.en,
        //     currency: orderData.products.currency,
        //     productPrice: `${orderData.products.price} * ${orderData.products.quantity}`,
        //     subTotal: `${orderData.products.price * orderData.products.quantity}`,
        //     promoAmount: `0`,
        //     tax: `${((orderData.products.price * orderData.products.tax) / 100) * orderData.products.quantity}`,
        //     finalTotal: `${((orderData.products.price * orderData.products.quantity) + ((orderData.products.price * orderData.products.tax) / 100) * orderData.products.quantity)}`,
        //     name: orderData.deliveryAddress && orderData.deliveryAddress.name ? orderData.deliveryAddress.name : "",
        //     street: orderData.deliveryAddress && orderData.deliveryAddress.street ? orderData.deliveryAddress.street : "",
        //     building: orderData.deliveryAddress && orderData.deliveryAddress.building ? orderData.deliveryAddress.building : "",
        //     country: orderData.deliveryAddress && orderData.deliveryAddress.country ? orderData.deliveryAddress.country : "",
        //     city: orderData.deliveryAddress && orderData.deliveryAddress.city ? orderData.deliveryAddress.city : "",
        //     state: orderData.deliveryAddress && orderData.deliveryAddress.state ? orderData.deliveryAddress.state : "",
        //     countryCode: orderData.deliveryAddress && orderData.deliveryAddress.contactDetails && orderData.deliveryAddress.contactDetails.countryCode ? orderData.deliveryAddress.contactDetails.countryCode : "",
        //     phoneNo: orderData.deliveryAddress && orderData.deliveryAddress.contactDetails && orderData.deliveryAddress.contactDetails.phoneNo ? orderData.deliveryAddress.contactDetails.phoneNo : ""
        // }

        // emailData.productPrice = parseFloat(emailData.productPrice).toFixed(2)
        // emailData.subTotal = parseFloat(emailData.subTotal).toFixed(2)
        // emailData.finalTotal = parseFloat(emailData.finalTotal).toFixed(2)
        // emailData.promoAmount = parseFloat(emailData.promoAmount).toFixed(2)
        // emailData.tax = parseFloat(emailData.tax).toFixed(2)


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
            currency: orderData.products.currency,
            productPrice: `${orderData.products.price} * ${orderData.products.quantity}`,
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

        emailData.productPrice = parseFloat(emailData.productPrice).toFixed(2)
        emailData.subTotal = parseFloat(emailData.subTotal).toFixed(2)
        emailData.finalTotal = parseFloat(emailData.finalTotal).toFixed(2)
        emailData.promoAmount = parseFloat(emailData.promoAmount).toFixed(2)
        emailData.tax = parseFloat(emailData.tax).toFixed(2)
        emailData.subTotalBeforeTax = parseFloat(emailData.subTotalBeforeTax).toFixed(2)
        emailData.subTotalWithTax = parseFloat(emailData.subTotalWithTax).toFixed(2)
        emailData.shippingCharges = parseFloat(emailData.shippingCharges).toFixed(2)

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

        let userNotificationManagerMessage = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.CANCELLED, {
            orderNumber: data.orderNumber,
            subOrderNumber: data.subOrderNumber
        });

        let notificationDataUser = {
            savePushData: {
                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.CANCELLED,
                message: userNotificationManagerMessage,
                orderId: data.orderId,
                order: data._id,
                receiver: userData._id,
                createdDate: +new Date(),
                cancellationReason: payload.cancellationReason?payload.cancellationReason:"",
                receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                userType: APP_CONSTANTS.USER_TYPE.USER,
                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.CANCELLED
            },
            type: APP_CONSTANTS.USER_TYPE.USER,
            deviceType: userData.deviceType ? userData.deviceType : APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
            sendPushData: {
                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.CANCELLED[userData.language ? userData.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                message: userNotificationManagerMessage[userData.language ? userData.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                orderId: data.orderId,
                order: data._id,
                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.CANCELLED
            },
            deviceToken: userData.deviceToken
        };

        await NotificationManager.sendNotifications(notificationDataUser, true);


        ////////////////////////////////////// Vendor Notification //////////////////////////

        let vendorNotificationManagerMessage = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.ORDER_CANCELLED_VENDOR, {
            orderNumber: data.orderNumber,
            subOrderNumber: data.subOrderNumber,
            reason: payload.cancellationReason?`, due to reason: ${payload.cancellationReason}`:""
        });

        let notificationDataVendor = {
            savePushData: {
                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.ORDER_CANCELLED_VENDOR,
                message: vendorNotificationManagerMessage,
                // message: APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.ORDER_PLACED_VENDOR,
                orderId: data.orderId,
                order: data._id,
                cancellationReason: payload.cancellationReason?payload.cancellationReason:"",
                receiver: data.vendor._id,
                createdDate: +new Date(),
                receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
                userType: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER_CANCELLED_VENDOR
            },
            type: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
            deviceType: data.vendor.deviceType ? data.vendor.deviceType : APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
            sendPushData: {
                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.ORDER_CANCELLED_VENDOR[data.vendor.language ? data.vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                // message: APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.ORDER_PLACED_VENDOR[vendorDetails.language ? vendorDetails.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                message: vendorNotificationManagerMessage[data.vendor.language ? data.vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                orderId: data.orderId,
                order: data._id,
                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER_CANCELLED_VENDOR
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

        let adminMessage = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.ADMIN_ORDER_UPDATES.CANCELLED, {
            orderNumber: data.orderNumber,
            subOrderNumber: data.subOrderNumber
        });


        if (getAdminData.length) {
            for (var key of getAdminData) {
                let notificationDataAdmin = {
                    savePushData: {
                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.ADMIN_ORDER_UPDATES.CANCELLED,
                        message: adminMessage,
                        orderId: data.orderId,
                        order: data._id,
                        cancellationReason: payload.cancellationReason?payload.cancellationReason:"",
                        receiver: key._id,
                        receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.ADMIN,
                        userType: APP_CONSTANTS.USER_TYPE.ADMIN,
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ADMIN_ORDER_UPDATES.CANCELLED,
                        type: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER
                    },
                    type: APP_CONSTANTS.USER_TYPE.ADMIN,
                    deviceType: key.deviceType ? key.deviceType : APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                    sendPushData: {
                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.ADMIN_ORDER_UPDATES.CANCELLED[key.language ? key.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        message: adminMessage[key.language ? key.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        orderId: data.orderId,
                        order: data._id,
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ADMIN_ORDER_UPDATES.CANCELLED,
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


const addReview = async (payload, userData) => {
    try {
        let checkReview = await Dao.findOne(Models.ratings, {
            product: payload.product,
            order: payload.order,
            ratingBy: userData._id
        })
        let vendorDetails
        let saveRating
        if(payload.type === APP_CONSTANTS.RATING_TYPE.ORDER_RATING){
            let checkOrderStatus = await Dao.findOne(Models.orders, {_id: payload.order}, {status: 1}, {lean: true});
            if (!checkOrderStatus) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID;
            if (checkOrderStatus.status !== APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.RATING_AFTER_DELIVERY;
            if (checkReview) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.RATING_ALREADY_DONE;
            else {
                payload.ratingBy = userData._id;
                saveRating = await Dao.saveData(Models.ratings, payload)
                let data =await Dao.findAndUpdateWithPopulate(Models.products, {_id: payload.product}, {
                    $inc: {
                        rating: payload.ratings,
                        noOfRating: 1
                    }
                }, {lean: true}, [{
                    path: 'vendor',
                }])
                vendorDetails = data.vendor
            }
        }
        else if(payload.type === APP_CONSTANTS.RATING_TYPE.PRODUCT_RATING){
            payload.ratingBy = userData._id;
            saveRating = await Dao.saveData(Models.ratings, payload)
            let data = await Dao.findAndUpdateWithPopulate(Models.products, {_id: payload.product}, {
                $inc: {
                    rating: payload.ratings,
                    noOfRating: 1
                }
            }, {lean: true}, [{
                path: 'vendor',
            }])
            vendorDetails = data.vendor
        }
        else{
            payload.ratingBy = userData._id;
            saveRating = await Dao.saveData(Models.ratings, payload)
            vendorDetails = await Dao.findAndUpdate(Models.vendors, {_id: payload.vendor}, {
                $inc: {
                    rating: payload.ratings,
                    noOfRating: 1
                }
            }, {lean: true})
        }
        let message = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.ORDER_REVIEW, {
            userName: `${userData.firstName} ${userData.lastName}`
        })
        let title = APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.ORDER_REVIEW;
        let notificationType = APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER_REVIEW
        if(payload.type === APP_CONSTANTS.RATING_TYPE.PRODUCT_RATING){
            message = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.PRODUCT_REVIEW, {
                userName: `${userData.firstName} ${userData.lastName}`
            })
            title = APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.PRODUCT_REVIEW;
            notificationType = APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.PRODUCT_REVIEW
        }
        if(payload.type === APP_CONSTANTS.RATING_TYPE.VENDOR_RATING){
            message = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.VENDOR_REVIEW, {
                userName: `${userData.firstName} ${userData.lastName}`
            })
            notificationType = APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.VENDOR_REVIEW
            title = APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.VENDOR_REVIEW
        }

        let notificationData = {
            savePushData: {
                title: title,
                message: message,
                user: userData._id,
                receiver: vendorDetails.vendor,
                receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
                userType: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                notificationType: notificationType
             },
            type: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
            deviceType: APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
            sendPushData: {
                title: title[vendorDetails.language?vendorDetails.language: APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                message: message[vendorDetails.language?vendorDetails.language: APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                notificationType: notificationType
            },
            deviceToken: vendorDetails.deviceToken || ""
        };

        await NotificationManager.sendNotifications(notificationData, true);
        let populateRating = await Dao.populateData(Models.ratings, {_id: saveRating._id}, {}, {lean: true}, [{
            path: 'ratingBy',
            select: 'firstName lastName profilePic',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
        }])
        return populateRating[0]
        
    } catch (e) {
        throw e
    }
}

const addToWishList = async (payload, userData) => {
    try {
        payload.user = userData._id;
        if(payload.cart && payload.productId){
            let criteria = {
                user: userData._id,
                _id: payload.cart,
            };
            let dataToUpdate = {
                $pull: {
                    products: {
                        _id: payload.productId
                    }
                }
            };
            let options = {
                lean: true,
                new: true
            };
            let updatedCart = await Dao.findAndUpdate(Models.cart, criteria, dataToUpdate, options);
            let dataToSaveCartLogs = {
                status: APP_CONSTANTS.CART_STATUS.PRODUCT_REMOVED,
                $push: {
                    logs: {
                        status: APP_CONSTANTS.CART_STATUS.PRODUCT_REMOVED,
                        createdDate: +new Date(),
                        actionBy: userData._id
                    }
                }
            };
            await Dao.findAndUpdate(Models.cartLogs, {
                cart: payload.cart,
                productId: payload.productId
            }, dataToSaveCartLogs, {});
        }
        return await Dao.saveData(Models.wishLists, payload)
    } catch (e) {
        throw e;
    }
}

const editProductWishList = async (payload, userData) => {
    try {
        payload.updatedDate = +new Date();
        return await Dao.findAndUpdate(Models.wishLists, {_id: payload._id}, payload, {new: true})
    } catch (e) {
        throw e;
    }
}

const removeProductWishList = async (payload, userData) => {
    try {
        let dataToUpdate = {
            updatedAt: +new Date(),
            status: APP_CONSTANTS.STATUS_ENUM.DELETED
        }
        let updatedData = await Dao.findAndUpdate(Models.wishLists, {_id: payload._id}, dataToUpdate, {new: true});
        if(payload.addToCart){
            let data = {
                product: updatedData.products.product,
                ...(updatedData.products.productVariant && {productVariant: updatedData.products.productVariant}),
                ...(updatedData.products.size && {size: updatedData.products.size}),
                ...(updatedData.products.color && {color: updatedData.products.color}),
                ...(updatedData.products.quantity && {quantity: updatedData.products.quantity}),
                ...(updatedData.products.vendor && {vendor: updatedData.products.vendor}),
            }
            await addToCart(data, userData)
        }
        return updatedData
    } catch (e) {
        throw e;
    }
}

const addOrEditProductWishList = async (payload, userData) => {
    if (payload._id) {
        return await editProductWishList(payload, userData)
    } else {
        return await addToWishList(payload, userData)
    }
}

const listWishList = async (payload, userData) => {
    try {
        let criteria = {
            user: userData._id,
            status: {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED}
        };
        let projection = {};
        let option = {
            lean: true,
            ...(payload.skip && {skip: payload.skip}),
            ...(payload.limit && {limit: payload.limit}),
        };
        let populate = [
            {
                path: 'products.product',
                select: 'title description images discount price tax shippingCharges quantityAvailable variantsAvailable productTangibleType availableForSale soldOut material weight',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS
            }, {
                path: 'products.size',
                select: 'name media',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
            }, {
                path: 'products.color',
                select: 'name media',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
            }, {
                path: 'products.vendor',
                select: 'name vendorRegisterName',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
            }, {
                path: 'products.productVariant',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCT_VARIANTS,
                populate: [{
                    path: 'sizes',
                    select: 'name media',
                    model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
                }, {
                    path: 'colors',
                    select: 'name media',
                    model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
                }]
            }
        ];
        let [wishList, count] = await Promise.all([
            Dao.populateData(Models.wishLists, criteria, projection, option, populate),
            Dao.countDocuments(Models.wishLists, criteria)
        ]);
        return {wishList, count}
    } catch (e) {
        throw e;
    }
};

const verifyPayment = async (payload) => {
    try {
        console.log("payload", JSON.stringify(payload));
        let redirectTo;
        let data = {
            'payment_reference': payload.payment_reference
        };
        let userId
        let paymentSocket = APP_CONSTANTS.SOCKET_NAME_EMIT.PAYMENT_FAILED
        let paymentResult = await PayTabManager.verify(data);
        if (paymentResult.response_code === 100 || paymentResult.response_code === "100" || paymentResult.response_code === 4012 || paymentResult.response_code === "4012") {

            redirectTo = `${process.env.websiteUrl}success`;
            let updateStatus = {
                paymentStatus: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
                status: APP_CONSTANTS.ORDER_STATUS_ENUM.PLACED,
                transactionId: paymentResult.transaction_id
            };
            let status = {
                status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
                transactionId: paymentResult.transaction_id
            };
            let [order, payment, transaction] = await Promise.all([
                Dao.updateMany(Models.orders, {pId: payload.payment_reference}, updateStatus, {
                    lean: true,
                    new: true,
                    multi: true
                }),
                // Dao.updateMany(Models.vendorPayments, {pId: payload.payment_reference}, status, {multi: true}),
                Dao.updateMany(Models.transactions, {pId: payload.payment_reference}, status, {multi: true}),
            ]);

    

            let listOrders = await Dao.populateData(Models.orders, {pId: payload.payment_reference}, {}, {lean: true}, [
                {
                    path: 'user',
                    select: 'firstName lastName deviceType deviceToken language email',
                    model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
                },
                {
                    path: 'vendor',
                    select: 'firstName lastName deviceType deviceToken language email vendorRegisterName',
                    model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
                },
                {
                    path: 'products.product',
                    select: 'images title description',
                    model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS
                },
                {
                    path: 'products.productVariant',
                    select: 'colors sizes',
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
                },
                {
                    path: 'products.color',
                    select: 'name',
                    model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
                },
                {
                    path: 'products.size',
                    select: 'name',
                    model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
                }
            ]);

            let filterVendors = [];
            let singleOrderId;
            console.log("listOrderslistOrderslistOrders",listOrders)
            if (listOrders && listOrders.length) {
                console.log("listOrders.length",listOrders.length)
                for (let data of listOrders) {
                    singleOrderId = data._id;
                    let vendorExists = filterVendors.some(items => {
                        return items.toString() === data.vendor._id.toString()
                    });
                    if (!vendorExists) filterVendors.push(data.vendor._id)
                }
            }
            //
            console.log({filterVendors})
            let notificationData = {
                orderId: listOrders[0].orderId,
                orderNumber: listOrders[0].orderNumber,
                filterVendors: filterVendors
            };

            console.log({notificationData});

            console.log("notificationData", JSON.stringify(notificationData));
            setTimeout(async () => {
                await sendNotificationOrderPlaced(notificationData, listOrders[0].user, singleOrderId)
            }, 1000);

            let productsForEmail = [];
            if (listOrders.length) {
                for (let key of listOrders) {
                    let productDetails = key.products.product;
                    let size = key.products.size;
                    let productVariant = key.products.productVariant;
                    let color = key.products.color;
                    let obj = {
                        status: listOrders[0].status,
                        productImage: productDetails.images[0].original,
                        websiteUrl: process.env.websiteUrl,
                        logoUrl: process.env.logoUrl,
                        subOrderNumber: listOrders[0].subOrderNumber,
                        orderNumber: listOrders[0].orderNumber,
                        createdDate: moment(listOrders[0].createdDate).format('LL'),
                        vendorRegisterName: key.vendor.vendorRegisterName,
                        productName: productDetails.title.en,
                        productDescription: productDetails.description.en,
                        // currency: key.products.currency,
                        currency: key.currencySelected?key.currencySelected:key.products.currency,
                        conversion: key.conversion?key.conversion:1,
                        productPrice: `${key.products.price}`,
                        productPriceConverted: `${parseFloat(key.products.price * key.conversion).toFixed(2)}`,
                        quantity: `${key.products.quantity}`,
                        subTotal: `${key.subTotal}`,
                        promoAmount: `${key.promoCharges}`,
                        paymentMethod: `Online`,
                        shippingCharges: `${key.shippingChargesAfterDiscount}`,
                        tax: `${key.tax}`,
                        finalTotal: `${key.finalTotal}`,
                        name: key.deliveryAddress && key.deliveryAddress.name ? key.deliveryAddress.name : "",
                        street: key.deliveryAddress && key.deliveryAddress.street ? key.deliveryAddress.street : "",
                        building: key.deliveryAddress && key.deliveryAddress.building ? key.deliveryAddress.building : "",
                        country: key.deliveryAddress && key.deliveryAddress.country ? key.deliveryAddress.country : "",
                        city: key.deliveryAddress && key.deliveryAddress.city ? key.deliveryAddress.city : "",
                        state: key.deliveryAddress && key.deliveryAddress.state ? key.deliveryAddress.state : "",
                        countryCode: key.deliveryAddress && key.deliveryAddress.contactDetails && key.deliveryAddress.contactDetails.countryCode ? key.deliveryAddress.contactDetails.countryCode : "",
                        phoneNo: key.deliveryAddress && key.deliveryAddress.contactDetails && key.deliveryAddress.contactDetails.phoneNo ? key.deliveryAddress.contactDetails.phoneNo : ""
                    };
                    if (color) {
                        obj.color = color.name.en
                    }
                    if (size) {
                        obj.size = size.name.en
                    }
                    if (productVariant) {
                        obj.color = productVariant.colors.name.en
                    }
                    if (productVariant) {
                        obj.size = productVariant.sizes.name.en
                    }
                    productsForEmail.push(obj)
                }

            }
            console.log("productsForEmail", JSON.stringify(productsForEmail));
            if (productsForEmail.length) {
                setTimeout(async () => {
                    await sendEmailOrderPlaced(productsForEmail, listOrders[0].user)
                }, 1000);
            }
            userId = listOrders[0].user._id
            paymentSocket = APP_CONSTANTS.SOCKET_NAME_EMIT.PAYMENT_SUCCESS
        } else {
            let updateStatus = {
                paymentStatus: APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED,
                status: APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_FAILED
            };
            let status = {
                status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED
            };
            let [order, payment, transaction] = await Promise.all([
                Dao.updateMany(Models.orders, {pId: payload.payment_reference}, updateStatus, {
                    multi: true
                }),
                // Dao.updateMany(Models.vendorPayments, {pId: payload.payment_reference}, status, {multi: true}),
                Dao.updateMany(Models.transactions, {pId: payload.payment_reference}, status, {multi: true})
            ]);

            let listOrders = await Dao.getData(Models.orders, {pId: payload.payment_reference}, {}, {lean: true});
            if(listOrders.length){
                for(let key of listOrders){
                    if (key.products.productVariant) {
                        let updateProductVariantQuantity = await Dao.findAndUpdate(Models.productVariants, {
                            _id: key.products.productVariant
                        }, {
                            $inc: {
                                quantityAvailable: (parseInt(key.products.quantity))
                            }
                        }, {
                            new: true
                        })
                    } else {
                        let updateProductQuantity = await Dao.findAndUpdate(Models.products, {
                            _id: key.products.product
                        }, {
                            $inc: {
                                quantityAvailable: (parseInt(key.products.quantity)),
                            }
                        }, {
                            new: true
                        })
                    }
                }
            }
            userId = listOrders[0].user

            redirectTo = `${process.env.websiteUrl}payment-error`;
        }
        await SocketManager.commonSockets({}, userId  , paymentSocket)
        return redirectTo
    } catch (e) {
        throw e;
    }
};


const verifyPaymentRetryOrder = async (payload) => {
    try {
        console.log("payload", JSON.stringify(payload));
        let redirectTo;
        let data = {
            'payment_reference': payload.payment_reference
        };
        let paymentResult = await PayTabManager.verify(data);
        if (paymentResult.response_code === 100 || paymentResult.response_code === "100" || paymentResult.response_code === 4012 || paymentResult.response_code === "4012") {

            redirectTo = `${process.env.websiteUrl}success`;
            let updateStatus = {
                paymentStatus: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
                status: APP_CONSTANTS.ORDER_STATUS_ENUM.PLACED,
                transactionId: paymentResult.transaction_id
            };
            let status = {
                status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
                transactionId: paymentResult.transaction_id
            };
            let [order, payment, transaction] = await Promise.all([
                Dao.updateMany(Models.orders, {pId: payload.payment_reference}, updateStatus, {
                    lean: true,
                    new: true,
                    multi: true
                }),
                // Dao.updateMany(Models.vendorPayments, {pId: payload.payment_reference}, status, {multi: true}),
                Dao.updateMany(Models.transactions, {pId: payload.payment_reference}, status, {multi: true}),
            ]);

    

            let listOrders = await Dao.populateData(Models.orders, {pId: payload.payment_reference}, {}, {lean: true}, [
                {
                    path: 'user',
                    select: 'firstName lastName deviceType deviceToken language email',
                    model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
                },
                {
                    path: 'vendor',
                    select: 'firstName lastName deviceType deviceToken language email vendorRegisterName',
                    model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
                },
                {
                    path: 'products.product',
                    select: 'images title description',
                    model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS
                },
                {
                    path: 'products.productVariant',
                    select: 'colors sizes',
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
                },
                {
                    path: 'products.color',
                    select: 'name',
                    model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
                },
                {
                    path: 'products.size',
                    select: 'name',
                    model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
                }
            ]);

            let filterVendors = [];
            console.log("listOrderslistOrderslistOrders",listOrders)
            if (listOrders && listOrders.length) {
                console.log("listOrders.length",listOrders.length)
                for (let data of listOrders) {
                    let vendorExists = filterVendors.some(items => {
                        return items.toString() === data.vendor._id.toString()
                    });
                    if (!vendorExists) filterVendors.push(data.vendor._id)
                }
            }
            //
            console.log({filterVendors})
            let notificationData = {
                orderId: listOrders[0].orderId,
                orderNumber: listOrders[0].orderNumber,
                filterVendors: filterVendors
            };

            console.log({notificationData});

            console.log("notificationData", JSON.stringify(notificationData));
            setTimeout(async () => {
                await sendNotificationOrderPlaced(notificationData, listOrders[0].user)
            }, 1000);

            let productsForEmail = [];
            if (listOrders.length) {
                for (let key of listOrders) {
                    let productDetails = key.products.product;
                    let size = key.products.size;
                    let productVariant = key.products.productVariant;
                    let color = key.products.color;
                    let obj = {
                        status: listOrders[0].status,
                        productImage: productDetails.images[0].original,
                        websiteUrl: process.env.websiteUrl,
                        logoUrl: process.env.logoUrl,
                        subOrderNumber: listOrders[0].subOrderNumber,
                        orderNumber: listOrders[0].orderNumber,
                        createdDate: moment(listOrders[0].createdDate).format('LL'),
                        vendorRegisterName: key.vendor.vendorRegisterName,
                        productName: productDetails.title.en,
                        paymentMethod: `Online`,
                        productDescription: productDetails.description.en,
                        // currency: key.products.currency,
                        currency: key.currencySelected?key.currencySelected:key.products.currency,
                        conversion: key.conversion?key.conversion:1,
                        productPrice: `${key.products.price}`,
                        productPriceConverted: `${parseFloat(key.products.price * key.conversion).toFixed(2)}`,
                        quantity: `${key.products.quantity}`,
                        subTotal: `${key.subTotal}`,
                        promoAmount: `${key.promoCharges}`,
                        shippingCharges: `${key.shippingChargesAfterDiscount}`,
                        tax: `${key.tax}`,
                        finalTotal: `${key.finalTotal}`,
                        name: key.deliveryAddress && key.deliveryAddress.name ? key.deliveryAddress.name : "",
                        street: key.deliveryAddress && key.deliveryAddress.street ? key.deliveryAddress.street : "",
                        building: key.deliveryAddress && key.deliveryAddress.building ? key.deliveryAddress.building : "",
                        country: key.deliveryAddress && key.deliveryAddress.country ? key.deliveryAddress.country : "",
                        city: key.deliveryAddress && key.deliveryAddress.city ? key.deliveryAddress.city : "",
                        state: key.deliveryAddress && key.deliveryAddress.state ? key.deliveryAddress.state : "",
                        countryCode: key.deliveryAddress && key.deliveryAddress.contactDetails && key.deliveryAddress.contactDetails.countryCode ? key.deliveryAddress.contactDetails.countryCode : "",
                        phoneNo: key.deliveryAddress && key.deliveryAddress.contactDetails && key.deliveryAddress.contactDetails.phoneNo ? key.deliveryAddress.contactDetails.phoneNo : ""
                    };
                    if (color) {
                        obj.color = color.name.en
                    }
                    if (size) {
                        obj.size = size.name.en
                    }
                    if (productVariant) {
                        obj.color = productVariant.colors.name.en
                    }
                    if (productVariant) {
                        obj.size = productVariant.sizes.name.en
                    }
                    productsForEmail.push(obj)
                }

            }
            console.log("productsForEmail", JSON.stringify(productsForEmail));
            if (productsForEmail.length) {
                setTimeout(async () => {
                    await sendEmailOrderPlaced(productsForEmail, listOrders[0].user)
                }, 1000);
            }

        } else {
            let updateStatus = {
                paymentStatus: APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED,
                status: APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_FAILED
            };
            let status = {
                status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED
            };
            let [order, payment, transaction] = await Promise.all([
                Dao.updateMany(Models.orders, {pId: payload.payment_reference}, updateStatus, {
                    multi: true
                }),
                // Dao.updateMany(Models.vendorPayments, {pId: payload.payment_reference}, status, {multi: true}),
                Dao.updateMany(Models.transactions, {pId: payload.payment_reference}, status, {multi: true})
            ]);

            let listOrders = await Dao.getData(Models.orders, {pId: payload.payment_reference}, {}, {lean: true});
            if(listOrders.length){
                for(let key of listOrders){
                    if (key.products.productVariant) {
                        let updateProductVariantQuantity = await Dao.findAndUpdate(Models.productVariants, {
                            _id: key.products.productVariant
                        }, {
                            $inc: {
                                quantityAvailable: (parseInt(key.products.quantity))
                            }
                        }, {
                            new: true
                        })
                    } else {
                        let updateProductQuantity = await Dao.findAndUpdate(Models.products, {
                            _id: key.products.product
                        }, {
                            $inc: {
                                quantityAvailable: (parseInt(key.products.quantity)),
                            }
                        }, {
                            new: true
                        })
                    }
                }
            }
            redirectTo = `${process.env.websiteUrl}payment-error`;
        }
        return redirectTo
    } catch (e) {
        throw e;
    }
};

const retryPayment = async (payload, userData) => {
    try {
        let findOrder = await Dao.findOne(Models.orders, {_id: payload.orderId}, {}, {lean: true});
        let transaction = await Dao.findOne(Models.transactions, {order: payload.orderId}, {}, {lean: true});
        let paymentUrl, pId, paymentStatus, status;
        if (!findOrder) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID;
        else {
            let paymentResult = await doPayment(findOrder, userData, "", "", findOrder.orderNumber, transaction, process.env.return_url_retry);
            if (paymentResult) {
                if ((paymentResult.response_code === 4012 || paymentResult.response_code === "4012") && paymentResult.p_id && paymentResult.payment_url) {
                    paymentUrl = paymentResult.payment_url;
                    pId = paymentResult.p_id;
                    paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING;
                    status = APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_PENDING;

                    if (findOrder.products.productVariant) {
                        let updateProductVariantQuantity = await Dao.findAndUpdate(Models.productVariants, {
                            _id: key.products.productVariant
                        }, {
                            $inc: {
                                quantityAvailable: -(parseInt(findOrder.products.quantity))
                            }
                        }, {
                            new: true
                        })
                    } else {
                        let updateProductQuantity = await Dao.findAndUpdate(Models.products, {
                            _id: key.products.product
                        }, {
                            $inc: {
                                quantityAvailable: -(parseInt(findOrder.products.quantity)),
                            }
                        }, {
                            new: true
                        })
                    }

                } else {
                    paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED;
                    status = APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_FAILED;
                }
            } else {
                paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED;
                status = APP_CONSTANTS.ORDER_STATUS_ENUM.PAYMENT_FAILED;
            }

            await Promise.all([
                Dao.updateMany(Models.orders, {_id: payload.orderId}, {
                    status: status,
                    paymentStatus: paymentStatus,
                    ...(pId && {pId: pId})
                }, {multi: true}),
                Dao.findAndUpdate(Models.transactions, {order: payload.orderId}, {
                    status: paymentStatus,
                    ...(pId && {pId: pId})
                }, {multi: true}),
                // Dao.updateMany(Models.vendorPayments, {order: payload.orderId}, {
                //     status: paymentStatus,
                //     ...(pId && {pId: pId})
                // }, {multi: true}),
            ]);
            if (paymentUrl) {
                return {paymentUrl}
            } else {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.PAYMENT_FAILED
            }
        }
    } catch (e) {
        throw e
    }
};

const addMoneyToWallet = async (payload, userData) => {
    try {
        let dataToSave = {
            user: userData._id,
            type: APP_CONSTANTS.CREDIT_TYPE.CREDIT,
            amount: payload.amount,
            amountWithTax: payload.amount
        };

        let iso3;
        if (userData.phoneNumber.ISO) {
            iso3 = countries.alpha2ToAlpha3(userData.phoneNumber.ISO)
        }
        let data = {
            'currency': "AED",      //change this to the required currency
            'amount': payload.amount,      //change this to the required amount
            'site_url': process.env.site_url,       //change this to reflect your site
            'title': `Adding Money to wallet`,        //Change this to reflect your order title
            'quantity': 1,      //Quantity of the product
            'unit_price': payload.amount,       //Quantity * price must be equal to amount
            'products_per_title': `Adding Money to wallet`,      //Change this to your products
            'return_url': process.env.return_url_wallet,       //This should be your callback url
            'cc_first_name': userData.firstName?userData.firstName:"NA",        //Customer First Name
            'cc_last_name': userData.lastName?userData.lastName:"NA",      //Customer Last Name
            'cc_phone_number': userData.phoneNumber.countryCode,        //Country code
            'phone_number': userData.phoneNumber.phoneNo,      //Customer Phone
            'billing_address': "NA",        //Billing Address
            'city': "NA",          //Billing City
            'state': "NA",        //Billing State
            'postal_code': "NA",     //Postal Code
            'country': iso3 ? iso3 : "IND",        //Iso 3 country code
            'email': userData.email,        //Customer Email
            'ip_customer': 'NA',        //Pass customer IP here
            'ip_merchant': 'NA',        //Change this to your server IP
            'address_shipping': "NA",      //Shipping Address
            'city_shipping': "NA",        //Shipping City
            'state_shipping': "NA",      //Shipping State
            'postal_code_shipping': "NA",
            'country_shipping': iso3 ? iso3 : "IND",
            'other_charges': 0,        //Other chargs can be here
            'reference_no': +new Date(),      //Pass the order id on your system for your reference
            'msg_lang': 'en',       //The language for the response
            'cms_with_version': 'Nodejs Lib v1',        //Feel free to change this
        };

        let tokenizationData = {
            'currency': "AED",      //change this to the required currency
            'amount': payload.amount,      //change this to the required amount
            'site_url': process.env.site_url,       //change this to reflect your site
            'title': `Adding Money to wallet`,        //Change this to reflect your order title
            'quantity': 1,      //Quantity of the product
            'unit_price': payload.amount,       //Quantity * price must be equal to amount
            'products_per_title': `Adding Money to wallet`,      //Change this to your products
            'return_url': process.env.return_url_wallet,       //This should be your callback url
            'cc_first_name': userData.firstName?userData.firstName:"NA",        //Customer First Name
            'cc_last_name': userData.lastName?userData.lastName:"NA",      //Customer Last Name
            'cc_phone_number': userData.phoneNumber.countryCode,        //Country code
            'phone_number': userData.phoneNumber.phoneNo,      //Customer Phone
            'billing_address': "NA",        //Billing Address
            'city': "NA",          //Billing City
            'state': "NA",        //Billing State
            'postal_code': "NA",     //Postal Code
            'country': iso3 ? iso3 : "IND",        //Iso 3 country code
            'email': userData.email,        //Customer Email
            'ip_customer': 'NA',        //Pass customer IP here
            'ip_merchant': 'NA',        //Change this to your server IP
            'address_shipping': "NA",      //Shipping Address
            'city_shipping': "NA",        //Shipping City
            'state_shipping': "NA",      //Shipping State
            'postal_code_shipping': "NA",
            'country_shipping': iso3 ? iso3 : "IND",
            'other_charges': 0,        //Other chargs can be here
            'reference_no': +new Date(),      //Pass the order id on your system for your reference
            'msg_lang': 'en',       //The language for the response
            'cms_with_version': 'Nodejs Lib v1',        //Feel free to change this
            'is_tokenization': "TRUE",
            'is_existing_customer': "FALSE",
            order_id: +new Date(),
            product_name: "NA",
            customer_email: userData.email,
            address_billing: "NA",
            state_billing: "NA",
            city_billing: "NA",
            postal_code_billing: "NA",
            country_billing: iso3 ? iso3 : "IND",
            pt_token: 'DiQzJAHX1FKLJEZEX8YBVKCwHwFlvAz8',
            pt_customer_email: 'jaskirat@yopmail.com',
            pt_customer_password: 'L1AXU9EYUd',
            billing_shipping_details: "NA",
        };
        // let paymentResult = await PayTabManager.tokenizedPayment(tokenizationData);
        let paymentResult = await PayTabManager.createPage(data);
        let paymentUrl, pId, paymentStatus;
        if (paymentResult) {
            if ((paymentResult.response_code === 4012 || paymentResult.response_code === "4012") && paymentResult.p_id && paymentResult.payment_url) {
                paymentUrl = paymentResult.payment_url;
                pId = paymentResult.p_id;
                paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING;
                dataToSave.status = paymentStatus;
                dataToSave.pId = pId;
                dataToSave.paymentUrl = paymentUrl;
            } else {
                paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED;
                dataToSave.status = paymentStatus;
            }
        } else {
            paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED;
            dataToSave.status = paymentStatus;
        }
        let save = await Dao.saveData(Models.creditManagement, dataToSave);

        let transactionDataToSave = {
            creditId: save._id,
            user: userData._id,
            transactionType: APP_CONSTANTS.TRANSACTION_TYPES.WALLET,
            tax: 0,
            amount: payload.amount,
            amountWithTax: payload.amount,
            type: APP_CONSTANTS.CREDIT_TYPE.CREDIT,
            currency: APP_CONSTANTS.APP.DEFAULT_CURRENCY,
            deviceType: userData.deviceType || APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
            ...(pId && {pId: pId}),
            status: paymentStatus,
            conversion: payload.conversion,
            currencySelected: payload.currencySelected,
            createdDate: +new Date(),
            updatedDate: +new Date(),
        };
        let transaction = await Dao.saveData(Models.transactions, transactionDataToSave);
        if (paymentUrl) {
            return {paymentUrl}
        } else {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.PAYMENT_FAILED
        }
    } catch (e) {
        throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.PAYMENT_FAILED
    }
};


const addGiftCard = async (payload, userData) => {
    try {
        let dataToSave = {
            user: userData._id,
            type: APP_CONSTANTS.PROMO_TYPE.GIFT_CARD,
            validity: 1,
            durationType: APP_CONSTANTS.PROMO_DURATION_TYPE.YEAR,
            expiryDate: +moment().add(6, 'months'),
            amount: payload.amount,
            code: await UniversalFunctions.generateRandomString(10),
            password: await UniversalFunctions.bCryptData(await UniversalFunctions.generateRandomString(8))
        };

        let iso3;
        if (userData.phoneNumber.ISO) {
            iso3 = countries.alpha2ToAlpha3(userData.phoneNumber.ISO)
        }
        let data = {
            'currency': "AED",      //change this to the required currency
            'amount': payload.amount,      //change this to the required amount
            'site_url': process.env.site_url,       //change this to reflect your site
            'title': `Adding Money for gift card`,        //Change this to reflect your order title
            'quantity': 1,      //Quantity of the product
            'unit_price': payload.amount,       //Quantity * price must be equal to amount
            'products_per_title': `Adding Money for gift card`,      //Change this to your products
            'return_url': process.env.return_url_gift_card,       //This should be your callback url
            'cc_first_name': userData.firstName?userData.firstName:"NA",        //Customer First Name
            'cc_last_name': userData.lastName?userData.lastName:"NA",      //Customer Last Name
            'cc_phone_number': userData.phoneNumber.countryCode,        //Country code
            'phone_number': userData.phoneNumber.phoneNo,      //Customer Phone
            'billing_address': "NA",        //Billing Address
            'city': "NA",          //Billing City
            'state': "NA",        //Billing State
            'postal_code': "NA",     //Postal Code
            'country': iso3 ? iso3 : "IND",        //Iso 3 country code
            'email': userData.email,        //Customer Email
            'ip_customer': 'NA',        //Pass customer IP here
            'ip_merchant': 'NA',        //Change this to your server IP
            'address_shipping': "NA",      //Shipping Address
            'city_shipping': "NA",        //Shipping City
            'state_shipping': "NA",      //Shipping State
            'postal_code_shipping': "NA",
            'country_shipping': iso3 ? iso3 : "IND",
            'other_charges': 0,        //Other chargs can be here
            'reference_no': +new Date(),      //Pass the order id on your system for your reference
            'msg_lang': 'en',       //The language for the response
            'cms_with_version': 'Nodejs Lib v1',        //Feel free to change this
        };

        let paymentResult = await PayTabManager.createPage(data);
        let paymentUrl, pId, paymentStatus;
        if (paymentResult) {
            if ((paymentResult.response_code === 4012 || paymentResult.response_code === "4012") && paymentResult.p_id && paymentResult.payment_url) {
                paymentUrl = paymentResult.payment_url;
                pId = paymentResult.p_id;
                paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING;
                dataToSave.status = APP_CONSTANTS.STATUS_ENUM.PENDING;
                dataToSave.pId = pId;
                dataToSave.paymentUrl = paymentUrl;
            } else {
                paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED;
                dataToSave.status = APP_CONSTANTS.STATUS_ENUM.INACTIVE;
            }
        } else {
            paymentStatus = APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED;
            dataToSave.status = APP_CONSTANTS.STATUS_ENUM.INACTIVE;
        }
        let save = await Dao.saveData(Models.offerAndPromo, dataToSave);

        let transactionDataToSave = {
            creditId: save._id,
            user: userData._id,
            transactionType: APP_CONSTANTS.TRANSACTION_TYPES.WALLET,
            tax: 0,
            amount: payload.amount,
            amountWithTax: payload.amount,
            type: APP_CONSTANTS.CREDIT_TYPE.DEBIT,
            deviceType: userData.deviceType || APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
            currency: APP_CONSTANTS.APP.DEFAULT_CURRENCY,
            currencySelected: payload.currencySelected,
            conversion: payload.conversion,
            ...(pId && {pId: pId}),
            status: paymentStatus,
            createdDate: +new Date(),
            updatedDate: +new Date(),
        };
        let transaction = await Dao.saveData(Models.transactions, transactionDataToSave);
        if (paymentUrl) {
            return {paymentUrl}
        } else {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.PAYMENT_FAILED
        }
    } catch (e) {
        throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.PAYMENT_FAILED
    }
};

const shareGiftCard = async (payload, userData)=>{
    try{
        let giftDetail = await Dao.findOne(Models.offerAndPromo, {_id: payload.giftCard}, {}, {lean: true})
        if(payload.shareVia === APP_CONSTANTS.SHARE_VIA.EMAIL){
            let data = {
                code: giftDetail.code
            }
            let findUserDetail = await Dao.findOne(Models.user, {_id: payload.shareWith}, {email: 1, firstName: 1, lastName: 1}, {lean: true})
            await EmailHandler.sendEmailGiftCard(data, userData, findUserDetail, payload.media.original)
        }
        else{
            let firstMessage = {
                receiver: payload.shareWith,
                sender: userData._id,
                senderUserType: APP_CONSTANTS.FEED_LIST_TYPE.USER,
                receiverUserType: APP_CONSTANTS.FEED_LIST_TYPE.USER,
                message: "",
                messageType: APP_CONSTANTS.DATABASE.MESSAGE_TYPE.IMAGE,
                fileUrl: payload.media
            }
            await SocketManager.sendMessage(firstMessage);
            let message= await UniversalFunctions.renderMessageFromTemplateAndVariables(APP_CONSTANTS_MESSAGE.EMAIL_CONTENT.SHARE_GIFT_INSTRUCTIONS.en, {
                code: giftDetail.code
            })
            let secondMessage = {
                receiver: payload.shareWith,
                sender: userData._id,
                senderUserType: APP_CONSTANTS.FEED_LIST_TYPE.USER,
                receiverUserType: APP_CONSTANTS.FEED_LIST_TYPE.USER,
                message: message,
                messageType: APP_CONSTANTS.DATABASE.MESSAGE_TYPE.TEXT
            }
            await SocketManager.sendMessage(secondMessage);
        }
        return {}
    }
    catch(e){
        throw e
    }
}

const verifyPaymentWallet = async (payload) => {
    try {
        console.log("payload", JSON.stringify(payload));
        let redirectTo;
        let data = {
            'payment_reference': payload.payment_reference
        };
        let paymentResult = await PayTabManager.verify(data);
        if (paymentResult.response_code === 100 || paymentResult.response_code === "100" || paymentResult.response_code === 4012 || paymentResult.response_code === "4012") {
            redirectTo = `${process.env.websiteUrl}account/wallet`;
            let updateStatus = {
                status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
                transactionId: paymentResult.transaction_id
            };
            let [creditManagement] = await Promise.all([
                Dao.findAndUpdate(Models.creditManagement, {pId: payload.payment_reference}, updateStatus, {lean: true}),
                Dao.findAndUpdate(Models.transactions, {pId: payload.payment_reference}, updateStatus, {lean: true}),
            ]);
            await Dao.findAndUpdate(Models.user, {_id: creditManagement.user}, {
                $inc: {walletMoney: creditManagement.amount}
            })
        } else {
            redirectTo = `${process.env.websiteUrl}payment-error`;
            let updateStatus = {
                status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED,
            };
            await Promise.all([
                Dao.findAndUpdate(Models.creditManagement, {pId: payload.payment_reference}, updateStatus, {lean: true}),
                Dao.findAndUpdate(Models.transactions, {pId: payload.payment_reference}, updateStatus, {lean: true}),
            ])
        }
        return redirectTo
    } catch (e) {
        throw e;
    }
};


const verifyPaymentGiftCard = async (payload) => {
    try {
        console.log("payload", JSON.stringify(payload));
        let redirectTo;
        let data = {
            'payment_reference': payload.payment_reference
        };
        let paymentResult = await PayTabManager.verify(data);
        if (paymentResult.response_code === 100 || paymentResult.response_code === "100" || paymentResult.response_code === 4012 || paymentResult.response_code === "4012") {
            redirectTo = `${process.env.websiteUrl}account/giftcard`;
            let updateStatus = {
                status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
                transactionId: paymentResult.transaction_id
            };
            let offerStatus = {
                status: APP_CONSTANTS.STATUS_ENUM.ACTIVE
            }
            let [creditManagement] = await Promise.all([
                Dao.findAndUpdate(Models.offerAndPromo, {pId: payload.payment_reference}, offerStatus, {lean: true}),
                Dao.findAndUpdate(Models.transactions, {pId: payload.payment_reference}, updateStatus, {lean: true}),
            ]);
            // await Dao.findAndUpdate(Models.user, {_id: creditManagement.user}, {
            //     $inc: {walletMoney: creditManagement.amount}
            // })
        } else {
            redirectTo = `${process.env.websiteUrl}payment-error`;
            let updateStatus = {
                status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.REJECTED,
            };
            let offerStatus = {
                status: APP_CONSTANTS.STATUS_ENUM.INACTIVE
            }
            await Promise.all([
                Dao.findAndUpdate(Models.offerAndPromo, {pId: payload.payment_reference}, offerStatus, {lean: true}),
                Dao.findAndUpdate(Models.transactions, {pId: payload.payment_reference}, updateStatus, {lean: true}),
            ])
        }
        return redirectTo
    } catch (e) {
        throw e;
    }
};


const transactionListing = async (payload, userData) => {
    try {
        let criteria = {
            user: userData._id,
            $or: [{
                paymentMethod: APP_CONSTANTS.PAYMENT_METHOD_ENUM.WALLET
            },{
                transactionType: {$in:[APP_CONSTANTS.TRANSACTION_TYPES.WALLET, APP_CONSTANTS.TRANSACTION_TYPES.WALLET_RETURN, APP_CONSTANTS.TRANSACTION_TYPES.REDEEM_VOUCHER]},
            }],
            type: {$ne: APP_CONSTANTS.PAYMENT_STATUS_ENUM.PENDING}
        };

        if (payload.startDate && payload.endDate) {
            criteria.createdDate = {
                $gte: payload.startDate,
                $lte: payload.endDate
            }
        }
        let options = {
            lean: true,
            sort: {
                _id:-1
            },
            ...(payload.skip && {skip: payload.skip}),
            ...(payload.limit && {limit: payload.limit}),
        };

        if(payload.type){
            criteria.type = payload.type
        }
        let [data, count] = await Promise.all([
            Dao.getData(Models.transactions, criteria, {}, options),
            Dao.countDocuments(Models.transactions, criteria)
        ]);
        return {data, count}
    } catch (e) {
        throw e
    }
};


const listGiftCards = async (payload, userData)=>{
    try{
        let criteria = {
            expiryDate: {$gte: +new Date()},
            status: APP_CONSTANTS.STATUS_ENUM.ACTIVE,
            user: userData._id,
            type: APP_CONSTANTS.PROMO_TYPE.GIFT_CARD
        }
        let options= {
            ...(payload.skip && {skip: payload.skip}),
            ...(payload.limit && {limit: payload.limit}),
            lean: true,
            sort: {
                _id: 1
            }
        }
        let [data, count] = await Promise.all([
            Dao.getData(Models.offerAndPromo, criteria, {}, options),
            Dao.countDocuments(Models.offerAndPromo, criteria)
        ]);

        return {data, count}
    }catch(e){
        throw e
    }
}

const requestRefund = async (payload, userData)=>{
    try{
        let criteria = {
            _id: payload.order
        }
        let checkOrder = await Dao.findOne(Models.orders, criteria, {_id: 1, status: 1, vendor: 1, products: 1}, {lean: true});
        let checkTransactions = await Dao.findOne(Models.transactions, {order: payload.order}, {}, {lean: true});
        if(!checkOrder) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID;
        else{
            if(checkOrder.status!==APP_CONSTANTS.ORDER_STATUS_ENUM.DELIVERED){
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.NOT_YET_DELIVERED
            }
            let checkTransaction = await Dao.findAndUpdate(Models.transactions, {order: payload.order}, {
                refundStatus: APP_CONSTANTS.REFUND_STATUS.REQUESTED,
                selectedReason: payload.selectedReason,
                refundQuantity: payload.refundQuantity,
                productRefundAmount: checkTransactions.productPrice - checkTransactions.productPromoCharges,
                refundAmount : (checkTransactions.productPrice * payload.refundQuantity) - (checkTransactions.productPromoCharges * payload.refundQuantity),
                refundReason: payload.refundReason,
            }, {lean: true});
            
            let updateOrder = await Dao.findAndUpdate(Models.orders, {_id: payload.order}, {
                returnStatus: APP_CONSTANTS.REFUND_STATUS.REQUESTED,
                refundStatus: APP_CONSTANTS.REFUND_STATUS.REQUESTED,
                refundQuantity: payload.refundQuantity,
                selectedReason: payload.selectedReason,
                refundReason: payload.refundReason,
                returnRequested: true,
                productRefundAmount: checkTransactions.productPrice - checkTransactions.productPromoCharges,
                refundAmount : (checkTransactions.productPrice * payload.refundQuantity) - (checkTransactions.productPromoCharges * payload.refundQuantity),
                status:  APP_CONSTANTS.ORDER_STATUS_ENUM.RETURN_REQUESTED,
                $push: {
                    logs: {
                        status: APP_CONSTANTS.REFUND_STATUS.REQUESTED,
                        createdDate: +new Date(),
                        actionBy: userData._id,
                        actionByModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                        userType: userData.userType
                    }
                }
            }, {lean: true, new: true})

            let dataToSave = {
                ...payload,
                ...(payload.refundReason && {reason: payload.refundReason}),
                productRefundAmount: checkTransactions.productPrice - checkTransactions.productPromoCharges,
                refundAmount : (checkTransactions.productPrice * payload.refundQuantity) - (checkTransactions.productPromoCharges * payload.refundQuantity),
                user: userData._id,
                vendor: checkOrder.vendor,
                product: checkOrder.products.product,
                transaction: checkTransaction._id
            }
            
            let save = await Dao.saveData(Models.refundRequest, dataToSave)
            setTimeout(async ()=>{
                await sendNotificationRefundRequest(save, updateOrder, userData);
                // await sendEmailRequestRefund()
            }, 1000)
            return updateOrder;
        }
    }catch(e){
        throw e
    }
}

const refundOrder = async (order, transaction, userData)=>{
    try{
        let data = {
            transaction_id: transaction.transactionId,
            refund_amount: transaction.amountWithTax,
            refund_reason: `Order cancelled by ${userData.firstName} ${userData.lastName}`
        }
        let result = await PayTabManager.refund(data);
        return {}
    }catch(e){
        throw e
    }
}


let refundOrderWallet = async (order, transaction, userData)=>{
    try{
        let dataToSave = {
            user: order.user._id,
            status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
            type: APP_CONSTANTS.CREDIT_TYPE.CREDIT,
            amount: transaction.amount,
            amountWithTax: transaction.amountWithTax
        };

        let save = await Dao.saveData(Models.creditManagement, dataToSave);
        let  transactionId= await UniversalFunctions.generateRandomOTP();
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
    }catch(e){
        throw e
    }
}

const checkShippingCharges = async (payload, userData)=>{
    try{
        let products = []
        if(payload.products && payload.products.length){
            if(payload.deliveryAddress.contactDetails.ISO && payload.deliveryAddress.contactDetails.ISO === "AE"){
                for(let prod of payload.products){
                    let lastSubscription = await Dao.populateData(Models.subscriptionLogs, {
                        type: APP_CONSTANTS.PLAN_TYPE.NORMAL,
                        vendor: prod.vendor
                    }, {
                        plan: 1
                    }, {sort: {_id: -1}, limit: 1}, [{
                        path: 'plan',
                        select: {
                            localShippingDiscount: 1,
                            perKgPriceShippingInUSD: 1,
                            perKgPriceShipping: 1,
                            localShippingChargesInUSD: 1,
                            localShippingCharges: 1
                        }
                    }])

                    let appDefaults = await Dao.findOne(Models.appDefaults, {
                        
                    }, {
                        weightForShipping: 1
                    }, {sort: {_id: -1}, limit: 1})


                    let productDetail = await Dao.findOne(Models.products, {
                        _id: prod.product
                    }, {
                        weight: 1,
                        length: 1,
                        breadth: 1,
                        height: 1,
                        shipping: 1,
                    }, {sort: {_id: -1}, limit: 1})

                    console.log("productDetail",productDetail)

                    // let data = {
                    //     departureCountryCode: /*vendorDetail.phoneNumber.ISO*/ "AE",
                    //     departurePostcode: "",
                    //     departureLocation: "Abu Dhabi",
                    //     arrivalCountryCode: payload.deliveryAddress.contactDetails.ISO,
                    //     arrivalPostcode: "",
                    //     arrivalLocation: payload.deliveryAddress.city,
                    //     currency:"AED",
                    //     weight:  parseFloat(productDetail.weight) || 5,
                    //     noOfItems: 1,
                    //     items: [{
                    //         "Weight": parseFloat(productDetail.weight) || 5,
                    //         "Length": parseFloat(productDetail.length) || 5,
                    //         "Width": parseFloat(productDetail.breadth) || 5,
                    //         "Height": parseFloat(productDetail.height) || 5,
                    //         "CubicWeight": parseFloat(productDetail.weight) || 5}]
                    // }
                    // let shipping = await CourierManager.postShippingRates(data)

                    // console.log("sshhshsshshshshshshshshshshs", JSON.stringify(shipping))
                    let shippingChargesDiscountPercentage = lastSubscription[0] && lastSubscription[0].plan.localShippingDiscount?parseFloat(lastSubscription[0].plan.localShippingDiscount):0;
                    let perKgPriceShipping = lastSubscription[0] && lastSubscription[0].plan.perKgPriceShipping?parseFloat(lastSubscription[0].plan.perKgPriceShipping):0;

                    let shippingCharges=0;
                    let shippingChargesAfterDiscount=0;
                    let shippingChargesDiscount=0;

                    shippingCharges = lastSubscription[0] && lastSubscription[0].plan.localShippingCharges?parseFloat(lastSubscription[0].plan.localShippingCharges):25;
                    let defaultWeight = appDefaults.weightForShipping?appDefaults.weightForShipping:5;
                    productDetail.weight = productDetail.weight * prod.quantity
                    let discountedShippingCharges = shippingCharges
                    if(shippingChargesDiscountPercentage){
                        shippingChargesDiscount = shippingCharges * shippingChargesDiscountPercentage / 100;
                        discountedShippingCharges = shippingCharges - shippingChargesDiscount
                    }

                    if(productDetail.weight>defaultWeight){
                        shippingCharges = discountedShippingCharges + (parseFloat(productDetail.weight - defaultWeight) * parseFloat(perKgPriceShipping))
                    }
                    shippingChargesAfterDiscount = shippingCharges
                    prod = {
                        ...prod,
                        shippingChargesDiscount,
                        shippingChargesAfterDiscount,
                        shippingChargesDiscountPercentage,
                        shippingCharges
                    }
                    products.push(prod)
                }
            }
           else{
                for(let prod of payload.products){
                    prod = {
                        ...prod,
                        shippingCharges: 60,
                        shippingChargesDiscount: 0,
                        shippingChargesAfterDiscount: 60,
                        shippingChargesDiscountPercentage: 0,
                    }
                    products.push(prod)
                }
           }
        }
        return  {products, deliveryAddress: payload.deliveryAddress}
    }catch(e){
        throw e;
    }
}

const redeemVoucher = async (payload, userData)=>{
    try{
        let checkVoucher = await Dao.findOne(Models.offerAndPromo, {
            code: payload.code,
            type: APP_CONSTANTS.PROMO_TYPE.GIFT_CARD,
            expiryDate: {$gte: +new Date()}
        }, {}, {lean: true});
        if(!checkVoucher){
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_VOUCHER_CODE
        }
        else{
            if(checkVoucher.redeemed){
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.REDEEMED_VOUCHER_CODE
            }else{
                let dataToSave = {
                    user: userData._id,
                    status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
                    type: APP_CONSTANTS.CREDIT_TYPE.CREDIT,
                    amount: checkVoucher.amount,
                    amountWithTax: checkVoucher.amount
                };
        
                let save = await Dao.saveData(Models.creditManagement, dataToSave);
                let  transactionId= await UniversalFunctions.generateRandomOTP();
                let transactionDataToSave = {
                    creditId: save._id,
                    user: userData._id,
                    transactionType: APP_CONSTANTS.TRANSACTION_TYPES.REDEEM_VOUCHER,
                    tax: 0,
                    transactionId: transactionId,
                    voucher: checkVoucher._id,
                    voucherCode: checkVoucher.code,
                    amount: checkVoucher.amount,
                    amountWithTax: checkVoucher.amount,
                    type: APP_CONSTANTS.CREDIT_TYPE.CREDIT,
                    currency: APP_CONSTANTS.APP.DEFAULT_CURRENCY,
                    status: APP_CONSTANTS.PAYMENT_STATUS_ENUM.COMPLETED,
                    createdDate: +new Date(),
                    updatedDate: +new Date(),
                };
                let transaction = await Dao.saveData(Models.transactions, transactionDataToSave);

                await Dao.findAndUpdate(Models.user, {_id: userData._id}, {
                    $inc: {walletMoney: checkVoucher.amount}
                }, {})
                await Dao.findAndUpdate(Models.offerAndPromo, {_id: checkVoucher._id}, {
                    redeemed: true
                }, {})
                return transaction
            }
        }
    }catch(e){
        throw e
    }
}


let sendNotificationRefundRequest = async (refundRequest, orderData, userData) => {
    try {
        let data = orderData;
        let userNotificationManagerMessage = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.RETURN_REQUESTED, {
            orderNumber: data.orderNumber,
            subOrderNumber: data.subOrderNumber
        });

        let notificationDataUser = {
            savePushData: {
                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.RETURN_REQUESTED,
                message: userNotificationManagerMessage,
                orderId: data.orderId,
                order: data._id,
                refundRequest: refundRequest._id,
                receiver: userData._id,
                receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                userType: APP_CONSTANTS.USER_TYPE.USER,
                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.RETURN_REQUESTED
            },
            type: APP_CONSTANTS.USER_TYPE.USER,
            deviceType: userData.deviceType ? userData.deviceType : APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
            sendPushData: {
                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.RETURN_REQUESTED[userData.language ? userData.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                message: userNotificationManagerMessage[userData.language ? userData.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                orderId: data.orderId,
                order: data._id,
                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.RETURN_REQUESTED
            },
            deviceToken: userData.deviceToken
        };

        await NotificationManager.sendNotifications(notificationDataUser, true);


        ////////////////////////////////////// Vendor Notification //////////////////////////

        let vendorNotificationManagerMessage = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.RETURN_REQUESTED_VENDOR, {
            orderNumber: data.orderNumber,
            subOrderNumber: data.subOrderNumber
        });

        let notificationDataVendor = {
            savePushData: {
                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.RETURN_REQUESTED,
                message: vendorNotificationManagerMessage,
                // message: APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.ORDER_PLACED_VENDOR,
                orderId: data.orderId,
                refundRequest: refundRequest._id,
                order: data._id,
                receiver: data.vendor._id,
                receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS,
                userType: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.RETURN_REQUESTED
            },
            type: APP_CONSTANTS.USER_TYPE.VENDOR_OWNER,
            deviceType: data.vendor.deviceType ? data.vendor.deviceType : APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
            sendPushData: {
                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.RETURN_REQUESTED[data.vendor.language ? data.vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                // message: APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.ORDER_PLACED_VENDOR[vendorDetails.language ? vendorDetails.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                message: vendorNotificationManagerMessage[data.vendor.language ? data.vendor.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                orderId: data.orderId,
                order: data._id,
                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.RETURN_REQUESTED
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

        let adminMessage = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.RETURN_REQUESTED_ADMIN, {
            orderNumber: data.orderNumber,
            subOrderNumber: data.subOrderNumber
        });


        if (getAdminData.length) {
            for (var key of getAdminData) {
                let notificationDataAdmin = {
                    savePushData: {
                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.RETURN_REQUESTED,
                        message: adminMessage,
                        orderId: data.orderId,
                        order: data._id,
                        refundRequest: refundRequest._id,
                        receiver: key._id,
                        createdDate: +new Date(),
                        receiverModel: APP_CONSTANTS.DATABASE.MODELS_NAME.ADMIN,
                        userType: APP_CONSTANTS.USER_TYPE.ADMIN,
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.RETURN_REQUESTED,
                        type: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.ORDER
                    },
                    type: APP_CONSTANTS.USER_TYPE.ADMIN,
                    deviceType: key.deviceType ? key.deviceType : APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB,
                    sendPushData: {
                        title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.RETURN_REQUESTED[key.language ? key.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        message: adminMessage[key.language ? key.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                        orderId: data.orderId,
                        order: data._id,
                        notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.RETURN_REQUESTED,
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


let sendEmailRequestRefund = async (status, orderData, userData, transactions) => {
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
            currency: orderData.products.currency,
            productPrice: `${orderData.products.price} * ${orderData.products.quantity}`,
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

        emailData.productPrice = parseFloat(emailData.productPrice).toFixed(2)
        emailData.subTotal = parseFloat(emailData.subTotal).toFixed(2)
        emailData.finalTotal = parseFloat(emailData.finalTotal).toFixed(2)
        emailData.promoAmount = parseFloat(emailData.promoAmount).toFixed(2)
        emailData.tax = parseFloat(emailData.tax).toFixed(2)
        emailData.subTotalBeforeTax = parseFloat(emailData.subTotalBeforeTax).toFixed(2)
        emailData.subTotalWithTax = parseFloat(emailData.subTotalWithTax).toFixed(2)
        emailData.shippingCharges = parseFloat(emailData.shippingCharges).toFixed(2)

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

const downloadInvoice = async (payload, userData)=>{
    try{
        return await CommonHelperFunction.invoicePdf(payload, userData)
        // let orderData = await Dao.populateData(Models.orders, {
        //     _id: payload._id
        // }, {}, {new: true}, [{
        //     path: 'user',
        //     select: 'firstName lastName email deviceToken deviceType language phoneNumber',
        //     model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
        // }, {
        //     path: 'products.product',
        //     select: 'title images weight unit description images',
        //     model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCTS
        // }, {
        //     path: 'products.color',
        //     select: 'name',
        //     model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
        // }, {
        //     path: 'products.size',
        //     select: 'name',
        //     model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
        // }, {
        //     path: 'products.productVariant',
        //     model: APP_CONSTANTS.DATABASE.MODELS_NAME.PRODUCT_VARIANTS,
        //     populate: [{
        //         path: 'colors',
        //         select: 'name',
        //         model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
        //     }, {
        //         path: 'sizes',
        //         select: 'name',
        //         model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
        //     }]
        // }, {
        //     path: 'vendor',
        //     select: 'vendorRegisterName',
        //     model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
        // }]);
        // if(orderData[0]){
        //     orderData = orderData[0]
        //     let transactions = await Dao.findOne(Models.transactions, {order: payload._id}, {}, {multi: true});
        //
        //     let orderStatus;
        //
        //     let subTotal = transactions.productPrice * transactions.quantity;
        //     let tax = transactions.productTotalTax;
        //     let promoAmount = orderData.products.promoCharges;
        //     let shippingCharges = orderData.products.shippingChargesAfterDiscount * orderData.products.quantity;
        //     let finalTotal = subTotal + tax + shippingCharges - promoAmount;
        //     let paymentMethods = 'Online';
        //     if(orderData.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.CASH_ON_DELIVERY){
        //         paymentMethods = 'Cash';
        //     }
        //     if(orderData.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.WALLET){
        //         paymentMethods = 'Wallet';
        //     }
        //     let emailData = {
        //         status: orderStatus,
        //         productImage: orderData.products.product.images[0].original,
        //         websiteUrl: process.env.websiteUrl,
        //         logoUrl: process.env.logoUrl,
        //         orderNumber: orderData.orderNumber,
        //         subOrderNumber: orderData.subOrderNumber,
        //         createdDate: moment(orderData.createdDate).format('LL'),
        //         vendorRegisterName: orderData.vendor.vendorRegisterName,
        //         productName: orderData.products.product.title.en,
        //         productDescription: orderData.products.product.description.en,
        //         conversion: orderData.conversion?orderData.conversion:1,
        //         currency: orderData.currencySelected?orderData.currencySelected:orderData.products.currency,
        //         productPrice: `${orderData.products.price}`,
        //         productPriceConverted: `${parseFloat(orderData.products.price * orderData.conversion).toFixed(2)}`,
        //         subTotal: subTotal,
        //         paymentMethod: paymentMethods,
        //         quantity:`${orderData.products.quantity}`,
        //         promoAmount: promoAmount,
        //         subTotalBeforeTax: `${subTotal + shippingCharges}`,
        //         subTotalWithTax: `${subTotal + shippingCharges + tax}`,
        //         shippingCharges: shippingCharges,
        //         invoiceNumber: orderData.invoiceNumber,
        //         tax: tax,
        //         finalTotal: finalTotal,
        //         name: orderData.deliveryAddress && orderData.deliveryAddress.name ? orderData.deliveryAddress.name : "",
        //         street: orderData.deliveryAddress && orderData.deliveryAddress.street ? orderData.deliveryAddress.street : "",
        //         building: orderData.deliveryAddress && orderData.deliveryAddress.building ? orderData.deliveryAddress.building : "",
        //         country: orderData.deliveryAddress && orderData.deliveryAddress.country ? orderData.deliveryAddress.country : "",
        //         city: orderData.deliveryAddress && orderData.deliveryAddress.city ? orderData.deliveryAddress.city : "",
        //         state: orderData.deliveryAddress && orderData.deliveryAddress.state ? orderData.deliveryAddress.state : "",
        //         countryCode: orderData.deliveryAddress && orderData.deliveryAddress.contactDetails && orderData.deliveryAddress.contactDetails.countryCode ? orderData.deliveryAddress.contactDetails.countryCode : "",
        //         phoneNo: orderData.deliveryAddress && orderData.deliveryAddress.contactDetails && orderData.deliveryAddress.contactDetails.phoneNo ? orderData.deliveryAddress.contactDetails.phoneNo : ""
        //     };
        //
        //     // emailData.productPrice = parseFloat(emailData.productPrice).toFixed(2)
        //     emailData.totalProductPrice = parseFloat((emailData.productPriceConverted) * (emailData.quantity)).toFixed(2)
        //     emailData.subTotal = parseFloat((emailData.subTotal) * (emailData.conversion)).toFixed(2)
        //     emailData.finalTotal = parseFloat((emailData.finalTotal) * (emailData.conversion)).toFixed(2)
        //     emailData.promoAmount = parseFloat((emailData.promoAmount) * (emailData.conversion)).toFixed(2)
        //     emailData.tax = parseFloat((emailData.tax) * (emailData.conversion)).toFixed(2)
        //     emailData.subTotalBeforeTax = parseFloat((emailData.subTotalBeforeTax) * (emailData.conversion)).toFixed(2)
        //     emailData.subTotalWithTax = parseFloat((emailData.subTotalWithTax) * (emailData.conversion)).toFixed(2)
        //     emailData.shippingCharges = parseFloat((emailData.shippingCharges) * (emailData.conversion)).toFixed(2)
        //
        //     if (orderData.products.color) {
        //         emailData.color = orderData.products.color.name.en
        //     }
        //     if (orderData.products.size) {
        //         emailData.size = orderData.products.size.name.en
        //     }
        //     if (orderData.products.productVariant) {
        //         if (orderData.products.productVariant.colors) {
        //             emailData.color = orderData.products.productVariant.colors.name.en
        //         }
        //         if (orderData.products.productVariant.sizes) {
        //             emailData.size = orderData.products.productVariant.sizes.name.en
        //         }
        //     }
        //
        //     let buffer = await EmailHandler.createInvoicePdf(emailData)
        //     let name = emailData.invoiceNumber;
        //     return {buffer, name}
        // }
        // else{
        //     throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID
        // }
    }catch(e){
        throw e;
    }
}

module.exports = {
    addToCart: addToCart,
    viewCart: viewCart,
    removeProduct: removeProduct,
    applyPromo: applyPromo,
    updateCart: updateCart,
    placeOrder: placeOrder,
    listOrders: listOrders,
    addOrEditAddress: addOrEditAddress,
    listAddress: listAddress,
    deleteAddress: deleteAddress,
    makeDefault: makeDefault,
    addToWishList: addToWishList,
    removeProductWishList: removeProductWishList,
    editProductWishList: editProductWishList,
    addOrEditProductWishList: addOrEditProductWishList,
    listWishList: listWishList,
    cancelOrder: cancelOrder,
    addReview: addReview,
    verifyPayment: verifyPayment,
    verifyPaymentRetryOrder: verifyPaymentRetryOrder,
    retryPayment: retryPayment,
    addMoneyToWallet: addMoneyToWallet,
    verifyPaymentWallet: verifyPaymentWallet,
    transactionListing: transactionListing,
    verifyPaymentGiftCard: verifyPaymentGiftCard,
    addGiftCard: addGiftCard,
    listGiftCards: listGiftCards,
    requestRefund: requestRefund,
    checkShippingCharges: checkShippingCharges,
    redeemVoucher: redeemVoucher,
    checkRefundRequest: checkRefundRequest,
    downloadInvoice: downloadInvoice,
    shareGiftCard: shareGiftCard
};


