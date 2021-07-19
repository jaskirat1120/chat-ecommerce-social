
const CommonHelperFunction	=	require('../../helper-functions/admin');


const listUsers = async(payload,adminData) => {
    try {
       return await CommonHelperFunction.userListing(payload,adminData,APP_CONSTANTS.USER_TYPE.USER)
    }catch (e) {
        throw e
    }
}



const blockUnBlockUser = async(payload,adminData) => {
    try {
        return await CommonHelperFunction.blockUnblockUser(payload,adminData)
    }catch (e) {
        throw e
    }
};
const deleteUsers = async(payload,adminData) => {
    try {
        return await CommonHelperFunction.deleteUser(payload,adminData)
    }catch (e) {
        throw e
    }
};

module.exports = {
    listUsers:listUsers,
    blockUnBlockUser:blockUnBlockUser,
    deleteUsers:deleteUsers
}
