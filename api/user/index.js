/**
 * Makes all features of users available to outer modules.
 */

module.exports = {
	routes : [
		...require('./auth').authRoutes,
		...require('./category').routes,
		...require('./order').routes,
		...require('./reactions').routes,
		...require('./explore').routes,
		...require('./follow').routes,
		...require('./feed').routes,
		...require('./chat').routes,
	]
};
