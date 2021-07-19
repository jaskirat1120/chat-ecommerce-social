'use strict';
const postShippingHost = process.env.POST_SHIPPING_URL;
const request = require("request");
const APP_CONSTANTS = require('../config/constants/app-defaults')

const postShippingRates = async (data)=>{
    try{
        let url = `${postShippingHost}rates`;
        let obj = {
            "DepartureCountryCode": data.departureCountryCode,
            ...(data.departurePostcode && {"DeparturePostcode": data.departurePostcode}),
            ...(data.departureLocation && {"DepartureLocation": data.departureLocation}),
            "ArrivalCountryCode": data.arrivalCountryCode,
            ...(data.arrivalPostcode && {"ArrivalPostcode": data.arrivalPostcode}),
            ...(data.arrivalLocation && {"ArrivalLocation": data.arrivalLocation}),
            "PaymentCurrencyCode": data.currency,
            "WeightMeasure": "KG",
            "Weight": data.weight,
            "NumofItem": data.noOfItems,
            "ServiceType": "ED",
            "DimensionUnit": "CM",
            "CustomCurrencyCode": data.currency,
            "Items": data.items
        },
        headers = {
            Token: process.env.POST_SHIPPING_TOKEN,
            "Content-Type": "application/json"
        }
        console.log({headers})
        const options = {
            method: 'POST',
            url: url,
            headers: headers,
            form: JSON.stringify(obj)
        };
        return await requestApi(options);
    }catch(e){
        throw e
    }
}


const postShippingShipment = async (data, userData, transaction, SenderDetails, ReceiverDetails, PickupDetails)=>{
    try{

        console.log("datadata", data, userData)
        let url = `${postShippingHost}shipments`;
        let obj = [{
            "ThirdPartyToken":process.env.SKY_NET_ACCOUNT_TOKEN, 
            "SenderDetails": SenderDetails ? SenderDetails: {
                "SenderName": `${userData.firstName} ${userData.lastName}`,
                "SenderCompanyName": `${userData.vendorRegisterName}`,
                "SenderCountryCode": "AE"/*`${userData.phoneNumber.ISO}`*/,
                "SenderAdd1": `${userData.address}`,
                "SenderAdd2": "",
                "SenderAdd3": "",
                "SenderAddCity": "",
                "SenderAddState": "",
                "SenderAddPostcode": "",
                "SenderPhone": `${userData.phoneNumber.countryCode}${userData.phoneNumber.phoneNo}`,
                "SenderEmail": `${userData.email}`,
                "SenderFax": "",
                "SenderKycType":"",
                "SenderKycNumber":"",
                "SenderReceivingCountryTaxID":""
            },
            "ReceiverDetails":ReceiverDetails ? ReceiverDetails: {
                "ReceiverName": `${data.deliveryAddress.name}`,
                "ReceiverCompanyName": "",
                "ReceiverCountryCode": `${data.deliveryAddress.contactDetails.ISO}`,
                "ReceiverAdd1": `${data.deliveryAddress.street}`,
                "ReceiverAdd2": `${data.deliveryAddress.building}`,
                "ReceiverAdd3": "",
                "ReceiverAddCity": `${data.deliveryAddress.city}`,
                "ReceiverAddState": `${data.deliveryAddress.state}`,
                "ReceiverAddPostcode": "",
                "ReceiverMobile": `${data.deliveryAddress.contactDetails.countryCode}${data.deliveryAddress.contactDetails.phoneNo}`,
                "ReceiverPhone": "",
                "ReceiverEmail": `${data.user.email}`,
                "ReceiverAddResidential": "",
                "ReceiverFax": "",
                "ReceiverKycType":"",
                "ReceiverKycNumber":""
            },
            "PackageDetails": {
                "GoodDescription": `${data.goodDescription}`,
                "CustomValue": "0.00",
                "CustomCurrencyCode": "",
                "InsuranceValue": "0.00",
                "InsuranceCurrencyCode": "",
                "ShipmentTerm": "", 
                "GoodsOriginCountryCode": "AE",
                "DeliveryInstructions": `${data.deliveryInstructions}`,
                "Weight": parseFloat(data.products.product.weight) * parseInt(data.products.quantity),
                "WeightMeasurement": "KG",
                "NoOfItems": 1,
                "CubicL": parseFloat(data.products.product.length) || 0,
                "CubicW": parseFloat(data.products.product.breadth) || 0, 
                "CubicH": parseFloat(data.products.product.height) || 0,
                "CubicWeight": (parseFloat(data.products.product.weight) * parseInt(data.products.quantity)) ||0,
                "CubicWeightMeasurement": "KG",
                "ServiceTypeName": "EN",
                "BookPickUP": true,
                "AlternateRef": "",
                "SenderRef1": `${data.subOrderNumber}`,
                "SenderRef2": "",
                "SenderRef3": "",
                "DeliveryAgentCode": "",
                "DeliveryRouteCode": "",
                // "ShipmentResponseItem": [{ 
                //     "ItemAlt": "",
                //     "ItemNoOfPcs": 1,
                //     "ItemCubicL": 0,
                //     "ItemCubicW": 0,
                //     "ItemCubicH": 0,
                //     "ItemWeight": 0,
                //     "ItemCubicWeight": 0,
                //     "ItemCubicWeightMeasurement": "1",
                //     "ItemDescription": "document",
                //     "ItemCustomValue": "0.00",
                //     "ItemCustomCurrencyCode": "AED",
                //     "Notes": "item notes",
                //     // "Pieces":[{
                //     //     "HarmonisedCode":"hs001",
                //     //     "GoodsDescription":"shirts",
                //     //     "Content":"cotton",
                //     //     "Notes": "shirts",
                //     //     "SenderRef1":"ref #001",
                //     //     "Quantity":3,
                //     //     "Weight":3,
                //     //     "ManufactureCountryCode":"SG",
                //     //     "OriginCountryCode":"SG",
                //     //     "CurrencyCode":"SGD",
                //     //     "CustomsValue":3.00
                //     // }]
                // }],
                "CODAmount": data.paymentMethod === APP_CONSTANTS.PAYMENT_METHOD_ENUM.CASH_ON_DELIVERY && transaction && transaction.amountWithTax ? transaction.amountWithTax: 0,
                "CODCurrencyCode": data.currency,
                "Bag": 0,
                "Notes": "", 
                "OriginLocCode": "",
                "BagNumber": 0,
                "DeadWeight": 0,
                "ReasonExport": "",
                "DestTaxes": 0.0,
                "Security": 0.0,
                "Surcharge": 0.0,
                "ReceiverTaxID": "",
                "OrderNumber": `${data.orderNumber}`,
                "Incoterms":"CIF",
                "ClearanceReference":""
            },
            "PickupDetails": PickupDetails? PickupDetails : data.pickupDetails
        }],
        headers = {
            Token: process.env.POST_SHIPPING_TOKEN,
            "Content-Type": "application/json"
        };
        console.log({headers})
        const options = {
            method: 'POST',
            url: url,
            headers: headers,
            form: JSON.stringify(obj)
        };
        return await requestApi(options);
    }catch(e){
        throw e
    }
}


const postShippingTrack = async (referenceNumber)=>{
    try{
        let url = `${postShippingHost}tracks`;
        let obj = {
            ReferenceNumber:`${referenceNumber}`
        },
        headers = {
            Token: process.env.POST_SHIPPING_TOKEN,
            "Content-Type": "application/json"
        };
        console.log({headers})
        const options = {
            method: 'GET',
            url: url,
            headers: headers,
            qs: obj
        };
        return await requestApi(options);
    }catch(e){
        throw e
    }
}


const postShippingPickup = async (data)=>{
    try{
        let url = `${postShippingHost}pickup`;
        let obj = {
            "ThirdPartyToken": process.env.SKY_NET_ACCOUNT_TOKEN,
            "CompanyName": "Test Company",
            "ContactName": "Test Contact",
            "ContactNumber": "01234577890",
            "Email": "email@email.com",
            "CarrierCode": "",
            "CollectionDate": "2020-07-22",
            "ReadyTime": {
                "StartTime": "09:00",
                "EndTime": "18:00"
            },
            "PickupAddress": {
                "Address1": "address 1",
                "Address2": "address 2",
                "Address3": "address 3",
                "AddressState": "Singapore",
                "AddressCity": "Singapore",
                "AddressPostalCode": "208573",
                "AddressCountryCode": "SG"
            },
            "ReferenceNumber": "022290008956",
            "SpecialInstruction": "fragile shipment. please take care.",
            "ServiceType": "EN",
            "GoodsDescription": "computer",
            "NoofItems": "1",
            "Weight": "3",
            "WeightMeasure": "kg",
            "CubicLength":0,
            "CubicWidth":0,
            "CubicHeight":0,
            "CubicWeight":0,
            "CubicWeightMeasure":"kg",
            "CubicDimensionMeasure":"cm",
            "SenderRef1": "Order0001",
            "SenderRef2": "",
            "SenderRef3": "",
            "RequestVehicle": ""
        },
        headers = {
            Token: process.env.POST_SHIPPING_TOKEN,
            "Content-Type": "application/json"
        };
        console.log({headers})
        const options = {
            method: 'POST',
            url: url,
            headers: headers,
            form: JSON.stringify(obj)
        };
        return await requestApi(options);

    }catch(e){
        throw e
    }
}

let requestApi = async (options)=>{
    console.log({options: JSON.stringify(options)})
    return new Promise((resolve, reject) => {
        request(options, function (error, response, body) {
            console.log("eeeeeeeerrrrrrrrrrrr in Do Request" , error);
            console.log("bodybodybody in Do Request" , body);
            if(error){
                reject(error)
            }
            if (!error && body) {
                body = JSON.parse(body);
                // resolve(body);
            }
            if (!error) {
                resolve(body);
            }
            else {
                resolve(body);
            }
        });
    });
}

module.exports = {
    postShippingRates: postShippingRates,
    postShippingShipment: postShippingShipment,
    postShippingTrack: postShippingTrack,
    postShippingPickup: postShippingPickup
}