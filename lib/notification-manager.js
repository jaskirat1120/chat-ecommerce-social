'use strict';


const FCM = require('fcm-node');
const Config = require('../config');
const Dao = require('../dao/queries');
const APP_CONSTANTS = require('../config/constants').appDefaults;
const serverKeyWeb = process.env.FCM_SERVER_KEY_WEB;
const serverKeyMobile = process.env.FCM_SERVER_KEY;
const fcmAdmin = new FCM(serverKeyWeb);
const fcmWeb = new FCM(serverKeyWeb);
const fcmUserMobile = new FCM(serverKeyMobile);
console.log(serverKeyWeb, "serverKeyMobile", serverKeyMobile)

let sendPush = function (deviceToken, data, type, deviceType) {
    console.log("***data******", data, deviceToken);
    return new Promise((resolve, reject) => {
        let message = {
            to: deviceToken,
            notification: {
                title: data.title,
                body: data.message,
                sound: "default",
                badge: 0,
                show_in_foreground: true
            },
            data: data,
            priority: 'high',
            show_in_foreground: true
        };
        if (type === APP_CONSTANTS.USER_TYPE.ADMIN) {
            fcmAdmin.send(message, function (err, result) {
                if (err) {
                    console.log("Something has gone wrong! Admin Web", err);
                    resolve(null);
                } else {
                    console.log("Successfully sent with response Admin Web: ", result);
                    resolve(null, result);
                }
            });
        } else if (type === APP_CONSTANTS.USER_TYPE.VENDOR_OWNER || type === APP_CONSTANTS.USER_TYPE.VENDOR_MEMBER || type === APP_CONSTANTS.USER_TYPE.SUB_VENDOR) {
            fcmWeb.send(message, function (err, result) {
                if (err) {
                    console.log("Something has gone wrong! Vendor Web", err);
                    resolve(null);
                } else {
                    console.log("Successfully sent with response Vendor Web: ", result);
                    resolve(null, result);
                }
            });
        } else if (type === APP_CONSTANTS.USER_TYPE.USER) {
            if (deviceType === APP_CONSTANTS.DEVICE_TYPE_ENUM.WEB) {
                fcmWeb.send(message, function (err, result) {
                    if (err) {
                        console.log("Something has gone wrong! User Web", err);
                        resolve(null);
                    } else {
                        console.log("Successfully sent with response  User Web: ", result);
                        resolve(null, result);
                    }
                });
            } else {
                fcmUserMobile.send(message, function (err, result) {
                    if (err) {
                        console.log("Something has gone wrong! User Mobile", err);
                        resolve(null);
                    } else {
                        console.log("Successfully sent with response  User Mobile: ", result);
                        resolve(null, result);
                    }
                });
            }

        }
    })
};


let sendNotifications = async (notificationData, saveNotification) => {
    if (saveNotification) {
        await Dao.saveData(Models.notifications, notificationData.savePushData);
    }
    await sendPush(notificationData.deviceToken, notificationData.sendPushData, notificationData.type, notificationData.deviceType);
    return {}
};


module.exports = {
    sendPush: sendPush,
    sendNotifications: sendNotifications
}
