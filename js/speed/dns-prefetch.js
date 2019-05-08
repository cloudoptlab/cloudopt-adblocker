cloudopt.config.refresh(function() {
    var config = cloudopt.config.get();
    if (config.dnsSpeed) {
        cloudopt.logger.info("Starting dns-prefetch.");
    }
    var hosts = new Array();
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
            if ($.inArray(host, hosts) < 0) {
                hosts.push(host);
            }
        }
    });
    for (var i = 0; i < hosts.length; i++) {
        var linkTag = $("<link rel=\"dns-prefetch\" href=\"//" + hosts[i] + "\">");
        $($('head')[0]).append(linkTag);
    }
});
