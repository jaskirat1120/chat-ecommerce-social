// constants imported
const APP_CONSTANTS = require('../../config').constants.appDefaults;
const STRING_CONSTANTS = require('../../config').constants.appContants;

// local modules
const EmailManager = require('../../lib/email-manager');

let backgroundColor=APP_CONSTANTS.APP.BACKGROUND;
const handlebars = require('handlebars');
const htmlToPdf = require('html-pdf');
const moment = require('moment');
const UniversalFunctions = require('../../utils/universal-functions');
const Path = require('path');
const fs = require('fs');
// const logoUrl = process.env.logoUrl;
// const emailLogoUrl =  process.env.emailLogoUrl;
// const facebookLogoUrl =  process.env.facebookLogoUrl;
// const twitterlogoUrl = process.env.twitterlogoUrl;
// const linkedInLogoUrl =  process.env.linkedInLogoUrl;
// const pInterestLogoUrl =  process.env.pInterestLogoUrl;
// const playStoreLogoUrl =  process.env.playStoreLogoUrl;

const logoUrl = ``,
emailLogoUrl = ``,
facebookLogoUrl = ``,
twitterlogoUrl = ``,
linkedInLogoUrl = ``,
pInterestLogoUrl = ``,
playStoreLogoUrl = ``


let sendEmailForgotPassword = async (payload, link, otp) => {
    let email = payload.email;
    let userName = payload.name;
    let websiteUrl = process.env.websiteUrl;
    let resetPasswordString=STRING_CONSTANTS.EMAIL_CONTENT.RESET_PASSWORD.en;
    let thankYouMessage=STRING_CONSTANTS.EMAIL_CONTENT.THANK_YOU.en;
    let url=link;
    let content = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><meta content="width=device-width, minimal-ui, initial-scale=1.0, maximum-scale=1.0, user-scalable=0;" name="viewport" /><meta content="telephone=no" name="format-detection" /><title>My Vendor</title><style type="text/css">@font-face{font-family:'Circular Std Book';src:url('../fonts/CircularStd-Book.eot');src:url('../fonts/CircularStd-Book.eot?#iefix') format('embedded-opentype'), url('../fonts/CircularStd-Book.woff2') format('woff2'), url('../fonts/CircularStd-Book.woff') format('woff'), url('../fonts/CircularStd-Book.svg#CircularStd-Book') format('svg');font-weight:500;font-style:normal}</style></head><body style="-webkit-font-smoothing: antialiased !important; -webkit-text-size-adjust: none !important; width: 100% !important; height: 100% !important; font-family:'Arial',Helvetica,sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; margin: 0; padding: 0;"><table align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #f1f1f1;" bgcolor="#f1f1f1"><table class="deviceWidth" align="center" width="600" style="width: 600px; min-width: 600px;" border="0" cellspacing="0" cellpadding="0"><tr><td valign="top" style="vertical-align:top;border-collapse: collapse;"><table class="mktoModule" id="logo-module" mktoName="Logo Module" align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #ffffff;" bgcolor="#ffffff"><table class="deviceWidth1" width="530" style="margin: 0 auto;width: 530px;" align="center" border="0" cellspacing="0" cellpadding="0"><tr><td style="font-size: 1px; line-height: 1px;" height="25">&nbsp;</td></tr><tr><td><table border="0" cellspacing="0" cellpadding="0" style="margin: auto;"><tr><td valign="top" style="text-align: left;vertical-align: top;"> <a href={{websiteUrl}} style="text-decoration: none;" target="_blank"> <img height="48" border="0" src={{logoUrl}} alt="" /> </a></td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px; border-bottom: 1px solid rgba(29, 35, 46, 0.44);" height="25">&nbsp;</td></tr></table></td></tr></table><table align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #ffffff;" bgcolor="#ffffff"><table class="deviceWidth1" width="530" style="margin: 0 auto;width: 530px;" align="center" border="0" cellspacing="0" cellpadding="0"><tr><td style="font-size: 1px; line-height: 1px;" height="30">&nbsp;</td></tr><tr><td><table border="0" cellspacing="0" cellpadding="0"><tr><td valign="top" style="text-align: left;vertical-align: top; color: #1D232E; font-family: 'Circular Std Book';font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 22px;"> ${resetPasswordString} <strong>${email}</td></tr><tr><td valign="top" style="text-align: left;vertical-align: top; color: #1D232E; font-family: 'Circular Std Book';font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 22px;"> <strong>${otp}</td></tr><tr><td valign="top" style="text-align: left;vertical-align: top;color: rgba(29, 35, 46, 0.66); font-family: 'Circular Std Book'; font-size: 14px; font-weight: 300; letter-spacing: 0; line-height: 20px;"> ${thankYouMessage}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="10">&nbsp;</td></tr></table></td></tr></table></td></tr></table></td></tr></table></body></html>`;
    await EmailManager.sendEmail(email, 'Reset Password', content);
    return {}
};


let sendEmailLoginOTP = async (payload, otp) => {
    let email = payload.email;
    let websiteUrl = process.env.websiteUrl;
    let resetPasswordString=STRING_CONSTANTS.EMAIL_CONTENT.OTP_EMAIL_MESSAGE.en;
    let thankYouMessage=STRING_CONSTANTS.EMAIL_CONTENT.THANK_YOU.en;
    let content = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><meta content="width=device-width, minimal-ui, initial-scale=1.0, maximum-scale=1.0, user-scalable=0;" name="viewport" /><meta content="telephone=no" name="format-detection" /><title>My Vendor</title><style type="text/css">@font-face{font-family:'Circular Std Book';src:url('../fonts/CircularStd-Book.eot');src:url('../fonts/CircularStd-Book.eot?#iefix') format('embedded-opentype'), url('../fonts/CircularStd-Book.woff2') format('woff2'), url('../fonts/CircularStd-Book.woff') format('woff'), url('../fonts/CircularStd-Book.svg#CircularStd-Book') format('svg');font-weight:500;font-style:normal}</style></head><body style="-webkit-font-smoothing: antialiased !important; -webkit-text-size-adjust: none !important; width: 100% !important; height: 100% !important; font-family:'Arial',Helvetica,sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; margin: 0; padding: 0;"><table align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #f1f1f1;" bgcolor="#f1f1f1"><table class="deviceWidth" align="center" width="600" style="width: 600px; min-width: 600px;" border="0" cellspacing="0" cellpadding="0"><tr><td valign="top" style="vertical-align:top;border-collapse: collapse;"><table class="mktoModule" id="logo-module" mktoName="Logo Module" align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #ffffff;" bgcolor="#ffffff"><table class="deviceWidth1" width="530" style="margin: 0 auto;width: 530px;" align="center" border="0" cellspacing="0" cellpadding="0"><tr><td style="font-size: 1px; line-height: 1px;" height="25">&nbsp;</td></tr><tr><td><table border="0" cellspacing="0" cellpadding="0" style="margin: auto;"><tr><td valign="top" style="text-align: left;vertical-align: top;"> <a href={{websiteUrl}} style="text-decoration: none;" target="_blank"> <img height="48" border="0" src=${logoUrl} alt="" /> </a></td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px; border-bottom: 1px solid rgba(29, 35, 46, 0.44);" height="25">&nbsp;</td></tr></table></td></tr></table><table align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #ffffff;" bgcolor="#ffffff"><table class="deviceWidth1" width="530" style="margin: 0 auto;width: 530px;" align="center" border="0" cellspacing="0" cellpadding="0"><tr><td style="font-size: 1px; line-height: 1px;" height="30">&nbsp;</td></tr><tr><td><table border="0" cellspacing="0" cellpadding="0"><tr><td valign="top" style="text-align: left;vertical-align: top; color: #1D232E; font-family: 'Circular Std Book';font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 22px;"> ${resetPasswordString} <strong>${email}</td></tr><tr><td valign="top" style="text-align: left;vertical-align: top; color: #1D232E; font-family: 'Circular Std Book';font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 22px;"> <strong>${otp}</td></tr><tr><td valign="top" style="text-align: left;vertical-align: top;color: rgba(29, 35, 46, 0.66); font-family: 'Circular Std Book'; font-size: 14px; font-weight: 300; letter-spacing: 0; line-height: 20px;"> ${thankYouMessage}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="10">&nbsp;</td></tr></table></td></tr></table></td></tr></table></td></tr></table></body></html>`;
    await EmailManager.sendEmail(email, 'MyVendors OTP', content);
    return {}
};

let sendEmailSignUp = async (payload, type) => {
    let email = payload.email;
    let signUpString1=STRING_CONSTANTS.EMAIL_CONTENT.VENDOR_SIGN_UP_1.en;
    let signUpString2=STRING_CONSTANTS.EMAIL_CONTENT.VENDOR_SIGN_UP_2.en;
    let signUpString3=STRING_CONSTANTS.EMAIL_CONTENT.VENDOR_SIGN_UP_3.en;
    let signUpString4=STRING_CONSTANTS.EMAIL_CONTENT.VENDOR_SIGN_UP_4.en;
    let subject="Vendor Registration";
    let content = await  fs.readFileSync(Path.resolve('./views/signupVendorTemplates.html'), 'utf8');
    if(type === APP_CONSTANTS.USER_TYPE.USER){
        signUpString1=STRING_CONSTANTS.EMAIL_CONTENT.USER_SIGN_UP_1.en;
        signUpString2=STRING_CONSTANTS.EMAIL_CONTENT.USER_SIGN_UP_2.en;
        signUpString3=STRING_CONSTANTS.EMAIL_CONTENT.USER_SIGN_UP_3.en;
        signUpString4=STRING_CONSTANTS.EMAIL_CONTENT.USER_SIGN_UP_4.en;
        subject="User Registration";
        content = await  fs.readFileSync(Path.resolve('./views/signupUserTemplates.html'), 'utf8');
    }
    let thankYouString1=STRING_CONSTANTS.EMAIL_CONTENT.THANK_YOU_1.en;
    let thankYouString2=STRING_CONSTANTS.EMAIL_CONTENT.THANK_YOU_2.en;
    let experienceString=STRING_CONSTANTS.EMAIL_CONTENT.SIGNUP_EXPERIENCE_TEXT.en;
    let obj = {
        signUpString1: signUpString1,
        signUpString2: signUpString2,
        signUpString3: signUpString3,
        signUpString4: signUpString4,
        thankYouString1: thankYouString1,
        thankYouString2: thankYouString2,
        experienceString: experienceString
    };
    obj.logoUrl = logoUrl;
    obj.websiteUrl = process.env.websiteUrl;
    obj.emailLogoUrl = emailLogoUrl;
    obj.facebookLogoUrl = facebookLogoUrl;
    obj.twitterlogoUrl = twitterlogoUrl;
    obj.linkedInLogoUrl = linkedInLogoUrl;
    obj.pInterestLogoUrl = pInterestLogoUrl;
    obj.playStoreLogoUrl = playStoreLogoUrl;
    obj.encryptedEmail = await UniversalFunctions.encryptDecrypt(email, 'encrypt');
    obj.unSubscribeUrl = `${process.env.LIVE_API_URL}/user/v1/unSubscribeNewsLetter?email=${obj.encryptedEmail}`;
    let appDefaults = await Dao.findOne(Models.appDefaults, {}, {
        facebookUrl: 1,
        twitterUrl: 1,
        pInterestUrl: 1,
        linkedInUrl: 1
    }, {})
    obj.facebookUrl = appDefaults.facebookUrl?appDefaults.facebookUrl:"#";
    obj.twitterUrl = appDefaults.twitterUrl?appDefaults.twitterUrl:"#";
    obj.linkedInUrl = appDefaults.linkedInUrl?appDefaults.linkedInUrl:"#";
    obj.pInterestUrl = appDefaults.pInterestUrl?appDefaults.pInterestUrl:"#";
    let html = await UniversalFunctions.renderMessageFromTemplateAndVariables(content, obj);

    await EmailManager.sendEmail(email, subject, html);
    return {}
};


let newsLetterEmail = async (payload, type) => {
    let email = payload.email;
    let content = await  fs.readFileSync(Path.resolve('./views/newsLetter.html'), 'utf8');
    let thankYouString1=STRING_CONSTANTS.EMAIL_CONTENT.THANK_YOU_1.en;
    let thankYouString2=STRING_CONSTANTS.EMAIL_CONTENT.THANK_YOU_2.en;
    let obj = {
        signUpString1: payload.content,
        thankYouString1: thankYouString1,
        thankYouString2: thankYouString2,
        excitingString: ""
    };
    obj.logoUrl = logoUrl;
    obj.websiteUrl = process.env.websiteUrl;
    obj.emailLogoUrl = emailLogoUrl;
    obj.facebookLogoUrl = facebookLogoUrl;
    obj.twitterlogoUrl = twitterlogoUrl;
    obj.linkedInLogoUrl = linkedInLogoUrl;
    obj.pInterestLogoUrl = pInterestLogoUrl;
    obj.playStoreLogoUrl = playStoreLogoUrl;
    obj.encryptedEmail = await UniversalFunctions.encryptDecrypt(email, 'encrypt');
    obj.unSubscribeUrl = `${process.env.LIVE_API_URL}/user/v1/unSubscribeNewsLetter?email=${obj.encryptedEmail}`;
    let appDefaults = await Dao.findOne(Models.appDefaults, {}, {
        facebookUrl: 1,
        twitterUrl: 1,
        pInterestUrl: 1,
        linkedInUrl: 1
    }, {})
    obj.facebookUrl = appDefaults.facebookUrl?appDefaults.facebookUrl:"#";
    obj.twitterUrl = appDefaults.twitterUrl?appDefaults.twitterUrl:"#";
    obj.linkedInUrl = appDefaults.linkedInUrl?appDefaults.linkedInUrl:"#";
    obj.pInterestUrl = appDefaults.pInterestUrl?appDefaults.pInterestUrl:"#";
    let html = await UniversalFunctions.renderMessageFromTemplateAndVariables(content, obj);

    await EmailManager.sendEmail(email, payload.subject, html);
    return {}
};

let sendEmailGiftCard = async (payload, userData, shareWith, image) => {
    let email = shareWith.email;
    let websiteUrl = `<a href = ${process.env.websiteUrl}>MyVendors</a>`;
    let signUpString2= await UniversalFunctions.renderMessageFromTemplateAndVariables(STRING_CONSTANTS.EMAIL_CONTENT.SHARE_GIFT_INSTRUCTIONS_PART_2.en,{
        code: payload.code,
        websiteUrl: websiteUrl
    });
    let signUpString1=await UniversalFunctions.renderMessageFromTemplateAndVariables(STRING_CONSTANTS.EMAIL_CONTENT.USER_NAME.en,{
        firstName: userData.firstName,
        lastName: userData.lastName
    });
    let thankYouString2=STRING_CONSTANTS.EMAIL_CONTENT.THANK_YOU_2.en;
    let subject="Shared Gift";
    let content = await  fs.readFileSync(Path.resolve('./views/giftSharing.html'), 'utf8');
    let experienceString=STRING_CONSTANTS.EMAIL_CONTENT.EXPERIENCE_GIFT.en;
    let obj = {
        signUpString1: signUpString1,
        signUpString2: STRING_CONSTANTS.EMAIL_CONTENT.SHARE_GIFT_INSTRUCTIONS_EMAIL.en,
        splitPart2: signUpString2,
        excitingString: STRING_CONSTANTS.EMAIL_CONTENT.EXCITING_TEXT.en,
        experienceString: experienceString,
        thankYouString2: thankYouString2
    };
    obj.logoUrl = logoUrl;
    obj.emailLogoUrl = emailLogoUrl;
    obj.websiteUrl = process.env.websiteUrl;
    obj.facebookLogoUrl = facebookLogoUrl;
    obj.twitterlogoUrl = twitterlogoUrl;
    obj.linkedInLogoUrl = linkedInLogoUrl;
    obj.pInterestLogoUrl = pInterestLogoUrl;
    obj.playStoreLogoUrl = playStoreLogoUrl;
    let appDefaults = await Dao.findOne(Models.appDefaults, {}, {
        facebookUrl: 1,
        twitterUrl: 1,
        pInterestUrl: 1,
        linkedInUrl: 1
    }, {})
    obj.facebookUrl = appDefaults.facebookUrl?appDefaults.facebookUrl:"#";
    obj.twitterUrl = appDefaults.twitterUrl?appDefaults.twitterUrl:"#";
    obj.linkedInUrl = appDefaults.linkedInUrl?appDefaults.linkedInUrl:"#";
    obj.pInterestUrl = appDefaults.pInterestUrl?appDefaults.pInterestUrl:"#";
    obj.encryptedEmail = await UniversalFunctions.encryptDecrypt(email, 'encrypt');
    obj.unSubscribeUrl = `${process.env.LIVE_API_URL}/user/v1/unSubscribeNewsLetter?email=${obj.encryptedEmail}`;
    let html = await UniversalFunctions.renderMessageFromTemplateAndVariables(content, obj);
    let attachment = [{
        path: image,
        name: 'Discount Voucher.jpeg'
    }]
    await EmailManager.sendEmail(email, subject, html, attachment);
    return {}
};


let sendEmailOrderStatus = async (payload, email, orderNumber) =>{
    try{
        console.log(JSON.stringify(payload))
        payload.emailConfirmationText = UniversalFunctions.renderMessageFromTemplateAndVariables(STRING_CONSTANTS.EMAIL_CONTENT.ORDER_CONFIRMATION_TEXT.en, {
            date: payload.createdDate
        });
        payload.experienceText = STRING_CONSTANTS.EMAIL_CONTENT.ORDER_EXPERIENCE_TEXT.en;
        payload.logoUrl = logoUrl;
        payload.websiteUrl = process.env.websiteUrl;
        payload.emailLogoUrl = emailLogoUrl;
        payload.facebookLogoUrl = facebookLogoUrl;
        payload.twitterlogoUrl = twitterlogoUrl;
        payload.linkedInLogoUrl = linkedInLogoUrl;
        payload.pInterestLogoUrl = pInterestLogoUrl;
        payload.playStoreLogoUrl = playStoreLogoUrl;
        let appDefaults = await Dao.findOne(Models.appDefaults, {}, {
            facebookUrl: 1,
            twitterUrl: 1,
            pInterestUrl: 1,
            linkedInUrl: 1
        }, {})
        payload.facebookUrl = appDefaults.facebookUrl?appDefaults.facebookUrl:"#";
        payload.twitterUrl = appDefaults.twitterUrl?appDefaults.twitterUrl:"#";
        payload.linkedInUrl = appDefaults.linkedInUrl?appDefaults.linkedInUrl:"#";
        payload.pInterestUrl = appDefaults.pInterestUrl?appDefaults.pInterestUrl:"#";
        // let templateData = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><meta content="width=device-width, minimal-ui, initial-scale=1.0, maximum-scale=1.0, user-scalable=0;" name="viewport" /><meta content="telephone=no" name="format-detection" /><title>My Vendor</title><style type="text/css">@font-face{font-family:'Circular Std Book';src:url('../fonts/CircularStd-Book.eot');src:url('../fonts/CircularStd-Book.eot?#iefix') format('embedded-opentype'), url('../fonts/CircularStd-Book.woff2') format('woff2'), url('../fonts/CircularStd-Book.woff') format('woff'), url('../fonts/CircularStd-Book.svg#CircularStd-Book') format('svg');font-weight:500;font-style:normal}</style></head><body style="-webkit-font-smoothing: antialiased !important; -webkit-text-size-adjust: none !important; width: 100% !important; height: 100% !important; font-family:'Arial',Helvetica,sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; margin: 0; padding: 0;"><table align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #f1f1f1;" bgcolor="#f1f1f1"><table class="deviceWidth" align="center" width="600" style="width: 600px; min-width: 600px;" border="0" cellspacing="0" cellpadding="0"><tr><td valign="top" style="vertical-align:top;border-collapse: collapse;"><table class="mktoModule" id="logo-module" mktoName="Logo Module" align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #ffffff;" bgcolor="#ffffff"><table class="deviceWidth1" width="530" style="margin: 0 auto;width: 530px;" align="center" border="0" cellspacing="0" cellpadding="0"><tr><td style="font-size: 1px; line-height: 1px;" height="25">&nbsp;</td></tr><tr><td><table border="0" cellspacing="0" cellpadding="0" style="margin: auto;"><tr><td valign="top" style="text-align: left;vertical-align: top;"> <a href={{websiteUrl}} style="text-decoration: none;" target="_blank"> <img height="48" border="0" src={{logoUrl}} alt="" /> </a></td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px; border-bottom: 1px solid rgba(29, 35, 46, 0.44);" height="25">&nbsp;</td></tr></table></td></tr></table><table align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #ffffff;" bgcolor="#ffffff"><table class="deviceWidth1" width="530" style="margin: 0 auto;width: 530px;" align="center" border="0" cellspacing="0" cellpadding="0"><tr><td style="font-size: 1px; line-height: 1px;" height="30">&nbsp;</td></tr><tr><td><table border="0" cellspacing="0" cellpadding="0"><tr><td valign="top" style="text-align: left;vertical-align: top; color: #1D232E; font-family: 'Circular Std Book';font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 22px;"> Order ID: {{subOrderNumber}}</td></tr><tr><td valign="top" style="text-align: left;vertical-align: top;color: rgba(29, 35, 46, 0.66); font-family: 'Circular Std Book'; font-size: 14px; font-weight: 300; letter-spacing: 0; line-height: 20px;"> Placed on: {{createdDate}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="10">&nbsp;</td></tr></table></td></tr></table><table align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #ffffff;" bgcolor="#ffffff"><table class="deviceWidth1" width="530" style="margin: 0 auto; width: 530px;" align="center" border="0" cellspacing="0" cellpadding="0"><tr><td style="font-size: 1px; line-height: 1px;" height="10">&nbsp;</td></tr><tr><td style="height: 100px; width: 100px;""> <img src={{productImage}} alt="" style=" height: 81px; width: 81px; object-fit: cover;"></td><td><table border="0" cellspacing="0" cellpadding="0"><tr><td style="color: rgba(29, 35, 46, 0.66); font-family: 'Circular Std Book'; font-size: 14px; font-weight: 300; letter-spacing: 0; line-height: 20px;padding-bottom: 2px;"> {{vendorRegisterName}}</td></tr><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 22px; padding-bottom: 2px;"> {{productName}}</td></tr><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: bold; letter-spacing: 0; line-height: 22px;"> {{currency}} {{productPrice}}</td></tr> {{#if size}}<tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: bold; letter-spacing: 0; line-height: 22px;"> Size: {{size}}</td></tr> {{/if}} {{#if color}}<tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: bold; letter-spacing: 0; line-height: 22px;"> Color: {{color}}</td></tr> {{/if}}</table></td><td><table border="0" cellspacing="0" cellpadding="0" style="margin-left: auto;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 22px;text-align: right;"> Status</td></tr><tr><td style="color: #03898C; font-family: 'Circular Std Book'; font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 24px;padding-bottom: 13px;"> {{status}}</td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="20"> &nbsp;</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="20">&nbsp;</td></tr></table></td></tr></table><table align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #ffffff;" bgcolor="#ffffff"><table class="deviceWidth1" width="530" style="margin: 0 auto; width: 530px;" align="center" border="0" cellspacing="0" cellpadding="0"><tr><td style="font-size: 1px; line-height: 1px;" height="10">&nbsp;</td></tr><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: bold; letter-spacing: 0; line-height: 22px;"> Order Summary</td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="10">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Order Sub Total</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{subTotal}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="3">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Shipping & Handling</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{shippingCharges}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="15">&nbsp;</td></tr><tr><td style="border-top: 1px dashed rgba(29, 35, 46, 0.44);">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Total Before VAT</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{subTotalBeforeTax}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="3">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Estimated VAT</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{tax}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="15">&nbsp;</td></tr><tr><td style="border-top: 1px dashed rgba(29, 35, 46, 0.44);">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Total</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{subTotalWithTax}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="3">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Promotion Applied</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{promoAmount}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="15">&nbsp;</td></tr><tr><td style="border-top: 1px dashed rgba(29, 35, 46, 0.44);">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Taxes & Charges</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{tax}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="15">&nbsp;</td></tr><tr><td style="border-top: 1px dashed rgba(29, 35, 46, 0.44);">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Net Amount</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{finalTotal}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="35">&nbsp;</td></tr><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: bold; letter-spacing: 0; line-height: 22px;"> Customer info</td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="25">&nbsp;</td></tr><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 22px;padding-bottom: 5px;"> {{name}}</td></tr><tr><td style="color: rgba(29, 35, 46, 0.66); font-family: 'Circular Std Book'; font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 22px;padding-bottom: 5px;"> {{street}} {{building}}, {{state}} {{city}} {{country}}</td></tr><tr><td style="color: rgba(29, 35, 46, 0.66); font-family: 'Circular Std Book'; font-size: 14px; font-weight: 300; letter-spacing: 0; line-height: 20px;"> {{countryCode}} {{phoneNo}}</td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="25">&nbsp;</td></tr></table></td></tr></table></td></tr></table></td></tr></table></body></html>`
        payload.encryptedEmail = await UniversalFunctions.encryptDecrypt(email, 'encrypt');
        payload.unSubscribeUrl = `${process.env.LIVE_API_URL}/user/v1/unSubscribeNewsLetter?email=${payload.encryptedEmail}`;
        let templateData = await  fs.readFileSync(Path.resolve('./views/statusChangeOrder.html'), 'utf8');
        let html = await UniversalFunctions.renderMessageFromTemplateAndVariables(templateData, payload);

        console.log(html)
        await EmailManager.sendEmail(email, `Order Update for order number - ${orderNumber}`, html)

    }catch (e) {
        throw  e
    }
}
let sendEmailCancel = async (payload, email, orderNumber) =>{
    try{
        console.log(JSON.stringify(payload))
        payload.emailConfirmationText = UniversalFunctions.renderMessageFromTemplateAndVariables(STRING_CONSTANTS.EMAIL_CONTENT.ORDER_CONFIRMATION_TEXT.en, {
            date: payload.createdDate
        });
        payload.experienceText = STRING_CONSTANTS.EMAIL_CONTENT.ORDER_EXPERIENCE_TEXT.en;
        payload.logoUrl = logoUrl;
        payload.websiteUrl = process.env.websiteUrl;
        payload.emailLogoUrl = emailLogoUrl;
        payload.facebookLogoUrl = facebookLogoUrl;
        payload.twitterlogoUrl = twitterlogoUrl;
        payload.linkedInLogoUrl = linkedInLogoUrl;
        payload.pInterestLogoUrl = pInterestLogoUrl;
        payload.playStoreLogoUrl = playStoreLogoUrl;
        let appDefaults = await Dao.findOne(Models.appDefaults, {}, {
            facebookUrl: 1,
            twitterUrl: 1,
            pInterestUrl: 1,
            linkedInUrl: 1
        }, {})
        payload.facebookUrl = appDefaults.facebookUrl?appDefaults.facebookUrl:"#";
        payload.twitterUrl = appDefaults.twitterUrl?appDefaults.twitterUrl:"#";
        payload.linkedInUrl = appDefaults.linkedInUrl?appDefaults.linkedInUrl:"#";
        payload.pInterestUrl = appDefaults.pInterestUrl?appDefaults.pInterestUrl:"#";
        // let templateData = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><meta content="width=device-width, minimal-ui, initial-scale=1.0, maximum-scale=1.0, user-scalable=0;" name="viewport" /><meta content="telephone=no" name="format-detection" /><title>My Vendor</title><style type="text/css">@font-face{font-family:'Circular Std Book';src:url('../fonts/CircularStd-Book.eot');src:url('../fonts/CircularStd-Book.eot?#iefix') format('embedded-opentype'), url('../fonts/CircularStd-Book.woff2') format('woff2'), url('../fonts/CircularStd-Book.woff') format('woff'), url('../fonts/CircularStd-Book.svg#CircularStd-Book') format('svg');font-weight:500;font-style:normal}</style></head><body style="-webkit-font-smoothing: antialiased !important; -webkit-text-size-adjust: none !important; width: 100% !important; height: 100% !important; font-family:'Arial',Helvetica,sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; margin: 0; padding: 0;"><table align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #f1f1f1;" bgcolor="#f1f1f1"><table class="deviceWidth" align="center" width="600" style="width: 600px; min-width: 600px;" border="0" cellspacing="0" cellpadding="0"><tr><td valign="top" style="vertical-align:top;border-collapse: collapse;"><table class="mktoModule" id="logo-module" mktoName="Logo Module" align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #ffffff;" bgcolor="#ffffff"><table class="deviceWidth1" width="530" style="margin: 0 auto;width: 530px;" align="center" border="0" cellspacing="0" cellpadding="0"><tr><td style="font-size: 1px; line-height: 1px;" height="25">&nbsp;</td></tr><tr><td><table border="0" cellspacing="0" cellpadding="0" style="margin: auto;"><tr><td valign="top" style="text-align: left;vertical-align: top;"> <a href={{websiteUrl}} style="text-decoration: none;" target="_blank"> <img height="48" border="0" src={{logoUrl}} alt="" /> </a></td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px; border-bottom: 1px solid rgba(29, 35, 46, 0.44);" height="25">&nbsp;</td></tr></table></td></tr></table><table align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #ffffff;" bgcolor="#ffffff"><table class="deviceWidth1" width="530" style="margin: 0 auto;width: 530px;" align="center" border="0" cellspacing="0" cellpadding="0"><tr><td style="font-size: 1px; line-height: 1px;" height="30">&nbsp;</td></tr><tr><td><table border="0" cellspacing="0" cellpadding="0"><tr><td valign="top" style="text-align: left;vertical-align: top; color: #1D232E; font-family: 'Circular Std Book';font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 22px;"> Order ID: {{subOrderNumber}}</td></tr><tr><td valign="top" style="text-align: left;vertical-align: top;color: rgba(29, 35, 46, 0.66); font-family: 'Circular Std Book'; font-size: 14px; font-weight: 300; letter-spacing: 0; line-height: 20px;"> Placed on: {{createdDate}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="10">&nbsp;</td></tr></table></td></tr></table><table align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #ffffff;" bgcolor="#ffffff"><table class="deviceWidth1" width="530" style="margin: 0 auto; width: 530px;" align="center" border="0" cellspacing="0" cellpadding="0"><tr><td style="font-size: 1px; line-height: 1px;" height="10">&nbsp;</td></tr><tr><td style="height: 100px; width: 100px;""> <img src={{productImage}} alt="" style=" height: 81px; width: 81px; object-fit: cover;"></td><td><table border="0" cellspacing="0" cellpadding="0"><tr><td style="color: rgba(29, 35, 46, 0.66); font-family: 'Circular Std Book'; font-size: 14px; font-weight: 300; letter-spacing: 0; line-height: 20px;padding-bottom: 2px;"> {{vendorRegisterName}}</td></tr><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 22px; padding-bottom: 2px;"> {{productName}}</td></tr><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: bold; letter-spacing: 0; line-height: 22px;"> {{currency}} {{productPrice}}</td></tr> {{#if size}}<tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: bold; letter-spacing: 0; line-height: 22px;"> Size: {{size}}</td></tr> {{/if}} {{#if color}}<tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: bold; letter-spacing: 0; line-height: 22px;"> Color: {{color}}</td></tr> {{/if}}</table></td><td><table border="0" cellspacing="0" cellpadding="0" style="margin-left: auto;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 22px;text-align: right;"> Status</td></tr><tr><td style="color: #03898C; font-family: 'Circular Std Book'; font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 24px;padding-bottom: 13px;"> {{status}}</td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="20"> &nbsp;</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="20">&nbsp;</td></tr></table></td></tr></table><table align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #ffffff;" bgcolor="#ffffff"><table class="deviceWidth1" width="530" style="margin: 0 auto; width: 530px;" align="center" border="0" cellspacing="0" cellpadding="0"><tr><td style="font-size: 1px; line-height: 1px;" height="10">&nbsp;</td></tr><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: bold; letter-spacing: 0; line-height: 22px;"> Order Summary</td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="10">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Order Sub Total</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{subTotal}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="3">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Shipping & Handling</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{shippingCharges}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="15">&nbsp;</td></tr><tr><td style="border-top: 1px dashed rgba(29, 35, 46, 0.44);">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Total Before VAT</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{subTotalBeforeTax}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="3">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Estimated VAT</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{tax}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="15">&nbsp;</td></tr><tr><td style="border-top: 1px dashed rgba(29, 35, 46, 0.44);">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Total</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{subTotalWithTax}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="3">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Promotion Applied</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{promoAmount}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="15">&nbsp;</td></tr><tr><td style="border-top: 1px dashed rgba(29, 35, 46, 0.44);">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Taxes & Charges</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{tax}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="15">&nbsp;</td></tr><tr><td style="border-top: 1px dashed rgba(29, 35, 46, 0.44);">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Net Amount</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{finalTotal}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="35">&nbsp;</td></tr><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: bold; letter-spacing: 0; line-height: 22px;"> Customer info</td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="25">&nbsp;</td></tr><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 22px;padding-bottom: 5px;"> {{name}}</td></tr><tr><td style="color: rgba(29, 35, 46, 0.66); font-family: 'Circular Std Book'; font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 22px;padding-bottom: 5px;"> {{street}} {{building}}, {{state}} {{city}} {{country}}</td></tr><tr><td style="color: rgba(29, 35, 46, 0.66); font-family: 'Circular Std Book'; font-size: 14px; font-weight: 300; letter-spacing: 0; line-height: 20px;"> {{countryCode}} {{phoneNo}}</td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="25">&nbsp;</td></tr></table></td></tr></table></td></tr></table></td></tr></table></body></html>`
        payload.encryptedEmail = await UniversalFunctions.encryptDecrypt(email, 'encrypt');
        payload.unSubscribeUrl = `${process.env.LIVE_API_URL}/user/v1/unSubscribeNewsLetter?email=${payload.encryptedEmail}`;
        let templateData = await  fs.readFileSync(Path.resolve('./views/cancelOrder.html'), 'utf8');
        let html = await UniversalFunctions.renderMessageFromTemplateAndVariables(templateData, payload);

        console.log(html)
        await EmailManager.sendEmail(email, `Item cancelled for order number - ${orderNumber}`, html)

    }catch (e) {
        throw  e
    }
}


let sendEmailOrderPlaced = async (payload, email, orderNumber) =>{
    try{
        console.log(JSON.stringify(payload))
        payload.emailConfirmationText = UniversalFunctions.renderMessageFromTemplateAndVariables(STRING_CONSTANTS.EMAIL_CONTENT.ORDER_CONFIRMATION_TEXT.en, {
            date: payload.createdDate
        });
        payload.experienceText = STRING_CONSTANTS.EMAIL_CONTENT.ORDER_EXPERIENCE_TEXT.en;
        payload.websiteUrl = process.env.websiteUrl;
        payload.logoUrl = logoUrl;
        payload.emailLogoUrl = emailLogoUrl;
        payload.facebookLogoUrl = facebookLogoUrl;
        payload.twitterlogoUrl = twitterlogoUrl;
        payload.linkedInLogoUrl = linkedInLogoUrl;
        payload.pInterestLogoUrl = pInterestLogoUrl;
        payload.playStoreLogoUrl = playStoreLogoUrl;
        let appDefaults = await Dao.findOne(Models.appDefaults, {}, {
            facebookUrl: 1,
            twitterUrl: 1,
            pInterestUrl: 1,
            linkedInUrl: 1
        }, {})
        payload.facebookUrl = appDefaults.facebookUrl?appDefaults.facebookUrl:"#";
        payload.twitterUrl = appDefaults.twitterUrl?appDefaults.twitterUrl:"#";
        payload.linkedInUrl = appDefaults.linkedInUrl?appDefaults.linkedInUrl:"#";
        payload.pInterestUrl = appDefaults.pInterestUrl?appDefaults.pInterestUrl:"#";
        // let templateData = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><meta content="width=device-width, minimal-ui, initial-scale=1.0, maximum-scale=1.0, user-scalable=0;" name="viewport" /><meta content="telephone=no" name="format-detection" /><title>My Vendor</title><style type="text/css">@font-face{font-family:'Circular Std Book';src:url('../fonts/CircularStd-Book.eot');src:url('../fonts/CircularStd-Book.eot?#iefix') format('embedded-opentype'), url('../fonts/CircularStd-Book.woff2') format('woff2'), url('../fonts/CircularStd-Book.woff') format('woff'), url('../fonts/CircularStd-Book.svg#CircularStd-Book') format('svg');font-weight:500;font-style:normal}</style></head><body style="-webkit-font-smoothing: antialiased !important; -webkit-text-size-adjust: none !important; width: 100% !important; height: 100% !important; font-family:'Arial',Helvetica,sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; margin: 0; padding: 0;"><table align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #f1f1f1;" bgcolor="#f1f1f1"><table class="deviceWidth" align="center" width="600" style="width: 600px; min-width: 600px;" border="0" cellspacing="0" cellpadding="0"><tr><td valign="top" style="vertical-align:top;border-collapse: collapse;"><table class="mktoModule" id="logo-module" mktoName="Logo Module" align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #ffffff;" bgcolor="#ffffff"><table class="deviceWidth1" width="530" style="margin: 0 auto;width: 530px;" align="center" border="0" cellspacing="0" cellpadding="0"><tr><td style="font-size: 1px; line-height: 1px;" height="25">&nbsp;</td></tr><tr><td><table border="0" cellspacing="0" cellpadding="0" style="margin: auto;"><tr><td valign="top" style="text-align: left;vertical-align: top;"> <a href={{websiteUrl}} style="text-decoration: none;" target="_blank"> <img height="48" border="0" src={{logoUrl}} alt="" /> </a></td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px; border-bottom: 1px solid rgba(29, 35, 46, 0.44);" height="25">&nbsp;</td></tr></table></td></tr></table><table align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #ffffff;" bgcolor="#ffffff"><table class="deviceWidth1" width="530" style="margin: 0 auto;width: 530px;" align="center" border="0" cellspacing="0" cellpadding="0"><tr><td style="font-size: 1px; line-height: 1px;" height="30">&nbsp;</td></tr><tr><td><table border="0" cellspacing="0" cellpadding="0"><tr><td valign="top" style="text-align: left;vertical-align: top; color: #1D232E; font-family: 'Circular Std Book';font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 22px;"> Order ID: {{subOrderNumber}}</td></tr><tr><td valign="top" style="text-align: left;vertical-align: top;color: rgba(29, 35, 46, 0.66); font-family: 'Circular Std Book'; font-size: 14px; font-weight: 300; letter-spacing: 0; line-height: 20px;"> Placed on: {{createdDate}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="10">&nbsp;</td></tr></table></td></tr></table><table align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #ffffff;" bgcolor="#ffffff"><table class="deviceWidth1" width="530" style="margin: 0 auto; width: 530px;" align="center" border="0" cellspacing="0" cellpadding="0"> {{#products}}<tr><td style="font-size: 1px; line-height: 1px;" height="10">&nbsp;</td></tr><tr><td style="height: 100px; width: 100px;""> <img src={{productImage}} alt="" style=" height: 81px; width: 81px; object-fit: cover;"></td><td><table border="0" cellspacing="0" cellpadding="0"><tr><td style="color: rgba(29, 35, 46, 0.66); font-family: 'Circular Std Book'; font-size: 14px; font-weight: 300; letter-spacing: 0; line-height: 20px;padding-bottom: 2px;"> {{vendorRegisterName}}</td></tr><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 22px; padding-bottom: 2px;"> {{productName}}</td></tr><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: bold; letter-spacing: 0; line-height: 22px;"> {{currency}} {{productPrice}}</td></tr> {{#if size}}<tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: bold; letter-spacing: 0; line-height: 22px;"> Size: {{size}}</td></tr> {{/if}} {{#if color}}<tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: bold; letter-spacing: 0; line-height: 22px;"> Color: {{color}}</td></tr> {{/if}}</table></td><td><table border="0" cellspacing="0" cellpadding="0" style="margin-left: auto;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 22px;text-align: right;"> Status</td></tr><tr><td style="color: #03898C; font-family: 'Circular Std Book'; font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 24px;padding-bottom: 13px;"> {{status}}</td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="20"> &nbsp;</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="20">&nbsp;</td></tr> {{/products}}</table></td></tr></table><table align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #ffffff;" bgcolor="#ffffff"><table class="deviceWidth1" width="530" style="margin: 0 auto; width: 530px;" align="center" border="0" cellspacing="0" cellpadding="0"><tr><td style="font-size: 1px; line-height: 1px;" height="10">&nbsp;</td></tr><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: bold; letter-spacing: 0; line-height: 22px;"> Order Summary</td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="10">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Order Sub Total</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{subTotal}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="3">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Shipping & Handling</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{shippingCharges}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="15">&nbsp;</td></tr><tr><td style="border-top: 1px dashed rgba(29, 35, 46, 0.44);">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Total Before VAT</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{subTotalBeforeTax}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="3">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Estimated VAT</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{tax}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="15">&nbsp;</td></tr><tr><td style="border-top: 1px dashed rgba(29, 35, 46, 0.44);">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Total</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{subTotalWithTax}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="3">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Promotion Applied</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{promoAmount}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="15">&nbsp;</td></tr><tr><td style="border-top: 1px dashed rgba(29, 35, 46, 0.44);">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Taxes & Charges</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{tax}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="15">&nbsp;</td></tr><tr><td style="border-top: 1px dashed rgba(29, 35, 46, 0.44);">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Net Amount</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{finalTotal}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="35">&nbsp;</td></tr><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: bold; letter-spacing: 0; line-height: 22px;"> Customer info</td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="25">&nbsp;</td></tr><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 22px;padding-bottom: 5px;"> {{name}}</td></tr><tr><td style="color: rgba(29, 35, 46, 0.66); font-family: 'Circular Std Book'; font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 22px;padding-bottom: 5px;"> {{street}} {{building}}, {{state}} {{city}} {{country}}</td></tr><tr><td style="color: rgba(29, 35, 46, 0.66); font-family: 'Circular Std Book'; font-size: 14px; font-weight: 300; letter-spacing: 0; line-height: 20px;"> {{countryCode}} {{phoneNo}}</td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="25">&nbsp;</td></tr></table></td></tr></table></td></tr></table></td></tr></table></body></html>`
        payload.encryptedEmail = await UniversalFunctions.encryptDecrypt(email, 'encrypt');
        payload.unSubscribeUrl = `${process.env.LIVE_API_URL}/user/v1/unSubscribeNewsLetter?email=${payload.encryptedEmail}`;
        let templateData =await  fs.readFileSync(Path.resolve('./views/placeOrder.html'), 'utf8');
        let html = await UniversalFunctions.renderMessageFromTemplateAndVariables(templateData, payload);

        console.log(html)
        await EmailManager.sendEmail(email, `Order Placed, order number - ${orderNumber}`, html)

    }catch (e) {
        throw  e
    }
}

const expiredSubscriptionEmail = async (subject, email, text, type, day, vendorRegisterName)=>{
    try{
        let thankYouString=STRING_CONSTANTS.EMAIL_CONTENT.THANK_YOU_3.en;
        let exploreString=STRING_CONSTANTS.EMAIL_CONTENT.EXPLORE_STRING.en;
        let templateData;
        let daysString;
        if(type === 'Manual'){
            daysString = await UniversalFunctions.renderMessageFromTemplateAndVariables(STRING_CONSTANTS.EMAIL_CONTENT.DAY_STRING.en, {day: day, vendorRegisterName: vendorRegisterName})
            templateData = await  fs.readFileSync(Path.resolve('./views/subscriptionManualAlert.html'), 'utf8');
        }else if(type === 'Redirection') {
            daysString = await UniversalFunctions.renderMessageFromTemplateAndVariables(text, {day: day, vendorRegisterName: vendorRegisterName})
            templateData = await  fs.readFileSync(Path.resolve('./views/subscriptionManualAlert.html'), 'utf8');
        }
        else
        {
            daysString = await UniversalFunctions.renderMessageFromTemplateAndVariables(STRING_CONSTANTS.EMAIL_CONTENT.AUTO_DAY_STRING.en,{day: day, vendorRegisterName: vendorRegisterName})
            templateData = await  fs.readFileSync(Path.resolve('./views/subscriptionAutoAlert.html'), 'utf8');
        }
        let obj = {
            daysString: daysString,
            exploreString: exploreString,
            thankYouString: thankYouString
        };
        obj.logoUrl = logoUrl;
        obj.emailLogoUrl = emailLogoUrl;
        obj.websiteUrl = process.env.websiteUrl;
        obj.facebookLogoUrl = facebookLogoUrl;
        obj.twitterlogoUrl = twitterlogoUrl;
        obj.linkedInLogoUrl = linkedInLogoUrl;
        obj.pInterestLogoUrl = pInterestLogoUrl;
        obj.playStoreLogoUrl = playStoreLogoUrl;
        let appDefaults = await Dao.findOne(Models.appDefaults, {}, {
            facebookUrl: 1,
            twitterUrl: 1,
            pInterestUrl: 1,
            linkedInUrl: 1
        }, {})
        obj.facebookUrl = appDefaults.facebookUrl?appDefaults.facebookUrl:"#";
        obj.twitterUrl = appDefaults.twitterUrl?appDefaults.twitterUrl:"#";
        obj.linkedInUrl = appDefaults.linkedInUrl?appDefaults.linkedInUrl:"#";
        obj.pInterestUrl = appDefaults.pInterestUrl?appDefaults.pInterestUrl:"#";
        obj.encryptedEmail = await UniversalFunctions.encryptDecrypt(email, 'encrypt');
        obj.unSubscribeUrl = `${process.env.LIVE_API_URL}/user/v1/unSubscribeNewsLetter?email=${obj.encryptedEmail}`;
        let html = await UniversalFunctions.renderMessageFromTemplateAndVariables(templateData, obj);

        await EmailManager.sendEmail(email, subject, html)

    }catch (e) {
        throw  e
    }
}

const boughtSubscriptionEmail = async (subject, email, type, day, vendorRegisterName)=>{
    try{
        let thankYouString=STRING_CONSTANTS.EMAIL_CONTENT.THANK_YOU_3.en;
        let exploreString=STRING_CONSTANTS.EMAIL_CONTENT.EXPLORE_STRING.en;
        let templateData;
        let daysString;
        if(type === 'Normal') {
            daysString = await UniversalFunctions.renderMessageFromTemplateAndVariables(STRING_CONSTANTS.EMAIL_CONTENT.BOUGHT_SUBSCRIPTION.en, {day: day, vendorRegisterName: vendorRegisterName})
            templateData = await  fs.readFileSync(Path.resolve('./views/subscriptionBought.html'), 'utf8');
        }
        else
        {
            daysString = await UniversalFunctions.renderMessageFromTemplateAndVariables(STRING_CONSTANTS.EMAIL_CONTENT.BOUGHT_SUBSCRIPTION.en,{day: day, vendorRegisterName: vendorRegisterName})
            templateData = await  fs.readFileSync(Path.resolve('./views/subscriptionBought.html'), 'utf8');
        }
        let obj = {
            daysString: daysString,
            exploreString: exploreString,
            thankYouString: thankYouString
        };
        obj.logoUrl = logoUrl;
        obj.emailLogoUrl = emailLogoUrl;
        obj.websiteUrl = process.env.websiteUrl;
        obj.facebookLogoUrl = facebookLogoUrl;
        obj.twitterlogoUrl = twitterlogoUrl;
        obj.linkedInLogoUrl = linkedInLogoUrl;
        obj.pInterestLogoUrl = pInterestLogoUrl;
        obj.playStoreLogoUrl = playStoreLogoUrl;
        let appDefaults = await Dao.findOne(Models.appDefaults, {}, {
            facebookUrl: 1,
            twitterUrl: 1,
            pInterestUrl: 1,
            linkedInUrl: 1
        }, {})
        obj.facebookUrl = appDefaults.facebookUrl?appDefaults.facebookUrl:"#";
        obj.twitterUrl = appDefaults.twitterUrl?appDefaults.twitterUrl:"#";
        obj.linkedInUrl = appDefaults.linkedInUrl?appDefaults.linkedInUrl:"#";
        obj.pInterestUrl = appDefaults.pInterestUrl?appDefaults.pInterestUrl:"#";
        obj.encryptedEmail = await UniversalFunctions.encryptDecrypt(email, 'encrypt');
        obj.unSubscribeUrl = `${process.env.LIVE_API_URL}/user/v1/unSubscribeNewsLetter?email=${obj.encryptedEmail}`;
        let html = await UniversalFunctions.renderMessageFromTemplateAndVariables(templateData, obj);

        await EmailManager.sendEmail(email, subject, html)

    }catch (e) {
        throw  e
    }
}

const createInvoicePdf = async (payload)=>{
    try{

        payload.experienceText = STRING_CONSTANTS.EMAIL_CONTENT.ORDER_EXPERIENCE_TEXT.en;
        payload.logoUrl = logoUrl;
        payload.emailLogoUrl = emailLogoUrl;
        payload.websiteUrl = process.env.websiteUrl;
        payload.facebookLogoUrl = facebookLogoUrl;
        payload.twitterlogoUrl = twitterlogoUrl;
        payload.linkedInLogoUrl = linkedInLogoUrl;
        payload.pInterestLogoUrl = pInterestLogoUrl;
        payload.playStoreLogoUrl = playStoreLogoUrl;
        let appDefaults = await Dao.findOne(Models.appDefaults, {}, {
            facebookUrl: 1,
            twitterUrl: 1,
            pInterestUrl: 1,
            linkedInUrl: 1
        }, {})
        payload.facebookUrl = appDefaults.facebookUrl?appDefaults.facebookUrl:"#";
        payload.twitterUrl = appDefaults.twitterUrl?appDefaults.twitterUrl:"#";
        payload.linkedInUrl = appDefaults.linkedInUrl?appDefaults.linkedInUrl:"#";
        payload.pInterestUrl = appDefaults.pInterestUrl?appDefaults.pInterestUrl:"#";
        payload.encryptedEmail = await UniversalFunctions.encryptDecrypt(email, 'encrypt');
        payload.unSubscribeUrl = `${process.env.LIVE_API_URL}/user/v1/unSubscribeNewsLetter?email=${payload.encryptedEmail}`;
        let templateData =await  fs.readFileSync(Path.resolve('./views/invoiceTemplate.html'), 'utf8');
        let html = await UniversalFunctions.renderMessageFromTemplateAndVariables(templateData, payload);
        return await createPdf(html)
    }catch (e){
        throw e
    }
}
const unSubscribeEmail = async (payload)=>{
    try{

        payload.experienceText = STRING_CONSTANTS.EMAIL_CONTENT.ORDER_EXPERIENCE_TEXT.en;
        payload.logoUrl = logoUrl;
        payload.emailLogoUrl = emailLogoUrl;
        payload.websiteUrl = process.env.websiteUrl;
        payload.facebookLogoUrl = facebookLogoUrl;
        payload.twitterlogoUrl = twitterlogoUrl;
        payload.linkedInLogoUrl = linkedInLogoUrl;
        payload.pInterestLogoUrl = pInterestLogoUrl;
        payload.playStoreLogoUrl = playStoreLogoUrl;
        let appDefaults = await Dao.findOne(Models.appDefaults, {}, {
            facebookUrl: 1,
            twitterUrl: 1,
            pInterestUrl: 1,
            linkedInUrl: 1
        }, {})
        payload.facebookUrl = appDefaults.facebookUrl?appDefaults.facebookUrl:"#";
        payload.twitterUrl = appDefaults.twitterUrl?appDefaults.twitterUrl:"#";
        payload.linkedInUrl = appDefaults.linkedInUrl?appDefaults.linkedInUrl:"#";
        payload.pInterestUrl = appDefaults.pInterestUrl?appDefaults.pInterestUrl:"#";
        // let templateData = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><meta content="width=device-width, minimal-ui, initial-scale=1.0, maximum-scale=1.0, user-scalable=0;" name="viewport" /><meta content="telephone=no" name="format-detection" /><title>My Vendor</title><style type="text/css">@font-face{font-family:'Circular Std Book';src:url('../fonts/CircularStd-Book.eot');src:url('../fonts/CircularStd-Book.eot?#iefix') format('embedded-opentype'), url('../fonts/CircularStd-Book.woff2') format('woff2'), url('../fonts/CircularStd-Book.woff') format('woff'), url('../fonts/CircularStd-Book.svg#CircularStd-Book') format('svg');font-weight:500;font-style:normal}</style></head><body style="-webkit-font-smoothing: antialiased !important; -webkit-text-size-adjust: none !important; width: 100% !important; height: 100% !important; font-family:'Arial',Helvetica,sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; margin: 0; padding: 0;"><table align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #f1f1f1;" bgcolor="#f1f1f1"><table class="deviceWidth" align="center" width="600" style="width: 600px; min-width: 600px;" border="0" cellspacing="0" cellpadding="0"><tr><td valign="top" style="vertical-align:top;border-collapse: collapse;"><table class="mktoModule" id="logo-module" mktoName="Logo Module" align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #ffffff;" bgcolor="#ffffff"><table class="deviceWidth1" width="530" style="margin: 0 auto;width: 530px;" align="center" border="0" cellspacing="0" cellpadding="0"><tr><td style="font-size: 1px; line-height: 1px;" height="25">&nbsp;</td></tr><tr><td><table border="0" cellspacing="0" cellpadding="0" style="margin: auto;"><tr><td valign="top" style="text-align: left;vertical-align: top;"> <a href={{websiteUrl}} style="text-decoration: none;" target="_blank"> <img height="48" border="0" src={{logoUrl}} alt="" /> </a></td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px; border-bottom: 1px solid rgba(29, 35, 46, 0.44);" height="25">&nbsp;</td></tr></table></td></tr></table><table align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #ffffff;" bgcolor="#ffffff"><table class="deviceWidth1" width="530" style="margin: 0 auto;width: 530px;" align="center" border="0" cellspacing="0" cellpadding="0"><tr><td style="font-size: 1px; line-height: 1px;" height="30">&nbsp;</td></tr><tr><td><table border="0" cellspacing="0" cellpadding="0"><tr><td valign="top" style="text-align: left;vertical-align: top; color: #1D232E; font-family: 'Circular Std Book';font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 22px;"> Order ID: {{subOrderNumber}}</td></tr><tr><td valign="top" style="text-align: left;vertical-align: top;color: rgba(29, 35, 46, 0.66); font-family: 'Circular Std Book'; font-size: 14px; font-weight: 300; letter-spacing: 0; line-height: 20px;"> Placed on: {{createdDate}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="10">&nbsp;</td></tr></table></td></tr></table><table align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #ffffff;" bgcolor="#ffffff"><table class="deviceWidth1" width="530" style="margin: 0 auto; width: 530px;" align="center" border="0" cellspacing="0" cellpadding="0"> {{#products}}<tr><td style="font-size: 1px; line-height: 1px;" height="10">&nbsp;</td></tr><tr><td style="height: 100px; width: 100px;""> <img src={{productImage}} alt="" style=" height: 81px; width: 81px; object-fit: cover;"></td><td><table border="0" cellspacing="0" cellpadding="0"><tr><td style="color: rgba(29, 35, 46, 0.66); font-family: 'Circular Std Book'; font-size: 14px; font-weight: 300; letter-spacing: 0; line-height: 20px;padding-bottom: 2px;"> {{vendorRegisterName}}</td></tr><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 22px; padding-bottom: 2px;"> {{productName}}</td></tr><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: bold; letter-spacing: 0; line-height: 22px;"> {{currency}} {{productPrice}}</td></tr> {{#if size}}<tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: bold; letter-spacing: 0; line-height: 22px;"> Size: {{size}}</td></tr> {{/if}} {{#if color}}<tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: bold; letter-spacing: 0; line-height: 22px;"> Color: {{color}}</td></tr> {{/if}}</table></td><td><table border="0" cellspacing="0" cellpadding="0" style="margin-left: auto;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 22px;text-align: right;"> Status</td></tr><tr><td style="color: #03898C; font-family: 'Circular Std Book'; font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 24px;padding-bottom: 13px;"> {{status}}</td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="20"> &nbsp;</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="20">&nbsp;</td></tr> {{/products}}</table></td></tr></table><table align="center" style="width: 100%;" border="0" cellspacing="0" cellpadding="0"><tr><td style="background-color: #ffffff;" bgcolor="#ffffff"><table class="deviceWidth1" width="530" style="margin: 0 auto; width: 530px;" align="center" border="0" cellspacing="0" cellpadding="0"><tr><td style="font-size: 1px; line-height: 1px;" height="10">&nbsp;</td></tr><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: bold; letter-spacing: 0; line-height: 22px;"> Order Summary</td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="10">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Order Sub Total</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{subTotal}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="3">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Shipping & Handling</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{shippingCharges}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="15">&nbsp;</td></tr><tr><td style="border-top: 1px dashed rgba(29, 35, 46, 0.44);">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Total Before VAT</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{subTotalBeforeTax}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="3">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Estimated VAT</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{tax}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="15">&nbsp;</td></tr><tr><td style="border-top: 1px dashed rgba(29, 35, 46, 0.44);">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Total</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{subTotalWithTax}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="3">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Promotion Applied</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{promoAmount}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="15">&nbsp;</td></tr><tr><td style="border-top: 1px dashed rgba(29, 35, 46, 0.44);">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Taxes & Charges</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{tax}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="15">&nbsp;</td></tr><tr><td style="border-top: 1px dashed rgba(29, 35, 46, 0.44);">&nbsp;</td></tr><tr><td><table style="width: 100%;"><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;"> Net Amount</td><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 18px; font-weight: 300; letter-spacing: 0; line-height: 24px;text-align: right;"> {{currency}} {{finalTotal}}</td></tr></table></td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="35">&nbsp;</td></tr><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: bold; letter-spacing: 0; line-height: 22px;"> Customer info</td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="25">&nbsp;</td></tr><tr><td style="color: #1D232E; font-family: 'Circular Std Book'; font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 22px;padding-bottom: 5px;"> {{name}}</td></tr><tr><td style="color: rgba(29, 35, 46, 0.66); font-family: 'Circular Std Book'; font-size: 16px; font-weight: 300; letter-spacing: 0; line-height: 22px;padding-bottom: 5px;"> {{street}} {{building}}, {{state}} {{city}} {{country}}</td></tr><tr><td style="color: rgba(29, 35, 46, 0.66); font-family: 'Circular Std Book'; font-size: 14px; font-weight: 300; letter-spacing: 0; line-height: 20px;"> {{countryCode}} {{phoneNo}}</td></tr><tr><td style="font-size: 1px; line-height: 1px;" height="25">&nbsp;</td></tr></table></td></tr></table></td></tr></table></td></tr></table></body></html>`
        payload.unSubscribeUrl = `${process.env.LIVE_API_URL}/user/v1/unSubscribeNewsLetter?email=${payload.encryptedEmail}`;
        let templateData =await  fs.readFileSync(Path.resolve('./views/unsubscribe.html'), 'utf8');
        let html = await UniversalFunctions.renderMessageFromTemplateAndVariables(templateData, payload);
        return html
    }catch (e){
        throw e
    }
}

async function createPdf(html) {

    html=html.replace(/&lt;/g, '<');
    html=html.replace(/&gt;/g, '>');
    html=html.replace(/&amp;/g, '&');
    let fileName=+new Date();
    let path = "./public/uploads/" +fileName+ ".pdf";
    return new Promise((resolve, reject) => {
        htmlToPdf.create(html,
            {
                "height": "12.5in",        // allowed units: mm, cm, in, px
                "width": "15in",
                "border": {
                    "top": "0.5in",            // default is 0, units: mm, cm, in, px
                    "right": "0.5in",
                    "bottom": "0.5in",
                    "left": "0.5in"
                },
                type: 'pdf',
                // base:_basePath
                // "renderDelay": 10000,
                // "phantomPath": "./node_modules/phantomjs/bin/phantomjs"
            }
        ).toBuffer( (err, stream) => {
            if (err) reject(err);
            else{
                console.log("stream", stream)
                resolve(stream)
            }
        });
    })

}

module.exports = {
    sendEmailForgotPassword: sendEmailForgotPassword,
    sendEmailSignUp: sendEmailSignUp,
    sendEmailOrderStatus: sendEmailOrderStatus,
    sendEmailOrderPlaced: sendEmailOrderPlaced,
    sendEmailCancel: sendEmailCancel,
    expiredSubscriptionEmail: expiredSubscriptionEmail,
    sendEmailLoginOTP: sendEmailLoginOTP,
    createInvoicePdf: createInvoicePdf,
    sendEmailGiftCard: sendEmailGiftCard,
    unSubscribeEmail: unSubscribeEmail,
    newsLetterEmail: newsLetterEmail,
    boughtSubscriptionEmail: boughtSubscriptionEmail
}
