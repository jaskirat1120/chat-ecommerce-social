'use strict';

//  constants imported
const CONSTANTS = require('../config/constants');

// local modules
const TokenManager = require('../lib/token-manager');

exports.plugin = {
    name: 'auth',
    register: async (server, options) => {
        await server.register(require('hapi-auth-jwt2'));
        server.auth.strategy(CONSTANTS.appDefaults.AUTH_STRATEGIES.ADMIN,
            'jwt',
            {
                key: CONSTANTS.appDefaults.JWT_SECRET.ADMIN,          // Never Share your secret key
                validate: TokenManager.verifyToken, // validate function defined above
                verifyOptions: {algorithms: ['HS256']} // pick a strong algorithm
            });
        server.auth.strategy(CONSTANTS.appDefaults.AUTH_STRATEGIES.USER,
            'jwt',
            {
                key: CONSTANTS.appDefaults.JWT_SECRET.USER,          // Never Share your secret key
                validate: TokenManager.verifyToken, // validate function defined above
                verifyOptions: {algorithms: ['HS256']} // pick a strong algorithm
            });
        server.auth.strategy(CONSTANTS.appDefaults.AUTH_STRATEGIES.VENDOR,
            'jwt',
            {
                key: CONSTANTS.appDefaults.JWT_SECRET.VENDOR,          // Never Share your secret key
                validate: TokenManager.verifyToken, // validate function defined above
                verifyOptions: {algorithms: ['HS256']} // pick a strong algorithm
            });
        server.auth.default(CONSTANTS.appDefaults.AUTH_STRATEGIES.ADMIN);
    }
};
