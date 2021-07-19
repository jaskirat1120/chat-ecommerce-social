'use strict';

// npm modules
const inert = require('inert');
const vision = require('vision');
const hapiSwagger = require('hapi-swagger');

// local modules
const Logger = require('../lib/log-manager').logger;

// constants imported
const APP_CONSTANTS = require('../config/constants/app-defaults');

let docForRoutes = [];

if (process.env.ADD_ADMIN_ROUTES === 'True') {
    docForRoutes.push('Admin');
}

if (process.env.ADD_VENDOR_ROUTES === 'True') {
    docForRoutes.push('Vendor');
}

if (process.env.ADD_USER_ROUTES === 'True') {
    docForRoutes.push('User');
}


exports.plugin = {
    name: 'swagger-plugin',

    register: async (server) => {
        const swaggerOptions = {
            info: {
                title: `${process.env.NODE_ENV} APi Doc of '${APP_CONSTANTS.APP.NAME}' project, includes route types ${docForRoutes.join(' and ')}`
            },
            grouping: 'tags',
            schemes: process.env.NODE_ENV === 'development' ? ['https'] : ['http'],
            documentationPath: '/documentation'
        };
        await server.register([
            inert,
            vision,
            {
                plugin: hapiSwagger,
                options: swaggerOptions
            }
        ]);
        Logger.info('Swagger Loaded');
    }
};
