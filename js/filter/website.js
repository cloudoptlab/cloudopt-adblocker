cloudopt.message.send("grade-website", window.location.href, function (result) {
    var config = cloudopt.config.get();
    if (result.safe === false && config.safeCloud == true) {
        cloudopt.message.send("countEvent", "site-block");
        cloudopt.message.send("countEvent", "site-block-today");
        window.location.href = "https://www.cloudopt.net/block/" + encodeURIComponent(cloudopt.utils.getHost(window.location.href));
    }
});
