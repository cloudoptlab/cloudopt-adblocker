chrome.contextMenus.create({
    id: "cloudopt",
    title: "Cloudopt",
    contexts: ["all"],
    onclick: function () {

    }
});

chrome.contextMenus.create({
    title: cloudopt.i18n.get('contextMenus1'),
    parentId: 'cloudopt',
    contexts: ['all'],
    onclick: function (info, tab) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            cloudopt.config.fastAddWhiteList(tab.url)(type => {
                if (type === 'optionTipsDontDuplicate') {
                    cloudopt.notification.info(cloudopt.i18n.get(type))
                } else if (type === 'optionTipsAddWhiteListSuccess') {
                    cloudopt.notification.success(cloudopt.i18n.get(type))
                } else if (type === 'optionTipsInputUrlisNull' || type === 'optionTipsInputUrlisError') {
                    cloudopt.notification.error(cloudopt.i18n.get(type))
                }
            })
        });
    }
});

chrome.contextMenus.create({
    title: cloudopt.i18n.get('contextMenus4'),
    parentId: 'cloudopt',
    contexts: ['all'],
    onclick: function (info, tab) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            cloudopt.config.fastAddBlackList(tab.url)(type => {
                if (type === 'optionTipsDontDuplicate') {
                    cloudopt.notification.info(cloudopt.i18n.get(type))
                } else if (type === 'optionTipsAddBlackListSuccess') {
                    cloudopt.notification.success(cloudopt.i18n.get(type))
                } else if (type === 'optionTipsInputUrlisNull' || type === 'optionTipsInputUrlisError') {
                    cloudopt.notification.error(cloudopt.i18n.get(type))
                }
            })
        });
    }
});

chrome.contextMenus.create({
    title: cloudopt.i18n.get("contextMenus2"),
    parentId: "cloudopt",
    contexts: ["all"],
    onclick: function (info, tab) {
        if (tab.url.startWith("http://") || tab.url.startWith("https://")) {
            cloudopt.tab.open("https://www.cloudopt.net/report/" + cloudopt.utils.getHost(tab.url));
        }
    }
});

chrome.contextMenus.create({
    title: cloudopt.i18n.get("contextMenus3"),
    parentId: "cloudopt",
    contexts: ["all"],
    onclick: function (info, tab) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var currentTab = tabs[0];
            var url = currentTab.url;
            cloudopt.logger.debug('Opening Assistant UI for tab id=' + currentTab.id + ' url=' + url);
            var backgroundPage = chrome.extension.getBackgroundPage();
            var adguardApi = backgroundPage.adguardApi;
            adguardApi.openAssistant(currentTab.id);
        });
    }
});



