var sanitizeHtml = require("sanitize-html");

const prothomAloPaser = (link, $) => {
    var data = false;
    if (link.pathname.includes("article")) {
        var title = $('.detail h1.title').text().trim();
        var dateEl = $('.detail .time span')[0];
        var date = $(dateEl).attr('content');
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

        data = {
            date: date,
            title: title,
            content: content,
            tags: tags,
            images: images
        };
    }
    return data;
};

module.exports = prothomAloPaser;
