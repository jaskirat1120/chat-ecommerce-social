// constants imported
const APP_CONSTANTS = require('../../../config').constants.appDefaults;

// local modules
const Models = require('../../../models');
const ProductHelper = require('../../helper-functions/products');
const UniversalFunctions = require('../../../utils/universal-functions');
const CourierManager = require('../../../lib/courier-manager');

let addProduct = async (payload, userData, currencyUSD, currencyAED) => {
    try {
        if(payload.vendorId){
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true})
        }
        payload.vendor = userData.userType === APP_CONSTANTS.USER_TYPE.VENDOR_OWNER ||  userData.userType === APP_CONSTANTS.USER_TYPE.SUB_VENDOR? userData._id : userData.parentId;
        payload.addedBy = payload.updatedBy = userData._id;
        payload.addedUserType = userData.userType;
        // let current = +new Date();
        let counter = await Dao.findAndUpdate(Models.counter, {type: APP_CONSTANTS.COUNTER_TYPE.PRODUCT}, {$inc: {count: 1}}, {
            new: true,
            upsert: true
        });

        console.log("counter,counter",counter);
        payload.productNumber = await UniversalFunctions.completeString(counter.count.toString(), 6);
        if(userData.autoApprovalProduct){
            payload.isAdminVerified = true;
            payload.status = APP_CONSTANTS.STATUS_ENUM.ACTIVE
        }
        // payload.productNumber = current.toString().substring(7, 13);
        // let checkProductNumber = await checkCreateProductNumber(payload.productNumber);
        // payload.productNumber = checkProductNumber.productNumber;
        if (payload.collectionId === "") delete payload.collectionId;
        if (payload.sizes === "") delete payload.sizes;
        if (payload.colors === "") delete payload.colors;
        let productVariants = payload.productVariants && payload.productVariants.length ? payload.productVariants : [];
        delete payload.productVariants;
        payload.priceInUSD = currencyUSD * payload.price;
        payload.priceInAED = currencyAED * payload.price;
        let saveProd = await Dao.saveData(Models.products, payload);
        payload._id = saveProd._id;
        await addOrEditProductVariant(productVariants, payload, currencyUSD, currencyAED);
        return saveProd;
    } catch (e) {
        throw e;
    }
};


let checkCreateProductNumber = async (productNumber) => {
    try {
        let hash = productNumber;
        let countHash = await Dao.countDocuments(Models.products, {productNumber: hash});
        if (countHash && countHash > 0) {
            let current = +new Date();
            hash = current.toString().substring(7, 13);
            await checkCreateProductNumber(hash)
        } else
            return {productNumber: hash}
    } catch (e) {
        throw e
    }
};

let editProduct = async (payload, userData, currencyUSD, currencyAED) => {
    try {
        payload.updatedBy = userData._id;
        payload.updatedUserType = userData.userType;
        if (payload.collectionId === "") delete payload.collectionId;
        payload.updatedDate = +new Date();
        payload.isAdminVerified = false;
        if(userData.autoApprovalProduct){
            payload.isAdminVerified = true;
        }
        let productVariants = payload.productVariants && payload.productVariants.length ? payload.productVariants : [];
        delete payload.productVariants;
        if (payload.sizes === "") {
            delete payload.sizes;
            payload.$unset = {
                sizes: 1
            }
        }
        if (payload.colors === "") {
            delete payload.colors;
            payload.$unset = {
                colors: 1
            }
        }
        let criteria = {_id: payload.productId};
        payload._id = payload.productId
        payload.priceInUSD = currencyUSD * payload.price
        payload.priceInAED = currencyAED * payload.price
        delete payload.productId
        let updatedProd = await Dao.findAndUpdate(Models.products, criteria, payload, {lean: true});
        await addOrEditProductVariant(productVariants, payload, currencyUSD, currencyAED);
        return updatedProd;
    } catch (e) {
        throw e;
    }
};

const addOrEditProductVariant = async (productVariants, payload, currencyUSD, currencyAED) => {
    try {
        if (productVariants.length) {
            for (let variant of productVariants) {
                if (variant._id) {
                    if (variant.sizes === "") {
                        delete variant.sizes;
                        variant.$unset = {
                            sizes: 1
                        }
                    }
                    if (variant.colors === "") {
                        delete variant.colors;
                        variant.$unset = {
                            colors: 1
                        }
                    }
                    variant.priceInUSD = currencyUSD * variant.price
                    variant.priceInAED = currencyAED * variant.price
                    let updateVariant = await Dao.findAndUpdate(Models.productVariants, {_id: variant._id}, variant, {lean: true});
                    if (variant.status === APP_CONSTANTS.STATUS_ENUM.DELETED) {
                        let updateProduct = await Dao.findAndUpdate(Models.products, {_id: payload._id}, {$pull: {productVariants: updateVariant._id}}, {lean: true});
                    }
                } else {
                    delete variant._id;

                    let counter = await Dao.findAndUpdate(Models.counter, {type: APP_CONSTANTS.COUNTER_TYPE.PRODUCT_VARIANT}, {$inc: {count: 1}}, {
                        new: true,
                        upsert: true
                    });

                    console.log("counter,counter",counter)
                    variant.productNumber = await UniversalFunctions.completeString(counter.count.toString(), 6)


                    // let current = +new Date();
                    // variant.productNumber = current.toString().substring(7, 13);
                    variant.product = payload._id;
                    variant.priceInUSD = currencyUSD * variant.price
                    variant.priceInAED = currencyAED * variant.price
                    let saveVariant = await Dao.saveData(Models.productVariants, variant);
                    let updateProduct = await Dao.findAndUpdate(Models.products, {_id: payload._id}, {$addToSet: {productVariants: saveVariant._id}}, {lean: true});
                }
            }
            return {}
        } else return {}
    } catch (e) {
        throw e
    }
}

const addOrEditProduct = async (payload, userData) => {
    try {
        if(payload && payload.vendorId){
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        let currencyUSDtoCurrency = await Dao.findOne(Models.currencies, { $or: [{ "from": "USD", "to": payload.currency },
        { "to": "USD", "from": payload.currency }] }, {} ,{lean: true});
        let currencytoAED = await Dao.findOne(Models.currencies, {$or: [{ "from": "USD", "to": "AED" },
        { "to": "USD", "from": "AED" }]}, {} ,{lean: true});

        let currencyUSD = payload.currency !== "USD" && currencyUSDtoCurrency? currencyUSDtoCurrency.reverseConversion : 1
        if(currencyUSDtoCurrency){
            if (currencyUSDtoCurrency.from === "USD") {
                currencyUSD = currencyUSDtoCurrency.reverseConversion;
            }
            else if (currencyUSDtoCurrency.to === "USD") {
                currencyUSD =  currencyUSDtoCurrency.conversion;
            }
        }
        let currencyAED = payload.currency !== "AED" && currencytoAED? currencyUSD * currencytoAED.conversion :  1
        if(currencytoAED){
            if (currencytoAED.from === "USD") {
                currencyAED = currencytoAED.conversion;
            }
            else if (currencytoAED.to === "USD") {
                currencyAED =  currencytoAED.reverseConversion;
            }
        }
        if (payload._id) {
            payload.productId = payload._id;
            delete payload._id;
            return await editProduct(payload, userData, currencyUSD, currencyAED);
        } else {
            return await addProduct(payload, userData, currencyUSD, currencyAED)
        }
    } catch (e) {
        throw e
    }
};

let listProduct = async (payload, userData) => {
    try {
        if(payload && payload.vendorId){
            userData = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {}, {lean: true});
        }
        payload.vendor = userData._id;
        payload.status = {$nin: [APP_CONSTANTS.STATUS_ENUM.DELETED, APP_CONSTANTS.STATUS_ENUM.BLOCKED]};
        return await ProductHelper.newVendorProductListing(payload, userData);
    } catch (e) {
        throw e;
    }
};


const deleteProduct = async (payload, userData) => {
    try {
        let criteria = {
            _id: payload.productId
        };
        let getUserData = await Dao.findOne(Models.products, criteria, {}, {lean: true});
        if (getUserData) {
            let dataToUpdate = {
                status: APP_CONSTANTS.STATUS_ENUM.DELETED,
                updatedDate: +new Date(),
                updatedBy: userData._id
            };
            return await Dao.findAndUpdate(Models.products, criteria, dataToUpdate, {lean: true, new: true});
        } else return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID)
    } catch (e) {
        throw e
    }
};

const updatePorductSizesCommon = async ()=>{
    let getDataProduct = await Dao.getData(Models.products,{}, {sizes: 1, sizesArray: 1});
    if(getDataProduct.length){
        for(let key of getDataProduct){
            if(key.sizesArray.length && key.sizesArray[0]==null){
                await Dao.findAndUpdate(Models.products, {_id: key._id}, {
                    sizesArray: []
                }, {
                    lean: true
                })
            }
            
        }
    }
    return {

    }
}

const updateCreatedAt= async ()=>{
    let findComments = await Dao.getData(Models.comments, {}, {}, {});
    console.log({findComments})
    if(findComments.length){
        for(let key of findComments){
            await Dao.findAndUpdate(Models.comments, {_id: key._id}, {
                $set: {
                    createdAt: new Date(key.createdAt),
                    updatedAt: new Date(key.updatedAt),
                    createdDate: +new Date(key.createdAt),
                    updatedDate: +new Date(key.updatedAt)
                }
            }, {})
        }
    }
    return {}
}


const getShippingCost = async (payload, userData)=>{
    try{
        let lastSubscription = await Dao.populateData(Models.subscriptionLogs, {
            type: APP_CONSTANTS.PLAN_TYPE.NORMAL,
            vendor: userData._id
        }, {
            plan: 1
        }, {sort: {_id: -1}, limit: 1}, [{
            path: 'plan',
            select: {
                localShippingDiscount: 1,
                perKgPriceShipping: 1,
                localShippingCharges: 1
            }
        }])
        let getSetting = await Dao.findOne(Models.appDefaults, {}, {weightForShipping: 1, defaultShippingCharge: 1}, {});
        if(!payload.weight){
            payload.weight = (payload.length * payload.breadth * payload.height) / 5000
        }

        let shippingChargesDiscountPercentage = lastSubscription[0] && lastSubscription[0].plan.localShippingDiscount?parseFloat(lastSubscription[0].plan.localShippingDiscount):0;
        let perKgPriceShipping = lastSubscription[0] && lastSubscription[0].plan.perKgPriceShipping?parseFloat(lastSubscription[0].plan.perKgPriceShipping):0;
        
        // let currencyUSDtoCurrency = await Dao.findOne(Models.currencies, {
        //     from: "USD",
        //     to: payload.currency
        // }, {} ,{lean: true});

        // let currencyUSDtoCurrency = await Dao.findOne(Models.currencies, { $or: [{ "from": "USD", "to": payload.currency },
        // { "to": "USD", "from": payload.currency }] }, {} ,{lean: true});

        // perKgPriceShipping = currencyUSDtoCurrency? perKgPriceShipping * currencyUSDtoCurrency.conversion: perKgPriceShipping
        let shippingCharges=0;
        let shippingChargesAfterDiscount=0;
        let shippingChargesDiscount=0;
        let shippingWeight = getSetting.weightForShipping || 5
        shippingCharges = lastSubscription[0] && lastSubscription[0].plan.localShippingCharges?parseFloat(lastSubscription[0].plan.localShippingCharges):getSetting.defaultShippingCharge || 25;
        // shippingCharges = currencyUSDtoCurrency? shippingCharges * currencyUSDtoCurrency.conversion: shippingCharges
        
        if(payload.weight > shippingWeight){
            shippingCharges = shippingCharges + (parseFloat(payload.weight - shippingWeight) * parseFloat(perKgPriceShipping))
        }
        if(shippingChargesDiscountPercentage){
            shippingChargesDiscount = shippingCharges * shippingChargesDiscountPercentage / 100;
            console.log("shippingChargesDiscount",shippingCharges,shippingChargesDiscount)
            shippingChargesAfterDiscount = shippingCharges - shippingChargesDiscount;
            console.log("shippingChargesDiscount",shippingChargesAfterDiscount)
        }else{
            shippingChargesAfterDiscount = shippingCharges
        }

        return {
            localShippingCost: parseFloat(shippingChargesAfterDiscount),
            shippingChargesDiscount: parseFloat(shippingChargesDiscount),
            shippingCharges: parseFloat(shippingCharges),
            interNationalShippingCost: parseFloat(60)
        }
    }catch(e){
        throw e
    }
}

module.exports = {
    addOrEditProduct: addOrEditProduct,
    listProduct: listProduct,
    deleteProduct: deleteProduct,
    updatePorductSizesCommon: updatePorductSizesCommon,
    updateCreatedAt: updateCreatedAt, 
    getShippingCost: getShippingCost
};
