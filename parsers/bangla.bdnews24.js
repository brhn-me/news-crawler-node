var sanitizeHtml = require("sanitize-html");

const banglaBdnews24Parser = (link, $) => {
    var data = false;
    if (link.pathname.endsWith(".bdnews")) {
        var title = $('#main .article h1').text().trim();
        var date = $('#main .dateline span').last().text().replace(" BdST", "");

        var leadHtml = $('#main .article_lead_text').html();
        var contentHtml = $('#main .article_body').html();
        leadHtml = sanitizeHtml(leadHtml);
        contentHtml = sanitizeHtml(contentHtml);
        var content = $(leadHtml).text().trim() + "\r\n\r\n" + $(contentHtml).text().trim();

        var tag = $('#main #breadcrumb_articlepage .navigation a').last().text().trim();
        var tags = [tag];

        var imgs = $('#main .article_body img');
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
        // console.log(data)
    }
    return data;
};

module.exports = banglaBdnews24Parser;
