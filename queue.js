var normalizeUrl = require('normalize-url');
var utils = require('./utils');
const Link = require('./models/link');


const addToQueue = async (urls, depth = 0, priority = 5) => {
    const uniqueUrls = new Set([]);
    for (let url of urls) {
        const normalizedUrl = normalizeUrl(url, {forceHttps: true, stripHash: true, stripWWW: false});
        uniqueUrls.add(normalizedUrl);
    }

    const docs = [];
    for (let uniqueUrl of Array.from(uniqueUrls)) {
        const uri = new URL(uniqueUrl);
        const doc = {
            "url": uri.href,
            "host": uri.host,
            "depth": depth,
            "status": 'Q',
            "attempt": 0,
            "priority": priority,
            "hash": utils.md5(uri.href)
        };
        docs.push(doc);
    }
    // console.log(docs);
    var r = await utils.upsertMany(Link.collection, docs, ["url"]);
};


const getQueued = async (n = 1000) => {
    return new Promise((resolve, reject) => {
        Link.find({status: 'Q'}).limit(n).exec(function (error, links) {
            if (error) {
                return reject(error);
            }
            resolve(links);
        });
    });
};


module.exports = {
    addToQueue: addToQueue,
    getQueued: getQueued
};
