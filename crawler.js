var Crawler = require('crawler');
var url = require('url');
var normalizeUrl = require('normalize-url');

var prothomAloPaser = require('./parsers/prothomalo');

var crawler;
var visited = new Set([]);
var queue = new Set([]);

var valid_hosts = new Set(['www.prothomalo.com']);

var parsers = {
    "www.prothomalo.com": prothomAloPaser
};


function addToQueue(links, depth) {
    var n = 0;
    for (let link of links) {
        if (!queue.has(link) || !visited.has(link)) {
            queue.add(link);
            crawler.queue({
                uri: link,
                depth: depth
            });
            n++;
        }
    }
    console.log(`Enqueued: ${n}, Depth: ${depth}`);
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
}

function setVisited(link) {
    if (queue.has(link)) {
        queue.delete(link);
    }
    visited.add(link);
}

function getUniqueLinks(current_link, $) {
    var links = new Set([]);
    $('a').each(function (i, el) {
        var href = $(el).attr('href');
        var link = new URL(href, current_link.href);
        if (!valid_hosts.has(link.host)) {
            return
        }
        links.add(normalizeUrl(link.href, {forceHttps: true, stripHash: true, stripWWW: false}));
    });
    return Array.from(links);
}

function onCrawl(error, res, done) {
    var currentLink = new URL(this.uri);
    var depth = res.options.depth;
    if (error) {
        console.log(error)
    } else {
        var links = getUniqueLinks(currentLink, res.$);
        if (depth < 3) {
            addToQueue(links, depth + 1);
        }

        if (parsers[currentLink.host]) {
            var parser = parsers[currentLink.host];
            var data = parser(currentLink, res.$);
        }
    }
    done();
}

crawler = new Crawler({
    rateLimit: 1000,
    maxConnections: 5,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36",
    callback: onCrawl
});


addToQueue(['https://www.prothomalo.com'], 0);
