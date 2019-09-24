var sanitizeHtml = require("sanitize-html");
const crypto = require('crypto');

const prothomAloPaser = (link, $) => {
    console.log(link.href);
    if (link.pathname.includes("article")) {
        var title = $('.detail h1.title').text().trim();
        var dateEl = $('.detail .time span')[0];
        var date =  $(dateEl).attr('content');
        var contentHtml = $('article.content').html();
        contentHtml = sanitizeHtml(contentHtml);
        var content = $(contentHtml).text().trim();
        var catsEl = $('.breadcrumb li a');

        var tags = [];
        $(catsEl).each(function (i, el) {
            tags.push($(el).text());
        });
        tags.shift();

        var tagsEl = $('.topic_list a');
        $(tagsEl).each(function (i, el) {
            tags.push($(el).text());
        });

        tags = Array.from(new Set(tags));

        var imgs = $('article img');
        var images = [];
        $(imgs).each(function (i, el) {
            images.push($(el).attr('src'));
        });

        var id = crypto.createHash('md5').update(link.href).digest("hex")


        var data = {
            id: id,
            url: link.href,
            source: link.host,
            date: date,
            title: title,
            content: content,
            tags: tags,
            images: images
        };
        console.log(data);
    }
};

module.exports = prothomAloPaser;
