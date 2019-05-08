if (chrome.downloads != undefined) {
    chrome.downloads.onCreated.addListener(function(downloadItem) {
        var url = downloadItem.url;
        if (downloadItem.finalUrl != null && downloadItem.finalUrl != "") {
            url = downloadItem.finalUrl;
        }
        cloudopt.config.refresh(function() {
            cloudopt.grade.website(url, function(result) {
                var config = cloudopt.config.get();
                if (result.safe < 0 && config.safeDownload) {
                    cloudopt.notification.error(cloudopt.i18n.get("dangDownTitle"));
                    chrome.downloads.cancel(downloadItem.id, function (url) { });
                };
            });
        });
    });

}
