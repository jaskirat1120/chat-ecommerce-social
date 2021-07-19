// constants imported
const RESPONSE_MESSAGES = require('../../config/constants').responseMessages;
const APP_CONSTANTS = require('../../config').constants.appDefaults;

const uploadManager = require('../../lib/upload-manager');
const EmailHandler = require('../email-helpers/emailHandler');
const UniversalFunctions = require('../../utils/universal-functions');
// const postcode = require('postcode-validator');
const accessKeyId = process.env.BUCKET_ACCESS_KEY_ID,
    secretAccessKeyId = process.env.BUCKET_SECRET_ACCESS_KEY,
    bucketName = process.env.BUCKET_NAME;
let AWS = require('aws-sdk');
let moment = require('moment');
AWS.config.update({accessKeyId: accessKeyId, secretAccessKey: secretAccessKeyId});
let s3bucket = new AWS.S3();


let fileUpload = async (file, folder, userId = new Date().getTime().toString()) => {

    console.log("filefilefilefilefilefilefile", file);

    let fileExtension = file.hapi.filename.substring(file.hapi.filename.lastIndexOf('.') + 1, file.hapi.filename.length).toLowerCase(),
        fileName = (file.hapi.filename.split(".")[0])
                .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')
                .replace(/\s/g, '') +
            new Date().getTime() +
            userId +
            "." + fileExtension,
        filePrefix = 'others',
        isImage = false,
        isVideo = false,
        fileBuffer = file._data,
        mimeType = file.hapi.headers['content-type'];


    switch (fileExtension) {                                   //choose folder on aws to be uploaded
        case 'jpg':
            filePrefix = 'IMG';
            isImage = true;
            break;
        case 'png':
            filePrefix = 'IMG';
            isImage = true;
            break;
        case 'jpeg':
            filePrefix = 'IMG';
            isImage = true;
            break;
        case 'bmp':
            filePrefix = 'IMG';
            isImage = true;
            break;
        case 'svg':
            filePrefix = 'IMG';
            isImage = true;
            break;
        case 'gif':
        case 'txt':
        case 'doc':
        case 'docx':
        case 'xlt':
        case 'xls':
        case 'ppt':
        case 'pptx':
        case 'csv':
        case 'json':
        case 'pdf':
        case 'mp3':
            filePrefix = 'AUD';
            break;
        case 'ogg':
            filePrefix = 'AUD';
            break;
        case 'wav':
            filePrefix = 'AUD';
            break;
        case 'mp4':
            filePrefix = 'VID';
            isVideo = true;
            break;
        default:
            filePrefix = 'others';
            break;
    }

    let videoThumbName = `${+new Date()}`;


    let originalPicFolder = APP_CONSTANTS.BUCKET.FOLDER.imageOriginal,
        thumbnailPicFolder = APP_CONSTANTS.BUCKET.FOLDER.imageThumb,
        processedPicFolder = APP_CONSTANTS.BUCKET.FOLDER.imageProcessed,
        thumbnailMedPicFolder = APP_CONSTANTS.BUCKET.FOLDER.imageThumbnailMed,
        videoOriginalFolder = APP_CONSTANTS.BUCKET.FOLDER.videoOriginal,
        videoThumbnailFolder = APP_CONSTANTS.BUCKET.FOLDER.videoThumb,
        documentFolder = APP_CONSTANTS.BUCKET.FOLDER.documentOriginal,
        audioOriginalFolder = APP_CONSTANTS.BUCKET.FOLDER.audioOriginal;

    let urls = {
        original: process.env.BUCKET_S3_URL + '/' + originalPicFolder + "/" + fileName,
        processed: process.env.BUCKET_S3_URL + '/' + processedPicFolder + "/" + fileName,
        thumbnail: process.env.BUCKET_S3_URL + '/' + thumbnailPicFolder + "/" + fileName,
        thumbnailMed: process.env.BUCKET_S3_URL + '/' + thumbnailMedPicFolder + "/" + fileName,
        fileName: fileName
    };

    if (mimeType.split("/")[0] !== "image") {
        if (mimeType.split("/")[0] === "video") {
            urls = {
                // original:videoOriginalFolder,
                original: process.env.BUCKET_S3_URL + '/' + videoOriginalFolder + "/" + fileName,
                thumbnail: process.env.BUCKET_S3_URL + '/' + videoThumbnailFolder + "/" + videoThumbName + ".jpg",
                // thumbnail:videoThumbnailFolder,
                fileName: fileName
            };
        } else if (mimeType.split("/")[1] === "pdf" || mimeType.split("/")[1] === "doc" || mimeType.split("/")[1] === "docx" || mimeType.split("/")[1] === "xls" || mimeType.split("/")[1] === "csv") {
            urls = {
                original: process.env.BUCKET_S3_URL + '/' + documentFolder + "/" + fileName,
                fileName: fileName
            };
        } else {
            urls = {
                original: process.env.BUCKET_S3_URL + '/' + audioOriginalFolder + "/" + fileName,
                fileName: fileName
            };
        }
    }

    try {
        await uploadManager.uploadFile(fileBuffer, originalPicFolder, thumbnailPicFolder,
            processedPicFolder, thumbnailMedPicFolder, fileName,
            mimeType, fileExtension, videoOriginalFolder,
            videoThumbnailFolder, audioOriginalFolder, documentFolder, videoThumbName);
        console.log("1111111111111111111111111");
        return urls;
    } catch (err) {
        console.log(err);
        return err;
    }
};


const forgotPassword = async (payload, model) => {
    try {

        let query = {
            $or: [{"email": payload.email}],
            userType: payload.userType,
            "status": APP_CONSTANTS.STATUS_ENUM.ACTIVE
        };
        //
        // if(payload.userType === APP_CONSTANTS.USER_TYPE.DRIVER || payload.userType === APP_CONSTANTS.USER_TYPE.STORE_MANAGER){
        //     query.isVerified = true
        // }

        let projection = {
            "_id": 0,
            "email": 1,
            "name": 1,
            "firstName": 1,
            "lastName": 1,
            "status": 1,
            "isVerified": 1
        };

        let options = {lean: true};
        let updateOptions = {new: true};

        let findCustomer = await Dao.findOne(model, query, projection, options);
        if (findCustomer === null) {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_EMAIL_FORGOT;
        }

        // if(payload.userType === APP_CONSTANTS.USER_TYPE.DRIVER || payload.userType === APP_CONSTANTS.USER_TYPE.STORE_MANAGER) {
        //     if (!findCustomer.isVerified) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.ADMIN_VERIFIED;
        // }

        let passwordResetToken = await UniversalFunctions.encryptDecrypt(new Date().getTime() + findCustomer.fullName + ' ' + findCustomer.email, 'encrypt').toString();
        let updateData = {
            "passwordResetToken": passwordResetToken
        };
        let updateResetToken = await Dao.findAndUpdate(model, query, updateData, updateOptions);
        if (updateResetToken) {
            //             let veritificatyionLink = process.env.reset_password_link + "/resetPassword?reset_token=" + passwordResetToken + "&email=" + payload.email+"&type=driver";
            //             let subject = "Reset Password Driver Request";
            //             let content = `Hello ${findCustomer.name} <br/><br/>
            // <p>On your request we have created a reset password link. Please click the below link and follow the instructions to reset your password :</p>
            // <a href="${ veritificatyionLink}">Click here to reset your password</a> <br/><br/>
            //  Thank You <br>
            // Duabiie Team <br>`;
            //             let emailData = {
            //                 to: payload.email,
            //                 subject: subject,
            //                 body: content
            //             };
            //             let sendMail = commonController.sendEmailWithErrorHandle(emailData);
            //
            //             if(sendMail){
            //                 return{
            //                     Status:`A password reset link has been sent to ${payload.emailOrPhoneNo}`
            //                 }
            //             }
            //             else{
            //                 throw ERROR.EMAIL_NOT_SENT
            //             }

            return {};

        }

    } catch (err) {
        throw err;
    }

};
const changePassword = async (payload, userData, model) => {
    try {

        let query = {
            _id: userData._id
        };

        let projection = {
            "_id": 0,
            "email": 1,
            "name": 1,
            firstName: 1,
            lastName: 1,
            "password": 1,
            "status": 1,
            "isVerified": 1
        };

        let options = {lean: true};
        let updateOptions = {new: true};

        let findCustomer = await Dao.findOne(model, query, projection, options);
        if (findCustomer === null) {
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID;
        }

        if (findCustomer.password && !(await UniversalFunctions.compareCryptData(payload.oldPassword, findCustomer.password))) {
            throw  RESPONSE_MESSAGES.STATUS_MSG.ERROR.OLD_PASSWORD;
        }

        if (payload.newPassword === payload.oldPassword) {
            throw  RESPONSE_MESSAGES.STATUS_MSG.ERROR.SAME_PASSWORD;
        }

        let updateData = {
            "password": await UniversalFunctions.bCryptData(payload.newPassword)
        };

        let updatePassword = await Dao.findAndUpdate(model, query, updateData, updateOptions);
        return {};
    } catch (err) {
        throw err;
    }

};


const validateZipcode = async (payloadData) => {
    try {
        if (payloadData.postalCode) {
            if (postcode.validate(payloadData.postalCode.toString(), payloadData.ISO)) {
                query.postalCode = payloadData.postalCode;
                query.ISO = payloadData.ISO;
            } else throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_POSTAL
        }
    } catch (e) {
        throw e
    }
};


const storeVisitorData = async (payload, userData) => {
    try {
        let dataToSave = {
            ...(payload.vendor && {vendor: payload.vendor}),
            ...(payload.category && {category: payload.category}),
            ...(userData && {user: userData._id}),
            type: APP_CONSTANTS.COMMON_LOGS.VENDOR_VISIT,
            visitor: 1,
            date: moment().format('LL'),
        };
        return await Dao.saveData(Models.commonLogs, dataToSave)
    } catch (e) {
        throw e
    }
};


const updateDeviceToken = async (payload, userData) => {
    try {
        let otherCriteria = {_id: {$ne: userData._id}, userType: userData.userType, deviceToken: payload.deviceToken};
        let criteria = {_id: userData._id};
        let otherDataToUpdate = {deviceToken: ""};
        let dataToUpdate = {deviceToken: payload.deviceToken, ...(payload.deviceType && {deviceType: payload.deviceType})};

        if (userData.userType === APP_CONSTANTS.USER_TYPE.USER) {
            await Dao.findAndUpdate(Models.user, criteria, dataToUpdate, {});
            // Update Other Device Token
            await Dao.updateMany(Models.user, otherCriteria, otherDataToUpdate, {multi: true});
        } else if (userData.userType === APP_CONSTANTS.USER_TYPE.VENDOR_OWNER || userData.userType === APP_CONSTANTS.USER_TYPE.VENDOR_MEMBER || userData.userType === APP_CONSTANTS.USER_TYPE.SUB_VENDOR) {
            await Dao.findAndUpdate(Models.vendors, criteria, dataToUpdate, {});
            // Update Other Device Token
            await Dao.updateMany(Models.vendors, otherCriteria, otherDataToUpdate, {multi: true});
        } else if (userData.userType === APP_CONSTANTS.USER_TYPE.ADMIN) {
            await Dao.findAndUpdate(Models.admin, criteria, dataToUpdate, {});
            // Update Other Device Token
            await Dao.updateMany(Models.admin, otherCriteria, otherDataToUpdate, {multi: true});
        }
    } catch (e) {
        throw e;
    }
};

const invoicePdf = async (payload, userData, currency, conversion)=>{
    try{
        let orderData = await Dao.populateData(Models.orders, {
            _id: payload._id
        }, {}, {new: true}, [{
            path: 'user',
            select: 'firstName lastName email deviceToken deviceType language phoneNumber',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.USER
        }, {
            path: 'products.product',
            select: 'title images weight unit description images',
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
        }, {
            path: 'vendor',
            select: 'vendorRegisterName',
            model: APP_CONSTANTS.DATABASE.MODELS_NAME.VENDORS
        }]);
        if(orderData[0]){
            orderData = orderData[0]
            let transactions = await Dao.findOne(Models.transactions, {order: payload._id}, {}, {multi: true});

            let orderStatus;

            let subTotal = transactions.productPrice * transactions.quantity;
            let tax = transactions.productTotalTax;
            let promoAmount = orderData.products.promoCharges;
            let shippingCharges = orderData.products.shippingChargesAfterDiscount * orderData.products.quantity;
            let finalTotal = subTotal + tax + shippingCharges - promoAmount;
            let paymentMethods = 'Online';
            if(orderData.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.CASH_ON_DELIVERY){
                paymentMethods = 'Cash';
            }
            if(orderData.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.WALLET){
                paymentMethods = 'Wallet';
            }
            let conversions = orderData.conversion?orderData.conversion:1;
            let currencies = orderData.currencySelected?orderData.currencySelected:orderData.products.currency;
            if(currency){
                currencies = currency
            }if(conversion){
                conversions = conversion
            }
            let emailData = {
                status: orderStatus,
                productImage: orderData.products.product.images[0].original,
                websiteUrl: process.env.websiteUrl,
                logoUrl: process.env.logoUrl,
                orderNumber: orderData.orderNumber,
                subOrderNumber: orderData.subOrderNumber,
                createdDate: moment(orderData.createdDate).format('LL'),
                vendorRegisterName: orderData.vendor.vendorRegisterName,
                productName: orderData.products.product.title.en,
                productDescription: orderData.products.product.description.en,
                conversion: conversions,
                currency: currencies,
                productPrice: `${orderData.products.price}`,
                productPriceConverted: `${parseFloat(orderData.products.price * orderData.conversion).toFixed(2)}`,
                subTotal: subTotal,
                paymentMethod: paymentMethods,
                quantity:`${orderData.products.quantity}`,
                promoAmount: promoAmount,
                subTotalBeforeTax: `${subTotal + shippingCharges}`,
                subTotalWithTax: `${subTotal + shippingCharges + tax}`,
                shippingCharges: shippingCharges,
                invoiceNumber: orderData.invoiceNumber,
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
            };

            // emailData.productPrice = parseFloat(emailData.productPrice).toFixed(2)
            emailData.totalProductPrice = parseFloat((emailData.productPriceConverted) * (emailData.quantity)).toFixed(2)
            emailData.subTotal = parseFloat((emailData.subTotal) * (emailData.conversion)).toFixed(2)
            emailData.finalTotal = parseFloat((emailData.finalTotal) * (emailData.conversion)).toFixed(2)
            emailData.promoAmount = parseFloat((emailData.promoAmount) * (emailData.conversion)).toFixed(2)
            emailData.tax = parseFloat((emailData.tax) * (emailData.conversion)).toFixed(2)
            emailData.subTotalBeforeTax = parseFloat((emailData.subTotalBeforeTax) * (emailData.conversion)).toFixed(2)
            emailData.subTotalWithTax = parseFloat((emailData.subTotalWithTax) * (emailData.conversion)).toFixed(2)
            emailData.shippingCharges = parseFloat((emailData.shippingCharges) * (emailData.conversion)).toFixed(2)

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

            let buffer = await EmailHandler.createInvoicePdf(emailData)
            let name = emailData.invoiceNumber;
            return {buffer, name}
        }
        else{
            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID
        }
    }catch(e){
        throw e;
    }
}



module.exports = {
    fileUpload: fileUpload,
    forgotPassword: forgotPassword,
    changePassword: changePassword,
    validateZipcode: validateZipcode,
    storeVisitorData: storeVisitorData,
    updateDeviceToken: updateDeviceToken,
    invoicePdf: invoicePdf
};
