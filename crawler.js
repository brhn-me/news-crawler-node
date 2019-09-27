const Crawler = require('crawler');
const url = require('url');
const path = require('path');
const fs = require('fs');
const normalizeUrl = require('normalize-url');
// const dateFormat = require('date-format');
const mongoose = require('mongoose');
const utils = require('./utils');
const db = require('./db');
// const queue = require('./queue');
// const Link = require('./models/link');
const News = require('./models/news');
const logUpdate = require('log-update');


const MAX_DEPTH = 1;
const prothomAloPaser = require('./parsers/prothomalo');
const banglaBdnews24Parser = require('./parsers/bangla.bdnews24');
const seeds = ['https://bangla.bdnews24.com', 'https://www.prothomalo.com'];

const valid_hosts = new Set(['www.prothomalo.com', 'bangla.bdnews24.com']);

const blacklisted_exts = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".css"];

const parsers = {
    "www.prothomalo.com": prothomAloPaser,
    "bangla.bdnews24.com": banglaBdnews24Parser
};


let visited = new Set([]);
let queue = new Set([]);
let newsCount = 0;
let currentUrl;
let currentDepth;


async function is_crawled_news(link) {
    return News.exists({url: link});
}

async function addToQueue(links, depth) {
    var n = 0;
    for (let link of links) {
        let id = utils.md5(link);
        if (!queue.has(link) && !visited.has(link)) {

            var newsExist = await is_crawled_news(link);

            if (!newsExist) {
                queue.add(link);
                crawler.queue({
                    id: id,
                    uri: link,
                    depth: depth,
                    priority: depth
                });
                n++;
            }
        }
    }

    // saveQueue();

    // console.log(`Enqueued: ${n}, Depth: ${depth}, Queue: ${queue.size}, Visited: ${visited.size}, News: ${newsCount}, `);
}

function setVisited(link) {
    if (queue.has(link)) {
        queue.delete(link);
    }
    visited.add(link);
}

function getUniqueLinks(current_link, $) {
    var links = new Set([]);
    try {
        $('a').each(function (i, el) {
            try {
                var href = $(el).attr('href');
                if (href) {
                    var link = new URL(href, current_link.href);
                    if (!valid_hosts.has(link.host)) {
                        return
                    }

                    for (let ext in blacklisted_exts) {
                        if (href.endsWith(ext)) {
                            return;
                        }
                    }


                    links.add(normalizeUrl(link.href, {forceHttps: true, stripHash: true, stripWWW: false}));
                }
            } catch (e) {
                console.log(e);
            }
        });
    } catch (e) {
        console.log(e);
    }
    return Array.from(links);
}

const crawler = new Crawler({
    rateLimit: 100,
    maxConnections: 50,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36",
    callback: function (error, res, done) {

        const currentLink = new URL(this.uri);

        const depth = res.options.depth;
        const id = res.options.id;

        currentUrl = this.uri;
        currentDepth = depth;

        if (error) {
            console.log(error)
        } else {
            if (!res.headers['content-type'].includes("text/html")) {
                return
            }

            const links = getUniqueLinks(currentLink, res.$);
            if (depth < MAX_DEPTH) {
                addToQueue(links, depth + 1);
            }

            if (parsers[currentLink.host]) {
                const parser = parsers[currentLink.host];
                const data = parser(currentLink, res.$);
                if (data) {
                    data.id = utils.md5(currentLink.href);
                    data.url = currentLink.href;
                    data.source = currentLink.host;
                    News.findOneAndUpdate({"id": id}, data, {upsert: true}, function (err, doc) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        setVisited(this.uri);
                        newsCount++;
                    });
                } else {
                    setVisited(this.uri);
                }
            }
        }
        done();
    }
});


// function saveQueue() {
//     var filename = path.join("queue.json");
//     fs.writeFileSync(filename, JSON.stringify(queue, null, 4));
// }
//
// function loadQueue() {
//     let data = fs.readFileSync('queue.json');
//     queue = JSON.parse(data);
// }

function loadVisited() {
    var query = News.find({}).select('url -_id');

    query.exec(function (err, items) {
        if (err) {
            console.log(err);
            return;
        }
        for (let item of items) {
            visited.add(item.url);
        }
        newsCount = visited.size;
    });
}


mongoose.connection.on("open", async function (err) {
    // body of program in here
    // await queue.addToQueue(seeds);
    // items = await queue.getQueued(100);
    // console.log(items);

    // loadVisited();

    for (let seed of seeds) {
        crawler.queue({
            uri: seed,
            depth: 0
        });
    }
});

//
// var NEWS_DATA_DIR = '/home/burhan/DATA/NEWS';
//
//
// function save_news_local(data) {
//     var root_dir = path.join(NEWS_DATA_DIR, data.source);
//     var timestamp = Date.parse(data.date);
//     var date = dateFormat('yyyy-MM-dd', new Date(timestamp));
//
//     var dir = path.join(root_dir, date);
//     if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir, {recursive: true});
//     }
//     var filename = path.join(dir, data.id + ".json");
//     fs.writeFileSync(filename, JSON.stringify(data, null, 4));
// }


const frames = ['-', '\\', '|', '/'];
let i = 0;


setInterval(() => {
    const frame = frames[i = ++i % frames.length];
    const used = process.memoryUsage().heapUsed / 1024 / 1024;

    logUpdate(`

PROCESSING  : ${currentUrl}
DEPTH       : ${currentDepth}
QUEUED      : ${queue.size}
VISITED     : ${visited.size}
SAVED       : ${newsCount}
MEMORY      : ${Math.round(used * 100) / 100} MB
CRAWLING    : ${frame}

`
    );
}, 500);
