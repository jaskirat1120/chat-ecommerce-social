// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set region
let CONSTANTS = require('../config/storage-conf');
let accessKeyId = CONSTANTS.AWS_S3.accessKeyId;
let secretAccessKeyId = CONSTANTS.AWS_S3.secretAccessKey;
// accessKeyId: accessKeyId, secretAccessKey: secretAccessKeyId,
AWS.config.update({ region: process.env.BUCKET_REGION});
// Create publish parameters
var params = {
  Message: 'Hello ', /* required */
  PhoneNumber: '+919041092856',
};

const sendMessage = async (phoneNumber, message)=>{
// Create promise and SNS service object
var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

// Handle promise's fulfilled/rejected states
publishTextPromise.then(
  function(data) {
    console.log("MessageID is " + data.MessageId);
  }).catch(
    function(err) {
    console.error(err, err.stack);
  });

}

module.exports = {
    sendMessage: sendMessage
}
