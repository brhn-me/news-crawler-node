const crypto = require('crypto');

const upsertMany = (collection, docs, filter_fields) => {
    return new Promise((resolve, reject) => {
        var bulkUpdateOps = docs.map(function (doc) {
            const filter = {};
            for (let filter_field of filter_fields) {
                filter[filter_field] = doc[filter_field];
            }
            return {
                "updateOne": {
                    "filter": filter,
                    "update": {"$set": doc},
                    "upsert": true
                }
            };
        });

        collection.bulkWrite(bulkUpdateOps, function (error, result) {
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
    });
};

const md5 = (str) => {
    return crypto.createHash('md5').update(str).digest("hex")
};


module.exports = {
    upsertMany: upsertMany,
    md5: md5
};
