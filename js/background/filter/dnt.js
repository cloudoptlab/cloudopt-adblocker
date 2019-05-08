cloudopt.config.refresh(function () {

    if (chrome.privacy && chrome.privacy.websites.doNotTrackEnabled) {
        chrome.privacy.websites.doNotTrackEnabled.get({}, function (details) {
            var config = cloudopt.config.get();
            if (details.levelOfControl === 'controlled_by_this_extension' && config.safePrivacy) {
                chrome.privacy.websites.doNotTrackEnabled.set({ value: true }, function () {
                    if (chrome.runtime.lastError) cloudopt.debug.debug(chrome.runtime.lastError);
                })
            }
        })
    } else {
        chrome.webRequest.onBeforeSendHeaders.addListener(
            function (details) {
                var config = cloudopt.config.get();
                if (config.safePrivacy) {
                    var dnt = { name: "DNT", value: "1" };
                    details.requestHeaders.push(dnt);
                }
                return { requestHeaders: details.requestHeaders };
            },
            { urls: ["<all_urls>"] },
            ["blocking", "requestHeaders"]);
    }


});
