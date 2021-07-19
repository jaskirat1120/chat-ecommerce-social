const UniversalFunctions = require('../../utils/universal-functions');
const moment = require('moment');
const Json2csvParser = require("json2csv").Parser;

const userListing = async (payload, adminData, type) => {
    try {
        let criteria = {
            userType: type
        };
        if (payload.search) {
            criteria = {
                $or: [
                    {firstName: new RegExp(UniversalFunctions.escapeRegex(payload.search), 'i')},
                    {lastName: new RegExp(UniversalFunctions.escapeRegex(payload.search), 'i')},
                    {email: new RegExp(UniversalFunctions.escapeRegex(payload.search), 'i')},
                    {'phoneNumber.phoneNo': new RegExp(UniversalFunctions.escapeRegex(payload.search), 'i')},
                ]
            }
        }
        criteria.status = {$ne: APP_CONSTANTS.DATABASE.DOC_STATUSES.DELETED};
        if (payload.userId) criteria._id = payload.id;

        let option = {
            lean: true,
            sort: {firstName: -1}
        };
        if(payload.startDate && payload.endDate){
            criteria.createdDate = {
                $lte: payload.endDate,
                $gte: payload.startDate
            }
        }
        if(payload.skip) option.skip = parseInt(payload.skip);
        if(payload.limit) option.limit = parseInt(payload.limit);
        let project = {
            firstName: 1,
            lastName: 1,
            email: 1,
            phoneNumber: 1,
            signUpBy: 1,
            bio: 1,
            profileStatus: 1,
            latLong: 1,
            status: 1,
            createdDate: 1,
            profilePic: 1,
            isVerified: 1,
        };
        let [data, count] = await Promise.all([Dao.getData(Models.user, criteria, project, option),
            Dao.countDocuments(Models.user, criteria)]);
        if(payload.isCSV){
            return await createCSVUser(data)
        }
        else{
            return {data, count}
        }
    } catch (e) {
        throw e
    }
}



let createCSVUser = async (data)=>{
    try {
        data = JSON.parse(JSON.stringify(data))
        let fields = [
            "Sr. No.",
            "Name",
            "Email",
            "Phone Number",
            "Registered At",
            "Is OTP Verified",
        ];

        let invoiceData = [];
        let invoiceObject = {};
        for (let i = 0; i < data.length; i++) {
            invoiceObject = {};
            invoiceObject["Sr. No."] = i + 1;
            invoiceObject["Name"] = `${data[i].firstName} ${data[i].lastName}`;
            invoiceObject["Email"] = `${data[i].email}`;
            invoiceObject["Phone Number"] = data[i].phoneNumber && data[i].phoneNumber.countryCode && data[i].phoneNumber.phoneNo?`${data[i].phoneNumber.countryCode} ${data[i].phoneNumber.phoneNo}`: "";
            invoiceObject["Registered At"] = `${moment(data[i].createdDate).format("LLL")}`;
            invoiceObject["Is OTP Verified"] = `${data[i].isVerified ? 'Yes': 'No'}`;

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


const blockUnblockUser = async (payload, adminData) => {
    try {
        let criteria = {
            _id: payload.id
        };
        let getUserData = await Dao.findOne(Models.user, criteria, {}, {lean: true});
        if (getUserData) {
            if (payload.action === true && getUserData.status === APP_CONSTANTS.STATUS_ENUM.BLOCKED) {
                return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.USER_ALREADY_BLOCKED)
            }
            else if (payload.action === false && getUserData.status === APP_CONSTANTS.STATUS_ENUM.ACTIVE) {
                return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.USER_ALREADY_UNBLOCKED)
            }
            else {
                let dataToUpdate = {
                    updatedDate: +new Date(),
                    adminUpdateId: adminData._id
                };
                payload.action === true ? dataToUpdate.status = APP_CONSTANTS.STATUS_ENUM.BLOCKED : dataToUpdate.status = APP_CONSTANTS.STATUS_ENUM.ACTIVE;
                return await Dao.findAndUpdate(Models.user, criteria, dataToUpdate, {lean: true, new: true});
            }
        }
        else return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID)
    } catch (e) {
        throw e
    }
};

const deleteUser = async (payload, adminData) => {
    try {
        let criteria = {
            _id: payload.id
        };
        let getUserData = await Dao.findOne(Models.user, criteria, {}, {lean: true});
        if (getUserData) {
            let dataToUpdate = {
                status: APP_CONSTANTS.STATUS_ENUM.DELETED,
                updatedDate: +new Date(),
                adminUpdateId: adminData._id
            };
            return await Dao.findAndUpdate(Models.user, criteria, dataToUpdate, {lean: true, new: true});
        }
        else return Promise.reject(RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID)
    } catch (e) {
        throw e
    }
};


const resetPassword = async (payload, model) => {
    try {

        let query = {
            _id: payload.id
        };

        let projection = { "_id": 1, "email": 1, "password": 1, "resetPasswordExpiry": 1, "firstName": 1,"lastName": 1,"name": 1};
        let options = { lean: true };
        let updateOptions = { new: true };

        let findCustomer = await Dao.findOne(model, query, projection, options);
        if (findCustomer) {
            console.log("======", findCustomer)
            console.log('===Customer with Email Details==', findCustomer);
            if(!findCustomer.resetPasswordExpiry) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.OTP_EXPIRED;
            let updatePassword = {
                password: await UniversalFunctions.bCryptData(payload.password),
                $unset:{ resetPasswordExpiry: 1},
            };

            let updateCustomerWithEmail = await Dao.findAndUpdate(model, query, updatePassword, updateOptions);
            if (updateCustomerWithEmail) {
                return {}
            }
            else {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_EMAIL
            }

        }
        else {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_EMAIL;
        }
    }
    catch (err) {
        throw err
    }
};

module.exports = {
    userListing: userListing,
    blockUnblockUser: blockUnblockUser,
    deleteUser: deleteUser,
    resetPassword: resetPassword
}
