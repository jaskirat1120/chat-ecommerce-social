'use strict';

let saveData = (model, data) => {
    return new model(data).save();
};

let getData = (model, query, projection, options) => {
    return model.find(query, projection, options);
};

let findOne = (model, query, projection, options) => {
    return model.findOne(query, projection, options);
};

let findAndUpdate = (model, conditions, update, options) => {
    return model.findOneAndUpdate(conditions, update, options);
};

let findAndUpdateWithPopulate = (model, conditions, update, options, collectionOptions) => {
    return model.findOneAndUpdate(conditions, update, options).populate(collectionOptions).exec();
};

let findAndRemove = (model, conditions, update, options) => {
    return model.findOneAndRemove(conditions, update, options);
};

let update = (model, conditions, update, options) => {
    return model.update(conditions, update, options);
};
let updateMany = (model, conditions, update, options) => {
    return model.updateMany(conditions, update, options);
};
let updateOne = (model, conditions, update, options) => {
    return model.updateOne(conditions, update, options);
};

let remove = (model, condition) => {
    return model.remove(condition);
};

let deleteMany = (model, condition) => {
    return model.deleteMany(condition);
};
/*------------------------------------------------------------------------
 * FIND WITH REFERENCE
 * -----------------------------------------------------------------------*/
let populateData = (model, query, projection, options, collectionOptions) => {
    return model.find(query, projection, options).populate(collectionOptions).exec();
};

let count = (model, condition) => {
    return model.count(condition);
};

let estimatedDocumentCount = (model, options) => {
    return model.estimatedDocumentCount(options);
};

let countDocuments = (model, condition) => {
    return model.countDocuments(condition);
};
/*
 ----------------------------------------
 AGGREGATE DATA
 ----------------------------------------
 */
let aggregateData = (model, aggregateArray, options) => {

    let aggregation = model.aggregate(aggregateArray);

    if (options) {
        aggregation.options = options;
    }

    return aggregation.exec();
};

let insert = (model, data, options) => {
    return model.collection.insert(data, options);
};

let insertMany = (model, data, options) => {
    return model.collection.insertMany(data, options);
};

let aggregateDataWithPopulate = (model, aggregateArray, populateOptions) => {
    return new Promise((resolve, reject) => {
        model.aggregate(aggregateArray, (err, data) => {

            if (err) {
                //logger.error("Aggregate Data", err);
                reject(err);
            }
            model.populate(data, populateOptions,
                function (err, populatedDocs) {

                    if (err) reject(err);
                    resolve(populatedDocs);// This object should now be populated accordingly.
                });

        });
    })
    // return aggregation.exec()
};

let bulkFindAndUpdate = (bulk, query, update, options) => {
    bulk.find(query).upsert().update(update, options);
};

let bulkFindAndUpdateOne = (bulk, query, update, options) => {
    bulk.find(query).upsert().updateOne(update, options);
};


// =============== getting distinct records in array =======

let gettingDistinctValues = (model, field, criteria) => {
    return model.distinct(field, criteria);
};


module.exports = {
    saveData: saveData,
    getData: getData,
    update: update,
    updateMany: updateMany,
    updateOne: updateOne,
    remove: remove,
    deleteMany: deleteMany,
    insert: insert,
    insertMany: insertMany,
    count: count,
    findOne: findOne,
    findAndUpdate: findAndUpdate,
    findAndUpdateWithPopulate: findAndUpdateWithPopulate,
    findAndRemove: findAndRemove,
    populateData: populateData,
    countDocuments: countDocuments,
    estimatedDocumentCount: estimatedDocumentCount,
    aggregateData: aggregateData,
    aggregateDataWithPopulate: aggregateDataWithPopulate,
    bulkFindAndUpdate: bulkFindAndUpdate,
    bulkFindAndUpdateOne: bulkFindAndUpdateOne,
    gettingDistinctValues: gettingDistinctValues
};
