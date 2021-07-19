// constants imported
const RESPONSE_MESSAGES = require('../../../config/constants').responseMessages;
const APP_CONSTANTS = require('../../../config').constants.appDefaults;

// local modules
const Dao = require('../../../dao').queries;
const Models = require('../../../models');
const mongoose = require('mongoose');
const ProductHelper = require('../../helper-functions/products');
const UniversalFunctions = require('../../../utils/universal-functions');
const moment = require('moment');
const Json2csvParser = require("json2csv").Parser;

const vendorListing = async (payload, adminData) => {
    try {
        let criteria = {
            userType: {$in: [APP_CONSTANTS.USER_TYPE.VENDOR_OWNER, APP_CONSTANTS.USER_TYPE.SUB_VENDOR]}
        };
        if (payload.search) {
            criteria = {
                $or: [
                    {name: new RegExp(UniversalFunctions.escapeRegex(payload.search), 'i')},
                    {firstName: new RegExp(UniversalFunctions.escapeRegex(payload.search), 'i')},
                    {lastName: new RegExp(UniversalFunctions.escapeRegex(payload.search), 'i')},
                    {vendorRegisterName: new RegExp(UniversalFunctions.escapeRegex(payload.search), 'i')},
                    {email: new RegExp(UniversalFunctions.escapeRegex(payload.search), 'i')},
                    {'phoneNumber.phoneNo': new RegExp(UniversalFunctions.escapeRegex(payload.search), 'i')},
                    {'phoneNumber.countryCode': new RegExp(UniversalFunctions.escapeRegex(payload.search), 'i')},
                ]
            }
        }
        criteria.status = {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED};

        if (payload.vendorId) criteria._id = mongoose.Types.ObjectId(payload.vendorId);
        if (payload.vendorSize) criteria.vendorSize = mongoose.Types.ObjectId(payload.vendorSize);
        if (payload.vendorPurpose) criteria.vendorPurpose = payload.vendorPurpose;
        if (payload.country) criteria.country = mongoose.Types.ObjectId(payload.country);
        if (payload.startDate && payload.endDate) {
            criteria.createdDate = {
                $lte: payload.endDate,
                $gte: payload.startDate
            }
        }
        let option = {
            lean: true,
            sort: {vendorRegisterName: 1}
        };

        if (payload.skip) option.skip = payload.skip;
        if (payload.limit) option.limit = payload.limit;
        if (payload.plan) criteria['subscription.plan'] = mongoose.Types.ObjectId(payload.plan);
        if (payload.isVerified || payload.isVerified === false) {
            criteria.isVerified = payload.isVerified
        }
        if (payload.isAdminVerified || payload.isAdminVerified === false) {
            criteria.isAdminVerified = payload.isAdminVerified
        }
        let populate = [
            {
                path: 'vendorSize',
                select: 'name',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
            },
            {
                path: 'courierService',
                select: 'name',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
            },
            {
                path: 'country',
                select: 'name inCoverageArea',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
            },
            {
                path: 'bankDetails.country',
                select: 'name inCoverageArea',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
            },
            {
                path: 'coverageArea',
                select: 'name',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
            },
            {
                path: 'parentId',
                select: 'name',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
            },
            {
                path: 'subscription.plan',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.PLANS
            },
            {
                path: 'subscription.subscriptionLogId',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.SUBSCRIPTION_LOGS
            },
            {
                path: 'discountOfferPlan.subscriptionLogId',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.SUBSCRIPTION_LOGS
            },
            {
                path: 'plusCardPlan.subscriptionLogId',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.SUBSCRIPTION_LOGS
            },
            {
                path: 'eliteAdPlan.subscriptionLogId',
                model: APP_CONSTANTS.DATABASE.MODELS_NAME.SUBSCRIPTION_LOGS
            },
        ];

        let aggregateArray = [
            {$match: criteria},
            {$sort: {_id: -1}},

        ];
        if(payload.skip){
            aggregateArray.push({$skip: payload.skip})
        }
        if(payload.limit){
            aggregateArray.push({$limit: payload.limit})
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
                $project: {
                    vendorCategories: 0
                }
            })
        let [data, count] = await Promise.all([
            Dao.aggregateDataWithPopulate(Models.vendors, aggregateArray, populate),
            Dao.countDocuments(Models.vendors, criteria)
        ]);

        if(payload.isCSV){
            return await createCSVVendor(data)
        }
        else{
            return {data, count}
        }
    } catch (e) {
        throw e
    }
};


const blockUnblockVendor = async (payload, adminData) => {
    try {
        let criteria = {
            _id: payload.vendorId
        };
        let getUserData = await Dao.findOne(Models.vendors, criteria, {}, {lean: true});
        if (getUserData) {
            if (payload.action === true && getUserData.status === APP_CONSTANTS.STATUS_ENUM.BLOCKED) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.STORE_ALREADY_BLOCKED
            } else if (payload.action === false && getUserData.status === APP_CONSTANTS.STATUS_ENUM.ACTIVE) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.STORE_ALREADY_UNBLOCKED
            } else {
                let dataToUpdate = {};
                payload.action === true ? dataToUpdate.status = APP_CONSTANTS.STATUS_ENUM.BLOCKED : dataToUpdate.status = APP_CONSTANTS.STATUS_ENUM.ACTIVE;
                return await Dao.findAndUpdate(Models.vendors, criteria, dataToUpdate, {lean: true, new: true});
            }
        } else return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID)
    } catch (e) {
        throw e
    }
};


const verifyVendor = async (payload, adminData) => {
    try {
        let criteria = {
            _id: payload.vendorId
        };
        let getUserData = await Dao.findOne(Models.vendors, criteria, {}, {lean: true});
        if (getUserData) {
            if (payload.action === true && getUserData.isAdminVerified === true) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.STORE_ALREADY_VERIFIED
            } else {
                let dataToUpdate = {
                    isAdminVerified: payload.action,
                };
                if (payload.reason) dataToUpdate.reason = payload.reason;
                return await Dao.findAndUpdate(Models.vendors, criteria, dataToUpdate, {lean: true, new: true});
            }
        } else return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID)
    } catch (e) {
        throw e
    }
};


const deleteVendor = async (payload, adminData) => {
    try {
        let criteria = {
            _id: payload.vendorId
        };
        let getUserData = await Dao.findOne(Models.vendors, criteria, {}, {lean: true});
        if (getUserData) {
            let dataToUpdate = {
                status: APP_CONSTANTS.STATUS_ENUM.DELETED,
                updatedDate: +new Date(),
                adminUpdateId: adminData._id
            };
            return await Dao.findAndUpdate(Models.vendors, criteria, dataToUpdate, {lean: true, new: true});
        } else return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID)
    } catch (e) {
        throw e
    }
};

const listProducts = async (payload, adminData) => {
    try {
        payload.status = {$ne: APP_CONSTANTS.STATUS_ENUM.DELETED};
        return await ProductHelper.listProductsAdmin(payload, adminData)
    } catch (e) {
        throw e
    }
};


const blockUnblockProduct = async (payload, adminData) => {
    try {
        let criteria = {
            _id: payload.productId
        };
        let getUserData = await Dao.findOne(Models.products, criteria, {}, {lean: true});
        if (getUserData) {
            if (payload.action === true && getUserData.status === APP_CONSTANTS.STATUS_ENUM.BLOCKED) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.STORE_ALREADY_BLOCKED
            } else if (payload.action === false && getUserData.status === APP_CONSTANTS.STATUS_ENUM.ACTIVE) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.STORE_ALREADY_UNBLOCKED
            } else {
                let dataToUpdate = {};
                payload.action === true ? dataToUpdate.status = APP_CONSTANTS.STATUS_ENUM.BLOCKED : dataToUpdate.status = APP_CONSTANTS.STATUS_ENUM.ACTIVE;
                return await Dao.findAndUpdate(Models.products, criteria, dataToUpdate, {
                    lean: true,
                    new: true
                });
            }
        } else return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID)
    } catch (e) {
        throw e
    }
};

const deleteProduct = async (payload, adminData) => {
    try {
        let criteria = {
            _id: payload._id
        };
        let getUserData = await Dao.findOne(Models.products, criteria, {}, {lean: true});
        if (getUserData) {
            let dataToUpdate = {};
            dataToUpdate.updatedDate = +new Date();
            dataToUpdate.updatedBy = adminData._id;
            dataToUpdate.status = APP_CONSTANTS.STATUS_ENUM.DELETE;
            return await Dao.findAndUpdate(Models.products, criteria, dataToUpdate, {
                lean: true,
                new: true
            });
        } else return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID)
    } catch (e) {
        throw e
    }
};


const approveUnApproveProduct = async (payload, adminData) => {
    try {
        let criteria = {
            _id: payload.productId
        };
        let getProductData = await Dao.findOne(Models.products, criteria, {}, {lean: true});
        if (getProductData) {
            if (payload.action === true && getProductData.isAdminVerified === true) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.PRODUCT_ALREADY_APPROVED
            } else if (payload.action === false && getProductData.isAdminVerified === false) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.PRODUCT_ALREADY_DISAPPROVED
            } else {
                let dataToUpdate = {
                    isAdminVerified: payload.action,
                    status: payload.action ? APP_CONSTANTS.STATUS_ENUM.ACTIVE : APP_CONSTANTS.STATUS_ENUM.REJECTED
                };
                return await Dao.findAndUpdate(Models.products, criteria, dataToUpdate, {
                    lean: true,
                    new: true
                });
            }
        } else return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID)
    } catch (e) {
        throw e
    }
};

const updateVendor = async (payload, userData) => {
    try {
        let checkVendor = await Dao.findOne(Models.vendors, {_id: payload.vendorId}, {_id: 1}, {lean: true});
        if (!checkVendor) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID
        let dataToUpdate = {
            autoApprovalProduct: payload.autoApprovalProduct
        };
        return await Dao.findAndUpdate(Models.vendors, {_id: payload.vendorId}, dataToUpdate, {lean: true, new: true})
    } catch (e) {
        throw e
    }
}


const updateProduct = async (payload, userData) => {
    try {
        let checkProduct = await Dao.findOne(Models.products, {_id: payload.productId}, {_id: 1}, {lean: true});
        if (!checkProduct) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID
        let dataToUpdate = {
            productTag: payload.productTag
        };
        return await Dao.findAndUpdate(Models.products, {_id: payload.productId}, dataToUpdate, {lean: true, new: true})
    } catch (e) {
        throw e
    }
};


let createCSVVendor = async (data)=>{
    try {
        data = JSON.parse(JSON.stringify(data))
        let fields = [
            "Sr. No.",
            "Vendor Name",
            "Vendor Register Name",
            "Email",
            "Phone Number",
            "Selected Plan",
            "Address",
            "Vendor Size",
            "Vendor Purpose",
            "Business Description",
            "Owner Bio",
            "Country",
            "Registered At",
            "Is OTP Verified",
            "Auto Approve Products",
            "Verify User",
        ];

        let invoiceData = [];
        let invoiceObject = {};
        for (let i = 0; i < data.length; i++) {
            invoiceObject = {};
            invoiceObject["Sr. No."] = i + 1;
            invoiceObject["Vendor Name"] = data[i].firstName?`${data[i].firstName} ${data[i].lastName}`:"";
            invoiceObject["Vendor Register Name"] = data[i].vendorRegisterName? `${data[i].vendorRegisterName}`:"";
            invoiceObject["Email"] = data[i].email?`${data[i].email}`:"";
            invoiceObject["Phone Number"] = data[i].phoneNumber?`${data[i].phoneNumber.countryCode} ${data[i].phoneNumber.phoneNo}`:"";
            invoiceObject["Selected Plan"] = `${data[i].subscription && data[i].subscription.plan?data[i].subscription.plan.name["en"]: 'NA'}`;
            invoiceObject["Address"] = data[i].address?`${data[i].address}`:"";
            invoiceObject["Vendor Size"] = data[i].vendorSize?`${data[i].vendorSize.name["en"]}`:`NA`;
            invoiceObject["Vendor Purpose"] = `${data[i].vendorPurpose}`;
            invoiceObject["Business Description"] = data[i].businessDescription?`${data[i].businessDescription}`:"";
            invoiceObject["Owner Bio"] = data[i].ownerBio?`${data[i].ownerBio}`:"";
            invoiceObject["Country"] = `${data[i].country?data[i].country.name['en']: 'NA'}`;
            invoiceObject["Registered At"] = `${moment(data[i].createdDate).format("LLL")}`;
            invoiceObject["Is OTP Verified"] = `${data[i].isVerified ? 'Yes': 'No'}`;
            invoiceObject["Auto Approve Products"] = `${data[i].autoApprovalProduct? 'Yes': 'No'}`;
            invoiceObject["Verify User"] = `${data[i].isAdminVerified? 'Yes': 'No'}`;

            invoiceData.push(invoiceObject);
        }

        const json2csvParser = new Json2csvParser({fields});

        let csv = await json2csvParser.parse(invoiceData);
        console.log("csv",csv)
        return csv;
    } catch (err) {
        throw err;
    }
};



module.exports = {
    vendorListing: vendorListing,
    verifyVendor: verifyVendor,
    blockUnblockVendor: blockUnblockVendor,
    deleteVendor: deleteVendor,
    listProducts: listProducts,
    approveUnApproveProduct: approveUnApproveProduct,
    blockUnblockProduct: blockUnblockProduct,
    deleteProduct: deleteProduct,
    updateVendor: updateVendor,
    updateProduct: updateProduct
};
