var tabsBlockCount = {};

var tabs = {};

chrome.tabs.onCreated.addListener(function (tab) {
    tabs[tab.id] = tab;
    tabsBlockCount[tab.id] = 0;
    cloudopt.config.refresh();
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    tabs[tabId] = tab;
    if (changeInfo.status == "loading") {
        tabsBlockCount[tabId] = 0;
    } else {
        cloudopt.config.refresh(function () {
            if (cloudopt.config.get().adblockActivating && cloudopt.config.get().adblockDisplay) {
                try {
                    chrome.browserAction.setBadgeText({
                        text: tabsBlockCount[tabId].toString()
                    });
                } catch (e) {
                    chrome.browserAction.setBadgeText({
                        text: "0"
                    });
                }


            }
        });
    }
    cloudopt.config.refresh();
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    delete tabs[tabId];
    delete tabsBlockCount[tabId];
    cloudopt.config.refresh();
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
    cloudopt.config.refresh(function () {
        if (cloudopt.config.get().adblockActivating && cloudopt.config.get().adblockDisplay && tabsBlockCount[activeInfo.tabId] > 0) {
            try {
                chrome.browserAction.setBadgeText({
                    text: tabsBlockCount[activeInfo.tabId].toString()
                });
            } catch (err) {
                chrome.browserAction.setBadgeText({
                    text: ""
                });
            }
        } else {
            chrome.browserAction.setBadgeText({
                text: ""
            });
        }
    });
    cloudopt.store.get("statistics-day-stamp", function (stamp) {
        let now = Date.now()
        let today = now - (now % 86400000);
        if (!stamp || stamp < today) {
            cloudopt.statistics.getCount("adblock-today", function (count) {
                cloudopt.statistics.countEvent("adblock-today", -count)
            })
            cloudopt.statistics.getCount("site-block-today", function (count) {
                cloudopt.statistics.countEvent("site-block-today", -count)
            })
            cloudopt.store.set("statistics-day-stamp", today);
            return;
        }
    })
});

cloudopt.config.refresh(function(){

    cloudopt.init.start();

    cloudopt.adblock.start();

    cloudopt.statistics.start();

    cloudopt.message.init();

});
