// local modules
const Logger = require('../lib/log-manager').logger;
const Dao = require('../dao').queries;
const Models = require('../models');
const UniversalFunctions = require('./universal-functions');
const SocketManager = require('../lib/socket-manager');
const fs = require('fs');
const Path = require('path')

const bootstrapAdmin = async () => {
    try {
        let data = fs.readFileSync(Path.resolve('./utils/admin-bootstrap.json'), 'utf8');
        let admins = JSON.parse(data);
        await Promise.all(admins.map(admin => createAdmin(admin)));

    } catch (err) {
        Logger.error(err);
    }
};

const createAdmin = async (adminDetails) => {
    try {
        let criteria = {
            email: adminDetails.email.toLowerCase()
        };

        let setQuery = {
            email: adminDetails.email.toLowerCase(),
            name: adminDetails.name,
            password: await UniversalFunctions.bCryptData(process.env.BOOTSTRAP_PASSWORD)
        };

        let options = {
            lean: true,
            upsert: true,
            new: true
        };
        let admin = await Dao.findOne(Models.admin, criteria, {}, {lean: true});
        if (!admin) return await Dao.saveData(Models.admin, setQuery);
        else return admin
    } catch (err) {
        throw err;
    }
};

let bootstrapAppDefault = async () => {
    try {
        let appDefaults = await Dao.findOne(Models.appDefaults, {}, {}, {lean: true});
        let data = fs.readFileSync(Path.resolve('./utils/app-defaults.json'), 'utf8');
        let dataToSave = JSON.parse(data);
        if (!appDefaults) return Dao.saveData(Models.appDefaults, dataToSave);
        // else return Dao.updateOne(Models.AppDefaults,{},dataToUpdate,{lean:true})
    } catch (e) {
        Logger.error(e);
    }
};

let bootstrapAppVersions = async () => {
    try {
        let appDefaults = await Dao.findOne(Models.appVersions, {}, {}, {lean: true});
        let data = fs.readFileSync(Path.resolve('./utils/app-version.json'), 'utf8');
        let dataToSave = JSON.parse(data);
        if (dataToSave.length) {
            for (let key of dataToSave) {
                if (!appDefaults) await Dao.saveData(Models.appVersions, key);
                else await Dao.findAndUpdate(Models.appVersions, {_id: key._id}, key, {lean: true})
            }
        }
        return {}
    } catch (e) {
        Logger.error(e);
    }
};

module.exports = {
    startBootsrap: async () => {
        // starting bootstrap process
        bootstrapAdmin();
        bootstrapAppDefault();
        bootstrapAppVersions()
    },
    connectSocket: SocketManager.connectSocket
};
