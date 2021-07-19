/**
 * Makes all features available to outer modules.
 */

let routes = [];

if(process.env.ADD_ADMIN_ROUTES === 'True'){
	routes = [...require('./admin').routes]
}

if(process.env.ADD_USER_ROUTES === 'True'){
	routes = [...routes,...require('./user').routes]
}

if(process.env.ADD_VENDOR_ROUTES === 'True'){
	routes = [...routes,...require('./vendor').routes]
}


module.exports = {
	routes: routes
};
