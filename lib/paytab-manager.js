'use strict';
const merchant_email = process.env.merchant_email;
const secret_key = process.env.secret_key;
const return_url = process.env.return_url;
const site_url = process.env.site_url;
const request = require("request");

const createPage = async (data) => {
    try {
        let url = process.env.pay_page_url;
        let obj = {
            'merchant_email': merchant_email,
            'secret_key': secret_key,
            ...data
        };

        return await doRequest(url, obj);
    } catch (e) {
        console.log("Errrrrrrrorrrrrrrrrrrr in Create Pay Page function", e);
        throw e
    }
};

const tokenizedPayment = async (data) => {
    try {
        let url = process.env.tokenization_url;
        let obj = {
            'merchant_email': merchant_email,
            'secret_key': secret_key,
            ...data
        };

        return await doRequest(url, obj);
    } catch (e) {
        console.log("Errrrrrrrorrrrrrrrrrrr in Create Pay Page function", e);
        throw e
    }
};

const verify = async (data) => {
    try {
        let url = process.env.verify_url;
        let obj = {
            'merchant_email': merchant_email,
            'secret_key': secret_key,
            ...data
        };
        return await doRequest(url, obj)
    } catch (e) {
        console.log("Errrrrrrrorrrrrrrrrrrr in verify function", e);
        throw e
    }
};


const refund = async (data) => {
    try {
        let url = process.env.refund_url;
        let obj = {
            merchant_email: merchant_email,
            secret_key: secret_key,
            refund_amount: data.refund_amount,
            refund_reason: data.refund_reason,
            transaction_id: data.transaction_id,
            // order_id: data.order_id,
        };
        return await doRequest(url, obj)
    } catch (e) {
        console.log("Errrrrrrrorrrrrrrrrrrr in refund function", e);
        throw e
    }
};


function doRequest(url, data) {
    console.log("datadtadtadtadtatdatdatdat", data, url)
    return new Promise(function (resolve, reject) {
        request.post(url, {form: data}, function (error, res, body) {
            console.log("eeeeeeeerrrrrrrrrrrr in Do Request" , error);
            console.log("bodybodybody in Do Request" , body);
            if(error){
                reject(error)
            }
            if (!error && body) {
                body = JSON.parse(body);
                // resolve(body);
            }
            if (!error && (body.response_code === "4012" || body.response_code === 4012 || body.response_code === "100" || body.response_code === 100 || body.response_code === "812" || body.response_code === 812 || body.response_code === "814" || body.response_code === 814)) {
                resolve(body);
            }
            else {
                resolve(body);
            }
        });
    });
}


module.exports = {
    createPage: createPage,
    verify: verify,
    refund: refund,
    tokenizedPayment:tokenizedPayment
};