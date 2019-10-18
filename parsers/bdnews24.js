var sanitizeHtml = require("sanitize-html");

const Bdnews24Parser = (link, $) => {
    var data = false;
    var title = $('#main .article h1').text().trim();
    var date = $('#main .dateline span').last().text().replace(" BdST", "").trim();

    let leadHtml = $('#main .article_lead_text').html();
    let contentHtml = $('#main .article_body').html();
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

    content = content.trim();

    if (!content || !title) {
        return false
    }

    data = {
        date: date,
        title: title,
        content: content,
        tags: tags,
        images: images
    };
    return data;
};

module.exports = Bdnews24Parser;
