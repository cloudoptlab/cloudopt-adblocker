var href = $(".block-page a>.block-pre").parent().attr("href");
$(".block-page a>.block-pre").parent().attr("href", "#");
$(".block-page a>.block-pre").parent().click(function () {
    cloudopt.config.refresh(function () {
        var config = cloudopt.config.get();
        var hrefHost = cloudopt.utils.getHost(href);
        if (config.whiteList.indexOf(hrefHost) < 0) {
            config.whiteList[config.whiteList.length] = hrefHost;
            config.blackList.removeByValue(hrefHost)
            cloudopt.config.set(config, function () {
                cloudopt.config.refresh(function () {
                    location.href = href;
                });
            });
        } else {
            location.href = href;
        }
    });

});

var url = $(".block-button").parent().attr("href");
$(".block-button").parent().attr("href", "#");
$(".block-button").parent().attr("target", "");
$(".block-button").parent().click(function () {
    cloudopt.message.send("open-tab", url);
});
