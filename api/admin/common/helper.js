// constants imported
const RESPONSE_MESSAGES = require('../../../config/constants').responseMessages;
const APP_CONSTANTS = require('../../../config').constants.appDefaults;
const CONSTANTS = require('../../../config').storageConf;

// local modules
const Dao = require('../../../dao').queries;


const saveCategory = async (payload, userData, model) => {
    payload.addedBy = userData && userData._id ? userData._id : null;
    payload.updatedBy = userData && userData._id ? userData._id : null;
    payload.createdDate = +new Date();
    payload.updatedDate = +new Date();
    return await Dao.saveData(model, payload);
};

const updateCategory = async (criteria, payload, userData,model) => {
    payload.updatedBy = userData && userData._id ? userData._id : null;
    payload.updatedDate = +new Date();
    return await Dao.findAndUpdate(model, criteria, payload, {lean: true, new: true});
};

const commonBlockUnblock = async (payload, userData, model) => {
    try{
        let criteria = {
            _id: payload._id
        };
        let getUserData = await Dao.findOne(model, criteria, {}, {lean: true});
        if (getUserData) {
            if (payload.action === true && getUserData.status === APP_CONSTANTS.STATUS_ENUM.BLOCKED) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.ALREADY_BLOCKED
            }
            else if (payload.action === false && getUserData.status === APP_CONSTANTS.STATUS_ENUM.ACTIVE) {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.ALREADY_UNBLOCKED
            }
            else {
                let dataToUpdate = {};
                dataToUpdate.updatedDate = +new Date();
                dataToUpdate.updatedBy = userData._id;
                payload.action === true ? dataToUpdate.status = APP_CONSTANTS.STATUS_ENUM.BLOCKED : dataToUpdate.status = APP_CONSTANTS.STATUS_ENUM.ACTIVE;
                return await Dao.findAndUpdate(model, criteria, dataToUpdate, {lean: true, new: true});
            }
        }
        else return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID)
    }catch (e) {
        throw e
    }
};

const deleteCommonData = async (payload, userData, model) => {
    try{
        let criteria = {
            _id: payload._id
        };
        let getUserData = await Dao.findOne(model, criteria, {}, {lean: true});
        if (getUserData) {
            let dataToUpdate = {};
            dataToUpdate.updatedDate = +new Date();
            dataToUpdate.updatedBy = userData._id;
            dataToUpdate.status = APP_CONSTANTS.STATUS_ENUM.DELETED;
            return await Dao.findAndUpdate(model, criteria, dataToUpdate, {lean: true, new: true});
        }
        else return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID)
    }catch (e) {
        throw e
    }
};

const saveCommonService = async (payload, userData, model) => {
    payload.addedBy = userData && userData._id ? userData._id : null;
    payload.updatedBy = userData && userData._id ? userData._id : null;
    payload.createdDate = +new Date();
    payload.updatedDate = +new Date();
    return await Dao.saveData(model, payload);
};

const updateCommonService = async (criteria, payload, userData, model) => {
    payload.updatedBy = userData && userData._id ? userData._id : null;
    payload.updatedDate = +new Date();
    return await Dao.findAndUpdateWithPopulate(model, criteria, payload, {lean: true, new: true}, [{
        path: 'vendor',
        select: 'vendorRegisterName',
        model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
    },
    {
        path: 'discountOffer',
        select: 'name description',
        model: APP_CONSTANTS.DATABASE.MODELS_NAME.COMMON_SERVICES
    }]);
};


module.exports = {
    saveCategory: saveCategory,
    updateCategory: updateCategory,
    saveCommonService: saveCommonService,
    updateCommonService: updateCommonService,
    commonBlockUnblock: commonBlockUnblock,
    deleteCommonData: deleteCommonData
}
