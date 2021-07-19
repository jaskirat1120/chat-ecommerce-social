const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_NUMBER;

const client = require('twilio')(accountSid, authToken);

function sendMessage(to, message) {
    client.messages
        .create({from: phoneNumber, body: message, to: to})
        .then(result => {
            console.log('result', result);
            return result
        })
        .catch(err => {
            console.log('errerr', err);
            throw err
        })
}

module.exports = {
    sendMessage: sendMessage
}
