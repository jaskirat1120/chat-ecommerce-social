/**
 * Makes all db connections available through a single require.
 */

module.exports = { 
	mongoConnections : require('./mongo-connection')
};