cloudopt.config.refresh(function() {
    var config = cloudopt.config.get();
    var timer;
    if (config.webPrereading) {
        cloudopt.logger.info("Starting web-prerender.");
        $("a").each(function(index, el) {
            var href = DOMPurify.sanitize($(this).attr("href"));
            if (href == "" || href == undefined) {
                return;
            }
            if (href.startWith("https://") >= 0 || href.startWith("http://") >= 0) {
                var host = cloudopt.utils.getHost(href);
                if (host == "" || host == "javascript" || host == " ") {
                    return;
                }
                $(this).hover(function() {
                    timer = setTimeout(function() {
                        var linkTag = $("<link rel=\"prerender\" href=\"" + href + "\" />");
                        $($('head')[0]).append(linkTag);
                        cloudopt.message.send("countEvent", "prerender");
                    }, 2000);
                }, function() {
                    window.clearTimeout(timer);
                });
            }

        });
    }
});
