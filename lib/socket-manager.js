'use strict';
const TokenManager = require('../lib/token-manager'),
    Config = require('../config'),
    UniversalFunctions = require('../utils/universal-functions'),
    joi = require('joi'),
    NotificationManager = require('../lib/notification-manager'),
    COMMON_VALIDATOR = require('../api/helper-functions/commonValidator'),
    APP_CONSTANTS = require('../config/constants/app-defaults'),
    RESPONSE_MESSAGES = require('../config/constants/response-messages');

let io = require('socket.io')(process.env.SOCKET_PORT);
const redis = require('socket.io-redis');
const Redis = require('ioredis');
const redisClient = new Redis();

io.adapter(redis({host: '127.0.0.1', port: 6379}));

let socketInfo = {};
io.on('connection', async (socket) => {
    try {
        console.log("socket id is....", socket.id, "query>>>>>>>", socket.handshake.query);

        let userData = {};
        if (socket.id) {
            let query = socket.handshake.query;

            const {error, value: envVars} = joi.validate(query, COMMON_VALIDATOR.SOCKET_CONNECTION);

            if (error) {
                throw error;
            } else {

                let userData;
                if (query.userType === APP_CONSTANTS.USER_TYPE.USER) {
                    userData = await TokenManager.verifyTokenSocket(query.accessToken, process.env.JWT_SECRET_USER);

                    if (userData.err) {
                        throw userData
                    } else {
                        socketInfo[userData._id] = socket.id;
                        socket.join(`${userData._id}`)
                        await Dao.findAndUpdate(Models.user, {
                            _id: userData._id
                        },{
                            active: true,
                            activeAgo: +new Date()
                        },{
                            lean: true,
                            new: true
                        })
                        await emitActiveSocket(userData, APP_CONSTANTS.FEED_LIST_TYPE.USER)
                        console.log("Socket connected------------> ", socketInfo)
                        await redisClient.set(userData._id.toString(), socket.id);
                    }
                }
                if (query.userType === APP_CONSTANTS.FEED_LIST_TYPE.VENDOR) {
                    userData = await TokenManager.verifyTokenSocket(query.accessToken, process.env.JWT_SECRET_VENDOR);

                    if (userData.err) {
                        throw userData
                    } else {
                        socketInfo[userData._id] = socket.id;
                        socket.join(`${userData._id}`)
                        await Dao.findAndUpdate(Models.vendors, {
                            _id: userData._id
                        },{
                            active: true,
                            activeAgo: +new Date()
                        },{
                            lean: true,
                            new: true
                        })
                        await emitActiveSocket(userData, APP_CONSTANTS.FEED_LIST_TYPE.VENDOR)
                        await redisClient.set(userData._id.toString(), socket.id);
                    }
                }

                socket.emit(APP_CONSTANTS.SOCKET_NAME_EMIT.CONNECTED, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.SOCKET_CONNECTION);


                socket.on(APP_CONSTANTS.SOCKET_NAME_LISTEN.SEND_MESSAGE, async function (data, fn) { ////senderId && receiverId && ((message || fileUrl) && messageType)
                    console.log("data", data)
                    const {error, value: envVars} = joi.validate(data, COMMON_VALIDATOR.MESSAGE_AUTH);
                    if (error) {
                        throw error
                    } else {
                        data.sender = userData._id;
                        if (data.sender && data.receiver) {
                            let dataToReturn = await sendMessage(data);
                            console.log("dataToReturn", dataToReturn)
                            fn(dataToReturn)
                        }
                    }
                });

                socket.on(APP_CONSTANTS.SOCKET_NAME_LISTEN.DISCONNECT, async () => {
                    console.log('Socket disconnected---->>>>>>>>>', socketInfo);
                    let userId;
                    if (socketInfo.hasOwnProperty(socket.id)) userId = socketInfo[socket.id];
                    if (socketInfo.hasOwnProperty(userId)) delete socketInfo[userId];
                    if (socketInfo.hasOwnProperty(socket.id)) delete socketInfo[socket.id];
                    socket.leave(`${userData._id}`)
                    await Dao.findAndUpdate(Models.user, {
                        _id: userData._id
                    },{
                        active: false,
                        activeAgo: +new Date()
                    },{
                        lean: true,
                        new: true
                    })
                    await Dao.findAndUpdate(Models.vendors, {
                        _id: userData._id
                    },{
                        active: false,
                        activeAgo: +new Date()
                    },{
                        lean: true,
                        new: true
                    })
                    if(userData.userType === APP_CONSTANTS.USER_TYPE.USER)
                        await emitInActiveSocket(userData, APP_CONSTANTS.FEED_LIST_TYPE.USER)
                    else await emitInActiveSocket(userData, APP_CONSTANTS.FEED_LIST_TYPE.VENDOR)
                });

                socket.on(APP_CONSTANTS.SOCKET_NAME_LISTEN.ERROR, (error) => {
                    console.log("error", error);
                    throw error
                })
            }

        } else {
            throw {error: RESPONSE_MESSAGES.STATUS_MSG.ERROR.SOCKET_CONNECTION}
        }

    } catch (e) {
        console.log("eeeeeeeeeee", e);

        let error = {
            statusCode: 400,
            message: {
                en: e.msg
            },
            type: 'SOCKET_CONNECTION'
        };
        if (e.error) {
            error = e.error
        } else if (e.err) {
            error = {
                statusCode: 400,
                message: {
                    en: e.err
                },
                type: 'SOCKET_CONNECTION'
            }
        }
        socket.emit(APP_CONSTANTS.SOCKET_NAME_EMIT.SOCKET_ERROR, error);
    }

});

let emitInActiveSocket = async (userData, userType)=>{
    try{
        let data = {
            id: userData._id,
            active: false,
            activeAgo: +new Date(),
            userType: userType
        }
        io.emit(APP_CONSTANTS.SOCKET_NAME_EMIT.INACTIVE, data)
    }catch (e) {
        throw e
    }
}

let emitActiveSocket = async (userData, userType)=>{
    try{
        let data = {
            id: userData._id,
            active: true,
            activeAgo: +new Date(),
            userType: userType
        }
        io.emit(APP_CONSTANTS.SOCKET_NAME_EMIT.ACTIVE, data)
    }catch (e) {
        throw e
    }
}

const sendMessage = async (data) => {
    try {
        console.log({data})
        let senderReceiverDetails = await senderReceiver(data);
        let chat = await checkConversation(data);
        if (chat) data.conversationId = chat.conversationId;
        else data.conversationId = mongoose.Types.ObjectId();
        let saveMsg = await saveMessage(data, chat);
        data = JSON.parse(JSON.stringify(data));
        let sendSocket = await sendMessageSocket(data, saveMsg, senderReceiverDetails);
        let sendNotification = await sendNotificationChat(data, saveMsg, senderReceiverDetails);
        console.log("datadatadatadatadatadatadatadatadatadatadatadata")
        console.log("datadatadatadatadatadatadatadatadatadatadatadata")
        return data;
    } catch (e) {
        throw e
    }

};

let senderReceiver = async (data) => {
    let senderModel = data.senderUserType === APP_CONSTANTS.FEED_LIST_TYPE.USER ? Models.user : Models.vendors;
    let receiverModel = data.receiverUserType === APP_CONSTANTS.FEED_LIST_TYPE.USER ? Models.user : Models.vendors;
    let projection = {_id: 1, name: 1, firstName: 1, lastName: 1, deviceToken: 1, deviceType: 1, language: 1},
        option = {lean: true};


    let [sender, receiver] = await Promise.all([
        Dao.findOne(senderModel, {_id: data.sender}, projection, option),
        Dao.findOne(receiverModel, {_id: data.receiver}, projection, option),
    ]);

    console.log({sender,receiver})
    return {sender, receiver}
};


let checkConversation = async (data) => {
    try {
        console.log("------------Check Conversation function-------------")

        let c1 = {sender: data.sender, receiver: data.receiver};
        let c2 = {sender: data.receiver, receiver: data.sender};
        let criteria = {
            $or: [c1, c2],
        };
        let option = {
            lean: true,
        };
        let projection = {
            conversationId: 1,
            sender: 1,
            receiver: 1,
        };
        return await Dao.findOne(Models.chat, criteria, projection, option);
    } catch (e) {
        throw e
    }

};

let saveMessage = async (data, chat) => {
    try {
        console.log("------------save Message function-------------")

        let dataToSet = {};
        if (data.sender) dataToSet.sender = data.sender;
        if (data.receiver) dataToSet.receiver = data.receiver;
        dataToSet.senderModel = data.senderUserType === APP_CONSTANTS.FEED_LIST_TYPE.USER ? APP_CONSTANTS.DATABASE.MODELS_NAME.USER : APP_CONSTANTS.DATABASE.MODELS_NAME.USER;
        dataToSet.receiverModel = data.receiverUserType === APP_CONSTANTS.FEED_LIST_TYPE.USER ? APP_CONSTANTS.DATABASE.MODELS_NAME.USER : APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS;

        dataToSet.createdDate = +new Date();
        if (chat) dataToSet.chatCreatedDate = chat.chatCreatedDate;
        else dataToSet.chatCreatedDate = +new Date()

        if (data.isRead) dataToSet.isRead = data.isRead;
        if (data.messageType) dataToSet.messageType = data.messageType;
        if (data.viewType) dataToSet.viewType = data.viewType;
        dataToSet.conversationId = data.conversationId;
        if (data.fileUrl) {
            dataToSet.fileUrl = data.fileUrl;
        }
        dataToSet.message = data.message;
        if(data.senderUserType===APP_CONSTANTS.FEED_LIST_TYPE.VENDOR || data.receiverUserType === APP_CONSTANTS.FEED_LIST_TYPE.VENDOR){
            dataToSet.chatWith = APP_CONSTANTS.FEED_LIST_TYPE.VENDOR
        }
        return await Dao.saveData(Models.chat, dataToSet);
    } catch (e) {
        throw e
    }

};


let sendMessageSocket = async (data, saveChat, senderReceiver) => {
    try {
        data.sender = {
            _id: senderReceiver.sender._id,
            ...(senderReceiver.sender.name && {name: senderReceiver.sender.name}),
            ...(senderReceiver.sender.firstName && {firstName: senderReceiver.sender.firstName}),
            ...(senderReceiver.sender.lastName && {lastName: senderReceiver.sender.lastName}),
        };

        data.receiver = {
            _id: senderReceiver.receiver._id,
            ...(senderReceiver.receiver.name && {name: senderReceiver.receiver.name}),
            ...(senderReceiver.receiver.firstName && {firstName: senderReceiver.receiver.firstName}),
            ...(senderReceiver.receiver.lastName && {lastName: senderReceiver.receiver.lastName}),
        };

        data._id = saveChat._id;
        data.createdDate = saveChat.createdDate;
        console.log("Socket Info",socketInfo)
        let to;
        if (JSON.stringify(socketInfo).includes(JSON.stringify(data.receiver._id))) {
            to = socketInfo[data.receiver._id];
        }

        if (to) {
            console.log("tototototototototototoMessage Socket", to);
            io.to(to).emit(APP_CONSTANTS.SOCKET_NAME_EMIT.RECEIVE_MESSAGE, data);
        } else {
            // let socketId = await redisClient.get(data.receiver._id.toString());
            // console.log("socketIdsocketIdMessage Socket", socketId);
            //
            // io.to(socketId).emit(APP_CONSTANTS.SOCKET_NAME_EMIT.RECEIVE_MESSAGE, data);
            // io.emit(`${data.receiver._id}`)
            console.log("Message Socket", data.receiver._id);

            io.to(`${data.receiver._id}`).emit(APP_CONSTANTS.SOCKET_NAME_EMIT.RECEIVE_MESSAGE, data)
        }
        return {}
    } catch (e) {
        console.log("")

        throw e
    }

};

let sendNotificationChat = async (data, saveChat, senderReceiver) => {
    try {
        let notify = {};
        let message = await UniversalFunctions.renderMessageAccordingToLanguage(APP_CONSTANTS.DATABASE.NOTIFICATION_MESSAGE.NEW_MESSAGE, {
            userName: data.senderUserType === APP_CONSTANTS.USER_TYPE.USER ? `${senderReceiver.sender.firstName} ${senderReceiver.sender.lastName}` : `${senderReceiver.sender.name}`
        })
        let notificationData = {
            savePushData: {
                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.NEW_MESSAGE,
                message: message,
                chat: saveChat._id,
                receiver: senderReceiver.receiver._id,
                sender: senderReceiver.sender,
                createdDate: +new Date(),
                senderModel: data.receiverUserType === APP_CONSTANTS.FEED_LIST_TYPE.VENDOR ? APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS : APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                receiverModel: data.receiverUserType === APP_CONSTANTS.FEED_LIST_TYPE.VENDOR ? APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS : APP_CONSTANTS.DATABASE.MODELS_NAME.USER,
                userType: data.receiverUserType === APP_CONSTANTS.FEED_LIST_TYPE.VENDOR ? APP_CONSTANTS.USER_TYPE.VENDOR_OWNER: APP_CONSTANTS.USER_TYPE.USER,
                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.SENT_MESSAGE
            },
            sendPushData: {
                title: APP_CONSTANTS.DATABASE.NOTIFICATION_TITLE.NEW_MESSAGE[senderReceiver.receiver.language ? senderReceiver.receiver.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                message: message[senderReceiver.receiver.language ? senderReceiver.receiver.language : APP_CONSTANTS.DATABASE.LANGUAGES.EN],
                chat: saveChat._id,
                notificationType: APP_CONSTANTS.DATABASE.NOTIFICATION_TYPE.SENT_MESSAGE,
                sender: {
                    _id: senderReceiver.sender._id,
                }
            },
            type: data.receiverUserType === APP_CONSTANTS.FEED_LIST_TYPE.VENDOR ? APP_CONSTANTS.USER_TYPE.VENDOR_OWNER: APP_CONSTANTS.USER_TYPE.USER,
            deviceType: senderReceiver.receiver.deviceType,
            deviceToken: senderReceiver.receiver.deviceToken
        };

        await NotificationManager.sendNotifications(notificationData, false);
        console.log("sendNotificationChatsendNotificationChat")
        console.log("sendNotificationChatsendNotificationChat")
        console.log("sendNotificationChatsendNotificationChat")
        return {}
    } catch (e) {
        throw e
    }

};

const commonSockets = async (data, receiverId, socketName) => {

    console.log("socketNamesocketName", socketName, data)

    try {
        let to;
        if (JSON.stringify(socketInfo).includes(JSON.stringify(receiverId))) {
            to = socketInfo[receiverId];
        }
        if (to) {
            console.log("tototototototototo", to)

            io.to(to).emit(socketName, data);
        } else {
            // let socketId = await redisClient.get(receiverId.toString());
            // console.log("socketIdsocketIdsocketId", socketId)
            // io.to(socketId).emit(socketName, data);
            // io.emit(`${receiverId}`)
            io.to(`${receiverId}`).emit(socketName, data)
        }
    } catch (e) {
        console.log("eeeeeeeeeeeeeee socket common", e)
    }

};


module.exports = {
    commonSockets: commonSockets,
    sendMessage: sendMessage
}
