/**
 * Makes all features of admin available to outer modules.
 */

module.exports = {
	routes : [
		...require('./auth').routes,
		...require('./common').routes,
		...require('./vendor').routes,
		...require('./user').routes,
		...require('./order').routes,
		...require('./feed').routes
	]
};
