// constants imported
const RESPONSE_MESSAGES = require('../../../config/constants').responseMessages;
const APP_CONSTANTS = require('../../../config').constants.appDefaults;
const CONSTANTS = require('../../../config').storageConf;

// local modules
const Dao = require('../../../dao').queries;
const Models = require('../../../models');
const ChatCommon = require('../../helper-functions/chat');
const mongoose = require('mongoose');


const messageListingAggregate = async (payload, userData) => {
    try{
        return await ChatCommon.messageListingAggregate(payload, userData)
    }catch (e){
        throw e
    }
}

const chatListing = async (payload, userData) => {
    try {
        return await ChatCommon.chatListing(payload, userData)
    } catch (e) {
        throw e
    }
}

const deleteChat = async (payload, userData) => {
    try {
        return ChatCommon.deleteChat(payload, userData)
    } catch (e) {
        throw e
    }
}

const muteChat = async (payload, userData) => {
    try {
        return ChatCommon.muteChat(payload, userData)
    } catch (e) {
        throw e
    }
}

async function messageListingAggregateApp(payload, userData) {
    try{
        return ChatCommon.messageListingAggregateApp(payload, userData)
    }catch (e){
        throw e
    }
}

module.exports = {
    messageListingAggregate: messageListingAggregate,
    messageListingAggregateApp: messageListingAggregateApp,
    chatListing: chatListing,
    deleteChat: deleteChat,
    muteChat: muteChat
};
