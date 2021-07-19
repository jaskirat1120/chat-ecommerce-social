'use strict';
// validate enviorment file
require('./env-validation');
// require('dotenv').config({path:'./.env'});

// ***********************************************

// npm modules constructor
const Hapi = require('hapi')


// constants imported
const APP_CONSTANTS = require('./config/constants/app-defaults');

// local modules
const Plugins = require('./plugins');
const Routes = require('./api').routes;
const Logger = require('./lib/log-manager').logger;
const CronManager = require('./lib/cron-manager');
const Db = require('./db-connection');
const Bootstrap = require('./utils/bootstrap');

global.Dao = require('./dao').queries;
global.Models = require('./models');
global.RESPONSE_MESSAGES = require('./config/constants').responseMessages;
global.APP_CONSTANTS = require('./config').constants.appDefaults;
global.CONSTANTS = require('./config').storageConf;
global.mongoose = require('mongoose');


// console.log('process.env.PORT',process.env.PORT)
// Create Server
let server = new Hapi.Server({
    app: {
        name: APP_CONSTANTS.APP.NAME
    },
    port: process.env.PORT || APP_CONSTANTS.SERVER.PORT,
    cache: { provider: require('@hapi/catbox-memory'), name: 'memory' },
    routes: {
        cors: true
    }
});


(async initServer => {
    try {
        // connecting db
        await Db.mongoConnections.connect()
        // bootstrap data
        if (process.env.RUN_BOOTSTRAP && process.env.RUN_BOOTSTRAP === "True")
            await Bootstrap.startBootsrap();

        // await Bootstrap.connectSocket(server)

        // Register All Plugins
        await server.register(Plugins);

        // API Routes
        await server.route(Routes);

        server.events.on('response', request => {
            Logger.log('info', `[${request.method.toUpperCase()} ${request.url.pathname} ](${request.response && request.response.statusCode}) : ${request.info.responded - request.info.received} ms`);
            console.log(`[${request.method.toUpperCase()} ${request.url.pathname} ](${request.response && request.response.statusCode}) : ${request.info.responded - request.info.received} ms`);
            if (process.env.NODE_ENV !== 'prod') {
                if (request.payload) console.log('Request  payload:', request.payload);
                if (request.query) console.log('Request  query:', request.query);
            }

        });

        // Default Routes
        server.route({
            method: 'GET',
            path: '/',
            handler: (request, h) => {
                return `WELCOME To ${APP_CONSTANTS.APP.NAME}`;
            },
            config: {
                auth: false
            }
        });

        // hapi swagger workaround(but a ugly hack for version 9.0.1)
        server.ext('onRequest', async (request, h) => {
            request.headers['x-forwarded-host'] = (request.headers['x-forwarded-host'] || request.info.host);
            return h.continue;
        });


        server.ext('onPreAuth', (request, h) => {
            Logger.log("info", `onPreAuth`);
            return h.continue;
        });

        server.ext('onCredentials', (request, h) => {
            Logger.log("info", `onCredentials`);
            return h.continue;
        });

        server.ext('onPostAuth', (request, h) => {
            Logger.log("info", `onPostAuth`);
            return h.continue;
        });

        // Start Server

        // disable all consoles here
        if (process.env.NODE_ENV === 'production') {
            console.log = function () {
            }
        }

        await server.start();

        //run crons
        await CronManager.resetDailyVisits()
        await CronManager.expireSubscriptionAndSendEmails();
        await CronManager.checkCourierStatus();
        await CronManager.checkCourierStatusReturn();
        await CronManager.sendNotificationAndEmailForClicks();

        Logger.log("info", `Server running at ${server.info.uri}`);
    } catch (error) {
        Logger.error(error);
    }
})();

