/**
 * Makes all features of users available to outer modules.
 */

module.exports = {
	routes : [
		...require('./auth').authRoutes,
		...require('./common').routes,
		...require('./products').routes,
		...require('./order').routes,
		...require('./chat').routes,
	]
};
