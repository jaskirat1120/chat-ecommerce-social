'use strict';

// npm modules
const joi = require('joi');
const md5 = require('md5');
const handlebars = require('handlebars');
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const crypto = require("crypto");
const cryptoJS = require("crypto-js");
const randomString = require("randomstring");

// constructor
const Boom = require('boom');

// local modules
const Logger = require('../lib/log-manager').logger;

// constants imported
const CONSTANTS = require('../config/constants');
const RESPONSE_MESSAGES = CONSTANTS.responseMessages;
const APP_CONSTANTS = CONSTANTS.appDefaults;


const failActionFunction = function (request, reply, error) {
    try {
        console.log("mmmmmmmmmm", request.payload);
        console.log("mmmmmmmmmm--------_>>>>>>>>>>.", request.query);
        console.log("mmmmmmmmmm=======", error.output.payload.type);

        error.output.payload.type = "Joi Error";

        if (error.isBoom) {
            delete error.output.payload.validation;
            if (error.output.payload.message.indexOf("authorization") !== -1) {
                error.output.statusCode = RESPONSE_MESSAGES.STATUS_MSG.ERROR.UNAUTHORIZED.statusCode;
                return error;
            }
            let details = error.details[0];
            if (details.message.indexOf("pattern") > -1 && details.message.indexOf("required") > -1 && details.message.indexOf("fails") > -1) {
                error.output.payload.message = "Invalid " + details.path;
                return error;
            }
        }

        let customErrorMessage = '';
        if (error.output.payload.message.indexOf("[") > -1) {
            customErrorMessage = error.output.payload.message.substr(error.output.payload.message.indexOf("["));
        } else {
            customErrorMessage = error.output.payload.message;
        }
        customErrorMessage = customErrorMessage.replace(/"/g, '');
        customErrorMessage = customErrorMessage.replace('[', '');
        customErrorMessage = customErrorMessage.replace(']', '');
        customErrorMessage = customErrorMessage.replace(customErrorMessage.charAt(0), customErrorMessage.charAt(0).toUpperCase());
        error.output.payload.message = customErrorMessage;
        delete error.output.payload.validation;
        return error;
    } catch (err) {
        Logger.error(err);
    }
};


const customQueryDataValidations = function (type, key, data, callback) {
    let schema = {};
    switch (type) {
        case 'PHONE_NO':
            schema[key] = joi.string().regex(/^[0-9]+$/).length(10);
            break;
        case 'NAME':
            schema[key] = joi.string().regex(/^[a-zA-Z ]+$/).min(2);
            break;
        case 'BOOLEAN':
            schema[key] = joi.boolean();
            break;
    }
    let value = {};
    value[key] = data;

    schema.validate(value, schema, callback);
};


const authorizationHeaderObj = joi.object({
    authorization: joi.string().required().description('Send access Token adding "bearer " in front like "bearer accessToken"'),
    language: joi.string().default(APP_CONSTANTS.DATABASE.LANGUAGES.EN).valid([APP_CONSTANTS.DATABASE.LANGUAGES.AR,
        APP_CONSTANTS.DATABASE.LANGUAGES.EN]).description("EN for English, AR for Arabic")
}).unknown();

const authorizationHeaderObjOptional = joi.object({
    authorization: joi.string().optional().description('Send access Token adding "bearer " in front like "bearer accessToken"'),
    language: joi.string().default(APP_CONSTANTS.DATABASE.LANGUAGES.EN).valid([APP_CONSTANTS.DATABASE.LANGUAGES.AR,
        APP_CONSTANTS.DATABASE.LANGUAGES.EN]).description("EN for English, AR for Arabic")
}).unknown();

const languageHeaderObj = joi.object({
    language: joi.string().default(APP_CONSTANTS.DATABASE.LANGUAGES.EN).valid([APP_CONSTANTS.DATABASE.LANGUAGES.AR,
        APP_CONSTANTS.DATABASE.LANGUAGES.EN]).description("EN for English, AR for Arabic"),
    deviceType: joi.string().valid([])
}).unknown();

const CryptData = function (stringToCrypt) {
    return md5(md5(stringToCrypt));
};


const encryptDecrypt = async (text, type ,algo) => {
    let algorithm = algo?algo:'aes256'; // or any other algorithm supported by OpenSSL
    let key = process.env.KEY;
    console.log("algorithm", algorithm)
    console.log(text, type);
    if (type.toString() === 'encrypt') {
        let cipher = crypto.createCipher(algorithm, key);
        let encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
        return encrypted;
    } else if (type.toString() === 'decrypt') {
        let decipher = crypto.createDecipher(algorithm, key);
        let dec = decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
        // let dec = decipher.update(text, 'hex', 'utf8');
        console.log("dececececece",dec)
        return dec;
    }
};

const encryptDecryptJs = async (text, type ,algo) => {
    let algorithm = algo?algo:'aes256'; // or any other algorithm supported by OpenSSL
    let key = process.env.KEY;
    console.log("algorithm", algorithm)
    console.log(text, type);
    if (type.toString() === 'encrypt') {
        return await  cryptoEncryptWeb(text, key)
    } else if (type.toString() === 'decrypt') {
        return await cryptoDecryptWeb(text, key)
    }
};

let cryptoEncryptWeb = async function (data,key) {
    //Encrypt

    let data1=JSON.stringify(data)
    let ciphertext = cryptoJS.AES.encrypt(data1, key);
    return ciphertext.toString()


};
let cryptoDecryptWeb = async function (data,key) {
    // Decrypt
    let bytes  = cryptoJS.AES.decrypt(data, key);
    let plaintext = bytes.toString(cryptoJS.enc.Utf8);
    console.log('JSON.parse(plaintext)',JSON.parse(plaintext))
    return plaintext;
};

const hashPassword = function (plainTextPassword) {

    return md5(md5(plainTextPassword));

    //bcrypt.hash(plainTextPassword,saltRounds,function(err,hash){
    //  callback(err,hash);
};

const compareHashPassword = function (plainTextPassword, hash) {

    return md5(md5(plainTextPassword)) === hash;

    /*bcrypt.compare(plainTextPassword,hash,function(err,res){
       callback(err,res);
    })*/
};

const getFileNameWithUserId = function (thumbFlag, fullFileName, type, uploadType) {
    let prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.ORIGINAL;
    if (type === CONSTANTS.appDefaults.DATABASE.FILE_TYPES.VIDEO) {
        prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.VIDEO;
    }
    if (type === CONSTANTS.appDefaults.DATABASE.FILE_TYPES.DOCUMENT) {
        prefix = CONSTANTS.appDefaults.DATABASE.DOCUMENT_PREFIX;
    }

    if (uploadType === CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.GALLERY) {
        prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.ORIGINAL;
    }
    if (uploadType === CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.PACKAGE) {
        prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.PACKAGE;
    }
    if (uploadType === CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.BACKGROUND) {
        prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.BACKGROUND;
    }
    if (uploadType === CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.LOGO) {
        prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.LOGO;
    }
    if (uploadType === CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.FILTER) {
        prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.FILTER;
    }
    if (uploadType === CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.LENSE) {
        prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.LENSE;
    }
    if (uploadType === CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.PROFILE) {
        prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.PROFILE;
    }
    if (uploadType === CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.CHAT) {
        prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.PROFILE;
    }
    let id = new Date().getTime() + Math.floor(Math.random() * 2920) + 1;
    let ext = fullFileName && fullFileName.length > 0 && fullFileName.substr(fullFileName.lastIndexOf('.') || 0);
    if (thumbFlag) {
        prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.THUMB;
    }
    console.log(prefix, 'prefix');
    return prefix + id + ext;
};

const getFileNameWithUserIdWithCustomPrefix = function (thumbFlag, fullFileName, type, userId) {
    let prefix = '';
    if (type == CONSTANTS.appDefaults.DATABASE.FILE_TYPES.LOGO) {
        prefix = CONSTANTS.appDefaults.DATABASE.LOGO_PREFIX.ORIGINAL;
    } else if (type == CONSTANTS.appDefaults.DATABASE.FILE_TYPES.DOCUMENT) {
        prefix = CONSTANTS.appDefaults.DATABASE.DOCUMENT_PREFIX;
    }
    let ext = fullFileName && fullFileName.length > 0 && fullFileName.substr(fullFileName.lastIndexOf('.') || 0, fullFileName.length);
    if (thumbFlag && type == CONSTANTS.appDefaults.DATABASE.FILE_TYPES.LOGO) {
        prefix = CONSTANTS.appDefaults.DATABASE.LOGO_PREFIX.THUMB;
    }
    return prefix + userId + ext;
};

const generateFilenameWithExtension = function (oldFilename, newFilename) {
    let ext = oldFilename.substr(oldFilename.lastIndexOf(".") + 1);
    return newFilename + new Date().getTime() + Math.floor(Math.random() * 2920) + 1 + '.' + ext;
};

const updateNotificationMsgText = function (msg, data) {
    msg = handlebars.compile(msg);
    return msg(data);
};

const updateNotificationMsgObject = function (msgObj, data) {
    let msg = handlebars.compile(msgObj.customMessage);
    msgObj.customMessage = msg(data);
    return msgObj;
};

const checkObjectId = function (ids) {
    const ObjectId = mongoose.Types.ObjectId;
    if (ids && ids.$in && typeof ids.$in == 'object' && ids.$in.length) {
        let length = ids.$in.length;
        for (let i = 0; i < length; i++) {
            if (!ObjectId.isValid(ids.$in[i])) {
                return false;
            }
        }
        return true;
    } else {
        return ObjectId.isValid(ids);
    }
};

/*
* @function - deleteExtraObjKeys - This method will remove extra keys from object
*
* @params {Object} obj - This will be object on which delete keys operation will be performaed
* @params {String[]} - This will be array of keys to remove from the object
*
* @return {Object} - The new object with deleted keys
* */
const deleteObjKeys = async (obj, keysToRemove) => {
    if (typeof keysToRemove !== 'object' || !keysToRemove.length) {
        throw '"keysToRemove" parameter must be of type array.';
    }
    let newObj = Object.assign({}, obj);
    for (let i = 0; i < keysToRemove.length; i++) {
        delete newObj[keysToRemove[i]];
    }

    return newObj;
};

const completeString = async (string, charRequired) => {
    let length = parseInt(charRequired) - parseInt(string.length);
    let concatString = "";
    if (length > 0) {
        for (let i = 0; i < length; i++) {
            concatString += "0"
        }
        return concatString + string;
    } else {
        return string;
    }
}

function removeDiacriticCharacters(phrase) {
    const strAccents = phrase.split('');
    let strAccentsOut = [];
    let strAccentsLen = strAccents.length;
    let accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
    let accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
    for (let i = 0; i < strAccentsLen; i++) {
        if (accents.indexOf(strAccents[i]) != -1) {
            strAccentsOut[i] = accentsOut.substr(accents.indexOf(strAccents[i]), 1);
        } else {
            strAccentsOut[i] = strAccents[i];
        }
    }
    strAccentsOut = strAccentsOut.join('');
    return strAccentsOut;
}


const escapeRegex = (str) => {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

let bCryptData = async function (data) {             // bcryptjs encryption
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(data, salt).then(result => {
                resolve(result);
            });
        });
    });
};

let compareCryptData = function (data, hash) {       // bcryptjs matching
    return new Promise((resolve, reject) => {
        bcrypt.compare(data, hash).then(result => {
            resolve(result);
        }).catch(err => {
            reject(err);
        });
    });
};

const generateRandomString = function (length) {
    return randomString.generate(length);
};

const generateRandomOTP = function () {
    return randomString.generate({
        length: 6,
        charset: 'numeric'
    });
};

let mediaAuthRequired = Joi.object().keys({
    original: Joi.string().required(),
    thumbnail: Joi.string().required(),
    fileName: Joi.string(),
    type: Joi.string(),
    originalBase: Joi.string(),
    thumbnailMed: Joi.string(),
    _id: Joi.string().optional().allow('')
}).unknown().required();

let mediaAuth = Joi.object().keys({
    original: Joi.string().optional().allow(''),
    thumbnail: Joi.string().optional().allow(''),
    fileName: Joi.string().optional().allow(''),
    originalBase: Joi.string(),
    type: Joi.string().optional().allow(''),
    thumbnailMed: Joi.string().optional().allow(''),
    processed: Joi.string().optional().allow(''),
    _id: Joi.string().optional().allow('')
}).allow("");

let mediaAuthPdf = Joi.object().keys({
    original: Joi.string().optional().allow(''),
    type: Joi.string().optional().allow(''),
    originalBase: Joi.string(),
    fileName: Joi.string().optional().allow(''),
    _id: Joi.string().optional().allow(''),
    size: Joi.number().optional().allow(''),
    createdAt: Joi.date().optional()
});

let mediaSchema = {
    original: {type: String, default: ""},
    thumbnail: {type: String, default: ""},
    processed: {type: String, default: ""},
    thumbnailMed: {type: String, default: ""},
    fileName: {type: String, default: ""},
    type: {type: String, default: ""} // media format
};

let mediaSchemaPdf = {
    original: {type: String, default: ""},
    fileName: {type: String, default: ""},
    type: {type: String, default: ""} // media format
};


function renderMessageFromTemplateAndVariables(templateData, variablesData) {
    return handlebars.compile(templateData)(variablesData);
}

async function renderMessageAccordingToLanguage(object, dataToRender) {
    let objToReturn = {}
    for (let lang in APP_CONSTANTS.DATABASE.LANGUAGES) {
        if (object[APP_CONSTANTS.DATABASE.LANGUAGES[lang]]) {
            let msg = renderMessageFromTemplateAndVariables(object[APP_CONSTANTS.DATABASE.LANGUAGES[lang]], dataToRender);
            objToReturn[APP_CONSTANTS.DATABASE.LANGUAGES[lang]] = msg
        }
    }
    return objToReturn
}


module.exports = {
    CryptData: CryptData,
    failActionFunction: failActionFunction,
    getFileNameWithUserId: getFileNameWithUserId,
    getFileNameWithUserIdWithCustomPrefix: getFileNameWithUserIdWithCustomPrefix,
    customQueryDataValidations: customQueryDataValidations,
    hashPassword: hashPassword,
    compareHashPassword: compareHashPassword,
    updateNotificationMsgText: updateNotificationMsgText,
    updateNotificationMsgObject: updateNotificationMsgObject,
    authorizationHeaderObj: authorizationHeaderObj,
    authorizationHeaderObjOptional: authorizationHeaderObjOptional,
    generateFilenameWithExtension: generateFilenameWithExtension,
    checkObjectId: checkObjectId,
    removeDiacriticCharacters: removeDiacriticCharacters,
    deleteObjKeys: deleteObjKeys,
    escapeRegex: escapeRegex,
    bCryptData: bCryptData,
    compareCryptData: compareCryptData,
    mediaAuthRequired: mediaAuthRequired,
    mediaAuth: mediaAuth,
    mediaAuthPdf: mediaAuthPdf,
    mediaSchema: mediaSchema,
    mediaSchemaPdf: mediaSchemaPdf,
    generateRandomString: generateRandomString,
    languageHeaderObj: languageHeaderObj,
    encryptDecrypt: encryptDecrypt,
    generateRandomOTP: generateRandomOTP,
    renderMessageFromTemplateAndVariables: renderMessageFromTemplateAndVariables,
    renderMessageAccordingToLanguage: renderMessageAccordingToLanguage,
    completeString: completeString,
    encryptDecryptJs: encryptDecryptJs
};
