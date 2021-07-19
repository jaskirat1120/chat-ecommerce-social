/**
 * Makes all libraries available through a single require.
 */

module.exports = {
	tokenManager	: require('./token-manager'),
	// socketManager	: require('./socket-manager'),
	loggerManager	: require('./log-manager'),
	emailManager	: require('./email-manager'),
	responseManager : require('./response-manager'),
	payTabManager : require('./paytab-manager'),
	courierManager : require('./courier-manager'),
	awsSNSManager : require('./aws-sns-manager'),
    twilioManager 	: require('./twilio-manager'),
};
